---
name: update-notes
description: Regenerate src/lib/notes-data.ts (the /notes section of the site) from the CherryTree pentesting notebook (PenTesting notes.ctb). Use when the user asks to "update my notes", "sync notes from CherryTree", or similar.
---

# Update notes from the CherryTree notebook

The `/notes` section of the site (`src/lib/notes-data.ts`) is a recursive
`NoteNode` tree converted from a CherryTree notebook — a SQLite database
(`node`/`children`/`grid`/`image` tables). This skill regenerates that file
from the current state of the notebook.

## When to invoke

Any "update my notes" / "sync my notes with the notebook" request. The
notebook always lives at the repo root — `PenTesting notes.ctb` (gitignored,
see `.gitignore`). This is a fixed location, not a path that moves around —
use it directly without asking or checking elsewhere, unless the user
explicitly gives a different path in the conversation.

## What this does

0. **Check the target checkout's git status first**, in whatever repo copy
   you'll actually run the converter against. If it has uncommitted changes
   to `src/lib/notes-data.ts` and/or `.gitignore`, don't just overwrite them —
   `git stash push -u -m "<unique tag>"` first (see the repo's stash-safety
   rule if one exists), regenerate, then diff the stash against the
   regenerated file before deciding whether anything in it is worth keeping.
   In practice these stray edits have turned out to be stale/partial drafts
   of the same sync (not new content), but verify per-case rather than
   assuming — it's the user's notes content, don't discard on your own
   judgment call. Also verify `.gitignore`'s pattern for the notebook
   actually matches its real filename (`git check-ignore -v "<filename>"` —
   should print a match); a filename drift here (e.g. a stray space) silently
   stops the personal notebook from being ignored.
1. **Isolate first** (`EnterWorktree`) if not already isolated — this
   modifies a tracked source file (`src/lib/notes-data.ts`) and asset files
   under `public/notes/`. Pass an explicit `name` of the form
   `notes-update-<n>` — always the prefix `notes-update-` followed by a
   number/iteration (`notes-update-1`, then `notes-update-2`, `-3`, ...
   incrementing when a worktree with the current number already exists).
   Never use a bare `notes-update` without a number, and never let it
   default to a random generated name. This isolation is permanent, not a
   staging step to fast-forward out of later: notes syncs are content
   updates, and per standing instruction content/feature work always ends
   up on its own branch rather than landing on `main` (see step 4).
2. Run the converter:
   ```
   python .claude/skills/update-notes/convert_notes.py "<path-to-ctb>" "<repo-root-or-worktree-root>"
   ```
   This writes `src/lib/notes-data.ts` and any embedded-image files under
   `public/notes/<slug>/imgN.png` directly into the given repo root. Run it
   with `PYTHONIOENCODING=utf-8` set (some note content has non-ASCII
   bullet/checkbox characters that break Windows console default encoding
   otherwise).
3. **Verify before committing:**
   - `git diff --stat src/lib/notes-data.ts` — skim the diff. Expect it to
     be almost entirely genuine content edits (new sections, wording
     changes) plus possibly some cosmetic heading-line differences in nodes
     that weren't touched (see "Known limitations" below) — not wholesale
     reformatting of untouched nodes.
   - Confirm the trailing `FoundNote` type, `findNote`/`allNoteParams`
     functions, and the `NoteSearchEntry` type + `noteSearchEntries` function
     (backing the `/notes` command palette's search index) are all still
     present at the end of the file (the converter only regenerates the
     `noteTree` tree + its header comment; it appends this trailing block
     verbatim from `notes_trailing_block.txt`, but always re-verify since
     `src/app/notes/[...slug]/page.tsx` imports `findNote`/`allNoteParams` and
     `src/components/CommandPalette.tsx` imports `noteSearchEntries` — the
     build will fail without any of them).
   - `npm run build` — must succeed and generate all `/notes/[...slug]`
     routes. This is the real correctness gate.
4. Commit locally on the worktree branch (per standing instruction: never
   push, no `Co-Authored-By` trailer). Don't touch the `.ctb` file itself —
   it's gitignored and not part of the commit. **Leave the commit on the
   `notes-update-<n>` branch — do not merge or fast-forward it into
   `main`.** This is a deliberate policy for content updates (notes syncs)
   and cosmetic/functional feature work generally: they get their own
   branch for the user to review and merge deliberately, unlike routine
   CLAUDE.md/skill-file edits which do go straight to `main`. When exiting
   the worktree, use `ExitWorktree` with `action: "keep"` so the branch and
   its commit survive — never `"remove"`, which would discard the work.

## How the converter works (mapping rules)

CherryTree stores each node's rich text as XML: `<node>` containing
`<rich_text attr="...">text</rich_text>` runs. `convert_notes.py`:

- **Tree**: walks `children(node_id, father_id, sequence)` from `father_id
  = 0`, in `sequence` order. A node's `slug` is `slugify(title)` (lowercase,
  non-alphanumeric runs collapsed to a single `-`). Only nodes whose
  converted body is non-empty get a `body` field (pure-category nodes stay
  sidebar-only, matching `NoteNode.body?`).
- **Run formatting → markdown**, applied in this nesting order (innermost
  first): `link` → `[text](url)` (`link="webs <url>"` for external,
  `link="node <id>"` resolved via each node's precomputed root-to-node slug
  path for internal links) → `family="monospace"` → `` `text` `` →
  `style="italic"` → `*text*` → `weight="heavy"` → `**text**` →
  `foreground="#4cdd40"` (the author's "this is a command" convention) →
  `<span class="cmd">text</span>` (outermost). All other foreground colors
  and `justification` are dropped (decorative/inconsistent).
- **Headings**: `scale` (`h1`-`h4`) opens a heading block. Any run carrying
  a `scale` attribute *always* force-closes whatever heading is currently
  open (even mid-line, even same level) and opens a new one — this is what
  lets two adjacent `scale`-carrying runs with no newline between them
  become two separate heading blocks (observed in real notebook content,
  e.g. a "Comment:" label immediately followed by a highlighted `--`
  token). A literal `\n` also always closes an open heading. Runs *without*
  `scale` that occur while a heading is open are folded into that heading's
  text (this is how inline flags glued onto a heading title, e.g. "### Get
  the md5 hash - for verification", end up on the same heading line even
  though only the leading run carries `scale`).
- **Tables**: `grid(node_id, offset, txt)` holds `<table><row><cell>...`
  XML. CherryTree stores the **header row last**, not first — move it to
  the top, add a `| --- |` separator, join rows with `"  \n"` (hard break)
  except after the last row (block boundary handles that spacing).
- **Images**: `image(node_id, offset, png, ...)` blobs are written to
  `public/notes/<slug>/imgN.png` (1-indexed per node) and referenced as
  `![Screenshot N in {title} notes](/notes/{slug}/imgN.png)`.
- **Offset splicing**: both tables and images are spliced into the body at
  a CherryTree buffer offset that counts raw run-text characters *plus one
  per widget already inserted before that point* (each embedded table/image
  occupies exactly one character slot in CherryTree's own buffer). The
  converter tracks `raw_pos` and `widget_count` together and checks for a
  pending widget after every run/newline boundary — in all notebook content
  seen so far, widget offsets always land exactly on a run or newline
  boundary, never mid-run.
- **Newlines**: single `\n` → markdown hard break (trailing two spaces);
  2+ consecutive `\n` → a clean paragraph break (`\n\n`). Table content
  is protected from this pass via a placeholder substitution (it already
  contains its own correctly-formatted internal hard breaks) so the global
  newline pass doesn't double up spacing inside it.
- **Literal `~` (tilde)**: escaped to `\~` in every run and every table
  cell, *except* inside runs wrapped in backticks (`family="monospace"`).
  remark-gfm treats even a lone `~` as strikethrough syntax (its
  `singleTilde` option defaults on), so an unescaped tilde — most commonly
  a home-directory shorthand in a command like `cd ~/tools` — would
  silently turn the rest of the line into struck-through text. A real code
  span (backtick-wrapped) is already literal as far as markdown parsing
  goes, so escaping inside one would just inject a visible backslash into
  copyable command text — that's why monospace runs are exempted. Because
  the body is written into a TS template literal, and `escape_template`
  doubles every backslash when it writes that literal, the single `\`
  this step inserts becomes **two** backslashes (`\~`) in the actual
  `notes-data.ts` source — that's expected, not a bug: it collapses back
  to one backslash at runtime, which is the correct single-escape a
  markdown parser expects. If you're ever hand-editing a tilde into
  `notes-data.ts` directly (bypassing the converter), apply this same
  doubling yourself outside of code spans.
- **Header comment + trailing block**: the top-of-file comment (mapping
  rules for future readers) and the bottom-of-file `FoundNode`/`findNote`/
  `allNoteParams`/`NoteSearchEntry`/`noteSearchEntries` exports are not
  derived from the notebook — the script
  reads them from `notes_header_comment.txt` / `notes_trailing_block.txt`
  next to itself and splices them in verbatim. If `notes-data.ts`'s header
  comment or trailing helpers are ever intentionally edited, update those
  two `.txt` files to match, or the next regeneration will silently revert
  them.

## Sidebar & "In this section" accent colors (structural, not converter output)

`NotesSidebar.tsx` and `src/app/notes/[...slug]/page.tsx` color-code the tree
purely from its *shape* — no field the converter writes controls this, so
regenerating `notes-data.ts` never needs a matching color edit:

- Top-level section label (`noteTree`'s own entries, e.g. "Pentest Notes",
  "Fundamentals") — `text-ink`, rendered as a plain `<p>`, not a link.
- A node that is a direct child of a section and itself has children — the
  tree's 2nd level (e.g. "Enumeration", "Exploitation", "Services") —
  `text-clay`.
- A node one level deeper that still has children — the tree's 3rd level
  (e.g. "Tools" under "Enumeration", "Web Exploitation" under
  "Exploitation", "Password Cracking") — `text-clay-deep` (a muted, darker
  shade of the same clay family — deliberately not pine, which the site
  reserves for active/hover/interactive state).
- Everything else — leaves at any depth, *and* grouping nodes with children
  at the 4th level or deeper (e.g. "SQL Injection", which has a "SQLMap"
  child but sits one level past the colored tiers) — plain `text-stone`.
  Only the 2nd and 3rd tiers get the orange accent; it's deliberately not
  extended further down even when a deeper node also groups children.
- The current page's own link — bold `text-pine` with a `border-pine` left
  rail, overriding whichever of the above it would otherwise get.

This is computed in `NoteTreeItem` from `hasChildren` + recursion `depth`
(depth `0` = clay, depth `1` = clay-deep, depth `2+` = stone regardless of
`hasChildren`), not hardcoded per node title — adding, removing, or
re-nesting nodes via the converter reshapes the colors automatically.

The "In this section" block on `notes/[...slug]/page.tsx` (rendered only
when the current node has routable children) uses `text-clay` for its
heading and is positioned above the node's own body content, not below it —
don't move it back below when touching that page.

## Known limitations

- **Not guaranteed byte-identical on untouched nodes.** The committed
  `notes-data.ts` has, at various points, been hand-touched (no conversion
  script was ever checked in before this skill existed), so its historical
  formatting isn't perfectly consistent with any single mechanical rule —
  e.g. some older nodes have a heading-plus-inline-flag split onto two
  lines with a hard break, where this converter's rule (heading absorbs
  trailing non-scale runs until the next real newline) merges them onto one
  heading line instead. Both render as valid, readable markdown; this is a
  cosmetic difference, not a content loss. If a `git diff` shows a node
  changing formatting only (no wording difference), that's expected and
  safe to leave as-is — don't hand-revert it.
- Cell text inside tables is flattened to plain text (no bold/link/etc.
  inside cells) — matches every table seen in the notebook so far.

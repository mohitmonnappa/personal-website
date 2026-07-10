# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Mohit Monnappa's personal site: projects, CTF/security writeups, and
pentesting methodology notes. Replaces an old Hugo + PaperMod blog (the
original markdown content is preserved under `content/` and reused as the
data source for several sections).

Licensing is deliberately split (see `LICENSE.md`): everything defaults to
all-rights-reserved, with one carve-out — the `/notes` content
(`src/lib/notes-data.ts`) is CC BY 4.0 so others can reuse the pentesting
notes with attribution. The notes are the *only* thing licensed for reuse;
don't extend the carve-out to writeups or code, and don't add a permissive
code license (MIT etc.) — the owner explicitly wants the rest reserved.

Design direction is deliberate and has been explicitly redirected once
already: **light, warm, editorial** (paper/pine/clay palette, Space Grotesk +
Source Serif 4) — not a dark "hacker terminal" aesthetic, even though the
subject matter is security/CTF. Don't reach for terminal chrome, neon-on-black,
matrix/glitch effects, or monospace display type when extending the UI.

## Commands

```bash
npm run dev     # dev server (Turbopack), http://localhost:3000
npm run build   # production build - also the fastest way to type-check
                # and validate all generateStaticParams / dynamic routes
npm run lint    # eslint (flat config in eslint.config.mjs)
```

There is no test suite. Treat `npm run build` as the correctness gate before
calling a change done — it runs the TypeScript check and statically
generates every route (including all Bandit levels, machine writeups, and
notes pages), which catches broken `generateStaticParams`/content lookups
that `next dev` won't surface immediately.

When verifying UI changes visually, Playwright is not a project dependency —
install it ad hoc with `npm install --no-save playwright` (chromium via
`npx playwright install chromium`) rather than adding it to `package.json`.

## Git workflow

Any change to content that ends up rendered on the live site — `content/*.md`,
`src/lib/notes-data.ts` (including notes synced via the `update-notes`
skill), `machines-data.ts`, project copy, etc. — and any cosmetic/functional
feature work, goes on its own branch (`EnterWorktree`, named after the
change, e.g. `notes-update-1`). Commit there and leave it on that branch for
review; don't merge or fast-forward it into `main` yourself. The one
exception is routine edits to this file or to files under `.claude/skills/`,
which go straight to `main` per the global rule in `~/.claude/CLAUDE.md`.

## Content architecture

There are two different content sources feeding the site, and it matters
which one a given section uses:

1. **Real markdown content** in `content/` (carried over from the old Hugo
   site), read at build time via `gray-matter` in `src/lib/content.ts`:
   - `content/about.md` — bio (certifications are hand-transcribed into
     `src/lib/about-data.ts` rather than parsed, so they can be rendered as
     structured pill/list UI instead of raw markdown)
   - `content/projects/*.md` — one file per project, frontmatter drives
     `ProjectCard` (title, subtitle, tech, category, summary)
   - `content/posts/overthewire/bandit/bandit##.md` — the Bandit wargame
     walkthroughs, numbered sequentially; `getBanditLevels()` /
     `getBanditLevel()` parse the level number from the filename

2. **TypeScript data modules** for two sections, one now fully real, one
   still partly placeholder:
   - `src/lib/machines-data.ts` — HTB/TryHackMe machine writeups, keyed by
     `platform: "HackTheBox" | "TryHackMe"` and rendered through the shared
     `MachinesList`/`MachineDetail`/`MachineCard` components. `"gaming-server"`
     and `"basic-pentesting"` are real, condensed TryHackMe writeups; `"ledger"`
     (HackTheBox) is still a fictional placeholder — don't assume every entry
     in this file reflects a real engagement. Raw source notes for a real
     writeup aren't necessarily inside this repo: `"gaming-server"` came from
     the gitignored `Gaming Server/` folder at the project root, while
     `"basic-pentesting"` was read directly from an Obsidian vault path
     outside the repo entirely (`C:\Users\...\Obsidian Vaults\...`) — both are
     enum/exploit markdown with an `attachments/` subfolder of Obsidian-style
     `Pasted image ....png` screenshots. Either way, proof screenshots get
     copied into `public/writeups/<slug>/` with descriptive filenames (not
     the original `Pasted image ....png` names) and referenced from the phase
     bodies as plain markdown images. `"gaming-server"` specifically has no
     `Loot` phase and never prints the user/root flag values anywhere in the
     page text or screenshots — don't reintroduce either when editing it;
     that redaction call is per-writeup, not a blanket rule (`"basic-pentesting"`
     does print its final cracked password, per instruction when it was
     added). `machinesByPlatform()` / `platformSlug()` / `PLATFORM_ROUTES` map
     a `Machine` to its `/writeups/hackthebox` or `/writeups/tryhackme` URL
     segment — add a platform by extending `PLATFORM_ROUTES`, not by
     hardcoding a new route.
   - `src/lib/notes-data.ts` — pentesting methodology reference, and now the
     **real** content: converted from the gitignored CherryTree notebook
     `PenTesting notes.ctb` (a SQLite database — `node`/`children` tables
     for the tree, `grid`/`image` tables for embedded tables/screenshots
     spliced back in by character offset, rich-text run attributes mapped to
     markdown). To regenerate this file after the notebook changes, use the
     `update-notes` skill (`.claude/skills/update-notes/SKILL.md` +
     `convert_notes.py`) rather than re-deriving the conversion — it encodes
     the offset-splicing rules, the CherryTree `#4cdd40` "this is a command"
     convention, and where the notebook is likely to be found (repo root or
     `~/Downloads`, since the user moves it around manually). See the
     comment at the top of `notes-data.ts` for what the conversion
     deliberately dropped (colors, justification) or normalized (single
     newlines → markdown hard breaks so the original line-by-line layout
     still renders, since remark's default softbreak collapses to a space).
     Regenerated output isn't guaranteed byte-identical on nodes the
     notebook edit didn't touch — some older formatting was hand-tweaked
     before this skill existed — so a diff that's pure reformatting (no
     wording change) on an untouched node is expected, not a bug.
     **`NoteNode` is a genuine
     recursive tree, not a fixed two-level shape** — CherryTree nodes nest
     arbitrarily deep, and a node can carry both its own `body` *and*
     `children` (e.g. "Windows File Transfer"). Only nodes with a non-empty
     `body` are routable (`findNote`/`allNoteParams` filter on this); a node
     with children but no body of its own (a pure category, e.g.
     "Exploitation") is sidebar-only — don't assume every tree node
     has a page. `NotesSidebar.tsx` walks the recursive tree (rendering a
     plain label for no-body nodes, a link for nodes with a body), and
     colors nodes by structural tier, not content: `text-ink` for the
     top-level section label, `text-clay` for 2nd-level groups that have
     children (e.g. "Enumeration"), `text-clay-deep` for 3rd-level nested
     groups (e.g. "Tools" under "Enumeration"), and `text-stone` for
     everything else — leaves at any depth, and any grouping node nested
     past the 3rd level (e.g. "SQL Injection", which has a "SQLMap" child
     but sits one level too deep for the accent). The active page is always
     bold `text-pine` with a `border-pine` rail, overriding the tier color —
     `pine` is reserved for interactive/active state, so don't reach for it
     as a third tier color if this scheme ever needs to grow (fuller
     rationale in `.claude/skills/update-notes/SKILL.md`). Each note page's
     own "In this section" child-list block (`notes/[...slug]/page.tsx`)
     uses the same `text-clay` heading and renders above the node's body
     content, not below it.
     `notes/page.tsx` used to render a second tree-walking outline, but is
     now a static intro page (personal intro + a "Caution" disclaimer
     callout, per explicit request — modeled on BRM's Field Manual landing
     page but restyled to this site's clay/paper palette); the sidebar is
     the only navigation over the tree. Don't reintroduce a table of
     contents there.

   The `Gaming Server/` and `PenTesting notes.ctb` raw sources are
   intentionally excluded from git via `.gitignore` — they're personal raw
   notes, not site content. `machines-data.ts`'s `"ledger"` entry is the
   only remaining placeholder in either file; if you convert it later,
   reshape/extend `Machine`/`MachinePhase` rather than introducing a third
   content source.

### Markdown rendering: unified/remark/rehype, not MDX

`src/components/Prose.tsx` renders all markdown bodies (project descriptions,
Bandit levels, machine phases, notes) through a plain `unified` pipeline
(`remark-parse` → `remark-gfm` → `remark-rehype` with `allowDangerousHtml` →
`rehype-raw` → `rehype-pretty-code` for shiki syntax highlighting →
`rehype-stringify`), then injects the result via `dangerouslySetInnerHTML`.

This was a deliberate switch away from `next-mdx-remote`/MDX: the real
Bandit content contains raw unclosed HTML (e.g. bare `<br>` from the old
Hugo content), which MDX's JSX-based parser rejects outright. The
remark/rehype-only pipeline uses a real HTML parser and tolerates this. All
rendered content is author-controlled (repo content, not user input), so
`dangerouslySetInnerHTML` is safe here — don't add sanitization for it, and
don't reintroduce MDX for these content types without re-solving the raw-HTML
problem.

Code blocks are highlighted with the `vitesse-dark` shiki theme and forced
onto a dark `pre` background (`prose-article` styles in `globals.css`) even
though the page itself is light — this is an intentional contrast choice,
not a leftover from an earlier dark-theme direction.

A custom rehype plugin, `src/lib/rehype-command-copy.ts`, runs after
`rehype-pretty-code` in the same pipeline and mutates the highlighted hast
tree to inject copy buttons. For shell blocks, only lines matching `^\$\s`
get a button (consuming `\`-continued lines into one joined command), so
output printed below a command is never copyable. Code blocks with no such
lines (php, html, text, ...) get one whole-block button instead, appended
to the `pre`. Per-line buttons rely on `code { display: grid }` stretching
every line's `span[data-line]` to the block's full width: the button's
line is made a flex row (`.code-line` in `globals.css`) with `margin-left:
auto` on the button so it sits on the block's right border regardless of
that line's own text length, plus `position: sticky; right` so it stays
reachable without scrolling when a command is long enough to overflow the
block. Since `Prose` output is inert `dangerouslySetInnerHTML`, the
button's click behavior is wired up separately via event delegation in
`src/components/CodeCopyHandler.tsx` (mounted once in `layout.tsx`, listens
for `.code-copy-btn` clicks on `document`) rather than component state — if
you touch either half, keep the `data-copy` attribute contract between them
in sync.

## Route structure

Routes mirror the content model above; `[slug]`/`[level]`/`[...slug]`
dynamic routes all use `generateStaticParams` for full static generation:

- `/` — home
- `/about`
- `/projects`, `/projects/[slug]`
- `/writeups` — hub linking to the writeup collections below
- `/writeups/bandit`, `/writeups/bandit/[level]` — sequential, has prev/next
- `/writeups/hackthebox`, `/writeups/hackthebox/[slug]` and
  `/writeups/tryhackme`, `/writeups/tryhackme/[slug]` — kept as separate
  routes/pages per platform (not a combined `/writeups/machines`) even
  though both read from the same `machines` array in `machines-data.ts` and
  share `MachinesList`/`MachineDetail`
- `/notes`, `/notes/[...slug]` — catch-all under a shared
  `src/app/notes/layout.tsx` that renders the persistent `NotesSidebar`;
  the tree comes from `noteTree` in `notes-data.ts` and can be arbitrarily
  deep (see above), so adding a note = adding a node there, not creating
  new route files. A URL segment count doesn't map to a fixed "section" vs
  "note" level the way it used to — `findNote` walks the tree per segment
  and only resolves if the matched node has a `body`

## Notes search (command palette)

`CommandPalette.tsx` is a Cmd/Ctrl+K search box scoped to `/notes` only
(mounted once in `notes/layout.tsx`, right-aligned above the content
column) — it's client-side search over the notes tree, not a site-wide
command palette with actions. `noteSearchEntries()` in `notes-data.ts`
walks the same body-gated `noteTree` used by `findNote`/`allNoteParams` and
flattens each routable note into a flat `{title, url, breadcrumb, text}`
entry, reducing the markdown body to plain search text (unwrapping rather
than stripping the `<span class="cmd">` command spans, since those are the
highest-value search tokens, and dropping markdown syntax that would
pollute matches). Because this index is derived from `noteTree`,
regenerating `notes-data.ts` via the `update-notes` skill keeps search
current automatically — no separate index to maintain. Matching is a plain
client-side substring search; title matches rank above body matches
(which render a highlighted snippet), capped at 9 results.

## Design system

Tokens live as CSS custom properties in `src/app/globals.css` (`:root` +
Tailwind v4 `@theme inline` block) — colors (`paper`, `paper-raised`, `ink`,
`pine`, `pine-deep`, `pine-tint`, `clay`, `clay-deep`, `clay-tint`, `stone`,
`line`) and
font variables (`--font-display` = Space Grotesk, `--font-body` = Source
Serif 4, `--font-mono` = IBM Plex Mono, all loaded via `next/font/google` in
`layout.tsx`). Use the Tailwind utilities these generate (`bg-paper`,
`text-pine`, `font-display`, etc.) rather than hardcoding hex values.

Motion goes through Framer Motion wrapped in a global `MotionConfig
reducedMotion="user"` (`src/components/MotionProvider.tsx`) so
`prefers-reduced-motion` is handled automatically — don't add manual
`useReducedMotion` checks in individual components, the provider already
covers it.

`lucide-react` (pinned to `1.23.0`) no longer ships brand/logo icons
(`Github`, `Linkedin`, etc. don't exist in this version) — GitHub, LinkedIn,
TryHackMe (`TryHackMeGlyph`), and HackTheBox (`HackTheBoxGlyph`) glyphs are
hand-rolled inline SVGs in `src/components/icons.tsx`, using the platforms'
real brand marks. Check `node_modules/lucide-react/dist/esm/lucide-react.mjs`
for actual export names before assuming an icon exists.

The `TraceDivider` component (a thin animated SVG line between homepage
sections) is the site's one deliberate "signature" decorative motif — it's
used sparingly on purpose; don't scatter it across every section boundary.
Its stroke is `var(--color-clay)` (matching the project-card subtitle
color), and the draw-in/erase cycle loops on a 4s interval for as long as
the home page is mounted rather than playing once on scroll-into-view.

If asked to integrate a pasted UI snippet or component demo (21st.dev-style
prompts, shadcn `/ui` components, etc.), check `COMPONENT-PROMPTS.md` (gitignored
working notes) first — several dark-theme/shadcn/GSAP-based demos were already
evaluated there and rejected in favor of custom rebuilds using this site's
own tokens and Framer Motion (see `Nav.tsx`, `TraceDivider.tsx`). Don't
re-introduce `next-themes`, shadcn design tokens, GSAP, or
`class-variance-authority` on the strength of a new pasted demo.

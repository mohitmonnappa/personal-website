# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Mohit Monnappa's personal site: projects, CTF/security writeups, and
pentesting methodology notes. Replaces an old Hugo + PaperMod blog (the
original markdown content is preserved under `content/` and reused as the
data source for several sections).

Design direction is deliberate and has been explicitly redirected once
already: **light, warm, editorial** (paper/pine/clay palette, Space Grotesk +
Source Serif 4) — not a dark "hacker terminal" aesthetic, even though the
subject matter is security/CTF. Don't reach for terminal chrome, neon-on-black,
matrix/glitch effects, or monospace display type when extending the UI.

## Git commits

Never add a `Co-Authored-By: Claude ...` or `Claude-Session: ...` trailer to
commit messages in this repo — this overrides the default commit template
in Claude Code's own instructions. Just the descriptive message body, no
trailer block.

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

2. **Mostly-placeholder TypeScript data** for two sections that don't have
   real content yet:
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
   - `src/lib/notes-data.ts` — pentesting methodology reference, a
     two-level section → note tree. Placeholder content standing in for a
     CherryTree notebook (`PenTesting notes .ctb`, gitignored, SQLite-based)
     that will eventually be exported and converted into this shape.

   The `Gaming Server/` and `PenTesting notes .ctb` raw sources are
   intentionally excluded from git via `.gitignore` — they're personal raw
   notes, not site content. When doing the real conversion work later, the
   target shape is whatever `machines-data.ts` / `notes-data.ts` currently
   define (`Machine`/`MachinePhase`, `NoteSection`/`NoteLeaf`), not a new
   content pipeline — reshape/extend those types rather than introducing a
   third content source.

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
  the sidebar tree comes from `noteSections` in `notes-data.ts`, so adding a
  note = adding an entry there, not creating new route files

## Design system

Tokens live as CSS custom properties in `src/app/globals.css` (`:root` +
Tailwind v4 `@theme inline` block) — colors (`paper`, `paper-raised`, `ink`,
`pine`, `pine-deep`, `pine-tint`, `clay`, `clay-tint`, `stone`, `line`) and
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

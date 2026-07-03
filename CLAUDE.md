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

2. **Placeholder TypeScript data** for two sections that don't have real
   content yet:
   - `src/lib/machines-data.ts` — HTB/TryHackMe machine writeups. Currently
     one fictional sample ("Warehouse") demonstrating the recon → foothold →
     privesc → loot phase structure. Real writeups will be condensed from
     raw per-machine notes (an example lives in the gitignored `Gaming
     Server/` folder — enum/exploit/loot/privesc markdown with image
     attachments, Obsidian-vault style) — that conversion hasn't happened
     yet, don't assume `machines-data.ts` reflects real engagements.
   - `src/lib/notes-data.ts` — pentesting methodology reference, a
     two-level section → note tree. Placeholder content standing in for a
     CherryTree notebook (`PenTesting notes .ctb`, gitignored, SQLite-based)
     that will eventually be exported and converted into this shape.

   Both raw sources (`Gaming Server/`, `PenTesting notes .ctb`) are
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

## Route structure

Routes mirror the content model above; `[slug]`/`[level]`/`[...slug]`
dynamic routes all use `generateStaticParams` for full static generation:

- `/` — home
- `/about`
- `/projects`, `/projects/[slug]`
- `/writeups` — hub linking to the two writeup collections below
- `/writeups/bandit`, `/writeups/bandit/[level]` — sequential, has prev/next
- `/writeups/machines`, `/writeups/machines/[slug]`
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
(`Github`, `Linkedin`, etc. don't exist in this version) — GitHub and
LinkedIn glyphs are hand-rolled inline SVGs in `src/components/icons.tsx`.
Check `node_modules/lucide-react/dist/esm/lucide-react.mjs` for actual
export names before assuming an icon exists.

The `TraceDivider` component (a thin animated SVG line between homepage
sections) is the site's one deliberate "signature" decorative motif — it's
used sparingly on purpose; don't scatter it across every section boundary.

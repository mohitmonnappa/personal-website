# mohitmonnappa.dev

Personal site — projects, CTF writeups, and pentesting notes. Built with
Next.js (App Router), Tailwind CSS v4, and Framer Motion.

## Structure

- `content/` — source markdown for the About page, projects, and OverTheWire
  Bandit walkthroughs (frontmatter + body, read via `gray-matter`)
- `src/lib/machines-data.ts` — HTB/TryHackMe machine writeups (placeholder
  content pending conversion from raw notes)
- `src/lib/notes-data.ts` — pentesting methodology notes (placeholder content
  pending conversion from the CherryTree notebook)
- `src/components/Prose.tsx` — shared markdown renderer (remark/rehype
  pipeline with syntax highlighting) used across writeups, notes, and project
  detail pages

## Development

```bash
npm run dev     # start dev server
npm run build   # production build
npm run lint    # eslint
```

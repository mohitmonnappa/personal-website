<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Project Agent Guide

This is a personal security-focused site built with Next.js 16 App Router,
React 19, Tailwind CSS v4, and Framer Motion. Read [CLAUDE.md](CLAUDE.md) for
the full content model, route map, design system, licensing rules, and git
workflow before making a non-trivial change.

## Validate changes

- `npm run build` is the correctness gate. It type-checks the project and
	statically generates every route; run it after code or rendered-content
	changes.
- `npm run lint` runs ESLint. There is no project test suite.
- Use `npm run dev` for local UI checks. Playwright is not a dependency; if a
	visual check needs it, install it ad hoc with `npm install --no-save
	playwright` and do not add it to `package.json`.

## Architecture

- Markdown in `content/` feeds the About page, projects, and Bandit
	walkthroughs through `src/lib/content.ts`.
- `src/lib/machines-data.ts` owns HTB/TryHackMe writeup data.
- `src/lib/notes-data.ts` owns the recursive `/notes` tree. Only nodes with a
	body are routable; do not assume the tree has a fixed depth.
- `src/components/Prose.tsx` renders author-controlled markdown through the
	unified/remark/rehype pipeline. Preserve raw HTML support and the copy-button
	contract with `src/lib/rehype-command-copy.ts` and
	`src/components/CodeCopyHandler.tsx`.

## Working conventions

- Preserve the established light, warm editorial visual language and use the
	existing CSS tokens and font utilities. Do not introduce a dark terminal,
	neon, matrix, or monospace-display aesthetic.
- Prefer existing components, data helpers, and route conventions over new
	abstractions. Keep changes scoped and do not alter unrelated user changes.
- Content and feature changes belong on a numbered review branch; do not merge
	them into `main`. Routine updates to agent guidance and skills may be made
	directly.
- To regenerate notes from the CherryTree notebook, follow
	[.claude/skills/update-notes/SKILL.md](.claude/skills/update-notes/SKILL.md)
	rather than editing the generated data by hand.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js guidance

This is not the Next.js you know: APIs and conventions may differ. Before
writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`
and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

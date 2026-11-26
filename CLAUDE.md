# CLAUDE.md

Read `AGENTS.md` for the full repository guide, YAML content map, and Cloudflare Workers conventions.

Quick summary:
- Edit `src/data/*.yaml` for all content updates (validated at build time by `src/lib/content.ts`).
- Pages live in `src/pages/` (`index`, `cfp`, `programme`, `organizers`, `venue-resources`, `contact`, `404`).
- Interactive React islands live in `src/components/*.tsx`.
- Cloudflare Worker API endpoints live in `src/pages/api/*.ts` with `export const prerender = false;` and read env vars via `import { env } from 'cloudflare:workers'`.
- Always verify edits with `npm run check && npm run build`.

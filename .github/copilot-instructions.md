# GitHub Copilot Instructions

This is the **Beyond the Provenance Pin (ACM CHI 2027 Workshop)** website, built with Astro + React and deployed on Cloudflare Workers.

## Golden Rules for Edits
1. **Edit YAML data files first** — Almost all website copy lives in `src/data/*.yaml`:
   - `src/data/site.yaml` — site title, tagline, CHI 2027 facts, proposal PDF URL, nav links, lead contact
   - `src/data/home.yaml` — overview, interactive 4-state provenance demo, pipeline, findings, gallery, 5 research questions, outcomes
   - `src/data/cfp.yaml` — CFP text, important dates, submission portal/embed config, accepted papers
   - `src/data/programme.yaml` — schedule table, invited speakers, hands-on activities A/B/C
   - `src/data/organizers.yaml` — organizer cards (photos in `public/assets/organizers/`)
   - `src/data/venue-resources.yaml` — Pittsburgh venue, accessibility list, reading list, related venues
   - `src/data/contact.yaml` — contact page copy and inquiry topic options
2. **Keep YAML valid and schema-compliant** — All files in `src/data/*.yaml` are validated by Zod schemas in `src/lib/content.ts`. If you introduce a new YAML property, update the schema in `src/lib/content.ts` as well.
3. **Never commit secrets or private organizer mailing lists** — Contact form forwarding uses Cloudflare Worker secrets (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_RECIPIENTS`) read via `import { env } from 'cloudflare:workers'` in `src/pages/api/contact.ts`.
4. **Preserve accessibility and the light-theme risograph design** — Keep styles in `src/styles/global.css` (light-theme only, using the 6 brand pigments from `public/assets/logo.svg`), keep individual organizer names out of the footer, and never rely on color alone for provenance state indicators (`✓`, `◐`, `○`, `≠`).
5. **Verify before finishing** — Run `npm run check` and `npm run build` to confirm all YAML files, TypeScript types, and the Cloudflare Worker bundle build cleanly.

See `AGENTS.md` for full recipes (activating embedded submission forms, publishing accepted papers, adding speakers).

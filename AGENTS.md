# Agent Instructions — CHI 2027 Provenance Workshop Website

This repository hosts the multi-page website for **Beyond the Provenance Pin**, an ACM CHI 2027 workshop, built with **Astro + React** and deployed to **Cloudflare Workers**.

It is intentionally structured so non-developer collaborators and AI coding agents (GitHub Copilot, Claude Code, Codex, Cursor, Antigravity) can safely edit content without touching HTML, CSS, or React code.

---

## 1. Where Content Lives (Edit These First!)

All workshop text, dates, organizers, schedule entries, reading list items, and form settings live in validated YAML files under `src/data/`. **Prefer editing `src/data/*.yaml` over editing `.astro` or `.tsx` files** whenever the request is a content update.

| What you want to change | File to edit |
|---|---|
| Workshop title, tagline, CHI 2027 dates/location, proposal PDF link, nav items, lead contact email | `src/data/site.yaml` |
| Hero overview paragraphs, interactive 4-state provenance demo copy, 6-stage pipeline, key findings, "In the wild" captions, figures, 5 research questions, privacy callout, expected outcomes | `src/data/home.yaml` |
| Call for Participation text, submission formats, topics, **important dates**, **submission portal link or embedded form URL**, **accepted papers list** | `src/data/cfp.yaml` |
| Workshop schedule table, **invited speakers**, three hands-on activities (A, B, C) | `src/data/programme.yaml` |
| Organizer names, affiliations, roles, committees, websites, photo filenames | `src/data/organizers.yaml` |
| Pittsburgh venue info, accessibility commitments, reading list, related venues | `src/data/venue-resources.yaml` |
| Contact page intro, inquiry topic dropdown options, sidebar notes | `src/data/contact.yaml` |

### Static Media Assets
- Proposal figures: `public/assets/fig1-pipeline.png`, `public/assets/fig2-activities.png`
- Organizer headshots (square `.jpg`, ≥ 300×300 px): `public/assets/organizers/<slug>.jpg`
  - If a photo is omitted or missing, the site automatically falls back to colored initials.
- Proposal PDF (when ready): place at `public/assets/proposal.pdf` and set `proposalPdf.url: "/assets/proposal.pdf"` in `src/data/site.yaml`.

---

## 2. Common Tasks & Exact Recipes

### Activate the Submission Form or Portal Link
Edit `src/data/cfp.yaml` under `submission:`:
- **External portal (HotCRP / EasyChair / OpenReview / Google Form link)**:
  ```yaml
  submission:
    status: external_link
    buttonLabel: Submit a position paper
    externalUrl: https://your-submission-portal.example
  ```
- **Embedded form (Google Forms / Tally / Typeform)**:
  ```yaml
  submission:
    status: embed
    embedUrl: https://docs.google.com/forms/d/e/.../viewform?embedded=true
    embedHeight: 820
  ```
  When `status: embed`, the CFP page automatically renders the embedded form in a full-width section with an accessible fallback link.

### Publish Accepted Papers (After Notification)
Edit `src/data/cfp.yaml` under `acceptedPapers:`:
- Set `published: true`
- Add items to `papers:` with `title`, `authors`, optional `type`, and optional `pdfUrl`.

### Add or Update Invited Speakers
Edit `src/data/programme.yaml`:
- Update the speaker entry under `speakers:` and set `tba: false`.
- Remove `badge: Speaker TBA` from the matching row under `schedule:`.

### Update Colors or Typography
All visual tokens live in `:root` (and dark mode `@media (prefers-color-scheme: dark)`) at the top of `src/styles/global.css`. Preserve WCAG AA contrast and ensure provenance states (`valid`, `partial`, `missing`, `conflict`) never communicate meaning through color alone (always keep their distinct icons `✓`, `◐`, `○`, `≠` and text labels).

---

## 3. Architecture & Cloudflare Workers Rules

- **Framework**: Astro 7 (`output: 'static'`) + `@astrojs/react` + `@astrojs/cloudflare`.
- **Static pages** (`src/pages/*.astro`) are prerendered into `dist/` and served directly by Cloudflare Workers Static Assets.
- **Dynamic API routes** (currently `src/pages/api/contact.ts`) MUST declare `export const prerender = false;`.
- **Runtime bindings & secrets**: Import Cloudflare Worker bindings/env via `import { env } from 'cloudflare:workers';` (do NOT use the removed `Astro.locals.runtime` API, and NEVER put secrets in `wrangler.jsonc`, `src/data/*.yaml`, or `import.meta.env`).
- **Contact forwarding**: `/api/contact` forwards form submissions to all committee members listed in the Worker runtime variable `CONTACT_RECIPIENTS` via Resend (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`) and/or an optional `CONTACT_WEBHOOK_URL`. Never commit organizer email lists or API keys to git.
- **Schema safety**: Every YAML file in `src/data/` is validated at build time by Zod in `src/lib/content.ts`. If you add a new field to a YAML file, also update the corresponding Zod schema in `src/lib/content.ts`.

---

## 4. Verification Before Committing

Always run both checks after making changes:
```bash
npm run check   # TypeScript + Astro template check
npm run build   # Validates all YAML schemas & builds the Cloudflare Worker bundle
```
To test locally inside Cloudflare's `workerd` runtime (including `/api/contact`):
```bash
cp .dev.vars.example .dev.vars   # enables CONTACT_DRY_RUN=true
npm run dev
```

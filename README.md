# Beyond the Provenance Pin — CHI 2027 Workshop Website

Multi-page workshop website built with **Astro + React** and configured for **Cloudflare Workers** (prerendered static pages at the edge + Worker API route for the contact form).

All editable content lives in plain YAML files under `src/data/` so workshop organizers (and AI assistants like GitHub Copilot, Claude, or Codex) can update dates, speakers, submissions, or organizers without touching HTML, CSS, or React code.

---

## Quick Edit Guide (No Web Dev Required)

You can edit any of these files directly on GitHub (click the file → pencil icon → **Commit changes**), or ask GitHub Copilot / your AI assistant to edit them for you (this repo includes `AGENTS.md`, `.github/copilot-instructions.md`, and `CLAUDE.md`).

| What you want to change | File to edit |
|---|---|
| Workshop title, tagline, CHI 2027 dates, proposal PDF link | [`src/data/site.yaml`](src/data/site.yaml) |
| Overview, interactive provenance demo, findings, research questions | [`src/data/home.yaml`](src/data/home.yaml) |
| Call for Participation, **deadlines**, **submission form/link**, **accepted papers** | [`src/data/cfp.yaml`](src/data/cfp.yaml) |
| Schedule timetable, **invited speakers**, workshop activities A/B/C | [`src/data/programme.yaml`](src/data/programme.yaml) |
| Organizer names, affiliations, roles, committees | [`src/data/organizers.yaml`](src/data/organizers.yaml) |
| Organizer photos (square `.jpg`, ≥ 300×300 px) | [`public/assets/organizers/`](public/assets/organizers/README.md) |
| Venue info, accessibility list, reading list, related venues | [`src/data/venue-resources.yaml`](src/data/venue-resources.yaml) |
| Contact page text and inquiry topic dropdown | [`src/data/contact.yaml`](src/data/contact.yaml) |
| Colors & typography | [`src/styles/global.css`](src/styles/global.css) (`:root` at top of file) |

### Turning on the Submission Form Later
Open [`src/data/cfp.yaml`](src/data/cfp.yaml) and update the `submission:` block:
- **Option A — Link to an external portal** (HotCRP, EasyChair, OpenReview, etc.):
  Set `status: external_link` and paste your URL in `externalUrl`.
- **Option B — Embed a form right on the CFP page** (Google Forms, Tally, Typeform):
  Set `status: embed` and paste the iframe embed URL in `embedUrl` (for Google Forms, use the URL ending in `/viewform?embedded=true`).

---

## Pages

- `/` — **Overview** (Hero, interactive 4-state Provenance Demo, 6-stage Pipeline, Key Findings, In the Wild scenarios, Figures 1 & 2 with lightbox, Five Research Questions & Outcomes)
- `/cfp` — **Call for Participation** (Submission formats, topics, Important Dates, Submission Form/Embed slot, Accepted Papers)
- `/programme` — **Programme** (Schedule table, Invited Speakers, Three Connected Activities A/B/C)
- `/organizers` — **Organizers** (Committee-filterable organizer grid with initials fallback)
- `/venue-resources` — **Venue & Resources** (Pittsburgh venue, Accessibility commitments, Reading list, Related venues)
- `/contact` — **Contact** (Interactive contact form backed by Cloudflare Worker `POST /api/contact`)

---

## Local Development

Requires **Node.js 22.12+**.

```bash
npm install
cp .dev.vars.example .dev.vars   # enables dry-run mode for testing /api/contact locally
npm run dev
```

Useful scripts:
- `npm run dev` — local dev server running on Cloudflare's `workerd` runtime
- `npm run check` — TypeScript + Astro template check
- `npm run build` — validates all YAML files against Zod schemas and builds `dist/`
- `npm run preview` — builds and previews the production Worker locally
- `npm run deploy` — builds and deploys to Cloudflare Workers via Wrangler

---

## Deploying to Cloudflare Workers

### Option 1: Automatic Git deploys (Recommended — Workers Builds)
Every push to `main` automatically validates, builds, and deploys the site:
1. In the **Cloudflare Dashboard**, go to **Compute (Workers) → Workers & Pages → Create → Import a repository**.
2. Select this GitHub repository.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
   - **Node.js version**: 22 (default)
4. Click **Save and Deploy**.

### Option 2: Deploy from your terminal
```bash
npx wrangler login
npm run deploy
```

---

## Setting Up Contact Form Email Forwarding (All Committee Members)

The `/contact` form submits to `POST /api/contact` (`src/pages/api/contact.ts`), which runs on your Cloudflare Worker and forwards each message to **all workshop organizers** with `Reply-To` set to the sender's email address.

Because organizer emails and API keys should stay private, configure them as **Cloudflare Worker Variables & Secrets** (not in git):

1. Create a free [Resend](https://resend.com) account and verify your sending domain (e.g., `workshop@your-domain.org`).
2. In **Cloudflare Dashboard → Your Worker → Settings → Variables and Secrets** (or via Wrangler CLI), set:
   - **`RESEND_API_KEY`** *(Secret)* — your Resend API key (`re_...`)
   - **`CONTACT_FROM_EMAIL`** *(Variable)* — e.g. `CHI 2027 Provenance Workshop <workshop@your-domain.org>`
   - **`CONTACT_RECIPIENTS`** *(Secret or Variable)* — comma-separated list of all organizing committee emails (e.g. `chair1@univ.edu,chair2@lab.org,...`)
   - **`CONTACT_WEBHOOK_URL`** *(Optional Secret)* — Slack / Discord / Teams / Zapier webhook URL if you also want messages posted to an organizers channel

Or set secrets from the CLI:
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_FROM_EMAIL
npx wrangler secret put CONTACT_RECIPIENTS
```

---

## Still To Fill In
- Submission deadline, notification date, and pre-workshop material dates (`src/data/cfp.yaml`)
- Exact workshop day within 10–14 May 2027 (`src/data/site.yaml` & `src/data/cfp.yaml`)
- Submission portal or embedded form URL (`src/data/cfp.yaml`)
- Proposal PDF in `public/assets/proposal.pdf` + link in `src/data/site.yaml`
- Invited speakers (`src/data/programme.yaml`)
- Confirm each organizer is happy with their photo (`public/assets/organizers/README.md`)
- Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_RECIPIENTS` on Cloudflare Workers
- Accepted papers after notification (`src/data/cfp.yaml`)

# RadarAI — AI job search on demand

Drop your resume, set keywords, and get ranked job matches with AI fit summaries. Live listings from Adzuna, scored with GPT-4o-mini.

**New here?** [`docs/CONNECT_SERVICES.md`](docs/CONNECT_SERVICES.md) · [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) · [`docs/AUTH_OAUTH_SETUP.md`](docs/AUTH_OAUTH_SETUP.md)

Production: **https://web-ashen-sigma-71.vercel.app**

## Architecture

- **Next.js 15 on Vercel** — marketing, OAuth auth, search dashboard, scoring engine, cron jobs
- **Supabase** — Postgres, resume storage, Google/GitHub auth
- **Adzuna API** — live job listings
- **OpenAI gpt-4o-mini** — per-job scoring and summaries
- **Resend** — optional notification emails (Pro digest planned)

Engine pipeline: `web/lib/engine/` (fetch → clean → score → persist → notify).

Triggered by **Search now** on `/dashboard/searches`, first-time **Save and search**, or daily cron `/api/cron/radar`.

## Repo layout

```
web/              Next.js app (Vercel builds from repo root via vercel.json)
db/migrations/    Supabase schema + RLS
docs/             Ops docs (see docs/README.md)
vercel.json       Monorepo build → web/
```

## Quick start

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

From repo root: `npm run saas:dev` · `npm run saas:deploy:only`

See [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md) and [`docs/MVP_COMPLETE.md`](docs/MVP_COMPLETE.md).

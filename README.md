# RadarAI — AI job search on demand

Drop your resume, set keywords, and get ranked job matches with AI fit summaries. Live listings from Adzuna, scored with GPT-4o-mini.

> Two independent things live in this repo:
> - **`web/`** — the SaaS app (Next.js on Vercel). This is production.
> - **`personal/`** — optional local n8n funnel. See `personal/README.md`.

**New here?** [`docs/CONNECT_SERVICES.md`](docs/CONNECT_SERVICES.md) for setup · [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for layout · [`docs/AUTH_OAUTH_SETUP.md`](docs/AUTH_OAUTH_SETUP.md) for sign-in.

Production: **https://web-ashen-sigma-71.vercel.app**

## SaaS architecture (`web/`)

- **Next.js 15 on Vercel** — marketing, OAuth auth, search dashboard, scoring engine, cron jobs.
- **Supabase** — Postgres, resume storage, Google/GitHub auth.
- **Adzuna API** — live job listings.
- **OpenAI gpt-4o-mini** — per-job scoring and summaries.
- **Resend** — optional email notifications (Pro digest planned).

Engine pipeline: `web/lib/engine/` (fetch → clean → score → persist → notify).

Triggered by:
- user clicking **Search now** on `/dashboard/searches`,
- first-time **Save and search** during setup,
- daily Vercel Cron `/api/cron/radar`.

## Repo layout

```
web/                         Next.js app (Vercel deploys from repo root via vercel.json)
  app/(marketing)/           Landing, privacy, support
  app/(auth)/                Sign in / sign up (Google + GitHub)
  app/(app)/dashboard/       Search workspace, settings, legacy redirects
  app/api/                   Run trigger, polling, cron
  components/                UI components
  lib/engine/                Job search + AI scoring pipeline
  lib/supabase/              Auth clients

db/migrations/               Supabase schema + RLS
docs/                        Ops docs (see docs/README.md)
personal/                    Optional n8n stack (not used by SaaS)
vercel.json                  Monorepo build → web/
```

## Quick start

```bash
cd web
cp .env.example .env.local   # Supabase, Adzuna, OpenAI keys
npm install
npm run dev                  # http://localhost:3000
```

From repo root: `npm run saas:dev` · `npm run saas:deploy:only` · `npm run saas:engine:live`

See [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md) and [`docs/MVP_COMPLETE.md`](docs/MVP_COMPLETE.md).

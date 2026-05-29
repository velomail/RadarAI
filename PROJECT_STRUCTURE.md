# Project structure

```
n8n-job-funnel/
├── web/                    ← SaaS app (Vercel deploys via root vercel.json)
│   ├── app/                ← Next.js routes
│   ├── components/         ← UI
│   ├── lib/engine/         ← Job search + AI scoring pipeline
│   ├── lib/supabase/       ← Auth clients
│   └── scripts/            ← deploy, engine mode, env helpers
├── db/migrations/          ← Supabase SQL (run in order)
├── docs/                   ← Ops + auth (see docs/README.md)
├── scripts/                ← sync-saas-env.mjs
├── package.json            ← saas:* npm scripts
├── vercel.json             ← install/build web/ from repo root
└── PROJECT_STRUCTURE.md
```

## Which folder do I work in?

| Goal | Directory | Env file | Start command |
|---|---|---|---|
| Develop / ship the SaaS app | `web/` | `web/.env.local` | `npm run saas:dev` |
| Change database schema | `db/migrations/` | — | Supabase SQL editor |
| Deploy to production | repo root | Vercel env vars | `git push` or `npm run saas:deploy:only` |

## Env files

| File | Used by | Committed? |
|---|---|---|
| `web/.env.local` | Next.js dev; mirrors Vercel prod | No |
| `.env.old` at repo root | Legacy backup; `npm run saas:sync-env` → `web/.env.local` | No |

## Canonical routes

| URL | Purpose |
|---|---|
| `/dashboard/searches` | Main search workspace (resume, criteria, results) |
| `/dashboard/settings` | Account + Telegram alerts |
| `/dashboard/settings/search` | Email alerts + advanced search settings |
| `/sign-up` | Google / GitHub OAuth |

Legacy URLs (`/dashboard`, `/onboarding`, `/dashboard/runs/:id`, etc.) redirect via `web/next.config.ts`.

## Engine map (`web/lib/engine/`)

| Module | Role |
|---|---|
| `fetch-sources.ts` | Adzuna job fetch |
| `clean-jobs.ts` | Dedupe, denylist, normalize |
| `score-with-openai.ts` | gpt-4o-mini scoring |
| `persist-run.ts` | Save jobs + update run |
| `dispatch-notifications.ts` | Email / Telegram |
| `run-engine.ts` | Orchestrator |

Triggered by: search actions, `/api/profiles/[id]/run`, `/api/cron/radar`.

## Root npm scripts

```bash
npm run saas:dev           # Next.js on :3000
npm run saas:build         # production build check
npm run saas:deploy:only   # Vercel production deploy
npm run saas:engine:live   # remove ENGINE_MODE on Vercel
npm run saas:sync-env      # copy .env.old → web/.env.local
```

Do **not** run `saas:build` while `saas:dev` is running — corrupts `.next`.

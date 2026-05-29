# RadarAI — AI job search on demand

Drop your resume. Tell us what you want. The app fetches roles from Adzuna, scores fit with GPT-4o-mini, and returns ranked matches with apply links and summaries.

> Two independent things live in this repo:
> - **`web/`** — the SaaS app. Pure Next.js on Vercel (no separate engine). This is what `app.<your-domain>` serves.
> - **`personal/`** — the original single-user n8n funnel (optional). See `personal/README.md` and `npm run personal:up` / `npm run personal:deploy`.

**New here?** Read [`docs/DEVELOPER_DOCS.md`](docs/DEVELOPER_DOCS.md), then [`docs/CONNECT_SERVICES.md`](docs/CONNECT_SERVICES.md) for setup and [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for folder layout.

## SaaS architecture (web/)

- **Next.js 15 on Vercel Hobby (free)** — landing, anonymous demo, authed dashboard, scoring engine, daily radar cron, nightly maintenance cron. One project, no extra services.
- **Supabase Free** — Postgres for runs/jobs/profiles/seen_jobs, Storage for resumes, Auth via magic link.
- **Adzuna API** — primary job source.
- **OpenAI gpt-4o-mini** — per-job scoring + cover-letter hooks (8 parallel calls per run by default).
- **Resend** — daily digest email; per-user Telegram dispatch as a second channel.

All the heavy lifting that used to live in n8n now runs as Next.js server functions (`web/lib/engine/`), kicked off by:
- a user clicking "Run my radar now" on the dashboard,
- the daily Vercel Cron `/api/cron/radar` at 11:00 UTC,
- or the anonymous landing-page demo.

Each engine run finishes well inside the 300s Vercel function budget (Fluid Compute, Hobby tier).

## Repo layout

```
web/                                Next.js 15 app deployed to Vercel
  app/(marketing)/                  Landing
  app/(auth)/                       Sign in / sign up
  app/(app)/dashboard/              Authed shell, runs, profiles, settings
  app/demo/                         Anonymous demo flow
  app/api/profiles/[id]/run/        User-initiated radar run
  app/api/runs/[id]/                Poll a run's status + jobs
  app/api/cron/radar/               Daily scheduler (Vercel Cron, 11:00 UTC)
  app/api/cron/maintenance/         Nightly prune + demo cleanup (Vercel Cron, 08:00 UTC)
  components/                       Dropzone, JobCard, SearchProfileForm, ...
  lib/engine/                       The whole scoring pipeline as plain TS:
    fetch-sources.ts                  Adzuna source fetching per query
    clean-jobs.ts                     Dedupe, denylist, html strip, normalize
    load-seen-jobs.ts                 14-day per-user dedupe via Supabase
    score-with-openai.ts              gpt-4o-mini scoring, bounded concurrency
    post-process.ts                   Score normalization, freshness, ranking
    persist-run.ts                   jobs insert + seen_jobs upsert + run patch
    dispatch-notifications.ts         Resend email + Telegram, with daily budget
    cron-match.ts                     Cron expression matcher with windowing
    run-engine.ts                     End-to-end orchestrator
  lib/supabase/                     Server + browser Supabase clients
  vercel.json                       Cron schedules + framework pins

db/migrations/                      Supabase Postgres schema + RLS + RPCs

personal/                           Original single-user n8n stack (optional, separate from SaaS)
  docker-compose.yml
  .env.example
  scripts/                          n8n Code-node sources + deploy-workflow.mjs
  workflows/                        generated JSON (gitignored)
  data/                             resume PDF + runtime dedupe files (gitignored)

docs/                               See docs/README.md for full index
  AUTH_EMAIL_SETUP.md               Any-user signup (verify domain in Resend)
  MONETIZATION.md                   Revenue audit + product roadmap questions
  PROVISIONING.md                   One-time setup of Supabase + Vercel + keys
  DEBUG_VERCEL.md                   Production logs + common Vercel errors
  RUNBOOK.md                        Ops + incident response
  openai-system-prompt.txt          Reference copy of the scoring system prompt
```

## First-time setup (SaaS)

Follow [`docs/PROVISIONING.md`](docs/PROVISIONING.md) end-to-end. It takes about 20 minutes and stays on free tiers.

## Local development (SaaS)

```bash
cd web
cp .env.example .env.local      # fill in Supabase, Adzuna, OpenAI, optional Resend/Telegram
npm install
npm run dev                     # http://localhost:3000
# Or from repo root: npm run saas:dev
```

Both `/demo` and the dashboard "Run now" button call the engine in-process via Next.js `after()`. There's no separate service to start.

To exercise the daily cron locally:

```bash
curl -H "Authorization: Bearer $env:CRON_SECRET" http://localhost:3000/api/cron/radar
```

## Daily operations

See [`docs/RUNBOOK.md`](docs/RUNBOOK.md) and [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md).

## What ships in v1

- Anonymous demo run from landing page (no signup).
- Authed onboarding with PDF resume upload + first search profile.
- Dashboard with run history, single-run drill-down, profile editor, settings.
- Per-user scheduled radars (cron-driven, fired daily by Vercel Cron).
- Resend daily digest with top 5 jobs + cover-letter hooks + deep link.
- Optional Telegram dispatch using your existing bot.
- Cross-day deduplication via Supabase `seen_jobs` (per-user, 14-day window).
- Freshness-first ranking with FRESH/WARM/RECENT badges.
- Direct-ATS link surfacing when LinkedIn provides one.

## Out of scope for v1

- Stripe billing.
- Multiple resumes per profile.
- Browser extension / autofill.
- Direct LinkedIn scraping.
- Native mobile.
- Sub-daily scheduling (Vercel Hobby cron is daily-only; upgrade to Pro for 30-min cadence).

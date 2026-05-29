# Local development — SaaS (`web/`)

The app runs entirely in Next.js. No Docker, no n8n, no VPS.

## Prereqs

- Node.js 20+
- A Supabase project with all files in `db/migrations/` applied (see `PROVISIONING.md` §1)
- OpenAI + RapidAPI keys (same ones as the personal funnel)

## Setup

```bash
cd web
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

### Mock engine (no external APIs)

Set in `web/.env.local`:

```
ENGINE_MODE=mock
```

| Service | Live mode | Mock mode |
|---------|-----------|-----------|
| JSearch / LinkedIn (RapidAPI) | Real job boards | ~20 synthetic jobs per run |
| OpenAI scoring | gpt-4o-mini | Keyword-overlap heuristic |
| Query inference (`auto` focus) | OpenAI | First resume line + fallbacks |
| Resend email | Sends email | Logs to terminal only |

Supabase (auth, DB, storage) is still required — only the **job search + AI + email send** stack is mocked.

Runs complete in a few seconds with no API keys for RapidAPI or OpenAI. Good for UI testing, demos, and MVP walkthroughs.

Minimum variables in `web/.env.local`:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `RAPIDAPI_KEY` | JSearch |
| `LINKEDIN_RAPIDAPI_KEY` | Bebity (often same key) |
| `OPENAI_API_KEY` | gpt-4o-mini scoring |

Optional: `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `CRON_SECRET`.

`CRON_SECRET` can stay empty locally — cron routes only enforce auth when the var is set.

## How a run works locally

1. `/demo` or dashboard **Run now** creates a `pending` row in Supabase.
2. `after(() => runEngine(...))` runs the pipeline in `web/lib/engine/` in the same Node process.
3. The UI polls `/api/runs/[id]` until `status` is `success` or `error`.

Typical runtime: 30–90 seconds depending on how many jobs get scored.

## Test the daily cron locally

```powershell
# PowerShell — set CRON_SECRET in .env.local first
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/radar
```

## Common issues

| Symptom | Fix |
|---|---|
| Blank page / **500** / `Cannot find module './611.js'` | You ran **`next build`** then **`next dev`** (or OneDrive corrupted `.next`). Stop dev, run `npm run saas:clean`, then `npm run saas:dev`. Never run `npm run saas:build` while dev is running. In OneDrive: **exclude `web\.next` from sync** or move the repo to e.g. `C:\dev\radarai`. |
| Run stays `pending` | Check the terminal running `npm run dev` for `runEngine failed:` |
| `Missing RAPIDAPI_KEY` | Add to `web/.env.local`, restart dev server |
| PDF upload fails | Supabase `resumes` bucket must exist; migrations applied |
| OpenAI 429 | Lower `OPENAI_SCORE_CONCURRENCY=4` in `.env.local` |
| No email after run | See **Run-complete email** below |
| **HTTP 429** / RapidAPI rate limit | Wait 1–2 min and retry. Defaults: 3 queries max, 1.2s between API calls. Raise limits only on a paid RapidAPI plan. |

## Run-complete email

Email sends only when **“Email me when this search finishes”** is checked on the search profile (Edit search). Saving **Settings → Telegram** no longer clears that preference.

Check Vercel/dev logs for `dispatchNotifications skipped:` — common reasons:

| Log reason | Fix |
|---|---|
| `missing_resend_api_key` | Set `RESEND_API_KEY` in Vercel / `web/.env.local` |
| `resend_403` / “own email” | Resend test sender only delivers to your Resend account email until you verify a domain |
| `resend_daily_cap_reached` | Wait for UTC day rollover or raise `RESEND_DAILY_HARD_CAP` |
| `profile_not_found` | Run must be tied to a saved search profile (not demo) |
| `empty_run` (old builds) | Fixed: zero-match runs now send a “no matches” email |

Preview HTML locally: `npm run saas:preview-email > sample.html`  
Test Resend API: `npm run saas:test-resend your@email.com`

## Personal funnel (separate)

If you still use the original n8n workflow, see `personal/README.md` — that stack does not share env files with `web/`.

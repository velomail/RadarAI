# Local development — SaaS (`web/`)

The app runs entirely in Next.js on your machine.

## Prereqs

- Node.js 20+
- Supabase project with all `db/migrations/` applied
- Adzuna + OpenAI keys for live mode (mock mode needs neither)

## Setup

```bash
cd web
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

From repo root: `npm run saas:dev`

### Mock engine (no Adzuna/OpenAI)

```env
ENGINE_MODE=mock
```

| Service | Live | Mock |
|---------|------|------|
| Adzuna | Real listings | ~20 synthetic jobs |
| OpenAI | gpt-4o-mini | Keyword heuristic |
| Resend | Sends email | Logs only |

Supabase is still required for auth, DB, and storage.

## Minimum env vars

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Live mode only |
| `OPENAI_API_KEY` | Live mode only |

Optional: `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `CRON_SECRET`.

## How a run works locally

1. **Search now** on `/dashboard/searches` creates a `pending` run in Supabase.
2. `after(() => runEngine(...))` runs the pipeline in-process.
3. UI polls `/api/runs/[id]` until `success` or `error`.

Typical runtime: 30–90 seconds (live), a few seconds (mock).

## Test cron locally

```powershell
curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/radar
```

## Common issues

| Symptom | Fix |
|---|---|
| 500 / corrupted `.next` | Stop dev, `npm run saas:clean`, restart |
| Run stays `pending` | Check terminal for `runEngine failed:` |
| `Missing ADZUNA_APP_ID` | Add keys or set `ENGINE_MODE=mock` |
| PDF upload fails | Create `resumes` bucket in Supabase |
| OpenAI 429 | Lower `OPENAI_SCORE_CONCURRENCY=4` |

## Run-complete email

Optional. Set `RESEND_API_KEY` and enable email on the search profile (Settings → search).

Preview: `npm run saas:preview-email` · Test send: `npm run saas:test-resend your@email.com`

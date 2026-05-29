# Operations runbook — SaaS (`web/` on Vercel)

Day-to-day ops for the production app. For the personal n8n funnel, see `personal/README.md`.

## Architecture

```
Browser  →  Vercel (Next.js)
              ├─ UI + API routes
              ├─ lib/engine/     fetch → clean → OpenAI → persist → notify
              ├─ Cron /api/cron/radar        (daily, Vercel Cron)
              └─ Cron /api/cron/maintenance  (daily prune + demo cleanup)
           →  Supabase (Postgres, Storage, Auth)
           →  RapidAPI (JSearch + LinkedIn)
           →  OpenAI gpt-4o-mini
           →  Resend (email) + Telegram (optional)
```

There is no n8n service in production.

## Smoke test (5 min)

1. `https://<app>/demo` — upload resume, wait ~90s for scored jobs.
2. `https://<app>/sign-up` — magic link, complete onboarding.
3. Dashboard → **Run my radar now** — jobs + optional Telegram/email.
4. Trigger cron manually:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/radar
   ```

## Daily monitoring

- **Vercel** → Project → Deployments → latest → **Runtime Logs**
- **Supabase** → Logs (Postgres / Storage / Auth)
- **Resend** → dashboard for bounce/spam issues

## Common incidents

### "Scoring jobs..." never finishes

1. Vercel runtime logs for `runEngine failed:`.
2. Supabase → `runs` table → find the row by id → read `error` column.
3. Typical causes: missing `OPENAI_API_KEY`, RapidAPI quota, zero jobs after sanitization.

### Scheduled digest did not fire

1. Vercel → Settings → Cron Jobs — confirm `/api/cron/radar` is listed.
2. Hobby plan: cron runs **once per day** with ±59 min precision. Profiles match if their `schedule_cron` wanted to fire in the ~90 min window before the tick (see `RADAR_WINDOW_MINUTES`).
3. Manual trigger with `curl` (above) — response lists `queued_run_ids` or `skipped`.

### Email stopped

- `RESEND_API_KEY` and `EMAIL_FROM` set in Vercel env.
- Check `email_budget` table — may have hit `RESEND_DAILY_HARD_CAP` (default 90).
- Profile must have `notify_email` set.

### Telegram stopped

- `TELEGRAM_BOT_TOKEN` in Vercel env.
- User's `notify_telegram_chat_id` on their search profile.

### Cron returns 401

- `CRON_SECRET` must be set in Vercel. Vercel attaches `Authorization: Bearer <value>` automatically on scheduled invocations.

## Rotating secrets

Update in Vercel → Environment Variables → **Redeploy**. No VPS env files.

| Secret | Also update |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard only |
| `OPENAI_API_KEY` | Vercel only |
| `RAPIDAPI_KEY` | Vercel only |
| `CRON_SECRET` | Vercel only (cron auth) |

## Data retention

Nightly `/api/cron/maintenance` calls Supabase RPC `prune_old_data`:

- runs/jobs older than 30 days
- `seen_jobs` older than 14 days
- demo resume files in Storage older than 24h

## Deploy

Push to the connected Git branch. Vercel builds `web/` (set **Root Directory** = `web` in project settings).

```bash
npm run saas:build    # local sanity check from repo root
```

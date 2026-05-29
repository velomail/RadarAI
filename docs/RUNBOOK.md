# Operations runbook — SaaS (`web/` on Vercel)

Day-to-day ops for the production app.

## Architecture

```
Browser  →  Vercel (Next.js)
              ├─ UI + API routes
              ├─ lib/engine/     Adzuna fetch → clean → OpenAI → persist → notify
              ├─ Cron /api/cron/radar        (daily scheduled searches)
              └─ Cron /api/cron/maintenance  (daily data prune)
           →  Supabase (Postgres, Storage, Auth)
           →  Adzuna API
           →  OpenAI gpt-4o-mini
           →  Resend (optional email) + Telegram (optional)
```

## Smoke test (5 min)

1. `https://<app>/sign-up` — sign in with Google or GitHub
2. `/dashboard/searches` — upload resume, set keywords, **Search now** → results in ~60–90s
3. Settings → confirm account email displays
4. Trigger cron manually:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<app>/api/cron/radar
   ```

## Daily monitoring

- **Vercel** → Deployments → latest → Runtime Logs
- **Supabase** → Logs (Postgres / Storage / Auth)
- **Resend** → bounces / spam (if email notifications enabled)

## Common incidents

### Search never finishes

1. Vercel runtime logs for `runEngine failed:`.
2. Supabase → `runs` → find row by id → read `error` column.
3. Typical causes: missing `OPENAI_API_KEY`, missing Adzuna keys, zero jobs after filtering.

### Scheduled digest did not fire

1. Vercel → Settings → Cron Jobs — confirm `/api/cron/radar` is listed.
2. Hobby plan: cron runs once per day (±59 min). Profiles match if `schedule_cron` falls in the window before the tick.
3. Manual trigger with `curl` — response lists `queued_run_ids` or `skipped`.

### Email stopped

- `RESEND_API_KEY` and `EMAIL_FROM` in Vercel env.
- Check `email_budget` — may have hit `RESEND_DAILY_HARD_CAP`.
- Profile must have `notify_email` set.

### Cron returns 401

- `CRON_SECRET` must be set in Vercel.

## Rotating secrets

Update in Vercel → Environment Variables → **Redeploy**.

| Secret | Also update |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard |
| `OPENAI_API_KEY` | Vercel |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Vercel |
| `CRON_SECRET` | Vercel |

## Data retention

Nightly `/api/cron/maintenance` calls Supabase RPC `prune_old_data`:

- runs/jobs older than 30 days
- `seen_jobs` older than 14 days

## Deploy

Push to Git (auto-deploy) or:

```bash
npm run saas:deploy:only
npm run saas:build    # local sanity check
```

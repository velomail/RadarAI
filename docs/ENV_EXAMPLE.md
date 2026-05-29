# Minimal `.env` template (SaaS)

Use this as the only source for your local `web/.env.local` and Vercel env vars.

## Quick start

1. Create `web/.env.local`
2. Paste the template below
3. Fill required values

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENGINE_MODE=mock
OPENAI_API_KEY=
CRON_SECRET=

# Adzuna only (live mode source)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADZUNA_COUNTRY=ca
ADZUNA_MAX_PRIMARY_QUERIES=2
ADZUNA_MAX_WIDEN_QUERIES=0
ADZUNA_FETCH_DELAY_MS=800

# Optional notifications
# RESEND_API_KEY=
# EMAIL_FROM=RadarAI <onboarding@resend.dev>
# RESEND_DAILY_HARD_CAP=90
# TELEGRAM_BOT_TOKEN=

# Optional runtime tuning
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_SCORE_CONCURRENCY=12
# OPENAI_MAX_JOBS_TO_SCORE=20
# OPENAI_SCORE_DESCRIPTION_MAX_CHARS=2800
# RADAR_TIMEZONE=America/Toronto
# RADAR_WINDOW_MINUTES=90
# RADAR_MAX_PROFILES_PER_TICK=25
```

## Remove these old vars

Delete/ignore these from your old env files:

- `RAPIDAPI_KEY`
- `LINKEDIN_RAPIDAPI_HOST`
- `LINKEDIN_RAPIDAPI_KEY`
- `LINKEDIN_PRIMARY_PATH`
- `LINKEDIN_WIDEN_PATH`
- `LINKEDIN_QUERY_PARAM`
- `LINKEDIN_LOCATION_PARAM`
- `JSEARCH_PRIMARY_DATE_POSTED`
- `RAPIDAPI_MAX_PRIMARY_QUERIES`
- `RAPIDAPI_MAX_WIDEN_QUERIES`
- `RAPIDAPI_FETCH_DELAY_MS`
- `RAPIDAPI_MAX_RETRIES`
- `RAPIDAPI_RETRY_BASE_MS`

## Notes

- For demos, keep `ENGINE_MODE=mock`.
- For real runs, set `ENGINE_MODE=live` after Adzuna + OpenAI keys are set.
- Keep secrets only in `web/.env.local` (never commit).

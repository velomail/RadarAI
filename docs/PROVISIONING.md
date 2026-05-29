# Provisioning — RadarAI SaaS

First-time cloud setup (~20 min). Free tiers: Vercel Hobby, Supabase Free, Resend Free. Paid usage: Adzuna (free tier available) + OpenAI pay-as-you-go.

## 1. Supabase

1. Create project at [supabase.com](https://supabase.com) (Free plan).
2. Copy from Settings → API: **Project URL**, **anon key**, **service_role key**.
3. SQL editor — run each file in `db/migrations/` in order through `0007_user_usage.sql`.
4. Storage → create bucket **`resumes`** (private, ~5MB file limit). Migration `0003` adds policies only — it does not create the bucket.
5. Auth — follow **[AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)**:
   - Enable Google + GitHub providers
   - Site URL: your production URL (or `http://localhost:3000` for local)
   - Redirect URLs: `https://<app>/auth/callback**` and `http://localhost:3000/auth/callback**`
   - Allow new users to sign up: ON

## 2. CRON_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Used by `/api/cron/radar` and `/api/cron/maintenance`.

## 3. Vercel

See **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** for the full checklist.

1. Import repo from GitHub.
2. Root directory: repo root (root `vercel.json` handles `web/` build).
3. Add env vars from `web/.env.example`.
4. Deploy. Set `NEXT_PUBLIC_APP_URL` to the production URL and redeploy.

Required vars:

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_*` | From § 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `NEXT_PUBLIC_APP_URL` | Production URL |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | [developer.adzuna.com](https://developer.adzuna.com/) |
| `ADZUNA_COUNTRY` | `ca`, `us`, `gb`, etc. |
| `OPENAI_API_KEY` | gpt-4o-mini scoring |
| `CRON_SECRET` | From § 2 |

Optional: `RESEND_API_KEY`, `EMAIL_FROM`, `TELEGRAM_BOT_TOKEN`.

Do **not** set `ENGINE_MODE` on Vercel (live searches by default).

## 4. Resend (optional)

For run-complete and digest emails — not required for OAuth sign-in.

1. [resend.com](https://resend.com) → API key → `RESEND_API_KEY`.
2. `EMAIL_FROM=RadarAI <onboarding@resend.dev>` works for testing.

## 5. Smoke test

1. `https://<app>/sign-up` → Google or GitHub → lands on `/dashboard/searches`.
2. Upload resume, set keywords → **Save and search** (first time) or **Search now**.
3. Results with live Adzuna jobs in ~60–90s.

## Free-tier limits (enforced in code)

| Limit | Value |
|---|---|
| Free searches / day | 3 per user (UTC) |
| Resume upload | 2 MB PDF |
| Vercel function timeout | 300s |
| Resend daily cap | 90 (configurable) |

See [RUNBOOK.md](RUNBOOK.md) for ops.

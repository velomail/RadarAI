# Deploy to Vercel

## 1. Import project

1. Push repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import.
3. **Root Directory:** repo root (not `web/` — root `vercel.json` builds `web/`).
4. Framework: Next.js (auto-detected).

## 2. Environment variables

Add every variable from `web/.env.example` for **Production** and **Preview**.

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (server only) |
| `NEXT_PUBLIC_APP_URL` | `https://web-ashen-sigma-71.vercel.app` |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Adzuna developer portal |
| `ADZUNA_COUNTRY` | `ca` |
| `OPENAI_API_KEY` | OpenAI |
| `CRON_SECRET` | random hex |
| `RESEND_API_KEY` | optional |
| `EMAIL_FROM` | optional — notifications, not auth |

Do **not** set `ENGINE_MODE` on Vercel (live by default).

Sync from local: `npm run saas:env:push` then `npm run saas:deploy:only`.

## 3. Supabase Auth

See **[AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)**:

- Site URL = production URL
- Redirect = `https://<app>/auth/callback**`
- Google + GitHub providers enabled

## 4. Database (one-time)

Run all SQL in `db/migrations/` and create Storage bucket `resumes` (private).

## 5. Deploy

```bash
npm run saas:deploy:only
```

Or push to Git for auto-deploy.

## 6. Post-deploy checks

1. `https://<app>/sign-up` → Google/GitHub → `/dashboard/searches`
2. Upload resume → **Search now** → live results ~60–90s
3. **Settings → Cron Jobs** shows `/api/cron/radar` and `/api/cron/maintenance`

## Local build check

```bash
npm run saas:build
```

# Deploy to Vercel

## 1. Import project

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import the repo.
3. **Root Directory:** `web` (required).
4. Framework: Next.js (auto-detected).
5. Do **not** set a custom Output Directory in the UI — leave default; `vercel.json` only sets crons + function duration.

## 2. Environment variables

In **Project → Settings → Environment Variables**, add every variable from `web/.env.example` (or copy from your local `web/.env.local`).

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT `eyJ...` **anon** key from Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` (update after first deploy) |
| `RAPIDAPI_KEY` | your RapidAPI key |
| `LINKEDIN_RAPIDAPI_HOST` | `linkedin-job-search-api.p.rapidapi.com` |
| `LINKEDIN_RAPIDAPI_KEY` | usually same as `RAPIDAPI_KEY` |
| `LINKEDIN_PRIMARY_PATH` | `/active-jb-24h` |
| `LINKEDIN_WIDEN_PATH` | `/active-jb-7d` |
| `LINKEDIN_QUERY_PARAM` | `title_filter` |
| `LINKEDIN_LOCATION_PARAM` | `location_filter` |
| `OPENAI_API_KEY` | your OpenAI key |
| `CRON_SECRET` | same random hex as local |
| `RESEND_API_KEY` | your Resend key |
| `EMAIL_FROM` | `RadarAI <onboarding@resend.dev>` or your verified domain |
| `RESEND_DAILY_HARD_CAP` | `90` |
| `ENGINE_MODE` | `mock` for MVP (no RapidAPI/OpenAI) — see [ENGINE_MODE.md](ENGINE_MODE.md) |

Apply to **Production** and **Preview**.

Optional: `TELEGRAM_BOT_TOKEN`, `RADAR_TIMEZONE`, `RADAR_WINDOW_MINUTES`.

## 3. Supabase Auth URLs (required for sign-in)

In Supabase → **Authentication → URL configuration**:

- **Site URL:** `https://<your-project>.vercel.app`
- **Redirect URLs:** add  
  `https://<your-project>.vercel.app/auth/callback`  
  `http://localhost:3000/auth/callback` (for local dev)

## 4. Database (one-time)

If not done yet, run all SQL files in `db/migrations/` in the Supabase SQL editor, and create Storage bucket `resumes` (private).

## 5. Deploy

Click **Deploy**, or from CLI:

```bash
cd web
npx vercel --prod
```

After the first deploy, set `NEXT_PUBLIC_APP_URL` to the real Vercel URL and **Redeploy**.

## 6. Post-deploy checks

1. Open `https://<app>/demo` → upload resume → jobs appear in ~60–90s.
2. `https://<app>/sign-up` → magic link works.
3. **Settings → Cron Jobs** shows `/api/cron/radar` and `/api/cron/maintenance`.
4. Test cron (optional):
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" https://<app>/api/cron/radar
   ```

## Local build sanity check (same as Vercel build)

```bash
npm run saas:build
```

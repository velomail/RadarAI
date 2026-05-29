# Connect services — RadarAI setup guide

**Default for demos and MVP:** keep **`ENGINE_MODE=mock`** on Vercel. The app runs end-to-end with fixture jobs — no database migrations beyond the basics, no paid APIs, and no verified email domain required for the public `/demo` flow.

Use this guide when you are ready to connect real infrastructure.

Production URL (current): **https://rapidai-velomails-projects.vercel.app**

> **Note:** Short names like `rapidai.vercel.app` are globally unique on Vercel and may already be taken by another account. This project uses the team production domain above. Add a custom domain (e.g. `app.yourdomain.com`) in Vercel → Project → Domains if you want a shorter URL.

---

## Quick reference

| Service | Required for `/demo`? | Required for sign-up + dashboard? |
|---------|----------------------|-----------------------------------|
| Supabase (DB + auth + storage) | Yes | Yes |
| Vercel (hosting) | Yes | Yes |
| `ENGINE_MODE=mock` | Recommended | Recommended for pitches |
| Resend + verified domain | No | Yes (any-user magic links) |
| RapidAPI (JSearch + LinkedIn) | No | Only in **live** engine mode |
| OpenAI | No | Only in **live** engine mode |

---

## 1. Database — Supabase

### Create project

1. [supabase.com](https://supabase.com) → New project.
2. Note **Project URL**, **anon key**, and **service_role key** (Settings → API).

### Run migrations

In **SQL Editor**, run every file in `db/migrations/` **in order**:

```
0001_initial.sql
0002_rls.sql
0003_storage.sql
0004_pruning_and_budget.sql
0005_manual_schedule_default.sql
0006_search_focus.sql
```

### Storage bucket

1. Storage → New bucket → name **`resumes`**, **Private**.
2. Policies are created by `0003_storage.sql`.

### Env vars (local + Vercel)

In `web/.env.local` and Vercel → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Auth redirect URLs

Supabase → **Authentication → URL configuration**:

| Field | Value |
|-------|--------|
| Site URL | `https://rapidai-velomails-projects.vercel.app` (or your domain) |
| Redirect URLs | `https://rapidai-velomails-projects.vercel.app/auth/callback**` |
| | `http://localhost:3000/auth/callback**` |

---

## 2. Hosting — Vercel

### Link and deploy

From repo root:

```bash
cd web
npx vercel login          # once
npx vercel link --yes     # once
```

Deploy code only (does not overwrite Vercel env):

```bash
npm run saas:deploy:only
```

Sync all env from `web/.env.local` to production:

```bash
npm run saas:deploy
```

**Important:** set `NEXT_PUBLIC_APP_URL` to your **production** URL before running full env sync — not `http://localhost:3000`.

```env
NEXT_PUBLIC_APP_URL=https://rapidai-velomails-projects.vercel.app
```

Redeploy after changing any `NEXT_PUBLIC_*` variable.

---

## 3. Demo mode (recommended default)

Mock engine = in-house fixture jobs + heuristic scoring. No external job or AI APIs.

### Local

In `web/.env.local`:

```env
ENGINE_MODE=mock
```

Restart dev: `npm run saas:dev`

### Vercel production

```bash
npm run saas:engine:mock
npm run saas:deploy:only
```

Or manually:

```bash
cd web
npx vercel env add ENGINE_MODE production --yes --force --value mock
npx vercel deploy --prod --yes
```

Verify: Vercel → Project → Settings → Environment Variables → `ENGINE_MODE` = `mock`.

See [ENGINE_MODE.md](ENGINE_MODE.md) for switching to live APIs.

---

## 4. Email — Resend + Supabase SMTP

Required for **sign-up / magic links** for any email address. Not required for `/demo`.

### Problem with test sender

While Supabase SMTP uses `onboarding@resend.dev`, Resend only delivers to **your Resend account email**.

### Fix — verify a domain (~15 min + DNS)

1. [resend.com/domains](https://resend.com/domains) → Add domain (e.g. `mail.yourdomain.com`).
2. Add DNS records (SPF, DKIM) until status is **Verified**.

### Supabase SMTP

Authentication → [SMTP](https://supabase.com/dashboard/project/_/auth/smtp):

| Field | Value |
|-------|--------|
| Sender email | `auth@yourdomain.com` |
| Sender name | `RadarAI` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_...`) |

### App env

```env
RESEND_API_KEY=re_...
EMAIL_FROM=RadarAI <auth@yourdomain.com>
RESEND_DAILY_HARD_CAP=90
```

Upload to Vercel, then redeploy.

### Test

```bash
cd web
node scripts/test-resend.mjs someone@example.com
```

Full checklist: [AUTH_EMAIL_SETUP.md](AUTH_EMAIL_SETUP.md)

---

## 5. Job APIs — RapidAPI (live mode only)

Skip entirely while `ENGINE_MODE=mock`.

### JSearch (30+ job boards)

1. [JSearch on RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) → Subscribe → copy API key.

### LinkedIn jobs (optional)

1. [LinkedIn Job Search API](https://rapidapi.com/fantastic-jobs-fantastic-jobs-default/api/linkedin-job-search-api) — often same key.

### Env vars

```env
RAPIDAPI_KEY=
LINKEDIN_RAPIDAPI_HOST=linkedin-job-search-api.p.rapidapi.com
LINKEDIN_RAPIDAPI_KEY=          # usually same as RAPIDAPI_KEY
LINKEDIN_PRIMARY_PATH=/active-jb-24h
LINKEDIN_WIDEN_PATH=/active-jb-7d
LINKEDIN_QUERY_PARAM=title_filter
LINKEDIN_LOCATION_PARAM=location_filter
```

Watch for **429 rate limits** on free tiers. Mock mode avoids this during demos.

---

## 6. AI scoring — OpenAI (live mode only)

Skip while `ENGINE_MODE=mock`.

1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create key.
2. Set env:

```env
OPENAI_API_KEY=sk-...
```

Default model: `gpt-4o-mini` (configured in engine code).

---

## 7. Cron secret (optional)

Vercel cron hits `/api/cron/radar` and `/api/cron/maintenance`:

```env
CRON_SECRET=<random-hex>
```

Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Manual test:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://rapidai-velomails-projects.vercel.app/api/cron/radar
```

Free tier uses **manual** runs only; cron is for future Pro digests.

---

## 8. Switch from demo to live data

When all keys above are set:

```bash
npm run saas:engine:live
npm run saas:deploy:only
```

This removes `ENGINE_MODE=mock` from Vercel. The app then calls RapidAPI + OpenAI + Resend on each run.

---

## 9. Post-setup checklist

- [ ] All migrations applied in Supabase
- [ ] `resumes` storage bucket (private)
- [ ] `NEXT_PUBLIC_APP_URL` = production URL on Vercel
- [ ] Supabase redirect URLs include `/auth/callback`
- [ ] `ENGINE_MODE=mock` for investor demo **or** live keys for real data
- [ ] Resend domain verified if testing sign-up
- [ ] Smoke test: `/demo` → upload PDF → results in ~15–30s (mock) or ~60–90s (live)
- [ ] Smoke test: `/sign-up` with a non-operator email (after domain verification)

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [PROVISIONING.md](PROVISIONING.md) | Detailed first-time provisioning |
| [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) | Vercel import settings |
| [ENGINE_MODE.md](ENGINE_MODE.md) | Mock vs live commands |
| [AUTH_EMAIL_SETUP.md](AUTH_EMAIL_SETUP.md) | Magic link email for all users |
| [LOCAL_DEV.md](LOCAL_DEV.md) | Local development |

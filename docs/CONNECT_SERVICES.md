# Connect services — RadarAI setup guide

Fastest path to a working production app. Production URL: **https://web-ashen-sigma-71.vercel.app**

Full OAuth steps: **[AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)**

---

## Quick reference

| Service | Required? |
|---------|-----------|
| Supabase (DB + auth + storage) | Yes |
| Vercel (hosting) | Yes |
| Google + GitHub OAuth (Supabase) | Yes — sign-in |
| Adzuna (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`) | Yes for live searches |
| OpenAI (`OPENAI_API_KEY`) | Yes for live scoring |
| Resend | Optional — notification emails only |
| `ENGINE_MODE=mock` | Local dev only — **do not set on Vercel** |

---

## 1. Supabase

1. Create project at [supabase.com](https://supabase.com).
2. Run all files in `db/migrations/` in order (including `0007_user_usage.sql`).
3. Storage → bucket **`resumes`** (private).
4. Auth → enable **Google** and **GitHub** — see [AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md).
5. Auth → URL configuration:
   - Site URL: `https://web-ashen-sigma-71.vercel.app`
   - Redirect: `https://web-ashen-sigma-71.vercel.app/auth/callback**`

Env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 2. Vercel

Repo deploys from **root** (root `vercel.json` builds `web/`).

```bash
npm run saas:deploy:only
```

Required production env vars:

```env
NEXT_PUBLIC_APP_URL=https://web-ashen-sigma-71.vercel.app
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADZUNA_COUNTRY=ca
OPENAI_API_KEY=
CRON_SECRET=
```

Optional: `RESEND_API_KEY`, `EMAIL_FROM`, `TELEGRAM_BOT_TOKEN`.

---

## 3. Adzuna

1. Register at [developer.adzuna.com](https://developer.adzuna.com/).
2. Add `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY=ca` to Vercel.

---

## 4. OpenAI

1. API key from [platform.openai.com](https://platform.openai.com/).
2. Default model: `gpt-4o-mini` (override with `OPENAI_MODEL`).

---

## 5. Local dev

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

For UI-only testing without APIs: `ENGINE_MODE=mock` in `.env.local`.

See [LOCAL_DEV.md](LOCAL_DEV.md).

---

## Launch checklist

- [ ] All migrations applied
- [ ] Google + GitHub OAuth configured
- [ ] Adzuna + OpenAI keys on Vercel
- [ ] `ENGINE_MODE` **not** set on Vercel
- [ ] Smoke test: sign up → `/dashboard/searches` → **Search now** → real results

See [MVP_COMPLETE.md](MVP_COMPLETE.md) and [PRODUCTHUNT_LAUNCH.md](PRODUCTHUNT_LAUNCH.md).

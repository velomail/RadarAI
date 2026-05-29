# MVP completion checklist

Production URL: **https://web-ashen-sigma-71.vercel.app**

Auth: **Google + GitHub OAuth** — [AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)

---

## 1. Database — daily limits

Run `0007_user_usage.sql` in Supabase SQL editor if not already applied.

---

## 2. OAuth providers

Follow [AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md):

1. Supabase Site URL + Redirect URLs
2. Google OAuth → Supabase Google provider
3. GitHub OAuth → Supabase GitHub provider
4. Allow new users to sign up: ON

Test: incognito → `/sign-up` → Google or GitHub → `/dashboard/searches`.

---

## 3. Deploy latest code

```powershell
npm run saas:deploy:only
```

Or push to Git for auto-deploy.

---

## 4. Vercel env — live searches

Confirm Production has:

- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY=ca`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://web-ashen-sigma-71.vercel.app`

Do **not** set `ENGINE_MODE` on Vercel.

---

## 5. Production smoke test

1. Sign up with Google or GitHub
2. Upload resume + keywords → **Save and search**
3. Results with real Adzuna jobs + AI summaries
4. Second search works; daily meter shows usage

---

## Progress tracker

| Step | Status |
|------|--------|
| DB migration `0007` | ☐ |
| Google + GitHub OAuth | ☐ |
| Deploy latest code | ☐ |
| Vercel env (Adzuna + OpenAI) | ☐ |
| Smoke test | ☐ |

See [PRODUCTHUNT_LAUNCH.md](PRODUCTHUNT_LAUNCH.md).

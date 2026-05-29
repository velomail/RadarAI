# MVP completion checklist (your steps)

Production URL: **https://web-ashen-sigma-71.vercel.app**

Auth is **Google + GitHub OAuth** — no email domain required. Full setup: **[AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)**

---

## 1. Database — daily limits ✅ (you did this)

Migration `0007_user_usage.sql` applied.

---

## 2. OAuth providers (required for public launch)

Follow **[AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md)**:

1. Supabase **Site URL** + **Redirect URLs**
2. **Google** OAuth app → Supabase Google provider
3. **GitHub** OAuth app → Supabase GitHub provider
4. **Allow new users to sign up** ON

Test: incognito → `/sign-up` → Google or GitHub → onboarding.

---

## 3. Deploy latest code (required)

Production may still show old UI (demo link, magic-link copy). Deploy:

```powershell
cd c:\Users\jesse\OneDrive\Desktop\n8n-job-funnel\web
npx vercel deploy --prod --yes --force --archive=tgz
```

Wait for **Ready**. Verify `/sign-up` shows **Continue with Google / GitHub**.

---

## 4. Vercel env — live job searches

Confirm **Production** has:

- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY=ca`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://web-ashen-sigma-71.vercel.app`

Do **not** set `ENGINE_MODE` on Vercel (live by default).

---

## 5. Production smoke test

1. Sign up with Google or GitHub
2. Onboarding → PDF resume
3. **Searches** → **Run now**
4. Results with real jobs + AI summaries

---

## Progress tracker

| Step | Status |
|------|--------|
| DB migration `0007` | ✅ |
| Google + GitHub OAuth in Supabase | ⏳ You |
| Deploy new code | ⏳ |
| Vercel env (Adzuna) | ⏳ Verify |
| Smoke test | ⏳ After deploy |

See also: [PRODUCTHUNT_LAUNCH.md](PRODUCTHUNT_LAUNCH.md)

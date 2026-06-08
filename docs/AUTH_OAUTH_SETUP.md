# Auth — Google & GitHub OAuth (no email domain required)

RadarAI uses **Supabase Auth** with **Google** and **GitHub** sign-in. No magic links, no Resend domain, no custom email sender needed for auth.

Production URL: **https://web-ashen-sigma-71.vercel.app**

Supabase project: `keehrclncfqeetqynzts`

---

## 1. Supabase URL configuration

[Authentication → URL configuration](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/url-configuration)

| Setting | Value |
|---------|--------|
| **Site URL** | `https://web-ashen-sigma-71.vercel.app` (production) |
| **Redirect URLs** | `https://web-ashen-sigma-71.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

### Local development (fixes “redirects to Vercel” + PKCE errors)

Supabase sends users to **Site URL** when `redirectTo` is not on the allow list. For local OAuth:

1. Add **`http://localhost:3000/auth/callback`** to **Redirect URLs** (exact path, no trailing slash).
2. **While developing locally**, set **Site URL** to **`http://localhost:3000`** (temporarily).
3. Run the app on **port 3000** only (`npm run dev` from `web/`).
4. Set **`NEXT_PUBLIC_APP_URL=http://localhost:3000`** in `web/.env.local`.
5. Before shipping, restore **Site URL** to `https://web-ashen-sigma-71.vercel.app`.

If you skip step 2, OAuth often completes on production Vercel while the PKCE cookie was set on localhost — that produces the “code verifier not found” error.

No trailing slash on Site URL.

---

## 2. Allow sign-ups

[Authentication → Settings](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/settings/auth)

- **Allow new users to sign up** → ON

You can disable the **Email** provider if you only want OAuth (optional).

---

## 3. Google OAuth

### Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com/) → create or select a project
2. **APIs & Services → OAuth consent screen** → External → fill app name (RadarAI), support email
3. **Credentials → Create credentials → OAuth client ID**
   - Type: **Web application**
   - **Authorized JavaScript origins:**
     - `https://web-ashen-sigma-71.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs** (Supabase callback — copy from Supabase):
     - `https://keehrclncfqeetqynzts.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client secret**

### Supabase

[Authentication → Providers → Google](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/providers?provider=Google)

- Enable Google
- Paste Client ID and Client secret
- Save

---

## 4. GitHub OAuth

### GitHub

1. [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps → New OAuth App**
2. **Application name:** RadarAI
3. **Homepage URL:** `https://web-ashen-sigma-71.vercel.app`
4. **Authorization callback URL:**
   - `https://keehrclncfqeetqynzts.supabase.co/auth/v1/callback`
5. Register → copy **Client ID** → generate **Client secret**

### Supabase

[Authentication → Providers → GitHub](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/providers?provider=GitHub)

- Enable GitHub
- Paste Client ID and Client secret
- Save

---

## 5. Test

1. Open `https://web-ashen-sigma-71.vercel.app/sign-up` (incognito)
2. Click **Continue with Google** or **Continue with GitHub**
3. After provider login → land on **Onboarding** (new user) or **Dashboard** (returning user)

Local: `http://localhost:3000/sign-up` with the same providers (add localhost to Google origins).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Redirect URI mismatch (Google) | Redirect URI must be exactly `https://keehrclncfqeetqynzts.supabase.co/auth/v1/callback` |
| Redirect URI mismatch (GitHub) | Same Supabase callback URL in GitHub OAuth app |
| Back to sign-in with “redirect” error | Add `https://web-ashen-sigma-71.vercel.app/auth/callback**` to Supabase Redirect URLs |
| Provider not enabled | Enable Google/GitHub in Supabase Providers |
| Sign-ups disabled | Allow new users in Supabase Auth settings |

---

## Resend / email

**Not required for sign-in.** Resend is only for optional future digest emails (`RESEND_API_KEY`, `EMAIL_FROM`). Auth no longer sends magic links.

You can **disable Custom SMTP** in Supabase if it was configured for Resend magic links.

---

## Local dev

Same Supabase project works for localhost. Ensure Google OAuth client includes `http://localhost:3000` in authorized origins.

`NEXT_PUBLIC_APP_URL=http://localhost:3000` in `web/.env.local`.

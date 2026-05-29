# Auth email — any user can sign up

Magic links are sent by **Supabase** through **Resend SMTP**.  
While the sender is `onboarding@resend.dev`, Resend only delivers to **your** Resend account email. Everyone else gets errors.

To let **any** visitor sign up with their own Gmail/work email, verify a **sending domain** in Resend.

## Checklist (production)

### 1. Domain in Resend (~15 min + DNS propagation)

1. [resend.com/domains](https://resend.com/domains) → **Add domain**  
   Use a subdomain if you like: `mail.yourdomain.com` or root `yourdomain.com`.
2. Add the DNS records Resend shows (SPF, DKIM; often at Cloudflare/Namecheap).
3. Wait until status is **Verified**.

### 2. Supabase SMTP

[Authentication → SMTP](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/smtp)

| Field | Example |
|--------|---------|
| Sender email | `auth@yourdomain.com` or `hello@mail.yourdomain.com` |
| Sender name | `RadarAI` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_…`) |

### 3. App env (digests + branding)

In `web/.env.local` and Vercel production:

```env
EMAIL_FROM=RadarAI <auth@yourdomain.com>
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://web-ashen-sigma-71.vercel.app
```

Redeploy after changing `NEXT_PUBLIC_*`.

### 4. Supabase auth URLs (all domains you use)

[URL Configuration](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/url-configuration)

- **Site URL:** `https://web-ashen-sigma-71.vercel.app` (or `http://localhost:3000` for local dev).  
  Do **not** put `/auth/callback` in Site URL — the app redirects `/?code=...` to `/auth/callback` automatically if Supabase sends the code to the home page.
- **Redirect URLs** — add **each** line (wildcards):

```
http://localhost:3000/auth/callback**
https://web-ashen-sigma-71.vercel.app/auth/callback**
```

Use the **same hostname** for sign-up and when you click the email link. If you sign up on `web-ashen-sigma-71.vercel.app` but the link opens `localhost`, sign-in will fail (PKCE).

**After clicking the confirmation link:** you should land on `/onboarding` (first search) or `/dashboard`. If you see an error on `/sign-in`, request a new link and open it in the **same browser** (not a different device or Gmail preview).

### 5. Enable sign-ups

- [Providers → Email](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/providers) — Email ON  
- [Settings](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/settings/auth) — **Allow new users to sign up** ON

### 6. Test

1. Sign out. Open `/sign-up` in a private window.  
2. Use a **different** email (not your Resend login).  
3. Open the magic link in the **same browser**.

---

## Optional: custom domain on Vercel

Vercel → Project **web** → Domains → add `app.yourdomain.com`.  
Then set `NEXT_PUBLIC_APP_URL=https://app.yourdomain.com` and add that URL to Supabase redirect list.

---

## Local dev vs production

| Environment | `NEXT_PUBLIC_APP_URL` | Resend sender |
|-------------|------------------------|---------------|
| Local | `http://localhost:3000` | Verified domain works for any recipient |
| Production | Your Vercel URL or custom domain | Same |

You do **not** need a separate Resend project for local vs prod — one verified domain is enough.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Only `jesse03hiles@gmail.com` works | Still on `onboarding@resend.dev` — verify domain |
| `Error sending confirmation email` | Check Supabase Auth logs + [Resend → Emails](https://resend.com/emails) |
| PKCE / code verifier error | Request a new link; open in same browser (see `DEBUG_VERCEL.md`) |

Test Resend API key locally:

```bash
cd web
node scripts/test-resend.mjs someone@example.com
```

After domain verification, that command should succeed for any address.

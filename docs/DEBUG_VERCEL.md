# Debugging production (Vercel CLI)

Logged-in CLI access is enough to inspect the linked `web` project — no separate Vercel MCP is required.

## Prerequisites

```bash
cd web
npx vercel login    # once
npx vercel link     # once, if .vercel/project.json is missing
```

## Useful commands

| Task | Command |
|---|---|
| Who am I? | `npx vercel whoami` |
| Production URL | `npx vercel inspect rapidai-velomails-projects.vercel.app` |
| Live logs | `npx vercel logs rapidai-velomails-projects.vercel.app` |
| Env vars (names only) | `npx vercel env ls production` |
| Pull env to file | `npx vercel env pull .env.vercel.production` |
| Redeploy | `npx vercel deploy --prod --yes` |

From repo root you can also run `npm run saas:logs` and `npm run saas:deploy`.

## Common production errors

### `Storage upload failed: Bucket not found`

The Supabase **`resumes`** bucket was never created. Fix in Supabase (not Vercel):

1. **Storage → New bucket** → name `resumes`, public **OFF**
2. SQL editor: run `db/migrations/0003_storage.sql` if you have not already

Then retry `/demo`.

### Auth / magic link broken

1. **Site URL** (Supabase → Authentication → URL Configuration): set to `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` locally, production URL on Vercel).
2. **Redirect URLs** — add both:
   - `http://localhost:3000/auth/callback**`
   - `https://<your-production-app>/auth/callback**`
   (The `**` wildcard covers `?next=/dashboard` query params.)
3. Local dev: `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `web/.env.local`, then restart `npm run dev`.
4. After clicking the email link, you should land on `/dashboard` or `/onboarding` **still signed in**. If you bounce back to `/sign-in`, the callback cookies were not saved — redeploy with the latest `app/auth/callback/route.ts` fix.
5. Sign-in page now shows Supabase error text when something fails (rate limit, redirect not allowed, etc.).

### Cron 401

`CRON_SECRET` on Vercel must match what `/api/cron/*` routes expect. Regenerate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and update Vercel, then redeploy.

## Slow env upload on Windows

`vercel env add` can take minutes per variable. Prefer:

- **Vercel dashboard** → Project → Settings → Environment Variables → paste from `web/.env.local`
- Then `npx vercel deploy --prod --yes` only (skip `npm run saas:deploy` env loop)

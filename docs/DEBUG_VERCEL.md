# Debugging production (Vercel CLI)

## Prerequisites

```bash
cd web
npx vercel login
npx vercel link     # if .vercel/project.json is missing
```

## Useful commands

| Task | Command |
|---|---|
| Who am I? | `npx vercel whoami` |
| Production URL | `npx vercel inspect web-ashen-sigma-71.vercel.app` |
| Live logs | `npx vercel logs web-ashen-sigma-71.vercel.app` |
| Env vars (names) | `npx vercel env ls production` |
| Redeploy | `npm run saas:deploy:only` |

## Common production errors

### `Storage upload failed: Bucket not found`

Create Supabase Storage bucket **`resumes`** (private). Run `db/migrations/0003_storage.sql`.

Then retry resume upload on `/dashboard/searches`.

### OAuth redirect broken

1. Supabase → Auth → URL Configuration:
   - Site URL = `NEXT_PUBLIC_APP_URL`
   - Redirect = `https://<app>/auth/callback**`
2. Google/GitHub OAuth apps must list Supabase callback URL — see [AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md).
3. After sign-in, land on `/dashboard/searches` still authenticated.

### Cron 401

Set `CRON_SECRET` on Vercel and redeploy.

### Search stays pending

Check Vercel runtime logs for `runEngine failed:` — usually missing Adzuna or OpenAI keys.

## Slow env upload on Windows

Prefer Vercel dashboard → paste from `web/.env.local`, then `npm run saas:deploy:only`.

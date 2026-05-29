# Security Audit (May 2026)

## Scope

- Repo content scan for leaked credentials and API keys.
- Env and build-artifact hygiene review.
- Developer docs review for secret-handling guidance.

## Findings

### High: Real secrets present in local env file

- File: `web/.env.local`
- Includes live values for:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `ADZUNA_APP_KEY`
  - `OPENAI_API_KEY`
  - `RESEND_API_KEY`
  - `TELEGRAM_BOT_TOKEN`

Status:
- `web/.env.local` is ignored by `.gitignore` and should not be committed.
- Risk still exists if the file is copied/shared or exposed through logs/screenshots.

Required action:
1. Rotate all keys listed above.
2. Update local `web/.env.local` with rotated values.
3. Update Vercel project environment variables with rotated values.

### Medium: Build output can contain sensitive inlined data

- `web/.next/` includes compiled server bundles that may reference env-dependent code.
- `web/.next/` is correctly gitignored.

Required action:
- Keep `web/.next/` out of archives and support bundles.

### Low: Docs include key names and placeholder examples

- Several docs reference env variable names and sample token formats (expected).
- No actionable change required beyond keeping examples placeholder-only.

## Controls Verified

- `.gitignore` excludes:
  - `.env`, `.env.local`, `web/.env.local`
  - `web/.next`, `web/.vercel`, `web/node_modules`
- App code reads keys from env vars, not hardcoded literals.

## Hardening Checklist

- [ ] Rotate Supabase anon and service role keys.
- [ ] Rotate OpenAI API key.
- [ ] Rotate Adzuna app key.
- [ ] Rotate Resend API key.
- [ ] Rotate Telegram bot token.
- [ ] Redeploy Vercel after variable updates.
- [ ] Re-run this audit scan before each release.

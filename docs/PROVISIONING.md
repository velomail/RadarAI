# Provisioning Runbook — Job Radar SaaS v1

Everything you need to spin up cloud infra. Estimated time: ~20 min.

> **Free-tier first.** Vercel Hobby, Supabase Free, Resend Free. The only
> recurring cost is your JSearch + Bebity RapidAPI subscriptions (~$20/mo
> combined) plus pay-as-you-go OpenAI usage (~$0.30/day for ~30 users).
> See § 8 for the hard limits the code enforces.

## 0. Buy a domain (optional)

Skip this if you're happy with `<your-project>.vercel.app`. If you want a
real domain, grab one at Cloudflare Registrar / Porkbun / Namecheap (~$10/yr)
and plan to point `app.<your-domain>` at Vercel later in § 3.

## 1. Supabase project (DB + Storage + Auth)

1. Sign up at https://supabase.com, create a new project (Free plan).
2. Wait for it to provision (~2 min). Copy from Settings → API:
   - **Project URL** — `https://<ref>.supabase.co`
   - **anon public key** — used in the browser
   - **service_role key** — server-only, never ship to the browser
3. In the SQL editor, paste and run each migration in order:
   - `db/migrations/0001_initial.sql`
   - `db/migrations/0002_rls.sql`
   - `db/migrations/0003_storage.sql`
   - `db/migrations/0004_pruning_and_budget.sql`
4. **Required:** In Storage, create a bucket named **`resumes`** (public: OFF,
   file size limit ~5MB). Without this bucket, `/demo` and onboarding return
   `Bucket not found`. The migration in step 3 only adds policies — it does
   **not** create the bucket for you.
5. **Allow sign-up** (required for `/sign-up` and magic links):
   - [Authentication → Providers → Email](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/providers) — **Enable Email provider** ON
   - [Authentication → Settings](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/settings/auth) — **Allow new users to sign up** ON  
   If you see `Signups not allowed for otp`, one of these is off.

6. **Auth URLs** (Authentication → URL Configuration):
   - **Site URL:** your app origin (`http://localhost:3000` for local dev, production URL on Vercel).
   - **Redirect URLs:** add `http://localhost:3000/auth/callback**` and
     `https://<your-app>/auth/callback**` (wildcard covers `?next=...` on magic links).

## 2. Generate a CRON_SECRET

Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to
every scheduled function call when this env var is set. The
`/api/cron/radar` and `/api/cron/maintenance` routes reject anything else.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the output — you'll paste it into Vercel in § 3.

## 3. Vercel project

See **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** for the full deploy checklist.

1. Push this repo to GitHub.
2. Sign up at https://vercel.com and click **Add New → Project → Import** on your repo.
3. Set the **Root Directory** to `web/`. Framework should auto-detect as Next.js.
4. Add Environment Variables (Production + Preview) — all required unless noted:

   | Var | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from § 1.2 | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from § 1.2 | |
   | `SUPABASE_SERVICE_ROLE_KEY` | from § 1.2 | server-only |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` or `https://app.<your-domain>` | |
   | `CRON_SECRET` | from § 2 | |
   | `RAPIDAPI_KEY` | your JSearch key | |
   | `LINKEDIN_RAPIDAPI_HOST` | `linkedin-job-search-api.p.rapidapi.com` | |
   | `LINKEDIN_RAPIDAPI_KEY` | your Bebity key | usually same RapidAPI key |
   | `LINKEDIN_PRIMARY_PATH` | `/active-jb-24h` | default |
   | `LINKEDIN_WIDEN_PATH` | `/active-jb-7d` | default |
   | `OPENAI_API_KEY` | from platform.openai.com | |
   | `RESEND_API_KEY` | from § 4 | optional but daily digests are off without it |
   | `EMAIL_FROM` | `Radar <radar@<your-domain>>` or `Radar <onboarding@resend.dev>` | |
   | `RESEND_DAILY_HARD_CAP` | `90` | leaves headroom for Supabase auth emails |
   | `TELEGRAM_BOT_TOKEN` | your bot token | optional |

5. Click **Deploy**. First build is ~2 min.
6. (If using a custom domain) After deploy completes, in
   **Settings → Domains** add `app.<your-domain>`. Vercel will hand you a
   CNAME — paste it at your registrar.
7. Verify the two cron jobs are registered: **Settings → Cron Jobs** should
   list `/api/cron/radar` (daily 11:00 UTC) and `/api/cron/maintenance`
   (daily 08:00 UTC).

## 4. Resend (transactional email)

1. Sign up at https://resend.com (free tier = 3,000 emails/mo, 100/day).
2. Verify your sending domain (DKIM + SPF records at your registrar). Skip
   this if you're using the shared `onboarding@resend.dev` sender — fine
   for testing, not great for deliverability.
3. Create an API key → paste into Vercel as `RESEND_API_KEY` and redeploy
   (or use **Settings → Environment Variables → Redeploy**).

### 4b. Fix “email rate limit exceeded” on sign-in (recommended)

Supabase’s **built-in** auth mailer is very strict while you’re testing (often
~4 magic links per hour per email). Daily digests use Resend from the app;
**sign-in links still use Supabase** until you enable custom SMTP.

1. [Supabase → Authentication → SMTP](https://supabase.com/dashboard/project/keehrclncfqeetqynzts/auth/smtp)
2. Enable **Custom SMTP**
3. Use Resend:

   | Field | Value |
   |---|---|
   | Host | `smtp.resend.com` |
   | Port | `465` (SSL) or `587` (TLS) |
   | Username | `resend` |
   | Password | Your `RESEND_API_KEY` (same as Vercel) |
   | Sender email | `onboarding@resend.dev` or your verified domain |
   | Sender name | `Radar` |

4. Save, then request **one** new magic link (don’t spam the button).

**“Error sending confirmation email”** — almost always one of these:

| Cause | Fix |
|--------|-----|
| Wrong SMTP password | Password must be the full Resend API key (`re_…`), not your Supabase password. Username is `resend`. |
| `onboarding@resend.dev` sender | Resend **only delivers to the email on your Resend account** while using this test sender. Sign in with that same address, **or** verify a domain at [resend.com/domains](https://resend.com/domains) and set sender to e.g. `Radar <auth@yourdomain.com>`. |
| API key missing in app | Set `RESEND_API_KEY` in `web/.env.local` (separate from Supabase SMTP, but should be the same key). |

Check the real error: Supabase → **Logs** → filter **Auth**.

**Short-term:** wait ~1 hour, or open the **last** magic-link email you already
received — it may still work.

## 5. Existing accounts you already have

- **OpenAI** — same key you've been using. Set as `OPENAI_API_KEY` in Vercel.
- **RapidAPI / JSearch** — same key. Set as `RAPIDAPI_KEY`.
- **RapidAPI / Bebity LinkedIn** — same key. Set as `LINKEDIN_RAPIDAPI_KEY`
  with `LINKEDIN_RAPIDAPI_HOST=linkedin-job-search-api.p.rapidapi.com`.
- **Telegram bot** — same bot. Each user supplies their own chat id from
  app settings; no longer hardcoded.

## 6. Smoke test checklist

After everything is up:

1. Open `https://<your-project>.vercel.app/demo`, drop a resume PDF, click
   Run. You should be redirected to `/demo/runs/<id>` immediately and see
   "Scoring jobs..." while the engine runs in the background. Within
   60–90s the results should render.
2. Sign up at `/sign-up` with your real email → click the magic link.
3. Onboarding wizard → upload resume → create a profile with cron
   `0 7 * * *` and your Telegram chat id (optional).
4. Click "Run my radar now". Within ~60s you get a Telegram message and an
   email digest.
5. Vercel → Deployments → Runtime Logs: should show the engine progressing
   with no errors.
6. Manually trigger the daily cron to make sure it's wired:
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-app>/api/cron/radar
   ```
   Response should list `queued_run_ids`.

## 7. Monthly cost estimate

| Item | Cost |
|---|---|
| Domain (optional) | ~$1/mo amortized |
| Vercel Hobby | $0 (300s function timeout, 1M function invocations, 100GB-hrs of duration, 5 cron jobs, daily-only cadence) |
| Supabase Free | $0 (500MB DB + 1GB storage + 50k MAU) |
| Resend Free | $0 (cap is 100 emails/day, ~3k/mo) |
| OpenAI gpt-4o-mini | ~$0.30/day at 30 users × 1 run/day, scoring ~30 jobs each |
| JSearch BASIC | $10/mo (200 req/mo) — scale up to PRO ($25) at >300 users |
| Bebity LinkedIn BASIC | ~$10/mo |
| **Total** | **~$20/mo at ~30 active free-tier users** |

## 8. Free-tier guardrails the code enforces

| Limit | Enforced by | Where |
|---|---|---|
| Resume PDF ≤ 2MB | Client `Dropzone` + server actions | `web/components/resume/Dropzone.tsx`, `web/app/demo/actions.ts`, `web/app/(app)/onboarding/actions.ts` |
| Vercel function ≤ 300s | Fluid Compute default; engine runs typically 20–60s | `web/lib/engine/run-engine.ts` |
| Supabase DB ≤ 500MB | Nightly prune deletes runs/jobs >30 days, seen_jobs >14 days, email_budget >30 days | `db/migrations/0004_pruning_and_budget.sql`, `web/app/api/cron/maintenance/route.ts` |
| Supabase Storage ≤ 1GB | 2MB upload cap + nightly demo cleanup of resumes >24h | `web/app/api/cron/maintenance/route.ts` |
| Resend ≤ 100/day | `RESEND_DAILY_HARD_CAP=90` checked per-send via the `email_budget` table + atomic RPC | `web/lib/engine/dispatch-notifications.ts`, `db/migrations/0004_pruning_and_budget.sql` |
| OpenAI burst | `OPENAI_SCORE_CONCURRENCY=8` per run | `web/lib/engine/score-with-openai.ts` |

## 9. When to escape the free tier

Halt and ask the user before any of these:

- A migration that adds a high-write logging table (every API call, every
  scrape result, etc.) — usually unnecessary; emit to `console.log` and
  consume from Vercel runtime logs.
- Storing raw HTML scrape dumps or full job descriptions wider than the
  6000-char truncation in `clean-jobs.ts`.
- Switching `runs.raw_counts` from compact array to verbose per-source
  dumps — current shape is ~200 bytes per run.
- Adding a real-time per-job alert path that sidesteps the daily cron.
  Every per-lead Resend send eats budget; if a user asks for instant
  alerts, route them via Telegram (no Resend cost).
- Adding sub-daily scheduling — Vercel Hobby cron is daily-only with
  ±59 min precision. For multiple runs per day you need Vercel Pro
  ($20/mo) or an external pinger (cron-job.org, free) hitting
  `/api/cron/radar` on whatever cadence you want.

## 10. Common gotchas

- **DNS propagation**: A and CNAME records can take 5–60 min. Use
  `dig app.<your-domain>` to verify before troubleshooting elsewhere.
- **Supabase RLS denials**: if API routes return 401s, check that
  `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env, not just the anon key.
- **Cron 401**: cron route returns 401 if `CRON_SECRET` isn't set or the
  caller didn't include `Authorization: Bearer <secret>`. Vercel attaches
  this automatically when the env var is set in the project.
- **OpenAI rate-limit hits**: lower `OPENAI_SCORE_CONCURRENCY` to 4 if you
  see HTTP 429 in the runtime logs.
- **Run stuck on "pending" forever**: engine errored before
  `markRunRunning` finished. Check Vercel runtime logs for the
  `runEngine failed:` line.
- **Function timeout**: an unusually heavy run can exceed 300s if RapidAPI
  is slow. Lower `OPENAI_SCORE_CONCURRENCY` or reduce the profile's query
  count.

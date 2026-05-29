# Auth & RLS audit checklist

Run before scaling traffic. Mark each item pass/fail with date.

## Auth / API

| Check | How | Pass |
|-------|-----|------|
| Session persistence | Sign in → refresh `/dashboard` → still signed in | |
| Protected pages | Unauthed `/dashboard`, `/onboarding` → `/sign-in?redirect=...` | |
| Protected API | `POST /api/profiles/{id}/run` without session → **401** | |
| Daily quota | Free user: 4th run same UTC day → **429** `daily_limit` | |
| Cross-user runs | User A cannot `GET /api/runs/{user_b_run_id}` → **403** | |
| Cron isolation | `GET /api/cron/radar` without `Authorization: Bearer $CRON_SECRET` → **401** | |
| Demo isolation | `GET /api/runs/{id}?demo=1` without matching `radar_demo_session` → **403** | |
| Guest limit | Second `/demo` submit without account → blocked (modal, no new run) | |
| Magic link host | Sign up on production URL; link opens same host → `/dashboard` or `/onboarding` | |

## RLS (`db/migrations/0002_rls.sql`)

| Table | Expected | Pass |
|-------|----------|------|
| `resumes`, `search_profiles`, `saved_jobs` | CRUD only `auth.uid() = user_id` | |
| `runs`, `jobs`, `seen_jobs` | Select owner only; writes via service_role | |
| `user_usage` | Select own row only (`0007_user_usage.sql`) | |
| Anonymous runs | Not readable via anon/authenticated client keys | |

## SQL spot-check (Supabase SQL editor, as authenticated user)

```sql
-- Should return 0 rows (other users' profiles)
select * from public.search_profiles where user_id != auth.uid();

-- Should return only your usage row
select * from public.user_usage where user_id != auth.uid();
```

## Intentional gaps

- `email_budget` has no RLS; only `service_role` RPCs (`increment_email_budget`, etc.).
- Pro plan gating awaits Stripe; `user_usage.plan` defaults to `free`.

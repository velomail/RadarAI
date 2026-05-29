# Auth & RLS audit checklist

Run before scaling traffic. Mark each item pass/fail with date.

## Auth / API

| Check | How | Pass |
|-------|-----|------|
| Session persistence | Sign in → refresh `/dashboard/searches` → still signed in | |
| Protected pages | Unauthed `/dashboard/searches` → `/sign-in?redirect=...` | |
| Protected API | `POST /api/profiles/{id}/run` without session → **401** | |
| Daily quota | Free user: 4th run same UTC day → **429** `daily_limit` | |
| Cross-user runs | User A cannot `GET /api/runs/{user_b_run_id}` → **403** | |
| Cron isolation | `GET /api/cron/radar` without `Authorization: Bearer $CRON_SECRET` → **401** | |
| OAuth redirect | Sign in on production URL → returns to `/dashboard/searches` | |

## RLS (`db/migrations/0002_rls.sql`)

| Table | Expected | Pass |
|-------|----------|------|
| `resumes`, `search_profiles`, `saved_jobs` | CRUD only `auth.uid() = user_id` | |
| `runs`, `jobs`, `seen_jobs` | Select owner only; writes via service_role | |
| `user_usage` | Select own row only (`0007_user_usage.sql`) | |

## SQL spot-check (Supabase SQL editor)

```sql
select * from public.search_profiles where user_id != auth.uid();
-- Should return 0 rows

select * from public.user_usage where user_id != auth.uid();
-- Should return 0 rows
```

## Intentional gaps

- `email_budget` has no RLS; only `service_role` RPCs touch it.
- Pro checkout not shipped; `user_usage.plan` defaults to `free`.

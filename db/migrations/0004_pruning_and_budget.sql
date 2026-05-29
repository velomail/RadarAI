-- 0004: data pruning + Resend daily budget tracking.
-- Keeps the Supabase Free Tier (500MB DB) and Resend Free Tier (100/day) safe.

-- ---------------------------------------------------------------
-- Daily email budget tally. Reset implicitly by storing per-day rows.
-- One row per UTC date. Insert-or-increment via RPC below.
-- ---------------------------------------------------------------
create table if not exists public.email_budget (
  budget_day date primary key,
  sent_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- Increment + return the new count atomically. n8n calls this via
-- PostgREST POST /rpc/increment_email_budget.
create or replace function public.increment_email_budget()
returns int
language plpgsql
as $$
declare
  today date := (current_timestamp at time zone 'utc')::date;
  new_count int;
begin
  insert into public.email_budget as eb (budget_day, sent_count)
  values (today, 1)
  on conflict (budget_day)
    do update set sent_count = eb.sent_count + 1, updated_at = now()
  returning sent_count into new_count;
  return new_count;
end;
$$;

-- Read-only view of today's count.
create or replace function public.current_email_budget()
returns int
language sql
stable
as $$
  select coalesce(
    (select sent_count from public.email_budget
       where budget_day = (current_timestamp at time zone 'utc')::date),
    0
  );
$$;

-- ---------------------------------------------------------------
-- Periodic pruning. Called nightly from n8n.
-- ---------------------------------------------------------------
create or replace function public.prune_old_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  pruned_jobs int;
  pruned_runs int;
  pruned_seen int;
  pruned_budget int;
begin
  -- Jobs + runs older than 30 days (runs cascades-deletes jobs).
  delete from public.runs
    where started_at < now() - interval '30 days'
    returning 1 into pruned_runs;
  get diagnostics pruned_runs = row_count;

  -- Orphan jobs (defensive — should be cascaded already).
  delete from public.jobs j
    where not exists (select 1 from public.runs r where r.id = j.run_id);
  get diagnostics pruned_jobs = row_count;

  -- seen_jobs older than 14 days (dedupe window).
  delete from public.seen_jobs
    where last_seen < now() - interval '14 days';
  get diagnostics pruned_seen = row_count;

  -- email_budget rows older than 30 days (we only need today's count + a small history).
  delete from public.email_budget
    where budget_day < (current_date - interval '30 days');
  get diagnostics pruned_budget = row_count;

  return jsonb_build_object(
    'pruned_runs', pruned_runs,
    'pruned_orphan_jobs', pruned_jobs,
    'pruned_seen', pruned_seen,
    'pruned_budget_rows', pruned_budget
  );
end;
$$;

-- Lock these RPCs to service_role only.
revoke all on function public.prune_old_data() from public;
revoke all on function public.increment_email_budget() from public;
revoke all on function public.current_email_budget() from public;
grant execute on function public.prune_old_data() to service_role;
grant execute on function public.increment_email_budget() to service_role;
grant execute on function public.current_email_budget() to service_role;

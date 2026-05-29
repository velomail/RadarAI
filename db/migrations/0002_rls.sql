-- Row Level Security for all app tables.
-- The service_role key (used by n8n + Next.js server) bypasses RLS automatically.
-- These policies restrict ANON and authenticated keys to a user's own data.

alter table public.resumes enable row level security;
alter table public.search_profiles enable row level security;
alter table public.runs enable row level security;
alter table public.jobs enable row level security;
alter table public.seen_jobs enable row level security;
alter table public.saved_jobs enable row level security;

-- resumes ----------------------------------------------------------------
create policy resumes_owner_select on public.resumes
  for select using (auth.uid() = user_id);
create policy resumes_owner_insert on public.resumes
  for insert with check (auth.uid() = user_id);
create policy resumes_owner_update on public.resumes
  for update using (auth.uid() = user_id);
create policy resumes_owner_delete on public.resumes
  for delete using (auth.uid() = user_id);

-- search_profiles --------------------------------------------------------
create policy profiles_owner_select on public.search_profiles
  for select using (auth.uid() = user_id);
create policy profiles_owner_insert on public.search_profiles
  for insert with check (auth.uid() = user_id);
create policy profiles_owner_update on public.search_profiles
  for update using (auth.uid() = user_id);
create policy profiles_owner_delete on public.search_profiles
  for delete using (auth.uid() = user_id);

-- runs -------------------------------------------------------------------
-- Owner sees own runs. Anonymous runs are visible only by the session
-- cookie passed through API routes (server checks anonymous_session).
create policy runs_owner_select on public.runs
  for select using (auth.uid() = user_id);

-- jobs -------------------------------------------------------------------
-- Joinable via run ownership. RLS check goes through the runs table.
create policy jobs_owner_select on public.jobs
  for select using (
    exists (
      select 1 from public.runs r
      where r.id = jobs.run_id
        and r.user_id = auth.uid()
    )
  );

-- seen_jobs --------------------------------------------------------------
create policy seen_owner_select on public.seen_jobs
  for select using (auth.uid() = user_id);

-- saved_jobs -------------------------------------------------------------
create policy saved_owner_all on public.saved_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

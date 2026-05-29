-- Job Radar SaaS v1 — initial schema
-- Run in Supabase SQL editor as the first migration.

create extension if not exists "pgcrypto";

-- resumes ----------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  original_filename text,
  parsed_text text not null,
  char_count int not null default 0,
  created_at timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes (user_id);

-- search_profiles --------------------------------------------------------
create table public.search_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  resume_id uuid not null references public.resumes(id) on delete restrict,
  queries text[] not null default array[]::text[],
  location text not null default 'Canada',
  employment_types text[] not null default array[]::text[],
  remote_only boolean not null default false,
  min_score int not null default 70,
  notify_email text,
  notify_telegram_chat_id text,
  schedule_cron text not null default '0 7,12,17 * * *',
  active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index search_profiles_user_id_idx on public.search_profiles (user_id);
create index search_profiles_active_idx on public.search_profiles (active) where active = true;

-- runs -------------------------------------------------------------------
create type public.run_status as enum ('pending', 'running', 'success', 'error');

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  search_profile_id uuid references public.search_profiles(id) on delete set null,
  anonymous_session text,
  status public.run_status not null default 'pending',
  trigger text not null default 'manual',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  scanned_count int not null default 0,
  qualified_count int not null default 0,
  reported_count int not null default 0,
  fresh_count int not null default 0,
  warm_count int not null default 0,
  direct_ats_count int not null default 0,
  widened boolean not null default false,
  floored boolean not null default false,
  sources_breakdown jsonb not null default '{}'::jsonb,
  raw_counts jsonb not null default '[]'::jsonb,
  banner_label text,
  error text,
  constraint runs_owner_check check (
    user_id is not null or anonymous_session is not null
  )
);

create index runs_user_id_idx on public.runs (user_id, started_at desc);
create index runs_profile_id_idx on public.runs (search_profile_id, started_at desc);
create index runs_anonymous_idx on public.runs (anonymous_session, started_at desc)
  where anonymous_session is not null;

-- jobs -------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  external_id text,
  canonical_url text not null,
  job_title text not null,
  company text not null,
  publisher text,
  source text not null,
  location text,
  remote boolean not null default false,
  posted_at timestamptz,
  apply_url text not null,
  linkedin_url text,
  direct_ats boolean not null default false,
  description text,
  match_score int not null default 0,
  quality_tier text,
  fit_verdict text,
  resume_fit_score int not null default 0,
  schedule_fit_score int not null default 0,
  location_fit_score int not null default 0,
  opportunity_score int not null default 0,
  quality_flags text[] not null default array[]::text[],
  risk_flags text[] not null default array[]::text[],
  key_advantages text,
  gaps_or_objections text,
  why_promising text,
  cover_letter_hook text,
  talking_points text[] not null default array[]::text[],
  company_industry text,
  company_employees text,
  company_size text,
  company_followers text,
  ai_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index jobs_run_id_idx on public.jobs (run_id, match_score desc);
create index jobs_canonical_url_idx on public.jobs (canonical_url);

-- seen_jobs (per-user cross-day dedupe) ---------------------------------
create table public.seen_jobs (
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_key text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, canonical_key)
);

create index seen_jobs_user_last_seen_idx on public.seen_jobs (user_id, last_seen desc);

-- saved_jobs (future-friendly) ------------------------------------------
create type public.saved_job_status as enum ('saved', 'applied', 'interviewing', 'rejected', 'withdrawn');

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status public.saved_job_status not null default 'saved',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index saved_jobs_user_id_idx on public.saved_jobs (user_id, updated_at desc);

-- updated_at triggers ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger search_profiles_set_updated_at
before update on public.search_profiles
for each row execute function public.set_updated_at();

create trigger saved_jobs_set_updated_at
before update on public.saved_jobs
for each row execute function public.set_updated_at();

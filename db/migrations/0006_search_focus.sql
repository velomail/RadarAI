-- Store user's industry / focus for scoring and re-runs.
alter table public.search_profiles
  add column if not exists search_focus text not null default 'auto';

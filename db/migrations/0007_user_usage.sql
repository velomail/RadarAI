-- 0007: per-user daily query limits for free tier + future plan field.

create table if not exists public.user_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  queries_today int not null default 0,
  last_query_date date,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  updated_at timestamptz not null default now()
);

alter table public.user_usage enable row level security;

create policy user_usage_select_own on public.user_usage
  for select using (auth.uid() = user_id);

-- Atomic daily consume. Returns { allowed, plan, queries_today, limit, remaining }.
create or replace function public.consume_daily_query(
  p_user_id uuid,
  p_limit int default 3
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (current_timestamp at time zone 'utc')::date;
  u public.user_usage%rowtype;
  new_count int;
  remaining int;
begin
  insert into public.user_usage (user_id, queries_today, last_query_date, plan)
  values (p_user_id, 0, today, 'free')
  on conflict (user_id) do nothing;

  select * into u from public.user_usage where user_id = p_user_id for update;

  if u.plan = 'pro' then
    return jsonb_build_object(
      'allowed', true,
      'plan', 'pro',
      'queries_today', u.queries_today,
      'limit', p_limit,
      'remaining', -1
    );
  end if;

  if u.last_query_date is null or u.last_query_date < today then
    update public.user_usage
      set queries_today = 0, last_query_date = today, updated_at = now()
      where user_id = p_user_id;
    u.queries_today := 0;
    u.last_query_date := today;
  end if;

  if u.queries_today >= p_limit then
    return jsonb_build_object(
      'allowed', false,
      'plan', u.plan,
      'queries_today', u.queries_today,
      'limit', p_limit,
      'remaining', 0
    );
  end if;

  new_count := u.queries_today + 1;
  update public.user_usage
    set queries_today = new_count, last_query_date = today, updated_at = now()
    where user_id = p_user_id;

  remaining := greatest(0, p_limit - new_count);

  return jsonb_build_object(
    'allowed', true,
    'plan', u.plan,
    'queries_today', new_count,
    'limit', p_limit,
    'remaining', remaining
  );
end;
$$;

revoke all on function public.consume_daily_query(uuid, int) from public;
grant execute on function public.consume_daily_query(uuid, int) to service_role;

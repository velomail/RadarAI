-- 0008: atomic guest daily quota (mirrors user_usage pattern)

create table if not exists public.guest_usage (
  session_id text primary key,
  queries_today int not null default 0,
  last_query_date date not null default (now() at time zone 'utc')::date,
  updated_at timestamptz not null default now()
);

alter table public.guest_usage enable row level security;

create or replace function public.consume_guest_query(p_session text, p_limit int default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
  u public.guest_usage%rowtype;
  new_count int;
begin
  if p_session is null or length(trim(p_session)) < 8 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;

  insert into public.guest_usage (session_id, queries_today, last_query_date)
  values (p_session, 0, today)
  on conflict (session_id) do nothing;

  select * into u from public.guest_usage where session_id = p_session for update;

  if u.last_query_date < today then
    update public.guest_usage
      set queries_today = 0, last_query_date = today, updated_at = now()
      where session_id = p_session;
    u.queries_today := 0;
  end if;

  if u.queries_today >= p_limit then
    return jsonb_build_object(
      'allowed', false,
      'queries_today', u.queries_today,
      'limit', p_limit,
      'remaining', 0
    );
  end if;

  new_count := u.queries_today + 1;
  update public.guest_usage
    set queries_today = new_count, last_query_date = today, updated_at = now()
    where session_id = p_session;

  return jsonb_build_object(
    'allowed', true,
    'queries_today', new_count,
    'limit', p_limit,
    'remaining', greatest(0, p_limit - new_count)
  );
end;
$$;

revoke all on function public.consume_guest_query(text, int) from public;
grant execute on function public.consume_guest_query(text, int) to service_role;

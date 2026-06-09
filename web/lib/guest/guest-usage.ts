import { GUEST_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { supabaseServiceRole } from '@/lib/supabase/server';

export type GuestUsage = {
  queries_today: number;
  limit: number;
  remaining: number;
  allowed: boolean;
};

function utcDayStart(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${today}T00:00:00.000Z`;
}

export async function getGuestUsage(sessionId: string): Promise<GuestUsage> {
  const sb = supabaseServiceRole();
  const today = new Date().toISOString().slice(0, 10);

  let queriesToday = 0;
  const { data: usageRow, error: usageErr } = await sb
    .from('guest_usage')
    .select('queries_today, last_query_date')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (!usageErr && usageRow && usageRow.last_query_date === today) {
    queriesToday = usageRow.queries_today ?? 0;
  } else {
    const { count, error } = await sb
      .from('runs')
      .select('id', { count: 'exact', head: true })
      .eq('anonymous_session', sessionId)
      .gte('started_at', utcDayStart());

    if (error) {
      console.warn('guest_usage: runs count failed:', error.message);
      queriesToday = 0;
    } else {
      queriesToday = count ?? 0;
    }
  }
  const remaining = Math.max(0, GUEST_DAILY_QUERY_LIMIT - queriesToday);

  return {
    queries_today: queriesToday,
    limit: GUEST_DAILY_QUERY_LIMIT,
    remaining,
    allowed: queriesToday < GUEST_DAILY_QUERY_LIMIT,
  };
}

import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { supabaseServiceRole } from '@/lib/supabase/server';

export type ConsumeDailyQueryResult = {
  allowed: boolean;
  plan: 'free' | 'pro';
  queries_today: number;
  limit: number;
  remaining: number;
};

export async function consumeDailyQuery(
  userId: string,
  limit = FREE_DAILY_QUERY_LIMIT,
): Promise<ConsumeDailyQueryResult> {
  const sb = supabaseServiceRole();
  const { data, error } = await sb.rpc('consume_daily_query', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`consume_daily_query failed: ${error.message}`);
  }

  const row = (data ?? {}) as Partial<ConsumeDailyQueryResult>;
  return {
    allowed: Boolean(row.allowed),
    plan: row.plan === 'pro' ? 'pro' : 'free',
    queries_today: typeof row.queries_today === 'number' ? row.queries_today : 0,
    limit: typeof row.limit === 'number' ? row.limit : limit,
    remaining: typeof row.remaining === 'number' ? row.remaining : 0,
  };
}

export async function getDailyUsage(userId: string): Promise<{
  queries_today: number;
  limit: number;
  remaining: number;
  plan: 'free' | 'pro';
}> {
  const sb = supabaseServiceRole();
  const { data } = await sb
    .from('user_usage')
    .select('queries_today, last_query_date, plan')
    .eq('user_id', userId)
    .maybeSingle();

  const plan = data?.plan === 'pro' ? 'pro' : 'free';
  if (plan === 'pro') {
    return {
      queries_today: data?.queries_today ?? 0,
      limit: FREE_DAILY_QUERY_LIMIT,
      remaining: -1,
      plan,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = data?.last_query_date ?? null;
  const queriesToday =
    lastDate === today ? (data?.queries_today ?? 0) : 0;
  const remaining = Math.max(0, FREE_DAILY_QUERY_LIMIT - queriesToday);

  return {
    queries_today: queriesToday,
    limit: FREE_DAILY_QUERY_LIMIT,
    remaining,
    plan,
  };
}

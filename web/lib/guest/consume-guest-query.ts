import { GUEST_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { supabaseServiceRole } from '@/lib/supabase/server';

export type ConsumeGuestQueryResult = {
  allowed: boolean;
  queries_today: number;
  limit: number;
  remaining: number;
};

export async function consumeGuestQuery(
  sessionId: string,
  limit = GUEST_DAILY_QUERY_LIMIT,
): Promise<ConsumeGuestQueryResult> {
  const sb = supabaseServiceRole();
  const { data, error } = await sb.rpc('consume_guest_query', {
    p_session: sessionId,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`consume_guest_query failed: ${error.message}`);
  }

  const row = (data ?? {}) as Partial<ConsumeGuestQueryResult>;
  return {
    allowed: Boolean(row.allowed),
    queries_today: typeof row.queries_today === 'number' ? row.queries_today : 0,
    limit: typeof row.limit === 'number' ? row.limit : limit,
    remaining: typeof row.remaining === 'number' ? row.remaining : 0,
  };
}

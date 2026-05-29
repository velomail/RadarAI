import { inferQueriesFromResume } from '@/lib/infer-resume-queries';
import { resolveSearchQueries } from '@/lib/search-focus';
import type { EnginePayload } from './types';

export async function resolveEngineQueries(
  payload: EnginePayload,
): Promise<{ queries: string[]; widen_queries: string[] }> {
  const userQueries = (payload.queries || []).map((q) => q.trim()).filter(Boolean);
  const focusId = payload.search_focus || 'auto';

  let inferred: string[] | undefined;
  if (focusId === 'auto' && userQueries.length === 0) {
    inferred = await inferQueriesFromResume(payload.resume_text);
  }

  const resolved = resolveSearchQueries(focusId, userQueries, inferred);
  return {
    queries: resolved.queries,
    widen_queries: resolved.widenQueries,
  };
}

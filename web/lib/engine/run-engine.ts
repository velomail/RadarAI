import { supabaseServiceRole } from '@/lib/supabase/server';
import { isMockEngine, mockEngineLabel } from './engine-mode';
import { maxDaysOldFromEnv } from './adzuna-filters';
import { cleanJobs } from './clean-jobs';
import { dispatchNotifications } from './dispatch-notifications';
import { fetchSources } from './fetch-sources';
import { loadSeenAndFilter } from './load-seen-jobs';
import { markRunError, markRunRunning, persistRun } from './persist-run';
import { postProcessScores } from './post-process';
import { prioritizeJobsForScoring } from './prioritize-jobs';
import { resolveEngineQueries } from './resolve-queries';
import { scoreWithOpenAI } from './score-with-openai';
import type { EnginePayload, EngineResult } from './types';

const MAX_JOBS_TO_SCORE = Number(process.env.OPENAI_MAX_JOBS_TO_SCORE || 20);

/**
 * End-to-end engine pipeline. Equivalent to the entire `score-jobs` n8n
 * workflow, but as a single async function meant to run inside a Vercel
 * function invocation (300s Hobby budget is plenty).
 *
 * Mutates Supabase `runs` (running → success/error), inserts `jobs`,
 * upserts `seen_jobs`, sends Resend + Telegram if the run belongs to an
 * authed user with notification settings.
 *
 * Caller should wrap in Next.js `after()` so the HTTP response can return
 * before the engine finishes. Errors are swallowed here (they're persisted
 * to the run row); the caller should never need to catch.
 */
export async function runEngine(payload: EnginePayload): Promise<EngineResult | null> {
  const sb = supabaseServiceRole();
  const runId = payload.run_id;

  try {
    if (isMockEngine()) {
      console.info(`${mockEngineLabel()} Run ${runId} — no Adzuna / OpenAI / Resend calls`);
    }

    if (!payload.resume_text || payload.resume_text.trim().length < 100) {
      throw new Error('Payload missing or too-short resume_text (need >= 100 chars).');
    }
    if (!Array.isArray(payload.queries)) {
      throw new Error('Payload missing queries[].');
    }

    const resolved = await resolveEngineQueries(payload);
    const enginePayload = {
      ...payload,
      queries: resolved.queries,
      widen_queries: resolved.widen_queries,
    };

    if (enginePayload.queries.length === 0) {
      throw new Error('No search queries resolved for this run.');
    }

    await markRunRunning(sb, runId);

    const fetched = await fetchSources(enginePayload);

    const { filtered, seen_filtered: seenFiltered } = await loadSeenAndFilter(
      sb,
      payload.user_id,
      fetched.data,
    );

    if (filtered.length === 0) {
      if (seenFiltered > 0) {
        throw new Error(
          'All recent Adzuna matches were already shown in your last 14 days. Adjust search terms or run again later for fresh listings.',
        );
      }
      throw new Error('No new relevant jobs passed filters for this search.');
    }

    const cleaned = cleanJobs(filtered, !!enginePayload.remote_only, maxDaysOldFromEnv());

    const toScore = prioritizeJobsForScoring(cleaned).slice(0, MAX_JOBS_TO_SCORE);
    if (toScore.length < cleaned.length) {
      console.info(
        `Scoring ${toScore.length}/${cleaned.length} jobs (OPENAI_MAX_JOBS_TO_SCORE=${MAX_JOBS_TO_SCORE})`,
      );
    }

    const scored = await scoreWithOpenAI(toScore, payload.resume_text, payload.search_focus);

    // Attach the matching clean job to each scored result so post-processing
    // can enrich (location, posted_at, publisher, ...).
    const cleanByUrl = new Map(cleaned.map((c) => [c.apply_url_canonical || c.apply_url, c]));
    for (const s of scored) {
      if (!s._clean) {
        const k = (s.apply_url || '').toLowerCase();
        s._clean = cleanByUrl.get(k);
      }
    }

    const result = postProcessScores(
      scored,
      {
        sources_breakdown: fetched.sources_breakdown,
        raw_counts: fetched.raw_counts,
        widened: fetched.widened,
      },
      {
        run_id: runId,
        user_id: payload.user_id,
        min_score: payload.min_score || 70,
      },
    );

    await persistRun(sb, runId, result);

    if (payload.user_id) {
      try {
        await dispatchNotifications(sb, runId);
      } catch (err) {
        // Notification failures should not mark the run as errored.
        console.warn('dispatchNotifications failed:', (err as Error).message);
      }
    }

    return {
      ok: true,
      run_id: runId,
      user_id: payload.user_id,
      summary: result.summary,
    };
  } catch (err) {
    const message = (err as Error).message || 'engine failed';
    console.error('runEngine failed:', message);
    await markRunError(sb, runId, message);
    return null;
  }
}

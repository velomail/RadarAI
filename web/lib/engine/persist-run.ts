import type { SupabaseClient } from '@supabase/supabase-js';
import type { PostProcessResult } from './post-process';

export async function markRunRunning(sb: SupabaseClient, runId: string): Promise<void> {
  const { error } = await sb
    .from('runs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', runId);
  if (error) throw new Error(`mark_run_running failed: ${error.message}`);
}

export async function markRunError(
  sb: SupabaseClient,
  runId: string,
  message: string,
): Promise<void> {
  try {
    await sb
      .from('runs')
      .update({
        status: 'error',
        completed_at: new Date().toISOString(),
        error: String(message).slice(0, 2000),
      })
      .eq('id', runId);
  } catch (err) {
    console.warn('mark_run_error: failed', (err as Error).message);
  }
}

export async function persistRun(
  sb: SupabaseClient,
  runId: string,
  result: PostProcessResult,
): Promise<void> {
  const { summary, jobs_payload, seen_payload } = result;

  if (jobs_payload.length) {
    const { error: jobsErr } = await sb.from('jobs').insert(jobs_payload);
    if (jobsErr) throw new Error(`jobs insert failed: ${jobsErr.message}`);
  }

  if (seen_payload.length) {
    const { error: seenErr } = await sb
      .from('seen_jobs')
      .upsert(seen_payload, { onConflict: 'user_id,canonical_key' });
    if (seenErr) throw new Error(`seen_jobs upsert failed: ${seenErr.message}`);
  }

  const { error: runErr } = await sb
    .from('runs')
    .update({
      status: 'success',
      completed_at: new Date().toISOString(),
      scanned_count: summary.parsed_count,
      qualified_count: summary.qualified_count,
      reported_count: summary.match_count,
      fresh_count: summary.fresh_count,
      warm_count: summary.warm_count,
      direct_ats_count: summary.direct_ats_count,
      widened: summary.widened,
      floored: summary.floored,
      sources_breakdown: summary.sources_breakdown,
      raw_counts: summary.raw_counts,
      banner_label: summary.banner_label,
    })
    .eq('id', runId);
  if (runErr) throw new Error(`runs update failed: ${runErr.message}`);
}

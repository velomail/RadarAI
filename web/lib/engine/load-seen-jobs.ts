import type { SupabaseClient } from '@supabase/supabase-js';
import { isMockEngine } from './engine-mode';
import type { RawJob } from './types';

const WINDOW_DAYS = 14;

function canonicalKey(job: RawJob): string {
  if (job.job_id) return `id:${job.job_id}`;
  const url = job.job_apply_link || job.apply_link || '';
  if (!url) return '';
  return `url:${String(url)
    .trim()
    .replace(/#.*$/, '')
    .replace(/[?&]utm_[^=&]+=[^&]*/gi, '')
    .replace(/[?&]$/, '')
    .toLowerCase()}`;
}

export interface SeenFilterOptions {
  /** Minimum unseen jobs before backfilling from recently-shown listings. */
  minBackfill?: number;
  /** Cap total candidates after backfill (e.g. OPENAI_MAX_JOBS_TO_SCORE). */
  maxTotal?: number;
}

export interface SeenFilterResult {
  filtered: RawJob[];
  seen_known: number;
  seen_filtered: number;
  seen_backfilled: number;
  seen_backfill_keys: string[];
  seen_window_days: number;
}

/** Exported for engine verification scripts. */
export function applySeenBackfill(
  unseen: RawJob[],
  dropped: RawJob[],
  options: SeenFilterOptions,
): { filtered: RawJob[]; backfilled: number; backfillKeys: string[] } {
  const minBackfill = options.minBackfill ?? 0;
  if (minBackfill <= 0 || unseen.length >= minBackfill || dropped.length === 0) {
    return { filtered: unseen, backfilled: 0, backfillKeys: [] };
  }

  const maxTotal = options.maxTotal ?? minBackfill;
  const target = Math.min(minBackfill, maxTotal);
  const need = Math.min(target - unseen.length, dropped.length);
  if (need <= 0) {
    return { filtered: unseen, backfilled: 0, backfillKeys: [] };
  }

  const backfill = dropped.slice(0, need);
  const backfillKeys = backfill
    .map((job) => canonicalKey(job))
    .filter((key): key is string => !!key);

  return {
    filtered: [...unseen, ...backfill],
    backfilled: backfill.length,
    backfillKeys,
  };
}

export async function loadSeenAndFilter(
  sb: SupabaseClient,
  userId: string | null,
  jobs: RawJob[],
  options: SeenFilterOptions = {},
): Promise<SeenFilterResult> {
  if (!userId || isMockEngine()) {
    return {
      filtered: jobs,
      seen_known: 0,
      seen_filtered: 0,
      seen_backfilled: 0,
      seen_backfill_keys: [],
      seen_window_days: WINDOW_DAYS,
    };
  }

  const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
  let seenKeys = new Set<string>();
  try {
    const { data, error } = await sb
      .from('seen_jobs')
      .select('canonical_key')
      .eq('user_id', userId)
      .gte('last_seen', cutoff);
    if (error) {
      console.warn('load_seen_jobs: Supabase lookup failed:', error.message);
    } else if (Array.isArray(data)) {
      seenKeys = new Set(data.map((r) => r.canonical_key as string));
    }
  } catch (err) {
    console.warn('load_seen_jobs: unexpected error:', (err as Error).message);
  }

  const unseen: RawJob[] = [];
  const dropped: RawJob[] = [];
  for (const job of jobs) {
    const key = canonicalKey(job);
    if (key && seenKeys.has(key)) {
      dropped.push(job);
      continue;
    }
    unseen.push(job);
  }

  const { filtered, backfilled, backfillKeys } = applySeenBackfill(unseen, dropped, options);
  if (backfilled > 0) {
    console.info(
      `seen_jobs backfill: added ${backfilled} recently-shown listings (${unseen.length} unseen → ${filtered.length} candidates)`,
    );
  }

  return {
    filtered,
    seen_known: seenKeys.size,
    seen_filtered: dropped.length,
    seen_backfilled: backfilled,
    seen_backfill_keys: backfillKeys,
    seen_window_days: WINDOW_DAYS,
  };
}

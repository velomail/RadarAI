import type { SupabaseClient } from '@supabase/supabase-js';
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

export interface SeenFilterResult {
  filtered: RawJob[];
  seen_known: number;
  seen_filtered: number;
  seen_window_days: number;
}

export async function loadSeenAndFilter(
  sb: SupabaseClient,
  userId: string | null,
  jobs: RawJob[],
): Promise<SeenFilterResult> {
  if (!userId) {
    return { filtered: jobs, seen_known: 0, seen_filtered: 0, seen_window_days: WINDOW_DAYS };
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

  const filtered: RawJob[] = [];
  let droppedCount = 0;
  for (const job of jobs) {
    const key = canonicalKey(job);
    if (key && seenKeys.has(key)) {
      droppedCount++;
      continue;
    }
    filtered.push(job);
  }

  return {
    filtered,
    seen_known: seenKeys.size,
    seen_filtered: droppedCount,
    seen_window_days: WINDOW_DAYS,
  };
}

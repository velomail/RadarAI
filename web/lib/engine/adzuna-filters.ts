import type { RawJob } from './types';

export const DEFAULT_MAX_DAYS_OLD = 7;

export function maxDaysOldFromEnv(): number {
  const n = Number(process.env.ADZUNA_MAX_DAYS_OLD || DEFAULT_MAX_DAYS_OLD);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_DAYS_OLD;
}

export function resultsPerPageFromEnv(): number {
  const n = Number(process.env.ADZUNA_RESULTS_PER_PAGE || 50);
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(50, Math.floor(n));
}

/** Drop listings older than maxDays (Adzuna `created` / posted_at). */
export function isWithinMaxAge(postedAt: string | undefined, maxDays: number): boolean {
  if (!postedAt) return true;
  const t = new Date(postedAt).getTime();
  if (!Number.isFinite(t)) return true;
  return Date.now() - t <= maxDays * 86400000;
}

const STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'job',
  'jobs',
  'role',
  'senior',
  'junior',
  'lead',
  'level',
  'remote',
  'hybrid',
]);

export function queryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9+#.-]/g, ''))
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

/** Require query terms to appear in title or description (partner listings stay on-topic). */
export function jobRelevantToQuery(job: RawJob, query: string): boolean {
  const tokens = queryTokens(query);
  if (!tokens.length) return true;

  const hay = `${job.job_title || ''} ${job.job_description || job.description || ''}`.toLowerCase();
  const hits = tokens.filter((t) => hay.includes(t)).length;
  const required = tokens.length === 1 ? 1 : Math.max(1, Math.ceil(tokens.length * 0.5));
  return hits >= required;
}

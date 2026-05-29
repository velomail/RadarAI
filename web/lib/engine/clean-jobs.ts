import { isWithinMaxAge } from './adzuna-filters';
import type { CleanJob, RawJob } from './types';

const MAX_DESCRIPTION_CHARS = 6000;

const PUBLISHER_DENYLIST = [
  'lensa',
  'myjobhelper',
  'jobcase',
  'jobget',
  'joblift',
  'neuvoo',
  'jooble',
];

function isDenylistedPublisher(publisher: string): boolean {
  if (!publisher) return false;
  const lower = publisher.toLowerCase();
  return PUBLISHER_DENYLIST.some((bad) => lower.includes(bad));
}

function stripHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return `${text.slice(0, maxLen)}… [truncated]`;
}

export function canonicalApplyUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) =>
      parsed.searchParams.delete(key),
    );
    parsed.hash = '';
    return parsed.toString().toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function buildLocation(job: RawJob): string {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean) as string[];
  if (job.job_is_remote === true && !parts.length) return 'Remote';
  if (job.job_is_remote === true) return `Remote · ${parts.join(', ')}`;
  return parts.join(', ') || job.job_location || '';
}

function normalizeJob(raw: RawJob): CleanJob {
  const applyUrl = raw.job_apply_link || raw.apply_link || '';
  const descriptionRaw = raw.job_description || raw.description || '';
  return {
    job_id: raw.job_id || '',
    apply_url: applyUrl,
    apply_url_canonical: canonicalApplyUrl(applyUrl),
    company: (raw.employer_name || '').trim(),
    job_title: (raw.job_title || '').trim(),
    description_clean: truncate(stripHtml(descriptionRaw), MAX_DESCRIPTION_CHARS),
    location: buildLocation(raw),
    is_remote: raw.job_is_remote === true,
    posted_at: raw.job_posted_at_datetime_utc || raw.job_posted_at || '',
    employment_type: raw.job_employment_type || '',
    publisher: raw.job_publisher || '',
    source: raw.source || 'adzuna',
    matched_query: raw._matched_query || '',
    direct_ats: !!raw.direct_ats,
    external_apply_url: raw.external_apply_url || '',
    linkedin_url: raw.linkedin_url || '',
    company_employees: raw.linkedin_org_employees || '',
    company_size: raw.linkedin_org_size || '',
    company_industry: raw.linkedin_org_industry || '',
    company_followers: raw.linkedin_org_followers || '',
    seniority: raw.seniority || '',
  };
}

function dedupeKey(job: CleanJob): string {
  if (job.job_id) return `id:${job.job_id}`;
  if (job.apply_url_canonical) return `url:${job.apply_url_canonical}`;
  return '';
}

function isUsableJob(job: CleanJob, remoteOnly: boolean): boolean {
  if (!job.job_title || !job.company) return false;
  if (!job.job_id && !job.apply_url) return false;
  if (!job.description_clean || job.description_clean.length < 80) return false;
  if (remoteOnly && !job.is_remote) return false;
  return true;
}

export function cleanJobs(rawJobs: RawJob[], remoteOnly: boolean, maxDaysOld?: number): CleanJob[] {
  const maxAgeDays = maxDaysOld ?? 7;
  const seen = new Set<string>();
  const cleaned: CleanJob[] = [];
  let droppedByPublisher = 0;

  for (const raw of rawJobs) {
    const job = normalizeJob(raw);
    if (!isUsableJob(job, remoteOnly)) continue;
    if (!isWithinMaxAge(job.posted_at, maxAgeDays)) continue;
    if (isDenylistedPublisher(job.publisher)) {
      droppedByPublisher++;
      continue;
    }
    const key = dedupeKey(job);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(job);
  }

  if (cleaned.length === 0) {
    throw new Error(
      `Fetch returned ${rawJobs.length} jobs but none passed sanitization (dropped by publisher denylist: ${droppedByPublisher}).`,
    );
  }

  return cleaned;
}

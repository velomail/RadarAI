/**
 * JSearch response sanitizer for n8n Code node (JavaScript).
 * Copy everything between === N8N COPY START === and === N8N COPY END ===
 * into a Code node set to "Run Once for All Items".
 */

// === N8N COPY START ===

const MAX_DESCRIPTION_CHARS = 6000;

// Aggregator-of-aggregators that force resume re-upload before reaching the
// real employer. They add 24-72h before our application actually lands.
const PUBLISHER_DENYLIST = [
  'lensa',
  'myjobhelper',
  'jobcase',
  'jobget',
  'joblift',
  'neuvoo',
  'jooble',
  'adzuna',
];

function isDenylistedPublisher(publisher) {
  if (!publisher) return false;
  const lower = String(publisher).toLowerCase();
  return PUBLISHER_DENYLIST.some((bad) => lower.includes(bad));
}

function stripHtml(text) {
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

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  return `${text.slice(0, maxLen)}… [truncated]`;
}

function canonicalApplyUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(
      (key) => parsed.searchParams.delete(key),
    );
    parsed.hash = '';
    return parsed.toString().toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function buildLocation(job) {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  if (job.job_is_remote === true && !parts.length) return 'Remote';
  if (job.job_is_remote === true) return `Remote · ${parts.join(', ')}`;
  return parts.join(', ') || job.job_location || '';
}

function normalizeJob(raw) {
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
    source: raw.source || 'jsearch',
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

function dedupeKey(job) {
  if (job.job_id) return `id:${job.job_id}`;
  if (job.apply_url_canonical) return `url:${job.apply_url_canonical}`;
  return '';
}

function isUsableJob(job) {
  if (!job.job_title || !job.company) return false;
  if (!job.job_id && !job.apply_url) return false;
  if (!job.description_clean || job.description_clean.length < 80) return false;
  return true;
}

function extractJobList(payload) {
  if (!payload || typeof payload !== 'object') return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  const first = $input.first()?.json;
  if (first && Array.isArray(first.data)) return first.data;

  return [];
}

const httpPayload = $input.first()?.json ?? {};
if (httpPayload.status === 'ERROR') {
  const message = httpPayload.error?.message || 'JSearch returned an error';
  throw new Error(`JSearch API error: ${message}`);
}

const rawJobs = extractJobList(httpPayload);

if (rawJobs.length === 0) {
  const hint =
    httpPayload.status === 'OK'
      ? 'Fetch All Sources returned OK but data[] is empty after Load Seen Jobs filtered. Widen queries or extend the seen window.'
      : 'Check Fetch All Sources output — no recognizable job array on this item.';
  throw new Error(`No jobs in fetch payload. ${hint}`);
}

const seen = new Set();
const cleaned = [];
let droppedByPublisher = 0;

for (const raw of rawJobs) {
  const job = normalizeJob(raw);
  if (!isUsableJob(job)) continue;
  if (isDenylistedPublisher(job.publisher)) {
    droppedByPublisher++;
    continue;
  }

  const key = dedupeKey(job);
  if (!key || seen.has(key)) continue;
  seen.add(key);
  cleaned.push(job);
}

if (droppedByPublisher > 0) {
  console.log(`Clean Jobs: dropped ${droppedByPublisher} jobs from low-reliability publishers`);
}

if (rawJobs.length > 0 && cleaned.length === 0) {
  throw new Error(
    `JSearch returned ${rawJobs.length} jobs but none passed sanitization filters.`,
  );
}

return cleaned.map((job) => ({ json: job }));

// === N8N COPY END ===

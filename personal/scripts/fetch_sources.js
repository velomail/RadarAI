/**
 * Fetch jobs from multiple sources (JSearch + optional LinkedIn) with
 * automatic widening when results are sparse.
 *
 * n8n Code node: JavaScript, "Run Once for All Items"
 * Place BEFORE "Load Seen Jobs" / "Clean Jobs".
 *
 * Required env: RAPIDAPI_KEY
 * Optional env: LINKEDIN_RAPIDAPI_HOST, LINKEDIN_RAPIDAPI_KEY,
 *               LINKEDIN_QUERY_PATH, LINKEDIN_QUERY_PARAM,
 *               LINKEDIN_LOCATION_PARAM, LINKEDIN_LOCATION
 *
 * If LINKEDIN_RAPIDAPI_HOST is unset, the LinkedIn path is skipped silently.
 */

// === N8N COPY START ===

const RAPIDAPI_KEY = $env.RAPIDAPI_KEY;
const LINKEDIN_HOST = $env.LINKEDIN_RAPIDAPI_HOST || '';
const LINKEDIN_KEY = $env.LINKEDIN_RAPIDAPI_KEY || $env.RAPIDAPI_KEY;
const LINKEDIN_DEFAULT_PATH = $env.LINKEDIN_QUERY_PATH || '/search';
const LINKEDIN_PRIMARY_PATH =
  $env.LINKEDIN_PRIMARY_PATH ||
  (LINKEDIN_HOST.includes('linkedin-job-search-api') ? '/active-jb-24h' : LINKEDIN_DEFAULT_PATH);
const LINKEDIN_WIDEN_PATH =
  $env.LINKEDIN_WIDEN_PATH ||
  (LINKEDIN_HOST.includes('linkedin-job-search-api') ? '/active-jb-7d' : LINKEDIN_DEFAULT_PATH);
const LINKEDIN_QUERY_PARAM = $env.LINKEDIN_QUERY_PARAM || 'keyword';
const LINKEDIN_LOCATION_PARAM = $env.LINKEDIN_LOCATION_PARAM || 'location';
const LINKEDIN_LOCATION = $env.LINKEDIN_LOCATION || 'Canada';

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_URL = `https://${JSEARCH_HOST}/search`;

const MIN_RAW_JOBS = 15;

const PRIMARY_QUERIES = [
  'inside sales remote Ontario Canada',
  'business development representative remote Canada',
  'customer service sales remote Ontario Canada',
  'telecom sales remote Ontario Canada',
];

const WIDEN_QUERIES = [
  'sales development representative Canada',
  'B2B sales remote Canada',
  'account executive Canada',
  'SaaS sales remote Canada',
];

function buildQuery(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function canonicalKey(job) {
  if (job && job.job_id) return `id:${job.job_id}`;
  const url = (job && (job.job_apply_link || job.apply_link)) || '';
  if (!url) return '';
  return `url:${String(url)
    .trim()
    .replace(/#.*$/, '')
    .replace(/[?&]utm_[^=&]+=[^&]*/gi, '')
    .replace(/[?&]$/, '')
    .toLowerCase()}`;
}

async function fetchJsearch(query, datePosted) {
  const params = buildQuery({
    query,
    page: '1',
    num_pages: '1',
    country: 'ca',
    language: 'en',
    date_posted: datePosted,
  });
  try {
    const body = await this.helpers.httpRequest({
      method: 'GET',
      url: `${JSEARCH_URL}?${params}`,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': JSEARCH_HOST,
      },
      json: true,
    });
    if (body && body.status === 'ERROR') {
      return {
        source: 'jsearch',
        query,
        ok: false,
        message: (body.error && body.error.message) || 'JSearch error',
        data: [],
      };
    }
    const list = Array.isArray(body && body.data) ? body.data : [];
    return {
      source: 'jsearch',
      query,
      ok: true,
      data: list.map((j) => ({ ...j, source: 'jsearch' })),
    };
  } catch (e) {
    return {
      source: 'jsearch',
      query,
      ok: false,
      message: e.message || 'HTTP failed',
      data: [],
    };
  }
}

function flattenLocationsDerived(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value
    .map((entry) => {
      if (!entry) return '';
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'object') {
        const parts = [entry.city, entry.region, entry.country].filter(Boolean);
        return parts.join(', ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' | ');
}

function normalizeLinkedinJob(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = raw.job_title || raw.title || raw.position || '';
  const company =
    raw.employer_name ||
    raw.company ||
    raw.company_name ||
    raw.companyName ||
    raw.organization ||
    '';
  if (!title || !company) return null;

  const description =
    raw.job_description ||
    raw.description ||
    raw.description_text ||
    raw.descriptionText ||
    raw.description_html ||
    raw.job_summary ||
    raw.summary ||
    raw.snippet ||
    '';
  const externalUrl = raw.external_apply_url || '';
  const linkedinUrl = raw.job_url || raw.jobUrl || raw.url || raw.link || '';
  const applyUrl =
    raw.job_apply_link ||
    raw.apply_link ||
    externalUrl ||
    linkedinUrl ||
    '';
  const directAts = !!externalUrl;
  const jobId =
    raw.job_id ||
    raw.id ||
    raw.jobId ||
    raw.linkedinJobId ||
    raw.li_job_id ||
    '';
  const location =
    raw.job_location ||
    raw.location ||
    flattenLocationsDerived(raw.locations_derived) ||
    '';

  const firstLocation = Array.isArray(raw.locations_derived) && raw.locations_derived[0];
  const firstLocationObj =
    firstLocation && typeof firstLocation === 'object' ? firstLocation : {};

  const isRemote =
    raw.remote_derived === true ||
    raw.job_is_remote === true ||
    raw.is_remote === true ||
    /\bremote\b/i.test(location) ||
    /\bremote\b/i.test(String(raw.workplaceType || ''));

  return {
    job_id: jobId ? String(jobId) : '',
    job_title: title,
    employer_name: company,
    job_apply_link: applyUrl,
    job_description: description,
    job_publisher: raw.job_publisher || raw.source || 'LinkedIn',
    job_city: raw.job_city || raw.city || firstLocationObj.city || '',
    job_state: raw.job_state || raw.state || firstLocationObj.region || '',
    job_country: raw.job_country || raw.country || firstLocationObj.country || 'CA',
    job_location: location,
    job_is_remote: !!isRemote,
    job_posted_at_datetime_utc:
      raw.job_posted_at_datetime_utc ||
      raw.posted_at ||
      raw.date_posted ||
      raw.postedAt ||
      raw.date_created ||
      '',
    job_posted_at: raw.job_posted_at || '',
    job_employment_type:
      raw.job_employment_type ||
      raw.employment_type ||
      raw.employmentType ||
      (Array.isArray(raw.employment_type_derived) ? raw.employment_type_derived[0] : '') ||
      '',
    direct_ats: directAts,
    external_apply_url: externalUrl,
    linkedin_url: linkedinUrl,
    linkedin_org_employees: raw.linkedin_org_employees || '',
    linkedin_org_size: raw.linkedin_org_size || '',
    linkedin_org_industry: raw.linkedin_org_industry || '',
    linkedin_org_followers: raw.linkedin_org_followers || '',
    seniority: raw.seniority || '',
    source: 'linkedin',
  };
}

async function fetchLinkedin(query, linkedinPath) {
  if (!LINKEDIN_HOST) {
    return {
      source: 'linkedin',
      query,
      ok: false,
      skipped: true,
      message: 'LINKEDIN_RAPIDAPI_HOST not configured',
      data: [],
    };
  }

  const linkedinParams = {
    [LINKEDIN_QUERY_PARAM]: query,
    [LINKEDIN_LOCATION_PARAM]: LINKEDIN_LOCATION,
  };
  if (LINKEDIN_HOST.includes('linkedin-job-search-api')) {
    linkedinParams.description_type = 'text';
    linkedinParams.limit = '20';
    linkedinParams.offset = '0';
  }
  const params = buildQuery(linkedinParams);

  try {
    const body = await this.helpers.httpRequest({
      method: 'GET',
      url: `https://${LINKEDIN_HOST}${linkedinPath}?${params}`,
      headers: {
        'X-RapidAPI-Key': LINKEDIN_KEY,
        'X-RapidAPI-Host': LINKEDIN_HOST,
      },
      json: true,
    });
    const rawList = Array.isArray(body)
      ? body
      : (body && (body.data || body.jobs || body.result || body.results)) || [];
    const data = rawList.map(normalizeLinkedinJob).filter(Boolean);
    return { source: 'linkedin', query, ok: true, path: linkedinPath, data };
  } catch (e) {
    return {
      source: 'linkedin',
      query,
      ok: false,
      message: e.message || 'HTTP failed',
      data: [],
    };
  }
}

async function runWave(queries, datePosted, linkedinPath) {
  const collected = [];
  for (const q of queries) {
    collected.push(await fetchJsearch.call(this, q, datePosted));
    collected.push(await fetchLinkedin.call(this, q, linkedinPath));
  }
  return collected;
}

if (!RAPIDAPI_KEY) {
  throw new Error('Missing RAPIDAPI_KEY in n8n container environment.');
}

const allResults = [];
allResults.push(
  ...(await runWave.call(this, PRIMARY_QUERIES, 'week', LINKEDIN_PRIMARY_PATH)),
);

const seen = new Set();
const jobs = [];

function ingest(resultList) {
  for (const r of resultList) {
    if (!r.ok) continue;
    for (const job of r.data) {
      const key = canonicalKey(job);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      jobs.push({ ...job, _matched_query: r.query });
    }
  }
}

ingest(allResults);

let widened = false;
if (jobs.length < MIN_RAW_JOBS) {
  widened = true;
  const wider = await runWave.call(this, WIDEN_QUERIES, 'month', LINKEDIN_WIDEN_PATH);
  allResults.push(...wider);
  ingest(wider);
}

const sourcesBreakdown = jobs.reduce((acc, j) => {
  const k = j.source || 'unknown';
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

const failures = allResults.filter((r) => !r.ok && !r.skipped);

if (!jobs.length) {
  const summary = allResults
    .map(
      (r) =>
        `${r.source}:${r.query}:${r.ok ? r.data.length : 'ERR ' + (r.message || 'unknown')}`,
    )
    .join(' | ');
  throw new Error(`No jobs returned from any source. ${summary}`);
}

return [
  {
    json: {
      status: 'OK',
      data: jobs,
      sources_breakdown: sourcesBreakdown,
      raw_counts: allResults.map((r) => ({
        source: r.source,
        query: r.query,
        ok: r.ok,
        skipped: !!r.skipped,
        count: (r.data && r.data.length) || 0,
        message: r.message || '',
      })),
      widened,
      failure_count: failures.length,
      warning: failures.length
        ? `${failures.length} fetch attempt(s) failed; others returned jobs.`
        : '',
    },
  },
];

// === N8N COPY END ===

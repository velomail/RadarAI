import { getSearchFocus } from '@/lib/search-focus';
import { isMockEngine } from './engine-mode';
import { fetchSourcesMock } from './mock/fetch-sources-mock';
import {
  capUniqueQueries,
  isRateLimitMessage,
  runSerial,
  widenExtras,
  withRateLimitRetry,
} from './rapidapi-fetch';
import type { EnginePayload, FetchResult, RawJob } from './types';

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_URL = `https://${JSEARCH_HOST}/search`;
const ADZUNA_URL_BASE = 'https://api.adzuna.com/v1/api/jobs';

const MAX_PRIMARY_QUERIES = Number(
  process.env.ADZUNA_MAX_PRIMARY_QUERIES || process.env.RAPIDAPI_MAX_PRIMARY_QUERIES || 2,
);
const MAX_WIDEN_QUERIES = Number(
  process.env.ADZUNA_MAX_WIDEN_QUERIES || process.env.RAPIDAPI_MAX_WIDEN_QUERIES || 0,
);
const FETCH_DELAY_MS = Number(
  process.env.ADZUNA_FETCH_DELAY_MS || process.env.RAPIDAPI_FETCH_DELAY_MS || 800,
);

function defaultWidenQueries(payload: EnginePayload): string[] {
  const focus = getSearchFocus(payload.search_focus);
  if (focus.widenQueries.length) return focus.widenQueries;
  return getSearchFocus('general').widenQueries;
}

type SourceResponse = {
  source: 'jsearch' | 'linkedin' | 'adzuna';
  query: string;
  ok: boolean;
  skipped?: boolean;
  message?: string;
  path?: string;
  data: RawJob[];
};

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

function buildQuery(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function fetchJsearchOnce(
  query: string,
  datePosted: string,
  location: string,
  rapidApiKey: string,
): Promise<SourceResponse> {
  const params = buildQuery({
    query: `${query} ${location}`,
    page: '1',
    num_pages: '1',
    country: 'ca',
    language: 'en',
    date_posted: datePosted,
  });
  try {
    const res = await fetch(`${JSEARCH_URL}?${params}`, {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': JSEARCH_HOST,
      },
    });
    if (!res.ok) {
      return {
        source: 'jsearch',
        query,
        ok: false,
        message: `HTTP ${res.status}`,
        data: [],
      };
    }
    const body = await res.json();
    if (body && body.status === 'ERROR') {
      return {
        source: 'jsearch',
        query,
        ok: false,
        message: body.error?.message || 'JSearch error',
        data: [],
      };
    }
    const list: RawJob[] = Array.isArray(body?.data) ? body.data : [];
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
      message: (e as Error).message || 'HTTP failed',
      data: [],
    };
  }
}

function normalizeAdzunaJob(raw: Record<string, unknown>): RawJob | null {
  const title = (raw.title as string) || '';
  const companyObj = (raw.company as Record<string, unknown>) || {};
  const company = (companyObj.display_name as string) || '';
  const applyUrl = (raw.redirect_url as string) || (raw.adref as string) || '';
  const description = (raw.description as string) || '';
  if (!title || !company || !applyUrl || !description) return null;

  const locationObj = (raw.location as Record<string, unknown>) || {};
  const locationDisplay = (locationObj.display_name as string) || '';
  const area = Array.isArray(locationObj.area) ? (locationObj.area as string[]) : [];
  const city = area.length >= 2 ? area[area.length - 2] : '';
  const country = area.length ? area[0] : '';
  const isRemote = /\bremote\b/i.test(locationDisplay);

  return {
    job_id: String(raw.id || ''),
    job_title: title,
    employer_name: company,
    job_apply_link: applyUrl,
    apply_link: applyUrl,
    job_description: description,
    job_publisher: 'Adzuna',
    job_city: city,
    job_country: country,
    job_location: locationDisplay,
    job_is_remote: isRemote,
    job_posted_at_datetime_utc: (raw.created as string) || '',
    job_employment_type: (raw.contract_type as string) || '',
    source: 'adzuna',
  };
}

async function fetchAdzunaOnce(
  query: string,
  location: string,
  country: string,
  appId: string,
  appKey: string,
): Promise<SourceResponse> {
  const params = buildQuery({
    app_id: appId,
    app_key: appKey,
    what: query,
    where: location,
    results_per_page: '20',
    sort_by: 'date',
  });
  try {
    const res = await fetch(`${ADZUNA_URL_BASE}/${country}/search/1?${params}`);
    if (!res.ok) {
      return { source: 'adzuna', query, ok: false, message: `HTTP ${res.status}`, data: [] };
    }
    const body = await res.json();
    const list = Array.isArray(body?.results) ? (body.results as Record<string, unknown>[]) : [];
    const data = list.map(normalizeAdzunaJob).filter((j): j is RawJob => j !== null);
    return { source: 'adzuna', query, ok: true, data };
  } catch (e) {
    return {
      source: 'adzuna',
      query,
      ok: false,
      message: (e as Error).message || 'HTTP failed',
      data: [],
    };
  }
}

function flattenLocationsDerived(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value
    .map((entry) => {
      if (!entry) return '';
      if (typeof entry === 'string') return entry;
      if (typeof entry === 'object') {
        const e = entry as Record<string, string>;
        return [e.city, e.region, e.country].filter(Boolean).join(', ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' | ');
}

function normalizeLinkedinJob(raw: Record<string, unknown>): RawJob | null {
  if (!raw || typeof raw !== 'object') return null;
  const title =
    (raw.job_title as string) || (raw.title as string) || (raw.position as string) || '';
  const company =
    (raw.employer_name as string) ||
    (raw.company as string) ||
    (raw.company_name as string) ||
    (raw.companyName as string) ||
    (raw.organization as string) ||
    '';
  if (!title || !company) return null;

  const description =
    (raw.job_description as string) ||
    (raw.description as string) ||
    (raw.description_text as string) ||
    (raw.descriptionText as string) ||
    (raw.description_html as string) ||
    (raw.job_summary as string) ||
    (raw.summary as string) ||
    (raw.snippet as string) ||
    '';
  const externalUrl = (raw.external_apply_url as string) || '';
  const linkedinUrl =
    (raw.job_url as string) ||
    (raw.jobUrl as string) ||
    (raw.url as string) ||
    (raw.link as string) ||
    '';
  const applyUrl =
    (raw.job_apply_link as string) ||
    (raw.apply_link as string) ||
    externalUrl ||
    linkedinUrl ||
    '';
  const jobId =
    (raw.job_id as string) ||
    (raw.id as string) ||
    (raw.jobId as string) ||
    (raw.linkedinJobId as string) ||
    (raw.li_job_id as string) ||
    '';
  const locationStr =
    (raw.job_location as string) ||
    (raw.location as string) ||
    flattenLocationsDerived(raw.locations_derived) ||
    '';
  const firstLocation =
    Array.isArray(raw.locations_derived) && (raw.locations_derived as unknown[])[0];
  const firstLocationObj =
    firstLocation && typeof firstLocation === 'object'
      ? (firstLocation as Record<string, string>)
      : {};
  const isRemote =
    raw.remote_derived === true ||
    raw.job_is_remote === true ||
    raw.is_remote === true ||
    /\bremote\b/i.test(locationStr) ||
    /\bremote\b/i.test(String(raw.workplaceType || ''));

  return {
    job_id: jobId ? String(jobId) : '',
    job_title: title,
    employer_name: company,
    job_apply_link: applyUrl,
    job_description: description,
    job_publisher: (raw.job_publisher as string) || (raw.source as string) || 'LinkedIn',
    job_city: (raw.job_city as string) || (raw.city as string) || firstLocationObj.city || '',
    job_state: (raw.job_state as string) || (raw.state as string) || firstLocationObj.region || '',
    job_country:
      (raw.job_country as string) ||
      (raw.country as string) ||
      firstLocationObj.country ||
      'CA',
    job_location: locationStr,
    job_is_remote: !!isRemote,
    job_posted_at_datetime_utc:
      (raw.job_posted_at_datetime_utc as string) ||
      (raw.posted_at as string) ||
      (raw.date_posted as string) ||
      (raw.postedAt as string) ||
      (raw.date_created as string) ||
      '',
    job_posted_at: (raw.job_posted_at as string) || '',
    job_employment_type:
      (raw.job_employment_type as string) ||
      (raw.employment_type as string) ||
      (raw.employmentType as string) ||
      (Array.isArray(raw.employment_type_derived)
        ? (raw.employment_type_derived as string[])[0]
        : '') ||
      '',
    direct_ats: !!externalUrl,
    external_apply_url: externalUrl,
    linkedin_url: linkedinUrl,
    linkedin_org_employees: (raw.linkedin_org_employees as string) || '',
    linkedin_org_size: (raw.linkedin_org_size as string) || '',
    linkedin_org_industry: (raw.linkedin_org_industry as string) || '',
    linkedin_org_followers: (raw.linkedin_org_followers as string) || '',
    seniority: (raw.seniority as string) || '',
    source: 'linkedin',
  };
}

async function fetchLinkedinOnce(
  query: string,
  linkedinPath: string,
  location: string,
): Promise<SourceResponse> {
  const LINKEDIN_HOST = process.env.LINKEDIN_RAPIDAPI_HOST || '';
  const LINKEDIN_KEY = process.env.LINKEDIN_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';
  const LINKEDIN_QUERY_PARAM = process.env.LINKEDIN_QUERY_PARAM || 'title_filter';
  const LINKEDIN_LOCATION_PARAM = process.env.LINKEDIN_LOCATION_PARAM || 'location_filter';

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
  const linkedinParams: Record<string, string> = {
    [LINKEDIN_QUERY_PARAM]: query,
    [LINKEDIN_LOCATION_PARAM]: location,
  };
  if (LINKEDIN_HOST.includes('linkedin-job-search-api')) {
    linkedinParams.description_type = 'text';
    linkedinParams.limit = '20';
    linkedinParams.offset = '0';
  }
  const params = buildQuery(linkedinParams);
  try {
    const res = await fetch(`https://${LINKEDIN_HOST}${linkedinPath}?${params}`, {
      headers: {
        'X-RapidAPI-Key': LINKEDIN_KEY,
        'X-RapidAPI-Host': LINKEDIN_HOST,
      },
    });
    if (!res.ok) {
      return {
        source: 'linkedin',
        query,
        ok: false,
        message: `HTTP ${res.status}`,
        path: linkedinPath,
        data: [],
      };
    }
    const body = await res.json();
    const rawList = Array.isArray(body)
      ? body
      : body?.data || body?.jobs || body?.result || body?.results || [];
    const data = (rawList as Record<string, unknown>[])
      .map(normalizeLinkedinJob)
      .filter((j): j is RawJob => j !== null);
    return { source: 'linkedin', query, ok: true, path: linkedinPath, data };
  } catch (e) {
    return {
      source: 'linkedin',
      query,
      ok: false,
      message: (e as Error).message || 'HTTP failed',
      data: [],
    };
  }
}

async function runWave(
  queries: string[],
  datePosted: string,
  linkedinPath: string,
  location: string,
  rapidApiKey: string,
  maxQueries: number,
): Promise<SourceResponse[]> {
  const capped = capUniqueQueries(queries, maxQueries);
  const tasks: Array<() => Promise<SourceResponse>> = [];

  for (const q of capped) {
    tasks.push(() =>
      withRateLimitRetry(`jsearch:${q}`, () =>
        fetchJsearchOnce(q, datePosted, location, rapidApiKey),
      ),
    );
    tasks.push(() =>
      withRateLimitRetry(`linkedin:${q}`, () => fetchLinkedinOnce(q, linkedinPath, location)),
    );
  }

  return runSerial(tasks, FETCH_DELAY_MS);
}

function allRateLimited(results: SourceResponse[]): boolean {
  const attempted = results.filter((r) => !r.skipped);
  return attempted.length > 0 && attempted.every((r) => !r.ok && isRateLimitMessage(r.message));
}

export async function fetchSources(payload: EnginePayload): Promise<FetchResult> {
  if (isMockEngine()) {
    return fetchSourcesMock(payload);
  }
  const adzunaAppId = process.env.ADZUNA_APP_ID || '';
  const adzunaAppKey = process.env.ADZUNA_APP_KEY || '';
  const adzunaCountry = (process.env.ADZUNA_COUNTRY || 'ca').toLowerCase();
  if (!adzunaAppId || !adzunaAppKey) {
    throw new Error('Missing ADZUNA_APP_ID or ADZUNA_APP_KEY environment variable.');
  }

  const primaryQueries = capUniqueQueries(payload.queries, MAX_PRIMARY_QUERIES);
  const widenPool =
    payload.widen_queries && payload.widen_queries.length
      ? payload.widen_queries
      : defaultWidenQueries(payload);
  const widenQueries = widenExtras(primaryQueries, widenPool, MAX_WIDEN_QUERIES);

  const location = payload.location || 'Canada';
  const minRawJobs = payload.min_raw_jobs || 15;

  const allResults: SourceResponse[] = [];
  const primaryTasks = capUniqueQueries(primaryQueries, MAX_PRIMARY_QUERIES).map(
    (q) => () => fetchAdzunaOnce(q, location, adzunaCountry, adzunaAppId, adzunaAppKey),
  );
  allResults.push(...(await runSerial(primaryTasks, FETCH_DELAY_MS)));

  const seen = new Set<string>();
  const jobs: RawJob[] = [];

  function ingest(resultList: SourceResponse[]) {
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
  const primaryRateLimited = allRateLimited(allResults);

  if (jobs.length < minRawJobs && widenQueries.length > 0 && !primaryRateLimited) {
    widened = true;
    const widenTasks = capUniqueQueries(widenQueries, MAX_WIDEN_QUERIES).map(
      (q) => () => fetchAdzunaOnce(q, location, adzunaCountry, adzunaAppId, adzunaAppKey),
    );
    const wider = await runSerial(widenTasks, FETCH_DELAY_MS);
    allResults.push(...wider);
    ingest(wider);
  }

  const sourcesBreakdown = jobs.reduce<Record<string, number>>((acc, j) => {
    const k = j.source || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  if (!jobs.length) {
    const summary = allResults
      .map(
        (r) =>
          `${r.source}:${r.query}:${r.ok ? r.data.length : 'ERR ' + (r.message || 'unknown')}`,
      )
      .join(' | ');

    if (primaryRateLimited || allRateLimited(allResults)) {
      throw new Error(
        `Adzuna rate limit (HTTP 429). Too many job searches in a short window — wait 1–2 minutes and try again. ${summary}`,
      );
    }

    throw new Error(`No jobs returned from any source. ${summary}`);
  }

  return {
    data: jobs,
    sources_breakdown: sourcesBreakdown,
    raw_counts: allResults.map((r) => ({
      source: r.source,
      query: r.query,
      ok: r.ok,
      skipped: !!r.skipped,
      count: r.data?.length || 0,
      message: r.message || '',
    })),
    widened,
  };
}

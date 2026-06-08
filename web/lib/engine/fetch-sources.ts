import { getSearchFocus } from '@/lib/search-focus';
import {
  isWithinMaxAge,
  jobRelevantToQuery,
  maxDaysOldFromEnv,
  resultsPerPageFromEnv,
} from './adzuna-filters';
import { isMockEngine } from './engine-mode';
import {
  capUniqueQueries,
  isRateLimitMessage,
  runSerial,
  widenExtras,
  withRateLimitRetry,
} from './fetch-utils';
import { fetchSourcesMock } from './mock/fetch-sources-mock';
import type { EnginePayload, FetchResult, RawJob } from './types';

const ADZUNA_URL_BASE = 'https://api.adzuna.com/v1/api/jobs';

const MAX_PRIMARY_QUERIES = Number(process.env.ADZUNA_MAX_PRIMARY_QUERIES || 2);
const MAX_WIDEN_QUERIES = Number(process.env.ADZUNA_MAX_WIDEN_QUERIES || 2);
const FETCH_DELAY_MS = Number(process.env.ADZUNA_FETCH_DELAY_MS || 800);

function defaultWidenQueries(payload: EnginePayload): string[] {
  const focus = getSearchFocus(payload.search_focus);
  if (focus.widenQueries.length) return focus.widenQueries;
  return getSearchFocus('general').widenQueries;
}

type AdzunaSourceResponse = {
  source: 'adzuna';
  query: string;
  ok: boolean;
  message?: string;
  data: RawJob[];
};

type AdzunaFetchOptions = {
  remoteOnly?: boolean;
  employmentTypes?: string[];
  maxDaysOld: number;
  resultsPerPage: number;
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

function employmentParams(types: string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!types?.length) return out;
  const normalized = new Set(types.map((t) => t.toLowerCase()));
  if (normalized.has('full_time') || normalized.has('full-time')) out.full_time = '1';
  if (normalized.has('part_time') || normalized.has('part-time')) out.part_time = '1';
  if (normalized.has('contract')) out.contract = '1';
  if (normalized.has('permanent')) out.permanent = '1';
  return out;
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
  const isRemote = /\bremote\b/i.test(locationDisplay) || /\bremote\b/i.test(description);

  const categoryObj = (raw.category as Record<string, unknown>) || {};
  const categoryLabel = (categoryObj.label as string) || '';

  return {
    job_id: String(raw.id || ''),
    job_title: title,
    employer_name: company,
    job_apply_link: applyUrl,
    apply_link: applyUrl,
    job_description: description,
    job_publisher: categoryLabel ? `Adzuna · ${categoryLabel}` : 'Adzuna',
    job_city: city,
    job_country: country,
    job_location: locationDisplay,
    job_is_remote: isRemote,
    job_posted_at_datetime_utc: (raw.created as string) || '',
    job_employment_type: (raw.contract_time as string) || (raw.contract_type as string) || '',
    source: 'adzuna',
  };
}

async function fetchAdzunaOnce(
  query: string,
  location: string,
  country: string,
  appId: string,
  appKey: string,
  options: AdzunaFetchOptions,
): Promise<AdzunaSourceResponse> {
  const params = buildQuery({
    app_id: appId,
    app_key: appKey,
    what: query,
    where: location,
    results_per_page: String(options.resultsPerPage),
    sort_by: 'date',
    max_days_old: String(options.maxDaysOld),
    ...employmentParams(options.employmentTypes),
  });
  try {
    const res = await fetch(`${ADZUNA_URL_BASE}/${country}/search/1?${params}`);
    if (!res.ok) {
      return { source: 'adzuna', query, ok: false, message: `HTTP ${res.status}`, data: [] };
    }
    const body = await res.json();
    const list = Array.isArray(body?.results) ? (body.results as Record<string, unknown>[]) : [];
    let data = list.map(normalizeAdzunaJob).filter((j): j is RawJob => j !== null);

    data = data.filter(
      (job) =>
        isWithinMaxAge(job.job_posted_at_datetime_utc, options.maxDaysOld) &&
        jobRelevantToQuery(job, query) &&
        (!options.remoteOnly || job.job_is_remote),
    );

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

function allRateLimited(results: AdzunaSourceResponse[]): boolean {
  return results.length > 0 && results.every((r) => !r.ok && isRateLimitMessage(r.message));
}

/**
 * Live job listings from Adzuna partner network only.
 * Listings are sorted by date, capped by max_days_old, and filtered for query relevance.
 */
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

  const fetchOptions: AdzunaFetchOptions = {
    remoteOnly: !!payload.remote_only,
    employmentTypes: payload.employment_types,
    maxDaysOld: maxDaysOldFromEnv(),
    resultsPerPage: resultsPerPageFromEnv(),
  };

  const primaryQueries = capUniqueQueries(payload.queries, MAX_PRIMARY_QUERIES);
  const widenPool =
    payload.widen_queries && payload.widen_queries.length
      ? payload.widen_queries
      : defaultWidenQueries(payload);
  const widenQueries = widenExtras(primaryQueries, widenPool, MAX_WIDEN_QUERIES);

  const location = payload.location || 'Canada';
  const minRawJobs = payload.min_raw_jobs || 10;

  const allResults: AdzunaSourceResponse[] = [];
  const primaryTasks = capUniqueQueries(primaryQueries, MAX_PRIMARY_QUERIES).map(
    (q) => () =>
      withRateLimitRetry(`adzuna:${q}`, () =>
        fetchAdzunaOnce(q, location, adzunaCountry, adzunaAppId, adzunaAppKey, fetchOptions),
      ),
  );
  allResults.push(...(await runSerial(primaryTasks, FETCH_DELAY_MS)));

  const seen = new Set<string>();
  const jobs: RawJob[] = [];

  function ingest(resultList: AdzunaSourceResponse[]) {
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
      (q) => () =>
        withRateLimitRetry(`adzuna:widen:${q}`, () =>
          fetchAdzunaOnce(q, location, adzunaCountry, adzunaAppId, adzunaAppKey, fetchOptions),
        ),
    );
    const wider = await runSerial(widenTasks, FETCH_DELAY_MS);
    allResults.push(...wider);
    ingest(wider);
  }

  const sourcesBreakdown = jobs.reduce<Record<string, number>>((acc, j) => {
    const k = j.source || 'adzuna';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  if (!jobs.length) {
    const summary = allResults
      .map(
        (r) =>
          `adzuna:${r.query}:${r.ok ? r.data.length : 'ERR ' + (r.message || 'unknown')}`,
      )
      .join(' | ');

    if (primaryRateLimited || allRateLimited(allResults)) {
      throw new Error(
        `Adzuna rate limit (HTTP 429). Wait 1–2 minutes and try again. ${summary}`,
      );
    }

    throw new Error(
      `No new relevant jobs from Adzuna in the last ${fetchOptions.maxDaysOld} days for your search terms. ${summary}`,
    );
  }

  return {
    data: jobs,
    sources_breakdown: sourcesBreakdown,
    raw_counts: allResults.map((r) => ({
      source: r.source,
      query: r.query,
      ok: r.ok,
      skipped: false,
      count: r.data?.length || 0,
      message: r.message || '',
    })),
    widened,
  };
}

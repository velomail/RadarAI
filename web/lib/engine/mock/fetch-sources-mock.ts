import type { EnginePayload, FetchResult, RawJob } from '../types';

const COMPANIES = [
  'Northwind Labs',
  'Summit Analytics',
  'Harbor Health',
  'BluePeak Software',
  'Maple Retail Group',
  'Vertex Consulting',
  'ClearPath Logistics',
  'Brightline Media',
];

const DESCRIPTION_TEMPLATES = [
  'Join {company} as a {title}. You will collaborate cross-functionally, own deliverables, and grow with a supportive team. Requirements include relevant experience, strong communication, and comfort with modern tools.',
  '{company} is hiring a {title} in {location}. Day-to-day: execute core responsibilities, document progress, partner with stakeholders, and contribute to team goals. Hybrid and remote-friendly options may be available.',
  'We are looking for a {title} to help {company} scale. Ideal candidates bring hands-on experience, attention to detail, and a track record of learning quickly. Competitive compensation and training provided.',
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: string): T {
  return arr[hash(seed) % arr.length];
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

function titleVariants(query: string, i: number): string {
  const q = query.replace(/\b\w/g, (c) => c.toUpperCase());
  const variants = [q, `Senior ${q}`, `${q} (Contract)`, `Junior ${q}`, `Lead ${q}`];
  return variants[i % variants.length];
}

function companySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function makeJob(query: string, location: string, index: number): RawJob {
  const company = pick(COMPANIES, `${query}:${index}`);
  const title = titleVariants(query, index);
  const template = pick(DESCRIPTION_TEMPLATES, `${company}:${title}`);
  const description = template
    .replace('{company}', company)
    .replace('{title}', title)
    .replace('{location}', location);
  const remote = index % 3 === 0;
  const id = `mock-adzuna-${hash(`${query}-${index}`)}`;
  const applyUrl = `https://careers.${companySlug(company)}.com/jobs/${id}`;

  return {
    job_id: id,
    job_title: title,
    employer_name: company,
    job_apply_link: applyUrl,
    job_description: description,
    job_publisher: 'Adzuna (mock)',
    job_location: remote ? `Remote · ${location}` : location,
    job_city: location.split(',')[0] || location,
    job_country: 'CA',
    job_is_remote: remote,
    job_posted_at_datetime_utc: hoursAgo(2 + (index % 48)),
    job_employment_type: index % 4 === 0 ? 'PARTTIME' : 'FULLTIME',
    direct_ats: index % 5 === 0,
    external_apply_url: index % 5 === 0 ? applyUrl : '',
    source: 'mock',
    _matched_query: query,
  };
}

export function fetchSourcesMock(payload: EnginePayload): FetchResult {
  const location = payload.location || 'Canada';
  const queries = payload.queries.slice(0, 3);
  const jobs: RawJob[] = [];
  const raw_counts: FetchResult['raw_counts'] = [];

  for (const q of queries) {
    const batch = Array.from({ length: 7 }, (_, i) => makeJob(q, location, i));
    jobs.push(...batch);
    raw_counts.push({
      source: 'mock',
      query: q,
      ok: true,
      skipped: false,
      count: batch.length,
      message: 'mock',
    });
  }

  const sources_breakdown = { mock: jobs.length };

  console.info('[mock engine] Generated', jobs.length, 'fixture jobs (Adzuna-shaped) for:', queries.join(', '));

  return {
    data: jobs,
    sources_breakdown,
    raw_counts,
    widened: false,
  };
}

import { isDemoApplyUrl, isHttpApplyUrl } from '@/lib/format-display';
import { canonicalApplyUrl } from './clean-jobs';
import type { CleanJob, FetchResult, RunSummary, ScoredJobRaw } from './types';

const MIN_SCORE_DEFAULT = 70;
const PROMISING_MIN_SCORE = 65;
const MIN_REPORT_JOBS = 3;
const MAX_REPORT_JOBS = 12;

const FRESH_HOURS = 6;
const WARM_HOURS = 24;
const RECENT_HOURS = 72;

function pickApplyUrl(enrichment: CleanJob, scoredApplyUrl?: string): string {
  const candidates = [
    enrichment.apply_url,
    enrichment.external_apply_url,
    scoredApplyUrl,
    enrichment.linkedin_url,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    if (isHttpApplyUrl(url) && !isDemoApplyUrl(url)) return url;
  }
  return '';
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  return [String(value)];
}

function ageHours(postedAt: string | null | undefined): number | null {
  if (!postedAt) return null;
  const t = new Date(postedAt).getTime();
  if (!Number.isFinite(t)) return null;
  const h = (Date.now() - t) / 3600000;
  return h < 0 ? null : h;
}

function freshnessTier(hours: number | null): string {
  if (hours == null) return 'unknown';
  if (hours < FRESH_HOURS) return 'fresh';
  if (hours < WARM_HOURS) return 'warm';
  if (hours < RECENT_HOURS) return 'recent';
  return 'stale';
}

function freshnessBonus(hours: number | null): number {
  if (hours == null) return 0;
  if (hours < FRESH_HOURS) return 8;
  if (hours < WARM_HOURS) return 4;
  if (hours < RECENT_HOURS) return 1;
  return 0;
}

interface NormalizedJob {
  ai: ScoredJobRaw;
  enrichment: CleanJob;
  job_title: string;
  company: string;
  apply_url: string;
  match_score: number;
  resume_fit_score: number;
  schedule_fit_score: number;
  location_fit_score: number;
  opportunity_score: number;
  quality_flags: string[];
  risk_flags: string[];
  talking_points: string[];
  cover_letter_hook: string;
  quality_tier: string;
  quality_index: number;
  age_hours: number | null;
  freshness_tier: string;
  include: boolean;
}

function normalizeJob(scored: ScoredJobRaw, enrichment: CleanJob, minScore: number): NormalizedJob {
  const resume = toNumber(scored.resume_fit_score);
  const schedule = toNumber(scored.schedule_fit_score);
  const location = toNumber(scored.location_fit_score);
  const opportunity = toNumber(scored.opportunity_score);
  const modelScore = toNumber(scored.match_score);
  const subtotal = resume + schedule + location + opportunity;
  const matchScore = modelScore > 0 ? modelScore : subtotal;
  const qualityFlags = toList(scored.quality_flags);
  const riskFlags = toList(scored.risk_flags);
  const talkingPoints = toList(scored.talking_points).slice(0, 3);
  const ageH = ageHours(enrichment.posted_at);
  const tier = freshnessTier(ageH);
  const freshBonus = freshnessBonus(ageH);

  let qualityTier = 'Promising';
  if (matchScore >= 85 && Math.min(resume || 30, schedule || 25, location || 20) >= 14) {
    qualityTier = 'High Quality';
  } else if (matchScore < MIN_SCORE_DEFAULT) {
    qualityTier = 'Watchlist';
  }

  const promisingSignal =
    opportunity >= 18 ||
    qualityFlags.some((flag) =>
      /growth|training|remote|hybrid|local|commission|income|telecom|saas|b2b|flex/i.test(flag),
    );

  const include =
    matchScore >= minScore ||
    (matchScore >= PROMISING_MIN_SCORE &&
      promisingSignal &&
      (location >= 14 || schedule >= 14) &&
      riskFlags.length <= 2);

  const qualityIndex =
    matchScore +
    Math.min(6, qualityFlags.length * 2) -
    Math.min(8, riskFlags.length * 2) +
    (promisingSignal ? 3 : 0) +
    freshBonus +
    (enrichment.direct_ats ? 2 : 0);

  const preferredApplyUrl = pickApplyUrl(enrichment, scored.apply_url);

  return {
    ai: scored,
    enrichment,
    job_title: scored.job_title || enrichment.job_title || '',
    company: scored.company || enrichment.company || '',
    apply_url: preferredApplyUrl,
    match_score: Math.round(matchScore),
    resume_fit_score: resume,
    schedule_fit_score: schedule,
    location_fit_score: location,
    opportunity_score: opportunity,
    quality_flags: qualityFlags,
    risk_flags: riskFlags,
    talking_points: talkingPoints,
    cover_letter_hook: typeof scored.cover_letter_hook === 'string' ? scored.cover_letter_hook : '',
    quality_tier: qualityTier,
    quality_index: qualityIndex,
    age_hours: ageH,
    freshness_tier: tier,
    include,
  };
}

export interface JobInsertRow {
  run_id: string;
  external_id: string | null;
  canonical_url: string;
  job_title: string;
  company: string;
  publisher: string | null;
  source: string;
  location: string | null;
  remote: boolean;
  posted_at: string | null;
  apply_url: string;
  linkedin_url: string | null;
  direct_ats: boolean;
  description: string | null;
  match_score: number;
  quality_tier: string;
  fit_verdict: string | null;
  resume_fit_score: number;
  schedule_fit_score: number;
  location_fit_score: number;
  opportunity_score: number;
  quality_flags: string[];
  risk_flags: string[];
  key_advantages: string | null;
  gaps_or_objections: string | null;
  why_promising: string | null;
  cover_letter_hook: string | null;
  talking_points: string[];
  company_industry: string | null;
  company_employees: string | null;
  company_size: string | null;
  company_followers: string | null;
  ai_scores: {
    age_hours: number | null;
    freshness_tier: string;
    quality_index: number;
    role_summary?: string | null;
    experience_match?: string | null;
  };
}

export interface SeenUpsertRow {
  user_id: string;
  canonical_key: string;
  first_seen: string;
  last_seen: string;
}

export interface PostProcessResult {
  summary: RunSummary;
  jobs_payload: JobInsertRow[];
  seen_payload: SeenUpsertRow[];
}

export function postProcessScores(
  scored: ScoredJobRaw[],
  fetchMeta: Pick<FetchResult, 'sources_breakdown' | 'raw_counts' | 'widened'>,
  ctx: {
    run_id: string;
    user_id: string | null;
    min_score: number;
    max_report_jobs?: number;
    min_report_jobs?: number;
    seen_backfilled_count?: number;
    seen_backfill_keys?: Set<string>;
  },
): PostProcessResult {
  if (!scored.length) {
    throw new Error('Could not parse any AI job scores.');
  }

  const minScore = ctx.min_score || MIN_SCORE_DEFAULT;
  const maxReport = ctx.max_report_jobs ?? MAX_REPORT_JOBS;
  const minReport = ctx.min_report_jobs ?? MIN_REPORT_JOBS;
  const seenBackfilled = ctx.seen_backfilled_count ?? 0;
  const seenBackfillKeys = ctx.seen_backfill_keys ?? new Set<string>();

  const allNormalized = scored
    .map((s) => {
      const enrichment =
        s._clean ||
        ({
          job_title: s.job_title || '',
          company: s.company || '',
          apply_url: s.apply_url || '',
          apply_url_canonical: canonicalApplyUrl(s.apply_url || ''),
          job_id: '',
          description_clean: '',
          location: '',
          is_remote: false,
          posted_at: '',
          employment_type: '',
          publisher: '',
          source: 'unknown',
          matched_query: '',
          direct_ats: false,
          external_apply_url: '',
          linkedin_url: '',
          company_employees: '',
          company_size: '',
          company_industry: '',
          company_followers: '',
          seniority: '',
        } as CleanJob);
      return normalizeJob(s, enrichment, minScore);
    })
    .sort((a, b) => b.quality_index - a.quality_index);

  const qualified = allNormalized.filter((j) => j.include);

  let displayed: NormalizedJob[];
  let floored = false;
  let bannerLabel: string;

  if (qualified.length >= minReport) {
    displayed = qualified.slice(0, maxReport);
    bannerLabel = maxReport === 1 ? 'Your best match' : 'Quality matches';
  } else {
    floored = true;
    const extras = allNormalized
      .filter((j) => !j.include)
      .slice(0, minReport - qualified.length)
      .map((j) => ({ ...j, quality_tier: 'Lower quality day' }));
    displayed = [...qualified, ...extras].slice(0, minReport);
    bannerLabel =
      maxReport === 1
        ? 'Best available match'
        : `Lower quality day, top ${displayed.length} of ${allNormalized.length} scanned`;
  }

  const omittedCount = Math.max(0, qualified.length - displayed.length);
  const freshCount = displayed.filter((j) => j.freshness_tier === 'fresh').length;
  const warmCount = displayed.filter((j) => j.freshness_tier === 'warm').length;
  const directAtsCount = displayed.filter((j) => j.enrichment.direct_ats).length;

  const jobsPayload: JobInsertRow[] = displayed.map((j) => ({
    run_id: ctx.run_id,
    external_id: j.enrichment.job_id || null,
    canonical_url: canonicalApplyUrl(j.apply_url) || j.apply_url || '',
    job_title: j.job_title,
    company: j.company,
    publisher: j.enrichment.publisher || null,
    source: j.enrichment.source || 'unknown',
    location: j.enrichment.location || null,
    remote: !!j.enrichment.is_remote,
    posted_at: j.enrichment.posted_at || null,
    apply_url: j.apply_url,
    linkedin_url: j.enrichment.linkedin_url || null,
    direct_ats: !!j.enrichment.direct_ats,
    description: j.enrichment.description_clean || null,
    match_score: j.match_score,
    quality_tier: j.quality_tier,
    fit_verdict: j.ai.fit_verdict || null,
    resume_fit_score: j.resume_fit_score,
    schedule_fit_score: j.schedule_fit_score,
    location_fit_score: j.location_fit_score,
    opportunity_score: j.opportunity_score,
    quality_flags: j.quality_flags,
    risk_flags: j.risk_flags,
    key_advantages: j.ai.key_advantages || null,
    gaps_or_objections: j.ai.gaps_or_objections || null,
    why_promising: j.ai.why_promising || null,
    cover_letter_hook: j.cover_letter_hook || null,
    talking_points: j.talking_points,
    company_industry: j.enrichment.company_industry || null,
    company_employees: j.enrichment.company_employees || null,
    company_size: j.enrichment.company_size || null,
    company_followers: j.enrichment.company_followers || null,
    ai_scores: {
      age_hours: j.age_hours,
      freshness_tier: j.freshness_tier,
      quality_index: j.quality_index,
      role_summary: j.ai.role_summary || null,
      experience_match: j.ai.experience_match || null,
    },
  }));

  const nowIso = new Date().toISOString();
  // Only mark jobs the user actually saw — not every scored candidate — so repeat
  // searches are not exhausted after one run (especially with mock fixtures).
  const seenPayload: SeenUpsertRow[] = ctx.user_id
    ? displayed
        .map((j) => {
          const canonical = j.enrichment.job_id
            ? `id:${j.enrichment.job_id}`
            : canonicalApplyUrl(j.apply_url)
              ? `url:${canonicalApplyUrl(j.apply_url)}`
              : '';
          if (!canonical || seenBackfillKeys.has(canonical)) return null;
          return {
            user_id: ctx.user_id as string,
            canonical_key: canonical,
            first_seen: nowIso,
            last_seen: nowIso,
          };
        })
        .filter((r): r is SeenUpsertRow => r !== null)
    : [];

  const summary: RunSummary = {
    match_count: displayed.length,
    parsed_count: allNormalized.length,
    qualified_count: qualified.length,
    omitted_count: omittedCount,
    fresh_count: freshCount,
    warm_count: warmCount,
    direct_ats_count: directAtsCount,
    floored,
    banner_label: bannerLabel,
    seen_backfilled_count: seenBackfilled > 0 ? seenBackfilled : undefined,
    sources_breakdown: fetchMeta.sources_breakdown,
    widened: fetchMeta.widened,
    raw_counts: fetchMeta.raw_counts,
  };

  return { summary, jobs_payload: jobsPayload, seen_payload: seenPayload };
}

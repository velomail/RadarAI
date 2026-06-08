export interface EnginePayload {
  run_id: string;
  user_id: string | null;
  anonymous_session: string | null;
  resume_text: string;
  queries: string[];
  widen_queries?: string[];
  location: string;
  min_score?: number;
  min_raw_jobs?: number;
  remote_only?: boolean;
  employment_types?: string[];
  search_focus?: string;
  max_report_jobs?: number;
  min_report_jobs?: number;
}

export interface RawJob {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  job_apply_link?: string;
  apply_link?: string;
  job_description?: string;
  description?: string;
  job_publisher?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_location?: string;
  job_is_remote?: boolean;
  job_posted_at_datetime_utc?: string;
  job_posted_at?: string;
  job_employment_type?: string;
  source?: string;
  direct_ats?: boolean;
  external_apply_url?: string;
  linkedin_url?: string;
  linkedin_org_employees?: string;
  linkedin_org_size?: string;
  linkedin_org_industry?: string;
  linkedin_org_followers?: string;
  seniority?: string;
  _matched_query?: string;
}

export interface CleanJob {
  job_id: string;
  apply_url: string;
  apply_url_canonical: string;
  company: string;
  job_title: string;
  description_clean: string;
  location: string;
  is_remote: boolean;
  posted_at: string;
  employment_type: string;
  publisher: string;
  source: string;
  matched_query: string;
  direct_ats: boolean;
  external_apply_url: string;
  linkedin_url: string;
  company_employees: string;
  company_size: string;
  company_industry: string;
  company_followers: string;
  seniority: string;
}

export interface FetchResult {
  data: RawJob[];
  sources_breakdown: Record<string, number>;
  raw_counts: Array<{
    source: string;
    query: string;
    ok: boolean;
    skipped: boolean;
    count: number;
    message: string;
  }>;
  widened: boolean;
}

export interface ScoredJobRaw {
  job_title?: string;
  company?: string;
  match_score?: number | string;
  fit_verdict?: string;
  resume_fit_score?: number | string;
  schedule_fit_score?: number | string;
  location_fit_score?: number | string;
  opportunity_score?: number | string;
  quality_flags?: string[] | string;
  risk_flags?: string[] | string;
  key_advantages?: string;
  gaps_or_objections?: string;
  why_promising?: string;
  role_summary?: string;
  experience_match?: string;
  cover_letter_hook?: string;
  talking_points?: string[] | string;
  apply_url?: string;
  _clean?: CleanJob;
}

export interface RunSummary {
  match_count: number;
  parsed_count: number;
  qualified_count: number;
  omitted_count: number;
  fresh_count: number;
  warm_count: number;
  direct_ats_count: number;
  floored: boolean;
  banner_label: string;
  seen_backfilled_count?: number;
  sources_breakdown: Record<string, number>;
  widened: boolean;
  raw_counts: FetchResult['raw_counts'];
}

export interface EngineResult {
  ok: boolean;
  run_id: string;
  user_id: string | null;
  summary: RunSummary;
}

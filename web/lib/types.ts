export type RunStatus = 'pending' | 'running' | 'success' | 'error';

export type SavedJobStatus =
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'rejected'
  | 'withdrawn';

export interface Resume {
  id: string;
  user_id: string;
  storage_path: string;
  original_filename: string | null;
  parsed_text: string;
  char_count: number;
  created_at: string;
}

export interface SearchProfile {
  id: string;
  user_id: string;
  name: string;
  resume_id: string;
  queries: string[];
  location: string;
  employment_types: string[];
  remote_only: boolean;
  min_score: number;
  notify_email: string | null;
  notify_telegram_chat_id: string | null;
  schedule_cron: string;
  search_focus: string;
  active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  user_id: string | null;
  search_profile_id: string | null;
  anonymous_session: string | null;
  status: RunStatus;
  trigger: string;
  started_at: string;
  completed_at: string | null;
  scanned_count: number;
  qualified_count: number;
  reported_count: number;
  fresh_count: number;
  warm_count: number;
  direct_ats_count: number;
  widened: boolean;
  floored: boolean;
  sources_breakdown: Record<string, number>;
  raw_counts: unknown[];
  banner_label: string | null;
  error: string | null;
}

export interface UserUsage {
  user_id: string;
  queries_today: number;
  last_query_date: string | null;
  plan: 'free' | 'pro';
  updated_at: string;
}

export interface Job {
  id: string;
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
  quality_tier: string | null;
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
    age_hours?: number | null;
    freshness_tier?: string;
    quality_index?: number;
    role_summary?: string | null;
    experience_match?: string | null;
  };
  created_at: string;
}

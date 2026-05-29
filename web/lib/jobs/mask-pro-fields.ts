import type { Job } from '@/lib/types';
import type { UserPlan } from '@/lib/plan';

/** Strip Pro-only fields from API responses for free-tier users. */
export function maskProFieldsForPlan(jobs: Job[], plan: UserPlan): Job[] {
  if (plan === 'pro') return jobs;
  return jobs.map(maskSingleJobForFree);
}

function maskSingleJobForFree(job: Job): Job {
  return {
    ...job,
    cover_letter_hook: null,
    talking_points: [],
    key_advantages: null,
    gaps_or_objections: null,
    company_industry: null,
    company_employees: null,
    company_size: null,
    company_followers: null,
    resume_fit_score: 0,
    schedule_fit_score: 0,
    location_fit_score: 0,
    opportunity_score: 0,
    ai_scores: {
      ...job.ai_scores,
      role_summary: null,
      experience_match: null,
    },
  };
}

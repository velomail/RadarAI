import type { Job } from '@/lib/types';
import { formatJobPublisher } from '@/lib/format-display';
import { stripPostingBoilerplate } from '@/lib/job-posting-format';

export type MatchTier = 'strong' | 'good' | 'fair';

export const SCORE_DIMENSIONS = [
  { key: 'resume', label: 'Resume fit', max: 30, hint: 'Skills, titles, and outcomes vs. this posting' },
  { key: 'schedule', label: 'Arrangement', max: 25, hint: 'Full-time, remote, hybrid, and schedule fit' },
  { key: 'location', label: 'Location', max: 20, hint: 'Commute, remote eligibility, and market match' },
  { key: 'opportunity', label: 'Opportunity', max: 25, hint: 'Growth path, employer quality, and upside' },
] as const;

export function matchTier(score: number): MatchTier {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'good';
  return 'fair';
}

export function matchTierLabel(score: number): string {
  const tier = matchTier(score);
  if (tier === 'strong') return 'Strong resume match';
  if (tier === 'good') return 'Good resume match';
  return 'Fair match — review gaps';
}

export function fitVerdictLabel(verdict: string | null | undefined): string | null {
  if (!verdict) return null;
  const v = verdict.toUpperCase();
  if (v === 'HIGH') return 'Strong fit';
  if (v === 'MEDIUM') return 'Good fit';
  if (v === 'LOW') return 'Stretch role';
  return verdict;
}

/** Normalize noisy scraped titles for display. */
export function formatJobTitle(title: string | null | undefined): string {
  if (!title?.trim()) return 'Untitled role';
  let t = title.trim().replace(/\s+/g, ' ');
  t = t.replace(/^(job\s+)?description\s*[-:]\s*/i, '');
  const letters = t.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 4 && letters === letters.toUpperCase()) {
    t = t
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase())
      .replace(/\b(And|Or|The|In|At|For|To|Of|A|An)\b/g, (m) => m.toLowerCase())
      .replace(/^./, (m) => m.toUpperCase());
  }
  return t;
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  if (match) return match[0].trim();
  return trimmed.length > 155 ? `${trimmed.slice(0, 152)}…` : trimmed;
}

/** One-line hook for list cards — prioritizes resume-personalized copy. */
export function jobListPreviewLine(job: Job): string | null {
  const why = job.why_promising?.trim();
  if (why) return firstSentence(why);

  const experience = job.ai_scores?.experience_match?.trim();
  if (experience) return firstSentence(experience);

  const summary = job.ai_scores?.role_summary?.trim();
  if (summary) return firstSentence(summary);

  const desc = job.description?.trim();
  if (!desc) return null;
  return firstSentence(stripPostingBoilerplate(desc));
}

export function freshnessLabel(tier?: string, ageHours?: number | null): string {
  if (tier === 'fresh') return 'Posted today';
  if (tier === 'warm') return 'Posted this week';
  if (tier === 'recent') return 'Posted <72h ago';
  if (ageHours != null) return `Posted ${Math.max(1, Math.round(ageHours / 24))}d ago`;
  return 'Date unknown';
}

export function jobMetaLine(job: Job): string {
  const parts = [job.company];
  if (job.location) parts.push(job.location);
  if (job.remote) parts.push('Remote');
  const age = freshnessLabel(job.ai_scores?.freshness_tier, job.ai_scores?.age_hours);
  if (age !== 'Date unknown') parts.push(age);
  return parts.join(' · ');
}

export function jobPublisherLine(job: Job): string | null {
  return formatJobPublisher(job.publisher);
}

/** @deprecated Prefer jobListPreviewLine for list UI. */
export function jobSummaryLine(job: Job): string | null {
  return jobListPreviewLine(job);
}

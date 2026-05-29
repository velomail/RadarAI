import type { CleanJob } from './types';

/** Score the most promising jobs first so caps keep quality under time limits. */
export function prioritizeJobsForScoring(jobs: CleanJob[]): CleanJob[] {
  return [...jobs].sort((a, b) => scoreJob(a) - scoreJob(b));
}

function scoreJob(job: CleanJob): number {
  let s = 0;
  if (job.direct_ats) s -= 40;
  if (job.posted_at) {
    const age = Date.now() - new Date(job.posted_at).getTime();
    if (!Number.isNaN(age) && age < 3 * 24 * 60 * 60 * 1000) s -= 20;
  }
  if (job.description_clean.length >= 200) s -= 10;
  return s;
}

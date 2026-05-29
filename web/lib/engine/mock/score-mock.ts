import type { CleanJob, ScoredJobRaw } from '../types';

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const t of a) if (b.has(t)) hit++;
  return hit / Math.max(a.size, b.size);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function scoreJobsMock(jobs: CleanJob[], resumeText: string): ScoredJobRaw[] {
  const resumeTokens = tokens(resumeText);

  return jobs.map((job) => {
    const jobTokens = tokens(`${job.job_title} ${job.description_clean}`);
    const overlap = overlapScore(resumeTokens, jobTokens);
    const base = 52 + overlap * 45;
    const remoteBonus = job.is_remote ? 4 : 0;
    const directBonus = job.direct_ats ? 3 : 0;
    const matchScore = clamp(base + remoteBonus + directBonus, 55, 94);

    const resumeFit = clamp(matchScore * 0.3, 14, 28);
    const scheduleFit = clamp(16 + (job.employment_type?.includes('PART') ? 6 : 0), 12, 24);
    const locationFit = clamp(job.is_remote ? 18 : 14, 10, 20);
    const opportunity = clamp(18 + directBonus, 12, 24);

    let fitVerdict: string = 'MEDIUM';
    if (matchScore >= 80) fitVerdict = 'HIGH';
    else if (matchScore < 65) fitVerdict = 'LOW';

    const roleSummary = `${job.job_title} at ${job.company} — ${job.is_remote ? 'remote-friendly' : 'on-site'} role focused on ${job.matched_query || 'core team deliverables'}. ${job.description_clean.slice(0, 180)}…`;

    const overlapPct = Math.round(overlap * 100);
    const experienceMatch =
      overlap >= 0.08
        ? `Your resume aligns with this posting on skills and role scope (~${overlapPct}% keyword overlap). Strongest fit around ${job.matched_query || job.job_title}.`
        : `Partial alignment with your background (~${overlapPct}% overlap). Worth reviewing if you want to pivot toward ${job.matched_query || job.job_title}.`;

    const qualityFlags = job.direct_ats
      ? ['Direct apply', 'Verified listing']
      : job.is_remote
        ? ['Remote-friendly', 'Full-time']
        : ['Full-time'];

    return {
      job_title: job.job_title,
      company: job.company,
      match_score: matchScore,
      fit_verdict: fitVerdict,
      resume_fit_score: resumeFit,
      schedule_fit_score: scheduleFit,
      location_fit_score: locationFit,
      opportunity_score: opportunity,
      role_summary: roleSummary,
      experience_match: experienceMatch,
      quality_flags: qualityFlags,
      risk_flags: matchScore < 68 ? ['Moderate fit — review gaps before applying'] : [],
      key_advantages: overlap >= 0.08 ? 'Transferable skills match posting keywords.' : 'General professional background.',
      gaps_or_objections: overlap < 0.08 ? 'Limited keyword overlap — consider tailoring your resume.' : '',
      why_promising: `${job.company} offers a clear ${job.job_title} path with ${job.is_remote ? 'remote flexibility' : 'local presence'}.`,
      cover_letter_hook: `I am interested in the ${job.job_title} role at ${job.company} because my background maps to the responsibilities described, and I am ready to contribute from day one.`,
      talking_points: [
        `Experience relevant to ${job.matched_query || job.job_title}`,
        job.is_remote ? 'Open to remote / hybrid arrangement' : `Based near ${job.location || 'your market'}`,
        'Quick learner with documented results on prior teams',
      ],
      apply_url: job.apply_url,
      _clean: job,
    } satisfies ScoredJobRaw;
  });
}

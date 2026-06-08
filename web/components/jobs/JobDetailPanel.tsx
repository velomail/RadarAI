import type { ReactNode } from 'react';
import type { Job } from '@/lib/types';
import { APP_NAME } from '@/lib/brand';
import { filterDisplayFlags, resolveJobApplyUrl } from '@/lib/format-display';
import {
  formatJobPostingSections,
  parseNarrativeBullets,
} from '@/lib/job-posting-format';
import {
  SCORE_DIMENSIONS,
  fitVerdictLabel,
  formatJobTitle,
  jobMetaLine,
  jobPublisherLine,
  matchTierLabel,
} from '@/lib/job-display';
import { MatchScoreBadge } from './MatchScoreBadge';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

function ScorePill({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint: string;
}) {
  if (value <= 0) return null;
  return (
    <div className="rounded-md border border-border px-3 py-2" title={hint}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">
        {value}
        <span className="text-xs font-normal text-muted-foreground">/{max}</span>
      </p>
      <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NarrativeBlock({
  title,
  subtitle,
  children,
  highlight = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <section className={highlight ? 'surface border-l-2 border-foreground p-5' : 'space-y-2'}>
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function scoreValue(job: Job, key: (typeof SCORE_DIMENSIONS)[number]['key']): number {
  switch (key) {
    case 'resume':
      return job.resume_fit_score;
    case 'schedule':
      return job.schedule_fit_score;
    case 'location':
      return job.location_fit_score;
    case 'opportunity':
      return job.opportunity_score;
    default:
      return 0;
  }
}

export function JobDetailPanel({
  job,
  stickyAboveNav = false,
}: {
  job: Job;
  stickyAboveNav?: boolean;
}) {
  const roleSummary = job.ai_scores?.role_summary;
  const experienceMatch = job.ai_scores?.experience_match;
  const whyPromising = job.why_promising;
  const strengths = parseNarrativeBullets(job.key_advantages);
  const gaps = parseNarrativeBullets(job.gaps_or_objections);
  const postingSections = formatJobPostingSections(job.description);
  const displayFlags = filterDisplayFlags(job.quality_flags);
  const applyHref = resolveJobApplyUrl(
    job.apply_url,
    job.canonical_url,
    job.linkedin_url,
    job.source,
  );
  const hasApplyHref = Boolean(applyHref);
  const publisher = jobPublisherLine(job);
  const verdict = fitVerdictLabel(job.fit_verdict);

  const hasMatchNarrative = Boolean(whyPromising || experienceMatch || strengths.length || gaps.length);
  const hasScoreBreakdown = SCORE_DIMENSIONS.some((d) => scoreValue(job, d.key) > 0);

  return (
    <article className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {matchTierLabel(job.match_score)}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-tight tracking-tight">
              {formatJobTitle(job.job_title)}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{jobMetaLine(job)}</p>
            {publisher ? (
              <p className="mt-1 text-xs text-muted-foreground">Listed via {publisher}</p>
            ) : null}
          </div>
          <MatchScoreBadge score={job.match_score} className="text-sm" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {job.direct_ats ? <Badge variant="muted">Direct apply</Badge> : null}
          {verdict ? <Badge variant="muted">{verdict}</Badge> : null}
          {job.quality_tier ? <Badge variant="muted">{job.quality_tier}</Badge> : null}
          {job.remote ? <Badge variant="muted">Remote</Badge> : null}
        </div>
      </header>

      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
        {hasMatchNarrative ? (
          <NarrativeBlock
            title="Why this fits your resume"
            subtitle={`${APP_NAME} compared this posting to your uploaded resume — not generic keyword filters.`}
            highlight
          >
            {whyPromising ? (
              <p className="leading-relaxed">{whyPromising}</p>
            ) : experienceMatch ? (
              <p className="leading-relaxed">{experienceMatch}</p>
            ) : null}
            {whyPromising && experienceMatch ? (
              <p className="mt-4 leading-relaxed text-muted-foreground">{experienceMatch}</p>
            ) : null}
            {strengths.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resume strengths for this role
                </p>
                <BulletList items={strengths} />
              </div>
            ) : null}
            {gaps.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Honest gaps to address
                </p>
                <BulletList items={gaps} />
              </div>
            ) : null}
          </NarrativeBlock>
        ) : (
          <NarrativeBlock
            title="Resume match analysis"
            subtitle="Run a new search to generate personalized fit notes for each listing."
          >
            <p className="text-muted-foreground">
              This listing was saved before detailed match narratives were available. Select another
              ranked role or start a fresh scan to see {APP_NAME}&apos;s resume-aware summaries.
            </p>
          </NarrativeBlock>
        )}

        {hasScoreBreakdown ? (
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              How {APP_NAME} scored this role
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Four dimensions — resume alignment, work arrangement, location, and opportunity quality.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SCORE_DIMENSIONS.map((dim) => (
                <ScorePill
                  key={dim.key}
                  label={dim.label}
                  value={scoreValue(job, dim.key)}
                  max={dim.max}
                  hint={dim.hint}
                />
              ))}
            </div>
          </section>
        ) : null}

        {roleSummary ? (
          <NarrativeBlock
            title="About this role"
            subtitle="Plain-English summary — like the overview on Indeed or LinkedIn, without the clutter."
          >
            <p>{roleSummary}</p>
          </NarrativeBlock>
        ) : null}

        {job.talking_points.length > 0 ? (
          <NarrativeBlock
            title="Application talking points"
            subtitle="Ready-made lines mapping your resume to requirements in this posting."
          >
            <BulletList items={job.talking_points} />
          </NarrativeBlock>
        ) : null}

        {job.cover_letter_hook ? (
          <NarrativeBlock title="Cover letter opener" subtitle="Paste-ready opening tailored to this role.">
            <p className="italic text-muted-foreground">{job.cover_letter_hook}</p>
          </NarrativeBlock>
        ) : null}

        {postingSections.length > 0 ? (
          <section className="space-y-6 border-t border-border pt-6">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Original listing
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Source posting text, cleaned and sectioned for easier reading.
              </p>
            </div>
            {postingSections.map((section, i) => (
              <div key={`${section.title}-${i}`} className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {section.body.split(/\n\n+/).map((para, j) => (
                    <p key={j} className="whitespace-pre-wrap">
                      {para.trim()}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {displayFlags.length > 0 ? (
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Listing signals
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {displayFlags.slice(0, 5).map((flag, i) => (
                <Badge key={i} variant="muted">
                  {flag}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer
        className={
          stickyAboveNav
            ? 'sticky bottom-[calc(3.25rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-background px-6 py-4 lg:static lg:bottom-auto'
            : 'sticky bottom-0 z-40 border-t border-border bg-background px-6 py-4 lg:static'
        }
      >
        {hasApplyHref ? (
          <a
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 bg-primary text-sm font-medium text-primary-foreground sm:w-auto sm:px-8"
          >
            Apply on employer site
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="inline-flex h-11 w-full items-center justify-center border border-border px-4 text-sm text-muted-foreground sm:w-auto">
            Apply link unavailable
          </span>
        )}
      </footer>
    </article>
  );
}

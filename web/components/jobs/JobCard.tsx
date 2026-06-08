import type { Job } from '@/lib/types';
import { filterDisplayFlags, formatJobPublisher, resolveJobApplyUrl } from '@/lib/format-display';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

function freshnessLabel(tier?: string, ageHours?: number | null) {
  if (tier === 'fresh') return 'Posted <6h ago';
  if (tier === 'warm') return 'Posted <24h ago';
  if (tier === 'recent') return 'Posted <72h ago';
  if (ageHours != null) return `${Math.round(ageHours / 24)}d ago`;
  return 'Date unknown';
}

export function JobCard({ job, rank }: { job: Job; rank?: number }) {
  const freshness = job.ai_scores?.freshness_tier;
  const ageH = job.ai_scores?.age_hours;
  const roleSummary = job.ai_scores?.role_summary;
  const experienceMatch = job.ai_scores?.experience_match;
  const displayFlags = filterDisplayFlags(job.quality_flags);
  const applyHref = resolveJobApplyUrl(
    job.apply_url,
    job.canonical_url,
    job.linkedin_url,
    job.source,
  );
  const hasApplyHref = Boolean(applyHref);
  const publisher = formatJobPublisher(job.publisher);

  return (
    <article className="surface overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {rank != null && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold">
                {rank}
              </span>
            )}
            <h3 className="text-lg font-semibold leading-tight">{job.job_title}</h3>
            {job.fit_verdict ? (
              <Badge variant="muted">{job.fit_verdict} fit</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
            {job.remote ? ' · Remote' : ''}
          </p>
          {publisher ? (
            <p className="text-xs text-muted-foreground">via {publisher}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-row items-center gap-4 md:flex-col md:items-end">
          <div className="text-right">
            <span className="text-3xl font-bold tabular-nums leading-none">{job.match_score}</span>
            <p className="text-xs text-muted-foreground">match score</p>
          </div>
          <Badge variant="muted">{freshnessLabel(freshness, ageH)}</Badge>
        </div>
      </header>

      <div className="flex flex-col gap-5 p-5">
        {roleSummary ? (
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              About this role
            </h4>
            <p className="mt-2 text-sm leading-relaxed">{roleSummary}</p>
          </section>
        ) : null}

        {experienceMatch ? (
          <section className="border border-border px-4 py-3">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              How you compare
            </h4>
            <p className="mt-2 text-sm leading-relaxed">{experienceMatch}</p>
          </section>
        ) : null}

        {!roleSummary && job.description ? (
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Job description
            </h4>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </section>
        ) : null}

        {(job.resume_fit_score > 0 ||
          job.schedule_fit_score > 0 ||
          job.location_fit_score > 0 ||
          job.opportunity_score > 0) && (
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <ScorePill label="Resume fit" value={job.resume_fit_score} max={30} />
            <ScorePill label="Arrangement" value={job.schedule_fit_score} max={25} />
            <ScorePill label="Location" value={job.location_fit_score} max={20} />
            <ScorePill label="Opportunity" value={job.opportunity_score} max={25} />
          </div>
        )}

        {job.cover_letter_hook ? (
          <section className="border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cover-letter hook
            </p>
            <p className="mt-2 text-sm italic leading-relaxed">{job.cover_letter_hook}</p>
          </section>
        ) : null}

        {job.talking_points?.length ? (
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Talking points
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              {job.talking_points.map((tp, i) => (
                <li key={i}>{tp}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {(job.key_advantages || job.gaps_or_objections) && (
          <div className="grid gap-4 md:grid-cols-2">
            {job.key_advantages ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Strengths
                </p>
                <p className="mt-1 text-sm">{job.key_advantages}</p>
              </div>
            ) : null}
            {job.gaps_or_objections ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gaps to address
                </p>
                <p className="mt-1 text-sm">{job.gaps_or_objections}</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-2">
            {job.direct_ats ? <Badge variant="muted">Direct apply</Badge> : null}
            {displayFlags.slice(0, 3).map((flag, i) => (
              <Badge key={i} variant="muted">
                {flag}
              </Badge>
            ))}
          </div>
          {hasApplyHref ? (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 bg-primary px-4 text-sm font-medium text-primary-foreground sm:ml-auto sm:w-auto"
            >
              Apply now
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex h-10 w-full items-center justify-center border border-border px-4 text-sm text-muted-foreground sm:ml-auto sm:w-auto">
              Apply link unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ScorePill({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="border border-border px-2 py-2">
      <div className="flex items-baseline justify-between gap-1">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums">
          {value}
          <span className="font-normal text-muted-foreground">/{max}</span>
        </p>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden bg-muted">
        <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

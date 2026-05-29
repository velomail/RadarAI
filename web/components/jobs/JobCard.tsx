import type { Job } from '@/lib/types';
import type { UserPlan } from '@/lib/plan';
import {
  filterDisplayFlags,
  formatSourceLabel,
} from '@/lib/format-display';
import { ProLockedSection } from '@/components/jobs/ProLockedSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

function freshnessVariant(tier?: string) {
  if (tier === 'fresh') return 'fresh' as const;
  if (tier === 'warm') return 'warm' as const;
  if (tier === 'recent') return 'recent' as const;
  return 'stale' as const;
}

function freshnessLabel(tier?: string, ageHours?: number | null) {
  if (tier === 'fresh') return 'Posted <6h ago';
  if (tier === 'warm') return 'Posted <24h ago';
  if (tier === 'recent') return 'Posted <72h ago';
  if (ageHours != null) return `${Math.round(ageHours / 24)}d ago`;
  return 'Date unknown';
}

function verdictVariant(v?: string | null) {
  if (v === 'HIGH') return 'success' as const;
  if (v === 'MEDIUM') return 'warm' as const;
  return 'muted' as const;
}

export function JobCard({
  job,
  rank,
  tier = 'free',
}: {
  job: Job;
  rank?: number;
  tier?: UserPlan;
}) {
  const freshness = job.ai_scores?.freshness_tier;
  const ageH = job.ai_scores?.age_hours;
  const roleSummary = job.ai_scores?.role_summary;
  const experienceMatch = job.ai_scores?.experience_match;
  const displayFlags = filterDisplayFlags(job.quality_flags);
  const applyHref = job.apply_url || job.canonical_url || job.linkedin_url || '';
  const hasApplyHref = Boolean(applyHref);
  const hasCompanyMeta =
    job.company_industry ||
    job.company_employees ||
    job.company_size ||
    job.company_followers;

  return (
    <Card className="glass overflow-hidden rounded-2xl transition-shadow hover:shadow-md">
      <CardHeader className="flex-col items-start gap-4 border-b border-border/40 bg-white/40 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {rank != null && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {rank}
              </span>
            )}
            <h3 className="text-lg font-semibold leading-tight">{job.job_title}</h3>
            {job.fit_verdict && (
              <Badge variant={verdictVariant(job.fit_verdict)}>{job.fit_verdict} fit</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
            {job.remote ? ' · Remote' : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {job.publisher ? `via ${job.publisher}` : null}
            {job.publisher && job.source ? ' · ' : null}
            {job.source ? formatSourceLabel(job.source) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-3xl font-bold tabular-nums leading-none text-primary">
            {job.match_score}
          </span>
          <span className="text-xs text-muted-foreground">match score</span>
          <Badge variant={freshnessVariant(freshness)} className="mt-1">
            {freshnessLabel(freshness, ageH)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-5">
        {roleSummary ? (
          <ProLockedSection tier={tier} title="Role summary — Pro">
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                About this role
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-foreground/95">{roleSummary}</p>
            </section>
          </ProLockedSection>
        ) : null}

        {experienceMatch ? (
          <ProLockedSection tier={tier} title="Experience comparison — Pro">
            <section className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
                How you compare
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-foreground/95">{experienceMatch}</p>
            </section>
          </ProLockedSection>
        ) : null}

        {!roleSummary && job.description && (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job description (excerpt)
            </h4>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </section>
        )}

        {tier === 'free' &&
        !roleSummary &&
        !experienceMatch &&
        !job.cover_letter_hook &&
        !(job.talking_points?.length) &&
        !job.key_advantages &&
        !job.gaps_or_objections ? (
          <ProLockedSection tier={tier} title="AI insights — Pro">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Role summary tailored to your resume</p>
              <p>Honest experience comparison vs. the posting</p>
              <p>Cover-letter hooks, talking points, and fit sub-scores</p>
            </div>
          </ProLockedSection>
        ) : null}

        {(job.resume_fit_score > 0 ||
          job.schedule_fit_score > 0 ||
          job.location_fit_score > 0 ||
          job.opportunity_score > 0) && (
          <ProLockedSection tier={tier} title="Detailed fit scores — Pro">
            <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
              <ScorePill label="Resume fit" value={job.resume_fit_score} max={30} />
              <ScorePill label="Arrangement" value={job.schedule_fit_score} max={25} />
              <ScorePill label="Location" value={job.location_fit_score} max={20} />
              <ScorePill label="Opportunity" value={job.opportunity_score} max={25} />
            </div>
          </ProLockedSection>
        )}

        {job.cover_letter_hook ? (
          <ProLockedSection tier={tier} title="Cover-letter hook — Pro">
            <div className="rounded-xl border border-border/60 bg-white/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cover-letter hook
              </p>
              <p className="mt-2 text-sm italic leading-relaxed">{job.cover_letter_hook}</p>
            </div>
          </ProLockedSection>
        ) : null}

        {job.talking_points?.length ? (
          <ProLockedSection tier={tier} title="Talking points — Pro">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Talking points
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {job.talking_points.map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
              </ul>
            </div>
          </ProLockedSection>
        ) : null}

        {(job.key_advantages || job.gaps_or_objections) && (
          <ProLockedSection tier={tier} title="Strengths & gaps — Pro">
            <div className="grid gap-3 md:grid-cols-2">
              {job.key_advantages && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--success))]">
                    Strengths
                  </p>
                  <p className="mt-1 text-sm">{job.key_advantages}</p>
                </div>
              )}
              {job.gaps_or_objections && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--warning))]">
                    Gaps to address
                  </p>
                  <p className="mt-1 text-sm">{job.gaps_or_objections}</p>
                </div>
              )}
            </div>
          </ProLockedSection>
        )}

        {hasCompanyMeta ? (
          <ProLockedSection tier={tier} title="Company insights — Pro">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {job.company_industry ? <span>{job.company_industry}</span> : null}
              {job.company_size ? <span>· {job.company_size}</span> : null}
              {job.company_employees ? <span>· {job.company_employees} employees</span> : null}
              {job.company_followers ? <span>· {job.company_followers} followers</span> : null}
            </div>
          </ProLockedSection>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {job.direct_ats && <Badge variant="success">Direct apply</Badge>}
          {displayFlags.slice(0, 3).map((flag, i) => (
            <Badge key={i} variant="muted">
              {flag}
            </Badge>
          ))}
          <div className="flex-1" />
          {hasApplyHref ? (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Apply now
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex h-9 cursor-default items-center justify-center rounded-full border border-border bg-muted px-4 text-sm font-medium text-muted-foreground">
              Apply link unavailable
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ScorePill({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="rounded-md border border-border bg-background px-2 py-2">
      <div className="flex items-baseline justify-between gap-1">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold tabular-nums text-foreground">
          {value}
          <span className="font-normal text-muted-foreground">/{max}</span>
        </p>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

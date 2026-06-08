'use client';

import type { Job } from '@/lib/types';
import {
  fitVerdictLabel,
  formatJobTitle,
  jobListPreviewLine,
  jobMetaLine,
  jobPublisherLine,
} from '@/lib/job-display';
import { MatchScoreBadge } from './MatchScoreBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  job: Job;
  rank?: number;
  selected?: boolean;
  onSelect: () => void;
};

export function JobCardListItem({ job, rank, selected, onSelect }: Props) {
  const preview = jobListPreviewLine(job);
  const publisher = jobPublisherLine(job);
  const verdict = fitVerdictLabel(job.fit_verdict);
  const hasResumeInsight = Boolean(job.why_promising || job.ai_scores?.experience_match);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full border-b border-border px-4 py-4 text-left transition-colors hover:bg-muted/40',
        selected && 'bg-muted/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {rank != null ? (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-semibold tabular-nums text-muted-foreground">
              {rank}
            </span>
          ) : null}
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {formatJobTitle(job.job_title)}
          </h3>
        </div>
        <MatchScoreBadge score={job.match_score} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{jobMetaLine(job)}</p>
      {preview ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/85">
          {hasResumeInsight ? (
            <span className="font-medium text-foreground">Match insight · </span>
          ) : null}
          {preview}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {job.direct_ats ? <Badge variant="muted">Direct apply</Badge> : null}
        {verdict ? <Badge variant="muted">{verdict}</Badge> : null}
        {publisher ? <span className="text-xs text-muted-foreground">via {publisher}</span> : null}
      </div>
    </button>
  );
}

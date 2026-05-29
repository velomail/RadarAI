import type { UserPlan } from '@/lib/plan';
import type { Job, Run } from '@/lib/types';
import { formatSourcesBreakdown } from '@/lib/format-display';
import { JobCard } from './JobCard';
import { Badge } from '@/components/ui/badge';

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/60 px-4 py-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function RunSummary({ run }: { run: Run }) {
  const sources = formatSourcesBreakdown(run.sources_breakdown);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="border-b border-border/40 bg-white/40 px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Search complete
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {run.banner_label || 'Top matches for your profile'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {run.fresh_count > 0 && <Badge variant="fresh">{run.fresh_count} posted today</Badge>}
            {run.warm_count > 0 && <Badge variant="warm">{run.warm_count} this week</Badge>}
            {run.direct_ats_count > 0 && (
              <Badge variant="success">{run.direct_ats_count} direct apply</Badge>
            )}
            {run.widened && <Badge variant="muted">Expanded search</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 py-4 md:px-6">
        <StatBlock label="Scanned" value={run.scanned_count} />
        <StatBlock label="Qualified" value={run.qualified_count} />
        <StatBlock label="Ranked for you" value={run.reported_count} />
      </div>

      {sources && (
        <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground md:px-6">
          Sources: {sources}
        </p>
      )}
    </div>
  );
}

export function JobsList({ jobs, tier = 'free' }: { jobs: Job[]; tier?: UserPlan }) {
  if (!jobs.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center">
        <p className="font-medium text-foreground">No matches surfaced this run</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try broadening your search focus or location, then run again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {jobs.length} role{jobs.length === 1 ? '' : 's'} ranked by fit — best match first
      </p>
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} rank={index + 1} tier={tier} />
      ))}
    </div>
  );
}

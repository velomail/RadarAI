import type { Job, Run } from '@/lib/types';
import { APP_NAME } from '@/lib/brand';
import { runUsesSampleData } from '@/lib/format-display';
import { JobsMasterDetail } from './JobsMasterDetail';
import { Badge } from '@/components/ui/badge';

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border px-4 py-3 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function RunSummary({ run }: { run: Run }) {
  const sampleData = runUsesSampleData(run.sources_breakdown);

  return (
    <div className="surface overflow-hidden">
      {sampleData ? (
        <div className="border-b border-border px-5 py-3 text-sm text-muted-foreground">
          Sample listings — configure live job API keys in production for real results.
        </div>
      ) : null}
      <div className="border-b border-border px-5 py-4 lg:px-6 lg:py-5">
        <p className="text-xs text-muted-foreground lg:text-sm">
          {APP_NAME} · scored against your resume
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight lg:text-2xl">
          {run.banner_label || 'Top matches for your profile'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each role includes a match score, plain-English role summary, and honest resume comparison
          — not just keyword search results.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {run.fresh_count > 0 ? (
            <Badge variant="muted">{run.fresh_count} posted today</Badge>
          ) : null}
          {run.warm_count > 0 ? (
            <Badge variant="muted">{run.warm_count} this week</Badge>
          ) : null}
          {run.direct_ats_count > 0 ? (
            <Badge variant="muted">{run.direct_ats_count} direct apply</Badge>
          ) : null}
          {run.widened ? <Badge variant="muted">Expanded search</Badge> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-3">
        <StatBlock label="Scanned" value={run.scanned_count} />
        <StatBlock label="Qualified" value={run.qualified_count} />
        <StatBlock label="Ranked" value={run.reported_count} />
      </div>
    </div>
  );
}

export function JobsList({ jobs }: { jobs: Job[] }) {
  return <JobsMasterDetail jobs={jobs} />;
}

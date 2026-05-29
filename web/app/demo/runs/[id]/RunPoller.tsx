'use client';

import { useEffect, useState } from 'react';
import type { UserPlan } from '@/lib/plan';
import type { Job, Run } from '@/lib/types';
import { JobsList, RunSummary } from '@/components/jobs/JobsList';

interface Status {
  run: Run;
  jobs: Job[];
  plan?: UserPlan;
}

const PIPELINE_STEPS = [
  'Fetching listings from job boards',
  'Deduplicating and normalizing',
  'Scoring against your resume',
  'Ranking top matches',
] as const;

function RunLoading({ status, elapsed }: { status: 'pending' | 'running'; elapsed: number }) {
  const stepIndex = Math.min(
    PIPELINE_STEPS.length - 1,
    status === 'pending' ? 0 : Math.floor(elapsed / 4),
  );

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm md:p-10">
      <h2 className="text-center text-xl font-semibold tracking-tight">
        {status === 'pending' ? 'Preparing your search' : 'Analyzing matches'}
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {elapsed}s elapsed · typically 15–45 seconds
      </p>

      <ul className="mx-auto mt-8 max-w-md space-y-3">
        {PIPELINE_STEPS.map((label, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 text-sm ${
                done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  done
                    ? 'bg-primary text-primary-foreground'
                    : active
                      ? 'animate-pulse bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ul>

      <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(95, 12 + elapsed * 3)}%` }}
        />
      </div>
    </div>
  );
}

export function RunPoller({
  runId,
  sessionHint,
  tier: tierProp,
}: {
  runId: string;
  sessionHint: 'demo' | 'auth';
  tier?: UserPlan;
}) {
  const [state, setState] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const url = `/api/runs/${runId}${sessionHint === 'demo' ? '?demo=1' : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 404) throw new Error('Run not found.');
          if (res.status === 403) throw new Error('Not authorized for this run.');
          throw new Error(`Status ${res.status}`);
        }
        const data = (await res.json()) as Status;
        if (cancelled) return;
        setState(data);
        if (data.run.status === 'success' || data.run.status === 'error') return;
        timer = setTimeout(tick, 2500);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    tick();

    const elapsedTimer = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(elapsedTimer);
    };
  }, [runId, sessionHint]);

  if (error) {
    return (
      <div className="rounded-xl border border-[hsl(var(--danger))] bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-[hsl(var(--danger))]">Something went wrong</h2>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-foreground">Starting your search…</p>
        <p className="text-xs text-muted-foreground">Connecting to the pipeline</p>
      </div>
    );
  }

  if (state.run.status === 'pending' || state.run.status === 'running') {
    return <RunLoading status={state.run.status} elapsed={elapsed} />;
  }

  if (state.run.status === 'error') {
    return (
      <div className="rounded-xl border border-[hsl(var(--danger))] bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-[hsl(var(--danger))]">Run failed</h2>
        <p className="mt-2 text-sm">{state.run.error || 'See logs for details.'}</p>
      </div>
    );
  }

  const tier = tierProp ?? state.plan ?? (sessionHint === 'demo' ? 'free' : 'free');

  return (
    <div className="flex flex-col gap-8">
      <RunSummary run={state.run} />
      <JobsList jobs={state.jobs} tier={tier} />
    </div>
  );
}

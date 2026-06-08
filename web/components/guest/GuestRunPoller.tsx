'use client';

import { useEffect, useState } from 'react';
import type { Job, Run } from '@/lib/types';
import { JobDetailPanel } from '@/components/jobs/JobDetailPanel';
import { GuestSignUpPrompt } from './GuestSignUpPrompt';

interface Status {
  run: Run;
  jobs: Job[];
  guest: boolean;
}

function RunLoading({ status, elapsed }: { status: 'pending' | 'running'; elapsed: number }) {
  return (
    <div className="surface rounded-lg p-8">
      <h2 className="text-xl font-semibold tracking-tight">
        {status === 'pending' ? 'Preparing your preview' : 'Finding your best match'}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {elapsed}s elapsed · we scan many listings and surface your strongest fit
      </p>
      <div className="mt-8 h-1 max-w-xs overflow-hidden bg-muted">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${Math.min(95, 12 + elapsed * 3)}%` }}
        />
      </div>
    </div>
  );
}

export function GuestRunPoller({ runId }: { runId: string }) {
  const [state, setState] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(`/api/guest/runs/${runId}`, { cache: 'no-store' });
        if (!res.ok) {
          if (res.status === 404) throw new Error('Run not found.');
          if (res.status === 403) throw new Error('Not authorized for this preview.');
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
  }, [runId]);

  if (error) {
    return (
      <div className="surface rounded-lg p-6">
        <h2 className="font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm font-medium">Starting your preview…</p>
      </div>
    );
  }

  if (state.run.status === 'pending' || state.run.status === 'running') {
    return <RunLoading status={state.run.status} elapsed={elapsed} />;
  }

  if (state.run.status === 'error') {
    return (
      <div className="space-y-6">
        <div className="surface rounded-lg p-6">
          <h2 className="font-semibold">Search failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.run.error || 'Try different keywords or location.'}
          </p>
        </div>
        <GuestSignUpPrompt />
      </div>
    );
  }

  const job = state.jobs[0];

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          {state.run.banner_label || 'Your best match'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground lg:text-base">
          Scanned {state.run.scanned_count} listings · showing your top fit
        </p>
      </div>

      {job ? (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <JobDetailPanel job={job} />
        </div>
      ) : (
        <div className="surface rounded-lg px-8 py-12 text-center">
          <p className="font-medium">No strong match this run</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try broader keywords or a different location tomorrow.
          </p>
        </div>
      )}

      <GuestSignUpPrompt />
    </div>
  );
}

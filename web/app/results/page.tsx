'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Radar, SlidersHorizontal, Sparkles } from 'lucide-react';
import { AuthWallModal } from '@/components/auth/AuthWallModal';
import { Button } from '@/components/ui/button';
import { JobCardReplica, type JobCardReplicaProps } from '@/components/redesign/JobCardReplica';
import { markGuestUsedInStorage, readGuestUsedFromStorage } from '@/lib/guest-limit';
import type { Job, Run } from '@/lib/types';

interface Status {
  run: Run;
  jobs: Job[];
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get('runId');
  const query = searchParams.get('q') || 'Search';
  const location = searchParams.get('location') || 'All locations';
  const isDemo = searchParams.get('demo') === 'true';
  const [state, setState] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authWallOpen, setAuthWallOpen] = useState(false);

  const onNewSearch = useCallback(
    (e: React.MouseEvent) => {
      if (readGuestUsedFromStorage()) {
        e.preventDefault();
        setAuthWallOpen(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (isDemo && state?.run.status === 'success') {
      markGuestUsedInStorage();
    }
  }, [isDemo, state?.run.status]);

  if (!runId) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">Missing run id.</p>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(`/api/runs/${runId}?demo=1`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
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

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [runId]);

  const jobs: JobCardReplicaProps[] = (state?.jobs || []).map((job) => ({
    id: job.id,
    title: job.job_title,
    company: job.company,
    location: job.location || (job.remote ? 'Remote' : 'Location unavailable'),
    salary: undefined,
    postedAt:
      job.ai_scores?.freshness_tier === 'fresh'
        ? '2 days ago'
        : job.ai_scores?.freshness_tier === 'warm'
          ? '1 week ago'
          : 'Recently',
    type: job.remote ? 'Remote' : 'Full-time',
    summary: job.ai_scores?.role_summary || job.why_promising || job.description || 'No summary available.',
    matchScore: job.match_score,
    strengths: (job.key_advantages || '')
      .split(/[•|\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3),
    gaps: (job.gaps_or_objections || '')
      .split(/[•|\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3),
    applyUrl: job.apply_url || job.canonical_url || job.linkedin_url || undefined,
  }));

  return (
    <div className="gradient-mesh min-h-screen">
      <AuthWallModal open={authWallOpen} onOpenChange={setAuthWallOpen} redirectPath="/demo" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-colors" />
                <Radar className="relative h-7 w-7 text-primary" />
              </div>
              <span className="font-semibold text-lg tracking-tight">RadarAI</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-xl">Create account</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="relative py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8">
            <Link
              href="/demo"
              onClick={onNewSearch}
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              New search
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{query}</h1>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
              <Button variant="outline" size="sm" className="glass self-start rounded-xl border-white/30">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {isDemo ? (
            <div className="glass-subtle rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Demo results</p>
                <p className="text-sm text-muted-foreground">
                  These are sample results to show how RadarAI works.{' '}
                  <Link href="/sign-up" className="text-primary font-medium hover:underline">
                    Create a free account
                  </Link>{' '}
                  to search real listings.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="glass rounded-2xl p-6 text-sm text-danger">Run failed: {error}</div>
          ) : !state || (state.run.status !== 'success' && state.run.status !== 'error') ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading results...</p>
            </div>
          ) : jobs.length ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCardReplica key={job.id} {...job} tier="free" />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              No matches surfaced this run.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="gradient-mesh flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <span className="text-muted-foreground">Loading results...</span>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

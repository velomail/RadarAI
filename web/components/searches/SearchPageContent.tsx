import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, CalendarSearch, ChevronRight } from 'lucide-react';
import { JobSearchCard } from '@/components/searches/JobSearchCard';
import { InitialSearchSetup } from '@/components/searches/InitialSearchSetup';
import { RunPoller } from '@/components/runs/RunPoller';
import { Badge } from '@/components/ui/badge';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import type { Resume, Run, SearchProfile } from '@/lib/types';

type SearchParams = { run?: string; error?: string };

export async function SearchPageContent({ searchParams }: { searchParams: SearchParams }) {
  const { run: runId, error } = searchParams;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const [{ data: profiles }, { data: latestResume }, { data: runs }] = await Promise.all([
    sb
      .from('search_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1),
    sb
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('runs')
      .select('id, status, started_at, reported_count, banner_label, trigger')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(8),
  ]);

  const profile = ((profiles as SearchProfile[]) ?? [])[0] ?? null;
  const resume = latestResume as Resume | null;
  const dailyUsage = await getDailyUsage(user.id);
  const tier = await getUserPlan(user.id);
  const recentRuns = (runs as Run[]) ?? [];

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-2">
        <header className="mb-8 w-full text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">Job search</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Set up your search</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Upload your resume and set keywords — then search from this screen.
          </p>
        </header>
        <div className="glass w-full rounded-2xl p-6 md:p-8">
          <InitialSearchSetup />
        </div>
      </div>
    );
  }

  if (runId) {
    const { data: run } = await sb
      .from('runs')
      .select('user_id, search_profile_id')
      .eq('id', runId)
      .maybeSingle();
    if (!run || run.user_id !== user.id || run.search_profile_id !== profile.id) {
      redirect('/dashboard');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-2">
      <header className="mb-8 w-full text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">Job search</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Your search</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Set keywords and location, then search — results appear below.
        </p>
      </header>

      <div className="glass w-full rounded-2xl p-6 md:p-8">
        <JobSearchCard
          profile={profile}
          resumeFilename={resume?.original_filename}
          dailyUsage={dailyUsage}
          error={error ?? null}
        />
      </div>

      {runId ? (
        <div className="mt-8 w-full">
          <RunPoller runId={runId} tier={tier} />
        </div>
      ) : null}

      {recentRuns.length > 0 && !runId ? (
        <section className="mt-10 w-full">
          <h2 className="mb-3 text-center text-sm font-semibold text-muted-foreground">Recent searches</h2>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white/75">
            {recentRuns.map((run) => (
              <Link
                key={run.id}
                href={`/dashboard?run=${run.id}`}
                className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3 text-sm transition-colors hover:bg-muted/35 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CalendarSearch className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate text-foreground">
                    {new Date(run.started_at).toLocaleDateString()}{' '}
                    {new Date(run.started_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={run.status === 'success' ? 'success' : 'muted'}>{run.status}</Badge>
                  <span className="tabular-nums text-muted-foreground">{run.reported_count}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

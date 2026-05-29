import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import { JobSearchCard } from '@/components/searches/JobSearchCard';
import { RunPoller } from '@/components/runs/RunPoller';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import type { Resume, SearchProfile } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{ run?: string; error?: string }>;
}

export default async function SearchesPage({ searchParams }: PageProps) {
  const { run: runId, error } = await searchParams;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const [{ data: profiles }, { data: latestResume }] = await Promise.all([
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
  ]);

  const profileList = (profiles as SearchProfile[]) ?? [];
  const profile = profileList[0] ?? null;
  const resume = latestResume as Resume | null;
  const dailyUsage = await getDailyUsage(user.id);
  const tier = await getUserPlan(user.id);

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-2">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Job search</h1>
          <p className="mt-2 text-muted-foreground">Set up your first search to get started.</p>
        </header>
        <div className="glass w-full rounded-2xl p-10 text-center">
          <Link
            href="/onboarding"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Set up first search
          </Link>
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
      redirect('/dashboard/searches');
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
    </div>
  );
}

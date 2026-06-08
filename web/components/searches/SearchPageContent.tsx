import { redirect } from 'next/navigation';

import { AppAsideShell } from '@/components/layout/AppAsideShell';

import { AppHeader } from '@/components/layout/AppHeader';

import { SearchMainPanel } from '@/components/searches/SearchMainPanel';

import { SearchSidebar } from '@/components/searches/SearchSidebar';

import { getUserPlan } from '@/lib/plan';

import { SEARCH_PAGE } from '@/lib/constants';

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

  const pastRuns = recentRuns.filter((r) => r.status === 'success' || r.status === 'error');



  if (runId && profile) {

    const { data: run } = await sb

      .from('runs')

      .select('user_id, search_profile_id')

      .eq('id', runId)

      .maybeSingle();

    if (!run || run.user_id !== user.id || run.search_profile_id !== profile.id) {

      redirect(SEARCH_PAGE);

    }

  }



  const headerTitle = runId ? 'Job results' : 'Job search';



  return (

    <div className="flex h-full min-h-0 flex-1">

      <AppAsideShell>

        <SearchSidebar profile={profile} resume={resume} dailyUsage={dailyUsage} />

      </AppAsideShell>



      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background md:bg-muted/25">

        <AppHeader title={headerTitle} email={user.email} />



        <div className="min-h-0 flex-1 overflow-y-auto pb-mobile-nav md:pb-0">

          <SearchMainPanel

            profile={profile}

            resume={resume}

            dailyUsage={dailyUsage}

            pastRuns={pastRuns}

            runId={runId}

            error={error ?? null}

            tier={tier}

          />

        </div>

      </div>

    </div>

  );

}


import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';
import { SearchProfileCard } from '@/components/dashboard/SearchProfileCard';
import { DashboardPage } from '@/components/layout/DashboardPage';
import { AccountResumeForm } from '@/components/profile/AccountResumeForm';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import type { Resume, SearchProfile } from '@/lib/types';
import { updateAccountResume } from './resume-actions';

export default async function SearchesPage() {
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
      .order('updated_at', { ascending: false }),
    sb
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const allProfiles = (profiles as SearchProfile[]) ?? [];
  const resume = latestResume as Resume | null;
  const dailyUsage = await getDailyUsage(user.id);

  if (!allProfiles.length) {
    return (
      <DashboardPage title="Your searches" description="Save criteria and run resume-aware scans.">
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">Upload your resume and define what roles you want.</p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Set up first search
          </Link>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Your searches"
      description="Saved criteria only — click Search now on a search when you're ready to scan."
      action={
        <Link
          href="/dashboard/searches/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
      }
    >
      <div className="glass rounded-2xl p-5">
        <DailyUsageMeter
          queriesToday={dailyUsage.queries_today}
          limit={dailyUsage.limit}
          plan={dailyUsage.plan}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Saved searches
        </div>
        {allProfiles.map((profile) => (
          <SearchProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div id="resume">
        <AccountResumeForm currentFilename={resume?.original_filename} action={updateAccountResume} />
      </div>
    </DashboardPage>
  );
}

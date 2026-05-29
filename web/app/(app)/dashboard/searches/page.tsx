import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';
import { SearchProfileCard } from '@/components/dashboard/SearchProfileCard';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import type { SearchProfile } from '@/lib/types';

export default async function SearchesPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: profiles } = await sb
    .from('search_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const allProfiles = (profiles as SearchProfile[]) ?? [];
  const dailyUsage = await getDailyUsage(user.id);

  if (!allProfiles.length) {
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Your searches</h1>
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">Upload your resume and define what roles you want.</p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Set up first search
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">Saved criteria</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your searches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Run a scan against your resume. Free plan: 3 searches per day.
          </p>
        </div>
        <Link
          href="/dashboard/searches/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New search
        </Link>
      </div>

      <div className="glass rounded-2xl p-5">
        <DailyUsageMeter
          queriesToday={dailyUsage.queries_today}
          limit={dailyUsage.limit}
          plan={dailyUsage.plan}
          compact
        />
      </div>

      <div className="flex flex-col gap-3">
        {allProfiles.map((profile) => (
          <SearchProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}

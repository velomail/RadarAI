import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';
import { SearchProfileCard } from '@/components/dashboard/SearchProfileCard';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
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
      <section className="flex max-w-3xl flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Your searches</h1>
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">Upload your resume and define what roles you want.</p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Set up first search
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex max-w-3xl flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">Saved criteria</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your searches</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Run a scan against your resume. Free plan: 3 searches per day.
          </p>
        </div>
        <Link
          href="/dashboard/searches/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New search
        </Link>
      </div>

      <form action={updateAccountResume} className="glass flex flex-col gap-4 rounded-2xl p-6">
        <div>
          <h2 className="text-lg font-semibold">Your resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Searches use your latest resume. Upload a new PDF anytime — it applies to all saved searches.
          </p>
        </div>
        <ResumeUploadField currentFilename={resume?.original_filename} required={false} />
        <Button type="submit" variant="outline" className="self-start">
          Update resume
        </Button>
      </form>

      <div className="glass rounded-2xl p-6">
        <DailyUsageMeter
          queriesToday={dailyUsage.queries_today}
          limit={dailyUsage.limit}
          plan={dailyUsage.plan}
        />
      </div>

      <div className="flex flex-col gap-5">
        {allProfiles.map((profile) => (
          <SearchProfileCard key={profile.id} profile={profile} resumeFilename={resume?.original_filename} />
        ))}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SearchProfileFields } from '@/components/profile/SearchProfileFields';
import { Button } from '@/components/ui/button';
import { SEARCH_PAGE } from '@/lib/constants';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Resume, SearchProfile } from '@/lib/types';
import { deleteProfile, updateProfile } from '@/app/(app)/dashboard/searches/[id]/actions';
import { clearSeenJobs } from '@/app/(app)/dashboard/settings/actions';

export default async function SearchSettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const [{ data: profile }, { data: resume }] = await Promise.all([
    sb
      .from('search_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile) notFound();
  const p = profile as SearchProfile;
  const latestResume = resume as Resume | null;

  const update = updateProfile.bind(null, p.id);
  const remove = deleteProfile.bind(null, p.id);

  return (
    <div className="flex w-full flex-col gap-8 lg:gap-10">
      <header>
        <h2 className="text-lg font-semibold tracking-tight lg:text-2xl">Search defaults</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-base">
          Default What/Where criteria, match threshold, and notifications for new searches.
        </p>
      </header>

      <div className="surface rounded-lg border border-border px-5 py-4 lg:px-6 lg:py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Resume on file
        </p>
        <p className="mt-1 text-sm font-medium">
          {latestResume?.original_filename || 'No resume uploaded'}
        </p>
        <Link
          href={SEARCH_PAGE}
          className="mt-2 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          Update resume on search page →
        </Link>
      </div>

      <form action={update} className="surface flex w-full flex-col gap-6 rounded-lg p-6 lg:gap-8 lg:p-8">
        <SearchProfileFields
          userEmail={user.email ?? ''}
          defaults={{
            name: p.name,
            search_focus: p.search_focus || 'auto',
            queries: p.queries.join(', '),
            location: p.location,
            remote_only: p.remote_only,
            min_score: p.min_score,
            notify_email: p.notify_email ?? '',
            email_on_complete: !!p.notify_email,
          }}
        />
        <Button type="submit" size="lg" className="self-start">
          Save changes
        </Button>
      </form>

      <div className="surface rounded-lg p-6 lg:p-8">
        <h2 className="font-semibold lg:text-xl">Shown job history</h2>
        <p className="mt-2 text-sm text-muted-foreground lg:text-base">
          Radar hides listings you were already shown in the last 14 days. Clear this if searches
          return no new matches and you want to see those roles again.
        </p>
        <form action={clearSeenJobs} className="mt-4">
          <Button type="submit" variant="outline" size="lg">
            Clear shown job history
          </Button>
        </form>
      </div>

      <div className="surface rounded-lg p-6 lg:p-8">
        <h2 className="font-semibold lg:text-xl">Reset search profile</h2>
        <p className="mt-2 text-sm text-muted-foreground lg:text-base">
          Removes saved criteria so you can set up again from scratch. Past run history is kept.
        </p>
        <form action={remove} className="mt-4">
          <Button type="submit" variant="danger" size="sm">
            Delete search profile
          </Button>
        </form>
      </div>
    </div>
  );
}

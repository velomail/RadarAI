import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DashboardPage } from '@/components/layout/DashboardPage';
import { SearchProfileFields } from '@/components/profile/SearchProfileFields';
import { Button } from '@/components/ui/button';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Resume, SearchProfile } from '@/lib/types';
import { deleteProfile, updateProfile } from '@/app/(app)/dashboard/searches/[id]/actions';

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
    <DashboardPage
      backHref="/dashboard"
      backLabel="Search"
      title="Email alerts & advanced settings"
      description="Optional notifications and saved search defaults."
    >
      <form action={update} className="glass flex w-full flex-col gap-8 rounded-2xl p-8">
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Resume:{' '}
          <span className="font-medium text-foreground">
            {latestResume?.original_filename || 'Not on file'}
          </span>
          {' · '}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            Update resume
          </Link>
        </div>
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

      <div className="w-full rounded-2xl border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 p-6">
        <h2 className="font-semibold text-[hsl(var(--danger))]">Reset search profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Removes saved criteria so you can set up again from scratch. Past run history is kept.
        </p>
        <form action={remove} className="mt-4">
          <Button type="submit" variant="danger" size="sm">
            Delete search profile
          </Button>
        </form>
      </div>
    </DashboardPage>
  );
}

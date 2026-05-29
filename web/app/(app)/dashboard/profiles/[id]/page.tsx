import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SearchProfileFields } from '@/components/profile/SearchProfileFields';
import { Button } from '@/components/ui/button';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { SearchProfile } from '@/lib/types';
import { deleteProfile, updateProfile } from './actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: profile } = await sb.from('search_profiles').select('*').eq('id', id).maybeSingle();
  if (!profile) notFound();
  if (profile.user_id !== user.id) notFound();
  const p = profile as SearchProfile;

  const update = updateProfile.bind(null, id);
  const remove = deleteProfile.bind(null, id);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Searches
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Edit search</h1>

      <form
        action={update}
        className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
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

      <div className="rounded-xl border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 p-4">
        <h2 className="font-semibold text-[hsl(var(--danger))]">Delete this search</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Removes the saved criteria. Past run history is kept.
        </p>
        <form action={remove} className="mt-3">
          <Button type="submit" variant="danger" size="sm">
            Delete search
          </Button>
        </form>
      </div>
    </section>
  );
}

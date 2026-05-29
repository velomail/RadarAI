import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SearchProfileFields } from '@/components/profile/SearchProfileFields';
import { Button } from '@/components/ui/button';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { createSearchProfile } from './actions';

export default async function NewSearchPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { count } = await sb
    .from('resumes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (!count) redirect('/onboarding');

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/dashboard/searches" className="text-sm text-muted-foreground hover:text-foreground">
        ← Searches
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Uses your existing resume. Add different keywords or location for another scan.
        </p>
      </div>

      <form
        action={createSearchProfile}
        className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <SearchProfileFields
          userEmail={user.email ?? ''}
          defaults={{
            name: 'My job search',
            location: 'Canada',
            min_score: 70,
          }}
        />
        <Button type="submit" size="lg" className="self-start">
          Save search
        </Button>
      </form>
    </section>
  );
}

import { redirect } from 'next/navigation';
import { DashboardPage } from '@/components/layout/DashboardPage';
import { SearchProfileFields } from '@/components/profile/SearchProfileFields';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Resume } from '@/lib/types';
import { createSearchProfile } from './actions';

export default async function NewSearchPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: latestResume } = await sb
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const resume = latestResume as Resume | null;
  if (!resume) redirect('/onboarding');

  return (
    <DashboardPage
      backHref="/dashboard/searches"
      backLabel="Searches"
      title="New search"
      description="Save job title keywords and location. No scan runs until you click Search now on your searches list."
    >
      <form action={createSearchProfile} className="glass flex flex-col gap-8 rounded-2xl p-8">
        <ResumeUploadField compact currentFilename={resume.original_filename} required={false} />
        <SearchProfileFields
          userEmail={user.email ?? ''}
          defaults={{
            name: 'My job search',
            location: 'Canada',
            min_score: 70,
          }}
        />
        <Button type="submit" size="lg" className="self-start">
          Save search criteria
        </Button>
      </form>
    </DashboardPage>
  );
}

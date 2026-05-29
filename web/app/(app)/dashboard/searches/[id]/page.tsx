import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Settings2 } from 'lucide-react';
import { DashboardPage } from '@/components/layout/DashboardPage';
import { SearchCriteriaSummary } from '@/components/searches/SearchCriteriaSummary';
import { SearchRunPanel } from '@/components/searches/SearchRunPanel';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { SearchProfile } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
}

export default async function SearchWorkspacePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { run: runId } = await searchParams;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: profile } = await sb.from('search_profiles').select('*').eq('id', id).maybeSingle();
  if (!profile) notFound();
  if (profile.user_id !== user.id) notFound();

  if (runId) {
    const { data: run } = await sb.from('runs').select('user_id, search_profile_id').eq('id', runId).maybeSingle();
    if (!run || run.user_id !== user.id || run.search_profile_id !== id) notFound();
  }

  const p = profile as SearchProfile;
  const tier = await getUserPlan(user.id);

  return (
    <DashboardPage
      backHref="/dashboard/searches"
      backLabel="Searches"
      title={p.name}
      description="Run a fresh scan — results load on this page."
      action={
        <Link
          href={`/dashboard/searches/${id}/edit`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted/50"
        >
          <Settings2 className="h-4 w-4" />
          Edit
        </Link>
      }
    >
      <SearchCriteriaSummary profile={p} />
      <SearchRunPanel profileId={id} runId={runId} tier={tier} />
    </DashboardPage>
  );
}

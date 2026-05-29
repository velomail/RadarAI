import { notFound, redirect } from 'next/navigation';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Legacy run URLs → search workspace with results inline. */
export default async function LegacyRunRedirect({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: run } = await sb
    .from('runs')
    .select('user_id, search_profile_id')
    .eq('id', id)
    .maybeSingle();

  if (!run) notFound();
  if (run.user_id !== user.id) notFound();

  if (run.search_profile_id) {
    redirect(`/dashboard/searches?run=${id}`);
  }

  redirect('/dashboard/searches');
}

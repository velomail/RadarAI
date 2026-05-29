import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RunPoller } from '@/app/demo/runs/[id]/RunPoller';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardRunPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: run } = await sb.from('runs').select('*').eq('id', id).maybeSingle();
  if (!run) notFound();
  if (run.user_id !== user.id) notFound();

  const tier = await getUserPlan(user.id);

  return (
    <section className="flex flex-col gap-6">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
        ← Searches
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked matches with role summaries and resume comparison
        </p>
      </div>
      <RunPoller runId={id} sessionHint="auth" tier={tier} />
    </section>
  );
}

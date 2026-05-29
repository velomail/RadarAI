import { NextRequest, NextResponse } from 'next/server';
import { maskProFieldsForPlan } from '@/lib/jobs/mask-pro-fields';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Job } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userSupabase = await supabaseServer();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = supabaseServiceRole();
  const { data: run, error } = await sb.from('runs').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (run.user_id !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { data: jobs } = await sb
    .from('jobs')
    .select('*')
    .eq('run_id', id)
    .order('match_score', { ascending: false });

  const plan = await getUserPlan(user.id);
  const visibleJobs = maskProFieldsForPlan((jobs as Job[]) || [], plan);

  return NextResponse.json({ run, jobs: visibleJobs, plan });
}

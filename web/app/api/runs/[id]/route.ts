import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { maskProFieldsForPlan } from '@/lib/jobs/mask-pro-fields';
import { getUserPlan } from '@/lib/plan';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Job } from '@/lib/types';

const DEMO_COOKIE = 'radar_demo_session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const isDemo = req.nextUrl.searchParams.get('demo') === '1';
  const sb = supabaseServiceRole();

  const { data: run, error } = await sb.from('runs').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (isDemo) {
    const cookieStore = await cookies();
    const session = cookieStore.get(DEMO_COOKIE)?.value;
    if (!session || run.anonymous_session !== session) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  } else {
    const userSupabase = await supabaseServer();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();
    if (!user || run.user_id !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  const { data: jobs } = await sb
    .from('jobs')
    .select('*')
    .eq('run_id', id)
    .order('match_score', { ascending: false });

  const plan = isDemo ? 'free' : await getUserPlan(run.user_id!);
  const visibleJobs = maskProFieldsForPlan((jobs as Job[]) || [], plan);

  return NextResponse.json({ run, jobs: visibleJobs, plan });
}

import { after, NextRequest, NextResponse } from 'next/server';
import { runEngine } from '@/lib/engine';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { consumeDailyQuery } from '@/lib/usage/consume-daily-query';
import { AUTH_MAX_REPORT_JOBS, AUTH_MIN_REPORT_JOBS } from '@/lib/usage/constants';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await params;
  const userSupabase = await supabaseServer();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = supabaseServiceRole();
  const { data: profile } = await sb
    .from('search_profiles')
    .select('*, resume:resumes(parsed_text)')
    .eq('id', profileId)
    .maybeSingle();
  if (!profile || profile.user_id !== user.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const resumeText: string = profile.resume?.parsed_text || '';
  if (!resumeText || resumeText.length < 100) {
    return NextResponse.json({ error: 'resume_missing' }, { status: 400 });
  }

  const quota = await consumeDailyQuery(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: 'daily_limit',
        queries_today: quota.queries_today,
        limit: quota.limit,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  const { data: run, error: runErr } = await sb
    .from('runs')
    .insert({
      user_id: user.id,
      search_profile_id: profile.id,
      status: 'pending',
      trigger: 'manual',
    })
    .select()
    .single();
  if (runErr || !run) {
    return NextResponse.json({ error: runErr?.message || 'run_create_failed' }, { status: 500 });
  }

  // Engine runs after the HTTP response is sent. Bounded by this function's
  // maxDuration (300s on Vercel Hobby with Fluid Compute, plenty for one run).
  after(async () => {
    await runEngine({
      run_id: run.id,
      user_id: user.id,
      anonymous_session: null,
      resume_text: resumeText,
      queries: profile.queries || [],
      location: profile.location || 'Canada',
      min_score: profile.min_score || 70,
      remote_only: !!profile.remote_only,
      employment_types: profile.employment_types || [],
      search_focus: profile.search_focus || 'auto',
      max_report_jobs: AUTH_MAX_REPORT_JOBS,
      min_report_jobs: AUTH_MIN_REPORT_JOBS,
    });
  });

  return NextResponse.json({ run_id: run.id, status: 'pending' }, { status: 202 });
}

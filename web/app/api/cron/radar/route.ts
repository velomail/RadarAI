import { after, NextRequest, NextResponse } from 'next/server';
import { isScheduledNewsletterProfile } from '@/lib/constants';
import { cronMatchedInWindow, nowInTimezone, runEngine } from '@/lib/engine';
import { supabaseServiceRole } from '@/lib/supabase/server';

const TZ = process.env.RADAR_TIMEZONE || 'America/Toronto';

// One run per profile per cron invocation, fanned out via after(). With
// Vercel Hobby this fires daily; on Pro you can crank it down to every 30
// min by tightening WINDOW_MINUTES in vercel.json and the cron expression.
const WINDOW_MINUTES = Number(process.env.RADAR_WINDOW_MINUTES || 90);
const MAX_PROFILES_PER_TICK = Number(process.env.RADAR_MAX_PROFILES_PER_TICK || 25);

export async function GET(req: NextRequest) {
  // Vercel attaches Authorization: Bearer <CRON_SECRET> automatically when
  // the env var is set. Reject anything else so cron-job.org / random
  // crawlers can't trigger runs.
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = supabaseServiceRole();
  const { hour, minute } = nowInTimezone(TZ);

  const { data: profiles, error } = await sb
    .from('search_profiles')
    .select('*, resume:resumes(parsed_text)')
    .eq('active', true);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (profiles || []).filter(
    (p) =>
      isScheduledNewsletterProfile(p.schedule_cron) &&
      cronMatchedInWindow(p.schedule_cron, hour, minute, WINDOW_MINUTES),
  );

  if (!due.length) {
    return NextResponse.json({ ok: true, hour, minute, due: 0, skipped: 'none_due' });
  }

  const queued: string[] = [];
  const skipped: Array<{ profile_id: string; reason: string }> = [];

  for (const profile of due.slice(0, MAX_PROFILES_PER_TICK)) {
    const resumeText: string = profile.resume?.parsed_text || '';
    if (!resumeText || resumeText.trim().length < 100) {
      skipped.push({ profile_id: profile.id, reason: 'resume_too_short' });
      continue;
    }

    const { data: run, error: runErr } = await sb
      .from('runs')
      .insert({
        user_id: profile.user_id,
        search_profile_id: profile.id,
        status: 'pending',
        trigger: 'schedule',
      })
      .select('id')
      .single();
    if (runErr || !run) {
      skipped.push({
        profile_id: profile.id,
        reason: `run_insert_failed: ${runErr?.message || 'unknown'}`,
      });
      continue;
    }

    queued.push(run.id);

    after(async () => {
      await runEngine({
        run_id: run.id,
        user_id: profile.user_id,
        anonymous_session: null,
        resume_text: resumeText,
        queries: profile.queries || [],
        location: profile.location || 'Canada',
        min_score: profile.min_score || 70,
        remote_only: !!profile.remote_only,
        employment_types: profile.employment_types || [],
        search_focus: profile.search_focus || 'auto',
      });
    });
  }

  return NextResponse.json({
    ok: true,
    hour,
    minute,
    tz: TZ,
    window_minutes: WINDOW_MINUTES,
    matched: due.length,
    queued: queued.length,
    queued_run_ids: queued,
    skipped,
  });
}

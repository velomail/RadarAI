'use server';

import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runEngine } from '@/lib/engine';
import { SEARCH_PAGE } from '@/lib/constants';
import { parseQueriesFromForm, parseSearchFocus } from '@/lib/parse-search-form';
import { resolveScheduleCron } from '@/lib/schedule-cron';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { consumeDailyQuery } from '@/lib/usage/consume-daily-query';
import { AUTH_MAX_REPORT_JOBS, AUTH_MIN_REPORT_JOBS } from '@/lib/usage/constants';

const Schema = z.object({
  name: z.string().min(1).max(120),
  location: z.string().min(1).max(80),
  remote_only: z.string().optional(),
  min_score: z.coerce.number().min(50).max(100),
  schedule_cron: z.string().optional(),
  notify_email: z.string().optional(),
});

async function getUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated.');
  return data.user;
}

/** Create a run and kick off the engine for an owned profile. Redirects on quota/resume errors. */
export async function startProfileSearchRun(profileId: string, userId: string): Promise<string> {
  const sb = supabaseServiceRole();
  const { data: profile } = await sb
    .from('search_profiles')
    .select('*, resume:resumes(parsed_text)')
    .eq('id', profileId)
    .maybeSingle();
  if (!profile || profile.user_id !== userId) throw new Error('Profile not found.');

  const resumeText: string = profile.resume?.parsed_text || '';
  if (!resumeText || resumeText.length < 100) {
    redirect(`${SEARCH_PAGE}?error=resume_missing`);
  }

  const quota = await consumeDailyQuery(userId);
  if (!quota.allowed) {
    redirect(`${SEARCH_PAGE}?error=daily_limit`);
  }

  const { data: run, error: runErr } = await sb
    .from('runs')
    .insert({
      user_id: userId,
      search_profile_id: profile.id,
      status: 'pending',
      trigger: 'manual',
    })
    .select('id')
    .single();
  if (runErr || !run) {
    redirect(`${SEARCH_PAGE}?error=${encodeURIComponent(runErr?.message || 'run_create_failed')}`);
  }

  after(async () => {
    await runEngine({
      run_id: run.id,
      user_id: userId,
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

  return run.id;
}

/** Save criteria from the form, then start a job scan. Results load on the same page. */
export async function runJobSearch(profileId: string, formData: FormData) {
  const user = await getUser();
  let searchFocus: string;
  let queries: string[];
  try {
    searchFocus = parseSearchFocus(formData);
    queries = parseQueriesFromForm(formData, searchFocus);
  } catch (e) {
    redirect(`${SEARCH_PAGE}?error=${encodeURIComponent((e as Error).message || 'invalid_search')}`);
  }

  let parsed: z.infer<typeof Schema>;
  try {
    parsed = Schema.parse({
      name: formData.get('name')?.toString() ?? '',
      location: formData.get('location')?.toString() ?? '',
      remote_only: formData.get('remote_only')?.toString(),
      min_score: formData.get('min_score')?.toString() ?? '70',
      schedule_cron: formData.get('schedule_cron')?.toString(),
      notify_email: formData.get('notify_email')?.toString()?.trim() || '',
    });
  } catch (e) {
    redirect(`${SEARCH_PAGE}?error=${encodeURIComponent((e as Error).message || 'invalid_form')}`);
  }

  const scheduleCron = await resolveScheduleCron(user.id, parsed.schedule_cron);

  const sb = supabaseServiceRole();
  const { data: existing } = await sb
    .from('search_profiles')
    .select('user_id, resume_id')
    .eq('id', profileId)
    .maybeSingle();
  if (!existing || existing.user_id !== user.id) throw new Error('Profile not found.');

  const { error: updateErr } = await sb
    .from('search_profiles')
    .update({
      name: parsed.name,
      queries,
      search_focus: searchFocus,
      location: parsed.location,
      remote_only: !!parsed.remote_only,
      min_score: parsed.min_score,
      schedule_cron: scheduleCron,
      notify_email: parsed.notify_email || null,
    })
    .eq('id', profileId);
  if (updateErr) {
    redirect(`${SEARCH_PAGE}?error=${encodeURIComponent(updateErr.message)}`);
  }

  const runId = await startProfileSearchRun(profileId, user.id);
  revalidatePath(SEARCH_PAGE);
  redirect(`${SEARCH_PAGE}?run=${runId}`);
}

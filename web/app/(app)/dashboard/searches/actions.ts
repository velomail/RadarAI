'use server';

import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runEngine } from '@/lib/engine';
import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { parseQueriesFromForm, parseSearchFocus } from '@/lib/parse-search-form';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { consumeDailyQuery } from '@/lib/usage/consume-daily-query';

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

/** Save criteria from the form, then start a job scan. Results load on the same page. */
export async function runJobSearch(profileId: string, formData: FormData) {
  const user = await getUser();
  const searchFocus = parseSearchFocus(formData);
  const queries = parseQueriesFromForm(formData, searchFocus);

  const parsed = Schema.parse({
    name: formData.get('name')?.toString() ?? '',
    location: formData.get('location')?.toString() ?? '',
    remote_only: formData.get('remote_only')?.toString(),
    min_score: formData.get('min_score')?.toString() ?? '70',
    schedule_cron: formData.get('schedule_cron')?.toString() || MANUAL_SCHEDULE_CRON,
    notify_email: formData.get('notify_email')?.toString()?.trim() || '',
  });

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
      schedule_cron: parsed.schedule_cron || MANUAL_SCHEDULE_CRON,
      notify_email: parsed.notify_email || null,
    })
    .eq('id', profileId);
  if (updateErr) throw new Error(updateErr.message);

  const { data: profile } = await sb
    .from('search_profiles')
    .select('*, resume:resumes(parsed_text)')
    .eq('id', profileId)
    .maybeSingle();
  if (!profile) throw new Error('Profile not found.');

  const resumeText: string = profile.resume?.parsed_text || '';
  if (!resumeText || resumeText.length < 100) {
    redirect('/dashboard/searches?error=resume_missing');
  }

  const quota = await consumeDailyQuery(user.id);
  if (!quota.allowed) {
    redirect('/dashboard/searches?error=daily_limit');
  }

  const { data: run, error: runErr } = await sb
    .from('runs')
    .insert({
      user_id: user.id,
      search_profile_id: profile.id,
      status: 'pending',
      trigger: 'manual',
    })
    .select('id')
    .single();
  if (runErr || !run) throw new Error(runErr?.message || 'run_create_failed');

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
    });
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/searches');
  redirect(`/dashboard/searches?run=${run.id}`);
}

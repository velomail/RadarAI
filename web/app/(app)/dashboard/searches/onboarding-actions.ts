'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { startProfileSearchRun } from '@/app/(app)/dashboard/searches/actions';
import { SEARCH_PAGE } from '@/lib/constants';
import { parseQueriesFromForm, parseSearchFocus } from '@/lib/parse-search-form';
import { resolveScheduleCron } from '@/lib/schedule-cron';
import { resolveResumeIdFromForm } from '@/lib/resume/resolve-resume-from-form';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

const Schema = z.object({
  name: z.string().min(1).max(120),
  location: z.string().min(1).max(80),
  remote_only: z.string().optional(),
  min_score: z.coerce.number().min(50).max(100),
  schedule_cron: z.string().optional(),
  notify_email: z.string().optional(),
});

/** First-time profile setup from the Search page — saves criteria and starts the first run. */
export async function createOnboardingProfile(formData: FormData) {
  const user = await getUser();
  const file = formData.get('resume');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Resume file is required.');
  }

  const searchFocus = parseSearchFocus(formData);
  const queries = parseQueriesFromForm(formData, searchFocus);

  const parsed = Schema.parse({
    name: formData.get('name')?.toString() ?? '',
    location: formData.get('location')?.toString() ?? '',
    remote_only: formData.get('remote_only')?.toString(),
    min_score: formData.get('min_score')?.toString() ?? '70',
    schedule_cron: formData.get('schedule_cron')?.toString(),
    notify_email: formData.get('notify_email')?.toString()?.trim() || '',
  });

  const scheduleCron = await resolveScheduleCron(user.id, parsed.schedule_cron);

  const sb = supabaseServiceRole();
  const resumeId = await resolveResumeIdFromForm(sb, user.id, formData);

  const { data: profile, error: profErr } = await sb
    .from('search_profiles')
    .insert({
      user_id: user.id,
      name: parsed.name,
      resume_id: resumeId,
      queries,
      search_focus: searchFocus,
      location: parsed.location,
      remote_only: !!parsed.remote_only,
      min_score: parsed.min_score,
      schedule_cron: scheduleCron,
      notify_email: parsed.notify_email || null,
      notify_telegram_chat_id: null,
      active: true,
    })
    .select('id')
    .single();
  if (profErr || !profile) throw new Error(profErr?.message || 'profile_create_failed');

  const runId = await startProfileSearchRun(profile.id, user.id);
  revalidatePath(SEARCH_PAGE);
  redirect(`${SEARCH_PAGE}?run=${runId}`);
}

async function getUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated.');
  return data.user;
}

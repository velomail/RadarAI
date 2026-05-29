'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { extractPdfText } from '@/lib/pdf';
import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { parseQueriesFromForm, parseSearchFocus } from '@/lib/parse-search-form';
import { storageUploadError } from '@/lib/storage-errors';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

const Schema = z.object({
  name: z.string().min(1).max(120),
  location: z.string().min(1).max(80),
  remote_only: z.string().optional(),
  min_score: z.coerce.number().min(50).max(100),
  schedule_cron: z.string().optional(),
  notify_email: z.string().optional(),
});

export async function createOnboardingProfile(formData: FormData) {
  const user = await getUser();
  const searchFocus = parseSearchFocus(formData);
  const queries = parseQueriesFromForm(formData, searchFocus);

  const file = formData.get('resume');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Resume file is required.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Resume must be under 2MB on the free tier.');
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const resumeText = await extractPdfText(buf);
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Could not extract enough text from this PDF.');
  }

  const parsed = Schema.parse({
    name: formData.get('name')?.toString() ?? '',
    location: formData.get('location')?.toString() ?? '',
    remote_only: formData.get('remote_only')?.toString(),
    min_score: formData.get('min_score')?.toString() ?? '70',
    schedule_cron: formData.get('schedule_cron')?.toString() || MANUAL_SCHEDULE_CRON,
    notify_email: formData.get('notify_email')?.toString()?.trim() || '',
  });

  const sb = supabaseServiceRole();

  const storagePath = `auth/${user.id}/${Date.now()}-${file.name}`;
  const { error: upErr } = await sb.storage
    .from('resumes')
    .upload(storagePath, buf, {
      contentType: file.type || 'application/pdf',
      upsert: false,
    });
  if (upErr) throw storageUploadError(upErr.message);

  const { data: resume, error: resErr } = await sb
    .from('resumes')
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      original_filename: file.name,
      parsed_text: resumeText,
      char_count: resumeText.length,
    })
    .select()
    .single();
  if (resErr || !resume) throw new Error(resErr?.message || 'Failed to save resume.');

  const { error: profErr } = await sb.from('search_profiles').insert({
    user_id: user.id,
    name: parsed.name,
    resume_id: resume.id,
    queries,
    search_focus: searchFocus,
    location: parsed.location,
    remote_only: !!parsed.remote_only,
    min_score: parsed.min_score,
    schedule_cron: parsed.schedule_cron || MANUAL_SCHEDULE_CRON,
    notify_email: parsed.notify_email || null,
    notify_telegram_chat_id: null,
    active: true,
  });
  if (profErr) throw new Error(profErr.message);

  redirect('/dashboard/searches');
}

async function getUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated.');
  return data.user;
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { saveResumeFromFile } from './save-resume';

/** Use uploaded PDF if present; otherwise fall back to the user's latest resume. */
export async function resolveResumeIdFromForm(
  sb: SupabaseClient,
  userId: string,
  formData: FormData,
): Promise<string> {
  const file = formData.get('resume');
  if (file instanceof File && file.size > 0) {
    const saved = await saveResumeFromFile(sb, userId, file);
    return saved.id;
  }

  const { data: existing } = await sb
    .from('resumes')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing?.id) {
    throw new Error('Upload a resume PDF to run searches.');
  }

  return existing.id;
}

'use server';

import { revalidatePath } from 'next/cache';
import { SEARCH_PAGE } from '@/lib/constants';
import { resolveResumeIdFromForm } from '@/lib/resume/resolve-resume-from-form';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

async function getUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not authenticated.');
  return data.user;
}

/** Upload a new resume and attach it to all saved searches for this user. */
export async function updateAccountResume(formData: FormData) {
  const user = await getUser();
  const file = formData.get('resume');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Choose a PDF to upload.');
  }

  const sb = supabaseServiceRole();
  const resumeId = await resolveResumeIdFromForm(sb, user.id, formData);

  await sb
    .from('search_profiles')
    .update({ resume_id: resumeId })
    .eq('user_id', user.id);

  revalidatePath(SEARCH_PAGE);
}

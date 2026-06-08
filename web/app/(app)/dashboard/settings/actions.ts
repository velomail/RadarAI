'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

export async function updateNotificationDefaults(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const chatId = formData.get('notify_telegram_chat_id')?.toString().trim() || null;

  const sb = supabaseServiceRole();
  await sb
    .from('search_profiles')
    .update({
      notify_telegram_chat_id: chatId,
    })
    .eq('user_id', user.id);

  revalidatePath('/dashboard/settings');
}

/** Clear 14-day shown-job dedup so the next search can surface listings again. */
export async function clearSeenJobs() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const sb = supabaseServiceRole();
  const { error } = await sb.from('seen_jobs').delete().eq('user_id', user.id);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/settings/search');
  revalidatePath('/dashboard/searches');
}

export async function deleteAccount(formData: FormData) {
  const confirmation = formData.get('confirmation')?.toString().trim() ?? '';
  const normalizedConfirmation = confirmation.toUpperCase();
  if (normalizedConfirmation !== 'DELETE') {
    throw new Error('Type DELETE to confirm account deletion.');
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const sb = supabaseServiceRole();
  try {
    const objects = await sb.storage.from('resumes').list(`auth/${user.id}`, {
      limit: 1000,
      offset: 0,
    });
    if (!objects.error && objects.data?.length) {
      await sb.storage
        .from('resumes')
        .remove(objects.data.map((item) => `auth/${user.id}/${item.name}`));
    }
  } catch {
    // Storage cleanup failures should not block auth user deletion.
  }

  const { error } = await sb.auth.admin.deleteUser(user.id, true);
  if (error) throw new Error(error.message);

  redirect('/');
}

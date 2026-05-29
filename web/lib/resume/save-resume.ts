import { extractPdfText } from '@/lib/pdf';
import { storageUploadError } from '@/lib/storage-errors';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function saveResumeFromFile(
  sb: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ id: string; original_filename: string | null }> {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Resume must be under 2MB on the free tier.');
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const resumeText = await extractPdfText(buf);
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Could not extract enough text from this PDF.');
  }

  const storagePath = `auth/${userId}/${Date.now()}-${file.name}`;
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
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      parsed_text: resumeText,
      char_count: resumeText.length,
    })
    .select('id, original_filename')
    .single();

  if (resErr || !resume) {
    throw new Error(resErr?.message || 'Failed to save resume.');
  }

  return resume;
}

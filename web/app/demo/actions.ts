'use server';

import { randomUUID } from 'crypto';
import { after } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { runEngine } from '@/lib/engine';
import { extractPdfText } from '@/lib/pdf';
import { DEFAULT_SEARCH_FOCUS, isValidSearchFocus } from '@/lib/search-focus';
import { storageUploadError } from '@/lib/storage-errors';
import {
  DEMO_SESSION_COOKIE,
  GUEST_LIMIT_ERROR,
  GUEST_USED_COOKIE,
} from '@/lib/guest-limit';
import { supabaseServiceRole } from '@/lib/supabase/server';

const DEMO_COOKIE = DEMO_SESSION_COOKIE;

const FormSchema = z.object({
  queries: z.string().max(500).optional(),
  location: z.string().min(2).max(80),
  search_focus: z.string().optional(),
});

async function guestDemoRunCount(session: string): Promise<number> {
  const supabase = supabaseServiceRole();
  const { count, error } = await supabase
    .from('runs')
    .select('id', { count: 'exact', head: true })
    .eq('anonymous_session', session)
    .eq('trigger', 'demo');
  if (error) throw new Error(`Failed to check guest usage: ${error.message}`);
  return count ?? 0;
}

export async function startDemoRun(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get(GUEST_USED_COOKIE)?.value === '1') {
    throw new Error(GUEST_LIMIT_ERROR);
  }

  const focusRaw = formData.get('search_focus')?.toString() || DEFAULT_SEARCH_FOCUS;
  const searchFocus = isValidSearchFocus(focusRaw) ? focusRaw : DEFAULT_SEARCH_FOCUS;
  const queriesRaw = formData.get('queries')?.toString()?.trim() || '';

  const parsed = FormSchema.safeParse({
    queries: queriesRaw,
    location: formData.get('location')?.toString() ?? '',
    search_focus: searchFocus,
  });
  if (!parsed.success) {
    throw new Error('Invalid form input.');
  }

  if (searchFocus !== 'auto' && queriesRaw.length < 2) {
    throw new Error('Add at least one keyword for your selected focus.');
  }

  const file = formData.get('resume');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Resume file is required.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Resume must be under 2MB on the free tier.');
  }

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  const resumeText = await extractPdfText(buf);
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Could not extract enough text from this PDF. Try a different file.');
  }

  let session = cookieStore.get(DEMO_COOKIE)?.value;
  if (!session) {
    session = randomUUID();
    cookieStore.set(DEMO_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  const priorRuns = await guestDemoRunCount(session);
  if (priorRuns >= 1) {
    cookieStore.set(GUEST_USED_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    throw new Error(GUEST_LIMIT_ERROR);
  }

  const supabase = supabaseServiceRole();

  const storagePath = `demo/${session}/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from('resumes')
    .upload(storagePath, buf, {
      contentType: file.type || 'application/pdf',
      upsert: false,
    });
  if (uploadErr) throw storageUploadError(uploadErr.message);

  const { data: run, error: runErr } = await supabase
    .from('runs')
    .insert({
      user_id: null,
      anonymous_session: session,
      status: 'pending',
      trigger: 'demo',
    })
    .select()
    .single();
  if (runErr || !run) {
    throw new Error(`Failed to create run: ${runErr?.message || 'unknown'}`);
  }

  cookieStore.set(GUEST_USED_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  const queries = queriesRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  after(async () => {
    await runEngine({
      run_id: run.id,
      user_id: null,
      anonymous_session: session,
      resume_text: resumeText,
      queries,
      search_focus: searchFocus,
      location: parsed.data.location,
      min_score: 65,
      min_raw_jobs: 12,
    });
  });

  const q = encodeURIComponent(queriesRaw || '');
  const loc = encodeURIComponent(parsed.data.location || '');
  redirect(`/results?runId=${run.id}&q=${q}&location=${loc}&demo=true`);
}

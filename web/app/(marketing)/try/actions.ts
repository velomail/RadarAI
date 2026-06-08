'use server';

import { after } from 'next/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { runEngine } from '@/lib/engine';
import { consumeGuestQuery } from '@/lib/guest/consume-guest-query';
import { getGuestUsage } from '@/lib/guest/guest-usage';
import { getOrCreateGuestSessionId } from '@/lib/guest/session';
import { checkRateLimit, getClientIpFromRequest } from '@/lib/rate-limit';
import { TRY_PAGE } from '@/lib/constants';
import { parseQueriesFromForm, parseSearchFocus } from '@/lib/parse-search-form';
import { extractResumeFromFile } from '@/lib/resume/extract-resume-from-file';
import { supabaseServiceRole } from '@/lib/supabase/server';
import { GUEST_MIN_MATCH_SCORE } from '@/lib/usage/constants';

export async function startGuestSearch(formData: FormData) {
  const h = await headers();
  const ip = getClientIpFromRequest(h);
  if (!checkRateLimit(`guest-search:${ip}`, 5, 60 * 60 * 1000)) {
    redirect(`${TRY_PAGE}?error=rate_limited`);
  }

  const sessionId = await getOrCreateGuestSessionId();
  let allowed = false;
  try {
    const quota = await consumeGuestQuery(sessionId);
    allowed = quota.allowed;
  } catch {
    const usage = await getGuestUsage(sessionId);
    allowed = usage.allowed;
  }
  if (!allowed) {
    redirect(`${TRY_PAGE}?error=daily_limit`);
  }

  const resumeFile = formData.get('resume');
  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    redirect(`${TRY_PAGE}?error=resume_missing`);
  }

  let resumeText: string;
  try {
    resumeText = await extractResumeFromFile(resumeFile);
  } catch (e) {
    const msg = (e as Error).message || 'resume_invalid';
    redirect(`${TRY_PAGE}?error=${encodeURIComponent(msg)}`);
  }

  const searchFocus = parseSearchFocus(formData);
  let queries: string[];
  try {
    queries = parseQueriesFromForm(formData, searchFocus);
  } catch (e) {
    redirect(`${TRY_PAGE}?error=${encodeURIComponent((e as Error).message)}`);
  }

  const location = formData.get('location')?.toString()?.trim() || 'Canada';
  const remoteOnly = !!formData.get('remote_only');

  const sb = supabaseServiceRole();
  const { data: run, error: runErr } = await sb
    .from('runs')
    .insert({
      user_id: null,
      search_profile_id: null,
      anonymous_session: sessionId,
      status: 'pending',
      trigger: 'manual',
    })
    .select('id')
    .single();

  if (runErr || !run) {
    throw new Error(runErr?.message || 'run_create_failed');
  }

  after(async () => {
    await runEngine({
      run_id: run.id,
      user_id: null,
      anonymous_session: sessionId,
      resume_text: resumeText,
      queries,
      location,
      min_score: GUEST_MIN_MATCH_SCORE,
      remote_only: remoteOnly,
      search_focus: searchFocus,
      max_report_jobs: 1,
      min_report_jobs: 1,
    });
  });

  redirect(`${TRY_PAGE}?run=${run.id}`);
}

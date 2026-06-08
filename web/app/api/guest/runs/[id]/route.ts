import { NextRequest, NextResponse } from 'next/server';
import { getGuestSessionId } from '@/lib/guest/session';
import { checkRateLimit, getClientIpFromRequest } from '@/lib/rate-limit';
import { supabaseServiceRole } from '@/lib/supabase/server';
import type { Job } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionId = await getGuestSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const ip = getClientIpFromRequest(req.headers);
  if (!checkRateLimit(`guest-poll:${sessionId}:${ip}`, 180, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const sb = supabaseServiceRole();
  const { data: run, error } = await sb.from('runs').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!run) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (run.anonymous_session !== sessionId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { data: jobs } = await sb
    .from('jobs')
    .select('*')
    .eq('run_id', id)
    .order('match_score', { ascending: false })
    .limit(1);

  return NextResponse.json(
    {
      run,
      jobs: (jobs as Job[]) || [],
      guest: true,
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}

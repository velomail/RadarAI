import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/cron-auth';
import { supabaseServiceRole } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const authError = verifyCronAuth(req.headers.get('authorization'));
  if (authError) return authError;

  const sb = supabaseServiceRole();
  const result: Record<string, unknown> = {};

  try {
    const { data, error } = await sb.rpc('prune_old_data');
    if (error) {
      result.prune_error = error.message;
    } else {
      result.prune = data;
    }
  } catch (err) {
    result.prune_error = (err as Error).message;
  }

  return NextResponse.json({ ok: true, ...result });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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

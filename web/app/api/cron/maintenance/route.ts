import { NextRequest, NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabase/server';

const DEMO_TTL_HOURS = 24;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = supabaseServiceRole();

  const result: Record<string, unknown> = {};

  // 1. Prune old runs, jobs, seen_jobs, email_budget via the Supabase RPC
  //    we already shipped in db/migrations/0004_pruning_and_budget.sql.
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

  // 2. Delete demo resume uploads older than 24h to keep Supabase Storage
  //    under the 1GB free-tier ceiling.
  try {
    const { data: objects, error } = await sb.storage
      .from('resumes')
      .list('demo', { limit: 1000 });
    if (error) {
      result.demo_cleanup_error = error.message;
    } else {
      const cutoff = Date.now() - DEMO_TTL_HOURS * 3600 * 1000;
      const stale = (objects || [])
        .filter((o) => o.created_at && new Date(o.created_at).getTime() < cutoff)
        .map((o) => `demo/${o.name}`);
      if (stale.length) {
        const { error: delErr } = await sb.storage.from('resumes').remove(stale);
        if (delErr) {
          result.demo_cleanup_error = delErr.message;
        } else {
          result.demo_cleaned = stale.length;
        }
      } else {
        result.demo_cleaned = 0;
      }
    }
  } catch (err) {
    result.demo_cleanup_error = (err as Error).message;
  }

  return NextResponse.json({ ok: true, ...result });
}

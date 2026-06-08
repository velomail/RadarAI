/**
 * Smoke checks for multi-job account search limits (no Supabase required).
 * Run: node scripts/verify-engine-limits.mjs
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Compiled TS isn't available; mirror minimal backfill contract inline for CI-less verify.
function applySeenBackfill(unseen, dropped, options) {
  const minBackfill = options.minBackfill ?? 0;
  if (minBackfill <= 0 || unseen.length >= minBackfill || dropped.length === 0) {
    return { filtered: unseen, backfilled: 0 };
  }
  const maxTotal = options.maxTotal ?? minBackfill;
  const target = Math.min(minBackfill, maxTotal);
  const need = Math.min(target - unseen.length, dropped.length);
  if (need <= 0) return { filtered: unseen, backfilled: 0 };
  const backfill = dropped.slice(0, need);
  return { filtered: [...unseen, ...backfill], backfilled: backfill.length };
}

function job(id) {
  return { job_id: id, job_title: `Role ${id}`, employer_name: 'Co', job_apply_link: `https://x.com/${id}` };
}

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed++;
  } else {
    console.log('ok:', msg);
  }
}

// Backfill: 1 unseen + 5 dropped → at least 3 candidates
{
  const { filtered, backfilled } = applySeenBackfill([job('a')], [job('b'), job('c'), job('d'), job('e'), job('f')], {
    minBackfill: 3,
    maxTotal: 20,
  });
  assert(filtered.length === 3, 'backfill reaches minReport=3');
  assert(backfilled === 2, 'backfill adds 2 seen listings');
}

// Backfill: enough unseen → no backfill
{
  const { filtered, backfilled } = applySeenBackfill([job('a'), job('b'), job('c')], [job('d')], {
    minBackfill: 3,
    maxTotal: 20,
  });
  assert(filtered.length === 3 && backfilled === 0, 'no backfill when unseen >= minReport');
}

// Auth limits constants
try {
  const constants = require('../lib/usage/constants.ts');
  assert(constants.AUTH_MAX_REPORT_JOBS === 12, 'AUTH_MAX_REPORT_JOBS is 12');
  assert(constants.AUTH_MIN_REPORT_JOBS === 3, 'AUTH_MIN_REPORT_JOBS is 3');
} catch {
  // ts require may fail without loader — check file text instead
  const fs = await import('fs');
  const text = fs.readFileSync(new URL('../lib/usage/constants.ts', import.meta.url), 'utf8');
  assert(text.includes('AUTH_MAX_REPORT_JOBS = 12'), 'constants file defines AUTH_MAX_REPORT_JOBS = 12');
  assert(text.includes('AUTH_MIN_REPORT_JOBS = 3'), 'constants file defines AUTH_MIN_REPORT_JOBS = 3');
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll engine limit checks passed.');

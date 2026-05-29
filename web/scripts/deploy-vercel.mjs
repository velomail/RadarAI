/**
 * Deploy to Vercel production (deploy only — fast path).
 *
 *   npm run saas:deploy:only     → deploy (default)
 *   npm run saas:deploy          → same as deploy:only
 *   npm run saas:env:push        → upload env from .env.local (slow on Windows)
 *   npm run saas:adzuna:push     → Adzuna vars only
 *
 * Env: use Vercel dashboard or saas:env:push — not bundled into every deploy.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'ADZUNA_APP_ID',
  'ADZUNA_APP_KEY',
  'ADZUNA_COUNTRY',
  'ADZUNA_MAX_PRIMARY_QUERIES',
  'ADZUNA_MAX_WIDEN_QUERIES',
  'ADZUNA_FETCH_DELAY_MS',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'OPENAI_SCORE_CONCURRENCY',
  'OPENAI_MAX_JOBS_TO_SCORE',
  'OPENAI_SCORE_DESCRIPTION_MAX_CHARS',
  'CRON_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'RESEND_DAILY_HARD_CAP',
  'RADAR_TIMEZONE',
  'RADAR_WINDOW_MINUTES',
];

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath} — copy .env.example to .env.local first.`);
  }
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Run vercel CLI without shell:true (avoids Windows hang after each command). */
function runVercel(args, { inherit = true } = {}) {
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const r = spawnSync(cmd, ['vercel', ...args], {
    cwd: webRoot,
    encoding: inherit ? 'utf8' : undefined,
    shell: false,
    stdio: inherit ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: { ...process.env, CI: '1' },
  });
  if (inherit) {
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
  }
  return r.status ?? 1;
}

const envOnly = process.argv.includes('--env-only');
const withEnv = process.argv.includes('--with-env');

console.log('Checking Vercel login...');
const who = runVercel(['whoami']);
if (who !== 0) {
  console.error('\nNot logged in. Run:  cd web && npx vercel login');
  process.exit(1);
}

if (!fs.existsSync(path.join(webRoot, '.vercel', 'project.json'))) {
  console.log('Linking project...');
  if (runVercel(['link', '--yes']) !== 0) process.exit(1);
}

if (envOnly || withEnv) {
  const envPath = path.join(webRoot, '.env.local');
  const env = parseEnv(envPath);
  console.log('\nUploading env to production (slow on Windows — dashboard is faster)...\n');
  for (const key of ENV_KEYS) {
    const val = env[key];
    if (val === undefined || val === '') continue;
    console.log(`  ${key}`);
    const status = runVercel(
      ['env', 'add', key, 'production', '--yes', '--force', '--value', val],
      { inherit: false },
    );
    if (status !== 0) console.warn(`  warn: ${key}`);
  }
  if (envOnly) {
    console.log('\nEnv done. Deploy: npm run saas:deploy:only');
    process.exit(0);
  }
}

console.log('\nDeploying to production (~1–2 min on Vercel)...\n');
const status = runVercel(['deploy', '--prod', '--yes']);
if (status !== 0) {
  console.error('\nDeploy failed. Check output above or: cd web && npx vercel deploy --prod --yes');
  process.exit(1);
}

console.log('\nProduction URL: https://rapidai-velomails-projects.vercel.app');
console.log('Smoke test: /sign-up');
console.log('See docs/MVP_COMPLETE.md for auth + DB steps.');

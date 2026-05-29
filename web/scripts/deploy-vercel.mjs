/**
 * Push env vars from .env.local to Vercel and deploy to production.
 * Run from repo root:  npm run saas:deploy
 * Requires:  npx vercel login   (once)
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const envPath = path.join(webRoot, '.env.local');

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'RAPIDAPI_KEY',
  'LINKEDIN_RAPIDAPI_HOST',
  'LINKEDIN_RAPIDAPI_KEY',
  'LINKEDIN_PRIMARY_PATH',
  'LINKEDIN_WIDEN_PATH',
  'LINKEDIN_QUERY_PARAM',
  'LINKEDIN_LOCATION_PARAM',
  'OPENAI_API_KEY',
  'CRON_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'RESEND_DAILY_HARD_CAP',
  'TELEGRAM_BOT_TOKEN',
  'ENGINE_MODE',
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

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: webRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function vercel(args) {
  return spawnSync('npx', ['vercel', ...args], {
    cwd: webRoot,
    stdio: 'inherit',
    shell: true,
  });
}

const env = parseEnv(envPath);

console.log('Checking Vercel login...');
const who = spawnSync('npx', ['vercel', 'whoami'], { cwd: webRoot, shell: true, encoding: 'utf8' });
if (who.status !== 0 || (who.stdout || '').includes('No existing credentials')) {
  console.error('\nNot logged in. Run:  npx vercel login\nThen run this script again.');
  process.exit(1);
}
console.log('Logged in as:', (who.stdout || '').trim());

if (!fs.existsSync(path.join(webRoot, '.vercel', 'project.json'))) {
  console.log('\nLinking project (first time)...');
  run('npx', ['vercel', 'link', '--yes']);
}

const skipEnv = process.argv.includes('--deploy-only');
if (skipEnv) {
  console.log('\nSkipping env upload (--deploy-only).');
} else {
  console.log('\nUploading environment variables to production only...');
  console.log('(On Windows this is slow — prefer the Vercel dashboard; see docs/DEBUG_VERCEL.md)\n');
  for (const key of ENV_KEYS) {
    const val = env[key];
    if (val === undefined || val === '') continue;
    console.log(`  ${key} → production`);
    const r = vercel(['env', 'add', key, 'production', '--yes', '--force', '--value', val]);
    if (r.status !== 0) {
      console.warn(`  warn: ${key} may already exist or failed`);
    }
  }
}

console.log('\nDeploying to production...');
const deploy = spawnSync('npx', ['vercel', 'deploy', '--prod', '--yes'], {
  cwd: webRoot,
  shell: true,
  encoding: 'utf8',
});
if (deploy.status !== 0) process.exit(1);

const out = `${deploy.stdout || ''}${deploy.stderr || ''}`;
const urlMatch = out.match(/https:\/\/[^\s]+\.vercel\.app/gi);
const deployUrl = urlMatch ? urlMatch[urlMatch.length - 1] : null;

if (deployUrl) {
  console.log('\nDeployed:', deployUrl);
  console.log('\nNext steps:');
  console.log(`  1. Vercel → Settings → Environment Variables → set NEXT_PUBLIC_APP_URL=${deployUrl}`);
  console.log(`  2. Redeploy once (npm run saas:deploy)`);
  console.log(`  3. Supabase → Auth → Redirect URLs → add ${deployUrl}/auth/callback`);
  console.log(`  4. Smoke test: ${deployUrl}/demo`);
}

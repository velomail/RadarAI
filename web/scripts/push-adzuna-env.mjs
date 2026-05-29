/**
 * Push only Adzuna vars to Vercel production (fast path for launch).
 * Usage: node web/scripts/push-adzuna-env.mjs
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(webRoot, '.env.local');
const KEYS = ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY', 'ADZUNA_COUNTRY'];

function parseEnv(filePath) {
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const env = parseEnv(envPath);
for (const key of KEYS) {
  const val = env[key];
  if (!val) {
    console.error(`Missing ${key} in web/.env.local`);
    process.exit(1);
  }
  console.log(`${key} → production`);
  const r = spawnSync(
    'npx',
    ['vercel', 'env', 'add', key, 'production', '--yes', '--force', '--value', val],
    { cwd: webRoot, shell: true, stdio: 'inherit' },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log('\nDone. Redeploy: npm run saas:deploy:only');

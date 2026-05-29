/**
 * Set ENGINE_MODE on Vercel production.
 * Usage: node scripts/set-engine-mode.mjs mock|live
 *   mock → ENGINE_MODE=mock (fixture jobs, no Adzuna/OpenAI)
 *   live → remove ENGINE_MODE (real APIs)
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const mode = process.argv[2];
const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

if (mode !== 'mock' && mode !== 'live') {
  console.error('Usage: node scripts/set-engine-mode.mjs mock|live');
  process.exit(1);
}

function vercel(args, { allowMissing = false } = {}) {
  const r = spawnSync('npx', ['vercel', ...args], {
    cwd: webRoot,
    shell: true,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) {
    if (allowMissing && /Environment Variable was not found/i.test(out)) {
      console.log('(ENGINE_MODE was already removed — nothing to do.)');
      return;
    }
    process.exit(r.status ?? 1);
  }
}

if (mode === 'mock') {
  console.log('Setting ENGINE_MODE=mock on Vercel production…');
  vercel(['env', 'add', 'ENGINE_MODE', 'production', '--yes', '--force', '--value', 'mock']);
  console.log('\nDone. Redeploy for it to take effect:  npm run saas:deploy:only');
} else {
  console.log('Removing ENGINE_MODE from Vercel production (live / real APIs)…');
  vercel(['env', 'rm', 'ENGINE_MODE', 'production', '--yes'], { allowMissing: true });
  console.log('\nDone. Redeploy for it to take effect:  npm run saas:deploy:only');
  console.log('Ensure ADZUNA_APP_ID, ADZUNA_APP_KEY, and OPENAI_API_KEY are set — see docs/ENGINE_MODE.md');
}

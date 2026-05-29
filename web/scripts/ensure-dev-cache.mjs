/**
 * Wipe corrupted .next before dev (common on OneDrive when build + dev mix).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextDir = path.join(webRoot, '.next');

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  process.exit(0);
}

function chunkMissingFromRuntime(runtimePath, chunkDir) {
  if (!fs.existsSync(runtimePath)) return false;
  const src = fs.readFileSync(runtimePath, 'utf8');
  const ids = [...src.matchAll(/require\("\.\/(\d+\.js)"\)/g)].map((m) => m[1]);
  return ids.some((id) => !fs.existsSync(path.join(chunkDir, id)));
}

function cacheIsCorrupt(root) {
  if (!fs.existsSync(root)) return false;

  const serverDir = path.join(root, 'server');
  const reasons = [];

  // Leftover from `next build` — breaks `next dev` (missing 611.js, etc.).
  if (fs.existsSync(path.join(root, 'BUILD_ID'))) {
    reasons.push('production build output');
  }

  if (chunkMissingFromRuntime(path.join(serverDir, 'webpack-runtime.js'), serverDir)) {
    reasons.push('missing webpack chunk');
  }

  const vendorSupabase = path.join(serverDir, 'vendor-chunks/@supabase.js');
  const serverAppDir = path.join(serverDir, 'app');
  if (fs.existsSync(serverAppDir) && fs.readdirSync(serverAppDir).length > 0 && !fs.existsSync(vendorSupabase)) {
    reasons.push('missing Supabase vendor chunk');
  }

  if (reasons.length) {
    console.warn(`[RadarAI] Clearing stale .next (${reasons.join('; ')})`);
    fs.rmSync(root, { recursive: true, force: true });
  }

  return reasons.length > 0;
}

cacheIsCorrupt(nextDir);

/**
 * Copy root .env or .env.old → web/.env.local (Next.js only reads the latter).
 * Run from repo root: npm run saas:sync-env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = ['.env', '.env.old'].map((f) => path.join(root, f));
const dest = path.join(root, 'web', '.env.local');

const src = sources.find((p) => fs.existsSync(p));
if (!src) {
  console.error('No root .env or .env.old found. Use: cp web/.env.example web/.env.local');
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`Copied ${path.basename(src)} → web/.env.local`);

/**
 * Remove web/.next and TypeScript build info.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const rel of ['.next', 'tsconfig.tsbuildinfo']) {
  const target = path.join(webRoot, rel);
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log('removed', target);
  } catch {
    // ignore
  }
}

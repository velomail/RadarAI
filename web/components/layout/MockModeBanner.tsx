import { isMockEngine } from '@/lib/engine/engine-mode';

export function MockModeBanner() {
  if (!isMockEngine()) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-950 dark:text-amber-100">
      <span className="font-medium">Sample job data mode</span>
      {' · '}
      Results are fixture listings, not live Adzuna jobs. Remove{' '}
      <code className="rounded bg-black/10 px-1">ENGINE_MODE=mock</code> on Vercel for real searches.
    </div>
  );
}

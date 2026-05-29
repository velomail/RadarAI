import { isMockEngine } from '@/lib/engine/engine-mode';

export function MockModeBanner() {
  if (!isMockEngine()) return null;
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Development mode</span>
      {' · '}
      Sample job data — no live API calls
    </div>
  );
}

import { isMockEngine } from '@/lib/engine/engine-mode';

export function MockModeBanner() {
  if (!isMockEngine()) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Product demo</span>
      {' · '}
      Representative output from the full search pipeline
    </div>
  );
}

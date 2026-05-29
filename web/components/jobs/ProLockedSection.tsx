import type { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserPlan } from '@/lib/plan';

type ProLockedSectionProps = {
  tier: UserPlan;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function ProLockedSection({
  tier,
  title,
  children,
  className = '',
}: ProLockedSectionProps) {
  if (tier === 'pro') {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 ${className}`}
    >
      <div className="pointer-events-none select-none blur-[6px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 px-4 backdrop-blur-[2px]">
        <Badge variant="warm" className="gap-1 rounded-full px-3 py-1">
          <Sparkles className="h-3 w-3" />
          Pro
        </Badge>
        <p className="flex items-center gap-1.5 text-center text-xs font-medium text-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
          {title ?? 'Upgrade to unlock'}
        </p>
      </div>
    </div>
  );
}

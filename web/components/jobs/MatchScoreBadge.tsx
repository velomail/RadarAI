import { matchTier, matchTierLabel } from '@/lib/job-display';
import { cn } from '@/lib/utils';

export function MatchScoreBadge({ score, className }: { score: number; className?: string }) {
  const tier = matchTier(score);

  return (
    <span
      title={matchTierLabel(score)}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs tabular-nums',
        tier === 'strong' && 'border-foreground font-semibold text-foreground',
        tier === 'good' && 'border-border font-medium text-foreground',
        tier === 'fair' && 'border-border font-normal text-muted-foreground',
        className,
      )}
    >
      {score}% match
    </span>
  );
}

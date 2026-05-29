import { CalendarDays } from 'lucide-react';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';

type DailyUsageMeterProps = {
  queriesToday: number;
  limit: number;
  plan: 'free' | 'pro';
  compact?: boolean;
};

export function DailyUsageMeter({ queriesToday, limit, plan, compact }: DailyUsageMeterProps) {
  const dailyCap = plan === 'pro' ? limit : FREE_DAILY_QUERY_LIMIT;
  const dailyPct =
    plan === 'pro' ? 0 : Math.min(100, Math.round((queriesToday / dailyCap) * 100));

  return (
    <div className={compact ? 'space-y-2' : 'mt-5'}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4 shrink-0" />
        <span>
          Today&apos;s searches:{' '}
          <span className="font-semibold text-foreground">
            {plan === 'pro' ? 'Unlimited' : `${queriesToday}/${dailyCap}`}
          </span>
          {plan === 'free' ? (
            <span className="text-muted-foreground"> (resets midnight UTC)</span>
          ) : null}
        </span>
      </div>
      {plan === 'free' ? (
        <div className={`${compact ? 'mt-2' : 'mt-3'} h-2 w-full overflow-hidden rounded-full bg-muted`}>
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

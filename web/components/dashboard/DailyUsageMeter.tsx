import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import type { UserPlan } from '@/lib/plan';

type DailyUsageMeterProps = {
  queriesToday: number;
  limit: number;
  plan: UserPlan;
  compact?: boolean;
};

export function DailyUsageMeter({ queriesToday, limit, plan, compact }: DailyUsageMeterProps) {
  const dailyCap = plan === 'pro' ? limit : FREE_DAILY_QUERY_LIMIT;
  const dailyPct =
    plan === 'pro' ? 0 : Math.min(100, Math.round((queriesToday / dailyCap) * 100));

  return (
    <div className={compact ? 'space-y-2' : 'mt-5'}>
      <p className="text-sm text-muted-foreground">
        Today&apos;s searches:{' '}
        <span className="font-medium text-foreground">
          {plan === 'pro' ? 'Unlimited' : `${queriesToday}/${dailyCap}`}
        </span>
        {plan === 'free' ? (
          <span className="text-muted-foreground"> · resets midnight UTC</span>
        ) : null}
      </p>
      {plan === 'free' ? (
        <div className={`${compact ? 'mt-2' : 'mt-3'} h-1 w-full overflow-hidden bg-muted`}>
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

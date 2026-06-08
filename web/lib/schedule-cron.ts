import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { getUserPlan } from '@/lib/plan';

/** Free users are on-demand only; ignore tampered schedule_cron from forms. */
export async function resolveScheduleCron(
  userId: string,
  submitted: string | null | undefined,
): Promise<string> {
  const plan = await getUserPlan(userId);
  if (plan !== 'pro') return MANUAL_SCHEDULE_CRON;
  const value = submitted?.trim();
  return value && value.length > 0 ? value : MANUAL_SCHEDULE_CRON;
}

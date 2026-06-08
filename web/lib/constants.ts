/** Primary job search screen (centered). */
export const SEARCH_PAGE = '/dashboard/searches';

/** Public try-before-signup search (guest). */
export const TRY_PAGE = '/try';

/** Profiles with this cron value are on-demand only (no scheduled newsletter). */
export const MANUAL_SCHEDULE_CRON = 'manual';

export function isScheduledNewsletterProfile(scheduleCron: string | null | undefined): boolean {
  return !!scheduleCron && scheduleCron !== MANUAL_SCHEDULE_CRON;
}

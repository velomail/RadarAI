-- Product pivot: free tier is on-demand search only (schedule_cron = 'manual').
-- Newsletter cron values are reserved for Pro subscribers later.
UPDATE search_profiles
SET schedule_cron = 'manual',
    updated_at = now()
WHERE schedule_cron IS DISTINCT FROM 'manual';

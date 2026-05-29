'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { SearchFocusFields, type SearchFocusDefaults } from './SearchFocusFields';

export interface JobSearchDefaults extends SearchFocusDefaults {
  name?: string;
  remote_only?: boolean;
  min_score?: number;
  notify_email?: string;
}

/** Keywords, location, and filters — one unified job search form. */
export function JobSearchFields({ defaults }: { defaults?: JobSearchDefaults }) {
  return (
    <>
      <input type="hidden" name="name" value={defaults?.name || 'My job search'} />
      <input type="hidden" name="schedule_cron" value={MANUAL_SCHEDULE_CRON} />
      <input type="hidden" name="notify_email" value={defaults?.notify_email || ''} />

      <SearchFocusFields defaults={defaults} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults?.location || 'Canada'} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="min_score">Minimum match score</Label>
          <Input
            id="min_score"
            name="min_score"
            type="number"
            min={50}
            max={100}
            defaultValue={defaults?.min_score ?? 70}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="remote_only"
          defaultChecked={defaults?.remote_only ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Remote roles only
      </label>
    </>
  );
}

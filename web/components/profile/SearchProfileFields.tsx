'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { SearchFocusFields, type SearchFocusDefaults } from './SearchFocusFields';

export interface SearchProfileDefaults extends SearchFocusDefaults {
  name?: string;
  remote_only?: boolean;
  min_score?: number;
  notify_email?: string;
  email_on_complete?: boolean;
}

export function SearchProfileFields({
  defaults,
  userEmail,
}: {
  defaults?: SearchProfileDefaults;
  userEmail?: string;
}) {
  const accountEmail = userEmail || defaults?.notify_email || '';
  const [emailOnComplete, setEmailOnComplete] = useState(
    defaults?.email_on_complete ?? !!defaults?.notify_email,
  );

  return (
    <>
      <input type="hidden" name="schedule_cron" value={MANUAL_SCHEDULE_CRON} />
      <input type="hidden" name="notify_email" value={emailOnComplete ? accountEmail : ''} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Search name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name || 'My job search'}
          placeholder="e.g. Toronto marketing roles"
        />
      </div>

      <SearchFocusFields defaults={defaults} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults?.location || 'Canada'} />
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

      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="remote_only"
          defaultChecked={defaults?.remote_only ?? false}
          className="h-5 w-5 shrink-0 rounded border-border"
        />
        Remote roles only
      </label>

      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={emailOnComplete}
            onChange={(e) => setEmailOnComplete(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-border"
          />
          <span>
            <span className="font-medium text-foreground">Email me when this search finishes</span>
            <span className="mt-1 block text-muted-foreground">
              One-time summary to {accountEmail || 'your account email'} when a search finishes.
            </span>
          </span>
        </label>
      </div>
    </>
  );
}

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

type Props = {
  defaults?: JobSearchDefaults;
  size?: 'default' | 'lg';
  showMinScore?: boolean;
  queriesRows?: number;
  layout?: 'stack' | 'panel';
};

/** Keywords, location, and filters — one unified job search form. */
export function JobSearchFields({
  defaults,
  size = 'default',
  showMinScore = true,
  queriesRows,
  layout = 'stack',
}: Props) {
  const large = size === 'lg';
  const labelClass = large ? 'text-base font-medium' : undefined;
  const fieldClass = large ? 'h-12 text-base' : undefined;
  const sectionGap = large ? 'gap-3' : 'gap-2';
  const panel = layout === 'panel';

  return (
    <>
      <input type="hidden" name="name" value={defaults?.name || 'My job search'} />
      <input type="hidden" name="schedule_cron" value={MANUAL_SCHEDULE_CRON} />
      <input type="hidden" name="notify_email" value={defaults?.notify_email || ''} />
      {!showMinScore ? (
        <input type="hidden" name="min_score" value={String(defaults?.min_score ?? 70)} />
      ) : null}

      <SearchFocusFields
        defaults={defaults}
        size={size}
        layout={layout}
        showLocation={panel}
        queriesRows={queriesRows ?? (large ? 3 : 3)}
      />

      {!panel ? (
        <div className={`grid gap-6 ${showMinScore ? 'sm:grid-cols-2' : ''}`}>
          <div className={`flex flex-col ${sectionGap}`}>
            <Label htmlFor="location" className={labelClass}>
              Location
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={defaults?.location || 'Canada'}
              required
              className={fieldClass}
            />
          </div>
          {showMinScore ? (
            <div className={`flex flex-col ${sectionGap}`}>
              <Label htmlFor="min_score" className={labelClass}>
                Minimum match score
              </Label>
              <Input
                id="min_score"
                name="min_score"
                type="number"
                min={50}
                max={100}
                defaultValue={defaults?.min_score ?? 70}
                className={fieldClass}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <label
        className={`flex min-h-12 cursor-pointer items-center gap-3 ${
          large ? 'text-base' : 'text-sm'
        } ${panel ? 'lg:col-span-1 lg:self-center' : ''}`}
      >
        <input
          type="checkbox"
          name="remote_only"
          defaultChecked={defaults?.remote_only ?? false}
          className="h-5 w-5 shrink-0 rounded border-border"
        />
        Remote roles only
      </label>
    </>
  );
}

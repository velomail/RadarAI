'use client';

import { useMemo, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_SEARCH_FOCUS,
  getSearchFocus,
  SEARCH_FOCUS_OPTIONS,
} from '@/lib/search-focus';

export interface SearchFocusDefaults {
  search_focus?: string;
  queries?: string;
  location?: string;
}

interface Props {
  defaults?: SearchFocusDefaults;
  showLocation?: boolean;
  queriesRows?: number;
}

export function SearchFocusFields({
  defaults,
  showLocation = false,
  queriesRows = 3,
}: Props) {
  const initialFocus = defaults?.search_focus || DEFAULT_SEARCH_FOCUS;
  const [focusId, setFocusId] = useState(initialFocus);
  const [queries, setQueries] = useState(() => {
    if (defaults?.queries) return defaults.queries;
    const focus = getSearchFocus(initialFocus);
    return focus.defaultQueries.join(', ');
  });

  const focus = useMemo(() => getSearchFocus(focusId), [focusId]);

  function onFocusChange(nextId: string) {
    setFocusId(nextId);
    const next = getSearchFocus(nextId);
    if (nextId !== 'auto' && next.defaultQueries.length) {
      setQueries(next.defaultQueries.join(', '));
    } else if (nextId === 'auto') {
      setQueries('');
    }
  }

  return (
    <>
      <input type="hidden" name="search_focus" value={focusId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="search_focus_select">What are you looking for?</Label>
        <select
          id="search_focus_select"
          value={focusId}
          onChange={(e) => onFocusChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SEARCH_FOCUS_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {focusId === 'auto'
            ? 'We read your resume and pick search titles automatically. You can add keywords below to steer results.'
            : 'Keywords below are tuned for this field. Edit them anytime.'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="queries">
          {focusId === 'auto' ? 'Optional keywords (comma-separated)' : 'Keywords (comma-separated)'}
        </Label>
        <Textarea
          id="queries"
          name="queries"
          rows={queriesRows}
          required={focusId !== 'auto'}
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          placeholder={
            focusId === 'auto'
              ? 'Leave blank to auto-detect from resume, or add e.g. product manager, UX researcher'
              : focus.defaultQueries.join(', ')
          }
        />
        <p className="text-xs text-muted-foreground">
          Each phrase is searched across LinkedIn and 30+ job boards.
        </p>
      </div>

      {showLocation && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={defaults?.location || 'Canada'} />
        </div>
      )}
    </>
  );
}

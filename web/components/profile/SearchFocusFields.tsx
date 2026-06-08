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

const HINT_SM = 'text-xs text-muted-foreground';
const HINT_LG = 'text-base leading-relaxed text-muted-foreground lg:text-lg';
const HINT_PANEL = 'text-sm leading-relaxed text-muted-foreground';

const SELECT_BASE =
  'w-full min-w-0 appearance-none rounded-md border border-border bg-background px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface Props {
  defaults?: SearchFocusDefaults;
  showLocation?: boolean;
  queriesRows?: number;
  /** Larger labels, inputs, and hint copy for marketing / guest pages */
  size?: 'default' | 'lg';
  /** Panel: focus + location side-by-side, keywords full width (for guest try grid) */
  layout?: 'stack' | 'panel';
}

export function SearchFocusFields({
  defaults,
  showLocation = false,
  queriesRows = 3,
  size = 'default',
  layout = 'stack',
}: Props) {
  const large = size === 'lg';
  const panel = layout === 'panel';
  const hintClass = panel ? HINT_PANEL : large ? HINT_LG : HINT_SM;
  const labelClass = large ? 'text-base font-medium' : undefined;
  const fieldClass = large ? 'h-12 text-base px-4' : undefined;
  const sectionGap = panel ? 'gap-2.5' : large ? 'gap-3' : 'gap-2';
  const focusWrap = `flex min-w-0 flex-col ${sectionGap}`;
  const queriesWrap = panel ? `flex min-w-0 flex-col ${sectionGap} lg:col-span-2` : focusWrap;
  const locationWrap = focusWrap;
  const selectClass = `${SELECT_BASE} ${large ? 'h-12 text-base' : 'h-10 text-sm'}`;
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

      <div className={focusWrap}>
        <Label htmlFor="search_focus_select" className={labelClass}>
          {panel ? 'What' : 'What are you looking for?'}
        </Label>
        <select
          id="search_focus_select"
          value={focusId}
          onChange={(e) => onFocusChange(e.target.value)}
          className={selectClass}
        >
          {SEARCH_FOCUS_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        {!panel ? (
          <p className={hintClass}>
            {focusId === 'auto'
              ? 'We read your resume and pick search titles automatically. You can add keywords below to steer results.'
              : 'Keywords below are tuned for this field. Edit them anytime.'}
          </p>
        ) : null}
      </div>

      {showLocation && panel ? (
        <div className={locationWrap}>
          <Label htmlFor="location" className={labelClass}>
            Where
          </Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location || 'Canada'}
            required
            className={fieldClass}
            placeholder="City or remote"
          />
        </div>
      ) : null}

      <div className={queriesWrap}>
        <Label htmlFor="queries" className={labelClass}>
          {panel
            ? focusId === 'auto'
              ? 'Keywords (optional)'
              : 'Keywords'
            : focusId === 'auto'
              ? 'Optional keywords (comma-separated)'
              : 'Keywords (comma-separated)'}
        </Label>
        <Textarea
          id="queries"
          name="queries"
          rows={queriesRows}
          required={focusId !== 'auto'}
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          className={panel && large ? 'min-h-[88px] px-4 py-3 text-base' : fieldClass}
          placeholder={
            focusId === 'auto'
              ? 'Leave blank to auto-detect from resume, or add e.g. product manager, UX researcher'
              : focus.defaultQueries.join(', ')
          }
        />
        <p className={hintClass}>
          {panel
            ? 'Comma-separated. Leave blank to match from your resume.'
            : 'Each phrase is searched as a separate query.'}
        </p>
      </div>

      {showLocation && !panel ? (
        <div className={locationWrap}>
          <Label htmlFor="location" className={labelClass}>
            Location
          </Label>
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location || 'Canada'}
            className={fieldClass}
          />
        </div>
      ) : null}
    </>
  );
}

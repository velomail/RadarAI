import { MapPin, Target } from 'lucide-react';
import { getSearchFocus } from '@/lib/search-focus';
import type { SearchProfile } from '@/lib/types';

export function SearchCriteriaSummary({ profile }: { profile: SearchProfile }) {
  const focus = getSearchFocus(profile.search_focus || 'auto');
  const keywords = profile.queries.length
    ? profile.queries.slice(0, 4).join(', ')
    : 'Auto-detected from resume';

  return (
    <div className="glass grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          Focus
        </p>
        <p className="text-sm font-medium text-foreground">{focus.label}</p>
      </div>
      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Location
        </p>
        <p className="text-sm font-medium text-foreground">
          {profile.location}
          {profile.remote_only ? ' · Remote only' : ''}
        </p>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Keywords
        </p>
        <p className="text-sm text-foreground">{keywords}</p>
      </div>
    </div>
  );
}

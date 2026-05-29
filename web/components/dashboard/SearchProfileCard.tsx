import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { RunNowButton } from '@/components/dashboard/RunNowButton';
import { SEARCH_PAGE } from '@/lib/constants';
import type { SearchProfile } from '@/lib/types';

export function SearchProfileCard({ profile }: { profile: SearchProfile }) {
  const keywords = profile.queries.length
    ? profile.queries.slice(0, 3).join(', ')
    : 'Auto from resume';

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Link
        href={SEARCH_PAGE}
        className="flex items-center justify-between gap-4 border-b border-border/40 px-5 py-4 transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{profile.name}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{keywords}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {profile.location}
            {profile.remote_only ? ' · Remote' : ''}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>
      <div className="px-5 py-4">
        <RunNowButton profileId={profile.id} fullWidth label="Search now" />
      </div>
    </div>
  );
}

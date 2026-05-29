import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RunNowButton } from '@/components/dashboard/RunNowButton';
import type { SearchProfile } from '@/lib/types';

export function SearchProfileCard({ profile }: { profile: SearchProfile }) {
  return (
    <div className="glass overflow-hidden rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{profile.name}</h3>
        <Badge variant="muted" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          On-demand
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Job title or keywords</p>
        <div className="flex h-12 items-center rounded-xl border border-white/40 bg-white/80 px-4 text-sm text-muted-foreground backdrop-blur-sm">
          {profile.queries.length ? profile.queries.slice(0, 4).join(', ') : 'Auto from resume'}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Location</p>
        <div className="flex h-12 items-center gap-2 rounded-xl border border-white/40 bg-white/80 px-4 text-sm text-muted-foreground backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {profile.location}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <RunNowButton profileId={profile.id} fullWidth label="Search jobs" />
      </div>
      <div className="mt-3 text-center">
        <Link
          href={`/dashboard/searches/${profile.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit search settings
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { FileText, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RunNowButton } from '@/components/dashboard/RunNowButton';
import type { SearchProfile } from '@/lib/types';

export function SearchProfileCard({
  profile,
  resumeFilename,
}: {
  profile: SearchProfile;
  resumeFilename?: string | null;
}) {
  return (
    <div className="glass rounded-2xl p-6 md:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight">{profile.name}</h3>
        <Badge variant="muted" className="rounded-full px-3 py-1 text-xs font-medium">
          On-demand
        </Badge>
      </div>

      {resumeFilename ? (
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Resume: <span className="font-medium text-foreground">{resumeFilename}</span>
          </span>
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Job title or keywords</p>
          <div className="min-h-12 rounded-xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-foreground backdrop-blur-sm">
            {profile.queries.length ? profile.queries.slice(0, 4).join(', ') : 'Auto from resume'}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Location</p>
          <div className="flex min-h-12 items-center gap-2 rounded-xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-foreground backdrop-blur-sm">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {profile.location}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <RunNowButton profileId={profile.id} fullWidth label="Search jobs" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href={`/dashboard/searches/${profile.id}`} className="font-medium text-primary hover:underline">
          Edit search settings
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/searches#resume" className="text-muted-foreground hover:text-foreground">
          Change resume
        </Link>
      </div>
    </div>
  );
}

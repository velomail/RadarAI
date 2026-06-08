'use client';

import { useFormStatus } from 'react-dom';
import { MANUAL_SCHEDULE_CRON } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SearchProfile } from '@/lib/types';
import { runJobSearch } from '@/app/(app)/dashboard/searches/actions';

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="h-11 w-full shrink-0 lg:h-12 lg:w-auto lg:px-10 lg:text-base"
      disabled={pending}
    >
      {pending ? 'Searching…' : 'Search'}
    </Button>
  );
}

type Props = {
  profile: SearchProfile;
  error?: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  daily_limit: "You've used all 5 searches today. Resets at midnight UTC.",
  resume_missing: 'Upload a resume before searching.',
};

export function JobSearchBar({ profile, error }: Props) {
  const runSearch = runJobSearch.bind(null, profile.id);
  const whatValue = profile.queries.join(', ');

  return (
    <div className="border-b border-border bg-background px-5 py-4 sm:px-6 lg:px-10 lg:py-6 xl:px-12">
      {error ? (
        <p className="mb-3 text-sm text-foreground lg:text-base">{ERROR_MESSAGES[error] || error}</p>
      ) : null}

      <form action={runSearch} className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:gap-5">
        <input type="hidden" name="name" value={profile.name || 'My job search'} />
        <input type="hidden" name="schedule_cron" value={MANUAL_SCHEDULE_CRON} />
        <input type="hidden" name="notify_email" value={profile.notify_email ?? ''} />
        <input type="hidden" name="search_focus" value={profile.search_focus || 'auto'} />
        <input type="hidden" name="min_score" value={String(profile.min_score ?? 70)} />
        {profile.remote_only ? <input type="hidden" name="remote_only" value="on" /> : null}

        <div className="min-w-0 flex-1 space-y-1.5 lg:space-y-2">
          <Label htmlFor="search-what" className="text-xs text-muted-foreground lg:text-sm">
            What
          </Label>
          <Input
            id="search-what"
            name="queries"
            defaultValue={whatValue}
            placeholder="Job title, keywords, or company"
            className="h-11 lg:h-12"
            required={Boolean(profile.search_focus && profile.search_focus !== 'auto')}
          />
        </div>

        <div className="w-full space-y-1.5 lg:w-64 lg:space-y-2 xl:w-72">
          <Label htmlFor="search-where" className="text-xs text-muted-foreground lg:text-sm">
            Where
          </Label>
          <Input
            id="search-where"
            name="location"
            defaultValue={profile.location || 'Canada'}
            placeholder="City or remote"
            className="h-11 lg:h-12"
            required
          />
        </div>

        <SearchButton />
      </form>

      <p className="mt-3 text-xs text-muted-foreground lg:text-sm">Resume-aware results</p>
    </div>
  );
}

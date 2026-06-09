'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { JobSearchFields } from '@/components/profile/JobSearchFields';
import { Button } from '@/components/ui/button';
import { runJobSearch } from '@/app/(app)/dashboard/searches/actions';
import type { SearchProfile } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="h-12 w-full px-8 text-base" disabled={pending}>
      {pending ? 'Searching…' : 'Search'}
    </Button>
  );
}

type Props = {
  profile: SearchProfile;
  resumeFilename?: string | null;
  error?: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  daily_limit: "You've used all 5 searches today. Resets at midnight UTC.",
  resume_missing: 'Upload a resume before searching.',
  run_create_failed: 'Could not start this search. Try again in a moment.',
};

export function AppSearchForm({ profile, resumeFilename, error }: Props) {
  const runSearch = runJobSearch.bind(null, profile.id);

  return (
    <form
      action={runSearch}
      className="grid gap-7 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6"
    >
      {error ? (
        <p className="text-base text-foreground lg:col-span-2 lg:text-lg">
          {ERROR_MESSAGES[error] || decodeURIComponent(error)}
        </p>
      ) : null}

      {resumeFilename ? (
        <div className="rounded-md border border-border px-4 py-3 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resume on file
          </p>
          <p className="mt-1 truncate text-sm font-medium">{resumeFilename}</p>
          <Link
            href="/dashboard/settings/search"
            className="mt-1 inline-block text-xs text-muted-foreground hover:text-foreground"
          >
            Update resume &amp; defaults →
          </Link>
        </div>
      ) : null}

      <JobSearchFields
        layout="panel"
        size="lg"
        showMinScore={false}
        queriesRows={2}
        defaults={{
          name: profile.name || 'My job search',
          search_focus: profile.search_focus || 'auto',
          queries: profile.queries.join(', '),
          location: profile.location || 'Canada',
          remote_only: profile.remote_only,
          min_score: profile.min_score ?? 70,
          notify_email: profile.notify_email ?? '',
        }}
      />

      <div className="flex items-end lg:col-start-2">
        <SubmitButton />
      </div>
    </form>
  );
}

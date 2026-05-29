'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Settings2 } from 'lucide-react';
import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';
import { JobSearchFields } from '@/components/profile/JobSearchFields';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import type { UserPlan } from '@/lib/plan';
import type { SearchProfile } from '@/lib/types';
import { runJobSearch } from '@/app/(app)/dashboard/searches/actions';
import { updateAccountResume } from '@/app/(app)/dashboard/searches/resume-actions';

type Props = {
  profile: SearchProfile;
  resumeFilename?: string | null;
  dailyUsage: { queries_today: number; limit: number; plan: UserPlan };
  error?: string | null;
};

function SearchSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={pending}>
      {pending ? 'Starting search…' : 'Search now'}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  daily_limit: "You've used all 3 free searches today. Resets at midnight UTC.",
  resume_missing: 'Upload a resume before searching.',
};

export function JobSearchCard({ profile, resumeFilename, dailyUsage, error }: Props) {
  const [hasResumeFile, setHasResumeFile] = useState(false);
  const runSearch = runJobSearch.bind(null, profile.id);

  return (
    <div className="flex w-full flex-col gap-6">
      {error ? (
        <div className="rounded-xl border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 px-4 py-3 text-sm text-[hsl(var(--danger))]">
          {ERROR_MESSAGES[error] || error}
        </div>
      ) : null}

      <form action={updateAccountResume} className="space-y-3 border-b border-border/50 pb-6">
        <ResumeUploadField
          compact
          currentFilename={resumeFilename}
          required={false}
          onFileChange={setHasResumeFile}
        />
        {hasResumeFile ? (
          <Button type="submit" variant="outline" size="sm">
            Save new resume
          </Button>
        ) : null}
      </form>

      <form action={runSearch} className="flex flex-col gap-6">
        <JobSearchFields
          defaults={{
            name: profile.name,
            search_focus: profile.search_focus || 'auto',
            queries: profile.queries.join(', '),
            location: profile.location,
            remote_only: profile.remote_only,
            min_score: profile.min_score,
            notify_email: profile.notify_email ?? '',
          }}
        />

        <DailyUsageMeter
          queriesToday={dailyUsage.queries_today}
          limit={dailyUsage.limit}
          plan={dailyUsage.plan}
          compact
        />

        <SearchSubmitButton />
      </form>

      <div className="flex justify-center border-t border-border/50 pt-4">
        <Link
          href={`/dashboard/searches/${profile.id}/edit`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Email alerts &amp; advanced settings
        </Link>
      </div>
    </div>
  );
}

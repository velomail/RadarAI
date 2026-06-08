'use client';

import { useFormStatus } from 'react-dom';
import { JobSearchFields } from '@/components/profile/JobSearchFields';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import { startGuestSearch } from '@/app/(marketing)/try/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="h-12 w-full px-8 text-base" disabled={pending}>
      {pending ? 'Searching…' : 'Search'}
    </Button>
  );
}

type Props = {
  error?: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  daily_limit: "You've used your free preview search for today. Create an account for more.",
  resume_missing: 'Upload a PDF resume to search.',
};

export function GuestSearchForm({ error }: Props) {
  return (
    <form
      action={startGuestSearch}
      className="grid gap-7 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6"
    >
      {error ? (
        <p className="text-base text-foreground lg:col-span-2 lg:text-lg">
          {ERROR_MESSAGES[error] || decodeURIComponent(error)}
        </p>
      ) : null}

      <div className="lg:col-span-2">
        <ResumeUploadField required size="lg" />
      </div>

      <JobSearchFields
        layout="panel"
        size="lg"
        showMinScore={false}
        queriesRows={2}
        defaults={{
          name: 'Guest search',
          search_focus: 'auto',
          location: 'Canada',
          min_score: 75,
        }}
      />

      <div className="flex items-end lg:col-start-2">
        <SubmitButton />
      </div>
    </form>
  );
}

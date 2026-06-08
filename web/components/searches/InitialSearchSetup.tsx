'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { JobSearchFields } from '@/components/profile/JobSearchFields';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import { createOnboardingProfile } from '@/app/(app)/dashboard/searches/onboarding-actions';

function SetupSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="h-12 w-full px-8 text-base" disabled={pending}>
      {pending ? 'Starting search…' : 'Save and search'}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

/** First-time setup — matches guest try form inside the search card. */
export function InitialSearchSetup() {
  return (
    <form
      action={createOnboardingProfile}
      className="grid gap-7 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6"
    >
      <div className="lg:col-span-2">
        <ResumeUploadField required size="lg" />
      </div>
      <JobSearchFields
        layout="panel"
        size="lg"
        showMinScore={false}
        queriesRows={2}
        defaults={{
          name: 'My job search',
          search_focus: 'auto',
          location: 'Canada',
          min_score: 70,
        }}
      />
      <div className="flex items-end lg:col-start-2">
        <SetupSubmitButton />
      </div>
    </form>
  );
}

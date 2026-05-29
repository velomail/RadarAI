'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { JobSearchFields } from '@/components/profile/JobSearchFields';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import { createOnboardingProfile } from '@/app/(app)/onboarding/actions';

function SetupSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={pending}>
      {pending ? 'Starting search…' : 'Save and search'}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

/** First-time setup — same centered card as the main job search screen. */
export function InitialSearchSetup() {
  return (
    <form action={createOnboardingProfile} className="flex flex-col gap-6">
      <ResumeUploadField required />
      <JobSearchFields
        defaults={{
          name: 'My job search',
          search_focus: 'auto',
          location: 'Canada',
          min_score: 70,
        }}
      />
      <SetupSubmitButton />
    </form>
  );
}

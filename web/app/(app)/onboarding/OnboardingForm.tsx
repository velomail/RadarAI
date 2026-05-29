'use client';

import { ArrowRight, Search } from 'lucide-react';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOnboardingProfile } from './actions';

export function OnboardingForm() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="glass-subtle mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            Account setup - resume-aware search
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Set up your search</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          Upload your resume and define your target roles. We will run AI-ranked searches from your
          dashboard.
        </p>
      </div>

      <form action={createOnboardingProfile} className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="search_focus" value="auto" />
        <input type="hidden" name="name" value="My daily radar" />
        <input type="hidden" name="min_score" value="70" />
        <input type="hidden" name="schedule_cron" value="MANUAL" />
        <input type="hidden" name="notify_email" value="" />

        <ResumeUploadField required />

        <div className="space-y-2">
          <Label htmlFor="queries" className="text-sm font-medium">
            Job title or keywords
          </Label>
          <Input
            id="queries"
            name="queries"
            type="text"
            placeholder="e.g. Product Designer, Frontend Engineer"
            className="h-12 rounded-xl border-white/40 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. San Francisco, Remote, New York"
            className="h-12 rounded-xl border-white/40 bg-white/80 backdrop-blur-sm"
            defaultValue="Canada"
            required
          />
        </div>

        <Button type="submit" size="lg" className="group h-12 w-full rounded-xl text-base">
          Save and continue
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { ArrowRight, FileText, Search, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createOnboardingProfile } from './actions';

export function OnboardingForm() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const onRemoveFile = () => {
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

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

        <div className="space-y-2">
          <Label htmlFor="resume" className="text-sm font-medium">
            Resume (required)
          </Label>
          <input
            ref={resumeInputRef}
            id="resume"
            name="resume"
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            className="sr-only"
            required
          />
          {!resumeFile ? (
            <label
              htmlFor="resume"
              className="glass group flex cursor-pointer flex-col items-center justify-center rounded-2xl p-8 transition-colors hover:bg-card/80"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <span className="mb-1 font-medium">Drop your resume here</span>
              <span className="text-sm text-muted-foreground">PDF only up to 2MB</span>
            </label>
          ) : (
            <div className="glass flex items-center justify-between rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{resumeFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveFile}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

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

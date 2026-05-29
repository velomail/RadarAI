'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Search, Upload, X } from 'lucide-react';
import { AuthWallModal } from '@/components/auth/AuthWallModal';
import { ProductShell } from '@/components/layout/ProductShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  isGuestLimitError,
  readGuestUsedFromStorage,
} from '@/lib/guest-limit';
import { startDemoRun } from './actions';

export default function DemoPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [authWallOpen, setAuthWallOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const onRemoveFile = () => {
    setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const openAuthWall = () => setAuthWallOpen(true);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (readGuestUsedFromStorage()) {
      openAuthWall();
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await startDemoRun(formData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        if (isGuestLimitError(message)) {
          openAuthWall();
          return;
        }
        setFormError(message);
      }
    });
  };

  return (
    <ProductShell cta={{ href: '/sign-up', label: 'Create account' }} maxWidth="4xl">
      <AuthWallModal open={authWallOpen} onOpenChange={setAuthWallOpen} redirectPath="/demo" />
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="glass-subtle mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
              1 free search — no account required
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Try RadarAI</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Upload your resume and search for roles. Get AI-powered summaries and experience
            comparisons in under a minute.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
          <input type="hidden" name="search_focus" value="auto" />

          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm font-medium">
              Resume (required)
            </Label>
            <input
              ref={resumeInputRef}
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
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
                <span className="text-sm text-muted-foreground">PDF, DOC, or DOCX up to 5MB</span>
              </label>
            ) : (
              <div className="glass flex items-center justify-between rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
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
              required
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

          {formError ? (
            <p className="text-sm text-[hsl(var(--danger))]" role="alert">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="group h-12 w-full rounded-xl text-base"
          >
            {pending ? 'Searching…' : 'Search jobs'}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          One guest search included.{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Create a free account
          </Link>{' '}
          for up to 3 searches per day.
        </p>
      </div>
    </ProductShell>
  );
}

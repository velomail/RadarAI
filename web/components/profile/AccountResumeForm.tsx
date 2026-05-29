'use client';

import { useState } from 'react';
import { ResumeUploadField } from '@/components/profile/ResumeUploadField';
import { Button } from '@/components/ui/button';

type Props = {
  currentFilename?: string | null;
  action: (formData: FormData) => Promise<void>;
};

/** Compact resume row on account searches — full upload UI only when updating. */
export function AccountResumeForm({ currentFilename, action }: Props) {
  const [hasFile, setHasFile] = useState(false);

  return (
    <form action={action} className="glass flex flex-col gap-4 rounded-2xl p-6">
      <div>
        <h2 className="text-lg font-semibold">Your resume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Searches use your latest resume. Upload a new PDF to replace it for all saved searches.
        </p>
      </div>
      <ResumeUploadField
        compact
        currentFilename={currentFilename}
        required={false}
        onFileChange={setHasFile}
      />
      {hasFile ? (
        <Button type="submit" variant="outline" className="self-start">
          Save new resume
        </Button>
      ) : null}
    </form>
  );
}

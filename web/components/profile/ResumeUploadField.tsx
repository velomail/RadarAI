'use client';

import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Props = {
  /** Current saved resume filename, if any */
  currentFilename?: string | null;
  /** HTML input name for server actions */
  name?: string;
  required?: boolean;
  /** When a resume exists, show filename + update button instead of full dropzone */
  compact?: boolean;
  onFileChange?: (hasFile: boolean) => void;
};

export function ResumeUploadField({
  currentFilename,
  name = 'resume',
  required = false,
  compact = false,
  onFileChange,
}: Props) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = `resume-${name}`;

  function setFile(file: File | null) {
    setResumeFile(file);
    onFileChange?.(!!file);
  }

  const showCompact =
    compact && currentFilename && !resumeFile && !showPicker;

  if (showCompact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Current resume</p>
            <p className="truncate text-sm text-muted-foreground">{currentFilename}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(true)}
        >
          Update resume
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!compact ? (
        <Label htmlFor={inputId} className="text-sm font-medium">
          Resume {required ? '(required)' : '(optional — upload to replace current)'}
        </Label>
      ) : null}

      {currentFilename && !resumeFile && !compact ? (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Current resume</p>
            <p className="truncate text-sm text-muted-foreground">{currentFilename}</p>
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept=".pdf,application/pdf"
        required={required && !currentFilename}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="sr-only"
      />

      {!resumeFile ? (
        compact ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose PDF
            </Button>
            {showPicker ? (
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            ) : null}
            <span className="text-xs text-muted-foreground">PDF only, up to 2MB</span>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="glass group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-6 transition-colors hover:bg-card/80"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">
              {currentFilename ? 'Upload a different PDF' : 'Drop your resume here'}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">PDF only, up to 2MB</span>
          </label>
        )
      ) : (
        <div className="glass flex items-center justify-between rounded-2xl p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{resumeFile.name}</p>
              <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
              if (compact) setShowPicker(false);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  accept?: string;
  maxBytes?: number;
  className?: string;
  onFileChange?: (file: File | null) => void;
}

// 2MB. Aligned with Supabase Free Tier storage budget and Vercel hobby body limits.
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

export function Dropzone({
  name,
  accept = '.pdf',
  maxBytes = DEFAULT_MAX_BYTES,
  className,
  onFileChange,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (f && f.size > maxBytes) {
        setError(`File is ${(f.size / 1024 / 1024).toFixed(1)}MB; max is ${maxBytes / 1024 / 1024}MB.`);
        return;
      }
      setFile(f);
      onFileChange?.(f);
      if (inputRef.current && f) {
        const dt = new DataTransfer();
        dt.items.add(f);
        inputRef.current.files = dt.files;
      }
    },
    [maxBytes, onFileChange],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={`${name}-input`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFile(dropped);
        }}
        className={cn(
          'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-primary bg-accent' : 'border-border hover:border-primary/50',
        )}
      >
        {file ? (
          <>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB — click to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">Drop your resume PDF here</p>
            <p className="text-xs text-muted-foreground">
              or click to choose a file (max {Math.round(maxBytes / 1024 / 1024)}MB)
            </p>
            <p className="text-xs text-muted-foreground/80">
              Stored privately in your account — used only to score matches.
            </p>
          </>
        )}
      </label>
      <input
        ref={inputRef}
        id={`${name}-input`}
        name={name}
        type="file"
        accept={accept}
        required
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
      {error && <p className="text-xs text-[hsl(var(--danger))]">{error}</p>}
    </div>
  );
}

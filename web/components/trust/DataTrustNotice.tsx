import { Shield } from 'lucide-react';

export function DataTrustNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm'
          : 'rounded-xl border border-border bg-card px-5 py-4 shadow-sm'
      }
    >
      <div className="flex gap-3">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium text-foreground">Your data stays yours</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Resume PDFs are stored in private Supabase Storage (not public).</li>
            <li>We only use your resume text to score jobs — never sold to third parties.</li>
            <li>Demo uploads auto-delete within 24 hours.</li>
            <li>Delete your account data anytime from Settings.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

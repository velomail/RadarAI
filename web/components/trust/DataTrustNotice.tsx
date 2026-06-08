export function DataTrustNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'border border-border px-4 py-3 text-sm'
          : 'border border-border px-5 py-4'
      }
    >
      <p className="font-medium">Your data stays yours</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
        <li>Resume PDFs are stored in private cloud storage.</li>
        <li>We only use your resume text to score jobs — never sold to third parties.</li>
        <li>Delete your account data anytime from Settings.</li>
      </ul>
    </div>
  );
}

import { Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/** Paid feature placeholder — scheduled email digest (not yet wired to billing). */
export function NewsletterUpsell() {
  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Email newsletter</h3>
            <Badge variant="muted">Pro — coming soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Run searches on demand for free. Upgrade later to receive a scheduled digest of your
            best matches — fresh roles in your inbox without opening the app.
          </p>
          <p className="text-xs text-muted-foreground">
            Today: open <strong className="font-medium text-foreground">Search</strong> in the nav,
            then click <strong className="font-medium text-foreground">Search now</strong> whenever
            you want results (3 free searches per day).
          </p>
        </div>
      </div>
    </div>
  );
}

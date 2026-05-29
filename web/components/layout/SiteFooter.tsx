import Link from 'next/link';
import { Radar } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-primary" />
          <p>
            <span className="font-medium text-foreground">{APP_NAME}</span> — AI job search on demand
          </p>
        </div>
        <nav className="flex flex-wrap gap-5">
          <Link href="/demo" className="transition-colors hover:text-foreground">
            Try demo
          </Link>
          <Link href="/sign-in" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

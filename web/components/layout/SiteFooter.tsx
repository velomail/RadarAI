import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="page-container flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between lg:py-12">
        <p className="text-base font-semibold tracking-tight text-foreground lg:text-lg">
          {APP_NAME}
        </p>
        <nav className="flex gap-8 text-base text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}

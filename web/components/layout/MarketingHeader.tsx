import Link from 'next/link';
import { Radar } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { Button } from '@/components/ui/button';

export function MarketingHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-6 py-3">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg transition-colors group-hover:bg-primary/30" />
              <Radar className="relative h-7 w-7 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-xl">
                Create account
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

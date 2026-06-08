'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Settings } from 'lucide-react';
import { useAppNav } from '@/components/layout/AppNavContext';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleRecent, recentOpen } = useAppNav();
  const settingsActive = pathname.startsWith('/dashboard/settings');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-lg">
        <button
          type="button"
          onClick={toggleRecent}
          className={cn(
            'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs',
            recentOpen ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
          aria-label="Recent searches"
        >
          <History className="h-5 w-5" />
          Recent
        </button>
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs',
            settingsActive ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </nav>
  );
}

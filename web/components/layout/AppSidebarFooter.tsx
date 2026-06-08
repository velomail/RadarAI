'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Settings } from 'lucide-react';
import { useAppNav } from '@/components/layout/AppNavContext';
import { cn } from '@/lib/utils';

export function AppSidebarFooter() {
  const pathname = usePathname();
  const { toggleRecent, recentOpen } = useAppNav();
  const settingsActive = pathname.startsWith('/dashboard/settings');

  return (
    <div
      className="hidden shrink-0 border-t border-border px-4 py-3 md:flex"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex w-full items-center gap-1">
        <button
          type="button"
          onClick={toggleRecent}
          className={cn(
            'inline-flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-md transition-colors',
            recentOpen
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
          aria-label="Recent searches"
          title="Recent searches"
        >
          <History className="h-5 w-5" />
        </button>
        <Link
          href="/dashboard/settings"
          className={cn(
            'inline-flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-md transition-colors',
            settingsActive
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

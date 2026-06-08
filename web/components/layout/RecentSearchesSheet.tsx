'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { SEARCH_PAGE } from '@/lib/constants';
import { useAppNav } from '@/components/layout/AppNavContext';
import { cn } from '@/lib/utils';

export function RecentSearchesSheet() {
  const { pastRuns, recentOpen, closeRecent } = useAppNav();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/20 transition-opacity md:hidden',
          recentOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!recentOpen}
        onClick={closeRecent}
      />
      <aside
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 max-h-[min(70vh,28rem)] overflow-hidden rounded-t-xl border border-border bg-background shadow-lg transition-transform md:hidden',
          recentOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden={!recentOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Recent searches</h2>
          <button
            type="button"
            onClick={closeRecent}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          {pastRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed searches yet.</p>
          ) : (
            <ul className="space-y-2">
              {pastRuns.map((run) => (
                <li key={run.id}>
                  <Link
                    href={`${SEARCH_PAGE}?run=${run.id}`}
                    onClick={closeRecent}
                    className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span>
                      {new Date(run.started_at).toLocaleDateString()}{' '}
                      {new Date(run.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="tabular-nums">{run.reported_count} results</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

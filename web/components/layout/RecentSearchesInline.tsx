'use client';

import Link from 'next/link';
import { SEARCH_PAGE } from '@/lib/constants';
import { useAppNav } from '@/components/layout/AppNavContext';
import { cn } from '@/lib/utils';

export function RecentSearchesInline() {
  const { pastRuns, recentOpen } = useAppNav();

  return (
    <div
      className={cn(
        'hidden shrink-0 overflow-hidden border-t border-border transition-all md:block',
        recentOpen ? 'max-h-56 opacity-100' : 'max-h-0 border-transparent opacity-0',
      )}
    >
      <div className="max-h-56 overflow-y-auto px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent searches
        </p>
        {pastRuns.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No completed searches yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {pastRuns.map((run) => (
              <li key={run.id}>
                <Link
                  href={`${SEARCH_PAGE}?run=${run.id}`}
                  className="flex items-center justify-between rounded-md px-1 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span className="truncate pr-2">
                    {new Date(run.started_at).toLocaleDateString()}{' '}
                    {new Date(run.started_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="shrink-0 tabular-nums">{run.reported_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

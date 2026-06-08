import Link from 'next/link';
import { SEARCH_PAGE } from '@/lib/constants';
import type { Run } from '@/lib/types';

export function PastRunsList({ runs }: { runs: Run[] }) {
  if (!runs.length) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Previous searches
      </h2>
      <ul className="mt-3 space-y-2">
        {runs.map((run) => (
          <li key={run.id}>
            <Link
              href={`${SEARCH_PAGE}?run=${run.id}`}
              className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"
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
    </div>
  );
}

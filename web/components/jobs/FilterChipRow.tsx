'use client';

import { cn } from '@/lib/utils';

export type JobFilterId = 'remote' | 'direct' | 'recent';

const FILTERS: { id: JobFilterId; label: string }[] = [
  { id: 'remote', label: 'Remote' },
  { id: 'direct', label: 'Direct apply' },
  { id: 'recent', label: 'Posted this week' },
];

type Props = {
  active: Set<JobFilterId>;
  onToggle: (id: JobFilterId) => void;
};

export function FilterChipRow({ active, onToggle }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map(({ id, label }) => {
        const isOn = active.has(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-2.5 text-xs font-medium transition-colors min-h-11',
              isOn
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

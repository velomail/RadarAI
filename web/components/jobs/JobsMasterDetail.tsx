'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Job } from '@/lib/types';
import { FilterChipRow, type JobFilterId } from './FilterChipRow';
import { JobCardListItem } from './JobCardListItem';
import { JobDetailPanel } from './JobDetailPanel';

function applyFilters(jobs: Job[], active: Set<JobFilterId>): Job[] {
  return jobs.filter((job) => {
    if (active.has('remote') && !job.remote) return false;
    if (active.has('direct') && !job.direct_ats) return false;
    if (active.has('recent')) {
      const tier = job.ai_scores?.freshness_tier;
      if (tier !== 'fresh' && tier !== 'warm') return false;
    }
    return true;
  });
}

export function JobsMasterDetail({ jobs }: { jobs: Job[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null);
  const [filters, setFilters] = useState<Set<JobFilterId>>(new Set());
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const filtered = useMemo(() => applyFilters(jobs, filters), [jobs, filters]);

  const selected =
    filtered.find((j) => j.id === selectedId) ?? filtered[0] ?? null;

  function toggleFilter(id: JobFilterId) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectJob(jobId: string) {
    setSelectedId(jobId);
    setShowMobileDetail(true);
  }

  if (!jobs.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background px-8 py-12 text-center">
        <p className="font-medium">No matches surfaced this run</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try broadening keywords or location, then search again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground lg:text-base">
          {filtered.length} role{filtered.length === 1 ? '' : 's'} · ranked by resume fit · select
          for personalized analysis
        </p>
        <FilterChipRow active={filters} onToggle={toggleFilter} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background lg:flex lg:min-h-[560px]">
        <div
          className={
            showMobileDetail
              ? 'hidden lg:block lg:w-[min(100%,380px)] lg:shrink-0 lg:border-r lg:border-border'
              : 'lg:w-[min(100%,380px)] lg:shrink-0 lg:border-r lg:border-border'
          }
        >
          <div className="lg:h-full lg:max-h-none">
            {filtered.map((job, index) => (
              <JobCardListItem
                key={job.id}
                job={job}
                rank={index + 1}
                selected={selected?.id === job.id}
                onSelect={() => selectJob(job.id)}
              />
            ))}
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 lg:flex">
          {selected ? (
            <JobDetailPanel job={selected} stickyAboveNav />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Select a ranked role</p>
              <p>See resume match insight, score breakdown, and a cleaned posting view.</p>
            </div>
          )}
        </div>
      </div>

      {selected && showMobileDetail ? (
        <div className="overflow-hidden rounded-lg border border-border bg-background lg:hidden">
          <div className="flex items-center border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={() => setShowMobileDetail(false)}
              className="inline-flex min-h-11 min-w-11 items-center gap-1 text-sm font-medium text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
          </div>
          <JobDetailPanel job={selected} stickyAboveNav />
        </div>
      ) : null}
    </div>
  );
}

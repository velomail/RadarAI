'use client';

import type { UserPlan } from '@/lib/plan';
import { RunNowButton } from '@/components/dashboard/RunNowButton';
import { RunPoller } from '@/components/runs/RunPoller';

type Props = {
  profileId: string;
  runId?: string | null;
  tier: UserPlan;
};

/** Search now + inline results on the same screen (no extra routes or modals). */
export function SearchRunPanel({ profileId, runId, tier }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="glass rounded-2xl p-6">
        <RunNowButton profileId={profileId} fullWidth label="Search now" />
      </div>

      {runId ? (
        <div className="flex flex-col gap-4">
          <RunPoller runId={runId} tier={tier} />
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Click Search now to scan Adzuna for fresh matches ranked to your resume.
        </p>
      )}
    </div>
  );
}

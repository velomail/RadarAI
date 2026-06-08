import Link from 'next/link';
import { PastRunsRegistrar } from '@/components/layout/AppNavContext';
import { RunPoller } from '@/components/runs/RunPoller';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { SEARCH_PAGE } from '@/lib/constants';
import type { SearchProfile } from '@/lib/types';
import { AppSearchForm } from './AppSearchForm';
import { InitialSearchSetup } from './InitialSearchSetup';
import type { UserPlan } from '@/lib/plan';
import type { Resume, Run } from '@/lib/types';

type Props = {
  profile: SearchProfile | null;
  resume: Resume | null;
  dailyUsage: { queries_today: number; limit: number; plan: UserPlan };
  pastRuns: Run[];
  runId?: string;
  error?: string | null;
  tier: UserPlan;
};

export function SearchMainPanel({
  profile,
  resume,
  dailyUsage,
  pastRuns,
  runId,
  error,
  tier,
}: Props) {
  return (
    <div className="app-panel-fill">
      <div className="workspace-center w-full">
        {runId ? (
          <div className="content-well-wide flex w-full flex-col gap-10 lg:gap-12">
            <header className="text-center">
              <Link
                href={SEARCH_PAGE}
                className="text-base font-medium text-muted-foreground hover:text-foreground lg:text-lg"
              >
                ← New search
              </Link>
              <p className="mt-6 text-base font-medium text-muted-foreground lg:text-lg">
                Resume-aware results
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Your job matches
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg xl:text-xl">
                Ranked by fit against your resume — with role summaries and honest comparisons.
              </p>
            </header>
            <RunPoller runId={runId} tier={tier} />
          </div>
        ) : (
          <div className="content-well flex w-full flex-col items-center gap-10 lg:gap-12">
            <header className="w-full text-center">
              <p className="text-base font-medium text-muted-foreground lg:text-lg">
                Resume-aware job search
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06] xl:text-6xl">
                Find roles that fit your experience.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl xl:text-[1.35rem] xl:leading-relaxed">
                Run a scan with your resume on file. Results rank by fit — up to{' '}
                {FREE_DAILY_QUERY_LIMIT} searches per day on a free account.
              </p>
              {profile ? (
                <p className="mt-5 text-base text-muted-foreground lg:text-lg">
                  <span className="tabular-nums">
                    Today: {dailyUsage.queries_today}/{dailyUsage.limit} searches
                  </span>
                </p>
              ) : null}
            </header>

            <div className="surface w-full rounded-lg p-6 sm:p-8 lg:p-10 xl:p-12">
              {profile ? (
                <AppSearchForm profile={profile} resumeFilename={resume?.original_filename} error={error} />
              ) : (
                <InitialSearchSetup />
              )}
            </div>
          </div>
        )}
      </div>

      <PastRunsRegistrar runs={pastRuns} />
    </div>
  );
}

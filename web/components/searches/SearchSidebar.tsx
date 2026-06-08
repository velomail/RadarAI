import Link from 'next/link';

import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';

import type { UserPlan } from '@/lib/plan';

import type { Resume, SearchProfile } from '@/lib/types';



type Props = {

  profile: SearchProfile | null;

  resume: Resume | null;

  dailyUsage: { queries_today: number; limit: number; plan: UserPlan };

};



export function SearchSidebar({ profile, resume, dailyUsage }: Props) {

  if (!profile) {

    return (

      <div className="px-5 py-5">

        <p className="text-sm leading-relaxed text-muted-foreground">

          Upload your resume in the search panel to enable resume-aware results.

        </p>

      </div>

    );

  }



  return (

    <div className="flex flex-col gap-6 px-5 py-5">

      <div className="space-y-2">

        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

          Resume on file

        </p>

        <p className="truncate text-sm font-medium">

          {resume?.original_filename ?? 'No resume uploaded'}

        </p>

        <Link

          href="/dashboard/settings/search"

          className="text-xs text-muted-foreground hover:text-foreground"

        >

          Update resume &amp; defaults →

        </Link>

      </div>



      <DailyUsageMeter

        queriesToday={dailyUsage.queries_today}

        limit={dailyUsage.limit}

        plan={dailyUsage.plan}

        compact

      />

    </div>

  );

}


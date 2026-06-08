import type { ReactNode } from 'react';
import { AppSidebarFooter } from '@/components/layout/AppSidebarFooter';
import { RecentSearchesInline } from '@/components/layout/RecentSearchesInline';

type Props = {
  children: ReactNode;
};

/** Matches AppHeader height so sidebar content aligns with the main panel below the header row. */
function AppAsideHeaderOffset() {
  return <div className="hidden h-14 shrink-0 border-b border-border md:block lg:h-16" aria-hidden />;
}

export function AppAsideShell({ children }: Props) {
  return (
    <aside className="hidden h-full min-h-0 w-[240px] shrink-0 flex-col border-r border-border bg-background md:flex xl:w-[260px]">
      <AppAsideHeaderOffset />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <RecentSearchesInline />
      <AppSidebarFooter />
    </aside>
  );
}

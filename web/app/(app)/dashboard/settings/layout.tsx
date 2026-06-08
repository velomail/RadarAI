import { AppAsideShell } from '@/components/layout/AppAsideShell';
import { PastRunsRegistrar } from '@/components/layout/AppNavContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { SettingsNav } from '@/components/layout/SettingsNav';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import type { Run } from '@/lib/types';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pastRuns: Run[] = [];
  if (user) {
    const sb = supabaseServiceRole();
    const { data: runs } = await sb
      .from('runs')
      .select('id, status, started_at, reported_count, banner_label, trigger')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(8);
    pastRuns = ((runs as Run[]) ?? []).filter(
      (r) => r.status === 'success' || r.status === 'error',
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1">
      <PastRunsRegistrar runs={pastRuns} />
      <AppAsideShell>
        <SettingsNav />
      </AppAsideShell>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background md:bg-muted/25">
        <AppHeader title="Settings" email={user?.email} />

        <div className="border-b border-border bg-background md:hidden">
          <SettingsNav variant="horizontal" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-mobile-nav md:pb-0">
          <div className="workspace-settings">{children}</div>
        </div>
      </div>
    </div>
  );
}

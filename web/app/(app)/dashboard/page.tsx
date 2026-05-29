import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarSearch, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DailyUsageMeter } from '@/components/dashboard/DailyUsageMeter';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import type { Run } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();

  const { count: profileCount } = await sb
    .from('search_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: runs } = await sb
    .from('runs')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(30);

  const allRuns = (runs as Run[]) ?? [];
  const dailyUsage = await getDailyUsage(user.id);
  const hasProfiles = (profileCount ?? 0) > 0;

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-8 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName(user.email)}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review past results or run a new search from the Searches tab.
              </p>
            </div>
            <Link
              href={hasProfiles ? '/dashboard/searches' : '/onboarding'}
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
            >
              {hasProfiles ? 'Run search' : 'Set up first search'}
            </Link>
          </div>
          <DailyUsageMeter
            queriesToday={dailyUsage.queries_today}
            limit={dailyUsage.limit}
            plan={dailyUsage.plan}
          />
        </div>

        <div className="glass rounded-2xl p-8">
          <p className="text-base font-semibold">Quick links</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/dashboard/searches" className="font-medium text-primary hover:underline">
              Your search →
            </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" className="text-muted-foreground hover:text-foreground">
                Account settings
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="glass rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="font-semibold">RadarAI Pro</p>
              <Badge variant="muted">Coming Soon</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlimited searches, scheduled scans, priority AI processing, and advanced filters.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground opacity-80"
          >
            Notify me
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-semibold tracking-tight">Search history</h2>
        {!hasProfiles ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Set up your first search to start finding matches.</p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              Get started
            </Link>
          </div>
        ) : allRuns.length ? (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white/75 backdrop-blur-sm">
            {allRuns.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No runs yet. Go to{' '}
            <Link href="/dashboard/searches" className="font-medium text-primary hover:underline">
              Searches
            </Link>{' '}
            and click <strong className="text-foreground">Search jobs</strong>.
          </div>
        )}
      </section>
    </div>
  );
}

function firstName(email?: string | null) {
  if (!email) return 'there';
  const local = email.split('@')[0] || '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'there';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function statusBadgeVariant(status: Run['status']) {
  if (status === 'success') return 'success' as const;
  if (status === 'error') return 'fresh' as const;
  return 'muted' as const;
}

function RunRow({ run }: { run: Run }) {
  const date = new Date(run.started_at);
  const href = run.search_profile_id
    ? `/dashboard/searches?run=${run.id}`
    : `/dashboard/runs/${run.id}`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4 transition-colors hover:bg-muted/35 last:border-b-0"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-[hsl(var(--primary)/0.10)]">
          <CalendarSearch className="h-4 w-4 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">
            {date.toLocaleDateString()} ·{' '}
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {run.trigger === 'manual' ? 'Manual search' : 'Scheduled'} ·{' '}
            {run.banner_label ||
              `Quality matches, top ${Math.max(1, run.reported_count)} of ${Math.max(run.scanned_count, run.reported_count)} scanned`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <Badge
          variant={statusBadgeVariant(run.status)}
          className={
            run.status === 'success'
              ? 'rounded-full border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700'
              : 'rounded-full px-3 py-1 text-xs'
          }
        >
          {run.status}
        </Badge>
        <span className="text-sm font-medium tabular-nums">{run.reported_count} matches</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

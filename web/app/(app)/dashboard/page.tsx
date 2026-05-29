import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, CalendarSearch, ChevronRight, MapPin, Search, Sparkles, User2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RunNowButton } from '@/components/dashboard/RunNowButton';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { getDailyUsage } from '@/lib/usage/consume-daily-query';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import type { Run, SearchProfile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();

  const { data: profiles } = await sb
    .from('search_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (!profiles?.length) redirect('/onboarding');

  const { data: runs } = await sb
    .from('runs')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(30);

  const allProfiles = (profiles as SearchProfile[]) ?? [];
  const visibleProfiles = [...allProfiles]
    .sort((a, b) => {
      const aTs = new Date(a.last_run_at || a.updated_at || a.created_at).getTime();
      const bTs = new Date(b.last_run_at || b.updated_at || b.created_at).getTime();
      return bTs - aTs;
    })
    .slice(0, 3);

  const allRuns = (runs as Run[]) ?? [];
  const dailyUsage = await getDailyUsage(user.id);
  const dailySearches = dailyUsage.queries_today;
  const dailyCap = dailyUsage.plan === 'pro' ? dailyUsage.limit : FREE_DAILY_QUERY_LIMIT;
  const dailyPct =
    dailyUsage.plan === 'pro'
      ? 0
      : Math.min(100, Math.round((dailySearches / dailyCap) * 100));
  const memberSince = new Date(user.created_at || Date.now()).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName(user.email)}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Run a scan anytime. Results are saved so you can review matches and apply links later.
              </p>
            </div>
            <Link
              href={visibleProfiles[0] ? `/dashboard/profiles/${visibleProfiles[0].id}` : '/onboarding'}
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
            >
              New search
            </Link>
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Today&apos;s searches:{' '}
                <span className="font-semibold text-foreground">
                  {dailyUsage.plan === 'pro' ? 'Unlimited' : `${dailySearches}/${dailyCap}`}
                </span>
                {dailyUsage.plan === 'free' ? (
                  <span className="text-muted-foreground"> (resets midnight UTC)</span>
                ) : null}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${dailyUsage.plan === 'pro' ? 0 : dailyPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/10 p-2">
              <User2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold">Your Account</p>
              <p className="text-xs text-muted-foreground">Free plan</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="max-w-[170px] truncate font-medium">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="font-medium">{memberSince}</dd>
                </div>
              </dl>
              <Link
                href="/dashboard/settings"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium hover:text-primary"
              >
                Manage account
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
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

      <section className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full glass-subtle px-4 py-2">
          <Search className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">Your account searches</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Searches</h2>
        <div className="flex flex-col gap-3">
          {visibleProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Search History</h2>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-white/75 backdrop-blur-sm">
          {allRuns.length ? (
            allRuns.map((run) => <RunRow key={run.id} run={run} />)
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No runs yet. Click <strong className="text-foreground">Run search</strong> on a saved
              profile above.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProfileCard({ profile }: { profile: SearchProfile }) {
  return (
    <div className="glass overflow-hidden rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{profile.name}</h3>
        <Badge variant="muted" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">On-demand</Badge>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Job title or keywords</p>
        <div className="h-12 rounded-xl border border-white/40 bg-white/80 px-4 text-sm text-muted-foreground backdrop-blur-sm flex items-center">
          {profile.queries.slice(0, 4).join(', ')}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium">Location</p>
        <div className="h-12 rounded-xl border border-white/40 bg-white/80 px-4 text-sm text-muted-foreground backdrop-blur-sm flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {profile.location}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <RunNowButton profileId={profile.id} fullWidth label="Search jobs" />
      </div>
      <div className="mt-3 text-center">
        <Link href={`/dashboard/profiles/${profile.id}`} className="text-sm font-medium text-primary hover:underline">
          Edit search settings
        </Link>
      </div>
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
  return (
    <Link
      href={`/dashboard/runs/${run.id}`}
      className="flex items-center justify-between gap-4 border-b border-border/50 px-4 py-2.5 transition-colors hover:bg-muted/35 last:border-b-0"
    >
      <div className="min-w-0 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-[hsl(var(--primary)/0.10)]">
          <CalendarSearch className="h-3.5 w-3.5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight">
            {date.toLocaleDateString()} ·{' '}
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            {run.trigger === 'manual' ? 'Manual search' : 'Scheduled'} ·{' '}
            {run.banner_label || `Quality matches, top ${Math.max(1, run.reported_count)} of ${Math.max(run.scanned_count, run.reported_count)} scanned`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge
          variant={statusBadgeVariant(run.status)}
          className={
            run.status === 'success'
              ? 'rounded-full border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700'
              : 'rounded-full px-2.5 py-0.5 text-[11px]'
          }
        >
          {run.status}
        </Badge>
        <span className="text-[13px] font-medium tabular-nums">{run.reported_count} matches</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect';
import { GuestRunPoller } from '@/components/guest/GuestRunPoller';
import { GuestSearchForm } from '@/components/guest/GuestSearchForm';
import { GuestSignUpPrompt } from '@/components/guest/GuestSignUpPrompt';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getGuestSessionId } from '@/lib/guest/session';
import { TRY_PAGE } from '@/lib/constants';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ run?: string; error?: string }>;
}

export default async function TryPage({ searchParams }: PageProps) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard/searches');

  const sp = await searchParams;
  const { run: runId, error } = sp;
  const sessionId = await getGuestSessionId();

  if (runId) {
    if (!sessionId) redirect(TRY_PAGE);
    const sb = supabaseServiceRole();
    const { data: run } = await sb
      .from('runs')
      .select('anonymous_session')
      .eq('id', runId)
      .maybeSingle();
    if (!run || run.anonymous_session !== sessionId) {
      redirect(TRY_PAGE);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <AuthHashRedirect />
      <MarketingHeader showCta={false} />

      <div
        className="app-panel-fill flex-1"
        style={{ paddingTop: 'calc(4rem + 1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="workspace-center w-full">
          {runId ? (
            <div className="content-well-wide flex w-full flex-col gap-10 lg:gap-12">
              <header className="text-center">
                <Link
                  href={TRY_PAGE}
                  className="text-base font-medium text-muted-foreground hover:text-foreground lg:text-lg"
                >
                  ← New preview search
                </Link>
                <p className="mt-6 text-base font-medium text-muted-foreground lg:text-lg">
                  Resume-aware preview
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Your best match
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg xl:text-xl">
                  One top role ranked against your resume. Create a free account for{' '}
                  {FREE_DAILY_QUERY_LIMIT} searches per day and full lists.
                </p>
              </header>
              <GuestRunPoller runId={runId} />
              <GuestSignUpPrompt />
            </div>
          ) : (
            <div className="content-well flex w-full flex-col items-center gap-10 lg:gap-12">
              <header className="w-full text-center">
                <p className="text-base font-medium text-muted-foreground lg:text-lg">
                  Try resume-aware search
                </p>
                <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06] xl:text-6xl">
                  See your best match — no account required.
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl xl:text-[1.35rem] xl:leading-relaxed">
                  Upload your resume, run one preview search, then create a free account for{' '}
                  {FREE_DAILY_QUERY_LIMIT} searches per day and full ranked results.
                </p>
              </header>

              <div className="surface w-full rounded-lg p-6 sm:p-8 lg:p-10 xl:p-12">
                {error === 'daily_limit' ? (
                  <p className="text-base leading-relaxed text-foreground lg:text-lg xl:text-xl">
                    You&apos;ve used your free preview for today. Resets at midnight UTC.
                  </p>
                ) : error === 'rate_limited' ? (
                  <p className="text-base leading-relaxed text-foreground lg:text-lg xl:text-xl">
                    Too many attempts from your network. Please wait an hour and try again.
                  </p>
                ) : (
                  <GuestSearchForm error={error ?? null} />
                )}
              </div>

              <GuestSignUpPrompt />
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

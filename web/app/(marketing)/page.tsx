import Link from 'next/link';
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { APP_NAME } from '@/lib/brand';
import { TRY_PAGE } from '@/lib/constants';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    n: '01',
    label: 'Upload resume',
    body: 'Add your PDF once. We read it to understand your experience and target roles.',
  },
  {
    n: '02',
    label: 'Set your search',
    body: 'Choose focus, keywords, and location. Run a scan whenever you are actively looking.',
  },
  {
    n: '03',
    label: 'Review matches',
    body: 'Get ranked listings with plain-English summaries and honest fit comparisons.',
  },
] as const;

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <AuthHashRedirect />
      <MarketingHeader />

      <div
        className="flex flex-1 flex-col justify-center py-10 sm:py-12 lg:py-16"
        style={{ paddingTop: 'calc(4rem + 2rem + env(safe-area-inset-top, 0px))' }}
      >
        <section className="page-container content-well-wide">
          <p className="text-base font-medium text-muted-foreground lg:text-lg">
            Resume-aware job search
          </p>
          <h1 className="mt-4 max-w-5xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:mt-5 lg:text-7xl xl:text-[5rem]">
            Find roles that fit your experience.
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mt-6 lg:text-xl lg:leading-relaxed">
            {APP_NAME} ranks listings against your resume — with role summaries and honest fit
            comparisons for every match.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-10">
            <Link href={TRY_PAGE}>
              <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto">
                Get started
              </Button>
            </Link>
            <Link
              href="/sign-in"
              className="text-center text-base font-medium text-muted-foreground hover:text-foreground sm:px-3 sm:text-left"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mt-14 border-t border-border lg:mt-16">
          <div className="page-container py-12 lg:py-14">
            <div className="grid gap-12 sm:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-border">
              {STEPS.map((step) => (
                <div key={step.n} className="lg:px-10 lg:first:pl-0 lg:last:pr-0 xl:px-12">
                  <p className="text-sm font-medium tabular-nums text-muted-foreground lg:text-base">
                    {step.n}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight lg:text-2xl">
                    {step.label}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg lg:leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="page-container flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between lg:py-14">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Ready when you are.</h2>
              <p className="mt-3 text-base text-muted-foreground lg:text-lg">
                {FREE_DAILY_QUERY_LIMIT} searches per day on the free plan. No subscription required
              to start.
              </p>
            </div>
            <Link href="/sign-up" className="shrink-0">
              <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto">
                Create free account
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

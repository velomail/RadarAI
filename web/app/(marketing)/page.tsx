import Link from 'next/link';
import { ArrowRight, FileText, Users, Zap } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { DataTrustNotice } from '@/components/trust/DataTrustNotice';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { APP_NAME } from '@/lib/brand';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="gradient-mesh min-h-screen flex flex-col">
      <AuthHashRedirect />
      <MarketingHeader />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float-delayed absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 text-center">
        <div className="glass-subtle mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            On-demand · Multi-source search · Resume-aware AI
          </span>
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find roles that fit your experience — when you&apos;re ready to search
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {APP_NAME} is a resume-aware job search utility with plain-English role summaries and
          honest experience comparison for every match.
        </p>
        <div className="mb-6 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/demo">
            <Button size="lg" className="group h-12 rounded-xl px-8 text-base">
              Try free demo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" variant="outline" className="glass h-12 rounded-xl px-8 text-base">
              Create free account
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          1 free guest search · 3 searches per day on a free account. Pro digests — coming soon.
        </p>
      </section>

      <section className="relative mx-auto w-full max-w-2xl px-6 pb-12">
        <DataTrustNotice />
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={FileText}
            title="Role summary"
            body="Each listing starts with a clear description of what you'd actually do — not just a raw job board dump."
          />
          <FeatureCard
            icon={Users}
            title="Experience comparison"
            body="See how your resume maps to the posting: strengths called out honestly, gaps flagged before you apply."
          />
          <FeatureCard
            icon={Zap}
            title="Search when you want"
            body="No background cron on the free tier — run a scan from your dashboard whenever you're actively looking. Scheduled email newsletters are Pro (coming soon)."
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}) {
  return (
    <div className="glass group rounded-2xl p-6 transition-all duration-300 hover:bg-card/80">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { APP_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses, and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <main className="gradient-mesh flex min-h-screen flex-col">
      <MarketingHeader />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float-delayed absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <article className="glass relative mx-auto mt-28 w-full max-w-3xl rounded-2xl px-6 py-12 md:py-16">
        <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          {APP_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps job seekers find and evaluate roles using
          resume-aware search. This policy describes what we collect and how we use it.
        </p>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Information we collect</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Account:</strong> email address when you sign up or
              request a magic link.
            </li>
            <li>
              <strong className="text-foreground">Resume:</strong> PDF uploads and extracted text used
              to score job matches.
            </li>
            <li>
              <strong className="text-foreground">Search preferences:</strong> keywords, location,
              industry focus, and notification settings you configure.
            </li>
            <li>
              <strong className="text-foreground">Usage data:</strong> run history, match results, and
              standard server logs (IP, browser type, timestamps).
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">How we use your information</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Fetch and rank job listings against your resume and criteria.</li>
            <li>Generate role summaries and experience comparisons for each match.</li>
            <li>Send optional email notifications when a search completes (if you opt in).</li>
            <li>Operate, secure, and improve the service.</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We do <strong className="text-foreground">not</strong> sell your resume or personal data to
            third parties.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Service providers</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We use trusted infrastructure partners to run {APP_NAME}:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong> — database, authentication, and
              private file storage for resumes.
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — transactional email (sign-in links
              and optional run notifications).
            </li>
            <li>
              <strong className="text-foreground">OpenAI</strong> — AI scoring and summaries when live
              engine mode is enabled (not used in demo/mock mode).
            </li>
            <li>
              <strong className="text-foreground">Adzuna</strong> — job source API used to fetch
              listings in live engine mode.
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — application hosting.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Demo mode</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The public demo at <Link href="/demo" className="text-primary hover:underline">/demo</Link>{' '}
            lets you run a search without an account. Demo resume uploads are stored temporarily and
            auto-deleted within 24 hours. Demo runs use representative fixture data when the app is in
            mock engine mode.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Retention &amp; deletion</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Demo uploads: deleted within 24 hours.</li>
            <li>Account data: kept while your account is active.</li>
            <li>
              You may delete your data from <strong className="text-foreground">Settings</strong> in
              your dashboard at any time.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Resumes are stored in private storage buckets with row-level security on account data.
            API keys and secrets are kept server-side and never exposed to the browser.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Changes</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We may update this policy as the product evolves. Material changes will be reflected on
            this page with an updated date.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Questions about privacy or data deletion? Use in-app Settings or contact the operator of
            this {APP_NAME} deployment.
          </p>
        </section>

        <p className="mt-12 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          This policy is provided for transparency during MVP and investor demos. It is not legal
          advice. Consult counsel before a commercial launch in regulated markets.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}

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
    <main className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <article
        className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20"
        style={{ paddingTop: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          {APP_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps job seekers find and evaluate roles using
          resume-aware search. This policy describes what we collect and how we use it.
        </p>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Information we collect</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Account:</strong> email and profile from Google or
              GitHub when you sign in (we do not use password or magic-link email sign-in).
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
              <strong className="text-foreground">Google / GitHub</strong> — OAuth sign-in (authentication
              only; we receive email and basic profile from the provider you choose).
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — optional run notification emails
              (not used for sign-in).
            </li>
            <li>
              <strong className="text-foreground">OpenAI</strong> — AI scoring and summaries when live
              engine mode is enabled (not used in demo/mock mode).
            </li>
            <li>
              <strong className="text-foreground">Job listing provider</strong> — API used to fetch
              listings in live engine mode.
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — application hosting.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Retention &amp; deletion</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
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
          This policy is provided for transparency during MVP. It is not legal
          advice. Consult counsel before a commercial launch in regulated markets.
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}

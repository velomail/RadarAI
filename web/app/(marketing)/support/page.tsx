import Link from 'next/link';
import { ArrowLeft, FileQuestion, MessageSquare } from 'lucide-react';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FAQ_ITEMS = [
  {
    question: 'How does RadarAI match me with jobs?',
    answer:
      'RadarAI uses AI to analyze your resume and compare it against listings to calculate a match score and identify strengths and gaps.',
  },
  {
    question: 'Is my resume data safe?',
    answer:
      'Yes. Your resume is stored in private cloud storage. You can delete your account and data from Settings.',
  },
  {
    question: "What's the difference between free and Pro?",
    answer:
      'Free lets you run searches on-demand. Pro (coming soon) adds scheduled email digests.',
  },
  {
    question: 'Which job boards do you search?',
    answer:
      'RadarAI aggregates listings from multiple sources and continuously refreshes coverage.',
  },
];

export default function SupportPage() {
  return (
    <main className="gradient-mesh min-h-screen">
      <MarketingHeader />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float-delayed absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How can we help?</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="glass rounded-2xl p-5">
                  <h3 className="mb-2 font-medium">{item.question}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Send us a message</h2>
            </div>

            <form className="glass rounded-2xl p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="support-email">Your email</Label>
                <Input id="support-email" type="email" placeholder="you@example.com" className="h-12 rounded-xl border-white/40 bg-white/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" type="text" placeholder="What's this about?" className="h-12 rounded-xl border-white/40 bg-white/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <textarea
                  id="support-message"
                  placeholder="Tell us how we can help..."
                  className="min-h-32 w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="button" className="h-12 w-full rounded-xl text-base">
                Send message
              </Button>
            </form>

            <div className="glass-subtle mt-6 rounded-2xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Prefer email? Reach us at{' '}
                <a href="mailto:support@radarai.com" className="font-medium text-primary hover:underline">
                  support@radarai.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

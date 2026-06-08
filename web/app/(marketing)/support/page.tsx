import Link from 'next/link';
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
    question: 'How many searches can I run?',
    answer:
      'Guests get 1 preview search per day. Free accounts include 5 AI-powered searches per day, resetting at midnight UTC.',
  },
  {
    question: 'Where do job listings come from?',
    answer:
      'RadarAI fetches live job listings from partner job board APIs and scores them against your resume.',
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background">
      <MarketingHeader />

      <section
        className="mx-auto max-w-4xl px-5 pb-16 pt-28 sm:px-8"
        style={{ paddingTop: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight md:text-4xl">Support</h1>
        <p className="mt-3 text-muted-foreground">
          Answers to common questions and a way to reach us.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-lg font-semibold">FAQ</h2>
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="border-b border-border pb-6">
                <h3 className="font-medium">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Contact</h2>
            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support-email">Your email</Label>
                <Input id="support-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" type="text" placeholder="What's this about?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <textarea
                  id="support-message"
                  placeholder="Tell us how we can help..."
                  className="min-h-32 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="button" className="w-full">
                Send message
              </Button>
            </form>
            <p className="mt-6 text-sm text-muted-foreground">
              Or email{' '}
              <a href="mailto:support@radarai.com" className="text-foreground underline">
                support@radarai.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

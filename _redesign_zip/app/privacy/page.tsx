import Link from "next/link"
import { Radar, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-colors" />
                <Radar className="relative h-7 w-7 text-primary" />
              </div>
              <span className="font-semibold text-lg tracking-tight">RadarAI</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <article className="glass rounded-2xl p-8 md:p-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  RadarAI is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our job search platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">Information We Collect</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-medium">1.</span>
                    <span><strong className="text-foreground">Account information:</strong> Email address and password when you create an account.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-medium">2.</span>
                    <span><strong className="text-foreground">Resume data:</strong> The resume you upload for job matching. This is stored securely and used only to improve your search results.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-medium">3.</span>
                    <span><strong className="text-foreground">Search history:</strong> Job searches you perform to personalize recommendations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-medium">4.</span>
                    <span><strong className="text-foreground">Usage data:</strong> Anonymous analytics to improve our service.</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">How We Use Your Data</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>To provide AI-powered job recommendations based on your experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>To generate role summaries and experience comparisons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>To improve our matching algorithms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>To send you email digests (Pro feature, opt-in only)</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We take security seriously:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>All data is encrypted in transit and at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Resumes are stored securely and never sold to third parties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Demo data is automatically deleted within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>You can delete your account and all associated data at any time</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:privacy@radarai.com" className="text-primary hover:underline">privacy@radarai.com</a> for any data-related requests.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold tracking-tight mb-4">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about this privacy policy, please reach out to <a href="mailto:support@radarai.com" className="text-primary hover:underline">support@radarai.com</a>.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              <span className="font-medium">RadarAI</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Link href="/privacy" className="text-primary font-medium">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

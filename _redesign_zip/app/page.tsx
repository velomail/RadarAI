import Link from "next/link"
import { Shield, FileText, Users, Zap, ArrowRight, Radar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingHeader } from "@/components/marketing-header"

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="glass rounded-2xl p-6 group hover:bg-card/80 transition-all duration-300">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function TrustNotice() {
  return (
    <div className="glass-subtle rounded-2xl p-6 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Shield className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium mb-1">Your data stays private</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Resumes are stored securely and never sold. Demo data is automatically deleted within 24 hours. 
          We only use your information to find better matches.
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
      
      <MarketingHeader />
      
      <main className="relative pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 text-center">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-2 mb-8">
            <span className="text-xs font-medium text-muted-foreground tracking-wide">
              On-demand · Multi-source search · Resume-aware AI
            </span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-4xl mx-auto mb-6">
            Find roles that fit your experience — when you&apos;re ready to search
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
            Upload your resume and get AI-powered role summaries with honest experience comparisons. 
            Search across job boards on your schedule, not ours.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="rounded-xl text-base px-8 h-12 group" asChild>
              <Link href="/demo">
                Try free demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl text-base px-8 h-12 glass border-glass-border hover:bg-card/80" asChild>
              <Link href="/sign-up">Create free account</Link>
            </Button>
          </div>
          
          {/* Footnote */}
          <p className="text-sm text-muted-foreground">
            No subscription required to search. Scheduled email digests — <span className="text-primary font-medium">Pro (coming soon)</span>
          </p>
        </section>
        
        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={FileText}
              title="Role summaries"
              description="Get plain-English breakdowns of what each role actually involves, so you can quickly decide if it's worth pursuing."
            />
            <FeatureCard 
              icon={Users}
              title="Experience comparison"
              description="See how your background stacks up against each listing — strengths, gaps, and talking points for your application."
            />
            <FeatureCard 
              icon={Zap}
              title="Search when you want"
              description="No daily email spam. Run searches when you're actively looking, and get results in under a minute."
            />
          </div>
        </section>
        
        {/* Trust Section */}
        <section className="max-w-2xl mx-auto px-6 mt-16">
          <TrustNotice />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              <span className="font-medium">RadarAI</span>
              <span className="text-muted-foreground text-sm">— AI job search on demand</span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
                Try demo
              </Link>
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

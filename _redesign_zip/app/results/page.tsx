"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Radar, Search, ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard, type JobCardProps } from "@/components/job-card"

// Demo job data
const DEMO_JOBS: JobCardProps[] = [
  {
    id: "1",
    title: "Senior Product Designer",
    company: "Acme Inc",
    location: "San Francisco, CA",
    salary: "$140k - $180k",
    postedAt: "2 days ago",
    type: "Full-time",
    summary: "Lead design for a B2B SaaS platform serving enterprise customers. You'll work closely with product and engineering to ship features that help businesses manage their operations more efficiently.",
    matchScore: 87,
    strengths: [
      "Strong portfolio in B2B SaaS",
      "Experience with design systems",
      "Cross-functional collaboration"
    ],
    gaps: [
      "Enterprise customer research experience"
    ],
    applyUrl: "#"
  },
  {
    id: "2",
    title: "Product Designer",
    company: "TechFlow",
    location: "Remote (US)",
    salary: "$120k - $150k",
    postedAt: "1 week ago",
    type: "Full-time",
    summary: "Join a growing startup building developer tools. You'll own the entire design process from research to implementation, working on both web and CLI experiences.",
    matchScore: 72,
    strengths: [
      "End-to-end design experience",
      "Startup environment familiarity"
    ],
    gaps: [
      "Developer tooling experience",
      "CLI design patterns"
    ],
    applyUrl: "#"
  },
  {
    id: "3",
    title: "Staff Designer, Growth",
    company: "ScaleUp",
    location: "New York, NY",
    salary: "$160k - $200k",
    postedAt: "3 days ago",
    type: "Full-time",
    summary: "Drive user acquisition and activation through data-informed design decisions. Partner with marketing and analytics to optimize conversion funnels and onboarding flows.",
    matchScore: 45,
    strengths: [
      "Visual design skills"
    ],
    gaps: [
      "Growth/experimentation focus",
      "A/B testing experience",
      "Analytics-driven design"
    ],
    applyUrl: "#"
  },
  {
    id: "4",
    title: "UX Designer",
    company: "HealthTech Co",
    location: "Boston, MA (Hybrid)",
    salary: "$100k - $130k",
    postedAt: "5 days ago",
    type: "Full-time",
    summary: "Design patient-facing applications for a healthcare technology company. Focus on accessibility, compliance, and creating experiences that work for diverse user populations.",
    matchScore: 68,
    strengths: [
      "User research background",
      "Accessibility awareness"
    ],
    gaps: [
      "Healthcare industry experience",
      "HIPAA compliance knowledge"
    ],
    applyUrl: "#"
  }
]

function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || "Product Designer"
  const location = searchParams.get("location") || "All locations"
  const isDemo = searchParams.get("demo") === "true"

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
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-xl" asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link and search info */}
          <div className="mb-8">
            <Link 
              href="/demo" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              New search
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {query}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {location} — {DEMO_JOBS.length} results
                </p>
              </div>
              
              <Button variant="outline" size="sm" className="glass border-glass-border rounded-xl self-start">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Demo notice */}
          {isDemo && (
            <div className="glass-subtle rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Demo results</p>
                <p className="text-sm text-muted-foreground">
                  These are sample results to show how RadarAI works. <Link href="/sign-up" className="text-primary font-medium hover:underline">Create a free account</Link> to search real listings.
                </p>
              </div>
            </div>
          )}

          {/* Job listings */}
          <div className="space-y-4">
            {DEMO_JOBS.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>

          {/* Load more */}
          <div className="mt-8 text-center">
            <Button variant="outline" className="glass border-glass-border rounded-xl">
              Load more results
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading results...</span>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}

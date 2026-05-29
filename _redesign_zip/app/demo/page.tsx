"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Radar, Upload, Search, FileText, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DemoPage() {
  const router = useRouter()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Navigate to results with query params
    const params = new URLSearchParams({
      q: jobTitle,
      location: location,
      demo: "true"
    })
    router.push(`/results?${params.toString()}`)
  }

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

      <main className="relative pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          {/* Page header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-2 mb-6">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide">
                Free demo — no account required
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Try RadarAI
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Upload your resume and search for roles. Get AI-powered summaries and experience comparisons in under a minute.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-sm font-medium">
                Resume (optional)
              </Label>
              
              {!resumeFile ? (
                <label
                  htmlFor="resume"
                  className="glass rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-card/80 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium mb-1">Drop your resume here</span>
                  <span className="text-sm text-muted-foreground">PDF, DOC, or DOCX up to 5MB</span>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="glass rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Job title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm font-medium">
                Job title or keywords
              </Label>
              <Input
                id="jobTitle"
                type="text"
                placeholder="e.g. Product Designer, Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-12 rounded-xl bg-white/80 backdrop-blur-sm border-glass-border focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g. San Francisco, Remote, New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 rounded-xl bg-white/80 backdrop-blur-sm border-glass-border focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-xl h-12 text-base group"
              disabled={isLoading || !jobTitle}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  Search jobs
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Demo notice */}
          <div className="mt-8 glass-subtle rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Demo searches return sample results. <Link href="/sign-up" className="text-primary font-medium hover:underline">Create a free account</Link> to search real job listings.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

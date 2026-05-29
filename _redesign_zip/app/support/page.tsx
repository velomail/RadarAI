"use client"

import { useState } from "react"
import Link from "next/link"
import { Radar, ArrowLeft, Mail, MessageSquare, FileQuestion, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const FAQ_ITEMS = [
  {
    question: "How does RadarAI match me with jobs?",
    answer: "RadarAI uses AI to analyze your resume and compare it against job listings. We look at skills, experience level, industry, and job requirements to calculate a match score and identify your strengths and gaps for each role."
  },
  {
    question: "Is my resume data safe?",
    answer: "Yes. Your resume is encrypted and stored securely. We never sell your data to third parties. Demo users' data is automatically deleted within 24 hours. Account holders can delete their data at any time."
  },
  {
    question: "What's the difference between free and Pro?",
    answer: "The free tier lets you search jobs on-demand whenever you want. Pro (coming soon) adds scheduled email digests that automatically send you new matching jobs on your preferred schedule."
  },
  {
    question: "Which job boards do you search?",
    answer: "RadarAI aggregates listings from multiple job boards and company career pages. We're constantly adding new sources to give you the widest possible coverage."
  }
]

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
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

      <main className="relative py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How can we help?
            </h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions or get in touch with our team
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* FAQ Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileQuestion className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Frequently asked questions
                </h2>
              </div>

              <div className="space-y-4">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={index} className="glass rounded-2xl p-5">
                    <h3 className="font-medium mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Send us a message
                </h2>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Your email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 pl-11 rounded-xl bg-white/80 backdrop-blur-sm border-glass-border focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-12 rounded-xl bg-white/80 backdrop-blur-sm border-glass-border focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-32 rounded-xl bg-white/80 backdrop-blur-sm border-glass-border focus:ring-2 focus:ring-primary/20 resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl h-12 text-base group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send message
                        <Send className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="glass rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-2">
                    Message sent
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We&apos;ll get back to you within 24 hours at <span className="font-medium text-foreground">{formData.email}</span>
                  </p>
                  <Button 
                    variant="outline" 
                    className="rounded-xl glass border-glass-border"
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormData({ email: "", subject: "", message: "" })
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              )}

              {/* Direct email */}
              <div className="mt-6 glass-subtle rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Prefer email? Reach us at{" "}
                  <a href="mailto:support@radarai.com" className="text-primary font-medium hover:underline">
                    support@radarai.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              <span className="font-medium">RadarAI</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/support" className="text-primary font-medium">
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

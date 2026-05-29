"use client"

import Link from "next/link"
import { Radar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MarketingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
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
        </nav>
      </div>
    </header>
  )
}

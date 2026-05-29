import { 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ExternalLink,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  postedAt: string
  type: string
  summary: string
  matchScore: number
  strengths: string[]
  gaps: string[]
  applyUrl: string
}

function MatchIndicator({ score }: { score: number }) {
  let icon = Minus
  let label = "Moderate match"
  let colorClass = "text-muted-foreground bg-muted"
  
  if (score >= 80) {
    icon = TrendingUp
    label = "Strong match"
    colorClass = "text-emerald-600 bg-emerald-50"
  } else if (score < 50) {
    icon = TrendingDown
    label = "Stretch role"
    colorClass = "text-amber-600 bg-amber-50"
  }
  
  const Icon = icon
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="opacity-60">({score}%)</span>
    </div>
  )
}

export function JobCard({
  title,
  company,
  location,
  salary,
  postedAt,
  type,
  summary,
  matchScore,
  strengths,
  gaps,
  applyUrl
}: JobCardProps) {
  return (
    <article className="glass rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg tracking-tight mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{company}</span>
          </div>
        </div>
        <MatchIndicator score={matchScore} />
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            <span>{salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4" />
          <span>{type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{postedAt}</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </div>

      {/* Experience comparison */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
              Your strengths
            </h4>
            <ul className="space-y-1">
              {strengths.map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">+</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Gaps */}
        {gaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-amber-600 uppercase tracking-wide">
              Areas to address
            </h4>
            <ul className="space-y-1">
              {gaps.map((gap, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-1">-</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
        <Button 
          size="sm" 
          className="rounded-xl group/btn"
          asChild
        >
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">
            Apply now
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </Button>
      </div>
    </article>
  )
}

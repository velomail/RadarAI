import { Building2, Clock, DollarSign, ExternalLink, MapPin, Minus, TrendingDown, TrendingUp, Briefcase } from 'lucide-react';
import { ProLockedSection } from '@/components/jobs/ProLockedSection';
import { Button } from '@/components/ui/button';
import type { UserPlan } from '@/lib/plan';

export interface JobCardReplicaProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedAt: string;
  type: string;
  summary: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  applyUrl?: string;
  tier?: UserPlan;
}

function MatchIndicator({ score }: { score: number }) {
  let Icon = Minus;
  let label = 'Moderate match';
  let colorClass = 'text-muted-foreground bg-muted';

  if (score >= 80) {
    Icon = TrendingUp;
    label = 'Strong match';
    colorClass = 'text-emerald-600 bg-emerald-50';
  } else if (score < 50) {
    Icon = TrendingDown;
    label = 'Stretch role';
    colorClass = 'text-amber-600 bg-amber-50';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="opacity-60">({score}%)</span>
    </div>
  );
}

export function JobCardReplica({
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
  applyUrl,
  tier = 'free',
}: JobCardReplicaProps) {
  const hasApplyUrl = Boolean(applyUrl);
  const hasInsights = Boolean(summary) || strengths.length > 0 || gaps.length > 0;

  return (
    <article className="glass group rounded-2xl p-6 transition-all duration-300 hover:bg-card/80">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{company}</span>
          </div>
        </div>
        <MatchIndicator score={matchScore} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {salary ? (
          <ProLockedSection tier={tier} title="Salary — Pro" className="inline-flex">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
          </ProLockedSection>
        ) : null}
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4" />
          <span>{type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{postedAt}</span>
        </div>
      </div>

      {hasInsights || tier === 'free' ? (
        <ProLockedSection tier={tier} title="AI insights — Pro" className="mb-4">
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {summary ||
                'AI role summary, strengths vs. gaps, and interview talking points — unlock with Pro.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-emerald-600">Your strengths</h4>
                <ul className="space-y-1">
                  {strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 text-emerald-500">+</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {gaps.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-amber-600">Areas to address</h4>
                <ul className="space-y-1">
                  {gaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 text-amber-500">-</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </ProLockedSection>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4">
        {hasApplyUrl ? (
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="group/btn h-8 rounded-full px-4">
              Apply now
              <ExternalLink className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Button>
          </a>
        ) : (
          <span className="inline-flex h-8 cursor-default items-center justify-center rounded-full border border-border bg-muted px-4 text-xs font-medium text-muted-foreground">
            Apply link unavailable
          </span>
        )}
      </div>
    </article>
  );
}

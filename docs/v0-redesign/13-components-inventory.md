# Component inventory

Map v0 output to existing repo components under `web/components/`.

## Layout

| Component | Path | Role |
|-----------|------|------|
| MarketingHeader | `layout/MarketingHeader.tsx` | Fixed glass nav |
| SiteFooter | `layout/SiteFooter.tsx` | Marketing footer |
| AppNav | `layout/AppNav.tsx` | Desktop header links |
| MobileBottomNav | `layout/MobileBottomNav.tsx` | Mobile tab bar |
| DashboardPage | `layout/DashboardPage.tsx` | Settings sub-page wrapper |
| MockModeBanner | `layout/MockModeBanner.tsx` | Amber dev warning |

## Auth

| Component | Path |
|-----------|------|
| OAuthButtons | `auth/oauth-buttons.tsx` |
| AuthHashRedirect | `auth/AuthHashRedirect.tsx` |

## Marketing / trust

| Component | Path |
|-----------|------|
| DataTrustNotice | `trust/DataTrustNotice.tsx` |
| NewsletterUpsell | `marketing/NewsletterUpsell.tsx` |

## Search workspace

| Component | Path |
|-----------|------|
| SearchPageContent | `searches/SearchPageContent.tsx` |
| JobSearchCard | `searches/JobSearchCard.tsx` |
| InitialSearchSetup | `searches/InitialSearchSetup.tsx` |

## Profile / forms

| Component | Path |
|-----------|------|
| JobSearchFields | `profile/JobSearchFields.tsx` |
| SearchFocusFields | `profile/SearchFocusFields.tsx` |
| SearchProfileFields | `profile/SearchProfileFields.tsx` |
| ResumeUploadField | `profile/ResumeUploadField.tsx` |

## Results

| Component | Path |
|-----------|------|
| RunPoller | `runs/RunPoller.tsx` |
| RunSummary | `jobs/JobsList.tsx` |
| JobsList | `jobs/JobsList.tsx` |
| JobCard | `jobs/JobCard.tsx` |
| ProLockedSection | `jobs/ProLockedSection.tsx` |

## Dashboard utilities

| Component | Path |
|-----------|------|
| DailyUsageMeter | `dashboard/DailyUsageMeter.tsx` |
| RunNowButton | `dashboard/RunNowButton.tsx` |

## UI primitives

| Component | Path |
|-----------|------|
| Button | `ui/button.tsx` |
| Badge | `ui/badge.tsx` |
| Card | `ui/card.tsx` |
| Input, Label | `ui/input.tsx`, `ui/label.tsx` |
| Dialog | `ui/dialog.tsx` |

## Brand constants

```ts
// web/lib/brand.ts
APP_NAME = 'RadarAI'
APP_TAGLINE = 'AI job search on demand'
```

## Icons (lucide-react)

Radar, Search, Settings, Settings2, Shield, FileText, Users, Zap, ArrowRight, CalendarSearch, ChevronRight, Mail, Lock, Sparkles, ExternalLink, Upload, FileQuestion, MessageSquare, ArrowLeft

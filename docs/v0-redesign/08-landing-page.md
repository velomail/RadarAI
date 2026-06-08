# Landing page — `/`

## Layout

Marketing shell: `MarketingHeader` + `gradient-mesh` + floating blur orbs + `SiteFooter`.

## Hero section

**Eyebrow pill** (`glass-subtle`, rounded-full):

```
On-demand · Adzuna job search · Resume-aware AI
```

**H1:**

```
Find roles that fit your experience — when you're ready to search
```

**Subhead:**

```
RadarAI is a resume-aware job search utility with plain-English role summaries and honest experience comparison for every match.
```

**CTAs** (stack mobile, row desktop):

| Button | Style | Href |
|--------|-------|------|
| Create free account | Primary lg, rounded-xl, ArrowRight icon | `/sign-up` |
| Sign in | Outline lg, glass, rounded-xl | `/sign-in` |

**Footnote** (`text-sm text-muted-foreground`):

```
Free plan includes 3 AI-powered searches per day. Pro digests — coming soon.
```

## Trust section

`DataTrustNotice` — centered `max-w-2xl`:

- Title: **Your data stays yours**
- Bullets: private Supabase storage; resume used only for scoring; delete anytime from Settings

## Feature grid (3 cards)

`grid gap-6 md:grid-cols-3`, each `glass rounded-2xl p-6`:

| Icon | Title | Body |
|------|-------|------|
| FileText | Role summary | Each listing starts with a clear description of what you'd actually do — not just a raw job board dump. |
| Users | Experience comparison | See how your resume maps to the posting: strengths called out honestly, gaps flagged before you apply. |
| Zap | Search when you want | No background cron on the free tier — run a scan from your dashboard whenever you're actively looking. Scheduled email newsletters are Pro (coming soon). |

Each card: icon in `h-12 w-12 rounded-xl bg-primary/10`, title `text-lg font-semibold`, body `text-sm text-muted-foreground`.

## Footer

- Left: Radar icon + **RadarAI** — AI job search on demand
- Links: Sign up, Sign in, Privacy

## v0 notes

- Use `text-balance` on H1, `text-pretty` on subhead
- Decorative blobs: `pointer-events-none fixed inset-0 overflow-hidden`
- Do not add pricing, demo CTA, or testimonial carousel unless requested

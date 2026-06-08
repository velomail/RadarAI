# Platform UX References — Job Search Apps

Use this file when the target app is a **job board, job search utility, or career tool** (e.g. RadarAI). The product adds **AI for better matching** — it does **not** reinvent how job platforms work. Users should feel at home on day one.

## Two-layer design model

| Layer | Source | What to copy |
|-------|--------|--------------|
| **Brand skin** | Envoy Direct kit (`globals.css`, typography, spacing) | Colors, fonts, radius, motion, studio polish |
| **UX skeleton** | Indeed, Glassdoor, LinkedIn Jobs, etc. | Layout, IA, component placement, labels users already know |

**Do not** copy platform brand colors (Indeed blue, LinkedIn blue). **Do** copy their mental models, field order, and interaction patterns — then apply Envoy tokens on top.

---

## Reference platforms

### Indeed — [indeed.com](https://www.indeed.com)

**Best for**: search-first flows, high-volume results, mobile job hunting.

| Pattern | Implementation |
|---------|----------------|
| Hero search | Two fields prominent above fold: **What** (job title/keywords) + **Where** (city/remote) + single Search CTA |
| Results list | Vertical stack of job cards; scan-friendly; newest/relevance sort dropdown |
| Job card | **Title** (largest), company name, location, salary snippet if known, 1–2 line description, posted date |
| Quick actions | Save, share, apply — visible without opening detail |
| Filters | Left sidebar desktop / bottom sheet or slide-over mobile: date posted, salary, job type, experience level |
| Detail page | Title block → company → metadata row → full description → apply CTA sticky on mobile |

### Glassdoor — [glassdoor.com](https://www.glassdoor.com)

**Best for**: company context, trust signals, salary transparency.

| Pattern | Implementation |
|---------|----------------|
| Company block | Logo + company name + **star rating** + review count when available |
| Job card | Company prominence equal to title; "Easy Apply" badge; salary range highlighted |
| Tabs on detail | Overview / Reviews / Salaries / Jobs — use tabs or sections for company intel |
| Salary | Show range or estimate inline on card when data exists — users expect it |
| Trust copy | "Your data stays yours" style privacy callouts near forms |

### LinkedIn Jobs — [linkedin.com/jobs](https://www.linkedin.com/jobs)

**Best for**: professional tone, saved jobs, filter chips, application state.

| Pattern | Implementation |
|---------|----------------|
| Filter chips | Horizontal scroll: Remote, Full-time, Entry level, Date posted — pill toggles |
| Job card | Logo left, title + company stacked, location, **promoted** or **Easy Apply** tags |
| Metadata row | Icons + text: location, salary, job type, applicants (if shown) |
| Save job | Bookmark icon top-right of card — filled when saved |
| List + detail | Master-detail on desktop (list left, preview right); full page on mobile |
| Alerts | "Create job alert" after search — email/notify pattern |

### ZipRecruiter — [ziprecruiter.com](https://www.ziprecruiter.com)

**Best for**: mobile apply, urgency without spam.

| Pattern | Implementation |
|---------|----------------|
| One-tap apply | Minimize steps when resume on file; clear progress |
| Notification opt-in | Post-search prompt for alerts — optional, not blocking |
| Card density | Slightly tighter cards than Indeed; still thumb-friendly |

### Google Jobs / aggregator pattern

**Best for**: RadarAI-style aggregation from APIs.

| Pattern | Implementation |
|---------|----------------|
| Source attribution | Small label: source name — don't hide aggregator origin |
| Deduped results | Same role at same company — merge or flag duplicates |
| Freshness | "Posted 2d ago" relative timestamps |

---

## AI differentiation (your value-add)

Layer these **on top of** standard platform cards — don't replace familiar structure.

| AI feature | Placement | Pattern |
|------------|-----------|---------|
| **Match score** | Top-right of job card + hero of detail page | Badge: `87% match` |
| **Role summary** | First block on detail page, before raw description | Plain-English "What you'd actually do" |
| **Experience comparison** | Below summary on detail | Strengths + gaps |
| **Resume-aware label** | Near search or results header | "Resume-aware results" |
| **Scan on demand** | Dashboard CTA, not background cron | "Run search" button — user-initiated |

Match score tiers (monochrome Envoy):

- **Strong** (80%+): semibold, solid border
- **Good** (60–79%): medium weight
- **Fair** (<60%): muted foreground

---

## Page templates (job apps)

### Dashboard / search (platform layer)

```
[ What: job title    ] [ Where: location ] [ Search ]

( Filter chips: Remote · Direct apply · Posted this week )

┌─ list ─────────────┬─ detail preview ────────────────┐
│ Title      87%     │ Senior Developer    87% match   │
│ Co · Loc · 2d ago  │ Role summary (AI)               │
└────────────────────┴─────────────────────────────────┘
```

### Job detail (platform + AI layer)

Title → company → metadata → AI summary → fit comparison → full posting → Apply

---

## Component mapping

- `JobSearchBar` — Indeed dual-input pattern
- `FilterChipRow` — LinkedIn horizontal pills
- `JobCardListItem` — compact list row
- `JobDetailPanel` — full detail + AI blocks
- `MatchScoreBadge` — percentage pill
- `JobsMasterDetail` — list + preview split

---

## Anti-patterns for job apps

- ❌ Chat-only UI with no job list
- ❌ Hiding company name or location to show AI first
- ❌ Forcing signup before showing a single result
- ❌ Inventing new labels ("Opportunity units", "Talent nodes")

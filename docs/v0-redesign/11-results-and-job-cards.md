# Results, RunSummary, and JobCard

## Loading state (`RunPoller`)

### Initial spinner

- Centered spinner + **Starting your search…** + Connecting to the pipeline

### Pipeline steps (`RunLoading`)

**Title:** Preparing your search / Analyzing matches  
**Sub:** `{n}s elapsed · typically 15–45 seconds`

**4 steps:**

1. Fetching listings from Adzuna
2. Filtering new and relevant jobs
3. Scoring against your resume
4. Ranking top matches

Active step: pulsing primary circle. Done: checkmark in primary fill.  
Progress bar below: animates width based on elapsed time.

---

## RunSummary (success)

Glass `rounded-2xl overflow-hidden`:

### Header band (`bg-card/40`)

- Label: `SEARCH COMPLETE` (uppercase micro)
- Title: `{banner_label}` or **Top matches for your profile**
- Badge row (wrap): `N posted today`, `N this week`, `N direct apply`, `Expanded search`

### Stats row

`grid-cols-1 sm:grid-cols-3`:

| Scanned | Qualified | Ranked for you |
|---------|-----------|----------------|
| number | number | number |

### Footer

`Sources: {breakdown}` — e.g. Adzuna counts

### Sample data warning (amber band)

If mock engine: explain fixture data + env vars — rare in production.

---

## JobsList

Intro line:

```
{N} role(s) ranked by fit — best match first
```

Stack of `JobCard` components, `gap-5`.

**Empty state:** dashed border card — No matches surfaced this run + broaden search hint.

---

## JobCard anatomy

Glass card `rounded-2xl`, hover shadow.

### Header (`bg-card/40`)

**Left:**

- Rank circle: `1`, `2`, … in `bg-primary/10 text-primary`
- Title `text-lg font-semibold`
- Fit badge: HIGH (green) / MEDIUM (amber) / LOW (muted)
- Company · location · Remote
- Publisher / source line (`via … · Adzuna`)

**Right:**

- Large **87** match score + `match score` label
- Freshness badge: Posted &lt;6h / &lt;24h / &lt;72h / Nd ago

### Body sections (order)

1. **About this role** — `role_summary` (ProLocked on free)
2. **How you compare** — tinted `border-primary/20 bg-primary/5` box (ProLocked)
3. Fallback: job description excerpt (4-line clamp) if no AI summary
4. **Pro teaser** — blurred list of what Pro unlocks
5. **Sub-scores** — 4 progress pills: Resume 24/30, Arrangement 20/25, Location 18/20, Opportunity 22/25 (ProLocked)
6. Cover-letter hook (italic, ProLocked)
7. Talking points bullets (ProLocked)
8. Strengths | Gaps two-column (ProLocked)
9. Company meta line (ProLocked)

### Footer

- Badges: Direct apply, quality flags (max 3)
- **Apply now** — primary pill button + ExternalLink icon, opens `apply_url`
- Or disabled: Apply link unavailable

### ProLocked overlay

Blur content + Pro badge + lock + section title e.g. `Role summary — Pro`

---

## Free vs Pro display

- **Free:** all Pro sections visible but blurred with overlay
- **Pro:** full content, no overlay (future billing)

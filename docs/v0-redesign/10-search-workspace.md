# Search workspace — `/dashboard/searches`

**The core product screen.** Single profile model — not a multi-card dashboard.

## Two modes

### A. First-time setup (no profile yet)

**Header (centered):**

- Eyebrow pill: Search icon + `Job search`
- H1: **Set up your search**
- Sub: Upload your resume and set keywords — your first search starts automatically.

**Glass card** — `InitialSearchSetup` form:

1. Resume upload (required) — full dropzone
2. `JobSearchFields`: search focus, keywords, location, min score, remote checkbox
3. Primary button: **Save and search** → (full width, `h-11 rounded-xl`)

### B. Returning user (profile exists)

**Header:**

- Eyebrow: `Job search`
- H1: **Your search**
- Sub: Set keywords and location, then search — results appear below.

**Glass card** — `JobSearchCard`:

1. **Error banner** (if `?error=daily_limit` etc.)
2. **Resume section** (compact): current filename + Update resume / Choose PDF
3. **Search form** (same fields as onboarding)
4. **DailyUsageMeter**: `Today's searches: 2/3 (resets midnight UTC)` + progress bar
5. **Search now** button (full width)
6. Footer link: Settings2 icon + **Email alerts & advanced settings** → `/dashboard/settings/search`

## Inline results

When URL has `?run={id}`:

- `RunPoller` renders below the glass card (`mt-8`)
- Polls `/api/runs/{id}` every 2.5s until success/error

## Past runs (no active run)

Section below card when history exists:

- H2: **Past runs** (centered, muted)
- List card `bg-card/75 rounded-2xl border`
- Each row: calendar icon, date/time, status badge, match count, chevron
- Links to `?run={id}`

## Form fields detail

| Field | Type | Notes |
|-------|------|-------|
| Search focus | `<select>` | 14 industry options; `auto` = match resume |
| Keywords | `<textarea>` | Comma-separated; optional when `auto` |
| Location | text input | Default Canada |
| Min match score | number 50–100 | Default 70 |
| Remote only | checkbox | |

## Error messages

| Code | Message |
|------|---------|
| `daily_limit` | You've used all 3 free searches today. Resets at midnight UTC. |
| `resume_missing` | Upload a resume before searching. |

## Max width

Entire column: `max-w-xl` centered in app shell.

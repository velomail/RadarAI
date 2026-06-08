# Product and business model

## One-liner

**RadarAI** is resume-aware job search on demand: upload a PDF, set keywords and location, run a scan against **live Adzuna listings**, get ranked matches with AI fit summaries.

**Tagline:** AI job search on demand

## What users get (free beta)

| Capability | Detail |
|------------|--------|
| Auth | Google + GitHub OAuth (no password, no magic link) |
| Resume | PDF upload, private Supabase storage, parsed for scoring |
| Search | Industry focus dropdown + keywords + location + remote filter |
| Results | Match score 0–100, role summary, experience comparison (Pro-masked on free) |
| Limit | **3 AI-powered searches per day** (resets midnight UTC) |
| History | Past runs list on search page |
| Notifications | Optional Telegram on run complete; email on complete optional in advanced settings |

## Pro (planned — UI only today)

- Badge: **Pro — coming soon**
- Unmasked AI fields (role summary, experience comparison, sub-scores, talking points)
- Scheduled email digest — **not built**
- No Stripe, no pricing page, no checkout

## Positioning copy (use verbatim where noted)

- Eyebrow: `On-demand · Adzuna job search · Resume-aware AI`
- Utility framing: search **when you're ready**, not daily spam on free tier
- Footnote: `Free plan includes 3 AI-powered searches per day. Pro digests — coming soon.`

## Do NOT design

- Pricing page or plan selector
- Stripe / billing / upgrade checkout
- Password login or magic-link email auth
- Anonymous `/demo` flow (redirects to sign-up today)
- LinkedIn scrape or “multi-board” claims — **Adzuna only**
- Admin panel or usage analytics dashboard
- Unlimited searches on free tier

## Primary user flows

1. **New user:** Landing → Sign up (OAuth) → `/dashboard/searches` onboarding (resume + criteria) → auto first run → results inline
2. **Returning:** Sign in → Search page → adjust criteria → **Search now** → results below
3. **Settings:** Bottom nav or header → Telegram, Pro upsell, account delete

## Data honesty

- Job source: **Adzuna** (default country Canada via env)
- AI: GPT-4o-mini scoring per job
- Free users see Pro fields **blurred with lock overlay**, not hidden entirely

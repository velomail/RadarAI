# RadarAI — UI structure and business model (V0 brief)

Paste this document into [v0.dev](https://v0.dev) as context when redesigning or generating UI.

**Product name:** RadarAI (not Radar) · **Tagline:** AI job search on demand

---

## 1. Product summary

RadarAI is a **resume-aware job search utility**. Users upload a PDF resume, choose industry focus and location, and run an on-demand scan across job boards (JSearch + LinkedIn). AI scores each listing and returns ranked matches with: plain-English **role summary**, **how you compare** to the posting, match score (0–100), sub-scores, talking points, and cover-letter hooks.

**Free tier** = run searches manually from the dashboard. **Paid tier (future)** = scheduled email digest to inbox — **not built yet** (no Stripe, no pricing page).

---

## 2. Business model

| Tier | Price | What users get |
|------|-------|----------------|
| **Anonymous demo** | $0 | One run without account; results in ~15–30s; demo data deleted in 24h |
| **Free (signed in)** | $0 | Saved search profiles, manual runs, run history, optional email when run completes, optional Telegram |
| **Pro (planned)** | $19–29/mo suggested | Scheduled email digest; UI shows **Pro — coming soon** |

**Positioning copy (use consistently):**

- On-demand · Multi-source search · Resume-aware AI
- No subscription required to search. Scheduled email digests — Pro (coming soon).
- Utility framing: search **when you're ready**, not daily spam on free tier.

**Do NOT design:** pricing page, Stripe checkout, plan selector, usage meters, admin panel.

---

## 3. User personas and flows

**Investor / evaluator:** Landing → Try free demo → upload PDF → results → may never sign up.

**Job seeker:** Landing → Create account → magic link → onboarding → dashboard → Run search → results.

**Returning user:** Sign in → dashboard → run again or edit profile.

**Run flow:** Upload + criteria → run `pending` → poll every 2.5s → `RunSummary` + ranked `JobCard`s.

---

## 4. Information architecture (routes)

| Route | Auth | Shell | Purpose |
|-------|------|-------|---------|
| `/` | Public | MarketingHeader + SiteFooter | Landing |
| `/demo` | Public | ProductShell | Anonymous search form |
| `/demo/runs/[id]` | Public (cookie) | ProductShell | Results + loading |
| `/privacy` | Public | MarketingHeader + SiteFooter | Privacy policy |
| `/sign-in` | Public | Auth shell | Magic link |
| `/sign-up` | Public | Auth shell | Magic link → onboarding |
| `/onboarding` | Required | App shell | First profile |
| `/dashboard` | Required | App shell | Profiles + history |
| `/dashboard/profiles/[id]` | Required | App shell | Edit search |
| `/dashboard/runs/[id]` | Required | App shell | Results |
| `/dashboard/settings` | Required | App shell | Notifications + Pro upsell |

**Max width:** `max-w-5xl` (main), forms often `max-w-2xl`.

---

## 5. Layout shells

### Marketing shell
- Logo **RadarAI** left; Sign in + Create account right
- Footer: tagline, Try demo, Sign in, Privacy

### Product shell (demo)
- Optional banner: Product demo · Representative output from the full search pipeline
- Header: RadarAI + CTA (e.g. Save searches →)
- Main: max-w-5xl or max-w-4xl for results

### App shell (authenticated)
- Optional mock banner
- Header: RadarAI | Searches, Settings | email | Sign out
- Main: max-w-5xl, bg-muted/20

### Auth shell
- Centered max-w-md, full viewport
- Back to Home
- Email + Email me a link →
- Errors: red bordered box, title + detail

---

## 6. Design system

**Typography:** Inter, bold headings with tracking-tight, muted-foreground for secondary, uppercase micro labels on job cards.

**Colors (HSL):** Primary blue 221 83% 40%; background 210 20% 98%; card white; semantic success/warning/danger for badges.

**Components:** Button (primary + outline), Card (rounded-xl border shadow-sm), Badge pills (fresh=red, warm=amber, success=green, muted=gray), Input, Label, PDF Dropzone (dashed, 2MB max).

**Tone:** Professional, trustworthy, honest about fit gaps, no fake urgency.

---

## 7. Page-by-page UI spec

### Landing `/`
- Eyebrow pill, H1: Find roles that fit your experience — when you're ready to search.
- Sub: job utility + role summary + experience comparison
- CTAs: Try free demo (primary) | Create free account (outline)
- Footnote: No subscription required… Pro coming soon
- DataTrustNotice (shield icon)
- 3 cards: Role summary | Experience comparison | Search when you want

### Demo `/demo`
- H1 Try a search; compact trust notice
- Form: Resume PDF, industry dropdown, optional keywords, location (default Canada), Run search →

### Results `/demo/runs/[id]` and `/dashboard/runs/[id]`
**Loading:** steps Fetching → Deduplicating → Scoring → Ranking + progress bar

**Success:**
1. RunSummary: Search complete, badges (posted today, direct apply, etc.), stats Scanned / Qualified / Ranked, sources line
2. JobsList: N roles ranked by fit — best match first
3. JobCard: rank #, title, HIGH/MEDIUM/LOW, company · location, match score, freshness, About this role, How you compare (highlight box), 4 score bars, cover-letter hook, talking points, strengths | gaps, apply CTA

### Sign-in / Sign-up
- Magic link only; sign-up → onboarding; check-email state

### Onboarding
- Resume + SearchProfileFields; Save and go to dashboard →

### Dashboard
- Profile cards (2-col): name, location, On-demand badge, queries, Run search, Edit
- Search history rows → run detail

### Settings
- NewsletterUpsell (Pro coming soon)
- Telegram form
- Trust notice + account / data note

### Privacy
- Long-form policy sections

---

## 8. Key components

MarketingHeader, ProductShell, MockModeBanner, DataTrustNotice, SearchFocusFields, SearchProfileFields, Dropzone, MagicLinkForm, RunSummary, JobCard, JobsList, RunPoller, NewsletterUpsell

---

## 9. Search focus dropdown (all options)

1. Match my resume (recommended) — `auto`
2. Sales & business development — `sales`
3. Software & engineering — `software`
4. Marketing & growth — `marketing`
5. Finance & accounting — `finance`
6. Healthcare & clinical — `healthcare`
7. Operations & logistics — `operations`
8. Customer success & support — `customer_success`
9. Design & creative — `design`
10. Human resources — `hr`
11. Legal & compliance — `legal`
12. Education & training — `education`
13. Skilled trades & technicians — `trades`
14. General / other — `general`

Default location: **Canada**. Resume max **2MB**.

---

## 10. Data entities (UI fields)

**Search profile:** name, queries[], location, remote_only, min_score, search_focus, notify_email, On-demand badge (manual schedule)

**Run:** status, scanned/qualified/reported, fresh/warm/direct_ats, banner_label, sources, started_at

**Job:** job_title, company, location, remote, match_score, fit_verdict, role_summary, experience_match, sub-scores, talking_points, cover_letter_hook, key_advantages, gaps_or_objections, apply_url, freshness

---

## 11. Source code (repo)

- Brand: `web/lib/brand.ts`
- Routes: `web/app/`
- Jobs UI: `web/components/jobs/`
- Monetization: `docs/MONETIZATION.md`

See also: [V0_PROMPT_STARTER.md](V0_PROMPT_STARTER.md) for copy-paste prompts.

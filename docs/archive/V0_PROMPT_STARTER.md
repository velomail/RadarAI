# RadarAI — V0 prompt starters

Copy one block into [v0.dev](https://v0.dev). Full product context: [V0_UI_BRIEF.md](V0_UI_BRIEF.md).

---

## Master prompt (all pages)

```
Design a professional SaaS UI for "RadarAI" — AI job search on demand.

Stack: Next.js + Tailwind + shadcn-style components. Inter font. Light mode: off-white background (#f8fafc), white cards, blue primary (~hsl 221 83% 40%), subtle borders, rounded-xl cards, generous whitespace. Trust-focused B2C job seeker audience — not flashy startup neon.

Business rules:
- FREE: on-demand job search from dashboard; no subscription required to search
- PRO (coming soon): scheduled email digest only — show dashed upsell card with "Pro — coming soon" badge, NO pricing page, NO Stripe, NO checkout
- Brand name is RadarAI (never "Radar")
- Max content width 5xl; forms often 2xl

Do not add: pricing tables, usage meters, admin panels, password login, or dark patterns.
```

---

## Landing page

```
[Paste master prompt above, then:]

Build the marketing landing page for RadarAI.

Include:
- Header: RadarAI logo left, Sign in link + Create account button right
- Hero eyebrow pill: "On-demand · Multi-source search · Resume-aware AI"
- H1: "Find roles that fit your experience — when you're ready to search."
- Subhead: resume-aware utility with role summary and experience comparison per match
- CTAs: primary "Try free demo", outline "Create free account"
- Small footnote: "No subscription required to search. Scheduled email digests — Pro (coming soon)."
- Trust card with shield icon: private resume storage, no selling data, demo deletes in 24h
- Three feature cards in a row: Role summary | Experience comparison | Search when you want
- Footer with Try demo, Sign in, Privacy links

Mobile responsive. Accessible contrast.
```

---

## Demo search form

```
[Paste master prompt above, then:]

Build the /demo page — anonymous try-before-signup.

Include:
- Simple header: RadarAI + link "Save searches →"
- H1 "Try a search", subtext one free run without account, any industry
- Compact trust notice
- Form card: PDF resume dropzone (max 2MB), dropdown "What are you looking for?" with "Match my resume (recommended)" and industry options, optional keywords field, location default Canada, primary button "Run search →"
- Link: Already have an account? Sign in

Clean form layout, single column max-w-2xl centered.
```

---

## Results page (hero screen for investors)

```
[Paste master prompt above, then:]

Build job search RESULTS page after a scan completes.

Top: RunSummary card
- Label "Search complete", title "Top matches for your profile"
- Badges: "3 posted today", "5 this week", "2 direct apply"
- Three stat tiles: Scanned 84 | Qualified 22 | Ranked for you 12
- Footer line: Sources: Job boards (48) · LinkedIn (36)

Below: "12 roles ranked by fit — best match first"

Job card #1 (expandable pattern for list):
- Left: rank badge "1", title "Senior Product Manager", HIGH fit pill, Acme Corp · Toronto · Remote, via LinkedIn
- Right: large "87" match score, badge "Posted <24h ago"
- Section "About this role" paragraph
- Highlight box "How you compare" with tinted primary border
- Four mini progress bars: Resume fit 24/30, Arrangement 20/25, Location 18/20, Opportunity 22/25
- Italic cover-letter hook quote
- Bullet talking points
- Two columns: Strengths (green label) | Gaps to address (amber label)
- Footer: Direct apply badge + primary button "View application →"

Show a second smaller job card #2 collapsed preview below.

Optional loading state variant: 4-step checklist with progress bar.
```

---

## Dashboard (signed-in)

```
[Paste master prompt above, then:]

Build authenticated dashboard "Your searches".

App header: RadarAI | nav Searches, Settings | user@email.com | Sign out

Main:
- H1 Your searches, subtitle about running scans anytime
- Grid of 2 profile cards: "Toronto marketing", location + min score 70, On-demand badge, query tag pills, primary "Run search" button, text link Edit search
- Section Search history: list rows with date/time, success badge, "12 matches", clickable

Muted page background, white cards with shadow-sm.
```

---

## Settings + Pro upsell

```
[Paste master prompt above, then:]

Build Settings page.

- H1 Settings, subtitle account and notifications
- Dashed border card with mail icon: "Email newsletter" + badge "Pro — coming soon", explains free on-demand search vs future digest
- Card form: Telegram chat ID optional, Save button
- Trust notice compact
- Account section: signed-in email, note that data deletion is available per privacy policy

No billing UI.
```

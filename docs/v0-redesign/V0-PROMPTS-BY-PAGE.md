# v0 prompts by page

Paste **MASTER-PROMPT.md** first, then the block below.

---

## Landing `/`

```
Build the RadarAI marketing landing page.

Fixed glass header: RadarAI logo (Radar icon), Sign in ghost button, Create account primary (Sign up on mobile).

Hero: eyebrow pill "On-demand · Adzuna job search · Resume-aware AI", H1 "Find roles that fit your experience — when you're ready to search", subhead about resume-aware utility, full-width mobile CTAs to /sign-up and /sign-in, footnote about 3 free searches/day and Pro coming soon.

Trust card with Shield: "Your data stays yours" + 3 bullets.

Three glass feature cards (stack mobile, 3-col desktop): Role summary, Experience comparison, Search when you want — with FileText, Users, Zap icons.

Footer: RadarAI tagline, Sign up, Sign in, Privacy links.

Gradient mesh background, floating blur orbs, pointer-events-none. Mobile responsive with safe-area padding.
```

---

## Sign up + Sign in

```
Build OAuth auth pages for RadarAI (sign-up and sign-in variants).

Gradient mesh full viewport. Top: RadarAI logo linking home. Center max-w-md.

Sign-up H1 "Create your account", sub about resume-backed searches. Glass card with stacked full-width h-12 buttons: Continue with Google (color G icon), Continue with GitHub. Error state: red bordered box. Footer link to sign-in.

Sign-in variant: H1 "Welcome back", link to sign-up.

No email fields. No passwords. rounded-xl buttons with glass outline style.
```

---

## Search workspace `/dashboard/searches`

```
Build the main authenticated job search workspace for RadarAI.

App chrome: header with RadarAI + sign out; desktop nav Search|Settings; MOBILE fixed bottom tab bar with Search and Settings icons.

Centered max-w-xl column. Eyebrow pill "Job search". H1 "Your search". Sub about setting keywords and searching.

Large glass card containing:
- Compact resume row: PDF icon, "Current resume", filename, Update resume button
- Dropdown "What are you looking for?" with "Match my resume (recommended)" + industries
- Textarea keywords comma-separated
- Location + min score inputs in 2-col on sm+
- Remote only checkbox
- Daily usage meter "Today's searches: 2/3" with progress bar
- Full width primary "Search now" h-11 rounded-xl
- Link to advanced settings

Below card: optional results area and "Past runs" list with date, status badge, match count.

Mobile: p-4 card padding, bottom nav clearance pb-24.
```

---

## Results (RunSummary + JobCard)

```
Build job search RESULTS UI for RadarAI after a scan completes.

RunSummary glass card:
- "SEARCH COMPLETE" micro label, title "Top matches for your profile"
- Badges: posted today, this week, direct apply
- Stats: Scanned | Qualified | Ranked for you (stack 1-col mobile, 3-col sm+)
- Sources footer line

JobsList intro: "12 roles ranked by fit — best match first"

JobCard #1 glass card:
- Rank badge 1, title "Senior Product Manager", HIGH fit pill, company · Toronto · Remote
- Large 87 match score, "Posted <24h ago" warm badge
- Section "About this role" — BLURRED with Pro lock overlay "Role summary — Pro"
- Highlight box "How you compare" — BLURRED Pro overlay
- Footer badges + full-width mobile "Apply now" primary pill with external link icon

Show RunLoading variant: 4-step checklist (Fetching Adzuna → Filtering → Scoring → Ranking) + progress bar.

Honest Pro freemium: blur + lock, not hidden sections.
```

---

## Settings

```
Build RadarAI Settings page in app shell with bottom mobile nav.

H1 Settings. Dashed border Pro upsell card: Email newsletter + "Pro — coming soon" badge, explains on-demand free vs future digest.

Glass card: Telegram chat ID optional field, Save button.

Trust notice compact.

Account card: signed-in email, privacy link, delete account danger zone with type DELETE confirmation.

No billing UI.
```

---

## Support + Privacy (optional)

```
Build RadarAI /support page — marketing shell. H1 "How can we help?", FAQ accordion-style glass cards (matching, data safety, free vs Pro, Adzuna source), contact form glass card with email/subject/message, support@radarai.com.

Separate privacy policy article page: glass max-w-3xl, sections for collection, use, providers (Supabase, OpenAI, Adzuna, OAuth), rights. Professional legal tone.
```

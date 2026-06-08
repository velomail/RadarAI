# Master prompt — paste into every v0 session

```
Design UI for "RadarAI" — AI job search on demand.

STACK: Next.js 15 + Tailwind + shadcn-style components. Font: Inter. Icons: lucide-react.

VISUAL STYLE:
- Professional, trustworthy B2C job seeker product — not neon startup
- Glass morphism: frosted cards (bg-card/70, border-border/50, backdrop-blur-xl, rounded-2xl)
- Subtle gradient-mesh page backgrounds with soft primary/blue/purple radial blobs
- Light mode default; support prefers-color-scheme dark via HSL CSS variables (bg-background, text-foreground, bg-card, text-primary, text-muted-foreground, border-border)
- Primary blue: hsl(221 70% 38%) light / hsl(213 90% 68%) dark
- Generous whitespace desktop; compact but readable mobile
- NEVER hardcode bg-white — use semantic card tokens

BRAND:
- Name: RadarAI (never "Radar" alone)
- Tagline: AI job search on demand
- Eyebrow: On-demand · Adzuna job search · Resume-aware AI

BUSINESS RULES:
- FREE: Google/GitHub OAuth, upload PDF resume, run on-demand Adzuna job searches from /dashboard/searches
- FREE LIMIT: 3 AI-powered searches per day (show usage meter)
- PRO (coming soon): scheduled email digest + unmasked AI insights — show "Pro — coming soon" badge and blurred ProLocked overlays on free tier
- NO pricing page, NO Stripe, NO checkout, NO magic link/password auth, NO anonymous demo flow
- Job data source: Adzuna only (default Canada) — do not claim LinkedIn or multi-board scrape

AUTH:
- Sign in/up: OAuth only (Continue with Google, Continue with GitHub)
- Post-auth lands on /dashboard/searches (single search workspace, not multi-profile dashboard)

LAYOUT:
- Marketing pages: fixed glass header + footer
- App pages: header with RadarAI logo + sign out; desktop inline nav (Search, Settings); MOBILE bottom tab bar (Search | Settings) with pb-24 main clearance
- Centered workspace max-w-xl for search; forms in glass rounded-2xl cards

KEY SCREENS:
1. Landing — hero, trust notice, 3 feature cards
2. OAuth sign-up/sign-in
3. Search workspace — resume + criteria form + Search now + daily meter + inline results
4. Results — RunSummary stats + ranked JobCards with match score, Pro-blurred AI sections, Apply now
5. Settings — Pro upsell, Telegram, account delete

MOBILE:
- Full-width CTAs on phone, stacked grids, touch targets min 44px
- Run stats: 1 col mobile, 3 col sm+
- Job card Apply button full width on mobile
- Safe-area insets for notched phones
- No horizontal scroll at 320px

DO NOT ADD: pricing tables, usage analytics admin, password fields, demo without signup, fake testimonials, dark patterns.

Match existing production app behavior — this is a visual redesign, not a feature expansion.
```

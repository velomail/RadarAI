# Envoy Direct theme — v0 master prompt for RadarAI

**Paste this entire file into v0.dev** to redesign RadarAI with the exact aesthetic of [envoydirect.co](https://envoydirect.co) (Jesse's portfolio / Envoy Direct studio site).

Pair with `01-product-and-business.md` + page specs (`08`–`12`) for RadarAI functionality. See `ENVOY-DESIGN-SYSTEM.md` for token reference.

---

```
Redesign "RadarAI" — AI job search on demand — using the EXACT visual language of envoydirect.co (Envoy Direct portfolio). This is a themed reskin: keep all RadarAI features and routes, replace the current glass/gradient/Inter aesthetic entirely.

═══════════════════════════════════════════════════
THEME SOURCE: envoydirect.co (Envoy Direct)
═══════════════════════════════════════════════════

AESTHETIC SUMMARY:
Editorial software-studio look. Warm off-white canvas, white bordered cards, navy primary, sage-green accents. Serif headlines + sans body. Calm, premium, light-mode only. No glass morphism. No purple/blue gradient meshes. No dark mode.

FONTS (Google Fonts — load all three):
- Newsreader → font-serif for ALL headlines (H1, H2, hero, stat numbers, job titles in cards)
- Geist Sans → font-sans for body, labels, nav, buttons
- Geist Mono → font-mono for eyebrows, timestamps, stack/source tags, step numbers

COLORS (oklch — use as CSS variables / Tailwind theme):
--background: oklch(0.992 0.003 95);
--foreground: oklch(0.23 0.035 256);
--card: oklch(1 0 0);
--primary: oklch(0.24 0.04 256);
--primary-foreground: oklch(0.985 0.003 95);
--secondary: oklch(0.96 0.006 95);
--muted: oklch(0.965 0.005 100);
--muted-foreground: oklch(0.52 0.02 256);
--accent: oklch(0.95 0.02 150);
--accent-foreground: oklch(0.32 0.07 155);
--success: oklch(0.6 0.13 155);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.9 0.006 256);
--ring: oklch(0.55 0.04 256);
--radius: 0.75rem;
themeColor: #faf9f7. colorScheme: light only.

REMOVE from current RadarAI design:
✗ glass / glass-subtle / backdrop-blur cards
✗ gradient-mesh backgrounds and multiple floating blur orbs
✗ Inter font
✗ bright blue primary (hsl 221)
✗ rounded-xl square-ish buttons → use rounded-full pills
✗ dark mode / prefers-color-scheme dark

REPLACE with Envoy patterns:
✓ Page background: bg-background (warm off-white)
✓ Cards: rounded-2xl border border-border bg-card (hover: -translate-y-0.5 + soft shadow on interactive cards)
✓ Large panels: rounded-3xl
✓ Section labels: horizontal rule + UPPERCASE tracking-[0.2em] label (SectionLabel pattern)
✓ Hero eyebrow: font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground
✓ Headlines: font-serif font-medium tracking-tight; secondary clause in text-muted-foreground
✓ Primary CTA: rounded-full bg-primary px-6 py-3.5 text-sm font-medium + ArrowUpRight icon, hover:-translate-y-0.5 with icon nudge
✓ Secondary CTA: rounded-full border border-border bg-card hover:bg-secondary
✓ Status pills: rounded-full border border-border bg-card (e.g. "3 searches/day", "Open beta")
✓ Success/live dot: green ping animation bg-success
✓ Accent highlights: bg-accent text-accent-foreground for "Shipped" / "Pro — coming soon" badges
✓ Stat grids: 3-col gap-px rounded-2xl border trick (Scanned | Qualified | Ranked)
✓ Form inputs: rounded-xl border border-border bg-background px-4 py-3, focus:ring-2 ring-ring/20
✓ Single decorative blob: one bg-accent/40 blur-3xl top-right — NOT multiple gradients
✓ Scroll reveal: optional fade-up blur on section enter (700ms ease-out, staggered delays)
✓ Selection highlight: accent background

═══════════════════════════════════════════════════
RADARAI PRODUCT (keep all behavior — reskin only)
═══════════════════════════════════════════════════

Brand: RadarAI (never "Radar" alone). Tagline: AI job search on demand.
Auth: Google + GitHub OAuth only — no email/password.
Main app route: /dashboard/searches (single search workspace, NOT multi-profile grid).
Job source: Adzuna (Canada default). Do not claim LinkedIn.
Free: 3 AI searches/day with usage meter. Pro coming soon (blurred AI insights + scheduled digest upsell). No Stripe/pricing.

ROUTES TO DESIGN (all in Envoy theme):
1. / — Landing
2. /sign-in, /sign-up — OAuth
3. /dashboard/searches — Search form + inline results + past runs
4. Results components — RunSummary + JobCard list + loading pipeline
5. /dashboard/settings — Pro upsell, Telegram, delete account
6. /dashboard/settings/search — Advanced search settings
7. /support, /privacy — Marketing subpages

═══════════════════════════════════════════════════
PAGE-BY-PAGE (Envoy styling applied)
═══════════════════════════════════════════════════

── HEADER (all marketing + app pages) ──
Fixed SiteNav style:
- Brand wordmark: RADARAI (tracking-[0.12em] font-semibold) — NOT glass floating bar
- Scrolled: border-b bg-background/80 backdrop-blur-md
- Marketing right: Sign in (text link) + Create account (rounded-full primary pill)
- App desktop: Search | Settings text nav with animated underline on active
- App mobile: bottom tab bar (Envoy-styled: border-t bg-card, icon + label, min-h 52px) — keep functionality, restyle to match portfolio
- App right: Sign out text link

── LANDING / ──
Hero (like envoydirect.co hero):
- Mono eyebrow: "RadarAI — AI job search on demand"
- Serif H1: "Find roles that fit your experience." + muted span "When you're ready to search."
- Sans subhead (max-w-xl, text-muted-foreground)
- Pill row: green ping "Free beta" + mono pill "3 searches/day" + "Ontario, Canada" or "Adzuna · Canada"
- CTAs: rounded-full primary "Create free account" + outline "Sign in" — both with ArrowUpRight on primary
- Optional stat grid (3 cols gap-px): e.g. 3/day | Adzuna live | AI scored
- SectionLabel "Features" + serif H2 + 3 Envoy service-style cards (icon in rounded-xl bg-secondary, hover accent, deliverable tag pills)
- Trust section: About-style check cards or bordered card with shield — NOT glass
- Footer: envoydirect.co footer pattern — tracking-wide brand, links, copyright

── AUTH ──
Centered max-w-md on bg-background. Serif H1. White card rounded-3xl border p-6 sm:p-8.
Stacked rounded-full outline OAuth buttons h-12 (border-border bg-card). No glass.

── SEARCH WORKSPACE /dashboard/searches ──
Centered max-w-xl. SectionLabel "Search". Serif H2 "Your search". Muted subhead.
Main card: rounded-3xl border bg-card p-6 sm:p-8 (NOT glass):
- Resume row: bordered rounded-xl bg-secondary/50 compact row
- Form fields: Envoy contact-form input styling
- Project-type style pill selector for search focus dropdown OR styled select
- Remote checkbox with min-h 44px touch target
- Usage meter: thin border progress, mono numbers "2/3"
- Full-width rounded-full primary "Search now" + ArrowUpRight
- Text link to advanced settings with ArrowUpRight

Past runs: bordered rounded-2xl list rows, hover:bg-secondary
Results below: RunSummary + JobCards

── RUN SUMMARY ──
rounded-3xl border bg-card overflow-hidden
Header band: SectionLabel "Search complete" + serif title
Badge pills (posted today, direct apply) — rounded-full border or accent fill
Stat grid: 3-col gap-px Envoy hero stat pattern
Sources line: font-mono text-xs

── JOB CARD ──
rounded-2xl border bg-card, hover lift on hover
Header: rank in rounded-full bg-secondary, serif job title, fit badge (accent/success/muted)
Match score: serif text-3xl (not bright blue — use foreground or primary navy)
Sections with SectionLabel-style micro headers (ABOUT THIS ROLE, HOW YOU COMPARE)
Pro locked: blurred content + centered accent badge "Pro — coming soon" + lock — on accent-tinted overlay bg-accent/30, NOT primary/5 blue
Footer: tag pills (mono xs) + rounded-full primary "Apply now" ArrowUpRight

── LOADING ──
bordered card, mono step numbers "01" "02", serif title "Analyzing matches", progress bar border-muted

── SETTINGS ──
SectionLabel + serif H2. Dashed border Pro upsell card (mail icon, accent Pro badge).
Telegram form in rounded-3xl card. Delete zone: destructive border tint.
NewsletterUpsell matches Envoy "Client work" sidebar card tone.

── SUPPORT / PRIVACY ──
Same section rhythm as portfolio About/Contact pages. FAQ cards with hover lift. Contact form = Envoy contact form exactly.

═══════════════════════════════════════════════════
MOBILE
═══════════════════════════════════════════════════
px-5 sm:px-8, full-width rounded-full CTAs, bottom nav clearance pb-24, safe-area insets, 16px inputs on mobile, no horizontal scroll at 320px. Serif headlines scale down (text-4xl → text-5xl).

═══════════════════════════════════════════════════
COMPONENTS TO GENERATE
═══════════════════════════════════════════════════
Provide reusable: SiteNav, SectionLabel, Reveal (optional), EnvoyButton (primary/secondary/full), EnvoyCard, EnvoyInput, StatusPill, StatGrid, MobileBottomNav (RadarAI tabs), JobCard, RunSummary, ProLockedOverlay.

Use lucide-react icons. ArrowUpRight on primary actions. Check icon in accent circles for trust bullets.

═══════════════════════════════════════════════════
DO NOT
═══════════════════════════════════════════════════
- Glass morphism, backdrop-blur cards, white/60 overlays
- Gradient mesh, multiple animated orbs, blue/purple glow
- Inter font, bright hsl blue primary
- Dark mode
- Pricing, Stripe, magic link auth, demo without signup
- LinkedIn / multi-board claims
- Change RadarAI routes or remove features (3/day limit, OAuth, single search page)

Match envoydirect.co precisely — RadarAI should feel like the next product on Jesse's portfolio Work section, not a separate design language.
```

---

## Per-page add-ons

After the master prompt, append one block from `V0-PROMPTS-BY-PAGE.md` (Landing, Search workspace, Results, etc.) and add:

> Style every element per ENVOY-THEME-MASTER-PROMPT above. No glass. Serif headlines. rounded-full CTAs. oklch navy primary.

## Portfolio source files

| Pattern | File |
|---------|------|
| Tokens | `Portfolio 1/src/app/globals.css` |
| Hero | `Portfolio 1/src/components/hero.tsx` |
| Nav | `Portfolio 1/src/components/site-nav.tsx` |
| Section label | `Portfolio 1/src/components/section-label.tsx` |
| Cards | `Portfolio 1/src/components/services.tsx` |
| Forms | `Portfolio 1/src/components/contact.tsx` |
| Motion | `Portfolio 1/src/components/reveal.tsx` |

# Envoy Direct design system (envoydirect.co)

Extracted from `Portfolio 1/` — the aesthetic to apply across RadarAI.

**Reference:** https://envoydirect.co · local source: `c:\Users\jesse\OneDrive\Desktop\Portfolio 1`

---

## Brand feel

- Editorial studio aesthetic — warm off-white, serif headlines, restrained motion
- **Light mode only** — no dark mode, no glass morphism, no neon gradients
- Calm, premium, founder-grade — ships software, not slideware
- Generous whitespace, crisp borders, subtle hover lift (`-translate-y-0.5`)

---

## Typography

| Role | Font | Usage |
|------|------|--------|
| **Headings** | **Newsreader** (serif) `font-serif` | H1, H2, stat numbers, card titles |
| **Body** | **Geist Sans** `font-sans` | Paragraphs, UI labels, nav |
| **Mono** | **Geist Mono** `font-mono` | Eyebrows, timestamps, stack tags, step numbers |

### Scale

| Element | Classes |
|---------|---------|
| Hero H1 | `font-serif text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.02] tracking-tight` |
| Section H2 | `font-serif text-4xl sm:text-5xl font-medium tracking-tight text-balance` |
| Card H3 | `text-lg font-semibold tracking-tight` or `font-serif text-2xl font-medium` |
| Body | `text-base sm:text-lg leading-relaxed text-muted-foreground` |
| Section label | `text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground` |
| Mono eyebrow | `font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground` |

**Secondary headline trick:** muted serif span inside H1 e.g. `<span className="text-muted-foreground">Not slideware.</span>`

---

## Color tokens (oklch — copy exactly)

```css
:root {
  --background: oklch(0.992 0.003 95);      /* warm off-white #faf9f7-ish */
  --foreground: oklch(0.23 0.035 256);      /* deep navy text */
  --card: oklch(1 0 0);                     /* pure white cards */
  --primary: oklch(0.24 0.04 256);          /* navy buttons */
  --primary-foreground: oklch(0.985 0.003 95);
  --secondary: oklch(0.96 0.006 95);        /* section tint */
  --muted: oklch(0.965 0.005 100);
  --muted-foreground: oklch(0.52 0.02 256);
  --accent: oklch(0.95 0.02 150);           /* soft sage highlight */
  --accent-foreground: oklch(0.32 0.07 155);
  --success: oklch(0.6 0.13 155);         /* green status dot */
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.9 0.006 256);
  --ring: oklch(0.55 0.04 256);
  --radius: 0.75rem;
}
```

**Selection:** `background: accent; color: accent-foreground`

**themeColor:** `#faf9f7` · `colorScheme: light`

---

## Layout

- Max content: `max-w-6xl mx-auto px-5 sm:px-8`
- Section padding: `py-20 sm:py-28`
- Section dividers: `border-t border-border`
- Alt section background: `bg-secondary/40`
- Scroll margin: `scroll-mt-20`

---

## Signature components

### SectionLabel

```
── SERVICES   (6px line + uppercase tracking label)
```

`flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground`  
Line: `h-px w-6 bg-border`

### SiteNav (header)

- Fixed top, `z-50`
- Default: transparent border; scrolled: `border-b border-border bg-background/80 backdrop-blur-md`
- Brand: `font-semibold tracking-[0.12em]` (e.g. RADARAI)
- Nav links: `text-sm`, active underline animates `h-px w-full`
- Primary CTA: `rounded-full bg-primary px-4 py-2` + ArrowUpRight, `hover:-translate-y-0.5`

### Pills / status chips

`rounded-full border border-border bg-card px-3.5 py-1.5 text-sm`

- Live dot: ping animation on `bg-success`
- Active/selected: `bg-primary text-primary-foreground`
- Accent status (Shipped, Pro): `bg-accent text-accent-foreground`

### Cards

`rounded-2xl border border-border bg-card p-6`  
Hover (interactive): `hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.4)]`

Large feature cards: `rounded-3xl`

### Stat grid (hero-style)

`grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border`  
Cells: `bg-card px-6 py-8` — serif numbers, muted labels

### Buttons

| Type | Classes |
|------|---------|
| Primary | `rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:-translate-y-0.5` + ArrowUpRight |
| Secondary | `rounded-full border border-border bg-card px-6 py-3.5 hover:bg-secondary` |
| Ghost link | `text-sm font-medium` + ArrowUpRight micro-animation |

### Form inputs

`rounded-xl border border-border bg-background px-4 py-3`  
Focus: `focus:ring-2 focus:ring-ring/20`  
Mobile: `font-size: 1rem` (prevents iOS zoom)

### Icon boxes

`size-11 rounded-xl bg-secondary` → hover `bg-accent text-accent-foreground`

### Reveal animation

On scroll: `translate-y-6 opacity-0 blur-[2px]` → `translate-y-0 opacity-100` over `700ms ease-out`  
Stagger delays: 60–80ms increments  
Respect `prefers-reduced-motion`

### Decorative accent

Single soft blob: `absolute rounded-full bg-accent/40 blur-3xl` (top-right) — **one only**, not multi-gradient mesh

---

## Motion & interaction

- CTA hover: `-translate-y-0.5` + ArrowUpRight diagonal nudge
- Card hover: slight lift + soft shadow
- No glass blur panels, no floating primary orbs, no `gradient-mesh`

---

## Footer

`border-t border-border py-12`  
Brand tracking-wide + founder/location muted + email/social links + copyright rule

---

## RadarAI mapping

| Current RadarAI | Envoy equivalent |
|-----------------|------------------|
| `glass` / `glass-subtle` | `border border-border bg-card` |
| `gradient-mesh` + blur orbs | `bg-background` + optional single `bg-accent/40 blur-3xl` |
| Inter font | Geist Sans + Newsreader serif headlines |
| Blue primary HSL | Navy oklch primary |
| Radar lucide logo | Keep icon OR wordmark `RADARAI` tracking-wide |
| Rounded-xl buttons | **rounded-full** buttons |
| Marketing glass header | SiteNav blur-on-scroll |

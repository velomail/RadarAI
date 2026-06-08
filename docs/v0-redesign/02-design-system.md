# Design system

## Stack

- **Next.js 15** + **Tailwind CSS** + lightweight shadcn-style primitives
- **Font:** Inter (`--font-sans`)
- **Icons:** lucide-react (Radar logo icon, Search, Settings, Shield, etc.)

## Visual language

- **Professional B2C** — trustworthy job seeker tool, not neon startup
- **Glass morphism** on marketing and cards: frosted panels, soft borders, backdrop blur
- **Gradient mesh** background: subtle radial primary/accent blobs on page shells
- **Rounded corners:** `rounded-2xl` for hero cards and glass panels; `rounded-xl` for buttons and inner sections
- **Generous whitespace** on desktop; tighter but readable on mobile

## Core utilities (CSS classes)

| Class | Use |
|-------|-----|
| `glass` | Primary frosted card: `border-border/50 bg-card/70 backdrop-blur-xl shadow-lg` |
| `glass-subtle` | Pills, light panels: `border-border/40 bg-card/50 backdrop-blur-md` |
| `gradient-mesh` | Page background radial gradients |
| `text-balance` / `text-pretty` | Headlines and long copy |

## Component primitives

### Button

Variants: `default` (primary fill), `outline`, `ghost`, `danger`  
Sizes: `sm`, `default`, `lg`  
Marketing CTAs: `size="lg"`, `rounded-xl`, often `h-12`  
Mobile: full-width CTAs on landing (`w-full sm:w-auto`)

### Badge (pill)

Variants: `fresh` (red), `warm` (amber), `recent`/`stale` (muted), `success` (green), `muted`, `default` (primary)  
Use for: fit verdict HIGH/MEDIUM/LOW, posting freshness, run status, Pro badge

### Card

`rounded-lg border border-border bg-card shadow-sm` — job cards wrap with extra `glass rounded-2xl`

### Form controls

- `Input`, `Label`, `Textarea` — full width, `h-10` or `h-12` on marketing forms
- Native `<select>` for search focus — same border/ring as Input
- Checkboxes: `h-5 w-5`, label `min-h-[44px]` for touch

### PDF resume upload

- Dashed dropzone with Upload icon, or compact row showing current filename + **Update resume**
- Copy: `PDF only, up to 2MB`

## Pro locked overlay

Blurred content + centered overlay:

- Badge: `Pro` with sparkles icon, warm variant
- Lock icon + label e.g. `Role summary — Pro`
- Tint: `border-primary/30 bg-primary/5`

## Trust pattern

`DataTrustNotice` — Shield icon, title **Your data stays yours**, three bullet points about private storage, no selling data, delete from Settings.

## Motion

- Decorative blobs: `animate-float` / `animate-float-delayed` (slow drift)
- Run loading: step checklist + pulsing active step + progress bar
- Hover: cards `hover:shadow-md`, buttons `hover:opacity-90`

## Dark mode

System `prefers-color-scheme: dark` — all surfaces use CSS variables, **never hardcode `bg-white`** in new designs.

# Layout shells

## 1. Marketing shell

**Used on:** `/`, `/privacy`, `/support`

```
┌─────────────────────────────────────────────┐
│ FIXED MarketingHeader (glass nav bar)       │
│  RadarAI logo          Sign in | Sign up    │
├─────────────────────────────────────────────┤
│ gradient-mesh background + floating blobs   │
│                                             │
│              PAGE CONTENT                   │
│                                             │
├─────────────────────────────────────────────┤
│ SiteFooter — tagline + Sign up/in/Privacy   │
└─────────────────────────────────────────────┘
```

- Header: `fixed top-0 z-50`, safe-area top padding
- Main content clears header with `pt-28` + safe-area
- Footer: stacks column on mobile, row on `md+`

## 2. Auth shell

**Used on:** `/sign-in`, `/sign-up`

- Full viewport `gradient-mesh`
- Minimal top header: RadarAI logo link to `/`
- Centered column `max-w-md`
- Glass card with OAuth buttons (full width, `h-12`)
- No MarketingHeader / footer

## 3. App shell (authenticated)

**Used on:** `/dashboard/searches`, `/dashboard/settings/*`

```
┌─────────────────────────────────────────────┐
│ Optional MockModeBanner (amber strip)       │
├─────────────────────────────────────────────┤
│ HEADER border-b                             │
│  RadarAI    [Search Settings]  email Sign out│  ← desktop nav inline
│  RadarAI                    Sign out         │  ← mobile: nav in bottom bar
├─────────────────────────────────────────────┤
│ MAIN max-w-6xl centered, flex-1             │
│              page content                   │
│              pb-24 (mobile bottom nav)      │
├─────────────────────────────────────────────┤
│ MOBILE ONLY: fixed bottom tab bar           │
│     [Search icon]    [Settings icon]        │
└─────────────────────────────────────────────┘
```

- Desktop (`md+`): inline text nav Search | Settings in header
- Mobile: `MobileBottomNav` — 52px min height tabs, glass `bg-card/80 backdrop-blur-xl`
- Sign out stays in header on all breakpoints
- Email shown `lg+` only (truncated)

## 4. Centered workspace pattern

Search and settings sub-pages use a **single centered column**:

- Eyebrow pill (glass-subtle + icon + label)
- Centered H1 + subtitle
- One primary `glass rounded-2xl` card containing the form or results

## Shell do-nots

- No sidebar navigation
- No multi-column dashboard with profile grid (legacy design removed)
- No ProductShell / demo banner

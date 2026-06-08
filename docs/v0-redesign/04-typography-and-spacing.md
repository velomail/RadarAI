# Typography and spacing

## Font

**Inter** — `font-sans`, antialiased, feature settings cv02–cv11.

## Type scale

| Element | Classes |
|---------|---------|
| Marketing H1 | `text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance` |
| Page H1 (app) | `text-2xl sm:text-3xl font-bold tracking-tight` |
| Section H2 | `text-lg font-semibold` or `text-xl font-semibold tracking-tight` |
| Card job title | `text-lg font-semibold leading-tight` |
| Body | `text-sm` or `text-base leading-relaxed` |
| Muted secondary | `text-sm text-muted-foreground` or `text-xs text-muted-foreground` |
| Micro labels (job sections) | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` |
| Match score | `text-3xl font-bold tabular-nums text-primary` |
| Stat numbers (run summary) | `text-2xl font-bold tabular-nums` |
| Eyebrow pill | `text-xs font-medium tracking-wide text-muted-foreground` |

## Max widths

| Context | Width |
|---------|--------|
| Marketing content | `max-w-6xl` |
| App main shell | `max-w-6xl` |
| Search workspace card | `max-w-xl` centered |
| Settings (wide) | `max-w-2xl` |
| Auth card | `max-w-md` |
| Trust notice | `max-w-2xl` |
| Run loading steps | `max-w-md` |

## Horizontal padding

| Shell | Mobile | Desktop |
|-------|--------|---------|
| Marketing sections | `px-4` | `px-6` |
| App main | `px-4` | `px-6 md:px-8` |
| Glass cards | `p-4` | `p-6 md:p-8` |
| Auth glass card | `p-5` | `p-8` |

## Vertical rhythm

- Landing hero top: `pt-28` + safe-area inset
- App main: `py-6` mobile, `py-12` desktop
- Section gaps: `gap-6` mobile, `gap-8` desktop
- Between job cards: `gap-5`
- Form field stacks: `gap-4` or `gap-6`

## Grid patterns

- Landing features: `grid gap-6 md:grid-cols-3`
- Run stats: `grid-cols-1 sm:grid-cols-3`
- Location + min score: `grid gap-4 sm:grid-cols-2`
- Fit sub-scores: `grid-cols-2 md:grid-cols-4`
- Strengths / gaps: `grid gap-3 md:grid-cols-2`

## Icon sizes

- Logo Radar: `h-6 w-6` (header) / `h-7 w-7` (marketing)
- Inline UI icons: `h-4 w-4` or `h-5 w-5`
- Feature card icons: `h-6 w-6` in `h-12 w-12` rounded-xl primary/10 box

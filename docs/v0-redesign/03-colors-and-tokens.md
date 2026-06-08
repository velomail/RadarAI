# Colors and tokens

All colors are HSL CSS variables in `web/app/globals.css`.

## Light mode (`:root`)

| Token | HSL | Usage |
|-------|-----|--------|
| `--background` | 210 20% 98% | Page base |
| `--foreground` | 222 47% 11% | Body text |
| `--card` | 0 0% 100% / 0.7 | Glass card fill |
| `--primary` | 221 70% 38% | Brand blue, CTAs, scores |
| `--primary-foreground` | 0 0% 100% | Text on primary |
| `--muted` | 210 24% 95% | Subtle fills |
| `--muted-foreground` | 215 18% 40% | Secondary text |
| `--border` | 214 22% 88% | Dividers |
| `--ring` | 221 83% 40% | Focus ring |
| `--danger` | 0 72% 51% | Errors, fresh badge |
| `--warning` | 32 95% 44% | Warm badge, gap labels |
| `--success` | 152 60% 32% | Success badge, strengths |

## Dark mode (`prefers-color-scheme: dark`)

| Token | HSL |
|-------|-----|
| `--background` | 222 32% 8% |
| `--foreground` | 210 20% 96% |
| `--card` | 222 28% 11% / 0.75 |
| `--primary` | 213 90% 68% |
| `--primary-foreground` | 222 32% 8% |
| `--muted` | 222 22% 16% |
| `--muted-foreground` | 215 14% 62% |
| `--border` | 222 18% 22% |

## Semantic usage

| UI element | Color |
|------------|--------|
| Match score number | `text-primary`, large `text-3xl font-bold` |
| HIGH fit | `success` badge |
| MEDIUM fit | `warm` badge |
| LOW fit | `muted` badge |
| Posted &lt;6h | `fresh` (danger red) badge |
| Posted &lt;24h | `warm` badge |
| Direct apply | `success` badge |
| Error banner | `border-destructive/40 bg-destructive/10 text-destructive` |
| Daily limit hit | `border-primary/25 bg-primary/5` |
| Mock mode banner | `amber-500/10` background, amber text |
| Delete account zone | `border-destructive/40 bg-destructive/5` |

## Background treatment

Body + shells use stacked radial gradients at 20%/80%/50% positions with primary and soft blue/purple accents at low opacity (8–15%).

**Mobile:** `background-attachment: scroll` (not fixed) to avoid iOS jank.

## v0 instruction snippet

```
Use HSL tokens via Tailwind: bg-background, text-foreground, bg-card, text-primary, text-muted-foreground, border-border.
Primary blue ~hsl(221 70% 38%) light / ~hsl(213 90% 68%) dark.
Support prefers-color-scheme dark with the same token names — no hardcoded #fff cards.
```

# RadarAI — v0 redesign brief pack

Paste these files into [v0.dev](https://v0.dev) when generating or redesigning UI. **20 files** — reflects the **current production app** (OAuth, single search workspace, Adzuna, mobile bottom nav).

## How to use

### Default (current RadarAI glass theme)

1. Start with **`MASTER-PROMPT.md`** — paste as system/context in every v0 chat.
2. Add the page file you are building (e.g. `10-search-workspace.md`).
3. Reference **`02-design-system.md`** + **`03-colors-and-tokens.md`** for visual consistency.
4. Use **`V0-PROMPTS-BY-PAGE.md`** for copy-paste one-shot prompts.

### Envoy Direct theme (envoydirect.co)

1. Paste **`ENVOY-THEME-MASTER-PROMPT.md`** — full reskin to match Jesse's portfolio.
2. Optional reference: **`ENVOY-DESIGN-SYSTEM.md`** (extracted tokens + patterns).
3. Add page spec (`08`–`12`) or a block from **`V0-PROMPTS-BY-PAGE.md`** for functionality.
4. Portfolio source: `c:\Users\jesse\OneDrive\Desktop\Portfolio 1`

## File index

| File | Contents |
|------|----------|
| `01-product-and-business.md` | What RadarAI is, tiers, positioning, do-not-design |
| `02-design-system.md` | Components, patterns, glass aesthetic |
| `03-colors-and-tokens.md` | HSL variables, light/dark, badges |
| `04-typography-and-spacing.md` | Type scale, padding, max-widths |
| `05-layout-shells.md` | Marketing, app, auth shells |
| `06-mobile-responsive.md` | Breakpoints, bottom nav, touch targets |
| `07-routes-and-ia.md` | All routes and auth gates |
| `08-landing-page.md` | `/` spec |
| `09-auth-pages.md` | Sign-in / sign-up OAuth |
| `10-search-workspace.md` | `/dashboard/searches` — core product |
| `11-results-and-job-cards.md` | RunSummary, JobCard, loading |
| `12-settings-and-support.md` | Settings, search settings, support, privacy |
| `13-components-inventory.md` | Named components to reuse |
| `14-copy-and-voice.md` | Approved strings and tone |
| `15-states-and-feedback.md` | Empty, error, loading, limits |
| `MASTER-PROMPT.md` | Single block for all v0 sessions (current theme) |
| `V0-PROMPTS-BY-PAGE.md` | Ready-made prompts per screen |
| `ENVOY-DESIGN-SYSTEM.md` | envoydirect.co tokens, typography, components |
| `ENVOY-THEME-MASTER-PROMPT.md` | **Paste into v0** — RadarAI reskinned as Envoy Direct |

## Source of truth in repo

- Live UI: `web/app/`, `web/components/`
- Brand: `web/lib/brand.ts` → **RadarAI**, tagline **AI job search on demand**
- Search focus options: `web/lib/search-focus.ts`

## Outdated docs

Do **not** use `docs/archive/V0_UI_BRIEF.md` — it describes magic-link auth, `/demo`, and multi-profile dashboard that no longer exist.

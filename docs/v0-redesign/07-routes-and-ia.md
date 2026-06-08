# Routes and information architecture

## Public routes

| Route | Shell | Purpose |
|-------|-------|---------|
| `/` | Marketing | Landing page |
| `/sign-in` | Auth | OAuth sign in |
| `/sign-up` | Auth | OAuth sign up |
| `/privacy` | Marketing | Privacy policy |
| `/support` | Marketing | FAQ + contact form (UI only) |
| `/auth/callback` | — | OAuth handler (no UI) |

## Redirects (no dedicated UI)

| From | To |
|------|-----|
| `/demo`, `/demo/*` | `/sign-up` |
| `/results` | `/sign-up` |
| `/dashboard` | `/dashboard/searches` |

## Authenticated routes

| Route | Purpose |
|-------|---------|
| `/dashboard/searches` | **Primary workspace** — search form, results, past runs |
| `/dashboard/searches?run={id}` | Inline results via `RunPoller` |
| `/dashboard/settings` | Account, Telegram, Pro upsell, delete |
| `/dashboard/settings/search` | Email alerts, advanced search defaults, delete profile |

## Auth gates

- All `/dashboard/*` requires session → else `/sign-in?redirect=...`
- Unauthenticated users never see search form

## Navigation map

```
Landing (/)
  ├─ Sign up → OAuth → /dashboard/searches
  └─ Sign in → OAuth → /dashboard/searches

/dashboard/searches  ←── main hub
  ├─ ?run=id → results below form
  ├─ link → /dashboard/settings/search (advanced)
  └─ bottom nav / header → /dashboard/settings

/dashboard/settings
  └─ back / nav → /dashboard/searches
```

## Legacy routes removed (do not redesign)

- `/onboarding` (merged into searches first-time setup)
- `/dashboard/profiles/[id]` (single profile model)
- `/dashboard/runs/[id]` (results inline on searches page)
- `/demo` anonymous flow

## Search focus options

14 options in dropdown — see `01-product` or `web/lib/search-focus.ts`. Default: **Match my resume (recommended)** (`auto`).

## Key constants

- `SEARCH_PAGE` = `/dashboard/searches`
- Default location: **Canada**
- Free daily limit: **3** searches

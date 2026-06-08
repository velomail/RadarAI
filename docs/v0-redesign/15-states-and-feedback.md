# States and feedback

## Run status machine

| Status | UI |
|--------|-----|
| `pending` | RunLoading step 1 active |
| `running` | RunLoading steps advance ~4s each |
| `success` | RunSummary + JobsList |
| `error` | Red card: Run failed + error message |

## Polling

Client polls `GET /api/runs/{id}` every **2.5s** until terminal state.

## HTTP / form errors

| Situation | UI |
|-----------|-----|
| Daily limit (429) | Red banner on search card OR RunNowButton limit card with support link |
| Resume missing | Red banner on search card |
| OAuth failure | Destructive box on auth card (title + detail) |
| Run not found | RunPoller error card |
| Unauthorized run | RunPoller error card |

## Empty states

| Context | Message |
|---------|---------|
| No jobs in run | No matches surfaced this run — broaden focus/location |
| No profile yet | Full onboarding form (not empty state) |
| No past runs | Section hidden |

## Loading buttons

| Action | Pending label |
|--------|---------------|
| Search now | Starting search… |
| Save and search | Starting search… |
| OAuth | Redirecting… |
| Save settings | (native form pending) |

## Banners

### MockModeBanner (top of app)

```
Sample job data mode · Results are fixture listings, not live Adzuna jobs.
```

Amber background, wraps on mobile.

### Sample run warning (in RunSummary)

Amber band when run used mock/fixture data.

## Success feedback

- Run completion: implicit — results replace loader
- Settings save: server action redirect (no toast system today)
- Resume save: inline compact row updates on next load

## Pro locked (free tier)

Visual only — blur + overlay, not disabled navigation. User still sees structure of insights.

## Delete confirmations

- Account: must type `DELETE`
- Search profile: single click with danger button (no typed confirm)

## v0: design all states

When generating a page, include variants for:

1. Default / filled
2. Loading / pending
3. Error (at least one)
4. Empty (if applicable)
5. Mobile + desktop layout

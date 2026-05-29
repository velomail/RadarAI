# RadarAI backend process

Current backend flow for the SaaS app (`web/`) with Adzuna live fetching.

## End-to-end flow

```mermaid
flowchart TB
  subgraph user [User]
    Search[Search now on /dashboard/searches]
    Poll[RunPoller polls status]
  end

  subgraph entry [Server entrypoints]
    SearchAction[runJobSearch / createOnboardingProfile]
    ManualRun[POST /api/profiles/id/run]
    CronRun[GET /api/cron/radar]
  end

  subgraph prep [Run setup]
    CreateRun[Insert runs row status pending]
    AfterCall[Run engine via after()]
  end

  subgraph engine [Engine pipeline]
    ResolveQ[resolveEngineQueries]
    Fetch[fetchSources Adzuna]
    Seen[loadSeenAndFilter]
    Clean[cleanJobs]
    Prioritize[prioritizeJobsForScoring]
    Score[scoreWithOpenAI]
    Post[postProcessScores]
    Persist[persistRun]
    Notify[dispatchNotifications optional]
  end

  Search --> SearchAction --> CreateRun
  ManualRun --> CreateRun
  CronRun --> CreateRun
  CreateRun --> AfterCall --> ResolveQ --> Fetch --> Seen --> Clean --> Prioritize --> Score --> Post --> Persist --> Notify
  Poll --> RunsAPI[GET /api/runs/id] --> Done[Render jobs]
  Persist --> RunsAPI
```

## Main backend files

- `web/app/(app)/dashboard/searches/actions.ts`
- `web/app/(app)/dashboard/searches/onboarding-actions.ts`
- `web/app/api/profiles/[id]/run/route.ts`
- `web/app/api/runs/[id]/route.ts`
- `web/app/api/cron/radar/route.ts`
- `web/lib/engine/run-engine.ts`
- `web/lib/engine/fetch-sources.ts`
- `web/lib/engine/score-with-openai.ts`
- `web/lib/engine/persist-run.ts`
- `web/lib/engine/dispatch-notifications.ts`

## Live source assumptions

- **Live:** Adzuna (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY`)
- **Local mock:** `ENGINE_MODE=mock` in `.env.local` only — not on Vercel production

## Legacy URL redirects

Old bookmarks (`/dashboard`, `/dashboard/runs/:id`, `/onboarding`, etc.) redirect to `/dashboard/searches` via `web/next.config.ts`.

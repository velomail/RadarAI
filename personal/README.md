# Personal n8n job funnel

Single-user workflow: local n8n in Docker, file-based dedupe, Telegram digest.

**Not used by the SaaS app.** The Vercel app lives in `../web/` and runs its own engine in `../web/lib/engine/`.

## Quick start

```bash
# From repo root
cp personal/.env.example personal/.env   # fill RapidAPI, n8n API, Telegram
npm run personal:up                    # starts n8n on http://localhost:5678
# In n8n UI: create OpenAI + Telegram credentials, copy their IDs into personal/.env
npm run personal:deploy              # pushes workflow from personal/scripts/*.js
```

Put your resume PDF in `personal/data/` (default path in the workflow:
`Jesse_Hiles_Sales_Resume-v2.pdf` — edit `personal/scripts/deploy-workflow.mjs`
if yours is named differently).

## Layout

```
personal/
  docker-compose.yml    n8n container (mounts repo root as /home/node/.n8n-files)
  .env.example          secrets for this stack only
  scripts/              n8n Code-node sources + deploy-workflow.mjs
  workflows/            generated JSON (gitignored)
  data/                 resume PDF, seen_jobs.json, runs.log (runtime, gitignored)
```

## Docs

- `../docs/personal/` — legacy setup guides for this funnel
- `../docs/openai-system-prompt.txt` — scoring prompt (shared reference; SaaS inlines its own in `web/lib/engine/score-with-openai.ts`)

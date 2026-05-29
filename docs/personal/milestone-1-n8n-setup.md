# Milestone 1 — JSearch fetch + sanitization

## Prerequisites

1. Copy `env.example` → `.env` and set `RAPIDAPI_KEY`.
2. Restart n8n: `docker compose down && docker compose up -d`
3. Open http://localhost:5678

## Workflow nodes (manual test workflow)

Create a workflow named **Job Funnel — M1 Test** with these nodes:

### 1. Manual Trigger

For testing only. Replace with **Schedule Trigger** (8:00, `America/Toronto`) in the final workflow.

### 2. HTTP Request — `JSearch Fetch`

| Setting | Value |
|--------|--------|
| Method | GET |
| URL | `https://jsearch.p.rapidapi.com/search` |
| Authentication | None (use headers below) |

**Query parameters:**

| Name | Value |
|------|--------|
| `query` | `(SDR OR BDR OR "Inside Sales" OR "Account Manager") remote OR Orillia OR Barrie Ontario Canada` |
| `page` | `1` |
| `num_pages` | `2` |
| `country` | `ca` |
| `language` | `en` |
| `date_posted` | `today` |

**Headers:**

| Name | Value |
|------|--------|
| `X-RapidAPI-Key` | `{{ $env.RAPIDAPI_KEY }}` |
| `X-RapidAPI-Host` | `jsearch.p.rapidapi.com` |

**Options → Response:** JSON

### 3. Code — `Clean Jobs`

- Language: JavaScript
- Mode: **Run Once for All Items**
- Paste the block from `scripts/clean_jobs.js` between `N8N COPY START` / `N8N COPY END`

### 4. (Optional) Code — `Preview Count`

```javascript
const items = $input.all();
return [{
  json: {
    count: items.length,
    sample: items.slice(0, 3).map((i) => ({
      title: i.json.job_title,
      company: i.json.company,
      location: i.json.location,
    })),
  },
}];
```

## Success criteria

- HTTP node returns `"status": "OK"` and a `data` array.
- Code node outputs **one item per job** with fields: `job_id`, `apply_url`, `company`, `job_title`, `description_clean`, `location`, `is_remote`.
- Duplicate `job_id` / apply URLs within the same run are removed.

## API usage note

`num_pages=2` ≈ up to 20 jobs per run. Increase only if you need more volume (counts against RapidAPI quota).

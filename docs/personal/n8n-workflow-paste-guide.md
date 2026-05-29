# n8n paste guide — fix Telegram placeholder HTML

## Rewire (delete Merge from the job path)

```
Schedule Trigger
  ├─→ Read/Write Files from Disk → Extract from File   (resume branch)
  └─→ HTTP Request → Code: Clean Jobs → Code: Attach Resume
                                        → Message a model
                                        → Code: Parse AI to HTML
                                        → Code: HTML to Telegram Binary
                                        → Send a document
```

**Disconnect:** Merge node from between HTTP and Clean Jobs.

---

## HTTP Request — update query params

| Name | Value |
|------|--------|
| `query` | `(SDR OR BDR OR "Inside Sales" OR "Account Manager") remote OR Orillia OR Barrie Ontario Canada` |
| `page` | `1` |
| `num_pages` | `2` |
| `country` | `ca` |
| `language` | `en` |
| `date_posted` | `today` |

Header `X-RapidAPI-Key`: `{{ $env.RAPIDAPI_KEY }}`

---

## Code nodes (paste from `scripts/`)

| Node name (suggested) | File | Mode |
|----------------------|------|------|
| Clean Jobs | `scripts/clean_jobs.js` | Run Once for All Items |
| Attach Resume | `scripts/attach_resume.js` | Run Once for All Items |
| Parse AI to HTML | `scripts/parse_ai_to_html.js` | Run Once for All Items |
| HTML to Telegram Binary | `scripts/html_to_telegram_binary.js` | Run Once for All Items |

**Important:** PDF extract node must be named **`Extract from File`** (or edit `RESUME_NODE` in `attach_resume.js`).

---

## Message a model (OpenAI)

### System message

Paste entire contents of `docs/openai-system-prompt.txt`.

### User message

Turn on **Expression** and paste exactly:

```
={{ $json.ai_user_prompt }}
```

Do **not** duplicate the system prompt in the user field.

---

## Telegram — Send a document

- **Binary Property:** `data`
- **Chat ID:** your chat id (unchanged)

---

## Test order

1. Run **HTTP Request** only → `status: OK`, `data` array populated.
2. Run through **Clean Jobs** → multiple items with `job_title`, `description_clean`.
3. Run through **Attach Resume** → each item has `ai_user_prompt`.
4. Run **Message a model** → output contains JSON with real `job_title` / `match_score`.
5. Full run → Telegram HTML shows real companies (not "Data Disconnect Error").

---

## Optional: Discord later

Same HTML or a short text summary from `Parse AI to HTML` output field `jobs`.

/**
 * Read seen_jobs.json and filter incoming fetch output to exclude jobs
 * we have already reported within the last 14 days.
 *
 * Receives one item with json.data = array of raw jobs.
 * Emits one item with json.data filtered + json.seen_filtered / seen_known counters.
 *
 * n8n Code node: JavaScript, "Run Once for All Items".
 * Place AFTER "Fetch All Sources", BEFORE "Clean Jobs".
 *
 * Requires NODE_FUNCTION_ALLOW_BUILTIN=fs,path in the n8n container.
 */

// === N8N COPY START ===

const fs = require('fs');

const SEEN_FILE = '/home/node/.n8n-files/personal/data/seen_jobs.json';
const WINDOW_DAYS = 14;

function loadSeen() {
  try {
    if (!fs.existsSync(SEEN_FILE)) return {};
    const raw = fs.readFileSync(SEEN_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function canonicalKey(job) {
  if (job && job.job_id) return `id:${job.job_id}`;
  const url = (job && (job.job_apply_link || job.apply_link)) || '';
  if (!url) return '';
  return `url:${String(url)
    .trim()
    .replace(/#.*$/, '')
    .replace(/[?&]utm_[^=&]+=[^&]*/gi, '')
    .replace(/[?&]$/, '')
    .toLowerCase()}`;
}

const cutoffMs = Date.now() - WINDOW_DAYS * 86400000;
const seen = loadSeen();
const seenKeys = new Set();
for (const [key, entry] of Object.entries(seen)) {
  const ts = entry && entry.last_seen ? new Date(entry.last_seen).getTime() : 0;
  if (ts >= cutoffMs) seenKeys.add(key);
}

const input = $input.first()?.json ?? {};
const incoming = Array.isArray(input.data) ? input.data : [];

const filtered = [];
let droppedCount = 0;
for (const job of incoming) {
  const key = canonicalKey(job);
  if (key && seenKeys.has(key)) {
    droppedCount++;
    continue;
  }
  filtered.push(job);
}

return [
  {
    json: {
      ...input,
      data: filtered,
      seen_known: seenKeys.size,
      seen_filtered: droppedCount,
      seen_window_days: WINDOW_DAYS,
    },
  },
];

// === N8N COPY END ===

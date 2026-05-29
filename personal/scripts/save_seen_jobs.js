/**
 * Persist every scored job key to data/seen_jobs.json so we do not
 * re-process the same role for 14 days. Also appends a single-line
 * run summary to data/runs.log for observability.
 *
 * n8n Code node: JavaScript, "Run Once for All Items".
 * Place AFTER "Parse AI to HTML", BEFORE "HTML to Telegram Binary".
 *
 * Requires NODE_FUNCTION_ALLOW_BUILTIN=fs,path in the n8n container.
 */

// === N8N COPY START ===

const fs = require('fs');
const path = require('path');

const DATA_DIR = '/home/node/.n8n-files/personal/data';
const SEEN_FILE = path.join(DATA_DIR, 'seen_jobs.json');
const LOG_FILE = path.join(DATA_DIR, 'runs.log');
const WINDOW_DAYS = 14;

function loadSeen() {
  try {
    if (!fs.existsSync(SEEN_FILE)) return {};
    const parsed = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function ensureDir(file) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  } catch {}
}

const items = $input.all();
const item = items[0] ? items[0].json || {} : {};

const scoredKeys = Array.isArray(item.all_scored_keys) ? item.all_scored_keys : [];
const nowIso = new Date().toISOString();
const cutoffMs = Date.now() - WINDOW_DAYS * 86400000;

const seen = loadSeen();
for (const key of scoredKeys) {
  if (!key) continue;
  if (seen[key]) {
    seen[key].last_seen = nowIso;
  } else {
    seen[key] = { first_seen: nowIso, last_seen: nowIso };
  }
}

for (const [key, entry] of Object.entries(seen)) {
  const ts = entry && entry.last_seen ? new Date(entry.last_seen).getTime() : 0;
  if (ts < cutoffMs) delete seen[key];
}

try {
  ensureDir(SEEN_FILE);
  fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2));
} catch (err) {
  // file write is best-effort; never break the workflow
  console.log('save_seen_jobs: failed to write seen file', err && err.message);
}

let fetchSummary = {};
try {
  fetchSummary = $('Fetch All Sources').first().json || {};
} catch {
  try {
    fetchSummary = $('Fetch JSearch Jobs').first().json || {};
  } catch {}
}

try {
  ensureDir(LOG_FILE);
  const logLine = JSON.stringify({
    ts: nowIso,
    scanned: item.parsed_count || 0,
    qualified: item.qualified_count || 0,
    reported: item.match_count || 0,
    floored: !!item.floored,
    sources_breakdown: fetchSummary.sources_breakdown || {},
    raw_counts: fetchSummary.raw_counts || [],
    widened: !!fetchSummary.widened,
    seen_known: fetchSummary.seen_known || 0,
    seen_filtered: fetchSummary.seen_filtered || 0,
    seen_total: Object.keys(seen).length,
  });
  fs.appendFileSync(LOG_FILE, logLine + '\n');
} catch (err) {
  console.log('save_seen_jobs: failed to append run log', err && err.message);
}

return items;

// === N8N COPY END ===

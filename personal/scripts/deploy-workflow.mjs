/**
 * Deploy / update the Job Funnel workflow via n8n REST API.
 * Reads N8N_API_URL and N8N_API_KEY from personal/.env
 *
 * Usage: npm run personal:deploy   (from repo root)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const personalRoot = path.join(__dirname, '..');
const root = path.join(personalRoot, '..');

function loadEnv() {
  // Personal funnel env lives in personal/.env (separated from the SaaS root .env).
  const envPath = path.join(personalRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(
      'Missing personal/.env — copy personal/.env.example to personal/.env and fill in N8N_API_URL + N8N_API_KEY.',
    );
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function extractN8nCode(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const start = src.indexOf('// === N8N COPY START ===');
  const end = src.indexOf('// === N8N COPY END ===');
  if (start === -1 || end === -1) {
    throw new Error(`Copy markers missing in ${filePath}`);
  }
  return src.slice(start + '// === N8N COPY START ===\n'.length, end).trim();
}

function nodeId() {
  return randomUUID();
}

function codeNode(name, jsCode, position) {
  return {
    parameters: { mode: 'runOnceForAllItems', jsCode },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    id: nodeId(),
    name,
  };
}

function buildWorkflow({ scripts, systemPrompt, credentialIds, workflowId }) {
  const ids = {
    schedule: nodeId(),
    readFile: nodeId(),
    extract: nodeId(),
    fetchSources: nodeId(),
    loadSeen: nodeId(),
    clean: nodeId(),
    attach: nodeId(),
    openai: nodeId(),
    parseHtml: nodeId(),
    saveSeen: nodeId(),
    toBinary: nodeId(),
    telegram: nodeId(),
  };

  const nodes = [
    {
      parameters: {
        rule: {
          interval: [
            { triggerAtHour: 7 },
            { triggerAtHour: 12 },
            { triggerAtHour: 17 },
          ],
        },
      },
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.3,
      position: [-800, -400],
      id: ids.schedule,
      name: 'Schedule Trigger',
    },
    {
      parameters: {
        fileSelector: '/home/node/.n8n-files/personal/data/Jesse_Hiles_Sales_Resume-v2.pdf',
        options: {},
      },
      type: 'n8n-nodes-base.readWriteFile',
      typeVersion: 1.1,
      position: [-800, -560],
      id: ids.readFile,
      name: 'Read/Write Files from Disk',
    },
    {
      parameters: { operation: 'pdf', options: {} },
      type: 'n8n-nodes-base.extractFromFile',
      typeVersion: 1.1,
      position: [-560, -560],
      id: ids.extract,
      name: 'Extract from File',
    },
    codeNode('Fetch All Sources', scripts.fetchSources, [-560, -400]),
    codeNode('Load Seen Jobs', scripts.loadSeen, [-400, -400]),
    codeNode('Clean Jobs', scripts.clean, [-240, -400]),
    codeNode('Attach Resume', scripts.attach, [-80, -400]),
    {
      parameters: {
        modelId: {
          __rl: true,
          value: 'gpt-4o-mini',
          mode: 'list',
          cachedResultName: 'GPT-4O-MINI',
        },
        responses: {
          values: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: '={{ $json.ai_user_prompt }}' },
          ],
        },
        builtInTools: {},
        options: {},
      },
      type: '@n8n/n8n-nodes-langchain.openAi',
      typeVersion: 2.3,
      position: [160, -400],
      id: ids.openai,
      name: 'Message a model',
      credentials: {
        openAiApi: {
          id: credentialIds.openAi,
          name: 'OpenAI account',
        },
      },
    },
    codeNode('Parse AI to HTML', scripts.parseHtml, [400, -400]),
    codeNode('Save Seen Jobs', scripts.saveSeen, [560, -400]),
    codeNode('HTML to Telegram Binary', scripts.toBinary, [720, -400]),
    {
      parameters: {
        resource: 'message',
        operation: 'sendDocument',
        chatId: credentialIds.telegramChatId,
        binaryData: true,
        binaryPropertyName: 'data',
        additionalFields: {
          fileName: '={{ $json.fileName }}',
          caption: '={{ $json.caption }}',
        },
      },
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [960, -400],
      id: ids.telegram,
      name: 'Send a document',
      credentials: {
        telegramApi: {
          id: credentialIds.telegram,
          name: 'Telegram account',
        },
      },
    },
  ];

  // Fix ids on code nodes (codeNode used random ids — remap)
  const findNode = (name) => nodes.find((n) => n.name === name);
  findNode('Fetch All Sources').id = ids.fetchSources;
  findNode('Load Seen Jobs').id = ids.loadSeen;
  findNode('Clean Jobs').id = ids.clean;
  findNode('Attach Resume').id = ids.attach;
  findNode('Parse AI to HTML').id = ids.parseHtml;
  findNode('Save Seen Jobs').id = ids.saveSeen;
  findNode('HTML to Telegram Binary').id = ids.toBinary;

  const connections = {
    'Schedule Trigger': {
      main: [
        [
          { node: 'Read/Write Files from Disk', type: 'main', index: 0 },
          { node: 'Fetch All Sources', type: 'main', index: 0 },
        ],
      ],
    },
    'Read/Write Files from Disk': {
      main: [[{ node: 'Extract from File', type: 'main', index: 0 }]],
    },
    'Fetch All Sources': {
      main: [[{ node: 'Load Seen Jobs', type: 'main', index: 0 }]],
    },
    'Load Seen Jobs': {
      main: [[{ node: 'Clean Jobs', type: 'main', index: 0 }]],
    },
    'Clean Jobs': {
      main: [[{ node: 'Attach Resume', type: 'main', index: 0 }]],
    },
    'Attach Resume': {
      main: [[{ node: 'Message a model', type: 'main', index: 0 }]],
    },
    'Message a model': {
      main: [[{ node: 'Parse AI to HTML', type: 'main', index: 0 }]],
    },
    'Parse AI to HTML': {
      main: [[{ node: 'Save Seen Jobs', type: 'main', index: 0 }]],
    },
    'Save Seen Jobs': {
      main: [[{ node: 'HTML to Telegram Binary', type: 'main', index: 0 }]],
    },
    'HTML to Telegram Binary': {
      main: [[{ node: 'Send a document', type: 'main', index: 0 }]],
    },
  };

  return {
    id: workflowId,
    name: 'Job Funnel — Daily',
    nodes,
    connections,
    settings: { executionOrder: 'v1' },
  };
}

async function main() {
  const env = loadEnv();
  const baseUrl = env.N8N_API_URL;
  const apiKey = env.N8N_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('.env must define N8N_API_URL and N8N_API_KEY');
  }

  const workflowId = env.N8N_WORKFLOW_ID || 'DyFTIrAemK82IUZe';
  const credentialIds = {
    openAi: env.N8N_OPENAI_CREDENTIAL_ID || 'VmI27x3hfRK7CewY',
    telegram: env.N8N_TELEGRAM_CREDENTIAL_ID || 'n40FKiPWbNxfftL2',
    telegramChatId: env.TELEGRAM_CHAT_ID || '8591792625',
  };

  const scripts = {
    fetchSources: extractN8nCode(path.join(__dirname, 'fetch_sources.js')),
    loadSeen: extractN8nCode(path.join(__dirname, 'load_seen_jobs.js')),
    clean: extractN8nCode(path.join(__dirname, 'clean_jobs.js')),
    attach: extractN8nCode(path.join(__dirname, 'attach_resume.js')),
    parseHtml: extractN8nCode(path.join(__dirname, 'parse_ai_to_html.js')),
    saveSeen: extractN8nCode(path.join(__dirname, 'save_seen_jobs.js')),
    toBinary: extractN8nCode(path.join(__dirname, 'html_to_telegram_binary.js')),
  };

  const systemPrompt = fs.readFileSync(
    path.join(root, 'docs', 'openai-system-prompt.txt'),
    'utf8',
  );

  const payload = buildWorkflow({
    scripts,
    systemPrompt,
    credentialIds,
    workflowId,
  });

  const outPath = path.join(personalRoot, 'workflows', 'job-funnel.generated.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify([payload], null, 2));

  const { id: _id, ...updateBody } = payload;
  const url = new URL(`workflows/${workflowId}`, baseUrl).toString();

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(updateBody),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('n8n API error', res.status, url, text);
    process.exit(1);
  }

  const saved = JSON.parse(text);
  console.log('Workflow updated:', saved.name || payload.name);
  console.log('ID:', saved.id || workflowId);
  console.log('Nodes:', payload.nodes.length);
  console.log('Saved copy:', outPath);
  console.log('Open: http://localhost:5678/workflow/' + (saved.id || workflowId));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

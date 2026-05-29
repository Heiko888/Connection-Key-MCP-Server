/**
 * Knowledge & Templates Agent
 * Route: POST /agent/knowledge   (eingebunden in mcp-gateway.js)
 *
 * Liest den kompletten Human-Design-Knowledge und alle Reading-Templates
 * programmatisch aus und stellt sie über vier Aktionen bereit:
 *
 *   action: "list"   → Katalog aller Templates + Knowledge (Name, Kategorie, Größe)
 *   action: "get"    → Roh-Inhalt einer Datei  { kind: "template"|"knowledge", name }
 *   action: "search" → Volltextsuche über alles { query }  → Treffer + Snippets
 *   action: "ask"    → Claude beantwortet eine Frage, grounded auf den
 *                      relevantesten Knowledge-/Template-Dateien { message }
 *
 * Pfad-Auflösung (erste existierende gewinnt):
 *   ENV TEMPLATES_PATH / KNOWLEDGE_PATH
 *   /app/templates       /app/knowledge          (Container)
 *   ../reading-worker/templates  ../reading-worker/knowledge   (Repo/Dev)
 *
 * Standalone lauffähig:  node production/agent-knowledge.js [--port 7050]
 *   CLI:  node production/agent-knowledge.js list
 *         node production/agent-knowledge.js get knowledge types-detailed
 *         node production/agent-knowledge.js search "emotionale autorität"
 */

const fs = require('fs');
const path = require('path');

const MODEL = 'claude-sonnet-4-5';

// --------------------------------------------------------------------------
// Pfad-Auflösung
// --------------------------------------------------------------------------
function firstExisting(candidates) {
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

const TEMPLATES_DIR = firstExisting([
  process.env.TEMPLATES_PATH,
  '/app/templates',
  path.join(__dirname, '..', 'reading-worker', 'templates'),
  path.join(__dirname, 'templates'),
]);

const KNOWLEDGE_DIR = firstExisting([
  process.env.KNOWLEDGE_PATH,
  '/app/knowledge',
  path.join(__dirname, '..', 'reading-worker', 'knowledge'),
  path.join(__dirname, 'knowledge'),
]);

// --------------------------------------------------------------------------
// Laden (rekursiv, inkl. Unterordner wie knowledge/brandbook)
// --------------------------------------------------------------------------
function loadDir(baseDir) {
  const out = {};
  if (!baseDir || !fs.existsSync(baseDir)) return out;

  const walk = (dir, prefix = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, prefix ? `${prefix}/${entry.name}` : entry.name);
        continue;
      }
      if (!/\.(txt|md)$/i.test(entry.name)) continue;
      const key = (prefix ? `${prefix}/` : '') + entry.name.replace(/\.(txt|md)$/i, '');
      try {
        out[key] = fs.readFileSync(full, 'utf8');
      } catch (err) {
        console.warn(`[knowledge-agent] Konnte ${full} nicht lesen: ${err.message}`);
      }
    }
  };

  walk(baseDir);
  return out;
}

// Beim Modul-Start einmalig laden (Cache im Speicher)
const templates = loadDir(TEMPLATES_DIR);
const knowledge = loadDir(KNOWLEDGE_DIR);

console.log(`[knowledge-agent] Templates geladen: ${Object.keys(templates).length} (${TEMPLATES_DIR || 'kein Pfad'})`);
console.log(`[knowledge-agent] Knowledge geladen: ${Object.keys(knowledge).length} (${KNOWLEDGE_DIR || 'kein Pfad'})`);

// --------------------------------------------------------------------------
// Kategorie-Ableitung (für den Katalog)
// --------------------------------------------------------------------------
function templateCategory(name) {
  const n = name.toLowerCase();
  if (n.startsWith('channel-')) return 'channel-post';
  if (n.startsWith('penta')) return 'penta';
  if (n.startsWith('connection') || n === 'relationship' || n === 'compatibility' || n === 'phasen-reading') return 'connection';
  if (n.includes('validate') || n.includes('correct')) return 'qa';
  if (n.includes('transit') || n.includes('tagesimpuls') || n.includes('jahres')) return 'timing';
  if (n.includes('reflection') || n === 'channel-analysis') return 'analysis';
  if (['basic', 'detailed', 'depth-analysis', 'single', 'default'].includes(n)) return 'core';
  return 'special';
}

function knowledgeCategory(name) {
  const n = name.toLowerCase();
  if (n.startsWith('brandbook/') || n.includes('brandbook') || n.includes('reel')) return 'brand';
  if (n.includes('crisis')) return 'support';
  if (n.includes('penta')) return 'penta';
  if (n.includes('authority')) return 'authority';
  if (n.includes('type')) return 'types';
  if (n.includes('profile')) return 'profiles';
  if (n.includes('center') || n.includes('channel') || n.includes('gate')) return 'centers-channels-gates';
  if (n.includes('arrow') || n.includes('variable')) return 'variables';
  if (n.includes('basics') || n.includes('statistics') || n.includes('regeln') || n.includes('strategy')) return 'basics';
  return 'thematic';
}

function statsFor(content) {
  return {
    lines: content.split('\n').length,
    chars: content.length,
  };
}

// --------------------------------------------------------------------------
// Aktionen
// --------------------------------------------------------------------------
function listCatalog() {
  const mapItems = (store, catFn) =>
    Object.keys(store)
      .sort()
      .map((name) => ({ name, category: catFn(name), ...statsFor(store[name]) }));

  return {
    templates: mapItems(templates, templateCategory),
    knowledge: mapItems(knowledge, knowledgeCategory),
    counts: {
      templates: Object.keys(templates).length,
      knowledge: Object.keys(knowledge).length,
    },
    paths: { templates: TEMPLATES_DIR, knowledge: KNOWLEDGE_DIR },
  };
}

function getItem(kind, name) {
  if (!name) return { error: 'name is required' };
  const store = kind === 'template' ? templates : kind === 'knowledge' ? knowledge : null;
  if (!store) return { error: "kind must be 'template' or 'knowledge'" };
  if (!(name in store)) {
    // toleranter Lookup: Endung/Pfad ignorieren
    const stripped = name.replace(/\.(txt|md)$/i, '');
    const hit = Object.keys(store).find(
      (k) => k === stripped || k.endsWith(`/${stripped}`) || k.toLowerCase() === stripped.toLowerCase()
    );
    if (!hit) return { error: `'${name}' nicht gefunden`, available: Object.keys(store) };
    return { kind, name: hit, ...statsFor(store[hit]), content: store[hit] };
  }
  return { kind, name, ...statsFor(store[name]), content: store[name] };
}

const STOPWORDS = new Set([
  // DE
  'der', 'die', 'das', 'und', 'oder', 'ist', 'sind', 'war', 'was', 'wie', 'wer', 'wann',
  'ein', 'eine', 'einen', 'einem', 'einer', 'den', 'dem', 'des', 'mit', 'für', 'von', 'auf', 'aus',
  'bei', 'zum', 'zur', 'als', 'auch', 'nur', 'nicht', 'man', 'mir', 'mich', 'dir', 'dich', 'sich',
  'ich', 'sie', 'wir', 'ihr', 'mein', 'dein', 'sein', 'hat', 'habe', 'haben',
  'kann', 'soll', 'will', 'mehr', 'sehr', 'über', 'unter', 'gibt', 'geht', 'bitte', 'mal',
  // EN
  'the', 'and', 'for', 'with', 'what', 'how', 'who', 'why', 'are', 'this', 'that', 'from',
  'about', 'can', 'does', 'has', 'have', 'into', 'please', 'tell', 'show', 'give',
]);

function tokenize(q) {
  return (q || '')
    .toLowerCase()
    .split(/[^a-z0-9äöüß]+/i)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function scoreContent(content, terms) {
  const lc = content.toLowerCase();
  let score = 0;
  for (const t of terms) {
    let idx = lc.indexOf(t);
    while (idx !== -1) {
      score += 1;
      idx = lc.indexOf(t, idx + t.length);
    }
  }
  return score;
}

function snippet(content, terms, len = 220) {
  const lc = content.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    const i = lc.indexOf(t);
    if (i !== -1 && (pos === -1 || i < pos)) pos = i;
  }
  if (pos === -1) pos = 0;
  const start = Math.max(0, pos - 60);
  return (start > 0 ? '…' : '') + content.slice(start, start + len).replace(/\s+/g, ' ').trim() + '…';
}

function search(query, limit = 10) {
  const terms = tokenize(query);
  if (!terms.length) return { error: 'query is required (min. 3 Zeichen)' };

  const collect = (store, kind, catFn) =>
    Object.keys(store)
      .map((name) => ({ kind, name, category: catFn(name), score: scoreContent(store[name], terms) }))
      .filter((r) => r.score > 0)
      .map((r) => ({ ...r, snippet: snippet(store[r.name], terms) }));

  const results = [
    ...collect(knowledge, 'knowledge', knowledgeCategory),
    ...collect(templates, 'template', templateCategory),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { query, terms, total: results.length, results };
}

// Top-N passende Dateien als Kontext für den LLM zusammenstellen
function buildContext(query, maxFiles = 4, maxCharsPerFile = 4000) {
  const terms = tokenize(query);
  const scored = [
    ...Object.keys(knowledge).map((name) => ({ store: knowledge, kind: 'knowledge', name, score: scoreContent(knowledge[name], terms) })),
    ...Object.keys(templates).map((name) => ({ store: templates, kind: 'template', name, score: scoreContent(templates[name], terms) })),
  ]
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles);

  const used = scored.map((r) => `${r.kind}:${r.name}`);
  const blocks = scored.map(
    (r) => `### [${r.kind}] ${r.name}\n${r.store[r.name].slice(0, maxCharsPerFile)}`
  );
  return { context: blocks.join('\n\n---\n\n'), sources: used };
}

const ASK_SYSTEM_PROMPT = `Du bist der Knowledge-Bibliothekar von "The Connection Key" – einer Human-Design-Plattform.
Du beantwortest Fragen ausschließlich auf Basis des mitgelieferten Knowledge- und Template-Kontexts.

Regeln:
- Stütze dich AUSSCHLIESSLICH auf den bereitgestellten Kontext. Erfinde nichts dazu.
- Wenn der Kontext die Frage nicht abdeckt, sage das klar und nenne, was vorhanden ist.
- Zitiere am Ende die verwendeten Quellen (Dateinamen aus dem Kontext).
- Präzise, sachlich, keine Esoterik-Floskeln.

Sprache: Deutsch.`;

async function ask(anthropic, message) {
  if (!message) return { error: 'message is required' };

  const { context, sources } = buildContext(message);

  if (!context) {
    return {
      response: 'Zu dieser Frage finde ich keinen passenden Knowledge- oder Template-Inhalt. Nutze action "list", um zu sehen, was verfügbar ist.',
      sources: [],
      tokens: 0,
      model: 'no-match',
    };
  }

  if (!anthropic || !process.env.ANTHROPIC_API_KEY) {
    return {
      response: `[KNOWLEDGE - Placeholder] ANTHROPIC_API_KEY nicht konfiguriert. Relevante Quellen zu deiner Frage: ${sources.join(', ')}.`,
      sources,
      tokens: 0,
      model: 'placeholder',
    };
  }

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: ASK_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `KONTEXT (Knowledge & Templates):\n\n${context}\n\n---\n\nFRAGE: ${message}`,
      },
    ],
  });

  return {
    response: completion.content[0].text,
    sources,
    tokens: completion.usage.input_tokens + completion.usage.output_tokens,
    model: MODEL,
  };
}

// --------------------------------------------------------------------------
// HTTP-Handler (für mcp-gateway.js)
// --------------------------------------------------------------------------
function makeHandler(anthropic) {
  return async function handleKnowledgeAgent(req, res) {
    const startTime = Date.now();
    const action = (req.body?.action || (req.body?.message ? 'ask' : 'list')).toLowerCase();
    try {
      let data;
      switch (action) {
        case 'list':
          data = listCatalog();
          break;
        case 'get':
          data = getItem(req.body.kind, req.body.name);
          break;
        case 'search':
          data = search(req.body.query, req.body.limit);
          break;
        case 'ask':
          data = await ask(anthropic, req.body.message);
          break;
        default:
          return res.status(400).json({ success: false, agent: 'knowledge', error: `Unbekannte action '${action}'. Erlaubt: list, get, search, ask.` });
      }
      if (data && data.error) {
        return res.status(400).json({ success: false, agent: 'knowledge', action, ...data });
      }
      return res.json({ success: true, agent: 'knowledge', action, ...data, runtimeMs: Date.now() - startTime, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[Agent knowledge] Fehler:', error.message);
      return res.status(500).json({ success: false, agent: 'knowledge', action, error: error.message, timestamp: new Date().toISOString() });
    }
  };
}

// Default-Handler nutzt den ANTHROPIC_API_KEY aus der Umgebung
let _defaultAnthropic = null;
function getDefaultAnthropic() {
  if (_defaultAnthropic === null && process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      _defaultAnthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } catch (_) {
      _defaultAnthropic = false; // SDK nicht verfügbar
    }
  }
  return _defaultAnthropic || null;
}

const handleKnowledgeAgent = (req, res) => makeHandler(getDefaultAnthropic())(req, res);

module.exports = {
  handleKnowledgeAgent,
  makeHandler,
  // direkt nutzbare Programmier-API:
  listCatalog,
  getItem,
  search,
  ask,
};

// --------------------------------------------------------------------------
// Standalone-Modus:  node production/agent-knowledge.js [list|get|search|--port N]
// --------------------------------------------------------------------------
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === 'list') {
    const c = listCatalog();
    console.log(JSON.stringify(c, null, 2));
    process.exit(0);
  } else if (cmd === 'get') {
    console.log(JSON.stringify(getItem(args[1], args[2]), null, 2));
    process.exit(0);
  } else if (cmd === 'search') {
    console.log(JSON.stringify(search(args.slice(1).join(' ')), null, 2));
    process.exit(0);
  } else {
    // HTTP-Server-Modus
    const portIdx = args.indexOf('--port');
    const PORT = portIdx !== -1 ? Number(args[portIdx + 1]) : Number(process.env.KNOWLEDGE_AGENT_PORT || 7050);
    const express = require('express');
    const app = express();
    app.use(express.json({ limit: '1mb' }));
    app.get('/health', (req, res) =>
      res.json({ status: 'ok', service: 'knowledge-agent', templates: Object.keys(templates).length, knowledge: Object.keys(knowledge).length })
    );
    app.post('/agent/knowledge', handleKnowledgeAgent);
    app.listen(PORT, () => {
      console.log(`📚 Knowledge-Agent (standalone) läuft auf Port ${PORT}`);
      console.log(`   POST http://localhost:${PORT}/agent/knowledge   body: { "action": "list" | "get" | "search" | "ask", ... }`);
    });
  }
}

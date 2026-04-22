/**
 * facts-builder.js — Baustein 4 (Plan v2.0)
 *
 * Generiert den deterministischen deutschsprachigen Fakten-Block, der dem
 * Language Model als einzige Wahrheitsquelle übergeben wird. Ziel: das Model
 * darf paraphrasieren und erklären, aber keine Fakten hinzufügen oder ändern.
 *
 * Ohne Feature-Flag (READING_STRICT_MODE=false) ist der Block leer und
 * das alte Verhalten bleibt unverändert.
 *
 * Der Block enthält (je nach Reading-Typ):
 *   - Kern-Daten (Typ, Profil, Autorität, Strategie, Definition, Kreuz)
 *   - Zentren (definiert / offen)
 *   - Kanäle (mit deutschem Namen aus chartData.channels[i].name_de)
 *   - Gates (mit deutschem Namen aus data/incarnation_crosses.json)
 *   - Planeten-Positionen (Personality + Design)
 *   - Variable/PHS (falls vorhanden)
 *   - Composite-Sektion bei Mehr-Personen-Readings
 *   - Konditionierungs-Matrix bei Composite
 *   - Transit-Whitelist bei Transit/Jahres/Tagesimpuls
 *   - WHITELIST: erlaubte Gates, Kanäle, Planeten-Positionen
 *   - VERBOTEN: explizite Negativliste
 *   - WAHRHEITSQUELLE-Instruktion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Gate-Namen (DE) aus data/incarnation_crosses.json ────────────────────────
const CROSSES_JSON_PATH = path.join(__dirname, '../data/incarnation_crosses.json');
let _gateNames = null;
function loadGateNames() {
  if (_gateNames) return _gateNames;
  try {
    const data = JSON.parse(fs.readFileSync(CROSSES_JSON_PATH, 'utf8'));
    _gateNames = data.gate_names || {};
  } catch (e) {
    console.warn('[facts-builder] gate_names konnte nicht geladen werden:', e.message);
    _gateNames = {};
  }
  return _gateNames;
}
function gateNameDe(n) {
  const entry = loadGateNames()[String(n)] || {};
  return entry.name || `Tor ${n}`;
}
function gateKeywordDe(n) {
  const entry = loadGateNames()[String(n)] || {};
  return entry.keyword || '';
}

// ── Zentren-Namen (DE) — hier lokal, damit die Datei autark ist ─────────────
const CENTER_NAMES_DE = {
  head:           'Kopf',
  ajna:           'Ajna',
  throat:         'Kehle',
  g:              'G-Zentrum',
  heart:          'Herz/Ego',
  spleen:         'Milz',
  'solar-plexus': 'Solarplexus',
  sacral:         'Sakral',
  root:           'Wurzel',
};
const CENTER_ORDER = ['head', 'ajna', 'throat', 'g', 'heart', 'solar-plexus', 'sacral', 'spleen', 'root'];

// ── Planeten-Namen (DE) ──────────────────────────────────────────────────────
const PLANET_NAMES_DE = {
  sun: 'Sonne', earth: 'Erde', moon: 'Mond',
  north_node: 'Nordknoten', south_node: 'Südknoten',
  mercury: 'Merkur', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn',
  uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto',
  chiron: 'Chiron', lilith: 'Lilith',
};
const PLANET_ORDER = ['sun','earth','moon','north_node','south_node','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','chiron','lilith'];

// ── Typ-Label für Composite ─────────────────────────────────────────────────
const TYPE_LABEL_DE = {
  electromagnetic: 'Elektromagnetisch',
  compromise:      'Kompromiss',
  companionship:   'Companionship',
  parallel:        'Parallel',
};

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────
function normalizeGateList(gates) {
  return (gates || [])
    .map(g => (typeof g === 'object' ? g.number : g))
    .filter(n => typeof n === 'number' && n > 0 && n <= 64);
}

function formatCentersBlock(centers) {
  if (!centers) return '  (keine Zentren-Daten)';
  const lines = [];
  for (const key of CENTER_ORDER) {
    const label = CENTER_NAMES_DE[key];
    const defined = centers[key] === true;
    lines.push(`  - ${label}: ${defined ? 'DEFINIERT' : 'offen'}`);
  }
  return lines.join('\n');
}

function formatChannelsBlock(channels) {
  if (!channels?.length) return '  (keine aktivierten Kanäle)';
  return channels.map(c => {
    const gates = c.gates || [];
    const key = gates.join('-');
    const nameDe = c.name_de || c.nameDe || c.name || key;
    return `  - Kanal ${key} (${nameDe}): Tor ${gates.join(' + Tor ')}`;
  }).join('\n');
}

function formatGatesBlock(chartData) {
  const gates = chartData?.gates || [];
  if (!gates.length) return '  (keine aktivierten Tore)';

  // Personality vs Design aus planets ableiten
  const pPlanets = chartData.personality?.planets || {};
  const dPlanets = chartData.design?.planets || {};
  const pGates = new Set(Object.values(pPlanets).map(p => p?.gate).filter(Boolean));
  const dGates = new Set(Object.values(dPlanets).map(p => p?.gate).filter(Boolean));

  return gates.slice(0, 64).map(g => {
    const num = g.number ?? g;
    if (!num) return null;
    const line = g.line ? `.${g.line}` : '';
    const source = pGates.has(num) && dGates.has(num) ? 'beide'
                 : pGates.has(num) ? 'Persönlichkeit'
                 : dGates.has(num) ? 'Design'
                 : '—';
    const nameDe = gateNameDe(num);
    const kw = gateKeywordDe(num);
    const kwSuffix = kw ? ` (${kw})` : '';
    return `  - Tor ${num}${line} — ${nameDe}${kwSuffix} [${source}]`;
  }).filter(Boolean).join('\n');
}

function formatPlanetsBlock(chartData) {
  const p = chartData?.personality?.planets || {};
  const d = chartData?.design?.planets || {};
  const all = new Set([...Object.keys(p), ...Object.keys(d)]);
  if (!all.size) return '';
  const lines = [];
  for (const key of PLANET_ORDER) {
    if (!all.has(key)) continue;
    const pp = p[key], dd = d[key];
    const parts = [];
    if (pp?.gate) parts.push(`Persönlichkeit Tor ${pp.gate}${pp.line ? '.' + pp.line : ''}`);
    if (dd?.gate) parts.push(`Design Tor ${dd.gate}${dd.line ? '.' + dd.line : ''}`);
    if (parts.length) lines.push(`  - ${PLANET_NAMES_DE[key] || key}: ${parts.join(' | ')}`);
  }
  // Reste (falls Planet nicht in PLANET_ORDER)
  for (const key of all) {
    if (PLANET_ORDER.includes(key)) continue;
    const pp = p[key], dd = d[key];
    const parts = [];
    if (pp?.gate) parts.push(`Persönlichkeit Tor ${pp.gate}${pp.line ? '.' + pp.line : ''}`);
    if (dd?.gate) parts.push(`Design Tor ${dd.gate}${dd.line ? '.' + dd.line : ''}`);
    if (parts.length) lines.push(`  - ${PLANET_NAMES_DE[key] || key}: ${parts.join(' | ')}`);
  }
  return lines.join('\n');
}

function formatIncarnationCrossBlock(chartData) {
  const cross = chartData.incarnationCross || chartData.incarnation_cross || {};
  const cg = cross.gates || {};
  const ps = cg.personalitySun  ?? chartData.personality?.planets?.sun?.gate;
  const pe = cg.personalityEarth?? chartData.personality?.planets?.earth?.gate;
  const ds = cg.designSun       ?? chartData.design?.planets?.sun?.gate;
  const de = cg.designEarth     ?? chartData.design?.planets?.earth?.gate;
  if (!ps || !pe || !ds || !de) return '';

  const name = cross.name_de || cross.fullName_de || cross.name || '';
  const header = name ? `Inkarnationskreuz: ${name}` : 'Inkarnationskreuz';

  return `${header}
  - Persönlichkeitssonne: Tor ${ps} — ${gateNameDe(ps)} (${gateKeywordDe(ps)})
  - Persönlichkeitserde:  Tor ${pe} — ${gateNameDe(pe)} (${gateKeywordDe(pe)})
  - Design-Sonne:         Tor ${ds} — ${gateNameDe(ds)} (${gateKeywordDe(ds)})
  - Design-Erde:          Tor ${de} — ${gateNameDe(de)} (${gateKeywordDe(de)})`;
}

// ── Composite-Sektion (Connection / Penta / Relationship) ───────────────────
function formatCompositeBlock(composite, persons = ['A', 'B']) {
  if (!composite?.connections) return '';

  const { electromagnetic = [], compromise = [], companionship = [], parallel = [] } = composite.connections;

  const sections = [];

  const personLabel = (idx) => persons[idx] || `Person ${idx + 1}`;

  if (electromagnetic.length) {
    const lines = electromagnetic.map(e => {
      const gates = e.gates || [];
      const holders = e.personsByGate || {};
      const holderInfo = gates.map(g => {
        const idxs = holders[g] || [];
        return idxs.length ? `Tor ${g} bei ${idxs.map(personLabel).join(' + ')}` : `Tor ${g}: niemand`;
      }).join(', ');
      return `  - Kanal ${e.channel}: ${holderInfo}`;
    }).join('\n');
    sections.push(`Elektromagnetisch (kein*e komplett, gemeinsam decken sie den Kanal ab):\n${lines}`);
  }

  if (compromise.length) {
    const lines = compromise.map(c => {
      const dom = personLabel(c.completePerson);
      const partial = (c.partialPersons || [])
        .map((pi, i) => `${personLabel(pi)} (nur Tor ${c.partialDetails?.[i]?.gate ?? '?'})`)
        .join(', ');
      return `  - Kanal ${c.channel}: ${dom} hat Kanal komplett; ${partial} am einzelnen Gate`;
    }).join('\n');
    sections.push(`Kompromiss (eine*r komplett, andere partial):\n${lines}`);
  }

  if (companionship.length) {
    const lines = companionship.map(cs => {
      return `  - Kanal ${cs.channel}: ${personLabel(cs.completePerson)} hat Kanal komplett, niemand sonst Gates davon`;
    }).join('\n');
    sections.push(`Companionship (eine*r komplett, andere haben keine Gates):\n${lines}`);
  }

  if (parallel.length) {
    const lines = parallel.map(p => {
      return `  - Kanal ${p.channel}: ${(p.completePersons || []).map(personLabel).join(' + ')} haben den Kanal jeweils vollständig`;
    }).join('\n');
    sections.push(`Parallel (≥ 2 Personen haben den Kanal jeweils komplett):\n${lines}`);
  }

  if (!sections.length) {
    return 'Keine gemeinsamen Kanäle nach Klassifikation.';
  }

  return sections.join('\n\n');
}

// ── Konditionierungs-Matrix (nur bei Mehr-Personen-Readings) ────────────────
function formatConditioningMatrix(conditioning, persons = ['A', 'B']) {
  if (!conditioning) return '';
  const lines = [];
  for (const key of CENTER_ORDER) {
    const c = conditioning[key];
    if (!c) continue;
    const label = CENTER_NAMES_DE[key];
    const definedBy = (c.definedBy || []).map(i => persons[i] || `P${i+1}`).join(' + ');
    const conditions = (c.conditions || []).map(i => persons[i] || `P${i+1}`).join(' + ');
    if (definedBy && conditions) {
      lines.push(`  - ${label}: ${definedBy} definiert → konditioniert offenes ${label} bei ${conditions}`);
    } else if (definedBy) {
      lines.push(`  - ${label}: ${definedBy} definiert, niemand offen — keine Konditionierung`);
    } else {
      lines.push(`  - ${label}: niemand definiert — keine Konditionierung`);
    }
  }
  return lines.length ? lines.join('\n') : '';
}

// ── Transit-Whitelist (bei Transit / Jahres / Tagesimpuls) ──────────────────
function formatTransitBlock(transitData) {
  if (!transitData) return '';
  const date = transitData.date || '';
  const items = transitData.allPlanets || [];
  const header = date ? `Transit-Positionen (${date}):` : 'Transit-Positionen:';
  if (items.length) {
    const lines = items.map(t => {
      const name = PLANET_NAMES_DE[t.planet] || t.planet || '?';
      return `  - ${name}: Tor ${t.gate}${t.line ? '.' + t.line : ''}`;
    }).join('\n');
    return `${header}\n${lines}`;
  }
  // Fallback: direkte Felder sun/earth/moon
  const lines = [];
  if (transitData.sun?.gate)   lines.push(`  - Sonne: Tor ${transitData.sun.gate}${transitData.sun.line ? '.' + transitData.sun.line : ''}`);
  if (transitData.earth?.gate) lines.push(`  - Erde: Tor ${transitData.earth.gate}${transitData.earth.line ? '.' + transitData.earth.line : ''}`);
  if (transitData.moon?.gate)  lines.push(`  - Mond: Tor ${transitData.moon.gate}${transitData.moon.line ? '.' + transitData.moon.line : ''}`);
  return lines.length ? `${header}\n${lines.join('\n')}` : '';
}

// ── Whitelist: erlaubte Erwähnungen ─────────────────────────────────────────
function formatWhitelist(chartData, composite, transitData) {
  const gates = normalizeGateList(chartData?.gates).sort((a,b) => a - b);
  const channels = (chartData?.channels || []).map(c => (c.gates || []).join('-')).sort();

  const lines = [];
  lines.push(`- Gates: ${gates.length ? gates.join(', ') : '(keine)'}`);
  lines.push(`- Kanäle: ${channels.length ? channels.join(', ') : '(keine)'}`);

  if (composite?.connections) {
    const emKeys = composite.connections.electromagnetic?.map(e => e.channel) || [];
    const cpKeys = composite.connections.compromise?.map(c => c.channel)     || [];
    const csKeys = composite.connections.companionship?.map(c => c.channel)  || [];
    const pKeys  = composite.connections.parallel?.map(p => p.channel)       || [];
    lines.push(`- Composite-Kategorien: elektromagnetisch=[${emKeys.join(',') || '—'}], kompromiss=[${cpKeys.join(',') || '—'}], companionship=[${csKeys.join(',') || '—'}], parallel=[${pKeys.join(',') || '—'}]`);
  }

  if (transitData?.allPlanets?.length) {
    const transitGates = transitData.allPlanets.map(t => `${PLANET_NAMES_DE[t.planet] || t.planet}=${t.gate}`).join(', ');
    lines.push(`- Transit-Gates: ${transitGates}`);
  }

  return lines.join('\n');
}

// ── Verbote ─────────────────────────────────────────────────────────────────
const PROHIBITIONS = `- Jede andere Gate-Nummer zu erwähnen (auch nicht als "ähnlich", "fast aktiv", "resonant", "nah dran").
- Jeden anderen Kanal zu erwähnen oder zu bilden (nur die oben gelisteten Kanäle existieren für dieses Reading).
- Den Begriff "Goldader" (stattdessen präzise Kategorie: Elektromagnetisch, Kompromiss, Companionship, Parallel).
- Konditionierung quer über Zentrums-Typen (z. B. "Sakral konditioniert Wurzel" — Konditionierung existiert nur innerhalb desselben Zentrum-Typs).
- Planeten-Positionen, die nicht exakt in der obigen Whitelist stehen.
- Aussagen wie "ähnlich dem Gate X", "nahe Gate Y" — nur wenn X/Y in der Whitelist.
- Kanäle, die laut chartData nicht existieren — einzelne Gates dürfen erwähnt, aber nicht zu einem Kanal zusammengefasst werden.`;

// ── Wahrheitsquelle-Instruktion ─────────────────────────────────────────────
const TRUTH_SOURCE_INSTRUCTION = `Alle fachlichen Aussagen in deinem Reading müssen sich ausschließlich auf den Fakten-Block oben beziehen. Wenn ein Fakt dort nicht steht, existiert er für dieses Reading nicht. Im Zweifel: Lass die Aussage weg. Ein kürzerer Text ist besser als ein falscher Text.`;

// ── Haupt-Entry-Point ───────────────────────────────────────────────────────
/**
 * @param {object} chartData - Chart-Response-Objekt (aus connection-key)
 * @param {object} [opts]
 * @param {string} [opts.readingType] - 'basic', 'detailed', 'connection', 'penta', 'tagesimpuls', 'transit', 'jahres-reading', 'sexuality', 'relationship', 'compatibility'
 * @param {object} [opts.composite] - composite-Objekt mit connections[] und conditioning (aus classifyCompositeConnections)
 * @param {string[]} [opts.personNames] - Namen der Personen für Composite ['Alice', 'Bob']
 * @param {object} [opts.transits] - Transit-Daten für transit/jahres/tagesimpuls
 * @returns {string} - Kompletter Fakten-Block
 */
export function buildFactsBlock(chartData, opts = {}) {
  if (!chartData) return '';
  const { readingType = 'basic', composite = null, personNames = ['A','B','C','D','E'], transits = null } = opts;

  const parts = ['=== FAKTEN (deterministisch aus Chart berechnet — nicht verändern) ==='];

  parts.push(`TYP: ${chartData.type || 'Unbekannt'}`);
  parts.push(`PROFIL: ${chartData.profile || 'Unbekannt'}`);
  parts.push(`AUTORITÄT: ${chartData.authority || 'Unbekannt'}`);
  parts.push(`STRATEGIE: ${chartData.strategy || 'Unbekannt'}`);
  if (chartData.definition) {
    parts.push(`DEFINITION: ${chartData.definition}${chartData.splits ? ` (${chartData.splits} Split${chartData.splits > 1 ? 's' : ''})` : ''}`);
  }

  const crossBlock = formatIncarnationCrossBlock(chartData);
  if (crossBlock) parts.push('', crossBlock);

  parts.push('', 'ZENTREN (definiert = konstante Energie; offen = Konditionierungsfeld):',
    formatCentersBlock(chartData.centers));

  parts.push('', 'KANÄLE (nur die hier gelisteten gelten als aktiv):',
    formatChannelsBlock(chartData.channels));

  parts.push('', 'TORE (mit Linie, Quelle und deutschem Namen):',
    formatGatesBlock(chartData));

  const planetsBlock = formatPlanetsBlock(chartData);
  if (planetsBlock) parts.push('', 'PLANETEN-POSITIONEN (Persönlichkeit / Design):', planetsBlock);

  // Composite (Mehr-Personen-Readings)
  if (composite?.connections) {
    parts.push('', '=== COMPOSITE (gemeinsame Kanäle nach Block-2-Klassifikation) ===',
      formatCompositeBlock(composite, personNames));
  }

  if (composite?.conditioning) {
    parts.push('', 'KONDITIONIERUNG (nur zentrum-zu-zentrum gleichen Typs):',
      formatConditioningMatrix(composite.conditioning, personNames));
  }

  // Transit (bei Transit/Jahres/Tagesimpuls)
  if (transits) {
    const tBlock = formatTransitBlock(transits);
    if (tBlock) parts.push('', '=== TRANSIT ===', tBlock);
  }

  // Whitelist
  parts.push('', '=== ERLAUBTE ERWÄHNUNGEN ===',
    formatWhitelist(chartData, composite, transits));

  // Verbote
  parts.push('', '=== VERBOTEN ===', PROHIBITIONS);

  // Wahrheitsquelle-Instruktion
  parts.push('', '=== WAHRHEITSQUELLE ===', TRUTH_SOURCE_INSTRUCTION);

  parts.push('', '=== ENDE FAKTEN ===');

  return parts.join('\n');
}

// Named exports für Tests
export {
  gateNameDe,
  gateKeywordDe,
  formatCentersBlock,
  formatChannelsBlock,
  formatGatesBlock,
  formatPlanetsBlock,
  formatIncarnationCrossBlock,
  formatCompositeBlock,
  formatConditioningMatrix,
  formatTransitBlock,
  formatWhitelist,
  TYPE_LABEL_DE,
  CENTER_NAMES_DE,
  PLANET_NAMES_DE,
};

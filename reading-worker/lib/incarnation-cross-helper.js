import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Master (Single Source of Truth) — gebaut via scripts/incarnation-crosses/build_incarnation_crosses.py
const MASTER_PATH = path.join(__dirname, '../data/incarnation_crosses_master.json');
// Legacy Q2 — nur noch fuer gate_names (Gate-Themen-Namen + Keywords)
const LEGACY_PATH = path.join(__dirname, '../data/incarnation_crosses.json');

let master = null;
let legacy = null;

export function loadCrossesData() {
  if (master) return master;
  try {
    master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
    const themes = Object.keys(master.themes || {}).length;
    const keys   = Object.keys(master.lookup || {}).length;
    console.log(`[crosses] Master geladen: ${themes} Themen, ${keys} Lookup-Keys`);
  } catch (e) {
    console.warn('[crosses] Master nicht gefunden:', e.message);
    master = { themes: {}, lookup: {} };
  }
  return master;
}

function loadLegacy() {
  if (legacy) return legacy;
  try {
    legacy = JSON.parse(fs.readFileSync(LEGACY_PATH, 'utf8'));
  } catch (e) {
    legacy = { gate_names: {} };
  }
  return legacy;
}

// Cross-Type-String (z. B. "Right Angle") → Master type_short ("RAX"/"LAX"/"JUX")
function typeShortFromCrossType(crossType) {
  const t = String(crossType || '').toLowerCase();
  if (t.startsWith('right')) return 'RAX';
  if (t.startsWith('left'))  return 'LAX';
  if (t.startsWith('juxta')) return 'JUX';
  return null;
}

function lookupTheme(ps, pe, ds, de, crossType) {
  if (!ps || !pe || !ds || !de) return null;
  const data = loadCrossesData();
  const key  = ps + '-' + pe + '-' + ds + '-' + de;
  const ids  = (data.lookup && data.lookup[key]) || [];
  if (ids.length === 0) return null;
  const want = typeShortFromCrossType(crossType);
  // 1. Exakter Profil-Match bevorzugen
  for (const id of ids) {
    const t = data.themes && data.themes[id];
    if (t && t.type_short === want) return t;
  }
  // 2. Q2-Fallback-Theme akzeptieren (ergaenztes Thema ohne klare HD-Typ-Zuordnung,
  //    aber mit voller Beschreibung — besser als Notnagel)
  for (const id of ids) {
    const t = data.themes && data.themes[id];
    if (t && t.source === 'q2_fallback') return t;
  }
  // 3. Notnagel: erstes Theme — Profile/Type-Mismatch
  return (data.themes && data.themes[ids[0]]) || null;
}

export function getCrossName(ps, pe, ds, de, crossType) {
  const theme = lookupTheme(ps, pe, ds, de, crossType);
  if (theme) {
    // Q2-Fallback: full_name_en ist life_theme-Text — stattdessen Prefix + name_en
    const isQ2 = theme.source === 'q2_fallback';
    const prefix = typeShortFromCrossType(crossType) || (crossType || '');
    if (isQ2 && theme.name_en) return (prefix + ' of ' + theme.name_en).trim();
    if (theme.full_name_en) return theme.full_name_en;
    if (theme.name_en) return (prefix + ' of ' + theme.name_en).trim();
  }
  // Kein Master-Match → ehrlicher Gate-Hinweis
  const lg = loadLegacy();
  const g = lg.gate_names || {};
  const psName = (g[String(ps)] || {}).name || ('Gate ' + ps);
  const dsName = (g[String(ds)] || {}).name || ('Gate ' + ds);
  const prefix = (crossType || '').trim();
  return (prefix + ' of ' + psName + ' / ' + dsName).trim();
}

// Deutsche Variante: liefert "RAX/LAX/Juxtaposition der <Thema-DE>".
// Returns null wenn der Master nichts findet — Caller faellt dann auf chartData.name_de zurueck.
export function getCrossNameDe(ps, pe, ds, de, crossType) {
  const theme = lookupTheme(ps, pe, ds, de, crossType);
  if (!theme) return null;
  const prefix = crossType === 'Juxtaposition' ? 'Juxtaposition der'
    : crossType === 'Right Angle' ? 'RAX der'
    : crossType === 'Left Angle' ? 'LAX der'
    : '';
  // Q2-Fallback: full_name_de = life_theme; lieber prefix + name_de bauen
  const isQ2 = theme.source === 'q2_fallback';
  if (isQ2 && theme.name_de && prefix) return (prefix + ' ' + theme.name_de);
  if (theme.full_name_de) return theme.full_name_de;
  return prefix ? (prefix + ' ' + theme.name_de) : theme.name_de;
}

export function buildCrossPromptFragment(chart, mode) {
  mode = mode || 'gates';
  const cross = chart.incarnationCross || {};
  const ps = cross.personalitySun ?? (cross.gates && cross.gates.personalitySun);
  const pe = cross.personalityEarth ?? (cross.gates && cross.gates.personalityEarth);
  const ds = cross.designSun ?? (cross.gates && cross.gates.designSun);
  const de = cross.designEarth ?? (cross.gates && cross.gates.designEarth);
  const crossType = cross.type || '';
  if (!ps || !pe || !ds || !de) return '';

  const lg = loadLegacy();
  const g = lg.gate_names || {};
  const getName = (n) => (g[String(n)] || {}).name || ('Gate ' + n);
  const getKw   = (n) => (g[String(n)] || {}).keyword || '';

  const theme = lookupTheme(ps, pe, ds, de, crossType);
  const crossName = (theme && theme.full_name_en) ? theme.full_name_en : null;

  if (mode === 'gates') {
    return 'Inkarnationskreuz' + (crossName ? ' (' + crossName + ')' : '') + ':\n' +
      '- Persönlichkeitssonne: Gate ' + ps + ' — ' + getName(ps) + ' (' + getKw(ps) + ')\n' +
      '- Persönlichkeitserde: Gate ' + pe + ' — ' + getName(pe) + ' (' + getKw(pe) + ')\n' +
      '- Design-Sonne: Gate ' + ds + ' — ' + getName(ds) + ' (' + getKw(ds) + ')\n' +
      '- Design-Erde: Gate ' + de + ' — ' + getName(de) + ' (' + getKw(de) + ')\n\n' +
      'Erkläre die Lebensaufgabe basierend auf diesen vier Gate-Energien.\n' +
      'Beginne mit der Persönlichkeitssonne als Hauptthema (~70%).';
  }
  return crossName || (crossType + ' (Gates: ' + ps + ', ' + pe + ', ' + ds + ', ' + de + ')').trim();
}

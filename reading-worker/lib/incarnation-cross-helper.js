import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CROSSES_PATH = path.join(__dirname, '../data/incarnation_crosses.json');
let crossesData = null;

export function loadCrossesData() {
  if (crossesData) return crossesData;
  try {
    crossesData = JSON.parse(fs.readFileSync(CROSSES_PATH, 'utf8'));
  } catch (e) {
    console.warn('[crosses] JSON nicht gefunden:', e.message);
    crossesData = { gate_names: {}, crosses: {} };
  }
  return crossesData;
}

export function getCrossName(ps, pe, ds, de, crossType) {
  crossType = crossType || '';
  const data = loadCrossesData();
  const key = ps + '-' + pe + '-' + ds + '-' + de;
  const entry = (data.crosses || {})[key];
  if (entry && entry.name) return (crossType + ' of ' + entry.name).trim();
  const g = data.gate_names || {};
  const psName = (g[String(ps)] || {}).name || ('Gate ' + ps);
  const dsName = (g[String(ds)] || {}).name || ('Gate ' + ds);
  return (crossType + ' of ' + psName + ' / ' + dsName).trim();
}

export function buildCrossPromptFragment(chart, mode) {
  mode = mode || 'gates';
  const data = loadCrossesData();
  const cross = chart.incarnationCross || {};
  const ps = cross.personalitySun;
  const pe = cross.personalityEarth;
  const ds = cross.designSun;
  const de = cross.designEarth;
  const crossType = cross.type || '';
  if (!ps || !pe || !ds || !de) return '';
  const g = data.gate_names || {};
  const getName = (n) => (g[String(n)] || {}).name || ('Gate ' + n);
  const getKw = (n) => (g[String(n)] || {}).keyword || '';
  const key = ps + '-' + pe + '-' + ds + '-' + de;
  const entry = (data.crosses || {})[key] || null;
  const crossName = (entry && entry.name) ? (crossType + ' of ' + entry.name).trim() : null;
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

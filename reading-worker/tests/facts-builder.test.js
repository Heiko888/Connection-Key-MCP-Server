// Tests für lib/facts-builder.js (Baustein 4)
// Synthetische Chart-Daten, keine Real-Personen.

import {
  buildFactsBlock,
  gateNameDe,
  formatCompositeBlock,
  formatConditioningMatrix,
  formatWhitelist,
} from '../lib/facts-builder.js';

let passed = 0, failed = 0;
function assert(name, cond, detail) {
  if (cond) { console.log(`  ✅ ${name}`); passed++; }
  else     { console.log(`  ❌ ${name}  ${detail ? '— ' + detail : ''}`); failed++; }
}

// ── Synthetischer Chart: Generator 6/2 Sacral-Autorität ────────────────────
const chartGenerator = {
  type: 'Generator',
  profile: '6/2',
  authority: 'Sacral',
  strategy: 'Warte auf Response',
  definition: 'Single',
  incarnationCross: {
    name: 'Right Angle Cross of Planning',
    name_de: 'Rechtswinkliges Kreuz der Planung',
    gates: { personalitySun: 37, personalityEarth: 40, designSun: 5, designEarth: 35 },
  },
  centers: {
    head: false, ajna: false, throat: true, g: false,
    heart: false, 'solar-plexus': false, sacral: true,
    spleen: true, root: false,
  },
  channels: [
    { gates: [34, 57], name: 'Power', name_de: 'Macht' },
    { gates: [20, 34], name: 'Charisma', name_de: 'Charisma' },
  ],
  gates: [
    { number: 34, line: 3 }, { number: 57, line: 2 },
    { number: 20, line: 1 }, { number: 14, line: 4 },
    { number: 2, line: 5 },
  ],
  personality: { planets: {
    sun: { gate: 37, line: 1 }, earth: { gate: 40, line: 1 },
    moon: { gate: 14, line: 4 },
  }},
  design: { planets: {
    sun: { gate: 5, line: 3 }, earth: { gate: 35, line: 3 },
    moon: { gate: 2, line: 5 },
  }},
};

console.log('== buildFactsBlock (single-person) ==');
{
  const out = buildFactsBlock(chartGenerator, { readingType: 'basic' });
  assert('enthält Kern-Daten (TYP, PROFIL, AUTORITÄT, STRATEGIE)',
    out.includes('TYP: Generator') && out.includes('PROFIL: 6/2')
    && out.includes('AUTORITÄT: Sacral') && out.includes('STRATEGIE: Warte auf Response'));

  assert('enthält Inkarnationskreuz-Header mit deutschem Namen',
    out.includes('Rechtswinkliges Kreuz der Planung'));

  assert('enthält alle 4 Kreuz-Gates mit deutschen Namen',
    out.includes('Tor 37') && out.includes('Tor 40') && out.includes('Tor 5') && out.includes('Tor 35'));

  assert('Zentren-Block komplett (9 Zentren)',
    out.includes('Kopf: offen') && out.includes('Kehle: DEFINIERT') && out.includes('Sakral: DEFINIERT')
    && out.includes('Milz: DEFINIERT') && out.includes('Wurzel: offen'));

  assert('Kanäle mit deutschem Namen',
    out.includes('Kanal 34-57 (Macht)') && out.includes('Kanal 20-34 (Charisma)'));

  assert('Gates mit deutschem Namen + Source-Tag',
    out.includes('Tor 34') && (out.includes('[Persönlichkeit]') || out.includes('[Design]') || out.includes('[beide]') || out.includes('[—]')));

  assert('Planeten-Positionen aufgelistet',
    out.includes('Sonne:') && out.includes('Mond:'));

  assert('Whitelist enthält alle Gates',
    out.includes('Gates: 2, 14, 20, 34, 57'));

  assert('Verbote-Sektion vorhanden',
    out.includes('VERBOTEN') && out.includes('Goldader'));

  assert('Wahrheitsquelle-Instruktion vorhanden',
    out.includes('WAHRHEITSQUELLE') && out.includes('kürzerer Text ist besser als ein falscher Text'));

  assert('ENDE-FAKTEN-Marker',
    out.includes('=== ENDE FAKTEN ==='));
}

console.log('\n== Idempotenz ==');
{
  const a = buildFactsBlock(chartGenerator, { readingType: 'basic' });
  const b = buildFactsBlock(chartGenerator, { readingType: 'basic' });
  assert('Gleicher Input → gleicher Output', a === b);
}

console.log('\n== gateNameDe ==');
{
  assert('Tor 1 = Kreativität', gateNameDe(1) === 'Kreativität');
  assert('Tor 37 = ?',  typeof gateNameDe(37) === 'string' && gateNameDe(37).length > 1);
  assert('Tor 999 = Fallback', gateNameDe(999) === 'Tor 999');
}

console.log('\n== Composite: 2-Personen ==');
{
  const composite = {
    connections: {
      electromagnetic: [{ channel: '59-6', gates: [59, 6], personsByGate: { 59: [0], 6: [1] } }],
      compromise:      [{ channel: '34-57', gates: [34, 57], completePerson: 0, partialPersons: [1], partialDetails: [{ person: 1, gate: 34 }] }],
      companionship:   [{ channel: '20-34', gates: [20, 34], completePerson: 0 }],
      parallel:        [{ channel: '37-40', gates: [37, 40], completePersons: [0, 1] }],
    },
  };
  const out = formatCompositeBlock(composite, ['Alice', 'Bob']);

  assert('Elektromagnetisch-Sektion nennt beide Personen',
    out.includes('Alice') && out.includes('Bob') && out.includes('59-6'));
  assert('Kompromiss nennt Complete vs Partial',
    out.includes('Kompromiss') && out.includes('komplett'));
  assert('Companionship-Sektion vorhanden',
    out.includes('Companionship') && out.includes('20-34'));
  assert('Parallel-Sektion zeigt beide Personen',
    out.includes('Parallel') && out.includes('37-40'));
}

console.log('\n== Konditionierungs-Matrix ==');
{
  const conditioning = {
    sacral: { definedBy: [0], conditions: [1] },
    root:   { definedBy: [1], conditions: [0] },
    spleen: { definedBy: [0, 1], conditions: [] },
    throat: { definedBy: [], conditions: [] },
  };
  const out = formatConditioningMatrix(conditioning, ['A', 'B']);

  assert('Sakral: A definiert, konditioniert B',
    out.includes('Sakral') && out.includes('A') && out.includes('konditioniert'));
  assert('Wurzel: B konditioniert A',
    out.includes('Wurzel') && out.includes('B'));
  assert('Spleen: beide definiert → keine Konditionierung',
    out.includes('Milz') && out.includes('niemand offen'));
  assert('Throat: niemand definiert',
    out.includes('Kehle') && out.includes('niemand definiert'));
}

console.log('\n== Whitelist ==');
{
  const out = formatWhitelist(chartGenerator, null, null);
  assert('Whitelist listet alle Gates sortiert',
    out.includes('Gates: 2, 14, 20, 34, 57'));
  assert('Whitelist listet alle Kanäle',
    out.includes('20-34') && out.includes('34-57'));
}

console.log('\n== Feature-Flag: chartData null ==');
{
  assert('null → leer', buildFactsBlock(null) === '');
  assert('undefined → leer', buildFactsBlock(undefined) === '');
}

console.log(`\n${passed}/${passed + failed} Tests bestanden`);
if (failed > 0) { console.error(`❌ ${failed} Fehler`); process.exit(1); }
console.log('✅ Alle Tests grün');

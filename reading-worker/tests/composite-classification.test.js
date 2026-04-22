// Tests für reading-worker/lib/composite-classification.js
// Synthetische Personen A/B (keine Real-Daten).
// Spiegelt connection-key/test/composite-classification.test.js, um sicherzustellen
// dass beide Container dieselbe Klassifikation liefern.

import { classifyCompositeConnections, classifyTwoPersonChannels, HD_CHANNELS } from '../lib/composite-classification.js';

let passed = 0, failed = 0;

function assert(name, cond, detail) {
  if (cond) { console.log(`  ✅ ${name}`); passed++; }
  else     { console.log(`  ❌ ${name}  ${detail || ''}`); failed++; }
}

function classify2(a, b) {
  return classifyCompositeConnections(HD_CHANNELS, [a, b]);
}

console.log('== classifyCompositeConnections (n=2) ==');

// Testfall 1: A=[59,6], B=[6] → compromise (A complete, B partial an 6)
{
  const r = classify2([59, 6], [6]);
  assert('T1 — 59+6 A / 6 B → compromise',
    r.connections.compromise.length === 1 && r.connections.compromise[0].channel === '6-59');
  assert('T1 — nicht companionship',  r.connections.companionship.length === 0);
  assert('T1 — nicht electromagnetic', r.connections.electromagnetic.length === 0);
  assert('T1 — nicht parallel',        r.connections.parallel.length === 0);
  assert('T1 — dominance alias bei n=2', r.connections.dominance.length === 1);
}

// Testfall 2: A=[59,6], B=[59,6] → parallel
{
  const r = classify2([59, 6], [59, 6]);
  assert('T2 — 59+6 bei A und B → parallel', r.connections.parallel.length === 1);
  assert('T2 — nicht companionship',  r.connections.companionship.length === 0);
  assert('T2 — nicht compromise',     r.connections.compromise.length === 0);
}

// Testfall 3: A=[59], B=[6] → electromagnetic
{
  const r = classify2([59], [6]);
  assert('T3 — 59 A / 6 B → electromagnetic', r.connections.electromagnetic.length === 1);
  assert('T3 — electromagnetic key 6-59', r.connections.electromagnetic[0].channel === '6-59');
}

// Testfall 4: A=[4,63], B=[4] → compromise (4+63 bei A, nur 4 bei B)
{
  const r = classify2([4, 63], [4]);
  assert('T4 — 4+63 A / 4 B → compromise', r.connections.compromise.length === 1 && r.connections.compromise[0].channel === '4-63');
}

// Testfall 5: A=[21,45], B=[] → companionship (A hat Kanal, B hat nichts)
{
  const r = classify2([21, 45], []);
  assert('T5 — 21+45 A / leer B → companionship', r.connections.companionship.length === 1 && r.connections.companionship[0].channel === '21-45');
  assert('T5 — keine dominance bei companionship', r.connections.dominance.length === 0);
}

// Testfall 6: A=[16], B=[48] → electromagnetic
{
  const r = classify2([16], [48]);
  assert('T6 — 16 A / 48 B → electromagnetic', r.connections.electromagnetic.length === 1);
}

// Testfall 7: A=[16,48], B=[16,48] → parallel
{
  const r = classify2([16, 48], [16, 48]);
  assert('T7 — 16+48 bei beiden → parallel', r.connections.parallel.length === 1);
}

// Testfall 8: A=[37,40], B=[37,40] → parallel
{
  const r = classify2([37, 40], [37, 40]);
  assert('T8 — 37+40 bei beiden → parallel', r.connections.parallel.length === 1);
}

// Testfall 9: A=[37], B=[40] → electromagnetic
{
  const r = classify2([37], [40]);
  assert('T9 — 37 A / 40 B → electromagnetic', r.connections.electromagnetic.length === 1);
}

console.log('\n== classifyCompositeConnections (n=3) ==');

// Testfall 10: A=[34], B=[20], C=[34,20] → compromise (C complete, A+B partial)
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[34], [20], [34, 20]]);
  assert('T10 — A=34 B=20 C=34+20 → compromise (C complete, A+B partial)',
    r.connections.compromise.length === 1 && r.connections.compromise[0].completePerson === 2);
}

// Testfall 11: A=[34], B=[20], C=[] → electromagnetic
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[34], [20], []]);
  assert('T11 — A=34 B=20 C=leer → electromagnetic', r.connections.electromagnetic.length === 1);
}

// Testfall 12: A=[34,20], B=[34,20], C=[] → parallel
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[34, 20], [34, 20], []]);
  assert('T12 — A+B komplett, C leer → parallel', r.connections.parallel.length === 1);
  assert('T12 — keine dominance bei n=3', r.connections.dominance.length === 0);
}

// Testfall 13: A=[3], B=[60], C=[3] → electromagnetic
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[3], [60], [3]]);
  assert('T13 — 2 Personen partial decken zusammen beide Gates → electromagnetic',
    r.connections.electromagnetic.length === 1 && r.connections.electromagnetic[0].channel === '3-60');
}

// Testfall 14: A=[3,60], B=[3], C=[60] → compromise
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[3, 60], [3], [60]]);
  assert('T14 — A complete, B+C partial → compromise',
    r.connections.compromise.length === 1 && r.connections.compromise[0].completePerson === 0);
}

// Testfall 15: A=[16], B=[16] → keine Kategorie (kein 48, kein Kanal)
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[16], [16]]);
  assert('T15 — nur ein Gate bei beiden → keine Kategorie',
    r.connections.electromagnetic.length === 0 && r.connections.compromise.length === 0
    && r.connections.companionship.length === 0 && r.connections.parallel.length === 0);
}

console.log('\n== Cross-Category-Ausschluss ==');

// Testfall 16: kein Kanal darf in zwei Kategorien gleichzeitig auftauchen
{
  const r = classifyCompositeConnections(HD_CHANNELS, [[1, 8, 59, 6], [1, 6]]);
  const allKeys = [
    ...r.connections.electromagnetic.map(e => e.channel),
    ...r.connections.compromise.map(c => c.channel),
    ...r.connections.companionship.map(c => c.channel),
    ...r.connections.parallel.map(p => p.channel),
  ];
  const unique = new Set(allKeys);
  assert('T16 — jeder Kanal in genau einer Kategorie', allKeys.length === unique.size,
    `All: ${allKeys.join(', ')} | Unique: ${[...unique].join(', ')}`);
}

console.log('\n== classifyTwoPersonChannels (Wrapper) ==');

// Testfall 17: Wrapper-Output-Schema
{
  const r = classifyTwoPersonChannels([59, 6], [6]);
  assert('T17 — Wrapper liefert compromise[0].dominantSide',
    r.compromise.length === 1 && r.compromise[0].dominantSide === 'A');
  assert('T17 — Wrapper liefert compromise[0].partialGate',
    r.compromise[0].partialGate === 6);
}

// Testfall 18: companionship-Wrapper mit side-Feld
{
  const r = classifyTwoPersonChannels([21, 45], []);
  assert('T18 — companionship side=A', r.companionship.length === 1 && r.companionship[0].side === 'A');
}

// Testfall 19: electromagnetic-Wrapper
{
  const r = classifyTwoPersonChannels([16], [48]);
  assert('T19 — electromagnetic hat gates', r.electromagnetic[0].gates[0] === 16 && r.electromagnetic[0].gates[1] === 48);
}

console.log(`\n${passed}/${passed + failed} Tests bestanden`);
if (failed > 0) {
  console.error(`❌ ${failed} Fehler`);
  process.exit(1);
}
console.log('✅ Alle Tests grün');

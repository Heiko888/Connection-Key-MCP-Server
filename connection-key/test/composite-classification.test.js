/**
 * Unit-Tests fuer classifyCompositeConnections.
 * 12 Faelle aus jani-feedback 2026-04-21, Block 2.
 *
 * Run: node --test test/composite-classification.test.js
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyCompositeConnections } from "../lib/astro/composite.js";

// Minimaler HD-Kanal-Satz fuer die Testfaelle — full set nicht noetig.
const CHANNELS = [
  [6, 59], [4, 63], [21, 45], [16, 48], [37, 40], [20, 34],
];

function classify(gatesByPerson) {
  return classifyCompositeConnections(CHANNELS, gatesByPerson);
}

// Hilfsfunktion: prueft dass ein Kanal in exakt einer Kategorie steht.
function categoriesFor(result, channelKey) {
  const cats = [];
  for (const [cat, entries] of Object.entries(result.connections)) {
    if (cat === 'dominance') continue; // dominance ist Alias, zaehlt nicht als eigene Kategorie
    if (entries.some(e => e.channel === channelKey)) cats.push(cat);
  }
  return cats;
}

test("Fall 1: A=[59,6], B=[6] -> compromise (A complete, B partial Gate 6)", () => {
  const r = classify([[59, 6], [6]]);
  assert.deepEqual(categoriesFor(r, "6-59"), ["compromise"]);
  const entry = r.connections.compromise.find(e => e.channel === "6-59");
  assert.equal(entry.completePerson, 0);
  assert.deepEqual(entry.partialPersons, [1]);
  assert.equal(entry.partialDetails[0].gate, 6);
});

test("Fall 2: A=[59,6], B=[59,6] -> parallel", () => {
  const r = classify([[59, 6], [59, 6]]);
  assert.deepEqual(categoriesFor(r, "6-59"), ["parallel"]);
  assert.deepEqual(r.connections.parallel[0].completePersons, [0, 1]);
});

test("Fall 3: A=[59], B=[6] -> electromagnetic (59-6)", () => {
  const r = classify([[59], [6]]);
  assert.deepEqual(categoriesFor(r, "6-59"), ["electromagnetic"]);
});

test("Fall 4: A=[4,63], B=[4] -> compromise (A complete, B partial Gate 4)", () => {
  const r = classify([[4, 63], [4]]);
  assert.deepEqual(categoriesFor(r, "4-63"), ["compromise"]);
  const entry = r.connections.compromise.find(e => e.channel === "4-63");
  assert.equal(entry.completePerson, 0);
  assert.equal(entry.partialDetails[0].gate, 4);
});

test("Fall 5: A=[21,45], B=[] -> companionship (A complete, niemand sonst)", () => {
  const r = classify([[21, 45], []]);
  assert.deepEqual(categoriesFor(r, "21-45"), ["companionship"]);
  assert.equal(r.connections.companionship[0].completePerson, 0);
});

test("Fall 6: A=[16], B=[48] -> electromagnetic (16-48)", () => {
  const r = classify([[16], [48]]);
  assert.deepEqual(categoriesFor(r, "16-48"), ["electromagnetic"]);
});

test("Fall 7: A=[16,48], B=[16,48] -> parallel", () => {
  const r = classify([[16, 48], [16, 48]]);
  assert.deepEqual(categoriesFor(r, "16-48"), ["parallel"]);
});

test("Fall 8: A=[37,40], B=[37,40] -> parallel", () => {
  const r = classify([[37, 40], [37, 40]]);
  assert.deepEqual(categoriesFor(r, "37-40"), ["parallel"]);
});

test("Fall 9: A=[37], B=[40] -> electromagnetic (37-40)", () => {
  const r = classify([[37], [40]]);
  assert.deepEqual(categoriesFor(r, "37-40"), ["electromagnetic"]);
});

test("Fall 10: 3 Personen, A=[34], B=[20], C=[34,20] -> compromise", () => {
  const r = classify([[34], [20], [34, 20]]);
  assert.deepEqual(categoriesFor(r, "20-34"), ["compromise"]);
  const entry = r.connections.compromise.find(e => e.channel === "20-34");
  assert.equal(entry.completePerson, 2);
  assert.deepEqual(entry.partialPersons.sort(), [0, 1]);
});

test("Fall 11: 3 Personen, A=[34], B=[20], C=[] -> electromagnetic", () => {
  const r = classify([[34], [20], []]);
  assert.deepEqual(categoriesFor(r, "20-34"), ["electromagnetic"]);
});

test("Fall 12: 3 Personen, A=[34,20], B=[34,20], C=[] -> parallel", () => {
  const r = classify([[34, 20], [34, 20], []]);
  assert.deepEqual(categoriesFor(r, "20-34"), ["parallel"]);
  assert.deepEqual(r.connections.parallel[0].completePersons, [0, 1]);
});

test("Kein Fall darf in zwei Kategorien landen — sampling ueber alle Testfaelle", () => {
  const samples = [
    [[59, 6], [6]],
    [[59, 6], [59, 6]],
    [[59], [6]],
    [[4, 63], [4]],
    [[21, 45], []],
    [[16], [48]],
    [[16, 48], [16, 48]],
    [[37, 40], [37, 40]],
    [[37], [40]],
    [[34], [20], [34, 20]],
    [[34], [20], []],
    [[34, 20], [34, 20], []],
  ];
  for (const s of samples) {
    const r = classify(s);
    const allChannels = new Set();
    ["parallel", "companionship", "compromise", "electromagnetic"].forEach(cat => {
      r.connections[cat].forEach(e => allChannels.add(e.channel));
    });
    for (const ch of allChannels) {
      const cats = categoriesFor(r, ch);
      assert.equal(
        cats.length, 1,
        `Kanal ${ch} bei Input ${JSON.stringify(s)} hat ${cats.length} Kategorien: ${cats.join(', ')}`
      );
    }
  }
});

test("dominance-Alias: 2er-Reading hat dominance-Entry fuer Compromise-Faelle", () => {
  const r = classify([[59, 6], [6]]);
  assert.equal(r.connections.dominance.length, 1);
  assert.equal(r.connections.dominance[0].dominant, 0);
  assert.equal(r.connections.dominance[0].other, 1);
});

test("dominance-Alias: 3er-Reading hat KEINEN dominance-Entry", () => {
  const r = classify([[34], [20], [34, 20]]);
  assert.equal(r.connections.dominance.length, 0);
});

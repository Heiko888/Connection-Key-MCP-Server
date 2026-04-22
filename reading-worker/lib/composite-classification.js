/**
 * Composite-Verbindungs-Klassifikation für n Personen.
 *
 * Portiert aus connection-key/lib/astro/composite.js (Block 2, 2026-04-21).
 * Reading-worker hatte eine eigene Duplikat-Logik (`classifyChannel` /
 * `analyzeConnectionDynamics`) die noch die alten EM/Goldader/
 * Parallelenergie-Labels verwendet hat. Das war ein Block-2-Follow-up,
 * den die ursprüngliche Korrektur in connection-key nicht mit erfasst hat.
 *
 * Pro Kanal genau EINE Kategorie (gegenseitig ausschliessend):
 *
 *   parallel        >= 2 Personen haben den Kanal jeweils vollstaendig alleine.
 *                   Keine Spannung, keine Anziehung — parallele Energie.
 *
 *   companionship   Genau 1 Person hat den Kanal vollstaendig, sonst hat niemand
 *                   Gates dieses Kanals. Andere koennen die Energie erleben,
 *                   aber nicht beruehren.
 *
 *   compromise      Genau 1 Person hat den Kanal vollstaendig, mindestens eine
 *                   andere hat nur 1 Gate davon. Reibung am Partial-Gate.
 *
 *   electromagnetic Niemand hat den Kanal alleine vollstaendig, aber mindestens
 *                   zwei verschiedene Personen decken zusammen beide Gates ab.
 *                   Echte energetische Anziehung.
 *
 *   dominance       ALIAS fuer compromise bei genau 2 Personen, aus Rückwärts-
 *                   kompatibilitaet. Neue Clients sollen 'compromise' nutzen.
 */

// Alle 36 HD-Kanäle (Gate-Paare). Sortiert min→max für Kanal-Key.
export const HD_CHANNELS = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15],
  [6, 59], [7, 31], [9, 52], [10, 20], [10, 34],
  [10, 57], [11, 56], [12, 22], [13, 33], [16, 48],
  [17, 62], [18, 58], [19, 49], [20, 34], [20, 57],
  [21, 45], [23, 43], [24, 61], [25, 51], [26, 44],
  [27, 50], [28, 38], [29, 46], [30, 41], [32, 54],
  [34, 57], [35, 36], [37, 40], [39, 55], [42, 53],
  [47, 64],
];

export function classifyCompositeConnections(channels, gatesByPerson) {
  const nPersons = gatesByPerson.length;
  const gateSets = gatesByPerson.map(arr => new Set(arr));

  const compositeChannels = [];
  const connections = {
    electromagnetic: [],
    compromise:      [],
    companionship:   [],
    parallel:        [],
    dominance:       [],
  };

  for (const [gA, gB] of channels) {
    const hasA = gateSets.map(s => s.has(gA));
    const hasB = gateSets.map(s => s.has(gB));
    if (!hasA.some(Boolean) && !hasB.some(Boolean)) continue;

    const channelKey = `${gA}-${gB}`;

    const count = gateSets.map((_, i) => (hasA[i] ? 1 : 0) + (hasB[i] ? 1 : 0));
    const completePersons = count.map((c, i) => c === 2 ? i : -1).filter(i => i >= 0);
    const partialPersons  = count.map((c, i) => c === 1 ? i : -1).filter(i => i >= 0);

    const personsByGate = { [gA]: [], [gB]: [] };
    gateSets.forEach((_, i) => {
      if (hasA[i]) personsByGate[gA].push(i);
      if (hasB[i]) personsByGate[gB].push(i);
    });

    if (completePersons.length >= 2) {
      connections.parallel.push({
        channel: channelKey,
        gates: [gA, gB],
        completePersons,
      });
      if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);

    } else if (completePersons.length === 1 && partialPersons.length === 0) {
      connections.companionship.push({
        channel: channelKey,
        gates: [gA, gB],
        completePerson: completePersons[0],
      });
      if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);

    } else if (completePersons.length === 1 && partialPersons.length >= 1) {
      const completePerson = completePersons[0];
      const partialDetails = partialPersons.map(pi => ({
        person: pi,
        gate: hasA[pi] ? gA : gB,
      }));
      connections.compromise.push({
        channel:        channelKey,
        gates:          [gA, gB],
        completePerson,
        partialPersons,
        partialDetails,
      });
      if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);

      if (nPersons === 2) {
        connections.dominance.push({
          channel:  channelKey,
          dominant: completePerson,
          other:    partialPersons[0],
        });
      }

    } else if (completePersons.length === 0
               && personsByGate[gA].length >= 1
               && personsByGate[gB].length >= 1) {
      const aPersons = personsByGate[gA];
      const bPersons = personsByGate[gB];
      const emCovered = aPersons.some(pa => bPersons.some(pb => pa !== pb));
      if (emCovered) {
        connections.electromagnetic.push({
          channel: channelKey,
          gates: [gA, gB],
          personsByGate,
        });
        if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);
      }
    }
  }

  return { channels: compositeChannels, connections };
}

/**
 * Convenience-Wrapper für 2-Personen-Verbindungen.
 *
 * Liefert flache Arrays statt einer Personen-Indizes-Struktur,
 * damit die Aufrufer in server.js (analyzeConnectionDynamics)
 * minimal-invasiv portieren können.
 *
 * @param {number[]} gatesA - aktivierte Gates Person A
 * @param {number[]} gatesB - aktivierte Gates Person B
 * @returns {{
 *   electromagnetic: Array<{channel: string, gates: [number, number]}>,
 *   compromise:      Array<{channel: string, gates: [number, number], dominantSide: 'A'|'B', partialGate: number}>,
 *   companionship:   Array<{channel: string, gates: [number, number], side: 'A'|'B'}>,
 *   parallel:        Array<{channel: string, gates: [number, number]}>,
 * }}
 */
export function classifyTwoPersonChannels(gatesA, gatesB) {
  const result = classifyCompositeConnections(HD_CHANNELS, [gatesA, gatesB]);
  const { connections } = result;

  return {
    electromagnetic: connections.electromagnetic.map(e => ({
      channel: e.channel,
      gates: e.gates,
    })),
    compromise: connections.compromise.map(c => ({
      channel: c.channel,
      gates: c.gates,
      dominantSide: c.completePerson === 0 ? 'A' : 'B',
      partialGate: c.partialDetails[0]?.gate,
    })),
    companionship: connections.companionship.map(c => ({
      channel: c.channel,
      gates: c.gates,
      side: c.completePerson === 0 ? 'A' : 'B',
    })),
    parallel: connections.parallel.map(p => ({
      channel: p.channel,
      gates: p.gates,
    })),
  };
}

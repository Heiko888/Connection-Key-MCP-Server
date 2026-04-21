/**
 * Composite-Verbindungs-Klassifikation fuer n Personen.
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
 *                   andere hat nur 1 Gate davon. Die Partial-Person drueckt am
 *                   einzelnen Gate — Reibung ohne Kanal-Gestaltung.
 *
 *   electromagnetic Niemand hat den Kanal alleine vollstaendig, aber mindestens
 *                   zwei verschiedene Personen decken zusammen beide Gates ab.
 *                   Das ist die echte energetische Anziehung.
 *
 *   (sonst)         Kein Kanal-Fall — wird nicht zurueckgegeben.
 *
 *   dominance       ALIAS fuer compromise bei genau 2 Personen, nur aus
 *                   Rueckwaertskompatibilitaet im Response-Objekt. Neue Clients
 *                   sollen 'compromise' nutzen.
 *
 * Input:
 *   channels     Array von [gateA, gateB] — alle 36 HD-Kanaele
 *   gatesByPerson Array<number[]> — pro Person die Liste ihrer aktivierten Gates
 *
 * Output:
 *   {
 *     channels: string[]                 — alle Kanal-Keys die in irgendeiner Kategorie stehen
 *     connections: {
 *       electromagnetic: Entry[],
 *       compromise: Entry[],
 *       companionship: Entry[],
 *       parallel: Entry[],
 *       dominance: Entry[]               — nur fuer persons === 2
 *     }
 *   }
 */
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

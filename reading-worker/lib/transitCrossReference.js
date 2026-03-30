/**
 * transitCrossReference.js
 * Berechnet die Schnittmenge zwischen Transit-Toren und dem persönlichen Chart.
 * Liefert menschenlesbare Sätze für den Tagesimpuls-Prompt.
 */

// Alle 36 Human Design Kanal-Paare (Tor A — Tor B)
const CHANNEL_PAIRS = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31],
  [9, 52], [10, 20], [10, 34], [10, 57], [11, 56], [12, 22],
  [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34],
  [20, 57], [21, 45], [23, 43], [24, 61], [25, 51], [26, 44],
  [27, 50], [28, 38], [29, 46], [30, 41], [32, 54], [34, 57],
  [35, 36], [37, 40], [39, 55], [42, 53], [47, 64],
];

// Tor → Zentrum Mapping (alle 64 Tore)
const GATE_TO_CENTER = {
  // Head
  61: 'head', 63: 'head', 64: 'head',
  // Ajna
  47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 43: 'ajna', 11: 'ajna',
  // Throat
  62: 'throat', 23: 'throat', 56: 'throat', 35: 'throat', 12: 'throat',
  45: 'throat', 33: 'throat', 8: 'throat', 31: 'throat', 20: 'throat',
  16: 'throat',
  // G-Center
  1: 'g', 13: 'g', 25: 'g', 46: 'g', 2: 'g', 15: 'g', 10: 'g', 7: 'g',
  // Heart/Ego
  21: 'heart', 40: 'heart', 26: 'heart', 51: 'heart',
  // Solar Plexus
  36: 'solarplexus', 22: 'solarplexus', 37: 'solarplexus', 6: 'solarplexus',
  49: 'solarplexus', 55: 'solarplexus', 30: 'solarplexus',
  // Sacral
  5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral', 9: 'sacral',
  3: 'sacral', 42: 'sacral', 27: 'sacral', 34: 'sacral',
  // Spleen
  48: 'spleen', 57: 'spleen', 44: 'spleen', 50: 'spleen', 32: 'spleen',
  28: 'spleen', 18: 'spleen',
  // Root
  58: 'root', 38: 'root', 54: 'root', 53: 'root', 60: 'root',
  52: 'root', 19: 'root', 39: 'root', 41: 'root',
};

const CENTER_NAMES_DE = {
  head: 'Kopf', ajna: 'Ajna', throat: 'Kehlkopf', g: 'G-Zentrum',
  heart: 'Herz/Ego', solarplexus: 'Solarplexus', sacral: 'Sakral',
  spleen: 'Milz', root: 'Wurzel',
};

/**
 * Normalisiert ein Gate-Array aus verschiedenen möglichen Formaten.
 * Akzeptiert: [17], [{ number: 17 }], [{ gate: 17 }]
 */
function normalizeGates(gates) {
  if (!Array.isArray(gates)) return new Set();
  return new Set(gates.map(g => {
    if (typeof g === 'number') return g;
    if (typeof g === 'object') return g.number || g.gate || null;
    return parseInt(g, 10) || null;
  }).filter(Boolean));
}

/**
 * Extrahiert offene Zentren aus dem Chart.
 * centers: { sacral: true, head: false, ... }  (true = definiert)
 * Akzeptiert auch: { sacral: { defined: true }, ... }
 */
function getOpenCenters(centers) {
  if (!centers || typeof centers !== 'object') return new Set();
  return new Set(
    Object.entries(centers)
      .filter(([, v]) => {
        if (typeof v === 'boolean') return !v;
        if (typeof v === 'object' && v !== null) return !v.defined;
        return false;
      })
      .map(([k]) => k)
  );
}

/**
 * Hauptfunktion: Berechnet die Kreuzreferenz zwischen Transit und persönlichem Chart.
 *
 * @param {Object} transitData  - { sun, moon, earth, allPlanets, ... }
 * @param {Object} clientChart  - { gates, centers, type, ... }
 * @returns {{ activatedGates, completedChannels, conditionedCenters, summary, compact }}
 */
export function calculateCrossReference(transitData, clientChart) {
  const result = {
    activatedGates: [],
    completedChannels: [],
    conditionedCenters: [],
    summary: [],
    compact: '',
  };

  if (!transitData || !clientChart) {
    result.summary.push('Keine Transit- oder Chart-Daten für Kreuzreferenz verfügbar.');
    result.compact = result.summary[0];
    return result;
  }

  const clientGates = normalizeGates(clientChart.gates);
  const openCenters = getOpenCenters(clientChart.centers);

  // Transit-Planeten zusammenstellen: sun, moon, earth + optional allPlanets
  const transitPlanets = [];
  const add = (planet, data) => data?.gate && transitPlanets.push({ planet, gate: Number(data.gate), line: data.line });
  add('Sonne', transitData.sun);
  add('Mond', transitData.moon);
  add('Erde', transitData.earth);
  add('Merkur', transitData.mercury);
  add('Venus', transitData.venus);
  add('Mars', transitData.mars);
  add('Jupiter', transitData.jupiter);
  // Deduplication by gate
  if (Array.isArray(transitData.allPlanets)) {
    for (const p of transitData.allPlanets) {
      if (p?.gate && !transitPlanets.some(t => t.gate === Number(p.gate))) {
        transitPlanets.push({ planet: p.planet || 'Planet', gate: Number(p.gate), line: p.line });
      }
    }
  }

  for (const transit of transitPlanets) {
    const g = transit.gate;

    // 1. Transit-Tor im persönlichen Chart definiert?
    if (clientGates.has(g)) {
      result.activatedGates.push(transit);
      result.summary.push(
        `${transit.planet} aktiviert heute dein Tor ${g} — du spürst diese Energie besonders intensiv.`
      );
    }

    // 2. Vervollständigt das Transit-Tor einen Kanal im Chart?
    for (const [a, b] of CHANNEL_PAIRS) {
      const partner = (g === a && clientGates.has(b)) ? b
                    : (g === b && clientGates.has(a)) ? a
                    : null;
      if (partner !== null) {
        const channelKey = `${Math.min(a, b)}-${Math.max(a, b)}`;
        // Nur einmal pro Kanal
        if (!result.completedChannels.some(c => c.key === channelKey)) {
          result.completedChannels.push({ transit: g, client: partner, planet: transit.planet, key: channelKey });
          result.summary.push(
            `${transit.planet} in Tor ${g} vervollständigt heute deinen Kanal ${channelKey}. Ein neuer Energiestrom öffnet sich.`
          );
        }
      }
    }

    // 3. Transit-Tor in offenem Zentrum?
    const center = GATE_TO_CENTER[g];
    if (center && openCenters.has(center)) {
      if (!result.conditionedCenters.some(c => c.center === center)) {
        result.conditionedCenters.push({ planet: transit.planet, gate: g, center });
        const name = CENTER_NAMES_DE[center] || center;
        result.summary.push(
          `${transit.planet} in Tor ${g} aktiviert dein offenes ${name}-Zentrum. Achte darauf, diese Energie nicht als deine eigene zu verwechseln.`
        );
      }
    }
  }

  // Fallback
  if (result.summary.length === 0) {
    result.summary.push(
      'Die heutigen Transite wirken auf das kollektive Feld. Beobachte, wie die Energie dich indirekt beeinflusst.'
    );
  }

  result.compact = result.summary.join('\n');
  return result;
}

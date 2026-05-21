/**
 * Deterministische Berechnung der Verbindungs-Fakten zwischen 2 Charts.
 * Output wird wörtlich in den Reading-Prompt eingespeist — Claude darf
 * NUR die hier gelisteten Kanäle erwähnen.
 */

import { CHANNELS, GATE_TO_CENTER, channelCentersLabel, centerLabel } from './channels.js';

function toGateNumber(g) {
  if (g == null) return null;
  if (typeof g === 'number') return g;
  if (typeof g === 'string') {
    const n = parseInt(g, 10);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof g === 'object') {
    const candidate = g.number ?? g.gate ?? g.id;
    return toGateNumber(candidate);
  }
  return null;
}

export function gatesToSet(gates) {
  if (!Array.isArray(gates)) return new Set();
  const out = new Set();
  for (const g of gates) {
    const n = toGateNumber(g);
    if (n != null) out.add(n);
  }
  return out;
}

// Defensive: erkennt 'definiert' / 'defined' / true / {defined:true} / {status:'defined'}
// Toleriert Key-Varianten (Dash↔Underscore, englisch↔deutsch).
const CENTER_KEY_ALIASES = {
  head:         ['head', 'krone'],
  ajna:         ['ajna'],
  throat:       ['throat', 'kehle'],
  g:            ['g', 'g_zentrum', 'g-zentrum', 'gzentrum', 'gZentrum'],
  heart:        ['heart', 'herz', 'herz_ego', 'herz-ego', 'herzego', 'herzEgo'],
  solar_plexus: ['solar_plexus', 'solar-plexus', 'solarplexus', 'sp'],
  spleen:       ['spleen', 'milz'],
  sacral:       ['sacral', 'sakral'],
  root:         ['root', 'wurzel'],
};

function resolveCenterValue(centers, key) {
  if (!centers || !key) return undefined;
  const candidates = CENTER_KEY_ALIASES[key] || [key];
  for (const k of candidates) {
    if (k in centers) return centers[k];
  }
  return undefined;
}

function isCenterDefined(centers, key) {
  const v = resolveCenterValue(centers, key);
  if (v == null) return false;
  if (v === true) return true;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return s === 'definiert' || s === 'defined';
  }
  if (typeof v === 'object') {
    if (v.defined === true) return true;
    if (typeof v.status === 'string') {
      const s = v.status.toLowerCase();
      return s === 'definiert' || s === 'defined';
    }
  }
  return false;
}

// Berechnet pro Kanal die Goldader-Effekte (erweiterte Definition):
// Goldader = das aktivierte Kanal-Ende trifft auf eine Person, deren entsprechendes
// Zentrum vorher offen/undefiniert war. Funktioniert für EM, Dominanz, Kompromiss —
// nicht für Companionship (dort haben beide schon vollen Kanal → beide Zentren definiert).
function computeGoldenEffectsForChannel(ch, p1Centers, p2Centers, p1Has, p2Has) {
  const [a, b] = ch.gates;
  const [cA, cB] = ch.centers;
  const effects = [];
  // P2 bringt Tor a → P1 erlebt cA aktiviert wenn cA bei P1 vorher offen war
  if (p2Has[a] && !isCenterDefined(p1Centers, cA)) {
    effects.push({ recipient: 'P1', via_gate: a, center: cA });
  }
  // P2 bringt Tor b → P1 erlebt cB aktiviert
  if (p2Has[b] && !isCenterDefined(p1Centers, cB)) {
    effects.push({ recipient: 'P1', via_gate: b, center: cB });
  }
  // P1 bringt Tor a → P2 erlebt cA aktiviert
  if (p1Has[a] && !isCenterDefined(p2Centers, cA)) {
    effects.push({ recipient: 'P2', via_gate: a, center: cA });
  }
  // P1 bringt Tor b → P2 erlebt cB aktiviert
  if (p1Has[b] && !isCenterDefined(p2Centers, cB)) {
    effects.push({ recipient: 'P2', via_gate: b, center: cB });
  }
  return effects;
}

/**
 * Klassifiziert alle 36 Kanäle in der Verbindung:
 * - companionship: beide haben den vollen Kanal
 * - electromagnetic: einer hat eine Hälfte, der andere die andere — gemeinsam wird der Kanal aktiviert
 * - dominance:      einer hat den vollen Kanal, der andere keine Hälfte
 * - compromise:     einer hat den vollen Kanal, der andere genau eine Hälfte
 * - sharedGates:    Tore, die beide aktiviert haben (auch ohne Kanal-Bildung)
 */
export function buildRelationshipFacts(gates1, centers1, gates2, centers2) {
  // Backwards-Compat: alter 2-Argument-Aufruf (gates1, gates2) bleibt funktionsfähig,
  // dann gibt es eben keine Goldader-Berechnung (centers fehlen).
  if (Array.isArray(centers1) && centers2 === undefined) {
    gates2 = centers1;
    centers1 = null;
    centers2 = null;
  }

  const s1 = gatesToSet(gates1);
  const s2 = gatesToSet(gates2);

  const companionship = [];
  const electromagnetic = [];
  const dominanceP1 = []; // Person 1 hat ganzen Kanal, Person 2 keine Hälfte
  const dominanceP2 = [];
  const compromiseP1 = []; // Person 1 hat ganzen Kanal, Person 2 nur 1 Hälfte
  const compromiseP2 = [];
  const goldenThreads = []; // erweiterte Goldader-Definition (definiert aktiviert offen)

  for (const ch of CHANNELS) {
    const [a, b] = ch.gates;
    const p1A = s1.has(a), p1B = s1.has(b);
    const p2A = s2.has(a), p2B = s2.has(b);
    const p1Both = p1A && p1B;
    const p2Both = p2A && p2B;
    const unionA = p1A || p2A;
    const unionB = p1B || p2B;

    if (!(unionA && unionB)) continue; // Kanal kann gar nicht aktiviert werden

    // Konstellation
    let kind = null;
    if (p1Both && p2Both) {
      companionship.push({ ch });
      kind = 'companionship';
    } else if (p1Both) {
      const p2Half = p2A || p2B;
      if (!p2Half) { dominanceP1.push({ ch }); kind = 'dominanceP1'; }
      else { compromiseP1.push({ ch, p2HasGate: p2A ? a : b }); kind = 'compromiseP1'; }
    } else if (p2Both) {
      const p1Half = p1A || p1B;
      if (!p1Half) { dominanceP2.push({ ch }); kind = 'dominanceP2'; }
      else { compromiseP2.push({ ch, p1HasGate: p1A ? a : b }); kind = 'compromiseP2'; }
    } else {
      const p1Has = [];
      const p2Has = [];
      if (p1A) p1Has.push(a); if (p1B) p1Has.push(b);
      if (p2A) p2Has.push(a); if (p2B) p2Has.push(b);
      electromagnetic.push({ ch, p1Has, p2Has });
      kind = 'electromagnetic';
    }

    // Goldader-Effekte (nur wenn centers verfuegbar — sonst skip).
    // Companionship bringt keine Goldader: beide haben den Kanal voll, beide Zentren bereits definiert.
    if (centers1 && centers2 && kind !== 'companionship') {
      const p1Has = { [a]: p1A, [b]: p1B };
      const p2Has = { [a]: p2A, [b]: p2B };
      const effects = computeGoldenEffectsForChannel(ch, centers1, centers2, p1Has, p2Has);
      if (effects.length > 0) {
        goldenThreads.push({ ch, kind, effects });
      }
    }
  }

  // Geteilte Tore (auch wenn sie keinen Kanal bilden)
  const sharedGates = [];
  for (const g of s1) {
    if (s2.has(g)) sharedGates.push(g);
  }
  sharedGates.sort((a, b) => a - b);

  return {
    companionship,
    electromagnetic,
    dominanceP1,
    dominanceP2,
    compromiseP1,
    compromiseP2,
    goldenThreads,
    sharedGates,
    counts: {
      companionship: companionship.length,
      electromagnetic: electromagnetic.length,
      dominanceP1: dominanceP1.length,
      dominanceP2: dominanceP2.length,
      compromiseP1: compromiseP1.length,
      compromiseP2: compromiseP2.length,
      goldenThreads: goldenThreads.length,
      sharedGates: sharedGates.length,
    },
  };
}

function chCenters(ch) {
  return channelCentersLabel(ch);
}

function chLabel(ch) {
  return `Kanal ${ch.id} „${ch.name_de}" (${chCenters(ch)})`;
}

/**
 * Formatiert die Fakten als deutschen Text-Block für den Prompt.
 */
export function formatFactsForPrompt(facts, p1Name, p2Name) {
  const lines = [];
  const N1 = p1Name || 'Person 1';
  const N2 = p2Name || 'Person 2';

  lines.push('## Berechnete Verbindungs-Fakten (deterministisch — verwende AUSSCHLIESSLICH diese)');
  lines.push('');

  if (facts.companionship.length) {
    lines.push(`### Companionship (beide haben den vollen Kanal — ${facts.companionship.length})`);
    for (const { ch } of facts.companionship) lines.push(`- ${chLabel(ch)}`);
    lines.push('');
  }

  if (facts.electromagnetic.length) {
    lines.push(`### Elektromagnetische Kanäle (gemeinsame Aktivierung — ${facts.electromagnetic.length})`);
    for (const { ch, p1Has, p2Has } of facts.electromagnetic) {
      const parts = [];
      if (p1Has.length) parts.push(`${N1} hat Tor ${p1Has.join(' & ')}`);
      if (p2Has.length) parts.push(`${N2} hat Tor ${p2Has.join(' & ')}`);
      lines.push(`- ${chLabel(ch)} — ${parts.join(', ')}`);
    }
    lines.push('');
  }

  if (facts.dominanceP1.length) {
    lines.push(`### Dominanz ${N1} (${N1} hat den vollen Kanal, ${N2} keine Hälfte — ${facts.dominanceP1.length})`);
    for (const { ch } of facts.dominanceP1) lines.push(`- ${chLabel(ch)}`);
    lines.push('');
  }
  if (facts.dominanceP2.length) {
    lines.push(`### Dominanz ${N2} (${N2} hat den vollen Kanal, ${N1} keine Hälfte — ${facts.dominanceP2.length})`);
    for (const { ch } of facts.dominanceP2) lines.push(`- ${chLabel(ch)}`);
    lines.push('');
  }

  if (facts.compromiseP1.length) {
    lines.push(`### Kompromiss-Kanäle ${N1} dominant (${facts.compromiseP1.length})`);
    for (const { ch, p2HasGate } of facts.compromiseP1) {
      lines.push(`- ${chLabel(ch)} — ${N1} hat den ganzen Kanal, ${N2} hat zusätzlich Tor ${p2HasGate}`);
    }
    lines.push('');
  }
  if (facts.compromiseP2.length) {
    lines.push(`### Kompromiss-Kanäle ${N2} dominant (${facts.compromiseP2.length})`);
    for (const { ch, p1HasGate } of facts.compromiseP2) {
      lines.push(`- ${chLabel(ch)} — ${N2} hat den ganzen Kanal, ${N1} hat zusätzlich Tor ${p1HasGate}`);
    }
    lines.push('');
  }

  if (facts.goldenThreads && facts.goldenThreads.length) {
    // Erweiterte Goldader-Definition: definiertes Zentrum aktiviert offenes (EM, Dominanz, Kompromiss).
    // Companionship-Kanaele bringen keine Goldader.
    lines.push(`### Goldadern (definiertes Zentrum aktiviert offenes — ${facts.goldenThreads.length})`);
    lines.push('Diese Konstellationen sind Goldadern: durch die Verbindung wird bei mindestens einer Person ein vorher offenes Zentrum aktiviert. Bezeichne sie im Reading explizit als "Goldader".');
    for (const { ch, kind, effects } of facts.goldenThreads) {
      const kindLabel = {
        electromagnetic: 'EM-Bruecke (50/50)',
        dominanceP1: `Dominanz ${N1}`,
        dominanceP2: `Dominanz ${N2}`,
        compromiseP1: `Kompromiss ${N1}-dominant`,
        compromiseP2: `Kompromiss ${N2}-dominant`,
      }[kind] || kind;
      const eff = effects.map((e) => {
        const recipientName = e.recipient === 'P1' ? N1 : N2;
        return `${recipientName} erfaehrt ${centerLabel(e.center)} aktiviert (durch Tor ${e.via_gate})`;
      }).join('; ');
      lines.push(`- ${chLabel(ch)} [${kindLabel}] — ${eff}`);
    }
    lines.push('');
  }

  if (facts.sharedGates.length) {
    const withCenters = facts.sharedGates
      .map((g) => {
        const c = GATE_TO_CENTER[g];
        return c ? `${g} (${centerLabel(c)})` : `${g}`;
      })
      .join(', ');
    lines.push(`### Geteilte Einzeltore (beide haben dieses Tor aktiviert — ${facts.sharedGates.length})`);
    lines.push(withCenters);
    lines.push('');
  }

  if (
    !facts.companionship.length &&
    !facts.electromagnetic.length &&
    !facts.dominanceP1.length &&
    !facts.dominanceP2.length &&
    !facts.compromiseP1.length &&
    !facts.compromiseP2.length
  ) {
    lines.push('Es sind keine vollständigen Kanäle zwischen euch aktiviert.');
    lines.push('');
  }

  return lines.join('\n');
}

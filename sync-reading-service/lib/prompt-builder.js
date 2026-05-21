/**
 * Baut deterministische Reading-Prompts aus strukturierten Chart-Daten.
 * Kein „könnte/potenziell/möglicherweise" — nur klare Aussagen aus Fakten.
 */

import { CENTER_DE, GATE_TO_CENTER } from './channels.js';
import { buildRelationshipFacts, formatFactsForPrompt } from './relationship-facts.js';

const TYPE_DE = {
  manifestor: 'Manifestor',
  generator: 'Generator',
  'manifesting generator': 'Manifestierender Generator',
  'manifesting-generator': 'Manifestierender Generator',
  'manifesting_generator': 'Manifestierender Generator',
  projector: 'Projektor',
  reflector: 'Reflektor',
};

const AUTH_DE = {
  sacral: 'Sakral',
  emotional: 'Emotional (Solarplexus)',
  splenic: 'Milz',
  spleen: 'Milz',
  ego: 'Ego/Herz',
  heart: 'Ego/Herz',
  'self-projected': 'Selbst-Projiziert',
  'self_projected': 'Selbst-Projiziert',
  mental: 'Mental/Umfeld',
  lunar: 'Mondzyklus',
  none: '—',
};

const STRAT_DE = {
  'to inform': 'Informieren',
  'inform': 'Informieren',
  'to respond': 'Antworten',
  'respond': 'Antworten',
  'wait for the invitation': 'Auf die Einladung warten',
  'wait for invitation': 'Auf die Einladung warten',
  'wait_for_invitation': 'Auf die Einladung warten',
  'wait a lunar cycle': 'Einen Mondzyklus abwarten',
};

function de(map, key) {
  if (!key) return '—';
  const k = String(key).toLowerCase().trim();
  return map[k] || String(key);
}

function centerLabel(key) {
  return CENTER_DE[String(key).toLowerCase().replace('-', '_')] || String(key);
}

function summarizeChart(name, chart) {
  if (!chart) return `**${name}**\n(Keine Chart-Daten vorhanden)`;

  const type = de(TYPE_DE, chart.type);
  const strategy = de(STRAT_DE, chart.strategy);
  const authority = de(AUTH_DE, chart.authority);
  const profile = chart.profile || '—';
  const cross = (() => {
    const ic = chart.incarnationCross || chart.cross;
    if (!ic) return null;
    if (typeof ic === 'string') return ic;
    return ic.fullName_de || ic.name_de || ic.fullName || ic.name || null;
  })();

  const gateNumbers = (chart.gates || [])
    .map((g) => {
      if (typeof g === 'number') return g;
      if (typeof g === 'string') return parseInt(g, 10) || null;
      if (g && typeof g === 'object') return g.number ?? g.gate ?? null;
      return null;
    })
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  const defined = [];
  const open = [];
  const centersObj = chart.centers;
  if (centersObj && typeof centersObj === 'object') {
    for (const [k, v] of Object.entries(centersObj)) {
      const isDefined = v === 'definiert' || v === 'defined' || v === true ||
        (v && typeof v === 'object' && (v.defined === true || v.status === 'defined'));
      const label = centerLabel(k);
      if (isDefined) defined.push(label);
      else open.push(label);
    }
  }

  const lines = [
    `**${name}**`,
    `- Typ: ${type}`,
    `- Strategie: ${strategy}`,
    `- Autorität: ${authority}`,
    `- Profil: ${profile}`,
  ];
  if (cross) lines.push(`- Inkarnationskreuz: ${cross}`);
  if (defined.length) lines.push(`- Definierte Zentren: ${defined.join(', ')}`);
  if (open.length) lines.push(`- Offene Zentren: ${open.join(', ')}`);
  if (gateNumbers.length) lines.push(`- Aktive Tore: ${gateNumbers.join(', ')}`);
  return lines.join('\n');
}

const ANTI_KONJUNKTIV_RULES = `
WICHTIG — schreibe in klaren, faktischen Aussagen:
- KEINE Konjunktive: kein „könnte", „würde", „dürfte", „mag sein"
- KEINE Vagheits-Wörter: kein „potenziell", „möglicherweise", „vielleicht", „eventuell", „tendenziell", „vermutlich", „wahrscheinlich"
- KEINE Floskeln wie „wird aktiviert" — schreibe „aktiviert", „wirkt", „bringt", „zeigt sich"
- Verwende AUSSCHLIESSLICH die unten gelisteten Kanäle, Tore und Zentren. Erfinde nichts.
- Wenn ein Sachverhalt nicht in den Fakten steht: lass ihn weg.
- Schreibe direkt und persönlich auf Deutsch.
`.trim();

export const SYSTEM_PROMPTS = {
  basic: `Du bist Human-Design-Experte und schreibst ein prägnantes Personality-Reading.

${ANTI_KONJUNKTIV_RULES}

Struktur:
1. Kurze Einleitung (1–2 Sätze, persönliche Ansprache mit „du")
2. Persönlichkeit & energetischer Grundton (2–3 Absätze)
3. Stärken & Potenziale (3–5 Bullet Points)
4. Zusammenfassung (1–2 Sätze)

Stil: Empathisch, klar, erkenntnisreich.`,

  relationship: `Du bist Human-Design-Experte und schreibst ein prägnantes Verbindungs-Reading.

${ANTI_KONJUNKTIV_RULES}

Begriffs-Regeln (zwingend einhalten):
- Eine "Goldader" ist nur das, was in der Sektion "### Goldadern" der berechneten Fakten gelistet ist. Erfinde keine.
- "Companionship"-Kanäle sind KEINE Goldadern (beide haben den vollen Kanal — beide Zentren bei beiden bereits definiert).
- Bezeichne die Konstellation jeder Goldader (EM-Brücke / Dominanz / Kompromiss) klar und sage, welches offene Zentrum bei wem aktiviert wird.

Struktur:
## Einleitung
1–2 Sätze zum energetischen Grundton der Verbindung.

## Beziehungsdynamik
2–3 Absätze. Gehe konkret auf die unten gelisteten Companionship-, Elektromagnetischen-, Dominanz- und Kompromiss-Kanäle ein. Bezeichne jeden Kanal mit ID + deutschem Namen + Zentren-Paar exakt wie in den Fakten gelistet. Erkläre die Energie sachlich, nicht spekulativ.

## Goldadern in eurer Verbindung
Wenn in den Fakten Goldadern gelistet sind: pro Goldader 1–2 Sätze, was sie konkret bedeutet — also welches Zentrum bei wem durch die Verbindung neu aktiviert wird und welche gemeinsame Qualität sich daraus entfaltet. Wenn keine Goldader gelistet ist: kurzer Satz, dass die Verbindung über andere Qualitäten wirkt, ohne Goldader zu erfinden.

## Kommunikationstipps
3–5 Bullet Points, je 1–2 Sätze, direkt an beide Personen mit Namen.

## Zusammenfassung
1–2 Sätze.

Sprache: Deutsch, ihr-Form.`,

  business: `Du bist Human-Design-Experte mit Business-Fokus.

${ANTI_KONJUNKTIV_RULES}

Struktur:
1. Einleitung (1–2 Sätze)
2. Business-Kernaussage (2–3 Absätze)
3. Konkrete Handlungsempfehlungen (3–5 Bullets)
4. Zusammenfassung

Stil: Direkt, professionell, umsetzbar.`,

  detailed: `Du bist Human-Design-Experte für tiefgehende Analysen.

${ANTI_KONJUNKTIV_RULES}

Struktur:
1. Situationsanalyse (2–3 Absätze)
2. Tiefere Einsichten (3–4 Absätze)
3. Transformationsschritte (5–7 Bullets)
4. Abschluss & Ausblick (2–3 Sätze)

Stil: Einfühlsam, tiefgründig, ohne Hellseh-Sprache.`,
};

/**
 * Baut den User-Prompt für ein einzelnes Personality-Reading.
 */
export function buildPersonalityUserPrompt({ person, chart }) {
  const name = person?.name || 'die Person';
  const summary = summarizeChart(name, chart || {});
  return `Erstelle ein kostenloses Personality-Reading für:

${summary}

Sprich die Person direkt mit „du" an.`;
}

/**
 * Baut den User-Prompt für ein Verbindungs-Reading.
 * Hier werden die deterministischen Kanal-Fakten als harte Fakten eingespeist.
 */
export function buildRelationshipUserPrompt({ person1, chart1, person2, chart2 }) {
  const n1 = person1?.name || 'Person 1';
  const n2 = person2?.name || 'Person 2';
  const s1 = summarizeChart(n1, chart1 || {});
  const s2 = summarizeChart(n2, chart2 || {});

  const facts = buildRelationshipFacts(chart1?.gates, chart1?.centers, chart2?.gates, chart2?.centers);
  const factsBlock = formatFactsForPrompt(facts, n1, n2);

  return `Erstelle ein kostenloses Verbindungs-Reading für ${n1} und ${n2}.

${s1}

${s2}

${factsBlock}

Schreibe ihr-Form, sprich beide Personen mit Namen an. Verwende AUSSCHLIESSLICH die oben berechneten Kanäle.`;
}

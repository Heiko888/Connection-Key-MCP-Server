/**
 * Live Reading Agent — Prompt-Builder
 * FIXES (2026-03-31):
 * - centers: boolean + object Format Support
 * - channels: gates-Array Fallback
 * - highlightElements aus echten Chart-Daten
 */

const BASE_SYSTEM_PROMPT = `Du bist ein erfahrener Human Design Experte und Coach-Assistent. Du generierst Talking Points für einen Coach, der gerade ein Live-Reading mit einem Client durchführt.

WICHTIG:
- Du sprichst den COACH an, nicht den Client direkt
- Talking Points sind Gesprächsleitfaden, keine Skripte
- Verwende konkrete Beispiele bezogen auf den spezifischen Chart
- Jeder Talking Point hat: headline, explanation (2-3 Sätze), coachTip (konkrete Frage oder Übung für den Client), keyInsight (ein prägnanter Satz)
- Generiere 3-5 Talking Points pro Step
- Antworte ausschließlich in validem JSON`;

export function buildSystemPrompt(chartData, completedSteps, coachNotes, language = 'de', readingType) {
  const person1Summary = formatPersonSummary(chartData.person1);
  const person2 = chartData.person2;

  const chartSection = person2
    ? `CHART-DATEN (Person 1 — ${chartData.person1.name}):\n${person1Summary}\n\nCHART-DATEN (Person 2 — ${person2.name}):\n${formatPersonSummary(person2)}`
    : `CHART-DATEN DES CLIENTS (${chartData.person1.name}):\n${person1Summary}`;

  const previousContext = buildPreviousContext(completedSteps);
  const coachNotesSection = coachNotes?.trim()
    ? `\nCOACH-NOTIZEN:\n${coachNotes.trim()}`
    : '';

  const languageInstruction = language === 'en'
    ? '\nSPRACHE: Antworte auf Englisch.'
    : '\nSPRACHE: Antworte auf Deutsch.';

  const readingTypeInstruction = readingType
    ? `\nKONTEXT: Dies ist ein ${readingType}-Reading. Passe die Talking Points entsprechend an.`
    : '';

  return [
    BASE_SYSTEM_PROMPT,
    '',
    chartSection,
    previousContext ? `\nBISHERIGER SESSION-KONTEXT:\n${previousContext}` : '',
    coachNotesSection,
    readingTypeInstruction,
    languageInstruction,
  ].filter(Boolean).join('\n');
}

export function buildStepUserPrompt(stepId, chartData) {
  const person1 = chartData.person1;
  const person2 = chartData.person2;

  const focus = getStepFocus(stepId, person1, person2);

  return `${focus}

Antworte NUR mit einem JSON-Objekt in diesem Format (kein Markdown, kein Text davor/danach):
{
  "talkingPoints": [
    {
      "id": "tp-1",
      "headline": "string",
      "explanation": "string (2-3 Sätze)",
      "coachTip": "string (konkrete Frage oder Übung)",
      "keyInsight": "string (ein Satz)"
    }
  ],
  "transitionPrompt": "string (Überleitung zum nächsten Step)"
}`;
}

export function buildSummaryPrompt(session) {
  const entries = Object.entries(session.completed_steps || {});
  const contextSummary = entries.map(([stepId, step]) => {
    const points = (step.result?.talkingPoints || [])
      .map((tp) => `- ${tp.headline}: ${tp.keyInsight}`)
      .join('\n');
    return `=== ${stepId} ===\n${points}`;
  }).join('\n\n');

  const system = `Du bist ein Human Design Experte. Erstelle eine Session-Zusammenfassung für den Coach basierend auf den generierten Talking Points.
Sprache: ${session.language === 'en' ? 'Englisch' : 'Deutsch'}

SESSION-KONTEXT:
${contextSummary}`;

  const user = `Fasse die wichtigsten Insights zusammen und gib 3-5 konkrete Next Steps für den Client.

Antworte NUR mit diesem JSON (kein Markdown):
{
  "keyInsights": ["string", "string", "string"],
  "nextSteps": ["string", "string", "string"]
}`;

  return { system, user };
}

export function buildHighlightElements(stepId, chartData) {
  const person1 = chartData.person1;
  const { defined, open } = parseCenters(person1.centers);
  const channels = formatChannelIds(person1.channels);
  const gates = (person1.gates || []).map((g) => g.number);

  switch (stepId) {
    case 'type_strategy':
      return { centers: defined, channels: [], gates: [] };
    case 'authority':
      return { centers: getAuthorityCenters(person1.authority, defined), channels: [], gates: [] };
    case 'profile':
      return { centers: [], channels: [], gates: [] };
    case 'defined_centers':
      return { centers: defined, channels, gates };
    case 'open_centers':
      return { centers: open, channels: [], gates: [] };
    case 'channels':
      return { centers: defined, channels, gates };
    default:
      return { centers: defined, channels, gates };
  }
}

function parseCenters(centers) {
  const entries = Object.entries(centers || {});
  const defined = entries
    .filter(([, v]) => typeof v === 'boolean' ? v : v?.defined)
    .map(([k]) => k);
  const open = entries
    .filter(([, v]) => typeof v === 'boolean' ? !v : !v?.defined)
    .map(([k]) => k);
  return { defined, open };
}

function formatChannelId(channel) {
  if (channel.id) return channel.id;
  if (channel.gates && Array.isArray(channel.gates)) return channel.gates.join('-');
  return '?';
}

function formatChannelIds(channels) {
  return (channels || []).map((c) => formatChannelId(c));
}

function formatChannelDisplay(channel) {
  return `${formatChannelId(channel)} (${channel.name || '?'})`;
}

function formatPersonSummary(person) {
  const { defined, open } = parseCenters(person.centers);

  return [
    `Name: ${person.name}`,
    `Typ: ${person.type}`,
    `Strategie: ${person.strategy}`,
    `Autorität: ${person.authority}`,
    `Profil: ${person.profile}`,
    `Inkarnationskreuz: ${person.incarnationCross}`,
    `Definierte Zentren (feste Energie, konsistent): ${defined.join(', ') || '— (vollständig offen = Reflektor)'}`,
    `Offene Zentren (konditionierbar, Weisheitspotenzial): ${open.join(', ') || '— (alle definiert)'}`,
    `Channels: ${(person.channels || []).map((c) => formatChannelDisplay(c)).join(', ') || '—'}`,
    `Gates: ${(person.gates || []).map((g) => `${g.number}.${g.line}`).join(', ') || '—'}`,
  ].join('\n');
}

function buildPreviousContext(completedSteps) {
  const entries = Object.entries(completedSteps || {});
  if (!entries.length) return '';
  return entries.map(([stepId, step]) => {
    const insights = (step.result?.talkingPoints || [])
      .map((tp) => `  - ${tp.headline}: ${tp.keyInsight}`)
      .join('\n');
    const notes = step.coachNotes ? `\n  Coach-Notizen: ${step.coachNotes}` : '';
    return `[${stepId}]\n${insights}${notes}`;
  }).join('\n\n');
}

function getAuthorityCenters(authority, definedCenters) {
  const lowerAuth = (authority || '').toLowerCase();
  const map = {
    'emotional': ['solar-plexus'],
    'sakral': ['sacral'],
    'sacral': ['sacral'],
    'milz': ['spleen'],
    'spleen': ['spleen'],
    'ego': ['heart'],
    'heart': ['heart'],
    'selbst': ['g'],
    'self': ['g', 'throat'],
    'mental': ['ajna', 'head'],
    'lunar': [],
  };
  for (const [key, centers] of Object.entries(map)) {
    if (lowerAuth.includes(key)) return centers.filter((c) => definedCenters.includes(c));
  }
  return definedCenters;
}

// Individuelle (Ein-Personen-)Steps. Im Connection-Mode werden sie für BEIDE
// Personen erzeugt — nicht nur für Person 1 (sonst „Mischmasch": Person 2 wird
// individuell nie analysiert, springt aber in den Paar-Steps unvermittelt rein).
const INDIVIDUAL_STEPS = new Set([
  'type_strategy', 'authority', 'profile', 'defined_centers', 'open_centers', 'channels',
]);

const STEP_FOCUS_LABEL = {
  type_strategy: 'Typ & Strategie',
  authority: 'Autorität',
  profile: 'Profil',
  defined_centers: 'Definierte Zentren',
  open_centers: 'Offene Zentren',
  channels: 'Channels & Gates',
};

function focusForPerson(stepId, person, label) {
  const { defined, open } = parseCenters(person.centers);
  const definedStr = defined.join(', ') || '— (keine)';
  const openStr = open.join(', ') || '— (keine)';
  const channels = (person.channels || []).map((c) => formatChannelDisplay(c)).join(', ') || '—';

  switch (stepId) {
    case 'type_strategy':
      return `Typ (${person.type}) und Strategie (${person.strategy}).
Erkläre was es bedeutet ein ${person.type} zu sein. Was ist die korrekte Strategie? Was passiert wenn die Strategie nicht gelebt wird (Not-Self)?
Beziehe dich auf die konkreten Chart-Daten von ${label}.`;

    case 'authority':
      return `Autorität (${person.authority}).
Wie trifft ${label} korrekte Entscheidungen? Was ist der Unterschied zu Verstand-basierten Entscheidungen?
Gib dem Coach konkrete Fragen und Beispiele die die ${person.authority}-Autorität erfahrbar machen.`;

    case 'profile':
      return `Profil (${person.profile}).
Was sagen die Linien über die bewusste und unbewusste Seite von ${label}? Wie lernt diese Person? Wie interagiert sie mit der Welt?`;

    case 'defined_centers':
      return `DEFINIERTE Zentren von ${label}: ${definedStr}.
WICHTIG: Nur diese Zentren sind definiert (= feste, konsistente Energie).
Was sind die fixen Energien? Wie wirken sie auf andere? Wo ist ${label} konsistent?
Erkläre für JEDES der definierten Zentren (${definedStr}) die konkrete Auswirkung im Alltag.
Verwechsle NICHT definierte mit offenen Zentren.`;

    case 'open_centers':
      return `OFFENE/Undefinierte Zentren von ${label}: ${openStr}.
WICHTIG: Nur diese Zentren sind offen (= konditionierbar, nehmen Energie von außen auf).
Wo nimmt ${label} Energie von außen auf? Welche Not-Self-Themen gibt es? Wo liegt Weisheitspotenzial?
Erkläre für JEDES der offenen Zentren (${openStr}) die spezifische Konditionierung und das Weisheitspotenzial.`;

    case 'channels':
      return `Channels von ${label}: ${channels}.
WICHTIG: Verwende NUR die genannten Channel-IDs. Erfinde KEINE Channel-Nummern.
Welche Lebensthemen und Talente zeigen diese Channels? Wie drücken sie sich im Alltag aus?`;

    default:
      return '';
  }
}

function getStepFocus(stepId, person1, person2) {
  if (INDIVIDUAL_STEPS.has(stepId)) {
    const label1 = person1.name || (person2 ? 'Person 1' : 'der Client');

    // Connection-Mode: BEIDE Personen einzeln abdecken
    if (person2) {
      const label2 = person2.name || 'Person 2';
      return `Fokus: ${STEP_FOCUS_LABEL[stepId]} — individuell für BEIDE Personen (Connection-Reading).
WICHTIG: Erstelle GETRENNTE Talking Points für jede Person — wirf die beiden NICHT zusammen.
Kennzeichne in jeder headline klar, zu wem der Punkt gehört (Präfix "${label1}:" bzw. "${label2}:").
Generiere für JEDE Person eigene Talking Points (insgesamt 5-6, ausgewogen auf beide verteilt).
Dies ist die individuelle Grundlage VOR den Beziehungs-Steps (Composite/Elektromagnetisch/Kompromiss).

=== ${label1} ===
${focusForPerson(stepId, person1, label1)}

=== ${label2} ===
${focusForPerson(stepId, person2, label2)}`;
    }

    // Single-Mode: nur eine Person
    return `Fokus: ${STEP_FOCUS_LABEL[stepId]}.
${focusForPerson(stepId, person1, label1)}`;
  }

  const name1 = person1.name || 'Person 1';
  const name2 = person2?.name || 'Person 2';

  switch (stepId) {
    case 'composite':
      if (!person2) return `Fokus: Composite-Chart. (Kein Person-2-Chart vorhanden — überspringe diesen Step.)`;
      return `Fokus: Composite-Chart von ${name1} und ${name2}.
Welche Zentren werden gemeinsam definiert die einzeln offen sind? Was entsteht als Paar-Energie?`;

    case 'electromagnetic':
      if (!person2) return `Fokus: Elektromagnetische Channels. (Kein Person-2-Chart vorhanden.)`;
      return `Fokus: Elektromagnetische Channels zwischen ${name1} und ${name2}.
Wo hat ${name1} ein Gate und ${name2} das gegenüberliegende? Das sind die stärksten Anziehungskräfte.`;

    case 'compromise':
      if (!person2) return `Fokus: Kompromiss-Channels. (Kein Person-2-Chart vorhanden.)`;
      return `Fokus: Kompromiss-Channels zwischen ${name1} und ${name2}.
Wo haben beide denselben Channel definiert? Wer dominiert? Wo braucht es Kompromiss?`;

    default:
      return `Fokus: Step "${stepId}" — generiere relevante Talking Points basierend auf den Chart-Daten.`;
  }
}

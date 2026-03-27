/**
 * Live Reading Agent — Prompt-Builder
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
  "highlightElements": {
    "centers": ["center_id"],
    "channels": ["gate1-gate2"],
    "gates": [number]
  },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPersonSummary(person) {
  const defined = Object.entries(person.centers || {})
    .filter(([, v]) => v.defined).map(([k]) => k);
  const open = Object.entries(person.centers || {})
    .filter(([, v]) => !v.defined).map(([k]) => k);

  return [
    `Name: ${person.name}`,
    `Typ: ${person.type}`,
    `Strategie: ${person.strategy}`,
    `Autorität: ${person.authority}`,
    `Profil: ${person.profile}`,
    `Inkarnationskreuz: ${person.incarnationCross}`,
    `Definierte Zentren: ${defined.join(', ') || '—'}`,
    `Offene Zentren: ${open.join(', ') || '—'}`,
    `Channels: ${(person.channels || []).map((c) => `${c.id} (${c.name})`).join(', ') || '—'}`,
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

function getStepFocus(stepId, person1, person2) {
  const defined = Object.entries(person1.centers || {})
    .filter(([, v]) => v.defined).map(([k]) => k).join(', ') || '—';
  const open = Object.entries(person1.centers || {})
    .filter(([, v]) => !v.defined).map(([k]) => k).join(', ') || '—';
  const channels = (person1.channels || []).map((c) => `${c.id} (${c.name})`).join(', ') || '—';

  switch (stepId) {
    case 'type_strategy':
      return `Fokus: Typ (${person1.type}) und Strategie (${person1.strategy}).
Erkläre was es bedeutet ein ${person1.type} zu sein. Was ist die korrekte Strategie? Was passiert wenn die Strategie nicht gelebt wird (Not-Self)?
Beziehe dich auf die konkreten Chart-Daten von ${person1.name}.`;

    case 'authority':
      return `Fokus: Autorität (${person1.authority}).
Wie trifft ${person1.name} korrekte Entscheidungen? Was ist der Unterschied zu Verstand-basierten Entscheidungen?
Gib dem Coach konkrete Fragen und Beispiele die die ${person1.authority}-Autorität erfahrbar machen.`;

    case 'profile':
      return `Fokus: Profil (${person1.profile}).
Was sagen die Linien über die bewusste und unbewusste Seite von ${person1.name}? Wie lernt diese Person? Wie interagiert sie mit der Welt?`;

    case 'defined_centers':
      return `Fokus: Definierte Zentren (${defined}).
Was sind die fixen Energien von ${person1.name}? Wie wirken sie auf andere? Wo ist der Client konsistent?
Erkläre für jedes definierte Zentrum die konkrete Auswirkung im Alltag.`;

    case 'open_centers':
      return `Fokus: Offene/Undefinierte Zentren (${open}).
Wo nimmt ${person1.name} Energie von außen auf? Welche Not-Self-Themen gibt es? Wo liegt Weisheitspotenzial?`;

    case 'channels':
      return `Fokus: Channels (${channels}).
Welche Lebensthemen und Talente zeigen die Channels von ${person1.name}? Wie drücken sie sich im Alltag aus?`;

    case 'composite':
      if (!person2) return `Fokus: Composite-Chart. (Kein Person-2-Chart vorhanden — überspringe diesen Step.)`;
      return `Fokus: Composite-Chart von ${person1.name} und ${person2.name}.
Welche Zentren werden gemeinsam definiert die einzeln offen sind? Was entsteht als Paar-Energie?`;

    case 'electromagnetic':
      if (!person2) return `Fokus: Elektromagnetische Channels. (Kein Person-2-Chart vorhanden.)`;
      return `Fokus: Elektromagnetische Channels zwischen ${person1.name} und ${person2.name}.
Wo hat Person 1 ein Gate und Person 2 das gegenüberliegende? Das sind die stärksten Anziehungskräfte.`;

    case 'compromise':
      if (!person2) return `Fokus: Kompromiss-Channels. (Kein Person-2-Chart vorhanden.)`;
      return `Fokus: Kompromiss-Channels zwischen ${person1.name} und ${person2.name}.
Wo haben beide denselben Channel definiert? Wer dominiert? Wo braucht es Kompromiss?`;

    default:
      return `Fokus: Step "${stepId}" — generiere relevante Talking Points basierend auf den Chart-Daten.`;
  }
}

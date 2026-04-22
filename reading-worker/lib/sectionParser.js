// lib/sectionParser.js
// Zerlegt Reading-Text (Markdown) in Bereiche anhand von Heading-Regeln.
// Bereiche entsprechen der CHECK-Liste in reading_sections.area.

const AREA_PATTERNS = [
  { area: 'incarnation_cross', rx: /^#{1,3}\s*(?:\d+\.\s*)?(inkarnationskreuz|incarnation\s*cross)\b.*$/im },
  { area: 'profile',           rx: /^#{1,3}\s*(?:\d+\.\s*)?(profil|profile)\b.*$/im },
  { area: 'type',              rx: /^#{1,3}\s*(?:\d+\.\s*)?(typ|type)\b.*$/im },
  { area: 'authority',         rx: /^#{1,3}\s*(?:\d+\.\s*)?(autorit(?:ä|ae)t|authority)\b.*$/im },
  { area: 'strategy',          rx: /^#{1,3}\s*(?:\d+\.\s*)?(strategie|strategy)\b.*$/im },
  { area: 'centers',           rx: /^#{1,3}\s*(?:\d+\.\s*)?(zentren|centers|energiezentren)\b.*$/im },
  { area: 'channels',          rx: /^#{1,3}\s*(?:\d+\.\s*)?(kan(?:ä|ae)le|channels)\b.*$/im },
  { area: 'gates',             rx: /^#{1,3}\s*(?:\d+\.\s*)?(tore|gates)\b.*$/im },
  { area: 'definition',        rx: /^#{1,3}\s*(?:\d+\.\s*)?(definition)\b.*$/im },
  { area: 'variables',         rx: /^#{1,3}\s*(?:\d+\.\s*)?(variablen|variables|pfeile|arrows)\b.*$/im },
  { area: 'relationship',      rx: /^#{1,3}\s*(?:\d+\.\s*)?(beziehung(?:en)?|relationship)\b.*$/im },
  { area: 'business',          rx: /^#{1,3}\s*(?:\d+\.\s*)?(business|karriere|career|beruf)\b.*$/im },
  { area: 'sleep',             rx: /^#{1,3}\s*(?:\d+\.\s*)?(schlaf|sleep)\b.*$/im },
  { area: 'shadow_patterns',   rx: /^#{1,3}\s*(?:\d+\.\s*)?(schatten|shadow)\b.*$/im },
  { area: 'development',       rx: /^#{1,3}\s*(?:\d+\.\s*)?(entwicklung|development|wachstum)\b.*$/im },
  { area: 'purpose',           rx: /^#{1,3}\s*(?:\d+\.\s*)?(lebenszweck|purpose|life\s*purpose|lebensaufgabe)\b.*$/im },
  { area: 'health',            rx: /^#{1,3}\s*(?:\d+\.\s*)?(gesundheit|health)\b.*$/im },
  { area: 'money',             rx: /^#{1,3}\s*(?:\d+\.\s*)?(geld|(?:ü|ue)berfluss|money|wealth|finanzen)\b.*$/im },
  { area: 'parenting',         rx: /^#{1,3}\s*(?:\d+\.\s*)?(eltern(?:schaft)?|parenting|kinder)\b.*$/im },
  { area: 'sexuality',         rx: /^#{1,3}\s*(?:\d+\.\s*)?(sexualit(?:ä|ae)t|sexuality|intimit(?:ä|ae)t)\b.*$/im },
  { area: 'trauma',            rx: /^#{1,3}\s*(?:\d+\.\s*)?(trauma)\b.*$/im },
  { area: 'life_phases',       rx: /^#{1,3}\s*(?:\d+\.\s*)?(lebensphasen|life\s*phases|jahres)/im },
  { area: 'summary',           rx: /^#{1,3}\s*(?:\d+\.\s*)?(zusammenfassung|summary|fazit|abschluss)\b.*$/im },
];

/**
 * Extrahiert den Text-String aus reading_data.text,
 * das sowohl ein String als auch ein Objekt {text: "..."} sein kann.
 * @param {any} textField reading_data.text
 * @returns {string}
 */
function extractText(textField) {
  if (typeof textField === 'string') return textField;
  if (textField && typeof textField === 'object' && typeof textField.text === 'string') return textField.text;
  return '';
}

/**
 * Zerlegt einen Markdown-Text in Sektionen.
 * @param {string} rawText Fertiger Reading-Text (Markdown) oder reading_data.text (String oder Objekt)
 * @returns {Array<{area: string, content: string}>}
 */
function parseSections(rawText) {
  const text = extractText(rawText);
  if (!text || text.length < 20) return [];

  const lines = text.split(/\r?\n/);
  const headings = [];

  lines.forEach((line, idx) => {
    if (!/^#{1,3}\s+/.test(line)) return;
    for (const { area, rx } of AREA_PATTERNS) {
      if (rx.test(line)) {
        headings.push({ lineIdx: idx, area });
        return;
      }
    }
  });

  if (headings.length === 0) {
    return [{ area: 'other', content: text.trim() }];
  }

  const sections = [];
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].lineIdx;
    const end = (i + 1 < headings.length) ? headings[i + 1].lineIdx : lines.length;
    const chunk = lines.slice(start, end).join('\n').trim();
    if (chunk.length > 0) {
      sections.push({ area: headings[i].area, content: chunk });
    }
  }
  return sections;
}

export { parseSections, extractText, AREA_PATTERNS };

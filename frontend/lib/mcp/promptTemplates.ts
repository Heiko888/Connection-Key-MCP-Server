/**
 * Prompt Templates für MCP-Readings
 * 
 * Deterministische Prompt-Generierung ohne Magic Strings.
 * Gleiche Inputs => gleicher Prompt.
 */

import { getReadingType } from '@/lib/readingTypes';

/**
 * System-Prompt für verschiedene Profile
 * 
 * @param profile - Prompt-Profil ('coach' | 'short')
 * @returns System-Prompt Text
 */
export function getSystemPrompt(profile: string = 'coach'): string {
  switch (profile) {
    case 'coach':
      return `Du bist ein erfahrener Human Design Coach. Deine Aufgabe ist es, präzise, alltagsnahe und praxisorientierte Readings zu erstellen.

Stil:
- Klar und präzise
- Alltagsnah, keine Esoterik-Floskeln
- Strukturiert mit Überschriften und Bulletpoints
- Konkrete, umsetzbare Empfehlungen

Struktur:
- Einleitung: Kurze Zusammenfassung
- Zentrale Erkenntnisse: Die wichtigsten Punkte
- Praktische Empfehlungen: Konkrete Handlungsvorschläge
- Abschluss: Zusammenfassung und nächste Schritte

Vermeide:
- Vage Formulierungen
- Übertriebene Esoterik-Sprache
- Unklare Aussagen ohne Kontext`;

    case 'short':
      return `Du bist ein Human Design Experte. Erstelle kurze, prägnante Readings.

Stil:
- Kompakt und auf den Punkt
- Maximal 3-4 Absätze
- Fokus auf die wichtigsten Erkenntnisse

Struktur:
- Kurze Einleitung
- Zentrale Punkte
- Praktische Empfehlung`;

    default:
      return getSystemPrompt('coach'); // Fallback
  }
}

/**
 * User-Prompt für einen Reading-Type
 * 
 * @param readingTypeKey - Der Reading-Type Key
 * @param input - Strukturiertes Input aus dem Formular
 * @returns User-Prompt Text
 */
export function getUserPrompt(readingTypeKey: string, input: Record<string, any>): string {
  const readingConfig = getReadingType(readingTypeKey);
  if (!readingConfig) {
    throw new Error(`Reading-Konfiguration nicht gefunden für: ${readingTypeKey}`);
  }

  // Input als JSON pretty print
  const inputJson = JSON.stringify(input, null, 2);

  // Reading-Type Label
  const readingLabel = readingConfig.label;

  // Beschreibung, falls vorhanden
  const description = readingConfig.description || '';

  // User-Prompt zusammenbauen
  let prompt = `Erstelle ein ${readingLabel} Human Design Reading.\n\n`;

  if (description) {
    prompt += `Kontext: ${description}\n\n`;
  }

  prompt += `Eingabedaten:\n\`\`\`json\n${inputJson}\n\`\`\`\n\n`;

  prompt += `Bitte erstelle ein vollständiges Reading basierend auf diesen Daten.`;

  return prompt;
}


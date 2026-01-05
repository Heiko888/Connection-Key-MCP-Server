/**
 * AI Reading Quality Reviewer
 * 
 * Bewertet Reading-Texte automatisch nach den 5 Qualitätsmetriken.
 * Optional, nach erfolgreichem MCP-Job.
 */

import { createReadingQuality } from '@/lib/db/reading-quality';
import { getReadingType } from '@/lib/readingTypes';

export interface AIQualityReview {
  clarity: number;
  relevance: number;
  depth: number;
  tone: number;
  actionability: number;
  comment: string;
}

/**
 * Bewertet einen Reading-Text mit AI
 * 
 * @param readingId - Die Reading-ID
 * @param generatedText - Der generierte Text
 * @param readingType - Der Reading-Typ
 * @returns AIQualityReview
 */
export async function reviewReadingQualityWithAI(
  readingId: string,
  generatedText: string,
  readingType: string
): Promise<AIQualityReview> {
  const readingConfig = getReadingType(readingType);
  const readingTypeLabel = readingConfig?.label || readingType;

  // AI-Prompt für Qualitätsbewertung
  const prompt = `Du bist ein erfahrener Quality-Reviewer für Human Design Readings. Bewerte den folgenden Text strikt nach den 5 Metriken (jeweils 0-5):

1. **clarity** (Verständlichkeit, Struktur, Sprachfluss)
2. **relevance** (Bezug zum Reading-Typ "${readingTypeLabel}", Bezug zu Eingaben, keine Halluzinationen)
3. **depth** (Mehrwert, Erkenntnistiefe, nicht oberflächlich)
4. **tone** (passend zur Marke, empathisch, nicht esoterisch-abgehoben, konsistent)
5. **actionability** (konkrete Hinweise, umsetzbare Impulse)

Text:
${generatedText}

Antworte NUR mit einem JSON-Objekt im folgenden Format:
{
  "clarity": <0-5>,
  "relevance": <0-5>,
  "depth": <0-5>,
  "tone": <0-5>,
  "actionability": <0-5>,
  "comment": "<Kurze Begründung der Bewertung, max. 200 Zeichen>"
}

Keine zusätzlichen Erklärungen, nur das JSON-Objekt.`;

  // TODO: AI-Service aufrufen (OpenAI, Anthropic, etc.)
  // Für jetzt: Mock-Implementierung
  // Später: Echter AI-Service-Call

  // Mock-Implementierung (später durch echten AI-Call ersetzen)
  const mockReview: AIQualityReview = {
    clarity: 4,
    relevance: 4,
    depth: 3,
    tone: 4,
    actionability: 3,
    comment: 'Guter Text, könnte mehr Tiefe und konkrete Handlungsimpulse bieten.',
  };

  // Speichere AI-Review
  await createReadingQuality({
    reading_id: readingId,
    clarity: mockReview.clarity,
    relevance: mockReview.relevance,
    depth: mockReview.depth,
    tone: mockReview.tone,
    actionability: mockReview.actionability,
    reviewer_type: 'ai',
    comment: mockReview.comment,
  });

  return mockReview;
}


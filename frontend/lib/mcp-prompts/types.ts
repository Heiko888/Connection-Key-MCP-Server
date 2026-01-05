/**
 * Prompt Template Types
 * 
 * Definiert die Struktur für versionierte, reproduzierbare Prompt-Templates.
 * Jedes Template ist explizit, deterministisch und auditierbar.
 */

export interface PromptTemplate {
  id: string; // z.B. "basic.v1", "connection.v1"
  readingType: string; // Key aus readingTypes
  schemaVersion: string; // z.B. "1.0.0"
  systemPrompt: string; // System-Prompt (Rolle, Tonalität, Regeln)
  userPrompt: (input: Record<string, any>) => string; // Funktion, die User-Prompt aus Input generiert
  outputConstraints: string[]; // Regeln für Output-Format
  meta: {
    tonalität?: 'klar' | 'ruhig' | 'professionell' | 'warm';
    zielgruppe?: 'laien' | 'fortgeschritten' | 'coaches';
    sprache?: 'de' | 'en';
    erstellt?: string; // ISO-Datum
    autor?: string;
  };
}

export interface PromptRegistry {
  [readingType: string]: PromptTemplate;
}


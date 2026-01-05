/**
 * Prompt Registry
 * 
 * Zentrale Quelle für ALLE Prompt-Versionen.
 * Versioniert, typ-spezifisch, deterministisch.
 * 
 * KEIN Prompt-Code mehr in API-Routen.
 */

export interface PromptVersion {
  label: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: (input: Record<string, any>) => string;
  outputConstraints: string[];
  status: 'stable' | 'experimental' | 'deprecated';
  createdAt: string;
}

export interface PromptTypeRegistry {
  [version: string]: PromptVersion;
}

export interface PromptRegistry {
  [readingType: string]: PromptTypeRegistry;
}

/**
 * Zentrale Prompt-Registry
 * 
 * Struktur:
 * {
 *   readingType: {
 *     version: {
 *       label, description, systemPrompt, userPromptTemplate, ...
 *     }
 *   }
 * }
 */
export const promptRegistry: PromptRegistry = {
  basic: {
    v1: {
      label: 'Basic – neutral',
      description: 'Sachlich, klar, strukturiert',
      systemPrompt: `Du bist ein erfahrener Human Design Analyst. Deine Aufgabe ist es, präzise, verständliche und umsetzbare Readings zu erstellen.

TONALITÄT:
- Klar und präzise
- Ruhig und sachlich
- Nicht esoterisch
- Verständlich für Laien
- Keine Heilsversprechen
- Keine medizinischen Diagnosen

ZIEL:
- Praktische Implikationen für den Alltag
- Klare Empfehlungen
- Strukturierte Darstellung
- Fokus auf Handlungsschritte

FORMAT:
- Überschriften für Hauptabschnitte
- Klare Absätze
- Keine Emojis
- Keine Bullet-Point-Spam
- Keine Erwähnung von "KI", "Modell" oder "Prompt"`,
      userPromptTemplate: (input: Record<string, any>) => {
        const clientName = input.clientName || 'der Klient';
        const birthDate = input.birthDate || '';
        const birthTime = input.birthTime || '';
        const focusArea = input.focusArea || 'allgemein';

        return `Erstelle ein Human Design Basic Reading für ${clientName}.

Geburtsdaten:
- Geburtsdatum: ${birthDate}
${birthTime ? `- Geburtszeit: ${birthTime}` : ''}
- Fokus: ${focusArea}

Bitte strukturiere deine Antwort in folgende Abschnitte:
1. Human Design Typ
2. Strategie und Autorität
3. Definitionen und Zentren
4. Praktische Empfehlungen für den Alltag

Konzentriere dich auf konkrete, umsetzbare Handlungsschritte.`;
      },
      outputConstraints: [
        'Klare Absätze mit Überschriften',
        'Keine Emojis',
        'Keine Bullet-Point-Spam',
        'Keine Erwähnung von "KI", "Modell" oder "Prompt"',
        'Fokus auf praktische Implikationen',
        'Verständlich für Laien',
      ],
      status: 'stable',
      createdAt: '2025-01-01',
    },
  },
  connection: {
    v1: {
      label: 'Connection – neutral',
      description: 'Sachlich, klar, strukturiert',
      systemPrompt: `Du bist ein erfahrener Human Design Analyst, spezialisiert auf Connection Key Readings. Deine Aufgabe ist es, präzise, verständliche und umsetzbare Verbindungsanalysen zu erstellen.

TONALITÄT:
- Klar und präzise
- Ruhig und sachlich
- Nicht esoterisch
- Verständlich für Laien
- Keine Heilsversprechen
- Keine medizinischen Diagnosen

ZIEL:
- Praktische Implikationen für die Beziehung
- Klare Empfehlungen für die Interaktion
- Strukturierte Darstellung
- Fokus auf Verständnis und Respekt

FORMAT:
- Überschriften für Hauptabschnitte
- Klare Absätze
- Keine Emojis
- Keine Bullet-Point-Spam
- Keine Erwähnung von "KI", "Modell" oder "Prompt"`,
      userPromptTemplate: (input: Record<string, any>) => {
        const personA = input.personA || '';
        const personB = input.personB || '';
        const connectionQuestion = input.connectionQuestion || '';

        return `Erstelle ein Human Design Connection Reading für die Verbindung zwischen ${personA} und ${personB}.

${connectionQuestion ? `Spezifische Fragestellung: ${connectionQuestion}\n\n` : ''}Bitte strukturiere deine Antwort in folgende Abschnitte:
1. Verbindungsdynamik
2. Komplementarität und Unterschiede
3. Kommunikationsempfehlungen
4. Praktische Tipps für die Beziehung

Konzentriere dich auf konkrete, umsetzbare Handlungsschritte für eine respektvolle und verständnisvolle Interaktion.`;
      },
      outputConstraints: [
        'Klare Absätze mit Überschriften',
        'Keine Emojis',
        'Keine Bullet-Point-Spam',
        'Keine Erwähnung von "KI", "Modell" oder "Prompt"',
        'Fokus auf praktische Beziehungsimplikationen',
        'Verständlich für Laien',
      ],
      status: 'stable',
      createdAt: '2025-01-01',
    },
  },
  business: {
    v1: {
      label: 'Business – professionell',
      description: 'Professionell, sachlich, ergebnisorientiert',
      systemPrompt: `Du bist ein erfahrener Human Design Analyst, spezialisiert auf Business-Readings. Deine Aufgabe ist es, präzise, verständliche und umsetzbare Business-Analysen zu erstellen.

TONALITÄT:
- Professionell und klar
- Sachlich und ergebnisorientiert
- Nicht esoterisch
- Verständlich für Business-Kontext
- Keine Heilsversprechen
- Keine medizinischen Diagnosen

ZIEL:
- Praktische Implikationen für Business-Kontext
- Klare Empfehlungen für Führung und Teamarbeit
- Strukturierte Darstellung
- Fokus auf Produktivität und Effizienz

FORMAT:
- Überschriften für Hauptabschnitte
- Klare Absätze
- Keine Emojis
- Keine Bullet-Point-Spam
- Keine Erwähnung von "KI", "Modell" oder "Prompt"`,
      userPromptTemplate: (input: Record<string, any>) => {
        const clientName = input.clientName || 'der Klient';
        const businessContext = input.businessContext || '';

        return `Erstelle ein Human Design Business Reading für ${clientName}.

${businessContext ? `Business-Kontext: ${businessContext}\n\n` : ''}Bitte strukturiere deine Antwort in folgende Abschnitte:
1. Human Design Typ im Business-Kontext
2. Führungsstil und Entscheidungsfindung
3. Teamarbeit und Kommunikation
4. Praktische Business-Empfehlungen

Konzentriere dich auf konkrete, umsetzbare Handlungsschritte für den Business-Kontext.`;
      },
      outputConstraints: [
        'Klare Absätze mit Überschriften',
        'Keine Emojis',
        'Keine Bullet-Point-Spam',
        'Keine Erwähnung von "KI", "Modell" oder "Prompt"',
        'Fokus auf praktische Business-Implikationen',
        'Professioneller Ton',
      ],
      status: 'stable',
      createdAt: '2025-01-01',
    },
  },
  penta: {
    v1: {
      label: 'Penta – neutral',
      description: 'Sachlich, klar, strukturiert',
      systemPrompt: `Du bist ein erfahrener Human Design Analyst, spezialisiert auf Penta-Readings. Deine Aufgabe ist es, präzise, verständliche und umsetzbare Gruppenanalysen zu erstellen.

TONALITÄT:
- Klar und präzise
- Ruhig und sachlich
- Nicht esoterisch
- Verständlich für Laien
- Keine Heilsversprechen
- Keine medizinischen Diagnosen

ZIEL:
- Praktische Implikationen für Gruppenarbeit
- Klare Empfehlungen für Teamdynamik
- Strukturierte Darstellung
- Fokus auf Zusammenarbeit und Synergien

FORMAT:
- Überschriften für Hauptabschnitte
- Klare Absätze
- Keine Emojis
- Keine Bullet-Point-Spam
- Keine Erwähnung von "KI", "Modell" oder "Prompt"`,
      userPromptTemplate: (input: Record<string, any>) => {
        const groupName = input.groupName || 'die Gruppe';
        const memberCount = input.memberCount || 0;
        const groupContext = input.groupContext || '';

        return `Erstelle ein Human Design Penta Reading für ${groupName}.

Gruppengröße: ${memberCount} Mitglieder
${groupContext ? `Gruppenkontext: ${groupContext}\n\n` : ''}Bitte strukturiere deine Antwort in folgende Abschnitte:
1. Gruppenresonanz und Dynamik
2. Individuelle Beiträge
3. Kommunikationsempfehlungen
4. Praktische Tipps für die Zusammenarbeit

Konzentriere dich auf konkrete, umsetzbare Handlungsschritte für eine produktive und harmonische Gruppenarbeit.`;
      },
      outputConstraints: [
        'Klare Absätze mit Überschriften',
        'Keine Emojis',
        'Keine Bullet-Point-Spam',
        'Keine Erwähnung von "KI", "Modell" oder "Prompt"',
        'Fokus auf praktische Gruppenimplikationen',
        'Verständlich für Laien',
      ],
      status: 'stable',
      createdAt: '2025-01-01',
    },
  },
};

/**
 * Gibt die neueste stabile Version für einen Reading-Type zurück
 */
export function getLatestStableVersion(readingType: string): string | null {
  const typeRegistry = promptRegistry[readingType];
  if (!typeRegistry) return null;

  // Suche nach der neuesten stabilen Version
  const versions = Object.keys(typeRegistry)
    .filter((v) => typeRegistry[v].status === 'stable')
    .sort()
    .reverse();

  return versions[0] || null;
}

/**
 * Gibt eine spezifische Prompt-Version zurück
 */
export function getPromptVersion(
  readingType: string,
  version: string
): PromptVersion | null {
  const typeRegistry = promptRegistry[readingType];
  if (!typeRegistry) return null;

  return typeRegistry[version] || null;
}

/**
 * Gibt alle verfügbaren Versionen für einen Reading-Type zurück
 */
export function getAvailableVersions(readingType: string): Array<{ version: string; prompt: PromptVersion }> {
  const typeRegistry = promptRegistry[readingType];
  if (!typeRegistry) return [];

  return Object.entries(typeRegistry).map(([version, prompt]) => ({
    version,
    prompt,
  }));
}

/**
 * Prüft ob eine Prompt-Version existiert
 */
export function hasPromptVersion(readingType: string, version: string): boolean {
  return getPromptVersion(readingType, version) !== null;
}

/**
 * Gibt die Standard-Version zurück (latest stable oder erste verfügbare)
 */
export function getDefaultVersion(readingType: string): string | null {
  return getLatestStableVersion(readingType) || Object.keys(promptRegistry[readingType] || {})[0] || null;
}


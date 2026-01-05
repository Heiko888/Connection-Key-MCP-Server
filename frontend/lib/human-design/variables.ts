/**
 * Human Design - Variablen (Variables)
 * 
 * Die 4 Pfeile im Bodygraph:
 * 1. PHS (Primary Health System) - Ernährung/Verdauung
 * 2. Environment - Umgebung
 * 3. Perspective - Sichtweise/Motivation
 * 4. Transfer (oft als "Motivation" bezeichnet)
 * 
 * Diese werden aus den Tonen (Color/Tone) berechnet
 */

import type { HumanDesignPlanets } from './precise-ephemeris';

/**
 * Variable Types für die 4 Pfeile
 */

// PHS (Ernährung) - bestimmt durch Tone of Personality Sun
export type PHSType =
  | 'Appetit'
  | 'Geschmack'
  | 'Durst'
  | 'Berührung'
  | 'Klang'
  | 'Licht';

// Environment (Umgebung) - bestimmt durch Tone of Design Sun
export type EnvironmentType =
  | 'Höhlen'
  | 'Märkte'
  | 'Küche'
  | 'Berge'
  | 'Täler'
  | 'Ufer';

// Perspective (Sichtweise) - bestimmt durch Tone of Personality North Node
export type PerspectiveType =
  | 'Persönlich'
  | 'Transpersönlich'
  | 'Übertragen'
  | 'Beobachten';

// Motivation - bestimmt durch Tone of Design North Node
export type MotivationType =
  | 'Furcht'
  | 'Hoffnung'
  | 'Wunsch'
  | 'Bedürfnis'
  | 'Schuld'
  | 'Unschuld';

/**
 * Arrow Directions (Links/Rechts)
 */
export type ArrowDirection = 'left' | 'right';

/**
 * Vollständige Variable-Daten
 */
export interface VariableData {
  phs: {
    type: PHSType;
    arrow: ArrowDirection;
    tone: number;
    description: string;
    keywords: string[];
  };
  environment: {
    type: EnvironmentType;
    arrow: ArrowDirection;
    tone: number;
    description: string;
    keywords: string[];
  };
  perspective: {
    type: PerspectiveType;
    arrow: ArrowDirection;
    tone: number;
    description: string;
    keywords: string[];
  };
  motivation: {
    type: MotivationType;
    arrow: ArrowDirection;
    tone: number;
    description: string;
    keywords: string[];
  };
  cognition: string; // Kombinierter Typ (z.B. "Left-Left")
  variableType: string; // z.B. "PLLR" (PHS-Left, Environment-Left, Perspective-Left, Motivation-Right)
}

/**
 * Hilfsfunktion: Extrahiert Tone aus einem Planeten (vereinfacht)
 * 
 * Im echten Human Design wird der Tone aus der exakten Position berechnet:
 * - 1 Grad = 60 Arc Minutes
 * - 1 Arc Minute = 60 Arc Seconds
 * - 1 Arc Second = 6 Tones (0-5)
 * 
 * Für eine genaue Berechnung benötigt man die Arc Seconds der Position.
 * Hier verwenden wir eine vereinfachte Methode basierend auf den Dezimalstellen.
 */
function calculateTone(longitude: number): number {
  // Berechne Position innerhalb eines Grades (0-1)
  const withinDegree = longitude % 1;
  
  // Konvertiere zu Arc Minutes (0-60)
  const arcMinutes = withinDegree * 60;
  
  // Konvertiere zu Arc Seconds (0-3600)
  const withinMinute = arcMinutes % 1;
  const arcSeconds = withinMinute * 60;
  
  // 6 Tones pro Arc Second (0-5)
  const tone = Math.floor(arcSeconds / 10) % 6; // Vereinfachte Berechnung
  
  return tone + 1; // Tones sind 1-6
}

/**
 * Bestimmt Arrow Direction basierend auf Tone
 * Tones 1-3 = Left (Fixed)
 * Tones 4-6 = Right (Active/Strategic)
 */
function getArrowDirection(tone: number): ArrowDirection {
  return tone <= 3 ? 'left' : 'right';
}

/**
 * PHS Type basierend auf Tone
 */
function getPHSType(tone: number): PHSType {
  switch (tone) {
    case 1: return 'Appetit';
    case 2: return 'Geschmack';
    case 3: return 'Durst';
    case 4: return 'Berührung';
    case 5: return 'Klang';
    case 6: return 'Licht';
    default: return 'Appetit';
  }
}

/**
 * Environment Type basierend auf Tone
 */
function getEnvironmentType(tone: number): EnvironmentType {
  switch (tone) {
    case 1: return 'Höhlen';
    case 2: return 'Märkte';
    case 3: return 'Küche';
    case 4: return 'Berge';
    case 5: return 'Täler';
    case 6: return 'Ufer';
    default: return 'Höhlen';
  }
}

/**
 * Perspective Type basierend auf Tone
 * (vereinfachte 4-Typ Variante)
 */
function getPerspectiveType(tone: number): PerspectiveType {
  if (tone <= 2) return 'Persönlich';
  if (tone <= 4) return 'Transpersönlich';
  if (tone === 5) return 'Übertragen';
  return 'Beobachten';
}

/**
 * Motivation Type basierend auf Tone
 */
function getMotivationType(tone: number): MotivationType {
  switch (tone) {
    case 1: return 'Furcht';
    case 2: return 'Hoffnung';
    case 3: return 'Wunsch';
    case 4: return 'Bedürfnis';
    case 5: return 'Schuld';
    case 6: return 'Unschuld';
    default: return 'Furcht';
  }
}

/**
 * PHS Beschreibungen
 */
const PHS_DESCRIPTIONS: Record<PHSType, { description: string; keywords: string[] }> = {
  'Appetit': {
    description: 'Essen nach Hungergefühl und Appetit. Der Körper weiß, wann und was er braucht.',
    keywords: ['Hunger', 'Intuition', 'Natürlich', 'Instinktiv']
  },
  'Geschmack': {
    description: 'Essen nach Geschmack und Vorliebe. Der Körper reagiert auf das, was gut schmeckt.',
    keywords: ['Geschmack', 'Vorlieben', 'Genuss', 'Sensorisch']
  },
  'Durst': {
    description: 'Essen in Verbindung mit Flüssigkeiten. Der Körper braucht Feuchtigkeit und Fluss.',
    keywords: ['Flüssigkeit', 'Hydration', 'Fluss', 'Weich']
  },
  'Berührung': {
    description: 'Essen in Verbindung mit taktilen Erfahrungen. Die Textur und Haptik sind wichtig.',
    keywords: ['Textur', 'Haptik', 'Gefühl', 'Konsistenz']
  },
  'Klang': {
    description: 'Essen in ruhiger oder stimmungsvoller Umgebung. Die akustische Atmosphäre beeinflusst die Verdauung.',
    keywords: ['Ruhe', 'Atmosphäre', 'Akustik', 'Stimmung']
  },
  'Licht': {
    description: 'Essen je nach Tageszeit und Licht. Die Lichtverhältnisse beeinflussen die Verdauung.',
    keywords: ['Licht', 'Tageszeit', 'Solar', 'Rhythmus']
  }
};

/**
 * Environment Beschreibungen
 */
const ENVIRONMENT_DESCRIPTIONS: Record<EnvironmentType, { description: string; keywords: string[] }> = {
  'Höhlen': {
    description: 'Geschützte, ruhige Räume. Braucht Rückzug und Privatsphäre.',
    keywords: ['Rückzug', 'Schutz', 'Privat', 'Intim']
  },
  'Märkte': {
    description: 'Lebendige, soziale Orte mit viel Austausch. Gedeiht in Gemeinschaft.',
    keywords: ['Sozial', 'Gemeinschaft', 'Austausch', 'Lebendig']
  },
  'Küche': {
    description: 'Warme, familiäre Atmosphäre. Der Ort des Nährens und Zusammenkommens.',
    keywords: ['Familie', 'Wärme', 'Nähren', 'Zusammenkommen']
  },
  'Berge': {
    description: 'Höhere Perspektiven, Übersicht. Braucht Weitsicht und Distanz.',
    keywords: ['Übersicht', 'Weitsicht', 'Distanz', 'Perspektive']
  },
  'Täler': {
    description: 'Geschützte, niedrige Orte. Braucht Geborgenheit und Erdung.',
    keywords: ['Geborgenheit', 'Erdung', 'Schutz', 'Naturnähe']
  },
  'Ufer': {
    description: 'Übergangsräume, Grenze zwischen zwei Welten. Braucht Flexibilität.',
    keywords: ['Übergang', 'Grenze', 'Flexibilität', 'Anpassung']
  }
};

/**
 * Perspective Beschreibungen
 */
const PERSPECTIVE_DESCRIPTIONS: Record<PerspectiveType, { description: string; keywords: string[] }> = {
  'Persönlich': {
    description: 'Fokus auf die eigene Erfahrung und den persönlichen Weg. Individuelle Sichtweise.',
    keywords: ['Individuell', 'Persönlich', 'Eigen', 'Subjektiv']
  },
  'Transpersönlich': {
    description: 'Fokus auf das Größere Ganze und die Gemeinschaft. Kollektive Sichtweise.',
    keywords: ['Kollektiv', 'Gemeinschaft', 'Größeres Ganzes', 'Universal']
  },
  'Übertragen': {
    description: 'Fähigkeit, verschiedene Perspektiven zu übernehmen und zu vermitteln.',
    keywords: ['Vermitteln', 'Übersetzen', 'Flexibel', 'Anpassung']
  },
  'Beobachten': {
    description: 'Neutrale, distanzierte Beobachtung. Objektive Sichtweise.',
    keywords: ['Objektiv', 'Beobachten', 'Neutral', 'Distanziert']
  }
};

/**
 * Motivation Beschreibungen
 */
const MOTIVATION_DESCRIPTIONS: Record<MotivationType, { description: string; keywords: string[] }> = {
  'Furcht': {
    description: 'Motiviert durch Vermeidung und Sicherheit. Was soll nicht passieren?',
    keywords: ['Vorsicht', 'Sicherheit', 'Vermeidung', 'Schutz']
  },
  'Hoffnung': {
    description: 'Motiviert durch positive Erwartung und Möglichkeiten. Was kann entstehen?',
    keywords: ['Optimismus', 'Möglichkeiten', 'Potential', 'Zuversicht']
  },
  'Wunsch': {
    description: 'Motiviert durch Verlangen und Sehnsucht. Was wird ersehnt?',
    keywords: ['Sehnsucht', 'Verlangen', 'Träume', 'Begehren']
  },
  'Bedürfnis': {
    description: 'Motiviert durch praktische Notwendigkeiten. Was wird gebraucht?',
    keywords: ['Praktisch', 'Notwendig', 'Essentiell', 'Grundlegend']
  },
  'Schuld': {
    description: 'Motiviert durch Verantwortung und Korrektur. Was muss korrigiert werden?',
    keywords: ['Verantwortung', 'Korrektur', 'Gewissen', 'Pflicht']
  },
  'Unschuld': {
    description: 'Motiviert durch reine Neugier und Entdeckung. Was ist möglich?',
    keywords: ['Neugier', 'Entdeckung', 'Reinheit', 'Offenheit']
  }
};

/**
 * Hauptfunktion: Berechnet alle Variablen
 */
export function calculateVariables(
  personalityPlanets: HumanDesignPlanets,
  designPlanets: HumanDesignPlanets
): VariableData {
  // 1. PHS - von Personality Sun
  const phsTone = calculateTone(personalityPlanets.sun.longitude);
  const phsType = getPHSType(phsTone);
  const phsArrow = getArrowDirection(phsTone);
  const phsInfo = PHS_DESCRIPTIONS[phsType];

  // 2. Environment - von Design Sun
  const envTone = calculateTone(designPlanets.sun.longitude);
  const envType = getEnvironmentType(envTone);
  const envArrow = getArrowDirection(envTone);
  const envInfo = ENVIRONMENT_DESCRIPTIONS[envType];

  // 3. Perspective - von Personality North Node
  const persTone = calculateTone(personalityPlanets.northNode.longitude);
  const persType = getPerspectiveType(persTone);
  const persArrow = getArrowDirection(persTone);
  const persInfo = PERSPECTIVE_DESCRIPTIONS[persType];

  // 4. Motivation - von Design North Node
  const motivTone = calculateTone(designPlanets.northNode.longitude);
  const motivType = getMotivationType(motivTone);
  const motivArrow = getArrowDirection(motivTone);
  const motivInfo = MOTIVATION_DESCRIPTIONS[motivType];

  // Cognition (kombinierter Typ)
  const cognition = `${phsArrow === 'left' ? 'Left' : 'Right'}-${envArrow === 'left' ? 'Left' : 'Right'}`;

  // Variable Type String (z.B. "PLLR")
  const variableType = [
    phsArrow === 'left' ? 'L' : 'R',
    envArrow === 'left' ? 'L' : 'R',
    persArrow === 'left' ? 'L' : 'R',
    motivArrow === 'left' ? 'L' : 'R'
  ].join('');

  return {
    phs: {
      type: phsType,
      arrow: phsArrow,
      tone: phsTone,
      description: phsInfo.description,
      keywords: phsInfo.keywords
    },
    environment: {
      type: envType,
      arrow: envArrow,
      tone: envTone,
      description: envInfo.description,
      keywords: envInfo.keywords
    },
    perspective: {
      type: persType,
      arrow: persArrow,
      tone: persTone,
      description: persInfo.description,
      keywords: persInfo.keywords
    },
    motivation: {
      type: motivType,
      arrow: motivArrow,
      tone: motivTone,
      description: motivInfo.description,
      keywords: motivInfo.keywords
    },
    cognition,
    variableType
  };
}

/**
 * Icons für Variablen
 */
export const VARIABLE_ICONS = {
  phs: '🍽️',
  environment: '🏠',
  perspective: '👁️',
  motivation: '🎯',
  left: '⬅️',
  right: '➡️'
};

/**
 * Hilfsfunktion: Formatiert die Variablen als lesbaren String
 */
export function formatVariables(variables: VariableData): string {
  return `Variablen: ${variables.variableType} (${variables.cognition})
  
🍽️ PHS: ${variables.phs.arrow === 'left' ? '⬅️' : '➡️'} ${variables.phs.type}
🏠 Umgebung: ${variables.environment.arrow === 'left' ? '⬅️' : '➡️'} ${variables.environment.type}
👁️ Perspektive: ${variables.perspective.arrow === 'left' ? '⬅️' : '➡️'} ${variables.perspective.type}
🎯 Motivation: ${variables.motivation.arrow === 'left' ? '⬅️' : '➡️'} ${variables.motivation.type}`;
}

/**
 * Cognition Typen Beschreibungen
 */
export const COGNITION_DESCRIPTIONS: Record<string, string> = {
  'Left-Left': 'Strategisches, fokussiertes Denken. Fixed Cognition.',
  'Left-Right': 'Strategisch-flexibles Denken. Mixed Cognition.',
  'Right-Left': 'Flexibel-strategisches Denken. Mixed Cognition.',
  'Right-Right': 'Peripheres, offenes Denken. Peripheral Cognition.'
};


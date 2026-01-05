/**
 * The Connection Key - Resonanzanalyse zwischen 2 Human Design Charts
 * 
 * Analysiert:
 * - Gemeinsame/offene Zentren
 * - Komplementäre Tore (Resonanzachsen)
 * - Goldadern (neue Kanäle durch Verbindung)
 * - Typ-Verbindung (wie interagieren die Typen)
 * - Profil-Interaktion (wie ergänzen sich die Profile)
 * - Autorität & Strategie (kombinierte Entscheidungslogik)
 * - 3 Ebenen: Mental, Emotional, Körperlich-energetisch
 */

import type { Channel, CenterStatus, HDType, HDAuthority, Strategy } from './index';

/**
 * Resonanzebenen
 */
export type ResonanceLevel = 'mental' | 'emotional' | 'physical';

/**
 * Resonanzachse zwischen 2 Toren
 */
export interface ResonanceAxis {
  gate1: number;
  gate2: number;
  person1HasGate: number; // Welches der beiden Tore hat Person 1?
  person2HasGate: number; // Welches der beiden Tore hat Person 2?
  channelName: string;
  level: ResonanceLevel;
  theme: string;
  description: string;
}

/**
 * Goldader - neuer Kanal durch Verbindung
 */
export interface GoldenThread {
  channel: string; // z.B. "34-10"
  gate1: number;
  gate2: number;
  person1Gate: number;
  person2Gate: number;
  theme: string;
  description: string;
}

/**
 * Zentren-Vergleich
 */
export interface CenterComparison {
  centerName: string;
  person1: 'definiert' | 'offen' | 'undefiniert';
  person2: 'definiert' | 'offen' | 'undefiniert';
  type: 'resonance' | 'growth' | 'neutral'; // resonance = beide gleich, growth = einer definiert/einer offen
  description: string;
}

/**
 * Typ-Verbindung - wie interagieren die Typen
 */
export interface TypeConnection {
  person1Type: HDType;
  person2Type: HDType;
  interaction: 'invitation' | 'reaction' | 'leadership' | 'neutral' | 'challenge';
  description: string;
  energeticDynamics: string;
}

/**
 * Profil-Interaktion
 */
export interface ProfileInteraction {
  person1Profile: string;
  person2Profile: string;
  learningFields: string[];
  mirrorThemes: string[];
  complementaryAspects: string[];
  description: string;
}

/**
 * Kombinierte Autorität & Strategie
 */
export interface CombinedAuthorityStrategy {
  person1Authority: HDAuthority;
  person2Authority: HDAuthority;
  person1Strategy: Strategy;
  person2Strategy: Strategy;
  combinedDecisionLogic: string;
  recommendations: string[];
}

/**
 * Connection Key - vollständige Resonanzanalyse
 */
export interface ConnectionKey {
  channel: string; // z.B. "19-49"
  theme: string;
  type: ResonanceLevel;
  description: string;
}

/**
 * Vollständige Connection Key Analyse
 */
export interface ConnectionKeyAnalysis {
  centers: CenterComparison[];
  resonanceAxes: ResonanceAxis[];
  goldenThreads: GoldenThread[];
  connectionKeys: ConnectionKey[];
  typeConnection: TypeConnection;
  profileInteraction: ProfileInteraction;
  combinedAuthorityStrategy: CombinedAuthorityStrategy;
  summary: {
    totalResonancePoints: number;
    dominantLevel: ResonanceLevel;
    connectionStrength: number; // 0-100
    energeticSummary: string;
  };
}

/**
 * Komplementäre Tore (die einen Kanal bilden)
 * Basierend auf den 36 Kanälen
 */
const COMPLEMENTARY_GATES: Record<number, { complement: number; channel: string; level: ResonanceLevel; theme: string }> = {
  // Mentale Ebene (Krone, Ajna, Kehle)
  64: { complement: 47, channel: '64-47', level: 'mental', theme: 'Abstraktion & Realisierung' },
  47: { complement: 64, channel: '64-47', level: 'mental', theme: 'Realisierung & Abstraktion' },
  61: { complement: 24, channel: '61-24', level: 'mental', theme: 'Mysterium & Rationalisierung' },
  24: { complement: 61, channel: '61-24', level: 'mental', theme: 'Rationalisierung & Mysterium' },
  63: { complement: 4, channel: '63-4', level: 'mental', theme: 'Zweifel & Antworten' },
  4: { complement: 63, channel: '63-4', level: 'mental', theme: 'Antworten & Zweifel' },
  17: { complement: 62, channel: '17-62', level: 'mental', theme: 'Meinung & Detail' },
  62: { complement: 17, channel: '17-62', level: 'mental', theme: 'Detail & Meinung' },
  43: { complement: 23, channel: '43-23', level: 'mental', theme: 'Einsicht & Assimilation' },
  23: { complement: 43, channel: '43-23', level: 'mental', theme: 'Assimilation & Einsicht' },
  11: { complement: 56, channel: '11-56', level: 'mental', theme: 'Ideen & Stimulation' },
  56: { complement: 11, channel: '11-56', level: 'mental', theme: 'Stimulation & Ideen' },
  
  // Kehle-Verbindungen
  20: { complement: 34, channel: '20-34', level: 'physical', theme: 'Jetzt & Macht' },
  34: { complement: 20, channel: '20-34', level: 'physical', theme: 'Macht & Jetzt' },
  57: { complement: 10, channel: '10-57', level: 'physical', theme: 'Intuition & Selbstliebe' },
  10: { complement: 57, channel: '10-57', level: 'physical', theme: 'Selbstliebe & Intuition' },
  31: { complement: 7, channel: '31-7', level: 'mental', theme: 'Führung & Interaktion' },
  7: { complement: 31, channel: '31-7', level: 'mental', theme: 'Interaktion & Führung' },
  8: { complement: 1, channel: '8-1', level: 'mental', theme: 'Beitrag & Selbstausdruck' },
  1: { complement: 8, channel: '8-1', level: 'mental', theme: 'Selbstausdruck & Beitrag' },
  16: { complement: 48, channel: '16-48', level: 'mental', theme: 'Talent & Tiefe' },
  48: { complement: 16, channel: '16-48', level: 'mental', theme: 'Tiefe & Talent' },
  35: { complement: 36, channel: '35-36', level: 'emotional', theme: 'Erfahrung & Krise' },
  36: { complement: 35, channel: '35-36', level: 'emotional', theme: 'Krise & Erfahrung' },
  12: { complement: 22, channel: '12-22', level: 'emotional', theme: 'Vorsicht & Offenheit' },
  22: { complement: 12, channel: '12-22', level: 'emotional', theme: 'Offenheit & Vorsicht' },
  45: { complement: 21, channel: '45-21', level: 'emotional', theme: 'Herrschaft & Kontrolle' },
  21: { complement: 45, channel: '45-21', level: 'emotional', theme: 'Kontrolle & Herrschaft' },
  33: { complement: 13, channel: '33-13', level: 'mental', theme: 'Rückzug & Zuhören' },
  13: { complement: 33, channel: '33-13', level: 'mental', theme: 'Zuhören & Rückzug' },
  
  // Emotionale Ebene (Solarplexus, Herz)
  6: { complement: 59, channel: '6-59', level: 'emotional', theme: 'Intimität & Sexualität' },
  59: { complement: 6, channel: '6-59', level: 'emotional', theme: 'Sexualität & Intimität' },
  37: { complement: 40, channel: '37-40', level: 'emotional', theme: 'Familie & Befreiung' },
  40: { complement: 37, channel: '37-40', level: 'emotional', theme: 'Befreiung & Familie' },
  49: { complement: 19, channel: '49-19', level: 'emotional', theme: 'Revolution & Bedürfnisse' },
  19: { complement: 49, channel: '49-19', level: 'emotional', theme: 'Bedürfnisse & Revolution' },
  55: { complement: 39, channel: '55-39', level: 'emotional', theme: 'Fülle & Provokation' },
  39: { complement: 55, channel: '55-39', level: 'emotional', theme: 'Provokation & Fülle' },
  
  // Körperlich-energetische Ebene (G, Sakral, Wurzel, Milz)
  25: { complement: 51, channel: '25-51', level: 'physical', theme: 'Unschuld & Schock' },
  51: { complement: 25, channel: '25-51', level: 'physical', theme: 'Schock & Unschuld' },
  15: { complement: 5, channel: '15-5', level: 'physical', theme: 'Rhythmus & Timing' },
  5: { complement: 15, channel: '15-5', level: 'physical', theme: 'Timing & Rhythmus' },
  2: { complement: 14, channel: '2-14', level: 'physical', theme: 'Richtung & Kraft' },
  14: { complement: 2, channel: '2-14', level: 'physical', theme: 'Kraft & Richtung' },
  46: { complement: 29, channel: '46-29', level: 'physical', theme: 'Körper & Commitment' },
  29: { complement: 46, channel: '46-29', level: 'physical', theme: 'Commitment & Körper' },
  27: { complement: 50, channel: '27-50', level: 'physical', theme: 'Fürsorge & Werte' },
  50: { complement: 27, channel: '27-50', level: 'physical', theme: 'Werte & Fürsorge' },
  3: { complement: 60, channel: '3-60', level: 'physical', theme: 'Innovation & Beschränkung' },
  60: { complement: 3, channel: '3-60', level: 'physical', theme: 'Beschränkung & Innovation' },
  42: { complement: 53, channel: '42-53', level: 'physical', theme: 'Wachstum & Anfang' },
  53: { complement: 42, channel: '42-53', level: 'physical', theme: 'Anfang & Wachstum' },
  9: { complement: 52, channel: '9-52', level: 'physical', theme: 'Fokus & Stille' },
  52: { complement: 9, channel: '9-52', level: 'physical', theme: 'Stille & Fokus' },
  18: { complement: 58, channel: '18-58', level: 'physical', theme: 'Korrektur & Vitalität' },
  58: { complement: 18, channel: '18-58', level: 'physical', theme: 'Vitalität & Korrektur' },
  38: { complement: 28, channel: '38-28', level: 'physical', theme: 'Kampf & Risiko' },
  28: { complement: 38, channel: '38-28', level: 'physical', theme: 'Risiko & Kampf' },
  54: { complement: 32, channel: '54-32', level: 'physical', theme: 'Ehrgeiz & Kontinuität' },
  32: { complement: 54, channel: '54-32', level: 'physical', theme: 'Kontinuität & Ehrgeiz' },
  44: { complement: 26, channel: '44-26', level: 'physical', theme: 'Instinkt & Egoist' },
  26: { complement: 44, channel: '44-26', level: 'physical', theme: 'Egoist & Instinkt' },
  30: { complement: 41, channel: '30-41', level: 'emotional', theme: 'Sehnsucht & Fantasie' },
  41: { complement: 30, channel: '30-41', level: 'emotional', theme: 'Fantasie & Sehnsucht' },
};

/**
 * Zentren zu Ebenen Mapping
 */
const CENTER_TO_LEVEL: Record<string, ResonanceLevel> = {
  'krone': 'mental',
  'ajna': 'mental',
  'kehle': 'mental',
  'gZentrum': 'physical',
  'herzEgo': 'emotional',
  'sakral': 'physical',
  'solarplexus': 'emotional',
  'milz': 'physical',
  'wurzel': 'physical'
};

/**
 * Zentren-Namen (deutsch)
 */
const CENTER_NAMES: Record<string, string> = {
  'krone': 'Krone',
  'ajna': 'Ajna',
  'kehle': 'Kehle',
  'gZentrum': 'G-Zentrum',
  'herzEgo': 'Herz/Ego',
  'sakral': 'Sakral',
  'solarplexus': 'Solarplexus',
  'milz': 'Milz',
  'wurzel': 'Wurzel'
};

/**
 * Vergleicht die Zentren von 2 Personen
 */
export function compareCenters(
  person1Centers: CenterStatus,
  person2Centers: CenterStatus
): CenterComparison[] {
  const comparisons: CenterComparison[] = [];
  
  for (const centerKey of Object.keys(person1Centers) as (keyof CenterStatus)[]) {
    const p1Status = person1Centers[centerKey];
    const p2Status = person2Centers[centerKey];
    
    let type: 'resonance' | 'growth' | 'neutral' = 'neutral';
    let description = '';
    
    if (p1Status === p2Status) {
      type = 'resonance';
      description = p1Status === 'definiert' 
        ? 'Beide haben dieses Zentrum definiert - starke Resonanz in dieser Energie.'
        : 'Beide haben dieses Zentrum offen - gemeinsame Lernzone und Empfänglichkeit.';
    } else if (
      (p1Status === 'definiert' && (p2Status === 'offen' || p2Status === 'undefiniert')) ||
      (p2Status === 'definiert' && (p1Status === 'offen' || p1Status === 'undefiniert'))
    ) {
      type = 'growth';
      description = 'Einer definiert, einer offen - Wachstumsfeld. Energie fließt vom Definierten zum Offenen.';
    }
    
    comparisons.push({
      centerName: CENTER_NAMES[centerKey] || centerKey,
      person1: p1Status,
      person2: p2Status,
      type,
      description
    });
  }
  
  return comparisons;
}

/**
 * Findet Resonanzachsen zwischen 2 Personen
 */
export function findResonanceAxes(
  person1Gates: number[],
  person2Gates: number[]
): ResonanceAxis[] {
  const axes: ResonanceAxis[] = [];
  
  for (const gate1 of person1Gates) {
    const complementInfo = COMPLEMENTARY_GATES[gate1];
    if (!complementInfo) continue;
    
    const gate2 = complementInfo.complement;
    
    // Prüfe ob Person 2 das komplementäre Tor hat
    if (person2Gates.includes(gate2)) {
      axes.push({
        gate1,
        gate2,
        person1HasGate: gate1,
        person2HasGate: gate2,
        channelName: complementInfo.channel,
        level: complementInfo.level,
        theme: complementInfo.theme,
        description: `Resonanzachse ${gate1}-${gate2}: ${complementInfo.theme}. Ein unsichtbares Band zwischen beiden Personen.`
      });
    }
  }
  
  return axes;
}

/**
 * Findet Goldadern (neue vollständige Kanäle durch Verbindung)
 */
export function findGoldenThreads(
  resonanceAxes: ResonanceAxis[]
): GoldenThread[] {
  return resonanceAxes.map(axis => ({
    channel: axis.channelName,
    gate1: axis.gate1,
    gate2: axis.gate2,
    person1Gate: axis.person1HasGate,
    person2Gate: axis.person2HasGate,
    theme: axis.theme,
    description: `Goldader ${axis.channelName}: Gemeinsam aktiviert ihr den Kanal der ${axis.theme}. Diese Verbindung schafft neue kreative Möglichkeiten.`
  }));
}

/**
 * Analysiert Typ-Verbindung
 */
export function analyzeTypeConnection(
  person1Type: HDType,
  person2Type: HDType
): TypeConnection {
  const typeInteractions: Record<string, { interaction: TypeConnection['interaction']; description: string; energeticDynamics: string }> = {
    'Generator-Generator': {
      interaction: 'reaction',
      description: 'Beide sind Generatoren - starke sakrale Resonanz. Ihr könnt gemeinsam große Energie erzeugen.',
      energeticDynamics: 'Hohe sakrale Energie, starke Umsetzungsfähigkeit. Achtet auf Pausen, um Überladung zu vermeiden.'
    },
    'Generator-Manifestor': {
      interaction: 'invitation',
      description: 'Generator wartet auf Antwort, Manifestor initiiert. Klare Rollenverteilung möglich.',
      energeticDynamics: 'Manifestor bringt Initiative, Generator bringt Ausdauer. Informieren ist wichtig für Harmonie.'
    },
    'Generator-Projektor': {
      interaction: 'invitation',
      description: 'Generator wartet auf Antwort, Projektor wartet auf Einladung. Natürliche Synchronisation.',
      energeticDynamics: 'Projektor erkennt Generator-Energie, Generator profitiert von Projektor-Weisheit.'
    },
    'Manifestor-Manifestor': {
      interaction: 'challenge',
      description: 'Beide initiieren - kann zu Konflikten führen, wenn nicht informiert wird.',
      energeticDynamics: 'Hohe Initiativkraft, aber auch Potenzial für Spannung. Informieren ist essentiell.'
    },
    'Projektor-Projektor': {
      interaction: 'leadership',
      description: 'Beide sind Projektoren - können sich gegenseitig erkennen und führen.',
      energeticDynamics: 'Weisheit trifft auf Weisheit. Wartet auf echte Einladungen für tiefe Verbindung.'
    },
    'Reflektor-Reflektor': {
      interaction: 'neutral',
      description: 'Beide sind Reflektoren - sehr seltene Verbindung. Spiegeln sich gegenseitig.',
      energeticDynamics: 'Beide brauchen Zeit (Mondzyklus) für Klarheit. Geduld ist wichtig.'
    }
  };

  const key = `${person1Type}-${person2Type}`;
  const reverseKey = `${person2Type}-${person1Type}`;
  const interaction = typeInteractions[key] || typeInteractions[reverseKey] || {
    interaction: 'neutral' as const,
    description: 'Energetische Dynamik zwischen den Typen.',
    energeticDynamics: 'Achtet auf eure individuellen Strategien und Autoritäten.'
  };

  return {
    person1Type,
    person2Type,
    ...interaction
  };
}

/**
 * Analysiert Profil-Interaktion
 */
export function analyzeProfileInteraction(
  person1Profile: string,
  person2Profile: string
): ProfileInteraction {
  // Profil-Linien extrahieren
  const [p1Line1, p1Line2] = person1Profile.split('/').map(Number);
  const [p2Line1, p2Line2] = person2Profile.split('/').map(Number);

  const learningFields: string[] = [];
  const mirrorThemes: string[] = [];
  const complementaryAspects: string[] = [];

  // Linien-Interaktionen analysieren
  const lineInteractions: Record<string, string> = {
    '1-1': 'Beide haben Linie 1 - gemeinsames Fundament. Tiefes Wissen.',
    '1-3': 'Linie 1 (Fundament) trifft Linie 3 (Trial & Error) - Lernfeld durch Experimente.',
    '1-4': 'Linie 1 (Fundament) trifft Linie 4 (Beziehungen) - Wissen durch Netzwerke.',
    '2-2': 'Beide haben Linie 2 - natürliche Talente, brauchen Rückzug.',
    '2-5': 'Linie 2 (Talent) trifft Linie 5 (Lösungen) - Projektionen möglich.',
    '3-3': 'Beide haben Linie 3 - viel Trial & Error, Resilienz.',
    '3-6': 'Linie 3 (Experiment) trifft Linie 6 (Vorbild) - Wachstum durch Erfahrung.',
    '4-4': 'Beide haben Linie 4 - starke Netzwerke, Beziehungsfokus.',
    '4-6': 'Linie 4 (Netzwerk) trifft Linie 6 (Vorbild) - Weisheit durch Verbindungen.',
    '5-5': 'Beide haben Linie 5 - viele Projektionen, praktische Lösungen.',
    '6-6': 'Beide haben Linie 6 - weise Vorbilder, Reife.'
  };

  // Prüfe alle Kombinationen
  const combinations = [
    `${p1Line1}-${p2Line1}`,
    `${p1Line1}-${p2Line2}`,
    `${p1Line2}-${p2Line1}`,
    `${p1Line2}-${p2Line2}`
  ];

  combinations.forEach(combo => {
    const interaction = lineInteractions[combo] || lineInteractions[combo.split('-').reverse().join('-')];
    if (interaction) {
      if (combo.split('-')[0] === combo.split('-')[1]) {
        mirrorThemes.push(interaction);
      } else {
        learningFields.push(interaction);
      }
    }
  });

  // Komplementäre Aspekte
  if ((p1Line1 === 1 && p2Line1 === 4) || (p1Line1 === 4 && p2Line1 === 1)) {
    complementaryAspects.push('Wissen und Beziehungen ergänzen sich perfekt.');
  }
  if ((p1Line1 === 2 && p2Line1 === 5) || (p1Line1 === 5 && p2Line1 === 2)) {
    complementaryAspects.push('Talent und praktische Lösungen schaffen Synergie.');
  }

  return {
    person1Profile,
    person2Profile,
    learningFields,
    mirrorThemes,
    complementaryAspects,
    description: `Profil-Interaktion ${person1Profile} ↔ ${person2Profile}: ${learningFields.length > 0 ? 'Starke Lernfelder' : 'Harmonische Ergänzung'}`
  };
}

/**
 * Analysiert kombinierte Autorität & Strategie
 */
export function analyzeCombinedAuthorityStrategy(
  person1Authority: HDAuthority,
  person2Authority: HDAuthority,
  person1Strategy: Strategy,
  person2Strategy: Strategy
): CombinedAuthorityStrategy {
  const recommendations: string[] = [];
  let combinedDecisionLogic = '';

  // Autoritäts-Kombinationen
  if (person1Authority === 'Emotional' && person2Authority === 'Emotional') {
    combinedDecisionLogic = 'Beide haben emotionale Autorität - wartet beide auf emotionale Klarheit. Gebt euch Zeit für Entscheidungen.';
    recommendations.push('Wartet beide auf emotionale Wellen - kann Zeit brauchen.');
    recommendations.push('Sprecht über eure Gefühle, aber drängt nicht zu schnellen Entscheidungen.');
  } else if (person1Authority === 'Sakral' && person2Authority === 'Sakral') {
    combinedDecisionLogic = 'Beide haben sakrale Autorität - hört auf eure Bauch-Antworten. Antworte auf das Leben, initiiert nicht.';
    recommendations.push('Wartet beide auf sakrale Antworten (Ja/Nein).');
    recommendations.push('Respektiert die sakrale Energie des anderen - nicht drängen.');
  } else if (person1Authority === 'Emotional' && person2Authority === 'Sakral') {
    combinedDecisionLogic = 'Emotionale Autorität trifft Sakral - unterschiedliche Timing. Emotionale braucht Zeit, Sakral antwortet sofort.';
    recommendations.push('Gebt der emotionalen Person Zeit für Klarheit.');
    recommendations.push('Sakrale Person kann sofort antworten, aber wartet auf emotionale Klarheit für gemeinsame Entscheidungen.');
  } else {
    combinedDecisionLogic = `Kombinierte Autoritäten: ${person1Authority} + ${person2Authority}. Respektiert eure unterschiedlichen Entscheidungsprozesse.`;
    recommendations.push('Jeder folgt seiner eigenen Autorität.');
    recommendations.push('Kommuniziert eure Entscheidungsprozesse transparent.');
  }

  // Strategie-Kombinationen
  if (person1Strategy === 'Warten auf Einladung' && person2Strategy === 'Warten auf Einladung') {
    recommendations.push('Beide warten auf Einladungen - gebt euch gegenseitig echte Einladungen.');
  } else if (person1Strategy === 'Informieren' && person2Strategy === 'Warten und Antworten') {
    recommendations.push('Manifestor informiert, Generator wartet auf Antwort - natürliche Synchronisation.');
  }

  return {
    person1Authority,
    person2Authority,
    person1Strategy,
    person2Strategy,
    combinedDecisionLogic,
    recommendations
  };
}

/**
 * Findet Connection Keys (aktivierte Kanäle durch Verbindung)
 */
export function findConnectionKeys(
  person1Gates: number[],
  person2Gates: number[]
): ConnectionKey[] {
  const connectionKeys: ConnectionKey[] = [];
  const person1GateSet = new Set(person1Gates);
  const person2GateSet = new Set(person2Gates);

  // Prüfe alle komplementären Tore
  for (const [gate1, info] of Object.entries(COMPLEMENTARY_GATES)) {
    const gate1Num = Number(gate1);
    const gate2Num = info.complement;

    // Wenn Person 1 Tor X hat und Person 2 Tor Y (oder umgekehrt)
    if ((person1GateSet.has(gate1Num) && person2GateSet.has(gate2Num)) ||
        (person1GateSet.has(gate2Num) && person2GateSet.has(gate1Num))) {
      connectionKeys.push({
        channel: info.channel,
        theme: info.theme,
        type: info.level,
        description: `Connection Key ${info.channel}: ${info.theme}. Dieser Kanal wird durch eure Verbindung aktiviert.`
      });
    }
  }

  return connectionKeys;
}

/**
 * Generiert energetische Zusammenfassung
 */
export function generateEnergeticSummary(
  analysis: Omit<ConnectionKeyAnalysis, 'summary'>
): string {
  const parts: string[] = [];

  // Zentren-Analyse
  const sharedDefined = analysis.centers.filter(c => 
    c.person1 === 'definiert' && c.person2 === 'definiert'
  );
  const sharedOpen = analysis.centers.filter(c => 
    c.person1 === 'offen' && c.person2 === 'offen'
  );

  if (sharedDefined.length > 0) {
    parts.push(`Gemeinsame definierte Zentren: ${sharedDefined.map(c => c.centerName).join(', ')} - stabile Frequenz.`);
  }

  if (sharedOpen.length > 0) {
    parts.push(`Gemeinsame offene Zentren: ${sharedOpen.map(c => c.centerName).join(', ')} - gemeinsame Empfänglichkeit.`);
  }

  // Connection Keys
  if (analysis.connectionKeys.length > 0) {
    const emotionalKeys = analysis.connectionKeys.filter(k => k.type === 'emotional');
    const physicalKeys = analysis.connectionKeys.filter(k => k.type === 'physical');
    const mentalKeys = analysis.connectionKeys.filter(k => k.type === 'mental');

    if (emotionalKeys.length > 0) {
      parts.push(`Hohe emotionale Resonanz (${emotionalKeys.length} Kanäle) - tiefe Gefühlsebene.`);
    }
    if (physicalKeys.length > 0) {
      parts.push(`Starke körperlich-energetische Verbindung (${physicalKeys.length} Kanäle) - praktische Umsetzung.`);
    }
    if (mentalKeys.length > 0) {
      parts.push(`Mentale Resonanz (${mentalKeys.length} Kanäle) - intellektuelle Verbindung.`);
    }
  }

  // Typ-Verbindung
  if (analysis.typeConnection.interaction === 'invitation') {
    parts.push('Energetische Dynamik: Einladung und Reaktion - natürliche Synchronisation.');
  } else if (analysis.typeConnection.interaction === 'reaction') {
    parts.push('Energetische Dynamik: Beide reagieren - starke sakrale Energie.');
  } else if (analysis.typeConnection.interaction === 'challenge') {
    parts.push('Energetische Dynamik: Beide initiieren - Informieren ist essentiell.');
  }

  return parts.join(' ') || 'Energetische Resonanzanalyse zwischen beiden Charts.';
}

/**
 * Hauptfunktion: Vollständige Connection Key Analyse
 */
export function analyzeConnectionKey(
  person1Gates: number[],
  person2Gates: number[],
  person1Centers: CenterStatus,
  person2Centers: CenterStatus,
  person1Type?: HDType,
  person2Type?: HDType,
  person1Profile?: string,
  person2Profile?: string,
  person1Authority?: HDAuthority,
  person2Authority?: HDAuthority,
  person1Strategy?: Strategy,
  person2Strategy?: Strategy
): ConnectionKeyAnalysis {
  // Zentren vergleichen
  const centers = compareCenters(person1Centers, person2Centers);
  
  // Resonanzachsen finden
  const resonanceAxes = findResonanceAxes(person1Gates, person2Gates);
  
  // Goldadern identifizieren
  const goldenThreads = findGoldenThreads(resonanceAxes);

  // Connection Keys finden
  const connectionKeys = findConnectionKeys(person1Gates, person2Gates);
  
  // Typ-Verbindung analysieren
  const typeConnection = person1Type && person2Type 
    ? analyzeTypeConnection(person1Type, person2Type)
    : {
        person1Type: person1Type || 'Generator' as HDType,
        person2Type: person2Type || 'Generator' as HDType,
        interaction: 'neutral' as const,
        description: 'Typ-Verbindung nicht verfügbar.',
        energeticDynamics: 'Typ-Informationen fehlen für vollständige Analyse.'
      };

  // Profil-Interaktion analysieren
  const profileInteraction = person1Profile && person2Profile
    ? analyzeProfileInteraction(person1Profile, person2Profile)
    : {
        person1Profile: person1Profile || '1/3',
        person2Profile: person2Profile || '1/3',
        learningFields: [],
        mirrorThemes: [],
        complementaryAspects: [],
        description: 'Profil-Interaktion nicht verfügbar.'
      };

  // Kombinierte Autorität & Strategie
  const combinedAuthorityStrategy = person1Authority && person2Authority && person1Strategy && person2Strategy
    ? analyzeCombinedAuthorityStrategy(person1Authority, person2Authority, person1Strategy, person2Strategy)
    : {
        person1Authority: person1Authority || 'Sakral' as HDAuthority,
        person2Authority: person2Authority || 'Sakral' as HDAuthority,
        person1Strategy: person1Strategy || 'Warten und Antworten' as Strategy,
        person2Strategy: person2Strategy || 'Warten und Antworten' as Strategy,
        combinedDecisionLogic: 'Autoritäts- und Strategie-Informationen nicht vollständig verfügbar.',
        recommendations: []
      };
  
  // Dominante Ebene berechnen
  const levelCounts: Record<ResonanceLevel, number> = {
    mental: 0,
    emotional: 0,
    physical: 0
  };
  
  for (const axis of resonanceAxes) {
    levelCounts[axis.level]++;
  }

  for (const key of connectionKeys) {
    if (key.type === 'mental' || key.type === 'emotional' || key.type === 'physical') {
      levelCounts[key.type]++;
    }
  }
  
  const dominantLevel = (Object.keys(levelCounts) as ResonanceLevel[])
    .reduce((a, b) => levelCounts[a] > levelCounts[b] ? a : b);
  
  // Connection Strength berechnen (0-100)
  const resonantCenters = centers.filter(c => c.type === 'resonance').length;
  const connectionStrength = Math.min(100, 
    (resonanceAxes.length * 10) + 
    (goldenThreads.length * 15) + 
    (connectionKeys.length * 12) +
    (resonantCenters * 5)
  );

  // Erstelle temporäres Analyse-Objekt für Summary
  const tempAnalysis = {
    centers,
    resonanceAxes,
    goldenThreads,
    connectionKeys,
    typeConnection,
    profileInteraction,
    combinedAuthorityStrategy
  };

  const energeticSummary = generateEnergeticSummary(tempAnalysis);
  
  return {
    centers,
    resonanceAxes,
    goldenThreads,
    connectionKeys,
    typeConnection,
    profileInteraction,
    combinedAuthorityStrategy,
    summary: {
      totalResonancePoints: resonanceAxes.length + goldenThreads.length + connectionKeys.length,
      dominantLevel,
      connectionStrength,
      energeticSummary
    }
  };
}

/**
 * Formatiert die Analyse als Text
 */
export function formatConnectionKeyAnalysis(analysis: ConnectionKeyAnalysis): string {
  let text = '🩵 THE CONNECTION KEY - RESONANZANALYSE\n\n';
  
  text += '📊 ZUSAMMENFASSUNG:\n';
  text += `• Resonanzpunkte: ${analysis.summary.totalResonancePoints}\n`;
  text += `• Verbindungsstärke: ${analysis.summary.connectionStrength}%\n`;
  text += `• Dominante Ebene: ${analysis.summary.dominantLevel === 'mental' ? '🧠 Mental' : analysis.summary.dominantLevel === 'emotional' ? '❤️ Emotional' : '💪 Körperlich-energetisch'}\n`;
  text += `• Energetische Zusammenfassung: ${analysis.summary.energeticSummary}\n\n`;
  
  text += '🔹 ZENTREN-VERGLEICH:\n';
  const resonantCenters = analysis.centers.filter(c => c.type === 'resonance');
  const growthCenters = analysis.centers.filter(c => c.type === 'growth');
  text += `• Resonanzfelder: ${resonantCenters.length}\n`;
  text += `• Wachstumsfelder: ${growthCenters.length}\n`;
  if (resonantCenters.length > 0) {
    text += `  - Gemeinsame definierte Zentren: ${resonantCenters.filter(c => c.person1 === 'definiert').map(c => c.centerName).join(', ')}\n`;
  }
  if (growthCenters.length > 0) {
    text += `  - Wachstumsfelder: ${growthCenters.map(c => c.centerName).join(', ')}\n`;
  }
  text += '\n';
  
  text += '✨ CONNECTION KEYS (Aktivierte Kanäle durch Verbindung):\n';
  if (analysis.connectionKeys.length > 0) {
    analysis.connectionKeys.forEach((key, idx) => {
      text += `${idx + 1}. Kanal ${key.channel}: ${key.theme}\n`;
      text += `   ${key.description}\n`;
    });
  } else {
    text += 'Keine Connection Keys durch Verbindung aktiviert.\n';
  }
  text += '\n';
  
  text += '✨ GOLDADERN (Neue Kanäle durch Verbindung):\n';
  if (analysis.goldenThreads.length > 0) {
    analysis.goldenThreads.forEach((thread, idx) => {
      text += `${idx + 1}. ${thread.channel}: ${thread.theme}\n`;
      text += `   ${thread.description}\n`;
    });
  } else {
    text += 'Keine vollständigen Kanäle durch Verbindung.\n';
  }
  text += '\n';

  text += '👥 TYP-VERBINDUNG:\n';
  text += `${analysis.typeConnection.person1Type} ↔ ${analysis.typeConnection.person2Type}\n`;
  text += `${analysis.typeConnection.description}\n`;
  text += `Energetische Dynamik: ${analysis.typeConnection.energeticDynamics}\n\n`;

  text += '📋 PROFIL-INTERAKTION:\n';
  text += `${analysis.profileInteraction.person1Profile} ↔ ${analysis.profileInteraction.person2Profile}\n`;
  if (analysis.profileInteraction.learningFields.length > 0) {
    text += `Lernfelder:\n`;
    analysis.profileInteraction.learningFields.forEach(field => {
      text += `  • ${field}\n`;
    });
  }
  if (analysis.profileInteraction.complementaryAspects.length > 0) {
    text += `Komplementäre Aspekte:\n`;
    analysis.profileInteraction.complementaryAspects.forEach(aspect => {
      text += `  • ${aspect}\n`;
    });
  }
  text += '\n';

  text += '🎯 KOMBINIERTE AUTORITÄT & STRATEGIE:\n';
  text += `${analysis.combinedAuthorityStrategy.person1Authority} + ${analysis.combinedAuthorityStrategy.person2Authority}\n`;
  text += `${analysis.combinedAuthorityStrategy.combinedDecisionLogic}\n`;
  if (analysis.combinedAuthorityStrategy.recommendations.length > 0) {
    text += `Empfehlungen:\n`;
    analysis.combinedAuthorityStrategy.recommendations.forEach(rec => {
      text += `  • ${rec}\n`;
    });
  }
  text += '\n';
  
  return text;
}


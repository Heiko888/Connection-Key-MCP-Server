/**
 * Connection Key Engine - Ultra Version
 * 
 * Vollständige Connection-Key-Analyse mit:
 * - Electromagnetic (EM)
 * - Compromise
 * - Dominance
 * - Companionship
 * - Scoring-System
 * - Text-Generator
 * - API-ready JSON-Format
 */

import { CHANNELS, type Channel } from './channels';
import type { HDType, HDAuthority, Strategy } from './type-authority';
import type { CenterStatus } from './centers';

/**
 * Connection Key Types
 */
export type ConnectionKeyType = 'electromagnetic' | 'compromise' | 'dominance' | 'companionship';

/**
 * Connection Key Weight
 */
export type ConnectionKeyWeight = 'strong' | 'emotional' | 'mental' | 'physical';

/**
 * Single Connection Key
 */
export interface ConnectionKey {
  type: ConnectionKeyType;
  channel: string; // e.g. "25-51"
  gate1: number;
  gate2: number;
  person1Has: number[]; // Which gates person 1 has
  person2Has: number[]; // Which gates person 2 has
  weight: ConnectionKeyWeight;
  description: string;
  interpretation: string;
  context?: {
    business?: string;
    relationship?: string;
    dating?: string;
  };
}

/**
 * Connection Keys Analysis
 */
export interface ConnectionKeysAnalysis {
  electromagnetic: ConnectionKey[];
  compromise: ConnectionKey[];
  dominance: ConnectionKey[];
  companionship: ConnectionKey[];
  all: ConnectionKey[];
}

/**
 * Connection Scores
 */
export interface ConnectionScores {
  connection: number; // 0-100: Gesamt-Kompatibilität
  chemistry: number; // 0-100: Sexuelle/körperliche Chemie
  stability: number; // 0-100: Langfristig tragfähig
  growth: number; // 0-100: Potential für Wachstum & Triggerarbeit
  teamFit?: number; // 0-100: Penta-/Team-Fit (optional)
}

/**
 * Profile Type Classification
 */
export type ProfileType = 
  | 'soul-mate' 
  | 'twin-flame' 
  | 'safe-soft' 
  | 'business-buddy' 
  | 'growth-partner'
  | 'neutral';

/**
 * Sexuality/Chemistry Analysis Types
 */
export type AttractionType = 
  | 'raw-physical-fire'      // Rohes körperliches Feuer
  | 'emotional-depth'        // Emotionale Tiefe & Bonding
  | 'spiritual-mental'       // Spirituelle/mentale Verbindung
  | 'sensual-slow'           // Sinnliche, langsame, genussvolle Energie
  | 'balanced'                // Ausgewogene Mischung
  | 'low-chemistry';         // Niedrige Chemie

export interface SexualityAnalysis {
  attractionType: AttractionType;
  physicalChemistry: number; // 0-100: Körperliche Anziehung
  emotionalChemistry: number; // 0-100: Emotionale Tiefe
  spiritualChemistry: number; // 0-100: Spirituelle Verbindung
  sensualChemistry: number; // 0-100: Sinnliche Energie
  tensionZones: {
    description: string;
    intensity: 'low' | 'medium' | 'high';
    impact: 'positive' | 'challenging' | 'dramatic';
  }[];
  sexualGates: {
    personA: number[];
    personB: number[];
    shared: number[];
  };
  sexualChannels: string[]; // e.g. ["6-59", "19-49"]
  interpretation: {
    forSex: string;        // Interpretation für Sex
    forRelationship: string; // Interpretation für Beziehung
    forDating: string;      // Interpretation für Dating
    coachingNotes: string;  // Coaching-Hinweise
  };
}

/**
 * Complete Connection Key Analysis Result
 */
export interface ConnectionKeyResult {
  pair: {
    personAId: string;
    personBId: string;
  };
  scores: ConnectionScores;
  connectionKeys: ConnectionKeysAnalysis;
  profileType: ProfileType;
  summaryText: string;
  businessText?: string;
  relationshipText?: string;
  datingText?: string;
  strengths: string[];
  challenges: string[];
  growthPotential: string[];
  coachingNotes?: string[];
  sexuality?: SexualityAnalysis; // Ultra-Version: Sexuality/Chemistry Engine
}

/**
 * Chart Data Input (simplified)
 */
export interface ChartInput {
  gates: number[]; // Active gates
  channels: string[]; // Active channels (e.g. ["25-51", "59-6"])
  type?: HDType;
  profile?: string;
  authority?: HDAuthority;
  strategy?: Strategy;
  centers?: CenterStatus;
}

/**
 * Get opposite gate for a channel
 */
function getOppositeGate(channel: Channel, gate: number): number | null {
  const [gate1, gate2] = channel.gates;
  if (gate === gate1) return gate2;
  if (gate === gate2) return gate1;
  return null;
}

/**
 * Check if a person has a complete channel
 */
function hasCompleteChannel(personGates: number[], channel: Channel): boolean {
  const [gate1, gate2] = channel.gates;
  return personGates.includes(gate1) && personGates.includes(gate2);
}

/**
 * Check if a person has only one gate of a channel
 */
function hasPartialChannel(personGates: number[], channel: Channel): { has: number | null; missing: number | null } {
  const [gate1, gate2] = channel.gates;
  const hasGate1 = personGates.includes(gate1);
  const hasGate2 = personGates.includes(gate2);
  
  if (hasGate1 && hasGate2) {
    return { has: null, missing: null }; // Complete channel
  }
  if (hasGate1) {
    return { has: gate1, missing: gate2 };
  }
  if (hasGate2) {
    return { has: gate2, missing: gate1 };
  }
  return { has: null, missing: null }; // No gates
}

/**
 * Get channel weight based on centers
 */
function getChannelWeight(channel: Channel, centers?: CenterStatus): ConnectionKeyWeight {
  // Determine weight based on which centers the channel connects
  // This is a simplified version - you can expand this based on actual center connections
  
  // Emotional centers: Solarplexus, Heart
  const emotionalChannels = ['35-36', '12-22', '37-40', '6-59', '49-19', '55-39', '30-41'];
  // Physical centers: Sakral, Wurzel, Milz, G
  const physicalChannels = ['34-20', '5-15', '14-2', '29-46', '59-6', '9-52', '3-60', '25-51', '46-29', '2-14', '15-5', '10-20', '7-31'];
  // Mental centers: Krone, Ajna, Kehle
  const mentalChannels = ['64-47', '61-24', '63-4', '17-62', '23-43', '11-56', '16-48', '20-34', '31-7', '33-13', '8-1'];
  
  const channelStr = `${channel.gates[0]}-${channel.gates[1]}`;
  const reverseChannelStr = `${channel.gates[1]}-${channel.gates[0]}`;
  
  if (emotionalChannels.includes(channelStr) || emotionalChannels.includes(reverseChannelStr)) {
    return 'emotional';
  }
  if (physicalChannels.includes(channelStr) || physicalChannels.includes(reverseChannelStr)) {
    return 'physical';
  }
  if (mentalChannels.includes(channelStr) || mentalChannels.includes(reverseChannelStr)) {
    return 'mental';
  }
  
  return 'strong'; // Default
}

/**
 * Find all Connection Keys between two persons
 */
export function findConnectionKeys(
  personA: ChartInput,
  personB: ChartInput
): ConnectionKeysAnalysis {
  const personAGates = new Set(personA.gates);
  const personBGates = new Set(personB.gates);
  const personAChannels = new Set(personA.channels || []);
  const personBChannels = new Set(personB.channels || []);
  
  const electromagnetic: ConnectionKey[] = [];
  const compromise: ConnectionKey[] = [];
  const dominance: ConnectionKey[] = [];
  const companionship: ConnectionKey[] = [];
  
  // Iterate through all channels
  for (const channel of CHANNELS) {
    const channelStr = `${channel.gates[0]}-${channel.gates[1]}`;
    const reverseChannelStr = `${channel.gates[1]}-${channel.gates[0]}`;
    const channelKey = channelStr;
    
    const personAHasComplete = hasCompleteChannel(personA.gates, channel);
    const personBHasComplete = hasCompleteChannel(personB.gates, channel);
    const personAPartial = hasPartialChannel(personA.gates, channel);
    const personBPartial = hasPartialChannel(personB.gates, channel);
    
    // ELECTROMAGNETIC: Person A has gate X, Person B has opposite gate Y
    if (!personAHasComplete && !personBHasComplete) {
      const personAHasGate1 = personAGates.has(channel.gates[0]);
      const personAHasGate2 = personAGates.has(channel.gates[1]);
      const personBHasGate1 = personBGates.has(channel.gates[0]);
      const personBHasGate2 = personBGates.has(channel.gates[1]);
      
      if ((personAHasGate1 && personBHasGate2) || (personAHasGate2 && personBHasGate1)) {
        const person1Has = personAHasGate1 ? [channel.gates[0]] : [channel.gates[1]];
        const person2Has = personBHasGate1 && !personAHasGate1 ? [channel.gates[0]] : 
                          personBHasGate2 && !personAHasGate2 ? [channel.gates[1]] : [];
        
        if (person1Has.length > 0 && person2Has.length > 0) {
          const weight = getChannelWeight(channel, personA.centers);
          electromagnetic.push({
            type: 'electromagnetic',
            channel: channelKey,
            gate1: channel.gates[0],
            gate2: channel.gates[1],
            person1Has: person1Has,
            person2Has: person2Has,
            weight,
            description: `Magnetische Anziehung: Person A hat Tor ${person1Has[0]}, Person B hat Tor ${person2Has[0]}. Energie fließt zwischen euch.`,
            interpretation: `Dieser Connection Key schafft eine magnetische Anziehung zwischen euch. Die Energie fließt natürlich und schafft eine tiefe Verbindung.`,
            context: {
              business: `Starke synergetische Energie für gemeinsame Projekte.`,
              relationship: `Hohe Anziehungskraft und natürliche Verbindung.`,
              dating: `Sofortige Chemie und magnetische Anziehung.`
            }
          });
        }
      }
    }
    
    // COMPROMISE: One person has complete channel, other has only one gate
    if (personAHasComplete && personBPartial.has !== null) {
      const weight = getChannelWeight(channel, personA.centers);
      compromise.push({
        type: 'compromise',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [channel.gates[0], channel.gates[1]],
        person2Has: [personBPartial.has],
        weight,
        description: `Compromise: Person A hat den kompletten Kanal ${channelKey}, Person B hat nur Tor ${personBPartial.has}.`,
        interpretation: `Diese Dynamik kann Spannung und Frustration erzeugen. Person A dominiert energetisch in diesem Bereich, während Person B nach dem fehlenden Tor sucht.`,
        context: {
          business: `Ungleichgewicht in der Zusammenarbeit - klare Rollenverteilung wichtig.`,
          relationship: `Wachstumsfeld: Person B lernt von Person A, aber kann sich auch unausgewogen fühlen.`,
          dating: `Spannung und Anziehung - kann intensiv sein, braucht bewusste Kommunikation.`
        }
      });
    }
    
    if (personBHasComplete && personAPartial.has !== null) {
      const weight = getChannelWeight(channel, personB.centers);
      compromise.push({
        type: 'compromise',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [personAPartial.has],
        person2Has: [channel.gates[0], channel.gates[1]],
        weight,
        description: `Compromise: Person B hat den kompletten Kanal ${channelKey}, Person A hat nur Tor ${personAPartial.has}.`,
        interpretation: `Diese Dynamik kann Spannung und Frustration erzeugen. Person B dominiert energetisch in diesem Bereich, während Person A nach dem fehlenden Tor sucht.`,
        context: {
          business: `Ungleichgewicht in der Zusammenarbeit - klare Rollenverteilung wichtig.`,
          relationship: `Wachstumsfeld: Person A lernt von Person B, aber kann sich auch unausgewogen fühlen.`,
          dating: `Spannung und Anziehung - kann intensiv sein, braucht bewusste Kommunikation.`
        }
      });
    }
    
    // DOMINANCE: One person has complete channel, other has no gates
    if (personAHasComplete && personBPartial.has === null) {
      const weight = getChannelWeight(channel, personA.centers);
      dominance.push({
        type: 'dominance',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [channel.gates[0], channel.gates[1]],
        person2Has: [],
        weight,
        description: `Dominance: Person A hat den kompletten Kanal ${channelKey}, Person B hat keinen Teil davon.`,
        interpretation: `Person A dominiert energetisch in diesem Bereich. Person B folgt und wird von dieser Energie beeinflusst.`,
        context: {
          business: `Person A führt in diesem Bereich - klare Hierarchie.`,
          relationship: `Person A bringt Stabilität, Person B empfängt - kann harmonisch sein, wenn bewusst gelebt.`,
          dating: `Person A initiiert, Person B reagiert - natürliche Dynamik.`
        }
      });
    }
    
    if (personBHasComplete && personAPartial.has === null) {
      const weight = getChannelWeight(channel, personB.centers);
      dominance.push({
        type: 'dominance',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [],
        person2Has: [channel.gates[0], channel.gates[1]],
        weight,
        description: `Dominance: Person B hat den kompletten Kanal ${channelKey}, Person A hat keinen Teil davon.`,
        interpretation: `Person B dominiert energetisch in diesem Bereich. Person A folgt und wird von dieser Energie beeinflusst.`,
        context: {
          business: `Person B führt in diesem Bereich - klare Hierarchie.`,
          relationship: `Person B bringt Stabilität, Person A empfängt - kann harmonisch sein, wenn bewusst gelebt.`,
          dating: `Person B initiiert, Person A reagiert - natürliche Dynamik.`
        }
      });
    }
    
    // COMPANIONSHIP: Both have the same gate(s)
    const personAHasGate1 = personAGates.has(channel.gates[0]);
    const personAHasGate2 = personAGates.has(channel.gates[1]);
    const personBHasGate1 = personBGates.has(channel.gates[0]);
    const personBHasGate2 = personBGates.has(channel.gates[1]);
    
    // Both have gate 1
    if (personAHasGate1 && personBHasGate1 && !personAHasComplete && !personBHasComplete) {
      const weight = getChannelWeight(channel, personA.centers);
      companionship.push({
        type: 'companionship',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [channel.gates[0]],
        person2Has: [channel.gates[0]],
        weight,
        description: `Companionship: Beide haben Tor ${channel.gates[0]}.`,
        interpretation: `Harmonische Begleitung und Stabilität. Ihr teilt die gleiche Energie und versteht euch auf einer tiefen Ebene.`,
        context: {
          business: `Stabile Zusammenarbeit mit gemeinsamen Werten.`,
          relationship: `Harmonische Verbindung mit tiefem Verständnis.`,
          dating: `Einfache, stabile Verbindung ohne große Dramatik.`
        }
      });
    }
    
    // Both have gate 2
    if (personAHasGate2 && personBHasGate2 && !personAHasComplete && !personBHasComplete) {
      const weight = getChannelWeight(channel, personA.centers);
      companionship.push({
        type: 'companionship',
        channel: channelKey,
        gate1: channel.gates[0],
        gate2: channel.gates[1],
        person1Has: [channel.gates[1]],
        person2Has: [channel.gates[1]],
        weight,
        description: `Companionship: Beide haben Tor ${channel.gates[1]}.`,
        interpretation: `Harmonische Begleitung und Stabilität. Ihr teilt die gleiche Energie und versteht euch auf einer tiefen Ebene.`,
        context: {
          business: `Stabile Zusammenarbeit mit gemeinsamen Werten.`,
          relationship: `Harmonische Verbindung mit tiefem Verständnis.`,
          dating: `Einfache, stabile Verbindung ohne große Dramatik.`
        }
      });
    }
  }
  
  return {
    electromagnetic,
    compromise,
    dominance,
    companionship,
    all: [...electromagnetic, ...compromise, ...dominance, ...companionship]
  };
}

/**
 * Calculate Connection Scores
 */
export function calculateConnectionScores(
  connectionKeys: ConnectionKeysAnalysis,
  personA?: ChartInput,
  personB?: ChartInput
): ConnectionScores {
  const { electromagnetic, compromise, dominance, companionship } = connectionKeys;
  
  // Connection Score: Gesamt-Kompatibilität
  const emCount = electromagnetic.length;
  const compromiseCount = compromise.length;
  const dominanceCount = dominance.length;
  const companionshipCount = companionship.length;
  
  // Base connection score
  let connectionScore = Math.min(100, 
    (emCount * 15) + 
    (companionshipCount * 12) + 
    (compromiseCount * 8) + 
    (dominanceCount * 5)
  );
  
  // Chemistry Score: EM + Compromise (Spannung = Anziehung)
  const chemistryScore = Math.min(100,
    (emCount * 20) + 
    (compromiseCount * 15) +
    (dominanceCount * 5)
  );
  
  // Stability Score: Companionship + moderate EM
  const stabilityScore = Math.min(100,
    (companionshipCount * 20) +
    (emCount * 8) +
    (dominanceCount * 3)
  );
  
  // Growth Score: Compromise (Triggerarbeit) + EM (Wachstum)
  const growthScore = Math.min(100,
    (compromiseCount * 25) +
    (emCount * 10) +
    (companionshipCount * 5)
  );
  
  return {
    connection: Math.round(connectionScore),
    chemistry: Math.round(chemistryScore),
    stability: Math.round(stabilityScore),
    growth: Math.round(growthScore)
  };
}

/**
 * Determine Profile Type
 */
export function determineProfileType(scores: ConnectionScores): ProfileType {
  const { connection, chemistry, stability, growth } = scores;
  
  // Soul Mate: High connection, high depth, moderate tension
  if (connection >= 75 && stability >= 60 && chemistry >= 60 && growth >= 50) {
    return 'soul-mate';
  }
  
  // Twin Flame: Extremely high EM + Compromise
  if (chemistry >= 80 && growth >= 75) {
    return 'twin-flame';
  }
  
  // Safe & Soft: High companionship + moderate chemistry
  if (stability >= 70 && chemistry >= 50 && growth < 50) {
    return 'safe-soft';
  }
  
  // Business Buddy: High clarity, dominance structure
  if (connection >= 65 && stability >= 60 && chemistry < 50) {
    return 'business-buddy';
  }
  
  // Growth Partner: High growth potential
  if (growth >= 70) {
    return 'growth-partner';
  }
  
  return 'neutral';
}

/**
 * Generate Summary Text
 */
export function generateSummaryText(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores,
  profileType: ProfileType
): string {
  const { electromagnetic, compromise, dominance, companionship } = connectionKeys;
  
  const parts: string[] = [];
  
  parts.push(`Eure Verbindung zeigt ein ${profileType === 'soul-mate' ? 'Soul-Mate' : profileType === 'twin-flame' ? 'Twin-Flame' : profileType === 'safe-soft' ? 'sicheres und weiches' : profileType === 'business-buddy' ? 'geschäftliches' : 'neutrales'} Profil.`);
  
  if (electromagnetic.length > 0) {
    parts.push(`${electromagnetic.length} Electromagnetic Connection${electromagnetic.length > 1 ? 's' : ''} schaffen magnetische Anziehung zwischen euch.`);
  }
  
  if (compromise.length > 0) {
    parts.push(`${compromise.length} Compromise-Dynamik${compromise.length > 1 ? 'en' : ''} bieten Wachstumspotenzial, können aber auch Spannung erzeugen.`);
  }
  
  if (dominance.length > 0) {
    parts.push(`${dominance.length} Dominance-Struktur${dominance.length > 1 ? 'en' : ''} zeigen klare energetische Hierarchien.`);
  }
  
  if (companionship.length > 0) {
    parts.push(`${companionship.length} Companionship-Verbindung${companionship.length > 1 ? 'en' : ''} schaffen Stabilität und Harmonie.`);
  }
  
  parts.push(`Gesamt-Score: ${scores.connection}/100 | Chemie: ${scores.chemistry}/100 | Stabilität: ${scores.stability}/100 | Wachstum: ${scores.growth}/100`);
  
  return parts.join(' ');
}

/**
 * Generate Strengths, Challenges, and Growth Potential
 */
export function generateAnalysisDetails(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores
): {
  strengths: string[];
  challenges: string[];
  growthPotential: string[];
} {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const growthPotential: string[] = [];
  
  const { electromagnetic, compromise, dominance, companionship } = connectionKeys;
  
  // Strengths
  if (electromagnetic.length > 0) {
    strengths.push(`${electromagnetic.length} Electromagnetic Connection${electromagnetic.length > 1 ? 's' : ''} schaffen natürliche Anziehung und Energiefluss.`);
  }
  if (companionship.length > 0) {
    strengths.push(`${companionship.length} Companionship-Verbindung${companionship.length > 1 ? 'en' : ''} bieten Stabilität und tiefes Verständnis.`);
  }
  if (scores.stability >= 60) {
    strengths.push('Hohe Stabilität für langfristige Verbindungen.');
  }
  if (scores.chemistry >= 70) {
    strengths.push('Starke körperliche und emotionale Chemie.');
  }
  
  // Challenges
  if (compromise.length > 0) {
    challenges.push(`${compromise.length} Compromise-Dynamik${compromise.length > 1 ? 'en' : ''} können Ungleichgewicht und Frustration erzeugen.`);
  }
  if (dominance.length > 3) {
    challenges.push('Viele Dominance-Strukturen können zu Machtungleichgewicht führen.');
  }
  if (scores.growth >= 70 && scores.stability < 50) {
    challenges.push('Hohes Wachstumspotenzial, aber niedrige Stabilität - kann intensiv sein.');
  }
  if (scores.chemistry >= 80 && scores.stability < 60) {
    challenges.push('Sehr hohe Chemie, aber niedrige Stabilität - braucht bewusste Kommunikation.');
  }
  
  // Growth Potential
  if (compromise.length > 0) {
    growthPotential.push(`Compromise-Dynamiken bieten großes Wachstumspotenzial durch Triggerarbeit.`);
  }
  if (scores.growth >= 70) {
    growthPotential.push('Hohes Potential für persönliches und gemeinsames Wachstum.');
  }
  if (electromagnetic.length >= 3) {
    growthPotential.push('Viele Electromagnetic Connections schaffen tiefe energetische Verbindung.');
  }
  
  return { strengths, challenges, growthPotential };
}

/**
 * Sexuality/Chemistry Engine - Ultra Version
 * 
 * Analysiert sexuelle & körperliche Chemie basierend auf:
 * - Sakral-Zentrum (körperliche Energie)
 * - Wurzel-Zentrum (Druck & Antrieb)
 * - Emotionalzentrum (emotionale Tiefe)
 * - G-Zentrum (Identität & Anziehung)
 * - Spezifische sexuelle Tore & Kanäle
 */
export function analyzeSexuality(
  personA: ChartInput,
  personB: ChartInput
): SexualityAnalysis {
  // Sexuelle/körperliche Tore pro Zentrum
  const SACRAL_GATES = [5, 14, 29, 59, 9, 3, 42, 27, 34]; // Sakral-Zentrum
  const ROOT_GATES = [58, 38, 54, 53, 60, 52, 19, 39, 41]; // Wurzel-Zentrum
  const EMOTIONAL_GATES = [6, 37, 22, 36, 30, 55, 49]; // Solarplexus
  const G_CENTER_GATES = [7, 1, 13, 10, 15, 2, 46, 25]; // G-Zentrum
  
  // Spezifische sexuelle Kanäle
  const SEXUAL_CHANNELS = ['6-59', '59-6', '19-49', '49-19', '30-41', '41-30', '34-20', '20-34', '25-51', '51-25'];
  
  const personAGates = new Set(personA.gates || []);
  const personBGates = new Set(personB.gates || []);
  const personAChannels = new Set(personA.channels || []);
  const personBChannels = new Set(personB.channels || []);
  
  // Finde sexuelle Tore
  const personASacral = SACRAL_GATES.filter(g => personAGates.has(g));
  const personBSacral = SACRAL_GATES.filter(g => personBGates.has(g));
  const personARoot = ROOT_GATES.filter(g => personAGates.has(g));
  const personBRoot = ROOT_GATES.filter(g => personBGates.has(g));
  const personAEmotional = EMOTIONAL_GATES.filter(g => personAGates.has(g));
  const personBEmotional = EMOTIONAL_GATES.filter(g => personBGates.has(g));
  const personAGCenter = G_CENTER_GATES.filter(g => personAGates.has(g));
  const personBGCenter = G_CENTER_GATES.filter(g => personBGates.has(g));
  
  // Gemeinsame sexuelle Tore
  const sharedSexualGates = SACRAL_GATES.filter(g => personAGates.has(g) && personBGates.has(g))
    .concat(ROOT_GATES.filter(g => personAGates.has(g) && personBGates.has(g)))
    .concat(EMOTIONAL_GATES.filter(g => personAGates.has(g) && personBGates.has(g)))
    .concat(G_CENTER_GATES.filter(g => personAGates.has(g) && personBGates.has(g)));
  
  // Finde sexuelle Kanäle (EM zwischen sexuellen Toren)
  const sexualChannels: string[] = [];
  for (const channel of SEXUAL_CHANNELS) {
    const [gate1, gate2] = channel.split('-').map(Number);
    if ((personAGates.has(gate1) && personBGates.has(gate2)) ||
        (personAGates.has(gate2) && personBGates.has(gate1))) {
      sexualChannels.push(channel);
    }
    // Oder wenn beide den kompletten Kanal haben
    if (personAChannels.has(channel) || personBChannels.has(channel)) {
      if (!sexualChannels.includes(channel)) {
        sexualChannels.push(channel);
      }
    }
  }
  
  // Berechne Chemistry Scores
  const physicalChemistry = Math.min(100,
    (personASacral.length + personBSacral.length) * 8 +
    (personARoot.length + personBRoot.length) * 6 +
    (sexualChannels.length * 15) +
    (sharedSexualGates.length * 5)
  );
  
  const emotionalChemistry = Math.min(100,
    (personAEmotional.length + personBEmotional.length) * 10 +
    (sexualChannels.filter(c => c.includes('6') || c.includes('59')).length * 20)
  );
  
  const spiritualChemistry = Math.min(100,
    (personAGCenter.length + personBGCenter.length) * 8 +
    (personAEmotional.length + personBEmotional.length) * 5
  );
  
  const sensualChemistry = Math.min(100,
    (personASacral.length + personBSacral.length) * 7 +
    (personAEmotional.length + personBEmotional.length) * 8 +
    (sexualChannels.filter(c => c.includes('30') || c.includes('41')).length * 15)
  );
  
  // Bestimme Anziehungstyp
  let attractionType: AttractionType = 'low-chemistry';
  
  if (physicalChemistry >= 70 && emotionalChemistry < 50) {
    attractionType = 'raw-physical-fire';
  } else if (emotionalChemistry >= 70 && physicalChemistry >= 50) {
    attractionType = 'emotional-depth';
  } else if (spiritualChemistry >= 60 && physicalChemistry >= 50) {
    attractionType = 'spiritual-mental';
  } else if (sensualChemistry >= 65 && physicalChemistry >= 50) {
    attractionType = 'sensual-slow';
  } else if (physicalChemistry >= 50 && emotionalChemistry >= 50) {
    attractionType = 'balanced';
  }
  
  // Identifiziere Spannungszonen
  const tensionZones: SexualityAnalysis['tensionZones'] = [];
  
  // Hohe Chemie + niedrige Stabilität = Drama-Zone
  if (physicalChemistry >= 75 && emotionalChemistry < 50) {
    tensionZones.push({
      description: 'Hohe körperliche Anziehung, aber niedrige emotionale Tiefe - kann zu oberflächlichen Dynamiken führen',
      intensity: 'high',
      impact: 'challenging'
    });
  }
  
  // Viele sexuelle Kanäle + viele Compromise = intensive aber chaotische Chemie
  if (sexualChannels.length >= 2 && sharedSexualGates.length >= 3) {
    tensionZones.push({
      description: 'Intensive sexuelle Verbindung mit vielen gemeinsamen Toren - sehr intensiv, kann überwältigend sein',
      intensity: 'high',
      impact: 'positive'
    });
  }
  
  // Emotional + Physical = tiefe aber intensive Verbindung
  if (emotionalChemistry >= 70 && physicalChemistry >= 70) {
    tensionZones.push({
      description: 'Hohe emotionale Tiefe kombiniert mit starker körperlicher Anziehung - sehr intensiv für Beziehung',
      intensity: 'medium',
      impact: 'positive'
    });
  }
  
  // Generiere Interpretationen
  const interpretation = generateSexualityInterpretation(
    attractionType,
    physicalChemistry,
    emotionalChemistry,
    spiritualChemistry,
    sensualChemistry,
    sexualChannels,
    tensionZones
  );
  
  return {
    attractionType,
    physicalChemistry: Math.round(physicalChemistry),
    emotionalChemistry: Math.round(emotionalChemistry),
    spiritualChemistry: Math.round(spiritualChemistry),
    sensualChemistry: Math.round(sensualChemistry),
    tensionZones,
    sexualGates: {
      personA: [...personASacral, ...personARoot, ...personAEmotional, ...personAGCenter],
      personB: [...personBSacral, ...personBRoot, ...personBEmotional, ...personBGCenter],
      shared: sharedSexualGates
    },
    sexualChannels,
    interpretation
  };
}

/**
 * Generate Sexuality Interpretation Texts
 */
function generateSexualityInterpretation(
  attractionType: AttractionType,
  physicalChemistry: number,
  emotionalChemistry: number,
  spiritualChemistry: number,
  sensualChemistry: number,
  sexualChannels: string[],
  tensionZones: SexualityAnalysis['tensionZones']
): SexualityAnalysis['interpretation'] {
  const attractionTypeNames: Record<AttractionType, string> = {
    'raw-physical-fire': 'Rohes körperliches Feuer',
    'emotional-depth': 'Emotionale Tiefe & Bonding',
    'spiritual-mental': 'Spirituelle/mentale Verbindung',
    'sensual-slow': 'Sinnliche, langsame, genussvolle Energie',
    'balanced': 'Ausgewogene Mischung',
    'low-chemistry': 'Niedrige Chemie'
  };
  
  const typeName = attractionTypeNames[attractionType];
  
  // Für Sex
  let forSex = '';
  if (attractionType === 'raw-physical-fire') {
    forSex = `Eure Verbindung ist geprägt von roher, körperlicher Energie. Die sexuelle Anziehung ist sehr stark (${physicalChemistry}/100), aber es fehlt emotionale Tiefe. Perfekt für intensive, körperliche Begegnungen.`;
  } else if (attractionType === 'emotional-depth') {
    forSex = `Eure sexuelle Verbindung ist tief emotional geprägt (${emotionalChemistry}/100). Sex wird hier zu einer Form der emotionalen Verbindung und des Bondings.`;
  } else if (attractionType === 'spiritual-mental') {
    forSex = `Eure Verbindung hat eine spirituelle/mentale Komponente (${spiritualChemistry}/100). Sex kann hier zu einer transzendenten Erfahrung werden.`;
  } else if (attractionType === 'sensual-slow') {
    forSex = `Eure Verbindung ist sinnlich und genussvoll (${sensualChemistry}/100). Langsame, bewusste Intimität steht im Vordergrund.`;
  } else if (attractionType === 'balanced') {
    forSex = `Eure Verbindung ist ausgewogen zwischen körperlicher (${physicalChemistry}/100) und emotionaler (${emotionalChemistry}/100) Chemie. Vielseitige sexuelle Dynamik.`;
  } else {
    forSex = `Die sexuelle Chemie ist niedrig (${physicalChemistry}/100). Körperliche Anziehung ist weniger ausgeprägt.`;
  }
  
  // Für Beziehung
  let forRelationship = '';
  if (attractionType === 'raw-physical-fire') {
    forRelationship = `Für eine langfristige Beziehung braucht ihr bewusste Arbeit an der emotionalen Verbindung. Die körperliche Anziehung ist da, aber emotionale Tiefe muss entwickelt werden.`;
  } else if (attractionType === 'emotional-depth') {
    forRelationship = `Perfekt für langfristige Beziehungen. Die emotionale Tiefe (${emotionalChemistry}/100) schafft eine solide Basis für tiefe Verbindung.`;
  } else if (attractionType === 'spiritual-mental') {
    forRelationship = `Eure Verbindung hat das Potential für eine tiefe, spirituelle Partnerschaft. Die mentale/spirituelle Komponente (${spiritualChemistry}/100) schafft eine besondere Art der Verbindung.`;
  } else if (attractionType === 'sensual-slow') {
    forRelationship = `Eure Beziehung wird von sinnlicher, genussvoller Energie geprägt. Langsame, bewusste Entwicklung der Verbindung.`;
  } else if (attractionType === 'balanced') {
    forRelationship = `Ausgewogene Verbindung mit guter Basis für langfristige Beziehung. Sowohl körperliche als auch emotionale Bedürfnisse werden erfüllt.`;
  } else {
    forRelationship = `Für eine Beziehung braucht ihr bewusste Arbeit an der Verbindung. Die Chemie ist niedrig, aber das bedeutet nicht, dass keine Verbindung möglich ist.`;
  }
  
  // Für Dating
  let forDating = '';
  if (attractionType === 'raw-physical-fire') {
    forDating = `Beim Dating: Starke körperliche Anziehung, aber achte darauf, ob auch emotionale Verbindung entsteht. Perfekt für kurze, intensive Begegnungen.`;
  } else if (attractionType === 'emotional-depth') {
    forDating = `Beim Dating: Die emotionale Tiefe wird schnell spürbar. Gute Basis für tiefere Verbindung.`;
  } else if (attractionType === 'spiritual-mental') {
    forDating = `Beim Dating: Die spirituelle/mentale Verbindung ist spürbar. Besondere Art der Anziehung.`;
  } else if (attractionType === 'sensual-slow') {
    forDating = `Beim Dating: Langsame, sinnliche Entwicklung. Nimm dir Zeit, die Verbindung zu erkunden.`;
  } else if (attractionType === 'balanced') {
    forDating = `Beim Dating: Ausgewogene Dynamik. Sowohl körperliche als auch emotionale Anziehung vorhanden.`;
  } else {
    forDating = `Beim Dating: Die Chemie entwickelt sich langsam. Gib der Verbindung Zeit.`;
  }
  
  // Coaching Notes
  let coachingNotes = '';
  if (tensionZones.length > 0) {
    coachingNotes = `Spannungszonen identifiziert: ${tensionZones.map(z => z.description).join('; ')}. `;
  }
  coachingNotes += `Anziehungstyp: ${typeName}. `;
  if (sexualChannels.length > 0) {
    coachingNotes += `Sexuelle Kanäle aktiv: ${sexualChannels.join(', ')}. `;
  }
  coachingNotes += `Für Coaching: Nutze die Stärken (${typeName}) und arbeite bewusst mit den Spannungszonen.`;
  
  return {
    forSex,
    forRelationship,
    forDating,
    coachingNotes
  };
}

/**
 * Main Function: Complete Connection Key Analysis (with Sexuality Engine)
 */
export function analyzeConnectionKeys(
  personA: ChartInput,
  personB: ChartInput,
  personAId: string = 'personA',
  personBId: string = 'personB',
  includeSexuality: boolean = true // Ultra-Version: Standardmäßig aktiviert
): ConnectionKeyResult {
  // Find all connection keys
  const connectionKeys = findConnectionKeys(personA, personB);
  
  // Calculate scores
  const scores = calculateConnectionScores(connectionKeys, personA, personB);
  
  // Determine profile type
  const profileType = determineProfileType(scores);
  
  // Generate texts
  const summaryText = generateSummaryText(connectionKeys, scores, profileType);
  const { strengths, challenges, growthPotential } = generateAnalysisDetails(connectionKeys, scores);
  
  // Generate context-specific texts
  const businessText = generateBusinessText(connectionKeys, scores);
  const relationshipText = generateRelationshipText(connectionKeys, scores);
  const datingText = generateDatingText(connectionKeys, scores);
  
  // Coaching notes
  const coachingNotes = generateCoachingNotes(connectionKeys, scores, profileType);
  
  // Ultra-Version: Sexuality/Chemistry Engine
  const sexuality = includeSexuality ? analyzeSexuality(personA, personB) : undefined;
  
  return {
    pair: {
      personAId,
      personBId
    },
    scores,
    connectionKeys,
    profileType,
    summaryText,
    businessText,
    relationshipText,
    datingText,
    strengths,
    challenges,
    growthPotential,
    coachingNotes,
    sexuality // Ultra-Version
  };
}

/**
 * Generate Business Text
 */
function generateBusinessText(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores
): string {
  const parts: string[] = [];
  
  parts.push('GESCHÄFTLICHE ZUSAMMENARBEIT:');
  
  if (scores.connection >= 70) {
    parts.push('Eure Verbindung eignet sich gut für geschäftliche Zusammenarbeit.');
  }
  
  if (connectionKeys.dominance.length > 0) {
    parts.push(`Klare Hierarchien durch ${connectionKeys.dominance.length} Dominance-Struktur${connectionKeys.dominance.length > 1 ? 'en' : ''} - Rollenverteilung ist wichtig.`);
  }
  
  if (connectionKeys.companionship.length > 0) {
    parts.push(`${connectionKeys.companionship.length} Companionship-Verbindung${connectionKeys.companionship.length > 1 ? 'en' : ''} schaffen stabile Zusammenarbeit.`);
  }
  
  if (connectionKeys.compromise.length > 0) {
    parts.push(`Achtung: ${connectionKeys.compromise.length} Compromise-Dynamik${connectionKeys.compromise.length > 1 ? 'en' : ''} können zu Ungleichgewicht führen - klare Kommunikation essentiell.`);
  }
  
  return parts.join(' ');
}

/**
 * Generate Relationship Text
 */
function generateRelationshipText(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores
): string {
  const parts: string[] = [];
  
  parts.push('BEZIEHUNGS-DYNAMIK:');
  
  if (scores.chemistry >= 70) {
    parts.push('Hohe körperliche und emotionale Chemie zwischen euch.');
  }
  
  if (scores.stability >= 60) {
    parts.push('Gute Basis für langfristige Beziehung.');
  }
  
  if (connectionKeys.electromagnetic.length > 0) {
    parts.push(`${connectionKeys.electromagnetic.length} Electromagnetic Connection${connectionKeys.electromagnetic.length > 1 ? 's' : ''} schaffen tiefe Anziehung.`);
  }
  
  if (connectionKeys.compromise.length > 0) {
    parts.push(`${connectionKeys.compromise.length} Compromise-Dynamik${connectionKeys.compromise.length > 1 ? 'en' : ''} bieten Wachstumsfelder - bewusste Kommunikation wichtig.`);
  }
  
  if (scores.growth >= 70) {
    parts.push('Hohes Potential für gemeinsames Wachstum und Transformation.');
  }
  
  return parts.join(' ');
}

/**
 * Generate Dating Text
 */
function generateDatingText(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores
): string {
  const parts: string[] = [];
  
  parts.push('DATING-DYNAMIK:');
  
  if (scores.chemistry >= 75) {
    parts.push('Sofortige Chemie und magnetische Anziehung.');
  }
  
  if (connectionKeys.electromagnetic.length >= 2) {
    parts.push('Mehrere Electromagnetic Connections - sehr starke Anziehung.');
  }
  
  if (scores.stability < 50 && scores.chemistry >= 70) {
    parts.push('Hohe Chemie, aber niedrige Stabilität - kann intensiv und chaotisch sein.');
  }
  
  if (connectionKeys.companionship.length > 0) {
    parts.push(`${connectionKeys.companionship.length} Companionship-Verbindung${connectionKeys.companionship.length > 1 ? 'en' : ''} schaffen harmonische Basis.`);
  }
  
  return parts.join(' ');
}

/**
 * Generate Coaching Notes
 */
function generateCoachingNotes(
  connectionKeys: ConnectionKeysAnalysis,
  scores: ConnectionScores,
  profileType: ProfileType
): string[] {
  const notes: string[] = [];
  
  notes.push(`Profil-Typ: ${profileType}`);
  
  if (connectionKeys.compromise.length > 0) {
    notes.push(`Arbeite mit den ${connectionKeys.compromise.length} Compromise-Dynamiken - sie sind Wachstumsfelder, nicht Probleme.`);
  }
  
  if (scores.chemistry >= 80 && scores.stability < 60) {
    notes.push('Hohe Chemie mit niedriger Stabilität - unterstütze bewusste Kommunikation und Grenzen.');
  }
  
  if (connectionKeys.dominance.length > 2) {
    notes.push('Viele Dominance-Strukturen - kläre Rollen und Hierarchien bewusst.');
  }
  
  if (scores.growth >= 70) {
    notes.push('Hohes Wachstumspotenzial - nutze die Triggerarbeit für Transformation.');
  }
  
  return notes;
}


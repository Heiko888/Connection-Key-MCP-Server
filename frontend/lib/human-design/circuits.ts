/**
 * Human Design Schaltkreise (Circuits)
 * 
 * Schaltkreise beschreiben die energetische Qualität und den Zweck der Kanäle.
 * Sie zeigen, wie Energie fließt und welche Themen damit verbunden sind.
 */

import { Channel } from './channels';

export type CircuitGroup = 'Individual' | 'Tribal' | 'Collective';
export type CircuitName = 
  // Individual
  | 'Integration' 
  | 'Centering' 
  | 'Knowing'
  // Tribal
  | 'Defense' 
  | 'Ego'
  // Collective
  | 'Understanding' 
  | 'Sensing' 
  | 'Logic';

export interface Circuit {
  group: CircuitGroup;
  name: CircuitName;
  description: string;
  keywords: string[];
  channels: string[]; // e.g., ["1-8", "10-20"]
}

export interface CircuitResult {
  group: CircuitGroup;
  name: CircuitName;
  channelCount: number;
  activeChannels: string[];
}

/**
 * Alle Human Design Schaltkreise mit ihren Eigenschaften
 */
export const CIRCUITS: Record<CircuitName, Circuit> = {
  // INDIVIDUAL CIRCUITS
  'Integration': {
    group: 'Individual',
    name: 'Integration',
    description: 'Kreativität, Mutation und einzigartige Selbstentfaltung. Diese Energie ist unpredictabel und individuell.',
    keywords: ['Kreativität', 'Mutation', 'Einzigartigkeit', 'Empowerment'],
    channels: ['57-10', '34-10', '57-20', '34-20', '10-20']
  },
  'Centering': {
    group: 'Individual',
    name: 'Centering',
    description: 'Selbst-Ermächtigung und das Finden des eigenen Weges. Fokus auf persönliche Authentizität.',
    keywords: ['Selbstermächtigung', 'Authentizität', 'Eigener Weg', 'Zentrierung'],
    channels: ['1-8', '7-31', '13-33', '25-51']
  },
  'Knowing': {
    group: 'Individual',
    name: 'Knowing',
    description: 'Intuitives Wissen und akustische Bewusstheit. Spontane Einsichten und Erkenntnisse.',
    keywords: ['Intuition', 'Akustik', 'Spontanes Wissen', 'Einsicht'],
    channels: ['43-23', '11-56', '61-24', '17-62', '63-4']
  },

  // TRIBAL CIRCUITS
  'Defense': {
    group: 'Tribal',
    name: 'Defense',
    description: 'Stammes-Unterstützung, Familie und materielle Sicherheit. Sorge für die Gemeinschaft.',
    keywords: ['Familie', 'Unterstützung', 'Materielle Sicherheit', 'Gemeinschaft'],
    channels: ['45-21', '37-40', '19-49', '50-27']
  },
  'Ego': {
    group: 'Tribal',
    name: 'Ego',
    description: 'Willenskraft, Durchsetzung und materielle Manifestation. Versprechen und Vereinbarungen.',
    keywords: ['Willenskraft', 'Ego', 'Versprechen', 'Materiell'],
    channels: ['26-44', '40-37', '21-45']
  },

  // COLLECTIVE CIRCUITS
  'Understanding': {
    group: 'Collective',
    name: 'Understanding',
    description: 'Logisches Verstehen, Muster erkennen und Wissen teilen. Abstrakte Gedanken.',
    keywords: ['Logik', 'Muster', 'Wissen teilen', 'Abstrakt'],
    channels: ['63-4', '11-56', '47-64', '24-61', '17-62', '43-23']
  },
  'Sensing': {
    group: 'Collective',
    name: 'Sensing',
    description: 'Emotionales Bewusstsein und das Teilen von Erfahrungen. Lernen durch Erleben.',
    keywords: ['Emotionen', 'Erfahrung', 'Teilen', 'Empfindung'],
    channels: ['6-59', '22-12', '36-35', '30-41']
  },
  'Logic': {
    group: 'Collective',
    name: 'Logic',
    description: 'Praktische Logik, Formeln und reproduzierbares Wissen. Wissenschaftliches Denken.',
    keywords: ['Logik', 'Wissenschaft', 'Formeln', 'Reproduzierbar'],
    channels: ['5-15', '2-14', '46-29', '7-31', '16-48']
  }
};

/**
 * Zuordnung: Kanal → Schaltkreis
 * Manche Kanäle können in mehreren Schaltkreisen sein
 */
export const CHANNEL_TO_CIRCUIT: Record<string, CircuitName[]> = {
  // Individual - Integration
  '10-57': ['Integration'],
  '10-34': ['Integration'],
  '20-57': ['Integration'],
  '20-34': ['Integration'],
  '10-20': ['Integration'],
  
  // Individual - Centering
  '1-8': ['Centering'],
  '7-31': ['Centering', 'Logic'], // In beiden!
  '13-33': ['Centering'],
  '25-51': ['Centering'],
  
  // Individual - Knowing
  '23-43': ['Knowing'],
  '11-56': ['Knowing', 'Understanding'], // In beiden!
  '24-61': ['Knowing', 'Understanding'], // In beiden!
  '17-62': ['Knowing', 'Understanding'], // In beiden!
  '4-63': ['Knowing', 'Understanding'], // In beiden!
  
  // Tribal - Defense
  '21-45': ['Defense', 'Ego'], // In beiden!
  '37-40': ['Defense', 'Ego'], // In beiden!
  '19-49': ['Defense'],
  '27-50': ['Defense'],
  
  // Tribal - Ego
  '26-44': ['Ego'],
  
  // Collective - Understanding
  '47-64': ['Understanding'],
  
  // Collective - Sensing
  '6-59': ['Sensing'],
  '12-22': ['Sensing'],
  '35-36': ['Sensing'],
  '30-41': ['Sensing'],
  
  // Collective - Logic
  '5-15': ['Logic'],
  '2-14': ['Logic'],
  '29-46': ['Logic'],
  '16-48': ['Logic'],
  
  // Weitere Kanäle (nicht in Hauptschaltkreisen)
  '18-58': ['Logic'], // Urteil/Perfektion
  '28-38': ['Centering'], // Struggle/Opposition
  '32-54': ['Centering'], // Transformation
  '9-52': ['Defense'], // Konzentration
  '3-60': ['Knowing'], // Mutation
  '39-55': ['Sensing'], // Emotionale Tiefe
  '42-53': ['Understanding'], // Reifung
};

/**
 * Berechnet welche Schaltkreise aktiviert sind
 */
export function calculateCircuits(channels: Channel[]): CircuitResult[] {
  const circuitMap = new Map<CircuitName, Set<string>>();
  
  // Initialisiere alle Schaltkreise
  Object.keys(CIRCUITS).forEach(name => {
    circuitMap.set(name as CircuitName, new Set());
  });
  
  // Ordne aktive Kanäle den Schaltkreisen zu
  channels.forEach(channel => {
    const channelStr = `${channel.gates[0]}-${channel.gates[1]}`;
    const reverseStr = `${channel.gates[1]}-${channel.gates[0]}`;
    
    // Suche in beiden Richtungen
    const circuits = CHANNEL_TO_CIRCUIT[channelStr] || CHANNEL_TO_CIRCUIT[reverseStr];
    
    if (circuits) {
      circuits.forEach(circuitName => {
        circuitMap.get(circuitName)?.add(channelStr);
      });
    }
  });
  
  // Erstelle Result-Array (nur Schaltkreise mit aktiven Kanälen)
  const results: CircuitResult[] = [];
  
  circuitMap.forEach((channelSet, circuitName) => {
    if (channelSet.size > 0) {
      const circuit = CIRCUITS[circuitName];
      results.push({
        group: circuit.group,
        name: circuitName,
        channelCount: channelSet.size,
        activeChannels: Array.from(channelSet)
      });
    }
  });
  
  // Sortiere nach Gruppe und dann nach Anzahl der Kanäle
  results.sort((a, b) => {
    if (a.group !== b.group) {
      const groupOrder = { 'Individual': 0, 'Tribal': 1, 'Collective': 2 };
      return groupOrder[a.group] - groupOrder[b.group];
    }
    return b.channelCount - a.channelCount;
  });
  
  return results;
}

/**
 * Gibt eine Zusammenfassung der dominanten Schaltkreis-Gruppe
 */
export function getDominantCircuitGroup(circuits: CircuitResult[]): {
  group: CircuitGroup | null;
  percentage: number;
  description: string;
} {
  if (circuits.length === 0) {
    return {
      group: null,
      percentage: 0,
      description: 'Keine aktiven Schaltkreise gefunden.'
    };
  }
  
  const groupCounts = {
    'Individual': 0,
    'Tribal': 0,
    'Collective': 0
  };
  
  let totalChannels = 0;
  
  circuits.forEach(circuit => {
    groupCounts[circuit.group] += circuit.channelCount;
    totalChannels += circuit.channelCount;
  });
  
  const dominant = Object.entries(groupCounts)
    .sort(([, a], [, b]) => b - a)[0];
  
  const group = dominant[0] as CircuitGroup;
  const count = dominant[1];
  const percentage = Math.round((count / totalChannels) * 100);
  
  const descriptions: Record<CircuitGroup, string> = {
    'Individual': 'Du bist hier um einzigartig zu sein und zu mutieren. Deine Energie ist unvorhersehbar und kreativ.',
    'Tribal': 'Du bist hier um zu unterstützen und für deine Gemeinschaft zu sorgen. Familie und Sicherheit sind wichtig.',
    'Collective': 'Du bist hier um Wissen zu teilen und für alle da zu sein. Du denkst in größeren Zusammenhängen.'
  };
  
  return {
    group,
    percentage,
    description: descriptions[group]
  };
}

/**
 * Icons für Schaltkreis-Gruppen
 */
export const CIRCUIT_GROUP_ICONS: Record<CircuitGroup, string> = {
  'Individual': '⚡',
  'Tribal': '👥',
  'Collective': '🌍'
};

/**
 * Icons für einzelne Schaltkreise
 */
export const CIRCUIT_ICONS: Record<CircuitName, string> = {
  'Integration': '🔀',
  'Centering': '🎯',
  'Knowing': '💡',
  'Defense': '🛡️',
  'Ego': '👑',
  'Understanding': '🧠',
  'Sensing': '❤️',
  'Logic': '🔬'
};

/**
 * Farben für Schaltkreis-Gruppen (für UI)
 */
export const CIRCUIT_GROUP_COLORS: Record<CircuitGroup, string> = {
  'Individual': '#ff6b6b', // Rot
  'Tribal': '#51cf66', // Grün
  'Collective': '#339af0'  // Blau
};


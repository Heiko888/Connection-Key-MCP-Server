/**
 * Human Design Channels
 * All 36 channels between gates
 */

export interface Channel {
  number: number;
  name: string;
  gates: [number, number]; // [gate1, gate2]
  circuit: string;
  description: string;
}

/**
 * All 36 Human Design Channels
 */
export const CHANNELS: Channel[] = [
  // Individual Circuit - Knowing
  { number: 1, name: "Der Kanal der Inspiration", gates: [57, 20], circuit: "Individual", description: "Akustische Bewusstheit im Jetzt" },
  { number: 2, name: "Der Kanal des Beat", gates: [57, 10], circuit: "Individual", description: "Überleben durch Instinkt" },
  { number: 3, name: "Der Kanal der Mutation", gates: [3, 60], circuit: "Individual", description: "Energie für Neubeginn" },
  { number: 4, name: "Der Kanal der Verwandlung", gates: [39, 55], circuit: "Individual", description: "Emotionale Tiefe und Stimmung" },
  { number: 5, name: "Der Kanal des Rhythmus", gates: [5, 15], circuit: "Individual", description: "Im Flow sein" },
  { number: 6, name: "Der Kanal des Entdeckens", gates: [46, 29], circuit: "Individual", description: "Erfolg durch Hingabe" },
  
  // Collective Circuit - Logic
  { number: 7, name: "Der Kanal der Logik", gates: [63, 4], circuit: "Collective", description: "Mentale Klarheit durch Zweifel" },
  { number: 8, name: "Der Kanal der Akzeptanz", gates: [18, 58], circuit: "Collective", description: "Verbesserung durch Korrektur" },
  { number: 9, name: "Der Kanal der Konzentration", gates: [9, 52], circuit: "Collective", description: "Fokussierte Energie" },
  { number: 10, name: "Der Kanal des Verständnisses", gates: [24, 61], circuit: "Collective", description: "Innere Wahrheit finden" },
  
  // Collective Circuit - Abstract
  { number: 11, name: "Der Kanal der Neugier", gates: [11, 56], circuit: "Collective", description: "Geschichten erzählen" },
  { number: 12, name: "Der Kanal des Designs", gates: [35, 36], circuit: "Collective", description: "Erfahrung durch Krisen" },
  { number: 13, name: "Der Kanal des Erkennens", gates: [64, 47], circuit: "Collective", description: "Mentale Aktivität" },
  { number: 14, name: "Der Kanal der Reife", gates: [41, 30], circuit: "Collective", description: "Gefühle erkennen" },
  
  // Tribal Circuit - Ego
  { number: 15, name: "Der Kanal des Geldes", gates: [21, 45], circuit: "Tribal", description: "Materieller Erfolg" },
  { number: 16, name: "Der Kanal der Gemeinschaft", gates: [37, 40], circuit: "Tribal", description: "Verträge und Abkommen" },
  { number: 17, name: "Der Kanal der Intimität", gates: [59, 6], circuit: "Tribal", description: "Fortpflanzung" },
  { number: 18, name: "Der Kanal der Welle", gates: [12, 22], circuit: "Tribal", description: "Soziale Interaktion" },
  { number: 19, name: "Der Kanal des Urteils", gates: [19, 49], circuit: "Tribal", description: "Sensibilität für Bedürfnisse" },
  { number: 20, name: "Der Kanal der Hingabe", gates: [26, 44], circuit: "Tribal", description: "Übertragung durch Instinkt" },
  
  // Integration Channels
  { number: 21, name: "Der Kanal der Macht", gates: [34, 10], circuit: "Integration", description: "Archetypische Kraft" },
  { number: 22, name: "Der Kanal der Selbsterhaltung", gates: [27, 50], circuit: "Integration", description: "Fürsorge und Verantwortung" },
  { number: 23, name: "Der Kanal der Dominanz", gates: [25, 51], circuit: "Integration", description: "Initiation und Schock" },
  { number: 24, name: "Der Kanal der Transformation", gates: [53, 42], circuit: "Integration", description: "Zyklen vollenden" },
  { number: 25, name: "Der Kanal des Alpha", gates: [31, 7], circuit: "Integration", description: "Führung" },
  { number: 26, name: "Der Kanal der Initiation", gates: [13, 33], circuit: "Integration", description: "Zeuge sein" },
  { number: 27, name: "Der Kanal der Abstimmung", gates: [1, 8], circuit: "Integration", description: "Kreative Rolle" },
  { number: 28, name: "Der Kanal des Kampfes", gates: [28, 38], circuit: "Integration", description: "Für Sinn kämpfen" },
  { number: 29, name: "Der Kanal des Charisma", gates: [23, 43], circuit: "Integration", description: "Individualität ausdrücken" },
  { number: 30, name: "Der Kanal der Struktur", gates: [16, 48], circuit: "Integration", description: "Talent und Tiefe" },
  { number: 31, name: "Der Kanal der Transzendenz", gates: [2, 14], circuit: "Integration", description: "Große Ressourcen" },
  
  // Additional Important Channels
  { number: 32, name: "Der Kanal der Bewusstheit", gates: [20, 34], circuit: "Integration", description: "Im Moment handeln" },
  { number: 33, name: "Der Kanal der Suche", gates: [62, 17], circuit: "Collective", description: "Organisierte Informationen" },
  { number: 34, name: "Der Kanal der Liebe", gates: [25, 46], circuit: "Individual", description: "Universelle Liebe" },
  { number: 35, name: "Der Kanal des Übergangs", gates: [32, 54], circuit: "Collective", description: "Transformation" },
  { number: 36, name: "Der Kanal des Entdeckers", gates: [11, 29], circuit: "Individual", description: "Ungewissheit annehmen" },
  
  // Fehlende wichtige Channels
  { number: 37, name: "Der Kanal der Perfektion", gates: [10, 34], circuit: "Integration", description: "Selbstliebe und Perfektion" },
  { number: 38, name: "Der Kanal der Form", gates: [10, 57], circuit: "Integration", description: "Selbstliebe und Intuition" },
  { number: 39, name: "Der Kanal der Charisma", gates: [34, 57], circuit: "Integration", description: "Perfektion und Intuition" },
];

/**
 * Find which channels are activated based on active gates
 * @param activeGates Array of gate numbers that are activated
 * @returns Array of activated channels
 */
export function findActivatedChannels(activeGates: number[]): Channel[] {
  const gateSet = new Set(activeGates);
  
  return CHANNELS.filter(channel => {
    const [gate1, gate2] = channel.gates;
    return gateSet.has(gate1) && gateSet.has(gate2);
  });
}

/**
 * Format channels for display
 * @param channels Array of channels
 * @returns Formatted string
 */
export function formatChannels(channels: Channel[]): string {
  if (channels.length === 0) return 'Keine definierten Kanäle';
  
  return channels.map(ch => 
    `Kanal ${ch.gates[0]}-${ch.gates[1]}: ${ch.name}`
  ).join('\n');
}

/**
 * Get all gate numbers from personality and design data
 * @param personalityGates Object with planet gates
 * @param designGates Object with planet gates
 * @returns Array of unique gate numbers
 */
export function collectActiveGates(
  personalityGates: Record<string, number | undefined>,
  designGates: Record<string, number | undefined>
): number[] {
  const gates = new Set<number>();
  
  // Collect from personality
  Object.values(personalityGates).forEach(gate => {
    if (gate) gates.add(gate);
  });
  
  // Collect from design
  Object.values(designGates).forEach(gate => {
    if (gate) gates.add(gate);
  });
  
  return Array.from(gates);
}


/**
 * Human Design Centers (Zentren)
 * 
 * Mapping von Gates zu Zentren und Logik zur Berechnung des Zentren-Status
 */

export interface CenterStatus {
  krone: 'definiert' | 'offen' | 'undefiniert';
  ajna: 'definiert' | 'offen' | 'undefiniert';
  kehle: 'definiert' | 'offen' | 'undefiniert';
  gZentrum: 'definiert' | 'offen' | 'undefiniert';
  herzEgo: 'definiert' | 'offen' | 'undefiniert';
  sakral: 'definiert' | 'offen' | 'undefiniert';
  solarplexus: 'definiert' | 'offen' | 'undefiniert';
  milz: 'definiert' | 'offen' | 'undefiniert';
  wurzel: 'definiert' | 'offen' | 'undefiniert';
}

// Mapping: Welches Tor gehört zu welchem Zentrum?
export const GATE_TO_CENTER: { [gate: number]: keyof CenterStatus } = {
  // Krone (Head/Crown) - 3 Gates
  64: 'krone',
  61: 'krone',
  63: 'krone',

  // Ajna (Mind) - 6 Gates
  47: 'ajna',
  24: 'ajna',
  4: 'ajna',
  17: 'ajna',
  43: 'ajna',
  11: 'ajna',

  // Kehle (Throat) - 11 Gates
  62: 'kehle',
  23: 'kehle',
  56: 'kehle',
  35: 'kehle',
  12: 'kehle',
  45: 'kehle',
  33: 'kehle',
  8: 'kehle',
  31: 'kehle',
  20: 'kehle',
  16: 'kehle',

  // G-Zentrum (Identity/Self) - 8 Gates
  7: 'gZentrum',
  1: 'gZentrum',
  13: 'gZentrum',
  10: 'gZentrum',
  15: 'gZentrum',
  2: 'gZentrum',
  46: 'gZentrum',
  25: 'gZentrum',

  // Herz/Ego (Will/Heart) - 4 Gates
  51: 'herzEgo',
  21: 'herzEgo',
  40: 'herzEgo',
  26: 'herzEgo',

  // Sakral (Sacral) - 9 Gates
  5: 'sakral',
  14: 'sakral',
  29: 'sakral',
  59: 'sakral',
  9: 'sakral',
  3: 'sakral',
  42: 'sakral',
  27: 'sakral',
  34: 'sakral',

  // Solarplexus (Emotional/Solar Plexus) - 7 Gates
  6: 'solarplexus',
  37: 'solarplexus',
  22: 'solarplexus',
  36: 'solarplexus',
  30: 'solarplexus',
  55: 'solarplexus',
  49: 'solarplexus',

  // Milz (Spleen) - 7 Gates
  48: 'milz',
  57: 'milz',
  44: 'milz',
  50: 'milz',
  32: 'milz',
  28: 'milz',
  18: 'milz',

  // Wurzel (Root) - 9 Gates
  58: 'wurzel',
  38: 'wurzel',
  54: 'wurzel',
  53: 'wurzel',
  60: 'wurzel',
  52: 'wurzel',
  19: 'wurzel',
  39: 'wurzel',
  41: 'wurzel',
};

// Welche Kanäle definieren welches Zentrum?
// Ein Zentrum ist definiert, wenn mindestens ein vollständiger Kanal es verbindet
export interface CenterConnection {
  center: keyof CenterStatus;
  connectedTo: keyof CenterStatus;
}

// Kanal-zu-Zentren-Mapping (welcher Kanal verbindet welche Zentren?)
export const CHANNEL_CENTERS: { [channel: string]: [keyof CenterStatus, keyof CenterStatus] } = {
  // Krone → Ajna
  '61-24': ['krone', 'ajna'],
  '63-4': ['krone', 'ajna'],
  '64-47': ['krone', 'ajna'],

  // Ajna → Kehle
  '43-23': ['ajna', 'kehle'],
  '11-56': ['ajna', 'kehle'],
  '17-62': ['ajna', 'kehle'],
  '24-61': ['ajna', 'krone'], // Rückrichtung

  // Kehle → G-Zentrum
  '1-8': ['gZentrum', 'kehle'],
  '7-31': ['gZentrum', 'kehle'],
  '10-20': ['gZentrum', 'kehle'],
  '13-33': ['gZentrum', 'kehle'],
  '2-14': ['gZentrum', 'sakral'], // G → Sakral
  '46-29': ['gZentrum', 'sakral'], // G → Sakral
  '25-51': ['gZentrum', 'herzEgo'], // G → Herz
  '15-5': ['gZentrum', 'sakral'], // G → Sakral
  '10-34': ['gZentrum', 'sakral'], // G → Sakral (fehlender Channel)
  '10-57': ['gZentrum', 'milz'], // G → Milz (fehlender Channel)

  // Kehle → Herz/Ego
  '21-45': ['herzEgo', 'kehle'],
  '26-44': ['herzEgo', 'milz'], // Herz → Milz
  '40-37': ['herzEgo', 'solarplexus'], // Herz → Solarplexus
  '51-25': ['herzEgo', 'gZentrum'], // Herz → G

  // Kehle → Sakral
  '16-48': ['kehle', 'milz'], // Kehle → Milz
  '20-34': ['kehle', 'sakral'],
  '20-57': ['kehle', 'milz'], // Kehle → Milz
  '35-36': ['kehle', 'solarplexus'], // Kehle → Solarplexus
  '12-22': ['kehle', 'solarplexus'], // Kehle → Solarplexus

  // Kehle → Wurzel
  '62-17': ['kehle', 'ajna'], // Kehle → Ajna
  '8-1': ['kehle', 'gZentrum'], // Kehle → G
  '23-43': ['kehle', 'ajna'], // Kehle → Ajna
  '56-11': ['kehle', 'ajna'], // Kehle → Ajna
  '31-7': ['kehle', 'gZentrum'], // Kehle → G
  '33-13': ['kehle', 'gZentrum'], // Kehle → G

  // Sakral → Wurzel
  '3-60': ['sakral', 'wurzel'],
  '9-52': ['sakral', 'wurzel'],
  '5-15': ['sakral', 'gZentrum'], // Sakral → G
  '14-2': ['sakral', 'gZentrum'], // Sakral → G
  '29-46': ['sakral', 'gZentrum'], // Sakral → G
  '27-50': ['sakral', 'milz'], // Sakral → Milz
  '34-20': ['sakral', 'kehle'], // Sakral → Kehle
  '34-57': ['sakral', 'milz'], // Sakral → Milz
  '42-53': ['sakral', 'wurzel'], // Sakral → Wurzel
  '59-6': ['sakral', 'solarplexus'], // Sakral → Solarplexus

  // Solarplexus → Wurzel
  '30-41': ['solarplexus', 'wurzel'],
  '36-35': ['solarplexus', 'kehle'], // Solarplexus → Kehle
  '37-40': ['solarplexus', 'herzEgo'], // Solarplexus → Herz
  '22-12': ['solarplexus', 'kehle'], // Solarplexus → Kehle
  '49-19': ['solarplexus', 'wurzel'], // Solarplexus → Wurzel
  '55-39': ['solarplexus', 'wurzel'], // Solarplexus → Wurzel
  '6-59': ['solarplexus', 'sakral'], // Solarplexus → Sakral

  // Milz → verschiedene
  '18-58': ['milz', 'wurzel'], // Milz → Wurzel
  '28-38': ['milz', 'wurzel'], // Milz → Wurzel
  '32-54': ['milz', 'wurzel'], // Milz → Wurzel
  '44-26': ['milz', 'herzEgo'], // Milz → Herz
  '48-16': ['milz', 'kehle'], // Milz → Kehle
  '50-27': ['milz', 'sakral'], // Milz → Sakral
  '57-10': ['milz', 'gZentrum'], // Milz → G
  '57-20': ['milz', 'kehle'], // Milz → Kehle
  '57-34': ['milz', 'sakral'], // Milz → Sakral

  // Wurzel → verschiedene
  '19-49': ['wurzel', 'solarplexus'], // Wurzel → Solarplexus
  '38-28': ['wurzel', 'milz'], // Wurzel → Milz
  '39-55': ['wurzel', 'solarplexus'], // Wurzel → Solarplexus
  '41-30': ['wurzel', 'solarplexus'], // Wurzel → Solarplexus
  '52-9': ['wurzel', 'sakral'], // Wurzel → Sakral
  '53-42': ['wurzel', 'sakral'], // Wurzel → Sakral
  '54-32': ['wurzel', 'milz'], // Wurzel → Milz
  '58-18': ['wurzel', 'milz'], // Wurzel → Milz
  '60-3': ['wurzel', 'sakral'], // Wurzel → Sakral
};

/**
 * Berechnet den Status aller Zentren basierend auf aktivierten Gates
 * 
 * @param activeGates - Array von aktivierten Gate-Nummern (z.B. [10, 20, 13, 33])
 * @returns CenterStatus Objekt mit dem Status jedes Zentrums
 */
export function calculateCenters(activeGates: number[]): CenterStatus {
  // Initialisiere alle Zentren als "undefiniert"
  const centerStatus: CenterStatus = {
    krone: 'undefiniert',
    ajna: 'undefiniert',
    kehle: 'undefiniert',
    gZentrum: 'undefiniert',
    herzEgo: 'undefiniert',
    sakral: 'undefiniert',
    solarplexus: 'undefiniert',
    milz: 'undefiniert',
    wurzel: 'undefiniert',
  };

  // Sammle aktivierte Gates pro Zentrum
  const centerGates: { [center: string]: Set<number> } = {
    krone: new Set(),
    ajna: new Set(),
    kehle: new Set(),
    gZentrum: new Set(),
    herzEgo: new Set(),
    sakral: new Set(),
    solarplexus: new Set(),
    milz: new Set(),
    wurzel: new Set(),
  };

  // Ordne aktivierte Gates den Zentren zu
  activeGates.forEach(gate => {
    const center = GATE_TO_CENTER[gate];
    if (center) {
      centerGates[center].add(gate);
    }
  });

  // Prüfe für jeden Kanal, ob beide Gates aktiviert sind
  const definedCenters = new Set<keyof CenterStatus>();

  Object.entries(CHANNEL_CENTERS).forEach(([channel, [center1, center2]]) => {
    const [gate1, gate2] = channel.split('-').map(Number);
    
    // Wenn beide Gates des Kanals aktiviert sind, sind beide verbundenen Zentren definiert
    if (activeGates.includes(gate1) && activeGates.includes(gate2)) {
      definedCenters.add(center1);
      definedCenters.add(center2);
    }
  });

  // Setze Status für jedes Zentrum
  (Object.keys(centerStatus) as (keyof CenterStatus)[]).forEach(center => {
    if (definedCenters.has(center)) {
      centerStatus[center] = 'definiert';
    } else if (centerGates[center].size > 0) {
      // Hat Gates, aber keinen vollständigen Kanal → offen
      centerStatus[center] = 'offen';
    } else {
      // Keine Gates → undefiniert
      centerStatus[center] = 'undefiniert';
    }
  });

  return centerStatus;
}

/**
 * Gibt eine lesbare Beschreibung eines Zentrums zurück
 */
export function getCenterDescription(center: keyof CenterStatus): string {
  const descriptions: { [key in keyof CenterStatus]: string } = {
    krone: 'Krone (Inspiration & Druck)',
    ajna: 'Ajna (Konzepte & Denken)',
    kehle: 'Kehle (Manifestation & Kommunikation)',
    gZentrum: 'G-Zentrum (Identität & Richtung)',
    herzEgo: 'Herz/Ego (Willenskraft & Selbstwert)',
    sakral: 'Sakral (Lebenskraft & Energie)',
    solarplexus: 'Solarplexus (Emotionen & Gefühle)',
    milz: 'Milz (Intuition & Gesundheit)',
    wurzel: 'Wurzel (Druck & Antrieb)',
  };
  return descriptions[center];
}


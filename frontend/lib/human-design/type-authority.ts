/**
 * Human Design Typ und Autorität Berechnung
 * 
 * Automatische Bestimmung des Human Design Typs und der inneren Autorität
 * basierend auf den definierten Zentren und Kanälen.
 */

import { CenterStatus } from './centers';
import { Channel } from './channels';

export type HDType = 
  | 'Manifestor' 
  | 'Generator' 
  | 'Manifestierender Generator' 
  | 'Projektor' 
  | 'Reflektor';

export type HDAuthority = 
  | 'Emotional' 
  | 'Sakral' 
  | 'Milz' 
  | 'Ego' 
  | 'Self-Projected' 
  | 'Mental' 
  | 'Lunar' 
  | 'Keine';

export type Strategy = 
  | 'Informieren' 
  | 'Warten und Antworten' 
  | 'Warten, Antworten und Informieren' 
  | 'Warten auf Einladung' 
  | 'Warten einen Mondzyklus';

export type NotSelfTheme = 
  | 'Wut' 
  | 'Frustration' 
  | 'Frustration und Wut' 
  | 'Bitterkeit' 
  | 'Enttäuschung';

export type Signature = 
  | 'Frieden' 
  | 'Zufriedenheit' 
  | 'Zufriedenheit und Frieden' 
  | 'Erfolg' 
  | 'Überraschung';

export type DefinitionType = 
  | 'Single Definition' 
  | 'Split Definition' 
  | 'Triple Split' 
  | 'Quadruple Split' 
  | 'No Definition';

export interface TypeAuthorityResult {
  type: HDType;
  authority: HDAuthority;
  strategy: Strategy;
  notSelfTheme: NotSelfTheme;
  signature: Signature;
  definition: DefinitionType;
  explanation: {
    type: string;
    authority: string;
    strategy: string;
    notSelfTheme: string;
    signature: string;
    definition: string;
  };
}

/**
 * Prüft ob ein Zentrum definiert ist
 */
function isDefined(centers: CenterStatus, centerKey: keyof CenterStatus): boolean {
  return centers[centerKey] === 'definiert';
}

/**
 * Prüft ob die Kehle direkt mit einem Motor verbunden ist
 * Motor-Zentren: Wurzel, Sakral, Solarplexus, Herz/Ego
 */
function hasThroatToMotorConnection(centers: CenterStatus, channels: Channel[]): boolean {
  // Kehle muss definiert sein
  if (!isDefined(centers, 'kehle')) return false;
  
  // Prüfe auf direkte Verbindung zu Motor-Zentren
  // Dies ist eine vereinfachte Prüfung - in der Realität müsste man die genauen Kanäle prüfen
  // Kanäle, die Kehle mit Motoren verbinden:
  // - Kehle zu Wurzel: 31-7
  // - Kehle zu Sakral: 16-48 (über Milz), 20-34, 20-10, 12-22 (über Solarplexus)
  // - Kehle zu Herz: 45-21, 26-51
  // - Kehle zu Solarplexus: 12-22, 35-36
  
  const throatToMotorChannels = [
    [31, 7],   // Kehle-Ajna-G-Selbst-Wurzel (indirekt)
    [20, 34],  // Kehle-Sakral
    [20, 10],  // Kehle-G-Selbst (nicht direkt Motor)
    [45, 21],  // Kehle-Herz
    [26, 51],  // Kehle-Herz
    [12, 22],  // Kehle-Solarplexus
    [35, 36],  // Kehle-Solarplexus
    [16, 48],  // Kehle-Milz (nicht direkt Motor)
  ];
  
  // Prüfe ob einer dieser Kanäle aktiviert ist
  for (const channel of channels) {
    const [g1, g2] = channel.gates;
    for (const [cg1, cg2] of throatToMotorChannels) {
      if ((g1 === cg1 && g2 === cg2) || (g1 === cg2 && g2 === cg1)) {
        // Zusätzliche Prüfung: ist das andere Ende auch ein Motor?
        // 34 (Sakral), 21/45 (Herz), 22/36 (Solarplexus), 7 (G, kein Motor)
        if ([34, 21, 45, 22, 36].includes(g1) || [34, 21, 45, 22, 36].includes(g2)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Berechnet den Human Design Typ
 */
export function calculateType(centers: CenterStatus, channels: Channel[]): HDType {
  const sakralDefined = isDefined(centers, 'sakral');
  const kehleDefined = isDefined(centers, 'kehle');
  
  // 1. Reflektor: ALLE Zentren offen (sehr selten)
  const allCentersOpen = Object.values(centers).every(status => status === 'offen' || status === 'undefiniert');
  if (allCentersOpen) {
    return 'Reflektor';
  }
  
  // 2. Manifestor: Kehle definiert + direkt zu Motor (OHNE Sakral) oder Kehle zu Herz
  if (kehleDefined && !sakralDefined) {
    // Prüfe ob Kehle zu einem Motor verbunden ist (außer Sakral)
    const herzDefined = isDefined(centers, 'herzEgo');
    const wurzelDefined = isDefined(centers, 'wurzel');
    const solarplexusDefined = isDefined(centers, 'solarplexus');
    
    if (herzDefined || wurzelDefined || solarplexusDefined) {
      // Prüfe auf direkte Verbindung
      if (hasThroatToMotorConnection(centers, channels)) {
        return 'Manifestor';
      }
    }
  }
  
  // 3. Generator / Manifestierender Generator: Sakral definiert
  if (sakralDefined) {
    // Manifestierender Generator: Sakral definiert + Kehle-Motor-Verbindung
    if (kehleDefined && hasThroatToMotorConnection(centers, channels)) {
      return 'Manifestierender Generator';
    }
    // Generator: Sakral definiert ohne Kehle-Motor-Verbindung
    return 'Generator';
  }
  
  // 4. Projektor: Sakral NICHT definiert + mindestens 1 definiertes Zentrum
  // (Standard-Fall wenn nichts anderes zutrifft)
  return 'Projektor';
}

/**
 * Berechnet die innere Autorität
 */
export function calculateAuthority(centers: CenterStatus, type: HDType): HDAuthority {
  // Reflektoren haben immer Lunar Authority
  if (type === 'Reflektor') {
    return 'Lunar';
  }
  
  // Hierarchie der Autoritäten (von oben nach unten):
  
  // 1. Emotional Authority (Solar Plexus definiert)
  if (isDefined(centers, 'solarplexus')) {
    return 'Emotional';
  }
  
  // 2. Sakral Authority (Sakral definiert, Solar Plexus offen)
  if (isDefined(centers, 'sakral')) {
    return 'Sakral';
  }
  
  // 3. Milz Authority (Milz definiert, Sakral + Solar Plexus offen)
  if (isDefined(centers, 'milz')) {
    return 'Milz';
  }
  
  // 4. Ego/Herz Authority (Herz definiert, höhere Autoritäten offen)
  if (isDefined(centers, 'herzEgo')) {
    return 'Ego';
  }
  
  // 5. Self-Projected Authority (G-Zentrum definiert, höhere Autoritäten offen)
  // Typisch für Projektoren mit definiertem G-Zentrum
  if (isDefined(centers, 'gZentrum')) {
    return 'Self-Projected';
  }
  
  // 6. Mental Authority (Ajna/Krone definiert, alle anderen offen)
  // Typisch für mentale Projektoren
  if (isDefined(centers, 'ajna') || isDefined(centers, 'krone')) {
    return 'Mental';
  }
  
  // Fallback: Keine innere Autorität
  return 'Keine';
}

/**
 * Berechnet die Strategie basierend auf dem Typ
 */
export function calculateStrategy(type: HDType): Strategy {
  const strategyMap: Record<HDType, Strategy> = {
    'Manifestor': 'Informieren',
    'Generator': 'Warten und Antworten',
    'Manifestierender Generator': 'Warten, Antworten und Informieren',
    'Projektor': 'Warten auf Einladung',
    'Reflektor': 'Warten einen Mondzyklus'
  };
  return strategyMap[type];
}

/**
 * Berechnet das Nicht-Selbst Thema basierend auf dem Typ
 */
export function calculateNotSelfTheme(type: HDType): NotSelfTheme {
  const notSelfMap: Record<HDType, NotSelfTheme> = {
    'Manifestor': 'Wut',
    'Generator': 'Frustration',
    'Manifestierender Generator': 'Frustration und Wut',
    'Projektor': 'Bitterkeit',
    'Reflektor': 'Enttäuschung'
  };
  return notSelfMap[type];
}

/**
 * Berechnet die Signatur basierend auf dem Typ
 */
export function calculateSignature(type: HDType): Signature {
  const signatureMap: Record<HDType, Signature> = {
    'Manifestor': 'Frieden',
    'Generator': 'Zufriedenheit',
    'Manifestierender Generator': 'Zufriedenheit und Frieden',
    'Projektor': 'Erfolg',
    'Reflektor': 'Überraschung'
  };
  return signatureMap[type];
}

/**
 * Berechnet den Definitions-Typ basierend auf den Zentren und Kanälen
 * 
 * Definition beschreibt, wie die definierten Zentren miteinander verbunden sind.
 * Dies beeinflusst, wie konsistent und zuverlässig die Energie fließt.
 */
export function calculateDefinition(centers: CenterStatus, channels: Channel[]): DefinitionType {
  // Zähle definierte Zentren
  const definedCenters = Object.entries(centers).filter(([_, status]) => status === 'definiert');
  
  // Reflektor: alle Zentren offen
  if (definedCenters.length === 0) {
    return 'No Definition';
  }

  // Erstelle eine Map der Zentren-Verbindungen durch Kanäle
  const centerConnections = new Map<string, Set<string>>();
  
  // Initialisiere alle definierten Zentren
  definedCenters.forEach(([centerKey]) => {
    centerConnections.set(centerKey, new Set());
  });

  // Füge Verbindungen durch Kanäle hinzu
  // Jeder Kanal verbindet zwei Zentren
  channels.forEach(channel => {
    const [gate1, gate2] = channel.gates;
    const center1 = getCenterForGate(gate1);
    const center2 = getCenterForGate(gate2);
    
    if (center1 && center2 && centers[center1] === 'definiert' && centers[center2] === 'definiert') {
      centerConnections.get(center1)?.add(center2);
      centerConnections.get(center2)?.add(center1);
    }
  });

  // Finde zusammenhängende Komponenten (Connected Components)
  const visited = new Set<string>();
  const components: string[][] = [];

  function dfs(centerKey: string, component: string[]) {
    visited.add(centerKey);
    component.push(centerKey);
    
    const connections = centerConnections.get(centerKey);
    if (connections) {
      connections.forEach(connectedCenter => {
        if (!visited.has(connectedCenter)) {
          dfs(connectedCenter, component);
        }
      });
    }
  }

  definedCenters.forEach(([centerKey]) => {
    if (!visited.has(centerKey)) {
      const component: string[] = [];
      dfs(centerKey, component);
      components.push(component);
    }
  });

  // Bestimme Definitions-Typ basierend auf Anzahl der Komponenten
  switch (components.length) {
    case 1:
      return 'Single Definition';
    case 2:
      return 'Split Definition';
    case 3:
      return 'Triple Split';
    case 4:
      return 'Quadruple Split';
    default:
      return 'Split Definition';
  }
}

/**
 * Hilfsfunktion: Ermittelt das Zentrum für ein bestimmtes Tor
 */
function getCenterForGate(gate: number): keyof CenterStatus | null {
  // Import der GATE_TO_CENTER Mapping aus centers.ts
  const gateMapping: Record<number, keyof CenterStatus> = {
    // Krone
    61: 'krone', 63: 'krone', 64: 'krone',
    // Ajna
    47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 43: 'ajna', 11: 'ajna',
    // Kehle
    62: 'kehle', 23: 'kehle', 56: 'kehle', 35: 'kehle', 12: 'kehle', 45: 'kehle', 33: 'kehle', 8: 'kehle', 31: 'kehle', 20: 'kehle', 16: 'kehle',
    // G-Zentrum
    7: 'gZentrum', 1: 'gZentrum', 13: 'gZentrum', 10: 'gZentrum', 25: 'gZentrum', 46: 'gZentrum', 2: 'gZentrum', 15: 'gZentrum',
    // Herz/Ego
    51: 'herzEgo', 26: 'herzEgo', 21: 'herzEgo', 40: 'herzEgo',
    // Sakral
    5: 'sakral', 14: 'sakral', 29: 'sakral', 59: 'sakral', 9: 'sakral', 3: 'sakral', 42: 'sakral', 27: 'sakral', 34: 'sakral',
    // Solarplexus
    6: 'solarplexus', 37: 'solarplexus', 22: 'solarplexus', 36: 'solarplexus', 30: 'solarplexus', 55: 'solarplexus', 49: 'solarplexus',
    // Milz
    48: 'milz', 57: 'milz', 44: 'milz', 50: 'milz', 32: 'milz', 28: 'milz', 18: 'milz',
    // Wurzel
    58: 'wurzel', 38: 'wurzel', 54: 'wurzel', 53: 'wurzel', 60: 'wurzel', 52: 'wurzel', 19: 'wurzel', 39: 'wurzel', 41: 'wurzel'
  };
  
  return gateMapping[gate] || null;
}

/**
 * Generiert Erklärungen für alle Aspekte
 */
function generateExplanations(
  type: HDType, 
  authority: HDAuthority, 
  strategy: Strategy,
  notSelfTheme: NotSelfTheme,
  signature: Signature,
  definition: DefinitionType,
  centers: CenterStatus
): {
  type: string;
  authority: string;
  strategy: string;
  notSelfTheme: string;
  signature: string;
  definition: string;
} {
  const typeExplanations: Record<HDType, string> = {
    'Manifestor': 'Kehle ist mit einem Motor verbunden (ohne Sakral). Du bist hier um zu initiieren und zu manifestieren.',
    'Generator': 'Sakral-Zentrum ist definiert. Du bist hier um zu antworten und zu erschaffen.',
    'Manifestierender Generator': 'Sakral-Zentrum ist definiert UND Kehle ist mit einem Motor verbunden. Du bist ein Multi-Tasking-Typ, der schnell manifestieren kann.',
    'Projektor': 'Sakral-Zentrum ist offen, aber andere Zentren sind definiert. Du bist hier um zu führen und zu leiten.',
    'Reflektor': 'Alle Zentren sind offen. Du bist hier um zu reflektieren und zu spiegeln.'
  };
  
  const authorityExplanations: Record<HDAuthority, string> = {
    'Emotional': 'Solarplexus ist definiert. Warte auf emotionale Klarheit über Zeit.',
    'Sakral': 'Sakral ist definiert (Solarplexus offen). Höre auf deine Bauch-Antworten (Ja/Nein).',
    'Milz': 'Milz ist definiert (Sakral + Solarplexus offen). Vertraue deiner spontanen Intuition im Moment.',
    'Ego': 'Herz/Ego ist definiert. Entscheide aus deinem Willen und Selbstwert heraus.',
    'Self-Projected': 'G-Zentrum ist definiert. Höre auf deine Stimme und sprich mit vertrauten Menschen.',
    'Mental': 'Nur Ajna/Krone definiert. Nutze deinen Verstand, aber entscheide in deiner Umgebung.',
    'Lunar': 'Alle Zentren offen (Reflektor). Warte einen vollen Mondzyklus (28 Tage) für wichtige Entscheidungen.',
    'Keine': 'Keine klare innere Autorität. Nutze deine Umgebung für Entscheidungen.'
  };

  const strategyExplanations: Record<Strategy, string> = {
    'Informieren': 'Informiere die Menschen in deinem Umfeld, bevor du handelst. Das schafft Frieden und Klarheit.',
    'Warten und Antworten': 'Warte auf das Leben, das zu dir kommt. Antworte aus deinem Sakral (Ja/Nein). Nicht initiieren.',
    'Warten, Antworten und Informieren': 'Warte auf sakrale Antwort, handle dann schnell und informiere Betroffene. Kombination aus Generator und Manifestor.',
    'Warten auf Einladung': 'Warte auf echte Einladungen für die großen Dinge (Beruf, Beziehung, Wohnort). Dann wird deine Weisheit erkannt.',
    'Warten einen Mondzyklus': 'Lass wichtige Entscheidungen einen vollen Mondzyklus (28 Tage) reifen. Du brauchst Zeit für Klarheit.'
  };

  const notSelfExplanations: Record<NotSelfTheme, string> = {
    'Wut': 'Wenn du nicht informierst oder gegen Widerstände anrennst, entsteht Wut. Zeichen: Du lebst nicht deine Strategie.',
    'Frustration': 'Wenn du initiierst statt zu antworten, entsteht Frustration. Zeichen: Du wartest nicht auf das Richtige.',
    'Frustration und Wut': 'Wenn du initiierst ohne zu warten UND handelst ohne zu informieren. Kombination beider Themen.',
    'Bitterkeit': 'Wenn du nicht eingeladen wirst oder deine Weisheit nicht erkannt wird. Zeichen: Du versuchst zu überzeugen.',
    'Enttäuschung': 'Wenn du zu schnell entscheidest oder dich zu sehr identifizierst. Zeichen: Du wartest nicht den Mondzyklus ab.'
  };

  const signatureExplanations: Record<Signature, string> = {
    'Frieden': 'Wenn du informierst und in deiner Kraft bist, erlebst du inneren Frieden. Das ist dein Zeichen der Ausrichtung.',
    'Zufriedenheit': 'Wenn du antwortest statt zu initiieren, erlebst du tiefe Zufriedenheit. Das ist dein Zeichen der Ausrichtung.',
    'Zufriedenheit und Frieden': 'Wenn du wartest, antwortest UND informierst, erlebst du Zufriedenheit und Frieden. Beides zusammen.',
    'Erfolg': 'Wenn du auf Einladung wartest, wirst du erfolgreich sein. Echter, nachhaltiger Erfolg ist dein Zeichen.',
    'Überraschung': 'Wenn du Zeit nimmst und dich nicht festlegst, erlebst du positive Überraschungen. Das Leben überrascht dich.'
  };

  const definitionExplanations: Record<DefinitionType, string> = {
    'Single Definition': 'Alle definierten Zentren sind miteinander verbunden. Du bist in dir selbst komplett und brauchst keine anderen für deine Prozesse.',
    'Split Definition': 'Deine Zentren sind in 2 separate Bereiche geteilt. Du brauchst eine Brücke (Zeit, Menschen, Transit) zwischen den Bereichen.',
    'Triple Split': 'Deine Zentren sind in 3 Bereiche geteilt. Du brauchst mehr Zeit und externe Einflüsse, um alle Teile zu verbinden.',
    'Quadruple Split': 'Deine Zentren sind in 4 Bereiche geteilt (sehr selten). Du brauchst viele verschiedene Einflüsse für innere Klarheit.',
    'No Definition': 'Alle Zentren sind offen (Reflektor). Du nimmst alles wahr und reflektierst deine Umgebung.'
  };
  
  return {
    type: typeExplanations[type],
    authority: authorityExplanations[authority],
    strategy: strategyExplanations[strategy],
    notSelfTheme: notSelfExplanations[notSelfTheme],
    signature: signatureExplanations[signature],
    definition: definitionExplanations[definition]
  };
}

/**
 * Berechnet Typ und Autorität aus den Zentren und Kanälen
 */
export function calculateTypeAndAuthority(
  centers: CenterStatus, 
  channels: Channel[]
): TypeAuthorityResult {
  const type = calculateType(centers, channels);
  const authority = calculateAuthority(centers, type);
  const strategy = calculateStrategy(type);
  const notSelfTheme = calculateNotSelfTheme(type);
  const signature = calculateSignature(type);
  const definition = calculateDefinition(centers, channels);
  const explanation = generateExplanations(type, authority, strategy, notSelfTheme, signature, definition, centers);
  
  return {
    type,
    authority,
    strategy,
    notSelfTheme,
    signature,
    definition,
    explanation
  };
}

/**
 * Typ-Icons für UI
 */
export const TYPE_ICONS: Record<HDType, string> = {
  'Manifestor': '⚡',
  'Generator': '🔋',
  'Manifestierender Generator': '⚡🔋',
  'Projektor': '🎯',
  'Reflektor': '🌙'
};

/**
 * Autoritäts-Icons für UI
 */
export const AUTHORITY_ICONS: Record<HDAuthority, string> = {
  'Emotional': '🌊',
  'Sakral': '💫',
  'Milz': '⚡',
  'Ego': '💎',
  'Self-Projected': '🗣️',
  'Mental': '🧠',
  'Lunar': '🌙',
  'Keine': '❓'
};

/**
 * Strategie-Icons für UI
 */
export const STRATEGY_ICONS: Record<Strategy, string> = {
  'Informieren': '📢',
  'Warten und Antworten': '⏳',
  'Warten, Antworten und Informieren': '⚡📢',
  'Warten auf Einladung': '🎫',
  'Warten einen Mondzyklus': '🌙'
};

/**
 * Nicht-Selbst-Icons für UI
 */
export const NOT_SELF_ICONS: Record<NotSelfTheme, string> = {
  'Wut': '😤',
  'Frustration': '😞',
  'Frustration und Wut': '😤😞',
  'Bitterkeit': '😔',
  'Enttäuschung': '😕'
};

/**
 * Signatur-Icons für UI
 */
export const SIGNATURE_ICONS: Record<Signature, string> = {
  'Frieden': '☮️',
  'Zufriedenheit': '😊',
  'Zufriedenheit und Frieden': '😊☮️',
  'Erfolg': '🏆',
  'Überraschung': '✨'
};

/**
 * Definitions-Icons für UI
 */
export const DEFINITION_ICONS: Record<DefinitionType, string> = {
  'Single Definition': '🔗',
  'Split Definition': '🔗➕🔗',
  'Triple Split': '🔗➕🔗➕🔗',
  'Quadruple Split': '🔗✖️4',
  'No Definition': '⭕'
};


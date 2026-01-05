/**
 * Inkarnationskreuz (Incarnation Cross) Berechnung
 * 
 * Das Inkarnationskreuz ist die Lebensaufgabe im Human Design System
 * und wird aus den 4 Hauptpositionen berechnet:
 * - Bewusste Sonne (Personality Sun)
 * - Bewusste Erde (Personality Earth)
 * - Unbewusste Sonne (Design Sun)
 * - Unbewusste Erde (Design Earth)
 */

import { GATE_NAMES } from './index';

export interface IncarnationCrossData {
  type: 'Rechtswinkel' | 'Linkswinkel' | 'Juxtaposition';
  personalitySunGate: number;
  personalityEarthGate: number;
  designSunGate: number;
  designEarthGate: number;
  name: string;
  shortName: string;
  description: string;
}

/**
 * Bestimmt den Kreuz-Typ basierend auf dem Profil
 */
export function getCrossType(profile: string): 'Rechtswinkel' | 'Linkswinkel' | 'Juxtaposition' {
  // Rechtswinkel Profile (persönliches Schicksal)
  const rightAngleProfiles = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6'];
  
  // Linkswinkel Profile (transpersonales Schicksal)
  const leftAngleProfiles = ['4/1', '5/1', '5/2', '6/2', '6/3'];
  
  // Juxtaposition ist sehr selten und hat spezielle Bedingungen
  // Vereinfacht: nur Profile mit gleichen Zahlen
  const juxtapositionProfiles = ['4/1']; // In manchen Fällen
  
  if (rightAngleProfiles.includes(profile)) {
    return 'Rechtswinkel';
  } else if (leftAngleProfiles.includes(profile)) {
    return 'Linkswinkel';
  } else {
    // Default zu Rechtswinkel wenn nicht eindeutig
    return 'Rechtswinkel';
  }
}

/**
 * Generiert den Namen des Inkarnationskreuzes
 */
export function generateCrossName(
  type: 'Rechtswinkel' | 'Linkswinkel' | 'Juxtaposition',
  personalitySunGate: number,
  personalityEarthGate: number,
  designSunGate: number,
  designEarthGate: number
): string {
  const typePrefix = 
    type === 'Rechtswinkel' ? 'RAX' :
    type === 'Linkswinkel' ? 'LAX' :
    'JUX';
  
  // Hauptname basiert auf den beiden Sonnen
  const sunName1 = GATE_NAMES[personalitySunGate]?.split(' ')[0] || `Tor ${personalitySunGate}`;
  const sunName2 = GATE_NAMES[designSunGate]?.split(' ')[0] || `Tor ${designSunGate}`;
  
  return `${typePrefix} ${personalitySunGate}/${designSunGate}`;
}

/**
 * Generiert Kurzname für das Kreuz
 */
export function generateShortCrossName(
  personalitySunGate: number,
  designSunGate: number
): string {
  const name1 = GATE_NAMES[personalitySunGate] || `Tor ${personalitySunGate}`;
  const name2 = GATE_NAMES[designSunGate] || `Tor ${designSunGate}`;
  
  return `${name1} - ${name2}`;
}

/**
 * Generiert Beschreibung des Kreuzes
 */
export function generateCrossDescription(
  type: 'Rechtswinkel' | 'Linkswinkel' | 'Juxtaposition',
  personalitySunGate: number,
  personalityEarthGate: number,
  designSunGate: number,
  designEarthGate: number
): string {
  const typeDesc = 
    type === 'Rechtswinkel' 
      ? 'Ein persönliches Schicksal - Dein Kreuz ist auf deine eigene Entwicklung und Selbstverwirklichung ausgerichtet.' :
    type === 'Linkswinkel'
      ? 'Ein transpersonales Schicksal - Dein Kreuz ist darauf ausgerichtet, andere zu beeinflussen und mit ihnen zu interagieren.' :
    'Ein fixes Schicksal - Dein Kreuz ist sehr spezifisch und unveränderlich.';
  
  const gates = [
    `Bewusste Sonne: Tor ${personalitySunGate} (${GATE_NAMES[personalitySunGate]})`,
    `Bewusste Erde: Tor ${personalityEarthGate} (${GATE_NAMES[personalityEarthGate]})`,
    `Unbewusste Sonne: Tor ${designSunGate} (${GATE_NAMES[designSunGate]})`,
    `Unbewusste Erde: Tor ${designEarthGate} (${GATE_NAMES[designEarthGate]})`
  ].join('\n');
  
  return `${typeDesc}\n\n${gates}`;
}

/**
 * Berechnet das vollständige Inkarnationskreuz
 */
export function calculateIncarnationCross(
  profile: string,
  personalitySunGate: number,
  personalityEarthGate: number,
  designSunGate: number,
  designEarthGate: number
): IncarnationCrossData {
  const type = getCrossType(profile);
  const name = generateCrossName(type, personalitySunGate, personalityEarthGate, designSunGate, designEarthGate);
  const shortName = generateShortCrossName(personalitySunGate, designSunGate);
  const description = generateCrossDescription(type, personalitySunGate, personalityEarthGate, designSunGate, designEarthGate);
  
  return {
    type,
    personalitySunGate,
    personalityEarthGate,
    designSunGate,
    designEarthGate,
    name,
    shortName,
    description
  };
}

/**
 * Formatiert das Inkarnationskreuz für die Anzeige
 */
export function formatIncarnationCross(cross: IncarnationCrossData): string {
  return `${cross.type}-Kreuz der ${cross.shortName}`;
}

/**
 * Alle Inkarnationskreuz-Typen mit Icons
 */
export const CROSS_TYPE_ICONS: Record<string, string> = {
  'Rechtswinkel': '⊿',
  'Linkswinkel': '⊾',
  'Juxtaposition': '⊡'
};

/**
 * Beschreibungen der Kreuz-Typen
 */
export const CROSS_TYPE_DESCRIPTIONS: Record<string, string> = {
  'Rechtswinkel': 'Persönliches Schicksal - Fokus auf Selbstentwicklung und individuelle Erfüllung',
  'Linkswinkel': 'Transpersonales Schicksal - Fokus auf Beziehungen und Einfluss auf andere',
  'Juxtaposition': 'Fixes Schicksal - Einzigartiger und unveränderlicher Lebensweg'
};


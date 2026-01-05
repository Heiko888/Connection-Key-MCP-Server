/**
 * Human Design Profile Calculator
 */

/**
 * Calculate profile from sun lines
 * @param personalitySunLine Line number (1-6) of conscious sun
 * @param designSunLine Line number (1-6) of unconscious sun
 * @returns Profile string (e.g. "1/3", "2/4")
 */
export function calculateProfile(personalitySunLine: number, designSunLine: number): string {
  if (personalitySunLine < 1 || personalitySunLine > 6 || 
      designSunLine < 1 || designSunLine > 6) {
    return '';
  }
  
  return `${personalitySunLine}/${designSunLine}`;
}

/**
 * All 12 Profile descriptions (German)
 */
export const PROFILE_DESCRIPTIONS: Record<string, {
  name: string;
  description: string;
  keywords: string[];
}> = {
  '1/3': {
    name: 'Der Ermittler / Märtyrer',
    description: 'Du erforschst das Leben durch Trial & Error. Deine Basis ist solides Wissen, aber du lernst am besten durch eigene Erfahrung.',
    keywords: ['Forscher', 'Experimentell', 'Fundament', 'Lernen durch Fehler']
  },
  '1/4': {
    name: 'Der Ermittler / Opportunist',
    description: 'Du verbindest tiefes Wissen mit sozialen Netzwerken. Deine Freundschaften sind das Fundament für neue Möglichkeiten.',
    keywords: ['Wissend', 'Vernetzt', 'Beziehungen', 'Gelegenheiten']
  },
  '2/4': {
    name: 'Der Eremit / Opportunist',
    description: 'Du brauchst Zeit für dich selbst, aber deine Gaben zeigen sich durch Beziehungen. Der Ruf von außen bringt dich in Aktion.',
    keywords: ['Natürliches Talent', 'Rückzug', 'Beziehungen', 'Berufen werden']
  },
  '2/5': {
    name: 'Der Eremit / Häretiker',
    description: 'Du hast verborgene Talente und wirst oft für Lösungen gerufen. Menschen projizieren auf dich, was zu Missverständnissen führen kann.',
    keywords: ['Verborgen', 'Praktisch', 'Projektionen', 'Lösungen']
  },
  '3/5': {
    name: 'Der Märtyrer / Häretiker',
    description: 'Du experimentierst mutig und teilst praktische Lösungen. Dein Leben ist voller Trial & Error, was anderen hilft.',
    keywords: ['Experimentell', 'Mutig', 'Pragmatisch', 'Resilient']
  },
  '3/6': {
    name: 'Der Märtyrer / Rollenvorbild',
    description: 'Dein Leben verläuft in drei Phasen: Experimentieren (bis 30), Reflexion (30-50), Vorleben (ab 50).',
    keywords: ['Trial & Error', 'Beobachten', 'Weisheit', 'Rollenvorbild']
  },
  '4/6': {
    name: 'Der Opportunist / Rollenvorbild',
    description: 'Du verbindest Menschen und wirst im Alter zum weisen Vorbild. Deine Netzwerke sind deine Kraft.',
    keywords: ['Vernetzt', 'Freundschaften', 'Weisheit', 'Vorbild']
  },
  '4/1': {
    name: 'Der Opportunist / Ermittler',
    description: 'Du brauchst sowohl soziale Verbindungen als auch tiefes Wissen. Deine Freundschaften basieren auf authentischem Verständnis.',
    keywords: ['Beziehungen', 'Wissen', 'Authentisch', 'Fundament']
  },
  '5/1': {
    name: 'Der Häretiker / Ermittler',
    description: 'Du wirst für praktische Lösungen gerufen, die auf solidem Wissen basieren. Menschen erwarten viel von dir.',
    keywords: ['Praktisch', 'Lösungsorientiert', 'Projektion', 'Fundiert']
  },
  '5/2': {
    name: 'Der Häretiker / Eremit',
    description: 'Du lieferst universelle Lösungen, brauchst aber Rückzug. Der Wechsel zwischen Aktion und Ruhe ist essentiell.',
    keywords: ['Universell', 'Rückzug', 'Lösungen', 'Balance']
  },
  '6/2': {
    name: 'Das Rollenvorbild / Eremit',
    description: 'Du wirst zum weisen Vorbild, brauchst aber Zeit für dich. Deine Reife zeigt sich nach der Reflexionsphase.',
    keywords: ['Weisheit', 'Rückzug', 'Vorbild', 'Reife']
  },
  '6/3': {
    name: 'Das Rollenvorbild / Märtyrer',
    description: 'Dein Leben ist eine Reise durch Trial & Error zur Weisheit. Nach 50 Jahren wirst du zum objektiven Beobachter.',
    keywords: ['Prozess', 'Erfahrung', 'Weisheit', 'Objektivität']
  }
};

/**
 * Get profile information
 * @param profile Profile string (e.g. "1/3")
 * @returns Profile information or null
 */
export function getProfileInfo(profile: string) {
  return PROFILE_DESCRIPTIONS[profile] || null;
}

/**
 * Get all possible profiles
 */
export function getAllProfiles(): string[] {
  return Object.keys(PROFILE_DESCRIPTIONS);
}


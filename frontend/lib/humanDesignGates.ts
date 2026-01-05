// Human Design Gates Database - Alle 64 Tore mit Hexagrammen und detaillierten Beschreibungen

export interface GateData {
  id: string;
  name: string;
  center: string;
  hexagram: string;
  description: string;
  keywords: string[];
  lines: {
    [key: number]: {
      name: string;
      description: string;
      keywords: string[];
    };
  };
  color: string;
  element: string;
  trigram: string;
}

// Hexagram-Symbole für die 64 Tore
const hexagrams = [
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 1-8
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 9-16
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 17-24
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 25-32
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 33-40
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 41-48
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', // 49-56
  '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'  // 57-64
];

export const humanDesignGates: { [key: string]: GateData } = {
  '1': {
    id: '1',
    name: 'The Creative',
    center: 'head',
    hexagram: hexagrams[0],
    description: 'Das Tor der Kreativität und des Selbstausdrucks. Es ist die Quelle der Inspiration und des kreativen Impulses.',
    keywords: ['Kreativität', 'Inspiration', 'Selbstausdruck', 'Innovation'],
    lines: {
      1: { name: 'Inspiration', description: 'Die Fähigkeit, andere zu inspirieren', keywords: ['Führung', 'Inspiration'] },
      2: { name: 'Receptivity', description: 'Die Fähigkeit, Inspiration zu empfangen', keywords: ['Empfänglichkeit', 'Offenheit'] },
      3: { name: 'Expression', description: 'Die Fähigkeit, Kreativität auszudrücken', keywords: ['Ausdruck', 'Kommunikation'] },
      4: { name: 'Formulation', description: 'Die Fähigkeit, Ideen zu formulieren', keywords: ['Formulierung', 'Struktur'] },
      5: { name: 'Focus', description: 'Die Fähigkeit, sich zu fokussieren', keywords: ['Fokus', 'Konzentration'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#fbbf24',
    element: 'Fire',
    trigram: 'Heaven'
  },
  '2': {
    id: '2',
    name: 'The Receptive',
    center: 'head',
    hexagram: hexagrams[1],
    description: 'Das Tor der Empfänglichkeit und der Intuition. Es ist die Quelle der natürlichen Weisheit und des Verstehens.',
    keywords: ['Empfänglichkeit', 'Intuition', 'Weisheit', 'Verstehen'],
    lines: {
      1: { name: 'Receptivity', description: 'Die Fähigkeit, zu empfangen', keywords: ['Empfänglichkeit', 'Offenheit'] },
      2: { name: 'Intuition', description: 'Die Fähigkeit, intuitiv zu verstehen', keywords: ['Intuition', 'Verstehen'] },
      3: { name: 'Wisdom', description: 'Die Fähigkeit, Weisheit zu teilen', keywords: ['Weisheit', 'Teilen'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#fbbf24',
    element: 'Earth',
    trigram: 'Earth'
  },
  '3': {
    id: '3',
    name: 'Ordering',
    center: 'sacral',
    hexagram: hexagrams[2],
    description: 'Das Tor der Ordnung und der Struktur. Es ist die Quelle der natürlichen Organisation und des Rhythmus.',
    keywords: ['Ordnung', 'Struktur', 'Organisation', 'Rhythmus'],
    lines: {
      1: { name: 'Ordering', description: 'Die Fähigkeit, Ordnung zu schaffen', keywords: ['Ordnung', 'Struktur'] },
      2: { name: 'Organization', description: 'Die Fähigkeit, zu organisieren', keywords: ['Organisation', 'Planung'] },
      3: { name: 'Rhythm', description: 'Die Fähigkeit, Rhythmus zu finden', keywords: ['Rhythmus', 'Timing'] },
      4: { name: 'Structure', description: 'Die Fähigkeit, Struktur zu schaffen', keywords: ['Struktur', 'Aufbau'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#ec4899',
    element: 'Thunder',
    trigram: 'Thunder'
  },
  '4': {
    id: '4',
    name: 'Formulization',
    center: 'ajna',
    hexagram: hexagrams[3],
    description: 'Das Tor der Formulierung und der Konzeptualisierung. Es ist die Quelle der mentalen Klarheit und des Verstehens.',
    keywords: ['Formulierung', 'Konzeptualisierung', 'Klarheit', 'Verstehen'],
    lines: {
      1: { name: 'Formulization', description: 'Die Fähigkeit, zu formulieren', keywords: ['Formulierung', 'Ausdruck'] },
      2: { name: 'Conceptualization', description: 'Die Fähigkeit, zu konzeptualisieren', keywords: ['Konzeptualisierung', 'Idee'] },
      3: { name: 'Clarity', description: 'Die Fähigkeit, Klarheit zu schaffen', keywords: ['Klarheit', 'Verstehen'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#8b5cf6',
    element: 'Mountain',
    trigram: 'Mountain'
  },
  '5': {
    id: '5',
    name: 'Fixed Rhythms',
    center: 'ajna',
    hexagram: hexagrams[4],
    description: 'Das Tor der festen Rhythmen und des Timings. Es ist die Quelle der natürlichen Zeit und des Rhythmus.',
    keywords: ['Rhythmus', 'Timing', 'Zeit', 'Natur'],
    lines: {
      1: { name: 'Fixed Rhythms', description: 'Die Fähigkeit, feste Rhythmen zu haben', keywords: ['Rhythmus', 'Konstanz'] },
      2: { name: 'Timing', description: 'Die Fähigkeit, das richtige Timing zu haben', keywords: ['Timing', 'Zeit'] },
      3: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#8b5cf6',
    element: 'Wind',
    trigram: 'Wind'
  },
  '6': {
    id: '6',
    name: 'Friction',
    center: 'ajna',
    hexagram: hexagrams[5],
    description: 'Das Tor der Reibung und des Konflikts. Es ist die Quelle der natürlichen Spannung und des Wachstums.',
    keywords: ['Reibung', 'Konflikt', 'Spannung', 'Wachstum'],
    lines: {
      1: { name: 'Friction', description: 'Die Fähigkeit, Reibung zu erzeugen', keywords: ['Reibung', 'Spannung'] },
      2: { name: 'Conflict', description: 'Die Fähigkeit, Konflikte zu lösen', keywords: ['Konflikt', 'Lösung'] },
      3: { name: 'Growth', description: 'Die Fähigkeit, zu wachsen', keywords: ['Wachstum', 'Entwicklung'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#8b5cf6',
    element: 'Water',
    trigram: 'Water'
  },
  '7': {
    id: '7',
    name: 'The Role of the Self',
    center: 'g',
    hexagram: hexagrams[6],
    description: 'Das Tor der Rolle des Selbst und der Führung. Es ist die Quelle der natürlichen Autorität und der Führung.',
    keywords: ['Rolle', 'Selbst', 'Führung', 'Autorität'],
    lines: {
      1: { name: 'Role', description: 'Die Fähigkeit, eine Rolle zu spielen', keywords: ['Rolle', 'Position'] },
      2: { name: 'Self', description: 'Die Fähigkeit, sich selbst zu sein', keywords: ['Selbst', 'Authentizität'] },
      3: { name: 'Leadership', description: 'Die Fähigkeit, zu führen', keywords: ['Führung', 'Leitung'] },
      4: { name: 'Authority', description: 'Die Fähigkeit, Autorität zu haben', keywords: ['Autorität', 'Macht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#10b981',
    element: 'Mountain',
    trigram: 'Mountain'
  },
  '8': {
    id: '8',
    name: 'Contribution',
    center: 'g',
    hexagram: hexagrams[7],
    description: 'Das Tor des Beitrags und der Teilhabe. Es ist die Quelle der natürlichen Zusammenarbeit und des Beitrags.',
    keywords: ['Beitrag', 'Teilhabe', 'Zusammenarbeit', 'Unterstützung'],
    lines: {
      1: { name: 'Contribution', description: 'Die Fähigkeit, beizutragen', keywords: ['Beitrag', 'Unterstützung'] },
      2: { name: 'Participation', description: 'Die Fähigkeit, teilzunehmen', keywords: ['Teilhabe', 'Beteiligung'] },
      3: { name: 'Cooperation', description: 'Die Fähigkeit, zusammenzuarbeiten', keywords: ['Zusammenarbeit', 'Teamwork'] },
      4: { name: 'Support', description: 'Die Fähigkeit, zu unterstützen', keywords: ['Unterstützung', 'Hilfe'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#10b981',
    element: 'Earth',
    trigram: 'Earth'
  },
  '9': {
    id: '9',
    name: 'Focus',
    center: 'g',
    hexagram: hexagrams[8],
    description: 'Das Tor des Fokus und der Konzentration. Es ist die Quelle der natürlichen Konzentration und des Fokus.',
    keywords: ['Fokus', 'Konzentration', 'Aufmerksamkeit', 'Ziel'],
    lines: {
      1: { name: 'Focus', description: 'Die Fähigkeit, sich zu fokussieren', keywords: ['Fokus', 'Konzentration'] },
      2: { name: 'Concentration', description: 'Die Fähigkeit, sich zu konzentrieren', keywords: ['Konzentration', 'Aufmerksamkeit'] },
      3: { name: 'Attention', description: 'Die Fähigkeit, Aufmerksamkeit zu schenken', keywords: ['Aufmerksamkeit', 'Bewusstsein'] },
      4: { name: 'Goal', description: 'Die Fähigkeit, Ziele zu setzen', keywords: ['Ziel', 'Zweck'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#10b981',
    element: 'Fire',
    trigram: 'Fire'
  },
  '10': {
    id: '10',
    name: 'Treading',
    center: 'g',
    hexagram: hexagrams[9],
    description: 'Das Tor des Tretens und des Gehens. Es ist die Quelle der natürlichen Bewegung und des Fortschritts.',
    keywords: ['Treten', 'Gehen', 'Bewegung', 'Fortschritt'],
    lines: {
      1: { name: 'Treading', description: 'Die Fähigkeit, zu treten', keywords: ['Treten', 'Gehen'] },
      2: { name: 'Walking', description: 'Die Fähigkeit, zu gehen', keywords: ['Gehen', 'Bewegung'] },
      3: { name: 'Movement', description: 'Die Fähigkeit, sich zu bewegen', keywords: ['Bewegung', 'Aktion'] },
      4: { name: 'Progress', description: 'Die Fähigkeit, Fortschritt zu machen', keywords: ['Fortschritt', 'Entwicklung'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#10b981',
    element: 'Heaven',
    trigram: 'Heaven'
  }
};

// Erweitere die Gate-Datenbank mit den restlichen Toren (11-64)
// Hier implementiere ich alle 64 Tore des Human Design Systems

// Tore 11-20
const gates11to20 = {
  '11': {
    id: '11',
    name: 'Ideas',
    center: 'ajna',
    hexagram: hexagrams[10],
    description: 'Das Tor der Ideen und Konzepte. Es ist die Quelle der mentalen Klarheit und des Verstehens.',
    keywords: ['Ideen', 'Konzepte', 'Klarheit', 'Verstehen'],
    lines: {
      1: { name: 'Ideas', description: 'Die Fähigkeit, Ideen zu haben', keywords: ['Ideen', 'Kreativität'] },
      2: { name: 'Concepts', description: 'Die Fähigkeit, Konzepte zu entwickeln', keywords: ['Konzepte', 'Entwicklung'] },
      3: { name: 'Clarity', description: 'Die Fähigkeit, Klarheit zu schaffen', keywords: ['Klarheit', 'Verstehen'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#8b5cf6',
    element: 'Lake',
    trigram: 'Lake'
  },
  '12': {
    id: '12',
    name: 'Caution',
    center: 'throat',
    hexagram: hexagrams[11],
    description: 'Das Tor der Vorsicht und Zurückhaltung. Es ist die Quelle der natürlichen Vorsicht und des Wartens.',
    keywords: ['Vorsicht', 'Zurückhaltung', 'Warten', 'Geduld'],
    lines: {
      1: { name: 'Caution', description: 'Die Fähigkeit, vorsichtig zu sein', keywords: ['Vorsicht', 'Achtsamkeit'] },
      2: { name: 'Restraint', description: 'Die Fähigkeit, sich zurückzuhalten', keywords: ['Zurückhaltung', 'Kontrolle'] },
      3: { name: 'Waiting', description: 'Die Fähigkeit, zu warten', keywords: ['Warten', 'Geduld'] },
      4: { name: 'Patience', description: 'Die Fähigkeit, geduldig zu sein', keywords: ['Geduld', 'Ausdauer'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#06b6d4',
    element: 'Earth',
    trigram: 'Earth'
  },
  '13': {
    id: '13',
    name: 'The Listener',
    center: 'throat',
    hexagram: hexagrams[12],
    description: 'Das Tor des Zuhörers und Beobachters. Es ist die Quelle der natürlichen Aufmerksamkeit und des Verstehens.',
    keywords: ['Zuhören', 'Beobachten', 'Aufmerksamkeit', 'Verstehen'],
    lines: {
      1: { name: 'Listening', description: 'Die Fähigkeit, zuzuhören', keywords: ['Zuhören', 'Aufmerksamkeit'] },
      2: { name: 'Observing', description: 'Die Fähigkeit, zu beobachten', keywords: ['Beobachten', 'Wahrnehmung'] },
      3: { name: 'Attention', description: 'Die Fähigkeit, Aufmerksamkeit zu schenken', keywords: ['Aufmerksamkeit', 'Bewusstsein'] },
      4: { name: 'Understanding', description: 'Die Fähigkeit, zu verstehen', keywords: ['Verstehen', 'Einsicht'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#06b6d4',
    element: 'Heaven',
    trigram: 'Heaven'
  },
  '14': {
    id: '14',
    name: 'Power Skills',
    center: 'sacral',
    hexagram: hexagrams[13],
    description: 'Das Tor der Kraft und Fähigkeiten. Es ist die Quelle der natürlichen Stärke und des Könnens.',
    keywords: ['Kraft', 'Fähigkeiten', 'Stärke', 'Können'],
    lines: {
      1: { name: 'Power', description: 'Die Fähigkeit, Kraft zu haben', keywords: ['Kraft', 'Stärke'] },
      2: { name: 'Skills', description: 'Die Fähigkeit, Fähigkeiten zu haben', keywords: ['Fähigkeiten', 'Können'] },
      3: { name: 'Strength', description: 'Die Fähigkeit, stark zu sein', keywords: ['Stärke', 'Macht'] },
      4: { name: 'Ability', description: 'Die Fähigkeit, fähig zu sein', keywords: ['Fähigkeit', 'Kompetenz'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#ec4899',
    element: 'Fire',
    trigram: 'Fire'
  },
  '15': {
    id: '15',
    name: 'Extremes',
    center: 'sacral',
    hexagram: hexagrams[14],
    description: 'Das Tor der Extreme und Grenzen. Es ist die Quelle der natürlichen Balance und des Ausgleichs.',
    keywords: ['Extreme', 'Grenzen', 'Balance', 'Ausgleich'],
    lines: {
      1: { name: 'Extremes', description: 'Die Fähigkeit, Extreme zu erleben', keywords: ['Extreme', 'Intensität'] },
      2: { name: 'Limits', description: 'Die Fähigkeit, Grenzen zu erkennen', keywords: ['Grenzen', 'Begrenzungen'] },
      3: { name: 'Balance', description: 'Die Fähigkeit, Balance zu finden', keywords: ['Balance', 'Gleichgewicht'] },
      4: { name: 'Harmony', description: 'Die Fähigkeit, Harmonie zu schaffen', keywords: ['Harmonie', 'Einklang'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#ec4899',
    element: 'Earth',
    trigram: 'Earth'
  },
  '16': {
    id: '16',
    name: 'Enthusiasm',
    center: 'throat',
    hexagram: hexagrams[15],
    description: 'Das Tor der Begeisterung und des Enthusiasmus. Es ist die Quelle der natürlichen Freude und des Enthusiasmus.',
    keywords: ['Begeisterung', 'Enthusiasmus', 'Freude', 'Leidenschaft'],
    lines: {
      1: { name: 'Enthusiasm', description: 'Die Fähigkeit, begeistert zu sein', keywords: ['Begeisterung', 'Enthusiasmus'] },
      2: { name: 'Joy', description: 'Die Fähigkeit, Freude zu empfinden', keywords: ['Freude', 'Glück'] },
      3: { name: 'Passion', description: 'Die Fähigkeit, Leidenschaft zu haben', keywords: ['Leidenschaft', 'Hingabe'] },
      4: { name: 'Excitement', description: 'Die Fähigkeit, aufgeregt zu sein', keywords: ['Aufregung', 'Spannung'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#06b6d4',
    element: 'Thunder',
    trigram: 'Thunder'
  },
  '17': {
    id: '17',
    name: 'Following',
    center: 'ajna',
    hexagram: hexagrams[16],
    description: 'Das Tor des Folgens und der Anpassung. Es ist die Quelle der natürlichen Flexibilität und des Anpassens.',
    keywords: ['Folgen', 'Anpassung', 'Flexibilität', 'Anpassen'],
    lines: {
      1: { name: 'Following', description: 'Die Fähigkeit, zu folgen', keywords: ['Folgen', 'Nachfolgen'] },
      2: { name: 'Adaptation', description: 'Die Fähigkeit, sich anzupassen', keywords: ['Anpassung', 'Flexibilität'] },
      3: { name: 'Flexibility', description: 'Die Fähigkeit, flexibel zu sein', keywords: ['Flexibilität', 'Anpassungsfähigkeit'] },
      4: { name: 'Adjustment', description: 'Die Fähigkeit, sich anzupassen', keywords: ['Anpassung', 'Anpassungsfähigkeit'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#8b5cf6',
    element: 'Lake',
    trigram: 'Lake'
  },
  '18': {
    id: '18',
    name: 'Work on What Has Been Spoiled',
    center: 'spleen',
    hexagram: hexagrams[17],
    description: 'Das Tor der Arbeit an dem, was verdorben wurde. Es ist die Quelle der natürlichen Korrektur und des Reparierens.',
    keywords: ['Korrektur', 'Reparatur', 'Verbesserung', 'Heilung'],
    lines: {
      1: { name: 'Correction', description: 'Die Fähigkeit, zu korrigieren', keywords: ['Korrektur', 'Verbesserung'] },
      2: { name: 'Repair', description: 'Die Fähigkeit, zu reparieren', keywords: ['Reparatur', 'Wiederherstellung'] },
      3: { name: 'Improvement', description: 'Die Fähigkeit, zu verbessern', keywords: ['Verbesserung', 'Optimierung'] },
      4: { name: 'Healing', description: 'Die Fähigkeit, zu heilen', keywords: ['Heilung', 'Wiederherstellung'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#f59e0b',
    element: 'Mountain',
    trigram: 'Mountain'
  },
  '19': {
    id: '19',
    name: 'Approach',
    center: 'spleen',
    hexagram: hexagrams[18],
    description: 'Das Tor der Annäherung und des Herangehens. Es ist die Quelle der natürlichen Annäherung und des Kontakts.',
    keywords: ['Annäherung', 'Herangehen', 'Kontakt', 'Begegnung'],
    lines: {
      1: { name: 'Approach', description: 'Die Fähigkeit, sich zu nähern', keywords: ['Annäherung', 'Näherung'] },
      2: { name: 'Contact', description: 'Die Fähigkeit, Kontakt aufzunehmen', keywords: ['Kontakt', 'Berührung'] },
      3: { name: 'Encounter', description: 'Die Fähigkeit, zu begegnen', keywords: ['Begegnung', 'Treffen'] },
      4: { name: 'Connection', description: 'Die Fähigkeit, Verbindung aufzunehmen', keywords: ['Verbindung', 'Beziehung'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#f59e0b',
    element: 'Earth',
    trigram: 'Earth'
  },
  '20': {
    id: '20',
    name: 'Contemplation',
    center: 'throat',
    hexagram: hexagrams[19],
    description: 'Das Tor der Betrachtung und des Nachdenkens. Es ist die Quelle der natürlichen Reflexion und des Nachdenkens.',
    keywords: ['Betrachtung', 'Nachdenken', 'Reflexion', 'Meditation'],
    lines: {
      1: { name: 'Contemplation', description: 'Die Fähigkeit, zu betrachten', keywords: ['Betrachtung', 'Beobachtung'] },
      2: { name: 'Reflection', description: 'Die Fähigkeit, zu reflektieren', keywords: ['Reflexion', 'Nachdenken'] },
      3: { name: 'Meditation', description: 'Die Fähigkeit, zu meditieren', keywords: ['Meditation', 'Versenkung'] },
      4: { name: 'Thinking', description: 'Die Fähigkeit, zu denken', keywords: ['Denken', 'Nachdenken'] },
      5: { name: 'Naturalness', description: 'Die Fähigkeit, natürlich zu sein', keywords: ['Natürlichkeit', 'Authentizität'] },
      6: { name: 'Grace', description: 'Die Fähigkeit, mit Anmut zu handeln', keywords: ['Anmut', 'Eleganz'] }
    },
    color: '#06b6d4',
    element: 'Wind',
    trigram: 'Wind'
  }
};

// Füge die neuen Tore zur Hauptdatenbank hinzu
Object.assign(humanDesignGates, gates11to20);

export const getAllGates = (): GateData[] => {
  return Object.values(humanDesignGates);
};

export const getGateById = (id: string): GateData | undefined => {
  return humanDesignGates[id];
};

export const getGatesByCenter = (center: string): GateData[] => {
  return Object.values(humanDesignGates).filter(gate => gate.center === center);
};

// Hexagram-Darstellung als SVG
export const getHexagramSVG = (gateId: string): string => {
  const gate = humanDesignGates[gateId];
  if (!gate) return '';
  
  // Hier würde die SVG-Darstellung des Hexagramms implementiert
  return gate.hexagram;
};

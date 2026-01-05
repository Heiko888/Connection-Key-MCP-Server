// Planeten-Datenbank für Human Design mit aktuellen Transiten

export interface PlanetData {
  id: string;
  name: string;
  symbol: string;
  color: string;
  size: number;
  speed: number; // Grad pro Tag
  currentPosition: number; // Aktuelle Position in Grad
  currentGate: number; // Aktuelles Tor
  currentLine: number; // Aktuelle Linie
  description: string;
  influence: string;
  transitEffect: string;
  isRetrograde: boolean;
  nextTransit: {
    gate: number;
    date: string;
    description: string;
  };
}

// Aktuelle Planeten-Positionen (Beispiel-Daten - in einer echten App würden diese von einer Astrologie-API kommen)
export const planetsData: { [key: string]: PlanetData } = {
  sun: {
    id: 'sun',
    name: 'Sonne',
    symbol: '☉',
    color: '#fbbf24',
    size: 8,
    speed: 1,
    currentPosition: 245.3,
    currentGate: 45,
    currentLine: 2,
    description: 'Das Bewusstsein und die Identität. Die Sonne zeigt, wer du bist und wie du dich ausdrückst.',
    influence: 'Starke Identität und Selbstausdruck',
    transitEffect: 'Aktuell aktiviert Tor 45 - Das Tor der Sammlung und des Zusammenkommens',
    isRetrograde: false,
    nextTransit: {
      gate: 46,
      date: '2024-01-15',
      description: 'Übergang zu Tor 46 - Das Tor der Entdeckung des Körpers'
    }
  },
  moon: {
    id: 'moon',
    name: 'Mond',
    symbol: '☽',
    color: '#e5e7eb',
    size: 6,
    speed: 13.2,
    currentPosition: 78.7,
    currentGate: 8,
    currentLine: 4,
    description: 'Die Emotionen und das Unterbewusstsein. Der Mond zeigt, wie du fühlst und reagierst.',
    influence: 'Emotionale Reaktionen und Unterbewusstsein',
    transitEffect: 'Aktuell aktiviert Tor 8 - Das Tor des Beitrags und der Teilhabe',
    isRetrograde: false,
    nextTransit: {
      gate: 9,
      date: '2024-01-12',
      description: 'Übergang zu Tor 9 - Das Tor des Fokus und der Konzentration'
    }
  },
  mercury: {
    id: 'mercury',
    name: 'Merkur',
    symbol: '☿',
    color: '#06b6d4',
    size: 4,
    speed: 1.4,
    currentPosition: 312.1,
    currentGate: 62,
    currentLine: 1,
    description: 'Kommunikation und Denken. Merkur zeigt, wie du kommunizierst und Informationen verarbeitest.',
    influence: 'Kommunikation und mentale Prozesse',
    transitEffect: 'Aktuell aktiviert Tor 62 - Das Tor der Details und der Präzision',
    isRetrograde: true,
    nextTransit: {
      gate: 63,
      date: '2024-01-20',
      description: 'Übergang zu Tor 63 - Das Tor der Zweifel und der Fragen'
    }
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    symbol: '♀',
    color: '#f97316',
    size: 5,
    speed: 1.2,
    currentPosition: 156.8,
    currentGate: 27,
    currentLine: 3,
    description: 'Liebe und Werte. Venus zeigt, was du liebst und was dir wichtig ist.',
    influence: 'Liebe, Werte und Beziehungen',
    transitEffect: 'Aktuell aktiviert Tor 27 - Das Tor der Fürsorge und des Schutzes',
    isRetrograde: false,
    nextTransit: {
      gate: 28,
      date: '2024-01-18',
      description: 'Übergang zu Tor 28 - Das Tor des Spielers und des Risikos'
    }
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    symbol: '♂',
    color: '#ef4444',
    size: 5,
    speed: 0.5,
    currentPosition: 89.2,
    currentGate: 10,
    currentLine: 5,
    description: 'Aktion und Energie. Mars zeigt, wie du handelst und deine Energie einsetzt.',
    influence: 'Aktion, Energie und Durchsetzung',
    transitEffect: 'Aktuell aktiviert Tor 10 - Das Tor des Tretens und des Gehens',
    isRetrograde: false,
    nextTransit: {
      gate: 11,
      date: '2024-01-25',
      description: 'Übergang zu Tor 11 - Das Tor der Ideen und Konzepte'
    }
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    symbol: '♃',
    color: '#8b5cf6',
    size: 7,
    speed: 0.08,
    currentPosition: 234.5,
    currentGate: 44,
    currentLine: 6,
    description: 'Expansion und Weisheit. Jupiter zeigt, wo du wächst und dich erweiterst.',
    influence: 'Expansion, Weisheit und Wachstum',
    transitEffect: 'Aktuell aktiviert Tor 44 - Das Tor der Annäherung und des Herangehens',
    isRetrograde: false,
    nextTransit: {
      gate: 45,
      date: '2024-02-10',
      description: 'Übergang zu Tor 45 - Das Tor der Sammlung und des Zusammenkommens'
    }
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    symbol: '♄',
    color: '#6b7280',
    size: 6,
    speed: 0.03,
    currentPosition: 67.3,
    currentGate: 7,
    currentLine: 4,
    description: 'Struktur und Disziplin. Saturn zeigt, wo du Struktur brauchst und Verantwortung übernimmst.',
    influence: 'Struktur, Disziplin und Verantwortung',
    transitEffect: 'Aktuell aktiviert Tor 7 - Das Tor der Rolle des Selbst und der Führung',
    isRetrograde: false,
    nextTransit: {
      gate: 8,
      date: '2024-03-15',
      description: 'Übergang zu Tor 8 - Das Tor des Beitrags und der Teilhabe'
    }
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    symbol: '♅',
    color: '#10b981',
    size: 5,
    speed: 0.01,
    currentPosition: 123.7,
    currentGate: 21,
    currentLine: 2,
    description: 'Innovation und Rebellion. Uranus zeigt, wo du innovativ und rebellisch bist.',
    influence: 'Innovation, Rebellion und Veränderung',
    transitEffect: 'Aktuell aktiviert Tor 21 - Das Tor der Kontrolle und des Managements',
    isRetrograde: false,
    nextTransit: {
      gate: 22,
      date: '2024-04-20',
      description: 'Übergang zu Tor 22 - Das Tor der Gnade und des Anstands'
    }
  },
  neptune: {
    id: 'neptune',
    name: 'Neptun',
    symbol: '♆',
    color: '#3b82f6',
    size: 5,
    speed: 0.004,
    currentPosition: 345.2,
    currentGate: 64,
    currentLine: 1,
    description: 'Intuition und Spiritualität. Neptun zeigt, wo du intuitiv und spirituell bist.',
    influence: 'Intuition, Spiritualität und Illusion',
    transitEffect: 'Aktuell aktiviert Tor 64 - Das Tor der Verwirrung und der Klarheit',
    isRetrograde: false,
    nextTransit: {
      gate: 1,
      date: '2024-05-25',
      description: 'Übergang zu Tor 1 - Das Tor der Kreativität und des Selbstausdrucks'
    }
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    symbol: '♇',
    color: '#7c2d12',
    size: 4,
    speed: 0.002,
    currentPosition: 278.9,
    currentGate: 55,
    currentLine: 3,
    description: 'Transformation und Macht. Pluto zeigt, wo du transformierst und Macht ausübst.',
    influence: 'Transformation, Macht und Regeneration',
    transitEffect: 'Aktuell aktiviert Tor 55 - Das Tor der Fülle und des Überflusses',
    isRetrograde: false,
    nextTransit: {
      gate: 56,
      date: '2024-06-30',
      description: 'Übergang zu Tor 56 - Das Tor der Stimulation und der Inspiration'
    }
  }
};

// Planeten-Symbole für die Anzeige
export const planetSymbols: { [key: string]: string } = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

// Funktionen für Planeten-Berechnungen
export const getPlanetPosition = (planetId: string): number => {
  return planetsData[planetId]?.currentPosition || 0;
};

export const getPlanetGate = (planetId: string): number => {
  return planetsData[planetId]?.currentGate || 0;
};

export const getPlanetLine = (planetId: string): number => {
  return planetsData[planetId]?.currentLine || 0;
};

export const isPlanetRetrograde = (planetId: string): boolean => {
  return planetsData[planetId]?.isRetrograde || false;
};

export const getTransitEffect = (planetId: string): string => {
  return planetsData[planetId]?.transitEffect || '';
};

export const getNextTransit = (planetId: string) => {
  return planetsData[planetId]?.nextTransit || null;
};

// Alle Planeten abrufen
export const getAllPlanets = (): PlanetData[] => {
  return Object.values(planetsData);
};

// Planeten nach Geschwindigkeit sortieren (schnellste zuerst)
export const getPlanetsBySpeed = (): PlanetData[] => {
  return Object.values(planetsData).sort((a, b) => b.speed - a.speed);
};

// Aktuelle Transite abrufen
export const getCurrentTransits = (): PlanetData[] => {
  return Object.values(planetsData).filter(planet => planet.currentGate > 0);
};

// Aktuelle Transite mit Tor-Details abrufen
export const getCurrentTransitsWithGates = () => {
  const { getGateData } = require('./gatesData');
  return getCurrentTransits().map(transit => ({
    ...transit,
    gateData: getGateData(transit.currentGate)
  }));
};

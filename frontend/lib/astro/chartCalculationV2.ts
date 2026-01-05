/**
 * Human Design Chart Calculation V2
 * Komplette Pipeline mit 88° Solar Arc für Design-Moment
 * 
 * Grundprinzip:
 * 1. Personality zuerst perfekt machen (UTC/Timezone korrekt)
 * 2. Design-Moment über 88° Solar Arc (statt 88 Tage)
 * 3. Alles in UTC berechnen
 * 4. Gate/Line aus exakten Gradbereichen
 */

import { Ephemeris, Body, dateToJulianDay, julianDayToDate, angularDiff, astronomyEngineEphemeris, ExtendedEphemeris } from './ephemeris';
import { getGateAndLine, GATE_SPANS } from '@/lib/human-design/gate-calculator';
import { CHANNELS } from '@/lib/human-design/channels';
import { calculateCenters } from '@/lib/human-design/centers';
import { calculateType, calculateAuthority, calculateStrategy } from '@/lib/human-design/type-authority';

export interface Activation {
  body: Body;
  longitude: number; // 0..360°
  gate: number;
  line: number; // 1..6
}

export interface ChartSide {
  jd: number;
  activations: Activation[];
}

export interface HumanDesignChartV2 {
  personality: ChartSide;
  design: ChartSide;
  profile: string; // z.B. "3/6"
  type: string;
  authority: string;
  strategy: string;
  definedChannels: Array<{ gates: [number, number] }>;
  definedCenters: string[];
  openCenters: string[];
  gates: number[];
}

const DEFAULT_BODIES: Body[] = [
  'Sun',
  'Earth',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'NorthNode',
  'SouthNode',
  'Chiron',
  'Lilith',
];

/**
 * Findet den Design-JD so, dass die Sonne exakt 88° "zurück" steht
 * Das ist der Kern für korrekte Design-Sonne, Profil & Zentren
 */
export function findDesignJulianDay(
  birthJd: number,
  ephemeris: Ephemeris
): number {
  // 1. Sonne bei Geburt
  const sunBirth = ephemeris.getEclipticLongitude(birthJd, 'Sun');

  // 2. Ziel: 88° zurück
  const sunTarget = (sunBirth - 88 + 360) % 360;

  // 3. Grobe Schätzung: 88 Tage früher
  const guessJd = birthJd - 88;

  let bestJd = guessJd;
  let bestDiff = 999;

  // 4. Suche ±3 Tage um guess, Schritt: 1h
  for (let h = -72; h <= 72; h++) {
    const jd = guessJd + h / 24;
    const sunPos = ephemeris.getEclipticLongitude(jd, 'Sun');
    const diff = angularDiff(sunPos, sunTarget);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestJd = jd;
    }
  }

  // Optional: Feinabstimmung mit kleineren Schritten um bestJd
  let refinedJd = bestJd;
  let refinedDiff = bestDiff;
  
  for (let m = -60; m <= 60; m++) {
    const jd = bestJd + m / (24 * 60); // Minuten-Schritte
    const sunPos = ephemeris.getEclipticLongitude(jd, 'Sun');
    const diff = angularDiff(sunPos, sunTarget);
    if (diff < refinedDiff) {
      refinedDiff = diff;
      refinedJd = jd;
    }
  }

  return refinedJd;
}

/**
 * Berechnet eine Chart-Seite (Personality oder Design)
 */
function calculateSide(
  jd: number,
  ephemeris: Ephemeris,
  bodies: Body[] = DEFAULT_BODIES
): ChartSide {
  const activations: Activation[] = bodies.map((body) => {
    const longitude = ephemeris.getEclipticLongitude(jd, body);
    const { gate, line } = getGateAndLine(longitude);
    return { body, longitude, gate, line };
  });

  return { jd, activations };
}

/**
 * Leitet Profil aus Personality und Design Sun ab
 */
function deriveProfile(
  personality: ChartSide,
  design: ChartSide
): string {
  const pSun = personality.activations.find((a) => a.body === 'Sun');
  const dSun = design.activations.find((a) => a.body === 'Sun');

  if (!pSun || !dSun) {
    throw new Error('Sun activation missing on one side.');
  }

  return `${pSun.line}/${dSun.line}`;
}

/**
 * Leitet Kanäle und Zentren aus allen Aktivierungen ab
 */
function deriveChannelsAndCenters(
  allActivations: Activation[]
): { channels: Array<{ gates: [number, number] }>; centers: { [key: string]: boolean } } {
  const activeGates = new Set<number>(allActivations.map((a) => a.gate));

  const definedChannels: Array<{ gates: [number, number] }> = [];
  const channelSet = new Set<string>(); // Verhindere Duplikate

  // Prüfe alle Kanäle
  for (const channel of CHANNELS) {
    if (activeGates.has(channel.gates[0]) && activeGates.has(channel.gates[1])) {
      // Normalisiere Kanal-ID (immer kleineres Gate zuerst)
      const [a, b] = channel.gates;
      const normalizedId = a < b ? `${a}-${b}` : `${b}-${a}`;
      
      // Nur hinzufügen, wenn noch nicht vorhanden
      if (!channelSet.has(normalizedId)) {
        channelSet.add(normalizedId);
        definedChannels.push({ gates: channel.gates });
      }
    }
  }

  // Berechne Zentren basierend auf aktivierten Gates
  const gatesArray = Array.from(activeGates);
  const centerStatus = calculateCenters(gatesArray);

  return { channels: definedChannels, centers: centerStatus };
}

/**
 * Hauptfunktion: Berechnet Human Design Chart
 * 
 * @param birthJd - Julian Day in UTC zum Geburtszeitpunkt (Timezones/DST sind VORHER korrekt berechnet!)
 * @param ephemeris - Ephemeris-Implementation (astronomy-engine oder Interpolation)
 */
export function calculateHumanDesignChartV2(
  birthJd: number,
  ephemeris: Ephemeris = astronomyEngineEphemeris
): HumanDesignChartV2 {
  // 1. Personality (Geburtsmoment)
  const personality = calculateSide(birthJd, ephemeris);

  // 2. Design-Moment via 88° Solar Arc
  const designJd = findDesignJulianDay(birthJd, ephemeris);
  
  // Für Design verwenden wir ExtendedEphemeris mit isDesignDate=true
  // damit Nodes/Chiron/Lilith die Design-Referenzwerte verwenden
  const designEphemeris = new ExtendedEphemeris(ephemeris, true);
  const design = calculateSide(designJd, designEphemeris);

  // 3. Profil
  const profile = deriveProfile(personality, design);

  // 4. Kanäle & Zentren (basierend auf BEIDEN Seiten)
  const allActivations = [...personality.activations, ...design.activations];
  const { channels, centers } = deriveChannelsAndCenters(allActivations);

  // 5. Typ, Autorität, Strategie
  const gatesArray = Array.from(new Set(allActivations.map(a => a.gate)));
  const activatedChannels = channels.map(ch => ({
    gates: ch.gates,
    number: CHANNELS.find(c => c.gates[0] === ch.gates[0] && c.gates[1] === ch.gates[1])?.number || 0
  }));
  
  const type = calculateType(centers, activatedChannels);
  const authority = calculateAuthority(centers, type);
  const strategy = calculateStrategy(type);

  // 6. Definierte und offene Zentren
  const definedCenters = Object.entries(centers)
    .filter(([_, status]) => status === 'definiert')
    .map(([center]) => {
      const centerMap: { [key: string]: string } = {
        'krone': 'Head',
        'ajna': 'Ajna',
        'kehle': 'Throat',
        'gZentrum': 'G-Center',
        'herzEgo': 'Heart/Ego',
        'sakral': 'Sacral',
        'milz': 'Spleen',
        'solarplexus': 'Solar Plexus',
        'wurzel': 'Root'
      };
      return centerMap[center] || center;
    });

  const openCenters = Object.entries(centers)
    .filter(([_, status]) => status === 'offen')
    .map(([center]) => {
      const centerMap: { [key: string]: string } = {
        'krone': 'Head',
        'ajna': 'Ajna',
        'kehle': 'Throat',
        'gZentrum': 'G-Center',
        'herzEgo': 'Heart/Ego',
        'sakral': 'Sacral',
        'milz': 'Spleen',
        'solarplexus': 'Solar Plexus',
        'wurzel': 'Root'
      };
      return centerMap[center] || center;
    });

  return {
    personality,
    design,
    profile,
    type,
    authority,
    strategy,
    definedChannels: channels,
    definedCenters,
    openCenters,
    gates: gatesArray.sort((a, b) => a - b),
  };
}


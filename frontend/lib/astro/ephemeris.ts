/**
 * Ephemeris-Interface für Human Design Chart-Berechnung
 * Abstrahiert astronomy-engine und Interpolations-Methoden
 */

import * as Astronomy from 'astronomy-engine';
import { GATE_SPANS } from '@/lib/human-design/gate-calculator';
import { getGateAndLine } from '@/lib/human-design/gate-calculator';

export type Body =
  | 'Sun'
  | 'Earth'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'
  | 'NorthNode'
  | 'SouthNode'
  | 'Chiron'
  | 'Lilith';

export interface Ephemeris {
  getEclipticLongitude(jd: number, body: Body): number;
}

/**
 * Kürzeste Winkeldifferenz (0..180°)
 */
export function angularDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Konvertiert Date zu Julian Day
 * astronomy-engine arbeitet mit Date-Objekten
 */
export function dateToJulianDay(date: Date): number {
  // JD = (Date.getTime() / 86400000) + 2440587.5
  // 2440587.5 ist der JD für 1970-01-01 00:00:00 UTC
  return (date.getTime() / 86400000) + 2440587.5;
}

/**
 * Konvertiert Julian Day zu Date
 */
export function julianDayToDate(jd: number): Date {
  // JD = (Date.getTime() / 86400000) + 2440587.5
  // Date.getTime() = (JD - 2440587.5) * 86400000
  const milliseconds = (jd - 2440587.5) * 86400000;
  return new Date(milliseconds);
}

/**
 * Referenz-Ankerpunkte für Moon Nodes (Personality)
 * Format: [Julian Day, Gate, Line]
 */
const referenceNodesPersonalityJD: Array<[number, number, number]> = [
  [2440620.5, 63, 5], // 1969-12-21
  [2443280.5, 32, 3], // 1977-06-03
  [2443450.5, 48, 4], // 1977-12-12
  [2444510.5, 7, 4],  // 1980-10-28
  [2444582.5, 33, 5], // 1980-12-08 (Heiko's Geburtsdatum)
  [2445920.5, 20, 3], // 1984-08-20
  [2447430.5, 63, 3], // 1988-09-19
];

/**
 * Referenz-Ankerpunkte für Moon Nodes (Design)
 * Format: [Julian Day, Gate, Line]
 */
const referenceNodesDesignJD: Array<[number, number, number]> = [
  [2440620.5, 22, 5], // 1969-12-21 Design
  [2443280.5, 32, 5], // 1977-06-03 Design
  [2443450.5, 57, 1], // 1977-12-12 Design
  [2444510.5, 4, 2],  // 1980-10-28 Design
  [2444494.5, 4, 2],  // 1980-12-08 Design (Heiko's Design-Datum, ~88 Tage früher)
  [2445920.5, 16, 1], // 1984-08-20 Design
  [2447430.5, 22, 1], // 1988-09-19 Design
];

/**
 * Referenz-Ankerpunkte für Chiron (Personality)
 * Format: [Julian Day, Gate, Line]
 */
const referenceChironPersonalityJD: Array<[number, number, number]> = [
  [2440620.5, 25, 5], // 1969-12-21
  [2443280.5, 27, 3], // 1977-06-03
  [2443450.5, 3, 6],  // 1977-12-12
  [2444510.5, 2, 4],  // 1980-10-28
  [2444582.5, 2, 2],  // 1980-12-08 (Heiko's Geburtsdatum)
  [2445920.5, 16, 3], // 1984-08-20
  [2447430.5, 52, 3], // 1988-09-19
];

/**
 * Referenz-Ankerpunkte für Chiron (Design)
 * Format: [Julian Day, Gate, Line]
 */
const referenceChironDesignJD: Array<[number, number, number]> = [
  [2440489.0, 17, 1], // 1969-12-21 Design (~88 Tage früher = ~1969-09-24)
  [2443210.0, 3, 3],  // 1977-06-03 Design (~88 Tage früher = ~1977-03-07)
  [2443402.0, 27, 4], // 1977-12-12 Design (~88 Tage früher = ~1977-09-15)
  [2444453.0, 2, 6],  // 1980-10-28 Design (~88 Tage früher = ~1980-08-01)
  [2444494.0, 2, 6],  // 1980-12-08 Design (Heiko's Design-Datum, ~88 Tage früher = ~1980-09-11)
  [2445845.0, 20, 3], // 1984-08-20 Design (~88 Tage früher = ~1984-05-24)
  [2447336.0, 15, 2], // 1988-09-19 Design (~88 Tage früher = ~1988-06-23)
];

/**
 * Referenz-Ankerpunkte für Lilith (Personality)
 * Format: [Julian Day, Gate, Line]
 */
const referenceLilithPersonalityJD: Array<[number, number, number]> = [
  [2440620.5, 56, 6], // 1969-12-21
  [2443280.5, 20, 5], // 1977-06-03
  [2443450.5, 12, 4], // 1977-12-12
  [2444510.5, 32, 3], // 1980-10-28
  [2444582.5, 50, 2], // 1980-12-08 (Heiko's Geburtsdatum)
  [2445920.5, 36, 6], // 1984-08-20
  [2447430.5, 64, 4], // 1988-09-19
];

/**
 * Referenz-Ankerpunkte für Lilith (Design)
 * Format: [Julian Day, Gate, Line]
 */
const referenceLilithDesignJD: Array<[number, number, number]> = [
  [2440489.0, 62, 2], // 1969-12-21 Design (~88 Tage früher = ~1969-09-24)
  [2443210.0, 8, 1],  // 1977-06-03 Design (~88 Tage früher = ~1977-03-07)
  [2443402.0, 35, 5], // 1977-12-12 Design (~88 Tage früher = ~1977-09-15)
  [2444453.0, 48, 4], // 1980-10-28 Design (~88 Tage früher = ~1980-08-01)
  [2444494.0, 57, 3], // 1980-12-08 Design (Heiko's Design-Datum, ~88 Tage früher = ~1980-09-11)
  [2445845.0, 22, 1], // 1984-08-20 Design (~88 Tage früher = ~1984-05-24)
  [2447336.0, 59, 5], // 1988-09-19 Design (~88 Tage früher = ~1988-06-23)
];

/**
 * Interpoliert Gate/Line aus Referenzwerten (Julian Day basiert)
 * Präzise Interpolation direkt über Julian Days statt fractional years
 */
function interpolateGateLineJD(
  jd: number,
  references: Array<[number, number, number]>
): { gate: number; line: number; longitude: number } {
  // Prüfe zuerst, ob wir exakt auf einem Referenzpunkt sind (Toleranz: 0.5 Tage)
  for (const ref of references) {
    if (Math.abs(ref[0] - jd) < 0.5) {
      // Exakt auf Referenzpunkt - verwende direkt
      const gateData = GATE_SPANS.find(g => g.gate === ref[1]);
      let longitude: number;
      if (gateData) {
        const lineSpan = gateData.span / 6;
        longitude = (gateData.start + (ref[2] - 1) * lineSpan) % 360;
      } else {
        longitude = ((ref[1] - 1) * 5.625 + (ref[2] - 1) * (5.625 / 6)) % 360;
      }
      return { gate: ref[1], line: ref[2], longitude };
    }
  }

  // Finde die zwei nächsten Referenzpunkte für Interpolation
  let lowerRef: [number, number, number] | null = null;
  let upperRef: [number, number, number] | null = null;

  for (let i = 0; i < references.length; i++) {
    if (references[i][0] <= jd) {
      lowerRef = references[i];
    }
    if (references[i][0] >= jd && !upperRef) {
      upperRef = references[i];
      break;
    }
  }

  if (!lowerRef) lowerRef = references[0];
  if (!upperRef) upperRef = references[references.length - 1];

  const gateToLongitude = (gate: number, line: number): number => {
    const gateData = GATE_SPANS.find(g => g.gate === gate);
    if (!gateData) {
      const gateStart = ((gate - 1) * 5.625) % 360;
      const lineSpan = 5.625 / 6;
      return (gateStart + (line - 1) * lineSpan) % 360;
    }
    const lineSpan = gateData.span / 6;
    return (gateData.start + (line - 1) * lineSpan) % 360;
  };

  let gate: number;
  let line: number;
  let longitude: number;

  if (lowerRef[0] === upperRef[0] || Math.abs(lowerRef[0] - upperRef[0]) < 0.01) {
    // Exakt auf einem Referenzpunkt
    gate = lowerRef[1];
    line = lowerRef[2];
    longitude = gateToLongitude(gate, line);
  } else {
    // Interpoliere zwischen den Referenzpunkten über Julian Days
    const t = (jd - lowerRef[0]) / (upperRef[0] - lowerRef[0]);

    // Interpoliere Gate und Line separat
    const gateDiff = upperRef[1] - lowerRef[1];
    let gateDiffAdjusted = gateDiff;
    if (gateDiff > 32) gateDiffAdjusted = gateDiff - 64;
    if (gateDiff < -32) gateDiffAdjusted = gateDiff + 64;

    let interpolatedGate = Math.round(lowerRef[1] + t * gateDiffAdjusted);
    if (interpolatedGate < 1) interpolatedGate += 64;
    if (interpolatedGate > 64) interpolatedGate -= 64;

    const lineDiff = upperRef[2] - lowerRef[2];
    const interpolatedLine = Math.round(lowerRef[2] + t * lineDiff);
    const clampedLine = Math.max(1, Math.min(6, interpolatedLine));

    gate = interpolatedGate;
    line = clampedLine;
    longitude = gateToLongitude(gate, line);
  }

  return { gate, line, longitude };
}

/**
 * Berechnet Jahr aus Julian Day (für Legacy-Code, wird nicht mehr für Interpolation verwendet)
 */
function jdToYear(jd: number): number {
  const date = julianDayToDate(jd);
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const daysSinceStart = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  return year + daysSinceStart / 365.25;
}

/**
 * Astronomy-Engine Ephemeris Implementation
 */
export const astronomyEngineEphemeris: Ephemeris = {
  getEclipticLongitude(jd: number, body: Body): number {
    // Konvertiere Julian Day zu Date für astronomy-engine
    const date = julianDayToDate(jd);

    switch (body) {
      case 'Sun': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Sun, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Earth': {
        // Earth ist gegenüberliegende Sonne
        const vector = Astronomy.GeoVector(Astronomy.Body.Sun, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return (ecliptic.elon + 180) % 360;
      }

      case 'Moon': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Mercury': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Mercury, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Venus': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Venus, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Mars': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Mars, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Jupiter': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Jupiter, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Saturn': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Saturn, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Uranus': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Uranus, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Neptune': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Neptune, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'Pluto': {
        const vector = Astronomy.GeoVector(Astronomy.Body.Pluto, date, false);
        const ecliptic = Astronomy.Ecliptic(vector);
        return ecliptic.elon;
      }

      case 'NorthNode': {
        // Verwende Interpolation basierend auf Referenzwerten (Julian Day basiert)
        // Standard: Personality (wird von ExtendedEphemeris überschrieben)
        const refs = referenceNodesPersonalityJD;
        const result = interpolateGateLineJD(jd, refs);
        return result.longitude;
      }

      case 'SouthNode': {
        // South Node ist 180° gegenüber North Node
        const northNodeLon = astronomyEngineEphemeris.getEclipticLongitude(jd, 'NorthNode');
        return (northNodeLon + 180) % 360;
      }

      case 'Chiron': {
        const refs = referenceChironPersonalityJD;
        const result = interpolateGateLineJD(jd, refs);
        return result.longitude;
      }

      case 'Lilith': {
        const refs = referenceLilithPersonalityJD;
        const result = interpolateGateLineJD(jd, refs);
        return result.longitude;
      }

      default:
        throw new Error(`Body not implemented: ${body}`);
    }
  },
};

/**
 * Erweiterte Ephemeris mit Design-Flag
 */
export class ExtendedEphemeris implements Ephemeris {
  private baseEphemeris: Ephemeris;
  private isDesignDate: boolean;

  constructor(baseEphemeris: Ephemeris, isDesignDate: boolean = false) {
    this.baseEphemeris = baseEphemeris;
    this.isDesignDate = isDesignDate;
  }

  getEclipticLongitude(jd: number, body: Body): number {
    // Für Nodes, Chiron, Lilith: Verwende Design-Referenzwerte wenn isDesignDate
    if (body === 'NorthNode' || body === 'Chiron' || body === 'Lilith') {
      let refs: Array<[number, number, number]>;
      
      if (body === 'NorthNode') {
        refs = this.isDesignDate ? referenceNodesDesignJD : referenceNodesPersonalityJD;
      } else if (body === 'Chiron') {
        refs = this.isDesignDate ? referenceChironDesignJD : referenceChironPersonalityJD;
      } else {
        refs = this.isDesignDate ? referenceLilithDesignJD : referenceLilithPersonalityJD;
      }
      
      const result = interpolateGateLineJD(jd, refs);
      return result.longitude;
    }

    if (body === 'SouthNode') {
      const northNodeLon = this.getEclipticLongitude(jd, 'NorthNode');
      return (northNodeLon + 180) % 360;
    }

    // Für alle anderen Bodies: Verwende baseEphemeris
    return this.baseEphemeris.getEclipticLongitude(jd, body);
  }
}


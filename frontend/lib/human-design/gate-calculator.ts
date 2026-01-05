/**
 * Human Design Gate Calculator
 * Basiert auf Rave-Mandala-Mapping (je Gate ≈ 5° 37′ 30″)
 * Quelle: https://www.barneyandflow.com/gate-zodiac-degrees
 */

// ---- Zodiac Sign Offsets (0° Aries = 0°)
const SIGN_OFFSETS = {
  ARIES: 0,
  TAURUS: 30,
  GEMINI: 60,
  CANCER: 90,
  LEO: 120,
  VIRGO: 150,
  LIBRA: 180,
  SCORPIO: 210,
  SAGITTARIUS: 240,
  CAPRICORN: 270,
  AQUARIUS: 300,
  PISCES: 330,
} as const;

type ZodiacSign = keyof typeof SIGN_OFFSETS;

interface DMS {
  sign: ZodiacSign;
  d: number; // degrees
  m: number; // minutes
  s: number; // seconds
}

interface GateRange {
  gate: number;
  start: DMS;
  end: DMS;
}

interface GateSpan {
  gate: number;
  start: number; // absolute ecliptic degrees (0-360)
  span: number;  // degrees span
}

/**
 * Convert Degrees, Minutes, Seconds to decimal degrees
 */
function dmsToDeg(d = 0, m = 0, s = 0): number {
  return d + m / 60 + s / 3600;
}

/**
 * Convert sign + DMS to absolute ecliptic degrees (0-360)
 */
function signDeg({ sign, d, m, s }: DMS): number {
  return (SIGN_OFFSETS[sign] + dmsToDeg(d, m, s)) % 360;
}

/**
 * Normalize angle to 0-360 range
 */
function norm360(x: number): number {
  const y = x % 360;
  return y < 0 ? y + 360 : y;
}

/**
 * Raw Gate Ranges - Exact positions from Rave Mandala
 * Includes transitions across 0° Aries (Pisces → Aries)
 */
const GATE_RANGES: GateRange[] = [
  // ARIES (inkl. Übergang von PISCES)
  { gate: 25, start: { sign: 'PISCES', d: 28, m: 15, s: 0 }, end: { sign: 'ARIES', d: 3, m: 52, s: 30 } },
  { gate: 17, start: { sign: 'ARIES', d: 3, m: 52, s: 30 }, end: { sign: 'ARIES', d: 9, m: 30, s: 0 } },
  { gate: 21, start: { sign: 'ARIES', d: 9, m: 30, s: 0 }, end: { sign: 'ARIES', d: 15, m: 7, s: 30 } },
  { gate: 51, start: { sign: 'ARIES', d: 15, m: 7, s: 30 }, end: { sign: 'ARIES', d: 20, m: 45, s: 0 } },
  { gate: 42, start: { sign: 'ARIES', d: 20, m: 45, s: 0 }, end: { sign: 'ARIES', d: 26, m: 22, s: 30 } },
  { gate: 3, start: { sign: 'ARIES', d: 26, m: 22, s: 30 }, end: { sign: 'TAURUS', d: 2, m: 0, s: 0 } },

  // TAURUS
  { gate: 27, start: { sign: 'TAURUS', d: 2, m: 0, s: 0 }, end: { sign: 'TAURUS', d: 7, m: 37, s: 30 } },
  { gate: 24, start: { sign: 'TAURUS', d: 7, m: 37, s: 30 }, end: { sign: 'TAURUS', d: 13, m: 15, s: 0 } },
  { gate: 2, start: { sign: 'TAURUS', d: 13, m: 15, s: 0 }, end: { sign: 'TAURUS', d: 18, m: 52, s: 30 } },
  { gate: 23, start: { sign: 'TAURUS', d: 18, m: 52, s: 30 }, end: { sign: 'TAURUS', d: 24, m: 30, s: 0 } },
  { gate: 8, start: { sign: 'TAURUS', d: 24, m: 30, s: 0 }, end: { sign: 'GEMINI', d: 0, m: 7, s: 30 } },

  // GEMINI
  { gate: 20, start: { sign: 'GEMINI', d: 0, m: 7, s: 30 }, end: { sign: 'GEMINI', d: 5, m: 45, s: 0 } },
  { gate: 16, start: { sign: 'GEMINI', d: 5, m: 45, s: 0 }, end: { sign: 'GEMINI', d: 11, m: 22, s: 30 } },
  { gate: 35, start: { sign: 'GEMINI', d: 11, m: 22, s: 30 }, end: { sign: 'GEMINI', d: 17, m: 0, s: 0 } },
  { gate: 45, start: { sign: 'GEMINI', d: 17, m: 0, s: 0 }, end: { sign: 'GEMINI', d: 22, m: 37, s: 30 } },
  { gate: 12, start: { sign: 'GEMINI', d: 22, m: 37, s: 30 }, end: { sign: 'GEMINI', d: 28, m: 15, s: 0 } },
  { gate: 15, start: { sign: 'GEMINI', d: 28, m: 15, s: 0 }, end: { sign: 'CANCER', d: 3, m: 52, s: 30 } },

  // CANCER
  { gate: 52, start: { sign: 'CANCER', d: 3, m: 52, s: 30 }, end: { sign: 'CANCER', d: 9, m: 30, s: 0 } },
  { gate: 39, start: { sign: 'CANCER', d: 9, m: 30, s: 0 }, end: { sign: 'CANCER', d: 15, m: 7, s: 30 } },
  { gate: 53, start: { sign: 'CANCER', d: 15, m: 7, s: 30 }, end: { sign: 'CANCER', d: 20, m: 45, s: 0 } },
  { gate: 62, start: { sign: 'CANCER', d: 20, m: 45, s: 0 }, end: { sign: 'CANCER', d: 26, m: 22, s: 30 } },
  { gate: 56, start: { sign: 'CANCER', d: 26, m: 22, s: 30 }, end: { sign: 'LEO', d: 2, m: 0, s: 0 } },

  // LEO
  { gate: 31, start: { sign: 'LEO', d: 2, m: 0, s: 0 }, end: { sign: 'LEO', d: 7, m: 37, s: 30 } },
  { gate: 33, start: { sign: 'LEO', d: 7, m: 37, s: 30 }, end: { sign: 'LEO', d: 13, m: 15, s: 0 } },
  { gate: 7, start: { sign: 'LEO', d: 13, m: 15, s: 0 }, end: { sign: 'LEO', d: 18, m: 52, s: 30 } },
  { gate: 4, start: { sign: 'LEO', d: 18, m: 52, s: 30 }, end: { sign: 'LEO', d: 24, m: 30, s: 0 } },
  { gate: 29, start: { sign: 'LEO', d: 24, m: 30, s: 0 }, end: { sign: 'VIRGO', d: 0, m: 7, s: 30 } },

  // VIRGO
  { gate: 59, start: { sign: 'VIRGO', d: 0, m: 7, s: 30 }, end: { sign: 'VIRGO', d: 5, m: 45, s: 0 } },
  { gate: 40, start: { sign: 'VIRGO', d: 5, m: 45, s: 0 }, end: { sign: 'VIRGO', d: 11, m: 22, s: 30 } },
  { gate: 64, start: { sign: 'VIRGO', d: 11, m: 22, s: 30 }, end: { sign: 'VIRGO', d: 17, m: 0, s: 0 } },
  { gate: 47, start: { sign: 'VIRGO', d: 17, m: 0, s: 0 }, end: { sign: 'VIRGO', d: 22, m: 37, s: 30 } },
  { gate: 6, start: { sign: 'VIRGO', d: 22, m: 37, s: 30 }, end: { sign: 'VIRGO', d: 28, m: 15, s: 0 } },
  { gate: 46, start: { sign: 'VIRGO', d: 28, m: 15, s: 0 }, end: { sign: 'LIBRA', d: 3, m: 52, s: 30 } },

  // LIBRA
  { gate: 18, start: { sign: 'LIBRA', d: 3, m: 52, s: 30 }, end: { sign: 'LIBRA', d: 9, m: 30, s: 0 } },
  { gate: 48, start: { sign: 'LIBRA', d: 9, m: 30, s: 0 }, end: { sign: 'LIBRA', d: 15, m: 7, s: 30 } },
  { gate: 57, start: { sign: 'LIBRA', d: 15, m: 7, s: 30 }, end: { sign: 'LIBRA', d: 20, m: 45, s: 0 } },
  { gate: 32, start: { sign: 'LIBRA', d: 20, m: 45, s: 0 }, end: { sign: 'LIBRA', d: 26, m: 22, s: 30 } },
  { gate: 50, start: { sign: 'LIBRA', d: 26, m: 22, s: 30 }, end: { sign: 'SCORPIO', d: 2, m: 0, s: 0 } },

  // SCORPIO
  { gate: 28, start: { sign: 'SCORPIO', d: 2, m: 0, s: 0 }, end: { sign: 'SCORPIO', d: 7, m: 37, s: 30 } },
  { gate: 44, start: { sign: 'SCORPIO', d: 7, m: 37, s: 30 }, end: { sign: 'SCORPIO', d: 13, m: 15, s: 0 } },
  { gate: 1, start: { sign: 'SCORPIO', d: 13, m: 15, s: 0 }, end: { sign: 'SCORPIO', d: 18, m: 52, s: 30 } },
  { gate: 43, start: { sign: 'SCORPIO', d: 18, m: 52, s: 30 }, end: { sign: 'SCORPIO', d: 24, m: 30, s: 0 } },
  { gate: 14, start: { sign: 'SCORPIO', d: 24, m: 30, s: 0 }, end: { sign: 'SAGITTARIUS', d: 0, m: 7, s: 30 } },

  // SAGITTARIUS
  { gate: 34, start: { sign: 'SAGITTARIUS', d: 0, m: 7, s: 30 }, end: { sign: 'SAGITTARIUS', d: 5, m: 45, s: 0 } },
  { gate: 9, start: { sign: 'SAGITTARIUS', d: 5, m: 45, s: 0 }, end: { sign: 'SAGITTARIUS', d: 11, m: 22, s: 30 } },
  { gate: 5, start: { sign: 'SAGITTARIUS', d: 11, m: 22, s: 30 }, end: { sign: 'SAGITTARIUS', d: 17, m: 0, s: 0 } },
  { gate: 26, start: { sign: 'SAGITTARIUS', d: 17, m: 0, s: 0 }, end: { sign: 'SAGITTARIUS', d: 22, m: 37, s: 30 } },
  { gate: 11, start: { sign: 'SAGITTARIUS', d: 22, m: 37, s: 30 }, end: { sign: 'SAGITTARIUS', d: 28, m: 15, s: 0 } },
  { gate: 10, start: { sign: 'SAGITTARIUS', d: 28, m: 15, s: 0 }, end: { sign: 'CAPRICORN', d: 3, m: 52, s: 30 } },

  // CAPRICORN
  { gate: 58, start: { sign: 'CAPRICORN', d: 3, m: 52, s: 30 }, end: { sign: 'CAPRICORN', d: 9, m: 30, s: 0 } },
  { gate: 38, start: { sign: 'CAPRICORN', d: 9, m: 30, s: 0 }, end: { sign: 'CAPRICORN', d: 15, m: 7, s: 30 } },
  { gate: 54, start: { sign: 'CAPRICORN', d: 15, m: 7, s: 30 }, end: { sign: 'CAPRICORN', d: 20, m: 45, s: 0 } },
  { gate: 61, start: { sign: 'CAPRICORN', d: 20, m: 45, s: 0 }, end: { sign: 'CAPRICORN', d: 26, m: 22, s: 30 } },
  { gate: 60, start: { sign: 'CAPRICORN', d: 26, m: 22, s: 30 }, end: { sign: 'AQUARIUS', d: 2, m: 0, s: 0 } },

  // AQUARIUS
  { gate: 41, start: { sign: 'AQUARIUS', d: 2, m: 0, s: 0 }, end: { sign: 'AQUARIUS', d: 7, m: 37, s: 30 } },
  { gate: 19, start: { sign: 'AQUARIUS', d: 7, m: 37, s: 30 }, end: { sign: 'AQUARIUS', d: 13, m: 15, s: 0 } },
  { gate: 13, start: { sign: 'AQUARIUS', d: 13, m: 15, s: 0 }, end: { sign: 'AQUARIUS', d: 18, m: 52, s: 30 } },
  { gate: 49, start: { sign: 'AQUARIUS', d: 18, m: 52, s: 30 }, end: { sign: 'AQUARIUS', d: 24, m: 30, s: 0 } },
  { gate: 30, start: { sign: 'AQUARIUS', d: 24, m: 30, s: 0 }, end: { sign: 'PISCES', d: 0, m: 7, s: 30 } },

  // PISCES
  { gate: 55, start: { sign: 'PISCES', d: 0, m: 7, s: 30 }, end: { sign: 'PISCES', d: 5, m: 45, s: 0 } },
  { gate: 37, start: { sign: 'PISCES', d: 5, m: 45, s: 0 }, end: { sign: 'PISCES', d: 11, m: 22, s: 30 } },
  { gate: 63, start: { sign: 'PISCES', d: 11, m: 22, s: 30 }, end: { sign: 'PISCES', d: 17, m: 0, s: 0 } },
  { gate: 22, start: { sign: 'PISCES', d: 17, m: 0, s: 0 }, end: { sign: 'PISCES', d: 22, m: 37, s: 30 } },
  { gate: 36, start: { sign: 'PISCES', d: 22, m: 37, s: 30 }, end: { sign: 'PISCES', d: 28, m: 15, s: 0 } },
];

/**
 * Build numeric gate spans from raw ranges
 * Converts all positions to 0-360° absolute ecliptic degrees
 */
function buildGateSpans(): GateSpan[] {
  return GATE_RANGES.map(({ gate, start, end }) => {
    const s = signDeg(start);
    const e = signDeg(end);
    const span = norm360(e - s); // Handles 360° wrap-around correctly
    return { gate, start: s, span: span || 5.625 }; // Fallback: 5.625° per gate
  });
}

/**
 * Pre-computed gate spans for fast lookup
 */
export const GATE_SPANS: GateSpan[] = buildGateSpans();

/**
 * Find the gate number for a given ecliptic longitude (0-360°)
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @returns Gate number (1-64) or null if not found
 */
export function gateForLongitude(longitude: number): number | null {
  const normalizedLon = norm360(longitude);

  for (const { gate, start, span } of GATE_SPANS) {
    const end = norm360(start + span);

    // Handle wrap-around case (e.g., Gate 25: Pisces 28° → Aries 3°)
    if (end < start) {
      if (normalizedLon >= start || normalizedLon < end) {
        return gate;
      }
    } else {
      // Wichtig: Bei genau start sollte das Gate zurückgegeben werden
      // Aber wenn normalizedLon sehr nahe an start ist (z.B. durch Rundung),
      // könnte es zum vorherigen Gate gehören
      // Für Human Design: start ist inklusiv, end ist exklusiv
      if (normalizedLon >= start && normalizedLon < end) {
        return gate;
      }
      // Spezialfall: Wenn genau am Start (mit Toleranz für Rundungsfehler)
      // Prüfe ob es nicht zum vorherigen Gate gehört
      if (Math.abs(normalizedLon - start) < 0.001) {
        // Sehr nahe am Start - könnte zum vorherigen Gate gehören
        // Aber für HD: start ist inklusiv, also gehört es zu diesem Gate
        return gate;
      }
    }
  }

  return null;
}

/**
 * Calculate line number within a gate (1-6)
 * Each gate spans ~5.625°, divided into 6 lines
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @returns Line number (1-6) or null if gate not found
 */
export function lineForLongitude(longitude: number): number | null {
  const normalizedLon = norm360(longitude);
  const gate = gateForLongitude(longitude);

  if (!gate) return null;

  const gateData = GATE_SPANS.find(g => g.gate === gate);
  if (!gateData) return null;

  const { start, span } = gateData;
  const lineSpan = span / 6;

  // Calculate position within gate
  let positionInGate: number;
  if (normalizedLon < start) {
    // Wrap-around case
    positionInGate = normalizedLon + (360 - start);
  } else {
    positionInGate = normalizedLon - start;
  }

  // WICHTIG: Line-Berechnung
  // Line 1 = Anfang des Gates (0° bis lineSpan)
  // Line 6 = Ende des Gates (5*lineSpan bis span)
  // Aber: Bei genau am Start (0°) sollte Line 1 sein, nicht Line 6
  // Bei genau am Ende (span) sollte Line 6 sein, nicht Line 1
  // Die aktuelle Berechnung ist korrekt: Math.floor(positionInGate / lineSpan) + 1
  // ABER: Wenn positionInGate sehr nahe an span ist, könnte es zu Line 7 werden
  // Daher: Verwende Math.ceil für bessere Genauigkeit am Ende
  // Oder: Prüfe ob positionInGate >= span - epsilon, dann Line 6
  
  // Standard-Berechnung
  let line = Math.floor(positionInGate / lineSpan) + 1;
  
  // Spezialfall: Wenn sehr nahe am Ende (innerhalb der letzten Line-Span)
  // Stelle sicher, dass wir Line 6 bekommen, nicht Line 7
  if (positionInGate >= span - (lineSpan / 2)) {
    line = 6;
  }
  
  return Math.min(Math.max(line, 1), 6); // Clamp to 1-6
}

/**
 * Get gate and line for a longitude
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @returns Object with gate and line, or null if not found
 */
export function getGateAndLine(longitude: number): { gate: number; line: number } | null {
  const gate = gateForLongitude(longitude);
  const line = lineForLongitude(longitude);

  if (gate === null || line === null) return null;

  return { gate, line };
}

/**
 * Get nearby gates for a longitude (within tolerance)
 * Useful for activating gates when planets are close but not exactly in the gate
 * @param longitude Ecliptic longitude in degrees (0-360)
 * @param toleranceDegrees Maximum distance in degrees (default: 6°)
 * @returns Array of gates that are within tolerance
 */
export function getNearbyGates(longitude: number, toleranceDegrees: number = 6): Array<{ gate: number; distance: number }> {
  const normalizedLon = norm360(longitude);
  const nearbyGates: Array<{ gate: number; distance: number }> = [];

  for (const { gate, start, span } of GATE_SPANS) {
    const end = norm360(start + span);
    const gateCenter = norm360(start + span / 2);
    
    // Calculate minimum distance to this gate
    let distance: number;
    
    if (end < start) {
      // Wrap-around case
      const dist1 = Math.min(
        Math.abs(normalizedLon - start),
        Math.abs(normalizedLon - (start + 360)),
        Math.abs(normalizedLon - (start - 360))
      );
      const dist2 = Math.min(
        Math.abs(normalizedLon - end),
        Math.abs(normalizedLon - (end + 360)),
        Math.abs(normalizedLon - (end - 360))
      );
      // If inside gate, distance is 0
      if (normalizedLon >= start || normalizedLon < end) {
        distance = 0;
      } else {
        distance = Math.min(dist1, dist2);
      }
    } else {
      // Normal case
      if (normalizedLon >= start && normalizedLon < end) {
        // Inside gate
        distance = 0;
      } else {
        // Outside gate - calculate distance to nearest edge
        const distToStart = Math.min(
          Math.abs(normalizedLon - start),
          Math.abs(normalizedLon - (start + 360)),
          Math.abs(normalizedLon - (start - 360))
        );
        const distToEnd = Math.min(
          Math.abs(normalizedLon - end),
          Math.abs(normalizedLon - (end + 360)),
          Math.abs(normalizedLon - (end - 360))
        );
        distance = Math.min(distToStart, distToEnd);
      }
    }
    
    if (distance <= toleranceDegrees) {
      nearbyGates.push({ gate, distance });
    }
  }

  // Sort by distance (closest first)
  nearbyGates.sort((a, b) => a.distance - b.distance);
  
  return nearbyGates;
}

/**
 * Format gate and line as string (e.g., "64.3")
 */
export function formatGateAndLine(longitude: number): string | null {
  const result = getGateAndLine(longitude);
  if (!result) return null;
  return `${result.gate}.${result.line}`;
}

/**
 * Get all gate information for debugging
 */
export function getGateInfo(longitude: number) {
  const normalizedLon = norm360(longitude);
  const gate = gateForLongitude(normalizedLon);
  const line = lineForLongitude(normalizedLon);
  const gateData = gate ? GATE_SPANS.find(g => g.gate === gate) : null;

  return {
    longitude: normalizedLon,
    gate,
    line,
    formatted: gate && line ? `${gate}.${line}` : null,
    gateData,
  };
}


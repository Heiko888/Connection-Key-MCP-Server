/**
 * Chart Truth Service
 * Single Source of Truth für alle Chart-Berechnungen
 * 
 * Wrapper um integration/scripts/chart-calculation-astronomy.js
 * Stellt stabilen, versionierten Contract bereit
 */

import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Dynamischer Import des Berechnungsmoduls (CommonJS)
// Wird zur Laufzeit geladen, nicht zur Build-Zeit
let ChartCalculationAstronomy: any = null;

function loadChartCalculationModule() {
  if (!ChartCalculationAstronomy) {
    const chartCalculationPath = path.join(process.cwd(), 'services', 'chart-truth', 'chart-calculation-astronomy.js');
    ChartCalculationAstronomy = require(chartCalculationPath);
  }
  return ChartCalculationAstronomy;
}

// Chart-Versionen (Truth Contract Versions)
const DEFAULT_CHART_VERSION = '1.0.0';
const SUPPORTED_VERSIONS = ['1.0.0', '1.1.0', '1.1.1'] as const;

export type ChartVersion = typeof SUPPORTED_VERSIONS[number];

// Versionierungsstrategie
export const CHART_VERSIONS = {
  '1.0.0': {
    engine: 'astronomy-engine',
    status: 'stable',
    description: 'Astronomy-Engine / Fallback'
  },
  '1.1.0': {
    engine: 'swiss-ephemeris',
    status: 'experimental',
    description: 'Swiss Ephemeris'
  },
  '1.1.1': {
    engine: 'swiss-ephemeris',
    status: 'stable',
    description: 'Swiss Ephemeris (Bugfix)'
  }
} as const;

/**
 * Input-Format (verbindlich)
 */
export interface ChartTruthInput {
  birth_date: string;   // YYYY-MM-DD
  birth_time: string;   // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;     // IANA (z.B. Europe/Berlin)
  chart_version?: ChartVersion;  // Optional: Default 1.0.0
}

/**
 * Output-Format (Truth Contract)
 */
export interface ChartTruthOutput {
  chart_version: string;
  calculated_at: string;  // ISO-8601
  input_hash: string;      // sha256
  input: ChartTruthInput;
  core: {
    type: string | null;
    authority: string | null;
    strategy: string | null;
    profile: string | null;
    definition: string | null;
  };
  centers: {
    head: 'defined' | 'undefined';
    ajna: 'defined' | 'undefined';
    throat: 'defined' | 'undefined';
    g: 'defined' | 'undefined';
    heart: 'defined' | 'undefined';
    spleen: 'defined' | 'undefined';
    solar_plexus: 'defined' | 'undefined';
    sacral: 'defined' | 'undefined';
    root: 'defined' | 'undefined';
  };
  channels: string[];
  gates: {
    personality: {
      sun: { gate: number; line: number } | null;
      earth: { gate: number; line: number } | null;
      moon: { gate: number; line: number } | null;
      north_node: { gate: number; line: number } | null;
      south_node: { gate: number; line: number } | null;
      mercury: { gate: number; line: number } | null;
      venus: { gate: number; line: number } | null;
      mars: { gate: number; line: number } | null;
      jupiter: { gate: number; line: number } | null;
      saturn: { gate: number; line: number } | null;
      uranus: { gate: number; line: number } | null;
      neptune: { gate: number; line: number } | null;
      pluto: { gate: number; line: number } | null;
    };
    design: {
      sun: { gate: number; line: number } | null;
      earth: { gate: number; line: number } | null;
      moon: { gate: number; line: number } | null;
      north_node: { gate: number; line: number } | null;
      south_node: { gate: number; line: number } | null;
      mercury: { gate: number; line: number } | null;
      venus: { gate: number; line: number } | null;
      mars: { gate: number; line: number } | null;
      jupiter: { gate: number; line: number } | null;
      saturn: { gate: number; line: number } | null;
      uranus: { gate: number; line: number } | null;
      neptune: { gate: number; line: number } | null;
      pluto: { gate: number; line: number } | null;
    };
  };
}

/**
 * Berechnet SHA256 Hash des Inputs (stabil, deterministisch)
 */
function calculateInputHash(input: ChartTruthInput): string {
  const inputString = JSON.stringify(input, Object.keys(input).sort());
  return createHash('sha256').update(inputString).digest('hex');
}

/**
 * Konvertiert Geburtsort zu String für bestehendes Modul
 * (Koordinaten werden direkt verwendet, kein Geocoding)
 */
function coordinatesToPlaceString(latitude: number, longitude: number): string {
  // Bestehendes Modul erwartet birthPlace als String
  // Wir verwenden Koordinaten direkt als String-Repräsentation
  return `${latitude},${longitude}`;
}

/**
 * Berechnet Chart mit Version 1.0.0 (Astronomy-Engine)
 */
async function calculateChartV1(input: ChartTruthInput): Promise<any> {
  const ChartCalculationModule = loadChartCalculationModule();
  const calculator = new ChartCalculationModule();

  // Koordinaten direkt verwenden: Überschreibe geocode() um Geocoding zu umgehen
  const originalGeocode = calculator.geocode.bind(calculator);
  calculator.geocode = async (place: string) => {
    if (place.includes(',') && place.split(',').length === 2) {
      const parts = place.split(',').map(s => s.trim());
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      }
    }
    return originalGeocode(place);
  };

  const birthPlace = coordinatesToPlaceString(input.latitude, input.longitude);
  return await calculator.calculateHumanDesignChart(
    input.birth_date,
    input.birth_time,
    birthPlace
  );
}

/**
 * Berechnet Chart mit Version 1.1.0 (Swiss Ephemeris) - STUB
 * TODO: Implementiere Swiss Ephemeris Integration
 */
async function calculateChartSwiss(input: ChartTruthInput): Promise<any> {
  // STUB: Aktuell noch nicht implementiert
  // Fallback auf V1 für jetzt
  console.warn('[Chart-Truth] Swiss Ephemeris (1.1.0) noch nicht implementiert, verwende V1.0.0');
  return await calculateChartV1(input);
  
  // Zukünftige Implementierung:
  // const swissEphemeris = require('swisseph');
  // const julianDay = calculateJulianDay(input.birth_date, input.birth_time, input.timezone);
  // const planets = swissEphemeris.calculatePlanets(julianDay);
  // return transformSwissEphemerisToChart(planets);
}

/**
 * Engine-Routing nach chart_version
 */
async function calculateChartByVersion(input: ChartTruthInput): Promise<any> {
  const version = input.chart_version || DEFAULT_CHART_VERSION;

  switch (version) {
    case '1.0.0':
      return await calculateChartV1(input);
    
    case '1.1.0':
    case '1.1.1':
      return await calculateChartSwiss(input);
    
    default:
      throw new Error(`Unsupported chart_version: ${version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`);
  }
}

/**
 * Transformiert Output des bestehenden Moduls ins Truth Contract Format
 */
function transformToTruthContract(
  input: ChartTruthInput,
  chartVersion: ChartVersion,
  inputHash: string,
  calculatedAt: string,
  chartData: any
): ChartTruthOutput {
  // Centers: Mappe definiert/undefiniert
  const centersMap: Record<string, 'defined' | 'undefined'> = {
    head: 'undefined',
    ajna: 'undefined',
    throat: 'undefined',
    g: 'undefined',
    heart: 'undefined',
    spleen: 'undefined',
    solar_plexus: 'undefined',
    sacral: 'undefined',
    root: 'undefined'
  };

  if (chartData.centers?.defined) {
    chartData.centers.defined.forEach((center: string) => {
      // Normalisiere Center-Namen (camelCase -> snake_case)
      let normalizedCenter = center.toLowerCase();
      if (normalizedCenter === 'solarplexus') {
        normalizedCenter = 'solar_plexus';
      }
      // Prüfe ob Center in Map existiert
      if (centersMap.hasOwnProperty(normalizedCenter)) {
        centersMap[normalizedCenter] = 'defined';
      }
    });
  }

  // Channels: Extrahiere aktive Channels
  const channels: string[] = chartData.channels?.active || [];

  // Gates: Extrahiere Personality (Sun) und Design (Earth)
  const gates = {
    personality: {
      sun: chartData.planets?.sun ? { gate: chartData.planets.sun.gate, line: chartData.planets.sun.line } : null,
      earth: chartData.planets?.earth ? { gate: chartData.planets.earth.gate, line: chartData.planets.earth.line } : null,
      moon: chartData.planets?.moon ? { gate: chartData.planets.moon.gate, line: chartData.planets.moon.line } : null,
      north_node: chartData.planets?.northNode ? { gate: chartData.planets.northNode.gate, line: chartData.planets.northNode.line } : null,
      south_node: chartData.planets?.southNode ? { gate: chartData.planets.southNode.gate, line: chartData.planets.southNode.line } : null,
      mercury: chartData.planets?.mercury ? { gate: chartData.planets.mercury.gate, line: chartData.planets.mercury.line } : null,
      venus: chartData.planets?.venus ? { gate: chartData.planets.venus.gate, line: chartData.planets.venus.line } : null,
      mars: chartData.planets?.mars ? { gate: chartData.planets.mars.gate, line: chartData.planets.mars.line } : null,
      jupiter: chartData.planets?.jupiter ? { gate: chartData.planets.jupiter.gate, line: chartData.planets.jupiter.line } : null,
      saturn: chartData.planets?.saturn ? { gate: chartData.planets.saturn.gate, line: chartData.planets.saturn.line } : null,
      uranus: chartData.planets?.uranus ? { gate: chartData.planets.uranus.gate, line: chartData.planets.uranus.line } : null,
      neptune: chartData.planets?.neptune ? { gate: chartData.planets.neptune.gate, line: chartData.planets.neptune.line } : null,
      pluto: chartData.planets?.pluto ? { gate: chartData.planets.pluto.gate, line: chartData.planets.pluto.line } : null
    },
    design: {
      sun: chartData.planets?.earth ? { gate: chartData.planets.earth.gate, line: chartData.planets.earth.line } : null,
      earth: chartData.planets?.sun ? { gate: chartData.planets.sun.gate, line: chartData.planets.sun.line } : null,
      moon: null,
      north_node: null,
      south_node: null,
      mercury: null,
      venus: null,
      mars: null,
      jupiter: null,
      saturn: null,
      uranus: null,
      neptune: null,
      pluto: null
    }
  };

  // Definition: Anzahl definierter Centers
  const definedCentersCount = Object.values(centersMap).filter(c => c === 'defined').length;
  const definition = `${definedCentersCount}/9`;

  return {
    chart_version: chartVersion,
    calculated_at: calculatedAt,
    input_hash: inputHash,
    input,
    core: {
      type: chartData.type || null,
      authority: chartData.authority || null,
      strategy: chartData.strategy || null,
      profile: chartData.profile || null,
      definition: definition
    },
    centers: centersMap,
    channels,
    gates
  };
}

/**
 * Single Source of Truth für Chart-Berechnungen
 * 
 * @param input - ChartTruthInput (verbindliches Format, chart_version optional)
 * @returns ChartTruthOutput (Truth Contract)
 * @throws Error bei ungültigem Input oder Berechnungsfehler
 */
export async function getChartTruth(input: ChartTruthInput): Promise<ChartTruthOutput> {
  // Validierung: Keine Defaults, keine Interpretation
  if (!input.birth_date || !input.birth_time || 
      typeof input.latitude !== 'number' || typeof input.longitude !== 'number' || 
      !input.timezone) {
    throw new Error('Invalid input: All fields are required (birth_date, birth_time, latitude, longitude, timezone)');
  }

  // Chart-Version bestimmen (Default: 1.0.0)
  const chartVersion: ChartVersion = input.chart_version || DEFAULT_CHART_VERSION;

  // Validierung: Version muss unterstützt sein
  if (!SUPPORTED_VERSIONS.includes(chartVersion)) {
    throw new Error(`Unsupported chart_version: ${chartVersion}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`);
  }

  // Input Hash berechnen (vor Berechnung, deterministisch)
  // WICHTIG: input_hash wird NUR aus Geburtsdaten gebildet (ohne chart_version)
  // Dedupe greift pro Version: (input_hash, chart_version)
  const inputHash = calculateInputHash(input);
  const calculatedAt = new Date().toISOString();

  try {
    // Engine-Routing: Berechne Chart mit entsprechender Engine
    const chartData = await calculateChartByVersion(input);

    // Transformiere ins Truth Contract Format
    return transformToTruthContract(input, chartVersion, inputHash, calculatedAt, chartData);
  } catch (error: any) {
    // Fehler sichtbar machen (kein stilles Abfangen)
    throw new Error(`Chart calculation failed (version ${chartVersion}): ${error.message}`);
  }
}

/**
 * Gibt unterstützte Chart-Versionen zurück
 */
export function getSupportedVersions(): typeof CHART_VERSIONS {
  return CHART_VERSIONS;
}

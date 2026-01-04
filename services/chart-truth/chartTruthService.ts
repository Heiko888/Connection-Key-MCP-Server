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

// Chart-Version (Truth Contract Version)
const CHART_VERSION = '1.0.0';

/**
 * Input-Format (verbindlich)
 */
export interface ChartTruthInput {
  birth_date: string;   // YYYY-MM-DD
  birth_time: string;   // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;     // IANA (z.B. Europe/Berlin)
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
 * Transformiert Output des bestehenden Moduls ins Truth Contract Format
 */
function transformToTruthContract(
  input: ChartTruthInput,
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
    chart_version: CHART_VERSION,
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
 * @param input - ChartTruthInput (verbindliches Format)
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

  // Input Hash berechnen (vor Berechnung, deterministisch)
  const inputHash = calculateInputHash(input);
  const calculatedAt = new Date().toISOString();

  // Bestehendes Modul instanziieren (dynamisch zur Laufzeit geladen)
  const ChartCalculationModule = loadChartCalculationModule();
  const calculator = new ChartCalculationModule();

  // Koordinaten direkt verwenden: Überschreibe geocode() um Geocoding zu umgehen
  const originalGeocode = calculator.geocode.bind(calculator);
  calculator.geocode = async (place: string) => {
    // Wenn Place-String Koordinaten-Format hat (lat,lon), parse es direkt
    if (place.includes(',') && place.split(',').length === 2) {
      const parts = place.split(',').map(s => s.trim());
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      }
    }
    // Fallback: Original-Geocoding (sollte nicht passieren bei korrektem Input)
    return originalGeocode(place);
  };

  try {
    // Verwende Koordinaten als Place-String (wird von überschriebenem geocode() geparst)
    const birthPlace = coordinatesToPlaceString(input.latitude, input.longitude);
    const chartData = await calculator.calculateHumanDesignChart(
      input.birth_date,
      input.birth_time,
      birthPlace
    );

    // Transformiere ins Truth Contract Format
    return transformToTruthContract(input, inputHash, calculatedAt, chartData);
  } catch (error: any) {
    // Fehler sichtbar machen (kein stilles Abfangen)
    throw new Error(`Chart calculation failed: ${error.message}`);
  }
}

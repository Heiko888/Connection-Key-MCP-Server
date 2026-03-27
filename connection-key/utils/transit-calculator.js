/**
 * Transit-Calculator
 * Berechnet aktuelle Planetenpositionen via Swiss Ephemeris
 * und mappt sie auf Human Design Gates + Linien.
 */

import swisseph from "swisseph";
import { gateForLongitude, lineForLongitude, norm360, dateToJD } from "./gate-mapping.js";

const SEFLG_SWIEPH = 2;

const PLANETS = [
  { id: 0,  name: "Sonne" },
  { id: 1,  name: "Mond" },
  { id: 2,  name: "Merkur" },
  { id: 3,  name: "Venus" },
  { id: 4,  name: "Mars" },
  { id: 5,  name: "Jupiter" },
  { id: 6,  name: "Saturn" },
  { id: 7,  name: "Uranus" },
  { id: 8,  name: "Neptun" },
  { id: 9,  name: "Pluto" },
  { id: 11, name: "Mondknoten" }, // True Node
];

// 1-Stunden-Cache
let cache = null;

function calcPlanetLongitude(jd, planetId) {
  try {
    const result = swisseph.swe_calc_ut(jd, planetId, SEFLG_SWIEPH);
    if (result.error) {
      console.warn(`[Transit] swisseph Fehler Planet ${planetId}:`, result.error);
      return null;
    }
    return norm360(result.longitude);
  } catch (e) {
    console.warn(`[Transit] swisseph Exception Planet ${planetId}:`, e?.message);
    return null;
  }
}

export async function getCurrentTransits() {
  const now = Date.now();

  // Cache 1h gültig
  if (cache && now - cache.timestamp < 3600_000) {
    return cache.data;
  }

  const jd = dateToJD(new Date());
  const transits = [];

  for (const { id, name } of PLANETS) {
    const degree = calcPlanetLongitude(jd, id);
    if (degree === null) continue;

    transits.push({
      planet: name,
      gate: gateForLongitude(degree),
      line: lineForLongitude(degree),
      degree: Math.round(degree * 1000) / 1000,
    });
  }

  // Erde = Sonne + 180°
  const sunDegree = calcPlanetLongitude(jd, 0);
  if (sunDegree !== null) {
    const earthDegree = norm360(sunDegree + 180);
    transits.push({
      planet: "Erde",
      gate: gateForLongitude(earthDegree),
      line: lineForLongitude(earthDegree),
      degree: Math.round(earthDegree * 1000) / 1000,
    });
  }

  cache = { timestamp: now, data: transits };
  return transits;
}

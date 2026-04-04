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

// 1-Stunden-Cache (aktuelle Transits)
let cache = null;

// Jahres-Cache (pro Jahr)
const yearCache = new Map();

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

/**
 * Berechnet monatliche Planeten-Snapshots für ein ganzes Jahr.
 * Gibt 12 Einträge zurück (1. jedes Monats, 12:00 UTC).
 * Gecacht pro Jahr (ändert sich nicht mehr wenn Jahr vergangen).
 */
export function getTransitsForYear(year) {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const MONTH_NAMES = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];

  const months = [];
  for (let month = 0; month < 12; month++) {
    const date = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    const jd = dateToJD(date);
    const planets = [];

    for (const { id, name } of PLANETS) {
      const degree = calcPlanetLongitude(jd, id);
      if (degree === null) continue;
      planets.push({
        planet: name,
        gate: gateForLongitude(degree),
        line: lineForLongitude(degree),
        degree: Math.round(degree * 1000) / 1000,
      });
    }

    // Erde
    const sunDegree = calcPlanetLongitude(jd, 0);
    if (sunDegree !== null) {
      const earthDegree = norm360(sunDegree + 180);
      planets.push({
        planet: "Erde",
        gate: gateForLongitude(earthDegree),
        line: lineForLongitude(earthDegree),
        degree: Math.round(earthDegree * 1000) / 1000,
      });
    }

    months.push({ month: MONTH_NAMES[month], date: date.toISOString().slice(0, 10), planets });
  }

  yearCache.set(year, months);
  return months;
}

// Monats-Cache: "YYYY-MM" → Array täglicher Snapshots
const monthCache = new Map();

/**
 * Berechnet tägliche Planeten-Snapshots für einen Monat.
 * Gibt einen Eintrag pro Tag zurück (12:00 UTC, Sonne+Mond fokussiert).
 * Cache: bleibt bis Server-Restart (vergangene Monate ändern sich nicht).
 */
export function getTransitsForMonth(year, month) {
  const cacheKey = `${year}-${String(month).padStart(2, '0')}`;
  if (monthCache.has(cacheKey)) return monthCache.get(cacheKey);

  const days = [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate(); // month=1-12 → 0=last day prev month trick

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const jd = dateToJD(date);

    const sunDegree   = calcPlanetLongitude(jd, 0);
    const moonDegree  = calcPlanetLongitude(jd, 1);
    const marsDegree  = calcPlanetLongitude(jd, 4);
    const mercuryDeg  = calcPlanetLongitude(jd, 2);

    const earthDegree = sunDegree !== null ? norm360(sunDegree + 180) : null;

    // Mondphase
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.53058867;
    const daysSince = (date - knownNewMoon) / 86400000;
    const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
    let moonPhase = 'Zunehmend';
    if (phase < 1.85)  moonPhase = '🌑 Neumond';
    else if (phase < 7.38)  moonPhase = '🌒 Sichel';
    else if (phase < 9.22)  moonPhase = '🌓 Erstes Viertel';
    else if (phase < 14.76) moonPhase = '🌔 Zunehmend';
    else if (phase < 16.61) moonPhase = '🌕 Vollmond';
    else if (phase < 22.15) moonPhase = '🌖 Abnehmend';
    else if (phase < 24.00) moonPhase = '🌗 Letztes Viertel';
    else moonPhase = '🌘 Sichel';

    days.push({
      date: date.toISOString().slice(0, 10),
      day,
      sun:     sunDegree    !== null ? { gate: gateForLongitude(sunDegree),    line: lineForLongitude(sunDegree)    } : null,
      earth:   earthDegree  !== null ? { gate: gateForLongitude(earthDegree),  line: lineForLongitude(earthDegree)  } : null,
      moon:    moonDegree   !== null ? { gate: gateForLongitude(moonDegree),   line: lineForLongitude(moonDegree)   } : null,
      mercury: mercuryDeg   !== null ? { gate: gateForLongitude(mercuryDeg),   line: lineForLongitude(mercuryDeg)   } : null,
      mars:    marsDegree   !== null ? { gate: gateForLongitude(marsDegree),   line: lineForLongitude(marsDegree)   } : null,
      moonPhase,
    });
  }

  // Vergangene Monate cachen (ändern sich nicht)
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    monthCache.set(cacheKey, days);
  }

  return days;
}

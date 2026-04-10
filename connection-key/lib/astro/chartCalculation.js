/**
 * Human Design Chart Calculation
 * Swiss Ephemeris (swisseph) – maximale astronomische Präzision
 * Design-Datum: exakt 88° Sonnenbogen (Binärsuche)
 */

import swisseph from "swisseph";
import { find } from "geo-tz";
import { DateTime } from "luxon";
import { createRequire } from "module";
import path from "path";

// Ephemeris-Pfad setzen damit Chiron (seas_18.se1) und andere Asteroiden-Daten gefunden werden
const require = createRequire(import.meta.url);
const swissephPath = path.dirname(require.resolve("swisseph/package.json"));
swisseph.swe_set_ephe_path(path.join(swissephPath, "ephe"));

const GATE_SPANS = [
  { gate: 25, start: 358.25, span: 5.625 }, { gate: 17, start: 3.875, span: 5.625 }, { gate: 21, start: 9.5, span: 5.625 },
  { gate: 51, start: 15.125, span: 5.625 }, { gate: 42, start: 20.75, span: 5.625 }, { gate: 3, start: 26.375, span: 5.625 },
  { gate: 27, start: 32, span: 5.625 }, { gate: 24, start: 37.625, span: 5.625 }, { gate: 2, start: 43.25, span: 5.625 },
  { gate: 23, start: 48.875, span: 5.625 }, { gate: 8, start: 54.5, span: 5.625 }, { gate: 20, start: 60.125, span: 5.625 },
  { gate: 16, start: 65.75, span: 5.625 }, { gate: 35, start: 71.375, span: 5.625 }, { gate: 45, start: 77, span: 5.625 },
  { gate: 12, start: 82.625, span: 5.625 }, { gate: 15, start: 88.25, span: 5.625 }, { gate: 52, start: 93.875, span: 5.625 },
  { gate: 39, start: 99.5, span: 5.625 }, { gate: 53, start: 105.125, span: 5.625 }, { gate: 62, start: 110.75, span: 5.625 },
  { gate: 56, start: 116.375, span: 5.625 }, { gate: 31, start: 122, span: 5.625 }, { gate: 33, start: 127.625, span: 5.625 },
  { gate: 7, start: 133.25, span: 5.625 }, { gate: 4, start: 138.875, span: 5.625 }, { gate: 29, start: 144.5, span: 5.625 },
  { gate: 59, start: 150.125, span: 5.625 }, { gate: 40, start: 155.75, span: 5.625 }, { gate: 64, start: 161.375, span: 5.625 },
  { gate: 47, start: 167, span: 5.625 }, { gate: 6, start: 172.625, span: 5.625 }, { gate: 46, start: 178.25, span: 5.625 },
  { gate: 18, start: 183.875, span: 5.625 }, { gate: 48, start: 189.5, span: 5.625 }, { gate: 57, start: 195.125, span: 5.625 },
  { gate: 32, start: 200.75, span: 5.625 }, { gate: 50, start: 206.375, span: 5.625 }, { gate: 28, start: 212, span: 5.625 },
  { gate: 44, start: 217.625, span: 5.625 }, { gate: 1, start: 223.25, span: 5.625 }, { gate: 43, start: 228.875, span: 5.625 },
  { gate: 14, start: 234.5, span: 5.625 }, { gate: 34, start: 240.125, span: 5.625 }, { gate: 9, start: 245.75, span: 5.625 },
  { gate: 5, start: 251.375, span: 5.625 }, { gate: 26, start: 257, span: 5.625 }, { gate: 11, start: 262.625, span: 5.625 },
  { gate: 10, start: 268.25, span: 5.625 }, { gate: 58, start: 273.875, span: 5.625 }, { gate: 38, start: 279.5, span: 5.625 },
  { gate: 54, start: 285.125, span: 5.625 }, { gate: 61, start: 290.75, span: 5.625 }, { gate: 60, start: 296.375, span: 5.625 },
  { gate: 41, start: 302, span: 5.625 }, { gate: 19, start: 307.625, span: 5.625 }, { gate: 13, start: 313.25, span: 5.625 },
  { gate: 49, start: 318.875, span: 5.625 }, { gate: 30, start: 324.5, span: 5.625 }, { gate: 55, start: 330.125, span: 5.625 },
  { gate: 37, start: 335.75, span: 5.625 }, { gate: 63, start: 341.375, span: 5.625 }, { gate: 22, start: 347, span: 5.625 },
  { gate: 36, start: 352.625, span: 5.625 },
];

const CHANNELS = [
  { gates: [1, 8], centers: ["g", "throat"] },
  { gates: [2, 14], centers: ["g", "sacral"] },
  { gates: [3, 60], centers: ["sacral", "root"] },
  { gates: [4, 63], centers: ["ajna", "head"] },
  { gates: [5, 15], centers: ["sacral", "g"] },
  { gates: [6, 59], centers: ["solar-plexus", "sacral"] },
  { gates: [7, 31], centers: ["g", "throat"] },
  { gates: [9, 52], centers: ["sacral", "root"] },
  { gates: [10, 20], centers: ["g", "throat"] },
  { gates: [10, 34], centers: ["g", "sacral"] },
  { gates: [10, 57], centers: ["g", "spleen"] },
  { gates: [11, 56], centers: ["ajna", "throat"] },
  { gates: [12, 22], centers: ["throat", "solar-plexus"] },
  { gates: [13, 33], centers: ["g", "throat"] },
  { gates: [16, 48], centers: ["throat", "spleen"] },
  { gates: [17, 62], centers: ["ajna", "throat"] },
  { gates: [18, 58], centers: ["spleen", "root"] },
  { gates: [19, 49], centers: ["root", "solar-plexus"] },
  { gates: [20, 34], centers: ["throat", "sacral"] },
  { gates: [20, 57], centers: ["throat", "spleen"] },
  { gates: [21, 45], centers: ["heart", "throat"] },
  { gates: [25, 51], centers: ["g", "heart"] },
  { gates: [26, 44], centers: ["heart", "spleen"] },
  { gates: [27, 50], centers: ["sacral", "spleen"] },
  { gates: [28, 38], centers: ["spleen", "root"] },
  { gates: [29, 46], centers: ["sacral", "g"] },
  { gates: [30, 41], centers: ["solar-plexus", "root"] },
  { gates: [32, 54], centers: ["spleen", "root"] },
  { gates: [34, 57], centers: ["sacral", "spleen"] },
  { gates: [35, 36], centers: ["throat", "solar-plexus"] },
  { gates: [37, 40], centers: ["solar-plexus", "heart"] },
  { gates: [39, 55], centers: ["root", "solar-plexus"] },
  { gates: [42, 53], centers: ["sacral", "root"] },
  { gates: [43, 23], centers: ["ajna", "throat"] },
  { gates: [47, 64], centers: ["ajna", "head"] },
  { gates: [61, 24], centers: ["head", "ajna"] },
];

const GATES = [
  { number: 61, name: "Inner Truth" }, { number: 63, name: "Doubt" }, { number: 64, name: "Confusion" },
  { number: 4, name: "Formulization" }, { number: 11, name: "Ideas" }, { number: 17, name: "Opinion" },
  { number: 24, name: "Rationalization" }, { number: 43, name: "Breakthrough" }, { number: 47, name: "Realization" },
  { number: 8, name: "Contribution" }, { number: 12, name: "Caution" }, { number: 16, name: "Skills" },
  { number: 20, name: "Now" }, { number: 23, name: "Assimilation" }, { number: 31, name: "Influence" },
  { number: 33, name: "Privacy" }, { number: 35, name: "Change" }, { number: 45, name: "Gatherer" },
  { number: 56, name: "Stimulation" }, { number: 62, name: "Details" }, { number: 1, name: "Self-Expression" },
  { number: 2, name: "Direction" }, { number: 7, name: "Role" }, { number: 10, name: "Self-Love" },
  { number: 13, name: "Listener" }, { number: 15, name: "Extremes" }, { number: 25, name: "Innocence" },
  { number: 46, name: "Body" }, { number: 21, name: "Control" }, { number: 26, name: "Trickster" },
  { number: 40, name: "Aloneness" }, { number: 51, name: "Shock" }, { number: 18, name: "Correction" },
  { number: 28, name: "Risk" }, { number: 32, name: "Continuity" }, { number: 44, name: "Alertness" },
  { number: 48, name: "Depth" }, { number: 50, name: "Values" }, { number: 57, name: "Intuition" },
  { number: 6, name: "Friction" }, { number: 22, name: "Openness" }, { number: 30, name: "Recognition" },
  { number: 36, name: "Crisis" }, { number: 37, name: "Friendship" }, { number: 49, name: "Revolution" },
  { number: 55, name: "Spirit" }, { number: 3, name: "Ordering" }, { number: 5, name: "Waiting" },
  { number: 9, name: "Focus" }, { number: 14, name: "Power Skills" }, { number: 27, name: "Caring" },
  { number: 29, name: "Commitment" }, { number: 34, name: "Power" }, { number: 42, name: "Growth" },
  { number: 59, name: "Intimacy" }, { number: 19, name: "Approach" }, { number: 38, name: "Fighter" },
  { number: 39, name: "Provocation" }, { number: 41, name: "Contraction" }, { number: 52, name: "Stillness" },
  { number: 53, name: "Beginnings" }, { number: 54, name: "Ambition" }, { number: 58, name: "Vitality" },
  { number: 60, name: "Limitation" },
];

const CENTER_KEYS = ["head", "ajna", "throat", "g", "heart", "sacral", "solar-plexus", "spleen", "root"];

const CHANNEL_NAMES = {
  "1-8": "Inspiration", "2-14": "Keeper of Keys", "3-60": "Mutation", "4-63": "Logic",
  "5-15": "Rhythm", "6-59": "Mating", "7-31": "Alpha", "9-52": "Concentration",
  "10-20": "Awakening", "10-34": "Exploration", "10-57": "Survival", "11-56": "Curiosity",
  "12-22": "Openness", "13-33": "Prodigal", "16-48": "Wavelength", "17-62": "Acceptance",
  "18-58": "Judgment", "19-49": "Synthesis", "20-34": "Charisma", "20-57": "Brainwave",
  "21-45": "Money", "25-51": "Initiation", "26-44": "Surrender", "27-50": "Preservation",
  "28-38": "Struggle", "29-46": "Discovery", "30-41": "Recognition", "32-54": "Transformation",
  "34-57": "Power", "35-36": "Transitoriness", "37-40": "Community", "39-55": "Emoting",
  "42-53": "Maturation", "23-43": "Structuring", "47-64": "Abstraction",
  "24-61": "Awareness",
};

const SE_SUN       = 0;
const SE_MOON      = 1;
const SE_MERCURY   = 2;
const SE_VENUS     = 3;
const SE_MARS      = 4;
const SE_JUPITER   = 5;
const SE_SATURN    = 6;
const SE_URANUS    = 7;
const SE_NEPTUNE   = 8;
const SE_PLUTO     = 9;
const SE_TRUE_NODE = 11;
const SE_MEAN_APOG = 12;  // Mean Black Moon Lilith
const SE_CHIRON    = 15;
const SEFLG_SWIEPH = 2;

function getIncarnationCross(sunLonP, sunLonD, profile) {
  if (sunLonP == null || sunLonD == null) return null;

  const pSunGate  = gateForLongitude(sunLonP);
  const pEarthGate = gateForLongitude(norm360(sunLonP + 180));
  const dSunGate  = gateForLongitude(sunLonD);
  const dEarthGate = gateForLongitude(norm360(sunLonD + 180));

  const firstLine = parseInt(profile.split("/")[0], 10);
  let crossType;
  if (profile === "3/5") crossType = "Juxtaposition";
  else if (firstLine <= 3)  crossType = "Right Angle";
  else                      crossType = "Left Angle";

  const KNOWN_CROSSES = {
    // Sphinx: 1/2 | 7/13
    "1-2-7-13":   "Sphinx", "2-1-13-7":  "Sphinx", "7-13-1-2":  "Sphinx", "13-7-2-1":  "Sphinx",
    // Duality: 1/2 | 49/4
    "1-2-49-4":   "Duality", "2-1-4-49":  "Duality", "49-4-1-2":  "Duality", "4-49-2-1":  "Duality",
    // Vessel of Love: 3/50 | 60/56
    "3-50-60-56": "Vessel of Love", "50-3-56-60": "Vessel of Love", "60-56-3-50": "Vessel of Love", "56-60-50-3": "Vessel of Love",
    // Vessel of Love: 10/15 | 25/46
    "10-15-25-46": "Vessel of Love", "15-10-46-25": "Vessel of Love", "25-46-10-15": "Vessel of Love", "46-25-15-10": "Vessel of Love",
    // Four Ways: 10/15 | 18/17
    "10-15-18-17": "Four Ways", "15-10-17-18": "Four Ways", "18-17-10-15": "Four Ways", "17-18-15-10": "Four Ways",
    // Contagion: 4/49 | 8/14
    "4-49-8-14":  "Contagion", "49-4-14-8":  "Contagion", "8-14-4-49":  "Contagion", "14-8-49-4":  "Contagion",
    // Maya: 34/20 | 40/37
    "34-20-40-37": "Maya", "20-34-37-40": "Maya", "40-37-34-20": "Maya", "37-40-20-34": "Maya",
    // Living Now: 20/34 | 10/15
    "20-34-10-15": "Living Now", "34-20-15-10": "Living Now", "10-15-20-34": "Living Now", "15-10-34-20": "Living Now",
    // Rulership: 21/45 | 26/44
    "21-45-26-44": "Rulership", "45-21-44-26": "Rulership", "26-44-21-45": "Rulership", "44-26-45-21": "Rulership",
    // Tension: 38/39 | 28/55
    "38-39-28-55": "Tension", "39-38-55-28": "Tension", "28-55-38-39": "Tension", "55-28-39-38": "Tension",
    // Eden: 11/12 | 36/6
    "11-12-36-6":  "Eden", "12-11-6-36":  "Eden", "36-6-11-12":  "Eden", "6-36-12-11":  "Eden",
    // Sleeping Phoenix: 47/22 | 64/63
    "47-22-64-63": "Sleeping Phoenix", "22-47-63-64": "Sleeping Phoenix", "64-63-47-22": "Sleeping Phoenix", "63-64-22-47": "Sleeping Phoenix",
    // Consciousness: 35/5 | 63/64
    "35-5-63-64":  "Consciousness", "5-35-64-63":  "Consciousness", "63-64-35-5":  "Consciousness", "64-63-5-35":  "Consciousness",
    // Thinking: 24/44 | 19/33
    "24-44-19-33": "Thinking", "44-24-33-19": "Thinking", "19-33-24-44": "Thinking", "33-19-44-24": "Thinking",
    // Service: 17/18 | 58/52
    "17-18-58-52": "Service", "18-17-52-58": "Service", "58-52-17-18": "Service", "52-58-18-17": "Service",
    // Explanation: 29/46 | 43/23
    "29-46-43-23": "Explanation", "46-29-23-43": "Explanation", "43-23-29-46": "Explanation", "23-43-46-29": "Explanation",
    // Alpha: 29/46 | 7/13
    "29-46-7-13":  "Alpha", "46-29-13-7":  "Alpha", "7-13-29-46":  "Alpha", "13-7-46-29":  "Alpha",
    // Articulation: 31/41 | 24/61
    "31-41-24-61": "Articulation", "41-31-61-24": "Articulation", "61-24-31-41": "Articulation", "24-61-41-31": "Articulation",
    // Cycles: 42/32 | 53/54
    "42-32-53-54": "Cycles", "32-42-54-53": "Cycles", "53-54-42-32": "Cycles", "54-53-32-42": "Cycles",
    // Determination: 9/16 | 52/58
    "9-16-52-58":  "Determination", "16-9-58-52":  "Determination", "52-58-9-16":  "Determination", "58-52-16-9":  "Determination",
    // Migration: 27/28 | 41/42
    "27-28-41-42": "Migration", "28-27-42-41": "Migration", "41-42-27-28": "Migration", "42-41-28-27": "Migration",
    // Community: 37/40 | 9/16
    "37-40-9-16":  "Community", "40-37-16-9":  "Community", "9-16-37-40":  "Community", "16-9-40-37":  "Community",
    // Penetration: 51/57 | 25/10
    "51-57-25-10": "Penetration", "57-51-10-25": "Penetration", "25-10-51-57": "Penetration", "10-25-57-51": "Penetration",
    // Clarion: 62/61 | 56/60
    "62-61-56-60": "Clarion", "61-62-60-56": "Clarion", "56-60-62-61": "Clarion", "60-56-61-62": "Clarion",
    // Separation: 5/35 | 47/22
    "5-35-47-22":  "Separation", "35-5-22-47":  "Separation", "47-22-5-35":  "Separation", "22-47-35-5":  "Separation",
    // Unexpected: 51/57 | 39/38
    "51-57-39-38": "Unexpected", "57-51-38-39": "Unexpected", "39-38-51-57": "Unexpected", "38-39-57-51": "Unexpected",
    // Confrontation: 38/39 | 57/51
    "38-39-57-51": "Confrontation", "39-38-51-57": "Confrontation", "57-51-38-39": "Confrontation", "51-57-39-38": "Confrontation",
    // Individualism: 8/14 | 1/2
    "8-14-1-2":    "Individualism", "14-8-2-1":    "Individualism", "1-2-8-14":    "Individualism", "2-1-14-8":    "Individualism",
    // Dedication: 29/46 | 13/7
    "29-46-13-7":  "Dedication", "46-29-7-13":  "Dedication", "13-7-29-46":  "Dedication", "7-13-46-29":  "Dedication",
    // Refinement: 33/19 | 2/1
    "33-19-2-1":   "Refinement", "19-33-1-2":   "Refinement", "2-1-33-19":   "Refinement", "1-2-19-33":   "Refinement",
    // Revolution: 49/4 | 30/29
    "49-4-30-29":  "Revolution", "4-49-29-30":  "Revolution", "30-29-49-4":  "Revolution", "29-30-4-49":  "Revolution",
    // Stillness: 52/58 | 62/61
    "52-58-62-61": "Stillness", "58-52-61-62": "Stillness", "62-61-52-58": "Stillness", "61-62-58-52": "Stillness",
    // Incarnation: 53/54 | 42/32
    "53-54-42-32": "Incarnation", "54-53-32-42": "Incarnation", "42-32-53-54": "Incarnation", "32-42-54-53": "Incarnation",
  };

  const crossKey = `${pSunGate}-${pEarthGate}-${dSunGate}-${dEarthGate}`;
  const crossName = KNOWN_CROSSES[crossKey];

  const typeLabel = crossType === "Right Angle" ? "RAX" : crossType === "Left Angle" ? "LAX" : "Juxtaposition";
  const pSunName = GATES.find((g) => g.number === pSunGate)?.name || `Gate ${pSunGate}`;
  const dSunName = GATES.find((g) => g.number === dSunGate)?.name || `Gate ${dSunGate}`;
  const name = crossName
    ? `${typeLabel} of ${crossName}`
    : `${typeLabel} of ${pSunName} / ${dSunName}`;

  return {
    name,
    type: crossType,
    gates: {
      personalitySun: pSunGate,
      personalityEarth: pEarthGate,
      designSun: dSunGate,
      designEarth: dEarthGate,
    },
  };
}

function norm360(x) {
  const y = x % 360;
  return y < 0 ? y + 360 : y;
}

function gateForLongitude(longitude) {
  const lon = norm360(longitude);
  for (const { gate, start, span } of GATE_SPANS) {
    const end = norm360(start + span);
    if (end < start) {
      if (lon >= start || lon < end) return gate;
    } else {
      if (lon >= start && lon < end) return gate;
    }
  }
  return null;
}

function lineForLongitude(longitude) {
  const gate = gateForLongitude(longitude);
  if (!gate) return 1;
  const g = GATE_SPANS.find((x) => x.gate === gate);
  if (!g) return 1;
  const lon = norm360(longitude);
  const pos = lon >= g.start ? lon - g.start : lon + (360 - g.start);
  return Math.min(6, Math.max(1, Math.floor((pos / g.span) * 6) + 1));
}

async function geocodePlace(place) {
  if (!place || typeof place !== "string" || place.trim().length < 2) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place.trim())}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "TheConnectionKey-Chart/1.0" } });
    const data = await res.json();
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (e) {
    console.warn("[Chart] Geocoding failed:", e?.message);
  }
  return null;
}

function parseDate(date) {
  const dateStr = (date || "").replace(/\D/g, "");
  if (dateStr.length < 8) return { year: 1990, month: 1, day: 1 };
  const y1 = parseInt(dateStr.slice(0, 4), 10);
  const m1 = parseInt(dateStr.slice(4, 6), 10);
  const d1 = parseInt(dateStr.slice(6, 8), 10);
  if (y1 >= 1900 && y1 <= 2100 && m1 >= 1 && m1 <= 12) {
    return { year: y1, month: m1, day: Math.min(31, Math.max(1, d1)) };
  }
  const day = parseInt(dateStr.slice(0, 2), 10) || 1;
  const month = parseInt(dateStr.slice(2, 4), 10) || 1;
  const year = parseInt(dateStr.slice(4, 8), 10) || 1990;
  return { year: year >= 1900 ? year : 1990, month: Math.min(12, Math.max(1, month)), day: Math.min(31, Math.max(1, day)) };
}

function parseTime(time) {
  const timeStr = (time || "12:00").replace(/\D/g, "");
  if (timeStr.length < 3) return { hour: 12, minute: 0 };
  const hour = timeStr.length >= 4 ? parseInt(timeStr.slice(0, 2), 10) : parseInt(timeStr.slice(0, 1), 10);
  const minute = timeStr.length >= 4 ? parseInt(timeStr.slice(2, 4), 10) : timeStr.length >= 3 ? parseInt(timeStr.slice(1, 3), 10) : 0;
  return { hour: Math.min(23, Math.max(0, hour)), minute: Math.min(59, Math.max(0, minute)) };
}

function dateToJD(date) {
  return date.getTime() / 86400000.0 + 2440587.5;
}

function getSwissLongitude(planet, jd) {
  try {
    const result = swisseph.swe_calc_ut(jd, planet, SEFLG_SWIEPH);
    if (result.error) {
      console.warn(`[Chart] swisseph error planet ${planet}:`, result.error);
      return null;
    }
    return norm360(result.longitude);
  } catch (e) {
    console.warn(`[Chart] swisseph exception planet ${planet}:`, e?.message);
    return null;
  }
}

/**
 * Exaktes Design-JD: Sonne exakt 88° vor Geburtssonne (Binärsuche)
 * Korrekt für alle Jahreszeiten – Sommer/Winter unterschiedlich schnell
 */
function calcDesignJD(jdBirth) {
  const sunBirth = swisseph.swe_calc_ut(jdBirth, SE_SUN, SEFLG_SWIEPH).longitude;
  const targetLon = norm360(sunBirth - 88);
  let jdLow = jdBirth - 95;
  let jdHigh = jdBirth - 82;
  for (let i = 0; i < 50; i++) {
    const jdMid = (jdLow + jdHigh) / 2;
    const lon = swisseph.swe_calc_ut(jdMid, SE_SUN, SEFLG_SWIEPH).longitude;
    const diff = ((lon - targetLon + 180 + 360) % 360) - 180;
    if (diff > 0) jdHigh = jdMid; else jdLow = jdMid;
  }
  return (jdLow + jdHigh) / 2;
}

export async function calculateHumanDesignChart(input) {
  const { birthDate, birthTime, birthPlace } = input;
  const placeStr = typeof birthPlace === "string" ? birthPlace : birthPlace?.name || "";
  let coords = typeof birthPlace === "object" && birthPlace?.lat != null
    ? { lat: birthPlace.lat, lon: birthPlace.lon }
    : typeof birthPlace === "object" && birthPlace?.latitude != null
    ? { lat: birthPlace.latitude, lon: birthPlace.longitude }
    : null;
  if (!coords && placeStr) coords = await geocodePlace(placeStr);

  const { year, month, day } = parseDate(birthDate || "");
  const { hour, minute } = parseTime(birthTime || "12:00");

  let tz = "UTC";
  if (coords?.lat != null && coords?.lon != null) {
    try {
      const zones = find(coords.lat, coords.lon);
      if (zones && zones.length > 0) tz = zones[0];
    } catch (_) {}
  }

  const dt = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone: tz });
  let birthDateObj = dt.toUTC().toJSDate();
  if (isNaN(birthDateObj.getTime())) {
    birthDateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  }

  const jdP = dateToJD(birthDateObj);
  const jdD = calcDesignJD(jdP);

  const PLANET_ID_TO_KEY = {
    [SE_SUN]:       'sun',
    [SE_MOON]:      'moon',
    [SE_MERCURY]:   'mercury',
    [SE_VENUS]:     'venus',
    [SE_MARS]:      'mars',
    [SE_JUPITER]:   'jupiter',
    [SE_SATURN]:    'saturn',
    [SE_URANUS]:    'uranus',
    [SE_NEPTUNE]:   'neptune',
    [SE_PLUTO]:     'pluto',
    [SE_TRUE_NODE]: 'north-node',
    [SE_MEAN_APOG]: 'lilith',
    [SE_CHIRON]:    'chiron',
  };

  // Chiron & Lilith sind "stille Flüsterer": werden berechnet und angezeigt,
  // beeinflussen aber NICHT activeGates, Kanäle, Zentren, Typ oder Autorität.
  const planets = [SE_SUN, SE_MOON, SE_MERCURY, SE_VENUS, SE_MARS, SE_JUPITER, SE_SATURN, SE_URANUS, SE_NEPTUNE, SE_PLUTO, SE_TRUE_NODE];
  const silentPlanets = [SE_MEAN_APOG, SE_CHIRON];

  const activeGates = new Set();
  const personalityPlanets = [];
  const designPlanets = [];

  for (const planet of planets) {
    const lonP = getSwissLongitude(planet, jdP);
    const lonD = getSwissLongitude(planet, jdD);
    const key = PLANET_ID_TO_KEY[planet];

    if (lonP != null) {
      const g = gateForLongitude(lonP);
      if (g) {
        activeGates.add(g);
        personalityPlanets.push({ planet: key, gate: g, line: lineForLongitude(lonP) });
      }
    }
    if (lonD != null) {
      const g = gateForLongitude(lonD);
      if (g) {
        activeGates.add(g);
        designPlanets.push({ planet: key, gate: g, line: lineForLongitude(lonD) });
      }
    }
    if (planet === SE_TRUE_NODE) {
      if (lonP != null) {
        const g = gateForLongitude(norm360(lonP + 180));
        if (g) {
          activeGates.add(g);
          personalityPlanets.push({ planet: 'south-node', gate: g, line: lineForLongitude(norm360(lonP + 180)) });
        }
      }
      if (lonD != null) {
        const g = gateForLongitude(norm360(lonD + 180));
        if (g) {
          activeGates.add(g);
          designPlanets.push({ planet: 'south-node', gate: g, line: lineForLongitude(norm360(lonD + 180)) });
        }
      }
    }
  }

  const sunLonP = getSwissLongitude(SE_SUN, jdP);
  const sunLonD = getSwissLongitude(SE_SUN, jdD);
  if (sunLonP != null) {
    const g = gateForLongitude(norm360(sunLonP + 180));
    if (g) {
      activeGates.add(g);
      personalityPlanets.push({ planet: 'earth', gate: g, line: lineForLongitude(norm360(sunLonP + 180)) });
    }
  }
  if (sunLonD != null) {
    const g = gateForLongitude(norm360(sunLonD + 180));
    if (g) {
      activeGates.add(g);
      designPlanets.push({ planet: 'earth', gate: g, line: lineForLongitude(norm360(sunLonD + 180)) });
    }
  }

  // Stille Flüsterer: Chiron & Lilith — nur anzeigen, kein Einfluss auf activeGates
  for (const planet of silentPlanets) {
    const lonP = getSwissLongitude(planet, jdP);
    const lonD = getSwissLongitude(planet, jdD);
    const key = PLANET_ID_TO_KEY[planet];
    if (lonP != null) {
      const g = gateForLongitude(lonP);
      if (g) personalityPlanets.push({ planet: key, gate: g, line: lineForLongitude(lonP), silent: true });
    }
    if (lonD != null) {
      const g = gateForLongitude(lonD);
      if (g) designPlanets.push({ planet: key, gate: g, line: lineForLongitude(lonD), silent: true });
    }
  }

  const centers = {};
  for (const c of CENTER_KEYS) centers[c] = false;

  const activeChannels = [];
  const seenChannels = new Set();
  for (const ch of CHANNELS) {
    const [g1, g2] = ch.gates;
    const key = [g1, g2].sort((a, b) => a - b).join("-");
    if (seenChannels.has(key)) continue;
    if (activeGates.has(g1) && activeGates.has(g2)) {
      seenChannels.add(key);
      centers[ch.centers[0]] = true;
      centers[ch.centers[1]] = true;
      activeChannels.push(ch);
    }
  }

  const profileLine1 = sunLonP != null ? lineForLongitude(sunLonP) : 1;
  const profileLine2 = sunLonD != null ? lineForLongitude(sunLonD) : 1;
  const profile = `${profileLine1}/${profileLine2}`;

  const sp = centers["solar-plexus"];
  const sacral = centers["sacral"];
  const throat = centers["throat"];
  const heart = centers["heart"];
  const spleen = centers["spleen"];
  const g = centers["g"];
  const allUndefined = Object.values(centers).every((v) => !v);

  function isSacralConnectedToThroat(channels) {
    const adj = {};
    for (const ch of channels) {
      const [a, b] = ch.centers;
      if (!adj[a]) adj[a] = [];
      if (!adj[b]) adj[b] = [];
      adj[a].push(b);
      adj[b].push(a);
    }
    const visited = new Set();
    const queue = ["sacral"];
    visited.add("sacral");
    while (queue.length > 0) {
      const node = queue.shift();
      if (node === "throat") return true;
      for (const neighbor of (adj[node] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return false;
  }

  let type;
  if (allUndefined) {
    type = "Reflector";
  } else if (sacral) {
    type = isSacralConnectedToThroat(activeChannels) ? "Manifesting Generator" : "Generator";
  } else if (throat) {
    type = (sp || heart) ? "Manifestor" : "Projector";
  } else {
    type = "Projector";
  }

  let authority;
  if (type === "Reflector") authority = "Lunar";
  else if (sp) authority = "Emotional";
  else if (sacral) authority = "Sacral";
  else if (spleen) authority = "Splenic";
  else if (heart) authority = "Ego";
  else if (g && throat) authority = "Self-Projected";
  else authority = "Mental";

  function countConnectedComponents(channels) {
    if (channels.length === 0) return 0;
    const adj = {};
    for (const ch of channels) {
      const [a, b] = ch.centers;
      if (!adj[a]) adj[a] = [];
      if (!adj[b]) adj[b] = [];
      adj[a].push(b);
      adj[b].push(a);
    }
    const nodes = Object.keys(adj);
    const visited = new Set();
    let components = 0;
    for (const start of nodes) {
      if (visited.has(start)) continue;
      components++;
      const queue = [start];
      visited.add(start);
      while (queue.length > 0) {
        const node = queue.shift();
        for (const neighbor of adj[node]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
    return components;
  }

  const components = countConnectedComponents(activeChannels);
  let definition;
  if (components === 0) definition = "None";
  else if (components === 1) definition = "Single";
  else if (components === 2) definition = "Split Definition";
  else if (components === 3) definition = "Triple Split";
  else definition = "Quadruple Split";

  const gatesList = Array.from(activeGates).map((num) => {
    const gateInfo = GATES.find((gi) => gi.number === num);
    return { number: num, name: gateInfo?.name || `Gate ${num}` };
  });

  const channelsList = activeChannels.map((ch) => {
    const key = [...ch.gates].sort((a, b) => a - b).join("-");
    return { gates: ch.gates, name: CHANNEL_NAMES[key] || key };
  });

  const incarnationCross = getIncarnationCross(sunLonP, sunLonD, profile);

  console.log(`[Chart] Swiss Ephemeris – Typ=${type}, Profil=${profile}, Autorität=${authority}`);
  console.log(`[Chart] Aktive Gates: ${Array.from(activeGates).sort((a, b) => a - b).join(", ")}`);
  console.log(`[Chart] Channels: ${channelsList.map(c => c.gates.join("-")).join(", ")}`);
  console.log(`[Chart] Zentren: ${Object.entries(centers).filter(([, v]) => v).map(([k]) => k).join(", ")}`);
  if (incarnationCross) console.log(`[Chart] Inkarnationskreuz: ${incarnationCross.name} (${incarnationCross.gates.personalitySun}/${incarnationCross.gates.personalityEarth} | ${incarnationCross.gates.designSun}/${incarnationCross.gates.designEarth})`);

  const strategyMap = {
    "Generator": "Warten und antworten",
    "Manifesting Generator": "Warten und antworten (informieren)",
    "Manifestor": "Informieren",
    "Projector": "Warten auf Einladung",
    "Reflector": "Warten – einen vollen Mondzyklus (28–29 Tage)",
  };

  // Sortierung nach HD-Standard-Reihenfolge
  const PLANET_ORDER = ['sun', 'earth', 'north-node', 'south-node', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'lilith'];
  const sortPlanets = (arr) => arr.slice().sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet));

  // Objekt-Format mit Underscores (für Frontend-Kompatibilität)
  const toObjectMap = (arr) => Object.fromEntries(
    arr.map(({ planet, gate, line, silent }) => [planet.replace(/-/g, '_'), { gate, line, ...(silent && { silent: true }) }])
  );

  const sortedP = sortPlanets(personalityPlanets);
  const sortedD = sortPlanets(designPlanets);

  return {
    type,
    profile,
    authority,
    strategy: strategyMap[type] || "Warten und antworten",
    definition,
    incarnationCross,
    centers,
    channels: channelsList,
    gates: gatesList,
    // Objekt-Format (Frontend erwartet personality.planets.sun etc.)
    personality: { planets: toObjectMap(sortedP) },
    design: { planets: toObjectMap(sortedD) },
    // Array-Format (Backward-Kompatibilität)
    personalityPlanets: sortedP,
    designPlanets: sortedD,
  };
}

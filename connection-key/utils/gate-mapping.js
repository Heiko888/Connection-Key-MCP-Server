/**
 * Human Design Gate-Mapping
 * Exakte GATE_SPANS aus der Ekliptik (Swiss Ephemeris Koordinatensystem)
 * Jedes Gate = 5.625° — 64 Gates = 360°
 */

export const GATE_SPANS = [
  { gate: 25, start: 358.25, span: 5.625 }, { gate: 17, start: 3.875, span: 5.625 },
  { gate: 21, start: 9.5,    span: 5.625 }, { gate: 51, start: 15.125, span: 5.625 },
  { gate: 42, start: 20.75,  span: 5.625 }, { gate: 3,  start: 26.375, span: 5.625 },
  { gate: 27, start: 32,     span: 5.625 }, { gate: 24, start: 37.625, span: 5.625 },
  { gate: 2,  start: 43.25,  span: 5.625 }, { gate: 23, start: 48.875, span: 5.625 },
  { gate: 8,  start: 54.5,   span: 5.625 }, { gate: 20, start: 60.125, span: 5.625 },
  { gate: 16, start: 65.75,  span: 5.625 }, { gate: 35, start: 71.375, span: 5.625 },
  { gate: 45, start: 77,     span: 5.625 }, { gate: 12, start: 82.625, span: 5.625 },
  { gate: 15, start: 88.25,  span: 5.625 }, { gate: 52, start: 93.875, span: 5.625 },
  { gate: 39, start: 99.5,   span: 5.625 }, { gate: 53, start: 105.125, span: 5.625 },
  { gate: 62, start: 110.75, span: 5.625 }, { gate: 56, start: 116.375, span: 5.625 },
  { gate: 31, start: 122,    span: 5.625 }, { gate: 33, start: 127.625, span: 5.625 },
  { gate: 7,  start: 133.25, span: 5.625 }, { gate: 4,  start: 138.875, span: 5.625 },
  { gate: 29, start: 144.5,  span: 5.625 }, { gate: 59, start: 150.125, span: 5.625 },
  { gate: 40, start: 155.75, span: 5.625 }, { gate: 64, start: 161.375, span: 5.625 },
  { gate: 47, start: 167,    span: 5.625 }, { gate: 6,  start: 172.625, span: 5.625 },
  { gate: 46, start: 178.25, span: 5.625 }, { gate: 18, start: 183.875, span: 5.625 },
  { gate: 48, start: 189.5,  span: 5.625 }, { gate: 57, start: 195.125, span: 5.625 },
  { gate: 32, start: 200.75, span: 5.625 }, { gate: 50, start: 206.375, span: 5.625 },
  { gate: 28, start: 212,    span: 5.625 }, { gate: 44, start: 217.625, span: 5.625 },
  { gate: 1,  start: 223.25, span: 5.625 }, { gate: 43, start: 228.875, span: 5.625 },
  { gate: 14, start: 234.5,  span: 5.625 }, { gate: 34, start: 240.125, span: 5.625 },
  { gate: 9,  start: 245.75, span: 5.625 }, { gate: 5,  start: 251.375, span: 5.625 },
  { gate: 26, start: 257,    span: 5.625 }, { gate: 11, start: 262.625, span: 5.625 },
  { gate: 10, start: 268.25, span: 5.625 }, { gate: 58, start: 273.875, span: 5.625 },
  { gate: 38, start: 279.5,  span: 5.625 }, { gate: 54, start: 285.125, span: 5.625 },
  { gate: 61, start: 290.75, span: 5.625 }, { gate: 60, start: 296.375, span: 5.625 },
  { gate: 41, start: 302,    span: 5.625 }, { gate: 19, start: 307.625, span: 5.625 },
  { gate: 13, start: 313.25, span: 5.625 }, { gate: 49, start: 318.875, span: 5.625 },
  { gate: 30, start: 324.5,  span: 5.625 }, { gate: 55, start: 330.125, span: 5.625 },
  { gate: 37, start: 335.75, span: 5.625 }, { gate: 63, start: 341.375, span: 5.625 },
  { gate: 22, start: 347,    span: 5.625 }, { gate: 36, start: 352.625, span: 5.625 },
];

export function norm360(x) {
  const y = x % 360;
  return y < 0 ? y + 360 : y;
}

export function gateForLongitude(longitude) {
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

export function lineForLongitude(longitude) {
  const gate = gateForLongitude(longitude);
  if (!gate) return 1;
  const g = GATE_SPANS.find((x) => x.gate === gate);
  if (!g) return 1;
  const lon = norm360(longitude);
  const pos = lon >= g.start ? lon - g.start : lon + (360 - g.start);
  return Math.min(6, Math.max(1, Math.floor((pos / g.span) * 6) + 1));
}

export function dateToJD(date) {
  return date.getTime() / 86400000.0 + 2440587.5;
}

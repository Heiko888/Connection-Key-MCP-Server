/**
 * Server-seitiger Bodygraph-Renderer (.138) — SVG → PNG.
 *
 * Geometrie 1:1 portiert von .167 `frontend/lib/hd-bodygraph/{data,buildDefinedState}.ts`
 * (Single Source dort; bei Geometrie-Änderungen beide Stellen pflegen — mittelfristig nach
 * @ck/shared auslagern). Erzeugt einen chart-spezifischen Bodygraph aus `chart_data`
 * (definierte Zentren, aktive Tore, Kanäle) für das Reading→Video (v8 Phase 2).
 */

// ── Geometrie (viewBox 0 0 1000 1800) ────────────────────────────────────────
const CENTERS = [
  { id: "HEAD",   shape: "triangle", x: 500, y: 120,  w: 175, h: 155, rotation: 0 },
  { id: "AJNA",   shape: "triangle", x: 500, y: 345,  w: 195, h: 165, rotation: 180 },
  { id: "THROAT", shape: "square",   x: 500, y: 590,  w: 210, h: 148, rotation: 0 },
  { id: "G",      shape: "diamond",  x: 500, y: 840,  w: 228, h: 210, rotation: 0 },
  { id: "HEART",  shape: "triangle", x: 742, y: 840,  w: 162, h: 142, rotation: 90 },
  { id: "SACRAL", shape: "square",   x: 500, y: 1130, w: 232, h: 172, rotation: 0 },
  { id: "SPLEEN", shape: "triangle", x: 254, y: 940,  w: 162, h: 142, rotation: 270 },
  { id: "SOLAR",  shape: "triangle", x: 742, y: 1040, w: 162, h: 142, rotation: 90 },
  { id: "ROOT",   shape: "square",   x: 500, y: 1430, w: 252, h: 172, rotation: 0 },
];

const CENTER_COLORS = {
  HEAD: "#FFD43B", AJNA: "#4ECB71", THROAT: "#64B5F6", G: "#FFB74D", HEART: "#EF5350",
  SOLAR: "#FF7043", SACRAL: "#FF3D00", SPLEEN: "#AB47BC", ROOT: "#8D6E63",
};

const GATES = [
  { id: 64, x: 447, y: 178 }, { id: 61, x: 500, y: 178 }, { id: 63, x: 553, y: 178 },
  { id: 47, x: 448, y: 286 }, { id: 24, x: 500, y: 286 }, { id: 4, x: 552, y: 286 },
  { id: 17, x: 476, y: 368 }, { id: 11, x: 500, y: 368 }, { id: 43, x: 524, y: 368 },
  { id: 62, x: 447, y: 533 }, { id: 56, x: 500, y: 533 }, { id: 23, x: 553, y: 533 },
  { id: 8, x: 447, y: 649 }, { id: 33, x: 481, y: 649 }, { id: 31, x: 519, y: 649 },
  { id: 20, x: 553, y: 649 }, { id: 16, x: 414, y: 590 }, { id: 45, x: 586, y: 553 },
  { id: 35, x: 586, y: 590 }, { id: 12, x: 586, y: 627 },
  { id: 1, x: 480, y: 770 }, { id: 13, x: 500, y: 764 }, { id: 7, x: 520, y: 770 },
  { id: 10, x: 555, y: 800 }, { id: 25, x: 588, y: 840 }, { id: 2, x: 480, y: 910 },
  { id: 15, x: 500, y: 917 }, { id: 46, x: 520, y: 910 },
  { id: 21, x: 693, y: 800 }, { id: 51, x: 693, y: 832 }, { id: 40, x: 693, y: 862 }, { id: 26, x: 693, y: 893 },
  { id: 14, x: 463, y: 1062 }, { id: 5, x: 500, y: 1062 }, { id: 29, x: 537, y: 1062 },
  { id: 34, x: 597, y: 1100 }, { id: 59, x: 597, y: 1148 }, { id: 27, x: 403, y: 1130 },
  { id: 3, x: 463, y: 1200 }, { id: 42, x: 500, y: 1200 }, { id: 9, x: 537, y: 1200 },
  { id: 44, x: 308, y: 880 }, { id: 48, x: 308, y: 908 }, { id: 57, x: 308, y: 940 }, { id: 50, x: 308, y: 972 },
  { id: 32, x: 278, y: 962 }, { id: 28, x: 255, y: 952 }, { id: 18, x: 236, y: 940 },
  { id: 6, x: 692, y: 986 }, { id: 36, x: 692, y: 1002 }, { id: 22, x: 692, y: 1018 }, { id: 37, x: 692, y: 1090 },
  { id: 49, x: 710, y: 1088 }, { id: 55, x: 728, y: 1076 }, { id: 30, x: 748, y: 1062 },
  { id: 60, x: 463, y: 1365 }, { id: 53, x: 500, y: 1365 }, { id: 52, x: 537, y: 1365 },
  { id: 54, x: 393, y: 1365 }, { id: 38, x: 383, y: 1382 }, { id: 58, x: 380, y: 1400 },
  { id: 41, x: 607, y: 1365 }, { id: 39, x: 617, y: 1382 }, { id: 19, x: 620, y: 1400 },
];
const GATE_POS = Object.fromEntries(GATES.map((g) => [g.id, g]));

const CHANNELS = [
  [1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],
  [11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],
  [23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],
  [35,36],[37,40],[39,55],[42,53],[47,64],
];

const CENTER_KEY_TO_ID = {
  head: "HEAD", kopf: "HEAD", krone: "HEAD", crown: "HEAD",
  ajna: "AJNA",
  throat: "THROAT", kehle: "THROAT", hals: "THROAT",
  g: "G", "g-center": "G", "g-zentrum": "G", selbst: "G", self: "G",
  heart: "HEART", "heart/ego": "HEART", herz: "HEART", "herz/ego": "HEART", ego: "HEART", will: "HEART",
  sacral: "SACRAL", sakral: "SACRAL",
  spleen: "SPLEEN", milz: "SPLEEN",
  "solar-plexus": "SOLAR", "solar_plexus": "SOLAR", "solar plexus": "SOLAR", solarplexus: "SOLAR",
  solar: "SOLAR", emotional: "SOLAR",
  root: "ROOT", wurzel: "ROOT",
};
const CENTER_LABEL_DE = {
  HEAD: "Kopf", AJNA: "Ajna", THROAT: "Kehle", G: "G-Zentrum", HEART: "Herz",
  SACRAL: "Sakral", SPLEEN: "Milz", SOLAR: "Solarplexus", ROOT: "Wurzel",
};
const centerId = (key) => CENTER_KEY_TO_ID[String(key).trim().toLowerCase()] || null;

/** Aus beliebigem chart_data → { centers:Set, gates:Set, channels:Set("a-b") }. */
export function buildDefinedState(chart) {
  const centers = new Set(), gates = new Set(), channels = new Set();
  if (!chart || typeof chart !== "object") return { centers, gates, channels };

  const rawCenters = chart.definedCenters || chart.centers || chart.defined_centers || null;
  if (Array.isArray(rawCenters)) {
    for (const item of rawCenters) {
      if (typeof item === "object" && item && item.defined === false) continue;
      const name = typeof item === "string" ? item : (item?.name || item?.id || "");
      const id = centerId(name);
      if (id) centers.add(id);
    }
  } else if (rawCenters && typeof rawCenters === "object") {
    for (const [key, val] of Object.entries(rawCenters)) {
      const truthy = val === true || val === "definiert" || val === "defined" ||
        (typeof val === "object" && val !== null && (val.defined === true || val.status === "definiert"));
      if (!truthy) continue;
      const id = centerId(key);
      if (id) centers.add(id);
    }
  }

  const rawGates = chart.gates || chart.activeGates || [];
  if (Array.isArray(rawGates)) {
    for (const g of rawGates) {
      const id = typeof g === "number" ? g : (g?.number ?? g?.id ?? g?.gate);
      if (typeof id === "number" && id >= 1 && id <= 64) gates.add(id);
    }
  }

  const backendChannels = Array.isArray(chart.channels) ? chart.channels : null;
  if (backendChannels && backendChannels.length > 0) {
    for (const ch of backendChannels) {
      let pair;
      if (Array.isArray(ch?.gates)) pair = ch.gates;
      else if (typeof ch?.gate1 === "number" && typeof ch?.gate2 === "number") pair = [ch.gate1, ch.gate2];
      else if (typeof ch === "string") { const m = ch.match(/(\d+)\s*-\s*(\d+)/); if (m) pair = [Number(m[1]), Number(m[2])]; }
      if (!pair || pair.length !== 2) continue;
      const [a, b] = pair.map(Number).sort((x, y) => x - y);
      channels.add(`${a}-${b}`);
    }
  } else {
    for (const [a, b] of CHANNELS) if (gates.has(a) && gates.has(b)) channels.add(`${a}-${b}`);
  }
  return { centers, gates, channels };
}

/** Kurze deutsche Zusammenfassung der Definition (für die Bodygraph-Narration). */
export function summarizeDefinition(chart) {
  const { centers, channels, gates } = buildDefinedState(chart);
  const centerLabels = [...centers].map((id) => CENTER_LABEL_DE[id] || id);
  const chDe = [...channels].map((c) => `Tor ${c.replace("-", " und Tor ")}`);
  return { centerLabels, channelLabels: [...channels], channelSpoken: chDe, gateCount: gates.size, centerCount: centers.size };
}

function centerPoints(c) {
  const { x, y, w, h, shape, rotation = 0 } = c;
  if (shape === "square") return `M${x - w / 2},${y - h / 2} h${w} v${h} h${-w} Z`;
  if (shape === "diamond") return `M${x},${y - h / 2} L${x + w / 2},${y} L${x},${y + h / 2} L${x - w / 2},${y} Z`;
  // triangle
  if (rotation === 180) return `M${x},${y + h / 2} L${x - w / 2},${y - h / 2} L${x + w / 2},${y - h / 2} Z`;
  if (rotation === 90)  return `M${x + h / 2},${y} L${x - h / 2},${y - w / 2} L${x - h / 2},${y + w / 2} Z`;
  if (rotation === 270) return `M${x - h / 2},${y} L${x + h / 2},${y - w / 2} L${x + h / 2},${y + w / 2} Z`;
  return `M${x},${y - h / 2} L${x - w / 2},${y + h / 2} L${x + w / 2},${y + h / 2} Z`; // rotation 0
}

/** Innerer Bodygraph-Markup (Koordinatenraum 1000x1800), ohne <svg>-Wrapper —
 *  einbettbar via <g transform="…"> auf eine größere Leinwand. */
export function buildBodygraphInner(chart) {
  const { centers, gates, channels } = buildDefinedState(chart);
  const parts = [];

  // Kanäle (zuerst, hinter den Zentren)
  for (const [a, b] of CHANNELS) {
    const pa = GATE_POS[a], pb = GATE_POS[b];
    if (!pa || !pb) continue;
    const on = channels.has(`${a}-${b}`);
    parts.push(`<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" stroke="${on ? "#F5A623" : "#2A3140"}" stroke-width="${on ? 7 : 3}" stroke-linecap="round"/>`);
  }

  // Zentren
  for (const c of CENTERS) {
    const on = centers.has(c.id);
    const fill = on ? CENTER_COLORS[c.id] : "#161C28";
    parts.push(`<path d="${centerPoints(c)}" fill="${fill}" fill-opacity="${on ? 0.85 : 1}" stroke="#3A4456" stroke-width="3"/>`);
  }

  // Tore (Punkte + Nummer)
  for (const g of GATES) {
    const on = gates.has(g.id);
    parts.push(`<circle cx="${g.x}" cy="${g.y}" r="13" fill="${on ? "#FFFFFF" : "#0B0F19"}" stroke="${on ? "#F5A623" : "#3A4456"}" stroke-width="2"/>`);
    parts.push(`<text x="${g.x}" y="${g.y + 4}" font-family="DejaVu Sans, sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="${on ? "#0B0F19" : "#5A6577"}">${g.id}</text>`);
  }

  return parts.join("");
}

/** Eigenständiger Bodygraph als SVG-String (viewBox 1000x1800). */
export function buildBodygraphSVG(chart, { bg = "#0B0F19" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1800" width="1000" height="1800">`
    + `<rect width="1000" height="1800" fill="${bg}"/>${buildBodygraphInner(chart)}</svg>`;
}

/** Maße für die Einbettung des 1000x1800-Bodygraphs auf eine WxH-Leinwand (höhenzentriert). */
export function bodygraphFitTransform(width, height, fillRatio = 0.92) {
  const scale = (height * fillRatio) / 1800;
  const gw = 1000 * scale, gh = 1800 * scale;
  return { scale, tx: (width - gw) / 2, ty: (height - gh) / 2 };
}

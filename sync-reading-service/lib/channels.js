/**
 * Kanonische HD-Daten — 36 Kanäle + Tor-zu-Zentrum Mapping.
 * Single Source of Truth für deterministische Verbindungs-Berechnung.
 */

export const CENTER_DE = {
  head: 'Kopf',
  ajna: 'Ajna',
  throat: 'Kehle',
  g: 'G-Zentrum',
  heart: 'Herz/Ego',
  solar_plexus: 'Solarplexus',
  spleen: 'Milz',
  sacral: 'Sakral',
  root: 'Wurzel',
};

const C = {
  HEAD: 'head',
  AJNA: 'ajna',
  THROAT: 'throat',
  G: 'g',
  HEART: 'heart',
  SP: 'solar_plexus',
  SPLEEN: 'spleen',
  SACRAL: 'sacral',
  ROOT: 'root',
};

export const CHANNELS = [
  // Individual
  { id: '1-8',   gates: [1, 8],   name_en: 'Inspiration',     name_de: 'Inspiration',         centers: [C.G, C.THROAT] },
  { id: '2-14',  gates: [2, 14],  name_en: 'The Beat',         name_de: 'Schlag',              centers: [C.G, C.SACRAL] },
  { id: '3-60',  gates: [3, 60],  name_en: 'Mutation',         name_de: 'Mutation',            centers: [C.SACRAL, C.ROOT] },
  { id: '7-31',  gates: [7, 31],  name_en: 'Alpha',            name_de: 'Alpha',               centers: [C.G, C.THROAT] },
  { id: '10-20', gates: [10, 20], name_en: 'Awakening',        name_de: 'Erwachen',            centers: [C.G, C.THROAT] },
  { id: '10-34', gates: [10, 34], name_en: 'Exploration',      name_de: 'Erforschung',         centers: [C.G, C.SACRAL] },
  { id: '10-57', gates: [10, 57], name_en: 'Perfected Form',   name_de: 'Vollkommene Form',    centers: [C.G, C.SPLEEN] },
  { id: '13-33', gates: [13, 33], name_en: 'The Prodigal',     name_de: 'Heimkehrer',          centers: [C.G, C.THROAT] },
  { id: '20-34', gates: [20, 34], name_en: 'Charisma',         name_de: 'Charisma',            centers: [C.THROAT, C.SACRAL] },
  { id: '20-57', gates: [20, 57], name_en: 'Brainwave',        name_de: 'Gehirnwelle',         centers: [C.THROAT, C.SPLEEN] },
  { id: '23-43', gates: [23, 43], name_en: 'Structuring',      name_de: 'Strukturierung',      centers: [C.AJNA, C.THROAT] },
  { id: '25-51', gates: [25, 51], name_en: 'Initiation',       name_de: 'Initiation',          centers: [C.G, C.HEART] },
  { id: '28-38', gates: [28, 38], name_en: 'Struggle',         name_de: 'Kampfgeist',          centers: [C.SPLEEN, C.ROOT] },
  { id: '34-57', gates: [34, 57], name_en: 'Power',            name_de: 'Macht',               centers: [C.SACRAL, C.SPLEEN] },
  { id: '39-55', gates: [39, 55], name_en: 'Emoting',          name_de: 'Emotionalität',       centers: [C.ROOT, C.SP] },

  // Tribal
  { id: '6-59',  gates: [6, 59],  name_en: 'Mating',           name_de: 'Intimität',           centers: [C.SP, C.SACRAL] },
  { id: '18-58', gates: [18, 58], name_en: 'Judgment',         name_de: 'Urteil',              centers: [C.SPLEEN, C.ROOT] },
  { id: '19-49', gates: [19, 49], name_en: 'Synthesis',        name_de: 'Synthese',            centers: [C.ROOT, C.SP] },
  { id: '21-45', gates: [21, 45], name_en: 'Money',            name_de: 'Geldlinie',           centers: [C.HEART, C.THROAT] },
  { id: '26-44', gates: [26, 44], name_en: 'Surrender',        name_de: 'Hingabe',             centers: [C.HEART, C.SPLEEN] },
  { id: '27-50', gates: [27, 50], name_en: 'Preservation',     name_de: 'Bewahrung',           centers: [C.SACRAL, C.SPLEEN] },
  { id: '32-54', gates: [32, 54], name_en: 'Transformation',   name_de: 'Transformation',      centers: [C.SPLEEN, C.ROOT] },
  { id: '37-40', gates: [37, 40], name_en: 'Community',        name_de: 'Gemeinschaft',        centers: [C.SP, C.HEART] },

  // Collective — Logic
  { id: '4-63',  gates: [4, 63],  name_en: 'Logic',            name_de: 'Logik',               centers: [C.AJNA, C.HEAD] },
  { id: '9-52',  gates: [9, 52],  name_en: 'Concentration',    name_de: 'Konzentration',       centers: [C.SACRAL, C.ROOT] },
  { id: '11-56', gates: [11, 56], name_en: 'Curiosity',        name_de: 'Neugier',             centers: [C.AJNA, C.THROAT] },
  { id: '16-48', gates: [16, 48], name_en: 'Wavelength',       name_de: 'Wellenlänge',         centers: [C.THROAT, C.SPLEEN] },
  { id: '17-62', gates: [17, 62], name_en: 'Acceptance',       name_de: 'Akzeptanz',           centers: [C.AJNA, C.THROAT] },
  { id: '24-61', gates: [24, 61], name_en: 'Awareness',        name_de: 'Achtsamkeit',         centers: [C.HEAD, C.AJNA] },
  { id: '42-53', gates: [42, 53], name_en: 'Maturation',       name_de: 'Reifung',             centers: [C.SACRAL, C.ROOT] },

  // Collective — Abstract
  { id: '5-15',  gates: [5, 15],  name_en: 'Rhythm',           name_de: 'Rhythmus',            centers: [C.SACRAL, C.G] },
  { id: '12-22', gates: [12, 22], name_en: 'Openness',         name_de: 'Offenheit',           centers: [C.THROAT, C.SP] },
  { id: '29-46', gates: [29, 46], name_en: 'Discovery',        name_de: 'Entdeckung',          centers: [C.SACRAL, C.G] },
  { id: '30-41', gates: [30, 41], name_en: 'Recognition',      name_de: 'Erkennung',           centers: [C.ROOT, C.SP] },
  { id: '35-36', gates: [35, 36], name_en: 'Transitoriness',   name_de: 'Vergänglichkeit',     centers: [C.THROAT, C.SP] },
  { id: '47-64', gates: [47, 64], name_en: 'Abstraction',      name_de: 'Abstraktion',         centers: [C.AJNA, C.HEAD] },
];

export const GATE_TO_CENTER = (() => {
  const map = {};
  for (const ch of CHANNELS) {
    map[ch.gates[0]] = ch.centers[0];
    map[ch.gates[1]] = ch.centers[1];
  }
  return map;
})();

export function centerLabel(center) {
  return CENTER_DE[center] || center;
}

export function channelCentersLabel(ch) {
  return ch.centers.map(centerLabel).join(' ↔ ');
}

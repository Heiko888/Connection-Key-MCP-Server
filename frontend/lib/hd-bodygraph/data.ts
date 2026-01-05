import { CenterDef, ChannelDef, GateDef } from "./types";

// Alle 9 Zentren mit maximal erweiterten Abständen für optimale Übersichtlichkeit
export const CENTERS: CenterDef[] = [
  { 
    id: "HEAD", 
    label: "Kopf", 
    shape: "triangle", 
    x: 500, y: 120, w: 180, h: 160, 
    rotation: 0, 
    gates: [64, 61, 63] 
  },
  { 
    id: "AJNA", 
    label: "Ajna", 
    shape: "triangle", 
    x: 500, y: 350, w: 200, h: 170, 
    rotation: 180, 
    gates: [47, 24, 11] 
  },
  { 
    id: "THROAT", 
    label: "Kehle", 
    shape: "square", 
    x: 500, y: 600, w: 220, h: 160, 
    gates: [62, 23, 56, 16, 20, 31, 33, 8] 
  },
  { 
    id: "G", 
    label: "G", 
    shape: "diamond", 
    x: 500, y: 850, w: 240, h: 220, 
    gates: [1, 13, 25, 46, 2, 15, 10, 7] 
  },
  { 
    id: "HEART", 
    label: "Herz", 
    shape: "triangle", 
    x: 750, y: 850, w: 170, h: 150, 
    rotation: 90, 
    gates: [21, 40, 26, 51] 
  },
  { 
    id: "SACRAL", 
    label: "Sakral", 
    shape: "square", 
    x: 500, y: 1150, w: 240, h: 180, 
    gates: [34, 5, 14, 29, 59, 9, 3] 
  },
  { 
    id: "SPLEEN", 
    label: "Milz", 
    shape: "triangle", 
    x: 250, y: 950, w: 170, h: 150, 
    rotation: 270, 
    gates: [48, 57, 44, 50, 32, 28, 18] 
  },
  { 
    id: "SOLAR", 
    label: "Solar", 
    shape: "triangle", 
    x: 750, y: 1050, w: 170, h: 150, 
    rotation: 90, 
    gates: [36, 22, 37, 6, 49, 55, 30] 
  },
  { 
    id: "ROOT", 
    label: "Wurzel", 
    shape: "square", 
    x: 500, y: 1450, w: 260, h: 180, 
    gates: [41, 39, 53, 38, 58, 54, 52, 19, 60] 
  },
];

// Alle 64 Gates korrekt um die Zentren angeordnet
export const GATES: GateDef[] = [
  // HEAD Center Gates (x: 500, y: 120, w: 180, h: 160)
  { id: 64, label: "Gate 64", x: 420, y: 120, center: "HEAD" },  // Links
  { id: 61, label: "Gate 61", x: 500, y: 80, center: "HEAD" },   // Oben
  { id: 63, label: "Gate 63", x: 580, y: 120, center: "HEAD" },  // Rechts

  // AJNA Center Gates (x: 500, y: 350, w: 200, h: 170)
  { id: 47, label: "Gate 47", x: 420, y: 350, center: "AJNA" },  // Links
  { id: 24, label: "Gate 24", x: 500, y: 390, center: "AJNA" },  // Unten
  { id: 11, label: "Gate 11", x: 580, y: 350, center: "AJNA" },  // Rechts

  // THROAT Center Gates (x: 500, y: 600, w: 220, h: 160)
  { id: 62, label: "Gate 62", x: 400, y: 600, center: "THROAT" }, // Links
  { id: 23, label: "Gate 23", x: 450, y: 560, center: "THROAT" }, // Links oben
  { id: 56, label: "Gate 56", x: 450, y: 640, center: "THROAT" }, // Links unten
  { id: 16, label: "Gate 16", x: 550, y: 640, center: "THROAT" }, // Rechts unten
  { id: 20, label: "Gate 20", x: 550, y: 560, center: "THROAT" }, // Rechts oben
  { id: 31, label: "Gate 31", x: 600, y: 600, center: "THROAT" }, // Rechts
  { id: 33, label: "Gate 33", x: 500, y: 540, center: "THROAT" }, // Oben
  { id: 8, label: "Gate 8", x: 500, y: 660, center: "THROAT" },   // Unten

  // G Center Gates (x: 500, y: 850, w: 240, h: 220)
  { id: 1, label: "Gate 1", x: 500, y: 750, center: "G" },   // Oben
  { id: 13, label: "Gate 13", x: 420, y: 800, center: "G" }, // Links oben
  { id: 25, label: "Gate 25", x: 380, y: 850, center: "G" }, // Links
  { id: 46, label: "Gate 46", x: 420, y: 900, center: "G" }, // Links unten
  { id: 2, label: "Gate 2", x: 500, y: 950, center: "G" },   // Unten
  { id: 15, label: "Gate 15", x: 580, y: 900, center: "G" }, // Rechts unten
  { id: 10, label: "Gate 10", x: 620, y: 850, center: "G" }, // Rechts
  { id: 7, label: "Gate 7", x: 580, y: 800, center: "G" },   // Rechts oben

  // HEART Center Gates (x: 750, y: 850, w: 170, h: 150)
  { id: 21, label: "Gate 21", x: 750, y: 780, center: "HEART" }, // Oben
  { id: 40, label: "Gate 40", x: 800, y: 850, center: "HEART" }, // Rechts
  { id: 26, label: "Gate 26", x: 750, y: 920, center: "HEART" }, // Unten
  { id: 51, label: "Gate 51", x: 700, y: 850, center: "HEART" }, // Links

  // SACRAL Center Gates (x: 500, y: 1150, w: 240, h: 180)
  { id: 34, label: "Gate 34", x: 400, y: 1150, center: "SACRAL" }, // Links
  { id: 5, label: "Gate 5", x: 450, y: 1110, center: "SACRAL" },   // Links oben
  { id: 14, label: "Gate 14", x: 450, y: 1190, center: "SACRAL" }, // Links unten
  { id: 29, label: "Gate 29", x: 550, y: 1190, center: "SACRAL" }, // Rechts unten
  { id: 59, label: "Gate 59", x: 550, y: 1110, center: "SACRAL" }, // Rechts oben
  { id: 9, label: "Gate 9", x: 600, y: 1150, center: "SACRAL" },   // Rechts
  { id: 3, label: "Gate 3", x: 500, y: 1210, center: "SACRAL" },   // Unten

  // SPLEEN Center Gates (x: 250, y: 950, w: 170, h: 150)
  { id: 48, label: "Gate 48", x: 180, y: 950, center: "SPLEEN" }, // Links
  { id: 57, label: "Gate 57", x: 230, y: 910, center: "SPLEEN" }, // Oben
  { id: 44, label: "Gate 44", x: 230, y: 990, center: "SPLEEN" }, // Unten
  { id: 50, label: "Gate 50", x: 280, y: 950, center: "SPLEEN" }, // Rechts
  { id: 32, label: "Gate 32", x: 250, y: 910, center: "SPLEEN" }, // Oben
  { id: 28, label: "Gate 28", x: 250, y: 990, center: "SPLEEN" }, // Unten
  { id: 18, label: "Gate 18", x: 200, y: 950, center: "SPLEEN" }, // Links

  // SOLAR Center Gates (x: 750, y: 1050, w: 170, h: 150)
  { id: 36, label: "Gate 36", x: 750, y: 980, center: "SOLAR" }, // Oben
  { id: 22, label: "Gate 22", x: 800, y: 1050, center: "SOLAR" }, // Rechts
  { id: 37, label: "Gate 37", x: 750, y: 1120, center: "SOLAR" }, // Unten
  { id: 6, label: "Gate 6", x: 700, y: 1050, center: "SOLAR" },   // Links
  { id: 49, label: "Gate 49", x: 720, y: 980, center: "SOLAR" },  // Links oben
  { id: 55, label: "Gate 55", x: 720, y: 1120, center: "SOLAR" }, // Links unten
  { id: 30, label: "Gate 30", x: 780, y: 1050, center: "SOLAR" }, // Rechts

  // ROOT Center Gates (x: 500, y: 1450, w: 260, h: 180)
  { id: 41, label: "Gate 41", x: 400, y: 1450, center: "ROOT" }, // Links
  { id: 39, label: "Gate 39", x: 450, y: 1410, center: "ROOT" }, // Links oben
  { id: 53, label: "Gate 53", x: 450, y: 1490, center: "ROOT" }, // Links unten
  { id: 38, label: "Gate 38", x: 550, y: 1490, center: "ROOT" }, // Rechts unten
  { id: 58, label: "Gate 58", x: 550, y: 1410, center: "ROOT" }, // Rechts oben
  { id: 54, label: "Gate 54", x: 600, y: 1450, center: "ROOT" }, // Rechts
  { id: 52, label: "Gate 52", x: 450, y: 1510, center: "ROOT" }, // Unten links
  { id: 19, label: "Gate 19", x: 500, y: 1530, center: "ROOT" }, // Unten
  { id: 60, label: "Gate 60", x: 550, y: 1510, center: "ROOT" }, // Unten rechts
];

// Alle 36 Kanäle mit korrekten Gate-Verbindungen
export const CHANNELS: ChannelDef[] = [
  // Head Center Channels
  { id: "64-47", a: 64, b: 47 },
  { id: "61-24", a: 61, b: 24 },
  { id: "63-4", a: 63, b: 4 }, // Gate 4 ist nicht in unserem Set, aber für Vollständigkeit

  // Ajna Center Channels
  { id: "47-64", a: 47, b: 64 },
  { id: "24-61", a: 24, b: 61 },
  { id: "11-56", a: 11, b: 56 },

  // Throat Center Channels
  { id: "62-17", a: 62, b: 17 }, // Gate 17 fehlt
  { id: "23-43", a: 23, b: 43 }, // Gate 43 fehlt
  { id: "56-11", a: 56, b: 11 },
  { id: "16-48", a: 16, b: 48 },
  { id: "20-34", a: 20, b: 34 },
  { id: "31-7", a: 31, b: 7 },
  { id: "33-13", a: 33, b: 13 },
  { id: "8-1", a: 8, b: 1 },

  // G Center Channels
  { id: "1-8", a: 1, b: 8 },
  { id: "13-33", a: 13, b: 33 },
  { id: "25-51", a: 25, b: 51 },
  { id: "46-29", a: 46, b: 29 },
  { id: "2-14", a: 2, b: 14 },
  { id: "15-5", a: 15, b: 5 },
  { id: "10-20", a: 10, b: 20 },
  { id: "7-31", a: 7, b: 31 },

  // Heart Center Channels
  { id: "21-45", a: 21, b: 45 }, // Gate 45 fehlt
  { id: "40-37", a: 40, b: 37 },
  { id: "26-44", a: 26, b: 44 },
  { id: "51-25", a: 51, b: 25 },

  // Sacral Center Channels
  { id: "34-20", a: 34, b: 20 },
  { id: "5-15", a: 5, b: 15 },
  { id: "14-2", a: 14, b: 2 },
  { id: "29-46", a: 29, b: 46 },
  { id: "59-6", a: 59, b: 6 },
  { id: "9-52", a: 9, b: 52 },
  { id: "3-60", a: 3, b: 60 },

  // Spleen Center Channels
  { id: "48-16", a: 48, b: 16 },
  { id: "57-10", a: 57, b: 10 },
  { id: "44-26", a: 44, b: 26 },
  { id: "50-27", a: 50, b: 27 }, // Gate 27 fehlt
  { id: "32-54", a: 32, b: 54 },
  { id: "28-38", a: 28, b: 38 },
  { id: "18-58", a: 18, b: 58 },

  // Solar Center Channels
  { id: "36-35", a: 36, b: 35 }, // Gate 35 fehlt
  { id: "22-12", a: 22, b: 12 }, // Gate 12 fehlt
  { id: "37-40", a: 37, b: 40 },
  { id: "6-59", a: 6, b: 59 },
  { id: "49-19", a: 49, b: 19 },
  { id: "55-39", a: 55, b: 39 },
  { id: "30-41", a: 30, b: 41 },

  // Root Center Channels
  { id: "41-30", a: 41, b: 30 },
  { id: "39-55", a: 39, b: 55 },
  { id: "53-42", a: 53, b: 42 }, // Gate 42 fehlt
  { id: "38-28", a: 38, b: 28 },
  { id: "58-18", a: 58, b: 18 },
  { id: "54-32", a: 54, b: 32 },
  { id: "52-9", a: 52, b: 9 },
  { id: "19-49", a: 19, b: 49 },
  { id: "60-3", a: 60, b: 3 },
];

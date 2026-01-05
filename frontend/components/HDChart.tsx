"use client";
import { useMemo, useState } from "react";
import { ChartData, CenterKey } from '@/types/chart';

/**
 * Vereinfachte HD Chart v2 — Übersichtliche Darstellung
 * - Reduzierte Linien für bessere Übersichtlichkeit
 * - Fokus auf definierte Centers und aktive Gates
 * - Klare, moderne Darstellung
 */

// ==== Layout-Vorgaben (Center-Positions) ====
const CENTER_LAYOUT: Record<CenterKey, { x: number; y: number; w: number; h: number; label: string }> = {
  head: { x: 300, y: 60, w: 120, h: 72, label: "Head" },
  ajna: { x: 300, y: 150, w: 140, h: 82, label: "Ajna" },
  throat: { x: 300, y: 245, w: 160, h: 86, label: "Throat" },
  g: { x: 300, y: 360, w: 136, h: 136, label: "G Center" },
  heart: { x: 430, y: 360, w: 92, h: 74, label: "Heart" },
  sacral: { x: 300, y: 510, w: 160, h: 106, label: "Sacral" },
  solar: { x: 470, y: 490, w: 126, h: 94, label: "Solar Plexus" },
  spleen: { x: 130, y: 490, w: 126, h: 94, label: "Spleen" },
  root: { x: 300, y: 640, w: 180, h: 92, label: "Root" },
};

// ==== Erweiterte Gate-Positions ====
const GATE_POINTS: Record<number, { x: number; y: number; planet?: string }> = {
  // Head Center (Gates 64, 61, 63)
  64: { x: 300, y: 78, planet: "☉" },
  61: { x: 262, y: 78, planet: "☽" },
  63: { x: 338, y: 78, planet: "☿" },
  
  // Ajna Center (Gates 47, 24, 4)
  47: { x: 262, y: 170, planet: "♂" },
  24: { x: 300, y: 168, planet: "♀" },
  4: { x: 338, y: 170, planet: "♃" },
  
  // Throat Center (Gates 62, 23, 56, 35, 12, 45, 33, 8, 20, 16, 31, 7, 43)
  62: { x: 264, y: 262, planet: "♄" },
  23: { x: 300, y: 262, planet: "♅" },
  56: { x: 336, y: 262, planet: "♆" },
  35: { x: 264, y: 242, planet: "♇" },
  12: { x: 300, y: 242, planet: "⚸" },
  45: { x: 336, y: 242, planet: "⚹" },
  33: { x: 264, y: 282, planet: "☊" },
  8: { x: 300, y: 282, planet: "☋" },
  20: { x: 300, y: 232, planet: "⚯" },
  16: { x: 300, y: 292, planet: "⚲" },
  31: { x: 264, y: 302, planet: "☉" },
  7: { x: 336, y: 302, planet: "☽" },
  43: { x: 300, y: 200, planet: "☿" },
  
  // G Center (Gates 1, 2, 7, 13, 10, 15, 25, 46)
  1: { x: 300, y: 352, planet: "☿" },
  2: { x: 300, y: 396, planet: "♂" },
  10: { x: 262, y: 412, planet: "♀" },
  13: { x: 338, y: 368, planet: "♃" },
  15: { x: 338, y: 412, planet: "♄" },
  25: { x: 300, y: 372, planet: "♅" },
  46: { x: 300, y: 376, planet: "♆" },
  
  // Heart Center (Gates 21, 26, 40, 51)
  21: { x: 430, y: 352, planet: "♇" },
  26: { x: 430, y: 384, planet: "⚸" },
  40: { x: 452, y: 372, planet: "⚹" },
  51: { x: 408, y: 372, planet: "☊" },
  
  // Sacral Center (Gates 34, 5, 14, 29, 9, 3, 42, 27)
  34: { x: 300, y: 520, planet: "☋" },
  5: { x: 260, y: 540, planet: "⚯" },
  14: { x: 340, y: 540, planet: "⚲" },
  29: { x: 260, y: 520, planet: "☉" },
  9: { x: 340, y: 520, planet: "☽" },
  3: { x: 260, y: 560, planet: "☿" },
  42: { x: 340, y: 560, planet: "♂" },
  27: { x: 300, y: 540, planet: "♀" },
  
  // Solar Plexus Center (Gates 36, 22, 37, 6, 49, 30, 55, 39, 59)
  36: { x: 470, y: 478, planet: "♃" },
  22: { x: 494, y: 506, planet: "♄" },
  37: { x: 470, y: 522, planet: "♅" },
  6: { x: 446, y: 506, planet: "♆" },
  49: { x: 494, y: 478, planet: "♇" },
  30: { x: 446, y: 478, planet: "⚸" },
  55: { x: 494, y: 522, planet: "⚹" },
  39: { x: 446, y: 522, planet: "☊" },
  59: { x: 300, y: 232, planet: "☋" },
  
  // Spleen Center (Gates 57, 48, 44, 50, 32, 28, 18, 38)
  57: { x: 130, y: 478, planet: "☋" },
  48: { x: 154, y: 506, planet: "⚯" },
  44: { x: 130, y: 522, planet: "⚲" },
  50: { x: 106, y: 506, planet: "☉" },
  32: { x: 154, y: 478, planet: "☽" },
  28: { x: 106, y: 478, planet: "☿" },
  18: { x: 154, y: 522, planet: "♂" },
  38: { x: 106, y: 522, planet: "♀" },
  
  // Root Center (Gates 54, 53, 60, 52, 19, 39, 41, 58)
  54: { x: 300, y: 628, planet: "♃" },
  53: { x: 260, y: 650, planet: "♄" },
  60: { x: 340, y: 650, planet: "♅" },
  52: { x: 260, y: 628, planet: "♆" },
  19: { x: 340, y: 628, planet: "♇" },
  41: { x: 340, y: 670, planet: "⚸" },
  58: { x: 300, y: 650, planet: "⚹" },
};

// ==== Erweiterte Channels mit Farben ====
const CHANNELS: Array<{
  id: string;
  gates: [number, number];
  d: string;
  color: string;
}> = [
  // Head to Ajna
  { id: "61-24", gates: [61, 24], d: "M262,78 C270,120 285,150 300,168", color: "#FF6B6B" },
  { id: "63-4", gates: [63, 4], d: "M338,78 C330,120 315,150 300,168", color: "#4ECDC4" },
  { id: "64-47", gates: [64, 47], d: "M300,78 C300,120 300,150 262,170", color: "#45B7D1" },
  
  // Ajna to Throat
  { id: "23-43", gates: [23, 43], d: "M300,262 C300,240 300,220 300,200", color: "#96CEB4" },
  { id: "24-61", gates: [24, 61], d: "M300,168 C300,200 300,230 262,78", color: "#FFEAA7" },
  { id: "47-64", gates: [47, 64], d: "M262,170 C300,150 300,120 300,78", color: "#DDA0DD" },
  
  // G Center Connections
  { id: "1-8", gates: [1, 8], d: "M300,352 C308,330 318,300 300,282", color: "#FF8A80" },
  { id: "2-14", gates: [2, 14], d: "M300,396 C310,430 318,470 340,540", color: "#FFD54F" },
  { id: "7-31", gates: [7, 31], d: "M336,302 C320,320 310,340 264,302", color: "#81C784" },
  { id: "13-33", gates: [13, 33], d: "M338,368 C320,350 310,330 264,282", color: "#64B5F6" },
  { id: "15-5", gates: [15, 5], d: "M338,412 C320,430 310,450 260,540", color: "#BA68C8" },
  { id: "10-20", gates: [10, 20], d: "M262,412 C280,400 290,380 300,232", color: "#FFB74D" },
  { id: "10-34", gates: [10, 34], d: "M262,412 C280,430 290,450 300,520", color: "#4DB6AC" },
  { id: "20-34", gates: [20, 34], d: "M300,232 C300,300 300,420 300,520", color: "#7986CB" },
  { id: "20-57", gates: [20, 57], d: "M300,232 C280,250 260,270 130,478", color: "#F06292" },
  { id: "25-51", gates: [25, 51], d: "M300,372 C330,360 360,350 408,372", color: "#FF8A65" },
  
  // Heart Center
  { id: "21-45", gates: [21, 45], d: "M430,352 C400,340 370,330 336,242", color: "#A1887F" },
  { id: "26-44", gates: [26, 44], d: "M430,384 C400,400 370,420 130,522", color: "#90A4AE" },
  { id: "40-37", gates: [40, 37], d: "M452,372 C470,390 480,410 470,522", color: "#FFCC02" },
  
  // Sacral Center
  { id: "3-60", gates: [3, 60], d: "M260,560 C280,580 300,600 340,650", color: "#FF5722" },
  { id: "14-2", gates: [14, 2], d: "M340,540 C330,500 320,460 300,396", color: "#9C27B0" },
  { id: "29-46", gates: [29, 46], d: "M260,520 C280,500 300,480 300,376", color: "#3F51B5" },
  { id: "27-50", gates: [27, 50], d: "M300,540 C280,560 260,580 106,506", color: "#009688" },
  { id: "42-53", gates: [42, 53], d: "M340,560 C360,580 380,600 260,650", color: "#E91E63" },
  { id: "9-52", gates: [9, 52], d: "M340,520 C360,540 380,560 260,628", color: "#673AB7" },
  
  // Solar Plexus
  { id: "22-12", gates: [22, 12], d: "M494,506 C480,480 460,460 300,242", color: "#FF9800" },
  { id: "36-35", gates: [36, 35], d: "M470,478 C450,460 430,450 264,242", color: "#795548" },
  { id: "37-40", gates: [37, 40], d: "M470,522 C450,540 430,550 452,372", color: "#607D8B" },
  { id: "6-59", gates: [6, 59], d: "M446,506 C430,480 420,460 300,232", color: "#8BC34A" },
  { id: "49-19", gates: [49, 49], d: "M494,478 C480,460 470,450 340,628", color: "#FFC107" },
  { id: "30-41", gates: [30, 30], d: "M446,478 C430,460 420,450 340,670", color: "#00BCD4" },
  { id: "55-39", gates: [55, 55], d: "M494,522 C480,540 470,550 446,522", color: "#CDDC39" },
  
  // Spleen Center
  { id: "48-16", gates: [48, 48], d: "M154,506 C170,480 180,460 300,292", color: "#FFEB3B" },
  { id: "57-34", gates: [57, 57], d: "M130,478 C150,460 170,450 300,520", color: "#9E9E9E" },
  { id: "50-27", gates: [50, 50], d: "M106,506 C130,480 150,460 300,540", color: "#FF5722" },
  { id: "32-54", gates: [32, 32], d: "M154,478 C170,460 180,450 300,628", color: "#2196F3" },
  { id: "28-38", gates: [28, 28], d: "M106,478 C130,460 150,450 106,522", color: "#4CAF50" },
  { id: "18-58", gates: [18, 18], d: "M154,522 C170,540 180,550 300,650", color: "#FF4081" },
  
  // Root Center
  { id: "54-32", gates: [54, 54], d: "M300,628 C300,600 300,580 154,478", color: "#FF6F00" },
  { id: "53-42", gates: [53, 53], d: "M260,650 C280,630 300,620 340,560", color: "#6A1B9A" },
  { id: "60-3", gates: [60, 60], d: "M340,650 C320,630 300,620 260,560", color: "#1565C0" },
  { id: "52-9", gates: [52, 52], d: "M260,628 C280,610 300,600 340,520", color: "#2E7D32" },
  { id: "19-49", gates: [19, 19], d: "M340,628 C320,610 300,600 494,478", color: "#C62828" },
  { id: "39-55", gates: [39, 39], d: "M446,522 C430,540 420,550 494,522", color: "#6D4C41" },
  { id: "41-30", gates: [41, 41], d: "M340,670 C320,650 300,640 446,478", color: "#0277BD" },
  { id: "58-18", gates: [58, 58], d: "M300,650 C300,630 300,620 154,522", color: "#AD1457" },
];

// ==== Themes ====
const THEMES = {
  dark: {
    bgTop: "#0b0d12",
    bgBottom: "#1a1f2b",
    text: "#f5f2ea",
    textMuted: "#a0aec0",
    strokeMuted: "rgba(245,242,234,0.15)",
    panel: "rgba(11,13,18,0.8)",
  },
  light: {
    bgTop: "#ffffff",
    bgBottom: "#f7fafc",
    text: "#2d3748",
    textMuted: "#718096",
    strokeMuted: "rgba(45,55,72,0.15)",
    panel: "rgba(255,255,255,0.8)",
  },
};

interface HDChartProps {
  data: ChartData;
  initialTheme?: "dark" | "light";
  className?: string;
}

export default function HDChart({ data, initialTheme = "light", className = "" }: HDChartProps) {
  const [theme] = useState(initialTheme);
  const T = THEMES[theme];

  // Sicherheitscheck für data
  if (!data || !data.gates || !data.centers) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-4">⚠️</div>
          <div className="text-gray-600">Keine Chart-Daten verfügbar</div>
        </div>
      </div>
    );
  }

  // Hilfsfunktionen
  const isChannelActive = (gate1: number, gate2: number) => {
    // Prüfe ob beide Gates aktiv sind
    const gate1Active = data.gates.some(g => g.id === gate1 && g.active);
    const gate2Active = data.gates.some(g => g.id === gate2 && g.active);
    return gate1Active && gate2Active;
  };

  const isGateActive = (gateId: number) => {
    return data.gates.some(g => g.id === gateId && g.active);
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        width="600"
        height="760"
        viewBox="0 0 600 760"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }}
      >
        <defs>
          {/* Gradient für definierte Centers */}
          <linearGradient id="definedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b35c" />
            <stop offset="100%" stopColor="#b8873a" />
          </linearGradient>
          
          {/* Gradient für aktive Gates */}
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          
          {/* Glow-Effekt */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="600" height="760" fill={T.bgTop} />
        
        {/* Frame */}
        <rect x="20" y="20" width="560" height="720" fill="none" stroke={T.strokeMuted} strokeWidth="2" rx="20" ry="20" />

        {/* Title */}
        <text x="300" y="50" textAnchor="middle" fill={T.text} fontSize="20" style={{ fontWeight: 700 }}>
          {data.metadata && data.metadata.type ? data.metadata.type : "Human Design Chart"}
        </text>
        
        {data.metadata && data.metadata.profile && (
          <text x="300" y="75" textAnchor="middle" fill={T.textMuted} fontSize="14">
            Profil: {data.metadata.profile}
          </text>
        )}

        {/* Farbige Channels - nur aktive */}
        {CHANNELS.map((ch) => {
          const active = isChannelActive(ch.gates[0], ch.gates[1]);
          if (!active) return null; // Nur aktive Channels anzeigen
          
          return (
            <path
              key={ch.id}
              d={ch.d}
              fill="none"
              stroke={ch.color}
              strokeWidth="4"
              opacity="0.9"
              filter="url(#glow)"
              strokeLinecap="round"
            />
          );
        })}

        {/* Centers */}
        {Object.entries(CENTER_LAYOUT).map(([k, c]) => {
          const defined = !!data.centers[k as CenterKey]?.defined;
          const fill = defined ? "url(#definedGradient)" : "rgba(255,255,255,0.05)";
          const stroke = defined ? "#d8b35c" : T.strokeMuted;
          const strokeWidth = defined ? 3 : 1;
          
          return (
            <g key={k}>
              <rect
                x={c.x - c.w / 2}
                y={c.y - c.h / 2}
                width={c.w}
                height={c.h}
                rx="15"
                ry="15"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                filter={defined ? "url(#glow)" : undefined}
              />
              <text 
                x={c.x} 
                y={c.y} 
                textAnchor="middle" 
                dominantBaseline="central" 
                fontSize="14" 
                fill={defined ? "#0b0d12" : T.text} 
                style={{ fontWeight: 700 }}
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* Gates - nur aktive anzeigen */}
        {data.gates.filter(g => g.active).map((g) => {
          const p = GATE_POINTS[g.id];
          if (!p) return null;
          
          return (
            <g key={g.id} transform={`translate(${p.x},${p.y})`}>
              <circle 
                r="12" 
                fill="url(#activeGradient)" 
                stroke="#d8b35c" 
                strokeWidth="2"
                filter="url(#glow)"
              />
              <text 
                y="2" 
                textAnchor="middle" 
                fontSize="11" 
                fill="#0b0d12"
                style={{ fontWeight: 700 }}
              >
                {g.id}
              </text>
              {p.planet && (
                <text 
                  y="-18" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#d8b35c"
                  style={{ fontWeight: 600 }}
                >
                  {p.planet}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(50,700)">
          <rect x="0" y="-30" width="500" height="50" rx="15" fill={T.panel} stroke={T.strokeMuted} strokeWidth="1" />
          
          {/* Definiert */}
          <rect x="20" y="-20" width="20" height="20" rx="5" fill="url(#definedGradient)" />
          <text x="50" y="-7" fill={T.text} fontSize="14" style={{ fontWeight: 600 }}>Definiert</text>
          
          {/* Aktiv */}
          <circle cx="150" cy="-10" r="8" fill="url(#activeGradient)" />
          <text x="170" y="-7" fill={T.text} fontSize="14" style={{ fontWeight: 600 }}>Aktiv</text>
          
          {/* Offen */}
          <rect x="220" y="-20" width="20" height="20" rx="5" fill="rgba(255,255,255,0.05)" stroke={T.strokeMuted} strokeWidth="1" />
          <text x="250" y="-7" fill={T.text} fontSize="14" style={{ fontWeight: 600 }}>Offen</text>
        </g>
      </svg>
    </div>
  );
}

// ==== Demo ====
export function DemoLuxHDChart() {
  const demo: ChartData = {
    centers: {
      head: { defined: true },
      ajna: { defined: false },
      throat: { defined: true },
      g: { defined: true },
      heart: { defined: false },
      sacral: { defined: true },
      solar: { defined: false },
      spleen: { defined: false },
      root: { defined: true },
    },
    channels: [
      { from: 61, to: 24, active: true },
      { from: 20, to: 34, active: true },
      { from: 1, to: 8, active: true },
    ],
    gates: [
      { id: 64, active: true },
      { id: 61, active: true },
      { id: 24, active: true },
      { id: 20, active: true },
      { id: 1, active: true },
      { id: 8, active: true },
      { id: 34, active: true },
    ],
    metadata: { type: "Generator", profile: "1/3", authority: "Sakral" },
  };

  return (
    <div className="min-h-screen p-6" style={{ background: THEMES.dark.bgTop, color: THEMES.dark.text }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Vereinfachte HD Chart — Demo</h1>
        <HDChart data={demo} />
      </div>
    </div>
  );
}

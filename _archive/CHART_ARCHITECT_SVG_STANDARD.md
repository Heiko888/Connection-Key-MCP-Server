# 🎨 SVG-Layer-Standard & Rendering-Logik

**Datum:** 17.12.2025

**Ziel:** SVG-Standard für Human Design Bodygraphen definieren

---

## 📋 Übersicht

Dieses Dokument definiert den SVG-Standard für Human Design Bodygraphen, der vom Chart Architect Agenten verwendet wird und für Workbook, Frontend und zukünftige Erweiterungen (Dating-App, Live-Vergleiche) kompatibel ist.

---

## 🏗️ SVG-Struktur (Layer-basiert)

### Basis-Struktur

```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 800 1200" 
     width="800" 
     height="1200"
     class="hd-bodygraph">
  
  <!-- Layer 0: Background -->
  <g id="layer_background" class="layer-background">
    <!-- Bodygraph-Umriss, Hintergrund -->
  </g>
  
  <!-- Layer 1: Centers (Base) -->
  <g id="layer_centers" class="layer-centers">
    <!-- Alle 9 Zentren (definiert/undefiniert) -->
  </g>
  
  <!-- Layer 2: Channels -->
  <g id="layer_channels" class="layer-channels">
    <!-- Alle 36 Kanäle (aktiv/inaktiv) -->
  </g>
  
  <!-- Layer 3: Gates -->
  <g id="layer_gates" class="layer-gates">
    <!-- Alle 64 Tore (aktiviert/nicht aktiviert) -->
  </g>
  
  <!-- Layer 4: Person A (Single) -->
  <g id="layer_person_A" class="layer-person" data-person-id="person_A">
    <!-- Person-spezifische Highlights -->
  </g>
  
  <!-- Layer 5: Person B (Dual - optional) -->
  <g id="layer_person_B" class="layer-person" data-person-id="person_B">
    <!-- Person-spezifische Highlights -->
  </g>
  
  <!-- Layer 6: Connections (Dual/Multi) -->
  <g id="layer_connections" class="layer-connections">
    <!-- Verbindungslinien zwischen Personen -->
  </g>
  
  <!-- Layer 7: Highlights -->
  <g id="layer_highlights" class="layer-highlights">
    <!-- Fokus, Hervorhebungen, Overlays -->
  </g>
  
  <!-- Layer 8: Labels (optional) -->
  <g id="layer_labels" class="layer-labels">
    <!-- Tor-Nummern, Kanal-Namen, etc. -->
  </g>
  
</svg>
```

---

## 🎨 Zentren (Centers)

### SVG-Struktur für Zentren

```xml
<g id="center_head" class="center" data-center="head">
  <circle cx="400" cy="100" r="60" 
          class="center-shape center-defined" 
          data-state="defined" />
  <text x="400" y="105" class="center-label">Head</text>
</g>
```

### Zustände

- `center-defined`: Zentrum ist definiert (gefüllt, farbig)
- `center-undefined`: Zentrum ist undefiniert (nur Umriss)
- `center-composite`: Gemeinsam definiert (bei Dual/Multi)

### Farben

```css
.center-defined {
  fill: #4A90E2; /* Blau für definiert */
  stroke: #2C5F8D;
  stroke-width: 2;
}

.center-undefined {
  fill: none;
  stroke: #CCCCCC;
  stroke-width: 1;
  stroke-dasharray: 3,3;
}

.center-composite {
  fill: #9B59B6; /* Lila für gemeinsam */
  stroke: #7D3C98;
}
```

---

## 🔗 Kanäle (Channels)

### SVG-Struktur für Kanäle

```xml
<g id="channel_11-56" class="channel" data-channel="11-56">
  <path d="M 350 150 L 450 250" 
        class="channel-line channel-active" 
        data-state="active" 
        stroke-width="4" />
</g>
```

### Zustände

- `channel-active`: Kanal ist aktiv (durchgezogene Linie, farbig)
- `channel-inactive`: Kanal ist inaktiv (gestrichelt, grau)
- `channel-composite`: Gemeinsam aktiviert (bei Dual/Multi)

### Farben

```css
.channel-active {
  stroke: #E74C3C; /* Rot für aktiv */
  stroke-width: 4;
}

.channel-inactive {
  stroke: #ECF0F1;
  stroke-width: 2;
  stroke-dasharray: 5,5;
}

.channel-composite {
  stroke: #F39C12; /* Orange für gemeinsam */
  stroke-width: 5;
}
```

---

## 🚪 Tore (Gates)

### SVG-Struktur für Tore

```xml
<g id="gate_11" class="gate" data-gate="11" data-center="ajna">
  <circle cx="350" cy="200" r="8" 
          class="gate-marker gate-active" 
          data-state="active" />
  <text x="355" y="205" class="gate-number">11</text>
</g>
```

### Zustände

- `gate-active`: Tor ist aktiviert (gefüllt, farbig)
- `gate-inactive`: Tor ist nicht aktiviert (nur Umriss)
- `gate-connected`: Tor ist verbunden (bei Dual/Multi)

### Farben

```css
.gate-active {
  fill: #27AE60; /* Grün für aktiv */
  stroke: #1E8449;
  stroke-width: 1.5;
}

.gate-inactive {
  fill: none;
  stroke: #BDC3C7;
  stroke-width: 1;
}

.gate-connected {
  fill: #E67E22; /* Orange für verbunden */
  stroke: #D35400;
}
```

---

## 🔗 Verbindungen (Connections - Dual/Multi)

### SVG-Struktur für Verbindungen

```xml
<g id="connection_electromagnetic_11-56" 
   class="connection" 
   data-type="electromagnetic"
   data-from="person_A:gate_11"
   data-to="person_B:gate_56">
  <line x1="350" y1="200" 
        x2="450" y2="300" 
        class="connection-line connection-electromagnetic" 
        stroke-width="3" />
  <circle cx="400" cy="250" r="5" 
          class="connection-marker" />
</g>
```

### Verbindungstypen

- `connection-electromagnetic`: Elektromagnetisch (rot, durchgezogen)
- `connection-dominant`: Dominant (blau, dick)
- `connection-compromise`: Kompromiss (gelb, gestrichelt)
- `connection-friendship`: Freundschaft (grün, dünn)

### Farben

```css
.connection-electromagnetic {
  stroke: #E74C3C; /* Rot */
  stroke-width: 3;
}

.connection-dominant {
  stroke: #3498DB; /* Blau */
  stroke-width: 4;
}

.connection-compromise {
  stroke: #F1C40F; /* Gelb */
  stroke-width: 2;
  stroke-dasharray: 8,4;
}

.connection-friendship {
  stroke: #2ECC71; /* Grün */
  stroke-width: 2;
}
```

---

## 👥 Multi-Person (Penta / Gruppe)

### SVG-Struktur für Multi-Person

```xml
<g id="layer_person_A" class="layer-person" data-person-id="person_A" data-opacity="1.0">
  <!-- Person A Bodygraph -->
</g>

<g id="layer_person_B" class="layer-person" data-person-id="person_B" data-opacity="0.7">
  <!-- Person B Bodygraph -->
</g>

<g id="layer_person_C" class="layer-person" data-person-id="person_C" data-opacity="0.7">
  <!-- Person C Bodygraph -->
</g>

<g id="layer_group_energy" class="layer-group">
  <!-- Gemeinsame Zentren, Kanäle -->
  <g class="group-center" data-center="sacral">
    <circle cx="400" cy="600" r="60" class="center-composite" />
  </g>
</g>
```

### Opacity-Logik

- Hauptperson: `opacity="1.0"` (voll sichtbar)
- Andere Personen: `opacity="0.7"` (transparent)
- Ausgeblendet: `opacity="0"` oder `display="none"`

---

## 🎯 Darstellungsmodi

### 1. Single-Modus

```xml
<svg class="hd-bodygraph hd-mode-single">
  <!-- Nur Layer 1-4 (Centers, Channels, Gates, Person A) -->
  <!-- Layer 5-6 (Person B, Connections) ausgeblendet -->
</svg>
```

### 2. Dual-Modus (Vergleich)

```xml
<svg class="hd-bodygraph hd-mode-dual-comparison">
  <!-- Zwei Bodygraphen nebeneinander -->
  <g id="bodygraph_A" transform="translate(0,0)">
    <!-- Person A komplett -->
  </g>
  <g id="bodygraph_B" transform="translate(400,0)">
    <!-- Person B komplett -->
  </g>
</svg>
```

### 3. Dual-Modus (Overlay)

```xml
<svg class="hd-bodygraph hd-mode-dual-overlay">
  <!-- Beide Bodygraphen übereinander -->
  <!-- Layer 6 (Connections) sichtbar -->
</svg>
```

### 4. Penta-Modus (Gruppe)

```xml
<svg class="hd-bodygraph hd-mode-penta">
  <!-- Alle Personen übereinander -->
  <!-- Layer 7 (Group Energy) sichtbar -->
</svg>
```

### 5. Fokus-Modus

```xml
<svg class="hd-bodygraph hd-mode-focus" data-focus="heart,sacral">
  <!-- Nur bestimmte Zentren/Kanäle hervorgehoben -->
  <!-- Rest ausgegraut -->
</svg>
```

---

## 📐 Koordinaten-System

### Bodygraph-Dimensionen

- **ViewBox:** `0 0 800 1200`
- **Breite:** 800px
- **Höhe:** 1200px

### Zentren-Positionen (Beispiel)

```javascript
const centerPositions = {
  head: { x: 400, y: 100 },
  ajna: { x: 400, y: 200 },
  throat: { x: 400, y: 400 },
  g: { x: 400, y: 500 },
  sacral: { x: 400, y: 700 },
  root: { x: 400, y: 1100 },
  spleen: { x: 200, y: 600 },
  solar: { x: 600, y: 600 },
  heart: { x: 400, y: 300 }
};
```

---

## 🎨 CSS-Klassen (Standard)

### Basis-Klassen

```css
.hd-bodygraph {
  font-family: 'Arial', sans-serif;
  background: #FFFFFF;
}

.layer-background { opacity: 1; }
.layer-centers { opacity: 1; }
.layer-channels { opacity: 1; }
.layer-gates { opacity: 1; }
.layer-person { opacity: 1; }
.layer-connections { opacity: 1; }
.layer-highlights { opacity: 1; }
.layer-labels { opacity: 1; }
```

### Zustands-Klassen

```css
/* Centers */
.center-defined { fill: #4A90E2; }
.center-undefined { fill: none; stroke: #CCCCCC; }
.center-composite { fill: #9B59B6; }

/* Channels */
.channel-active { stroke: #E74C3C; }
.channel-inactive { stroke: #ECF0F1; stroke-dasharray: 5,5; }
.channel-composite { stroke: #F39C12; }

/* Gates */
.gate-active { fill: #27AE60; }
.gate-inactive { fill: none; stroke: #BDC3C7; }
.gate-connected { fill: #E67E22; }

/* Connections */
.connection-electromagnetic { stroke: #E74C3C; }
.connection-dominant { stroke: #3498DB; }
.connection-compromise { stroke: #F1C40F; stroke-dasharray: 8,4; }
.connection-friendship { stroke: #2ECC71; }
```

---

## 🔧 SVG-Generierung (Chart Architect Output)

### Output-Format

Der Chart Architect Agent liefert SVG als:

1. **Vollständiges SVG** (für direkte Einbettung)
2. **SVG-Fragment** (nur relevante Layer)
3. **SVG-Template** (mit Platzhaltern für Daten)

### Beispiel-Output (Single-Bodygraph)

```json
{
  "chart_id": "chart_001",
  "svg": "<svg>...</svg>",
  "svg_layers": {
    "centers": "<g id=\"layer_centers\">...</g>",
    "channels": "<g id=\"layer_channels\">...</g>",
    "gates": "<g id=\"layer_gates\">...</g>"
  },
  "data": {
    "centers": {...},
    "channels": {...},
    "gates": {...}
  }
}
```

---

## 📦 Workbook-Integration

### Was das Workbook bekommt

1. **Vollständiges SVG** (für statische PDFs)
2. **SVG-Layer** (für interaktive PDFs/Web)
3. **Datenstruktur** (für dynamische Anpassungen)

### Workbook kann:

- Layer ein/ausblenden
- Farben ändern (über CSS)
- Fokus setzen (über Klassen)
- Personen ausblenden (über Opacity)

---

## 🎯 Nächste Schritte

1. **SVG-Koordinaten präzisieren** (exakte Positionen aller Zentren)
2. **Kanal-Pfade definieren** (exakte Verbindungen zwischen Zentren)
3. **Workbook-Schnittstelle testen** (SVG in PDF einbetten)
4. **Frontend-Integration** (SVG in React-Komponente)

---

**🎨 Dieser Standard ist die Basis für alle Bodygraph-Visualisierungen!** 🚀

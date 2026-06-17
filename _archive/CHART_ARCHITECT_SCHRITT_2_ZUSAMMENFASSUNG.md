# 🎨 Schritt 2: SVG-Layer-Standard - Zusammenfassung

**Datum:** 17.12.2025

**Status:** SVG-Standard definiert ✅

---

## 📋 Was wurde definiert

### 1. Layer-Struktur

**9 Layer:**
1. Background (Hintergrund)
2. Centers (Zentren)
3. Channels (Kanäle)
4. Gates (Tore)
5. Person A (Single)
6. Person B (Dual - optional)
7. Connections (Verbindungen)
8. Highlights (Hervorhebungen)
9. Labels (Beschriftungen)

---

### 2. Zustände & Farben

**Zentren:**
- `center-defined`: Blau (#4A90E2)
- `center-undefined`: Grau, gestrichelt
- `center-composite`: Lila (#9B59B6)

**Kanäle:**
- `channel-active`: Rot (#E74C3C)
- `channel-inactive`: Grau, gestrichelt
- `channel-composite`: Orange (#F39C12)

**Tore:**
- `gate-active`: Grün (#27AE60)
- `gate-inactive`: Grau
- `gate-connected`: Orange (#E67E22)

**Verbindungen:**
- `electromagnetic`: Rot
- `dominant`: Blau
- `compromise`: Gelb, gestrichelt
- `friendship`: Grün

---

### 3. Darstellungsmodi

- **Single:** Ein Bodygraph
- **Dual (Vergleich):** Zwei nebeneinander
- **Dual (Overlay):** Zwei übereinander
- **Penta:** Mehrere übereinander
- **Fokus:** Nur bestimmte Bereiche

---

### 4. Koordinaten-System

- **ViewBox:** `0 0 800 1200`
- **Breite:** 800px
- **Höhe:** 1200px
- **Zentren-Positionen:** Definiert (siehe Dokument)

---

## 🎯 Nächste Schritte

### Option A: SVG-Koordinaten präzisieren

**Was bedeutet das?**
- Exakte Positionen aller 9 Zentren
- Exakte Pfade für alle 36 Kanäle
- Exakte Positionen aller 64 Tore

**Warum wichtig?**
- SVG muss pixelgenau sein
- Workbook braucht exakte Koordinaten
- Frontend braucht exakte Positionen

---

### Option B: Workbook-Schnittstelle definieren

**Was bedeutet das?**
- API-Spec für Chart Architect → Workbook
- Datenformat festlegen
- SVG-Format festlegen

**Warum wichtig?**
- Workbook muss wissen, was es bekommt
- Chart Architect muss wissen, was es liefern muss
- Saubere Schnittstelle = keine Überraschungen

---

### Option C: Frontend-Integration vorbereiten

**Was bedeutet das?**
- React-Komponente für Bodygraph
- SVG als React-Komponente
- State-Management für Layer

**Warum wichtig?**
- Frontend braucht interaktive Bodygraphen
- Layer müssen ein/ausblendbar sein
- Zustände müssen verwaltet werden

---

## ✅ Empfehlung

**Als nächstes: Option B (Workbook-Schnittstelle)**

**Warum?**
- ✅ Definiert die Schnittstelle zwischen Chart Architect und Workbook
- ✅ Klärt, was der Chart Architect liefern muss
- ✅ Klärt, was das Workbook erwarten kann
- ✅ Basis für alle weiteren Schritte

**Dann:**
- Option A (Koordinaten präzisieren)
- Option C (Frontend-Integration)

---

## 🎯 Was du jetzt machen kannst

1. **SVG-Standard prüfen** (ist das so richtig?)
2. **Koordinaten anpassen** (falls du andere Positionen hast)
3. **Farben anpassen** (falls du andere Farben willst)
4. **Weiter mit Schritt 3** (Workbook-Schnittstelle)

---

**Sag mir einfach, was du als nächstes machen willst!** 🚀

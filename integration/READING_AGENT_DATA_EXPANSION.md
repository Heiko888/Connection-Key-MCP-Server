# 📚 Reading Agent - Daten-Erweiterung

## Fehlende Knowledge-Dateien

### 1. Zentren-Details (9 Zentren)
**Datei:** `production/knowledge/centers-detailed.txt`

Benötigt: Detaillierte Beschreibungen aller 9 Zentren
- Head Center (Kopf)
- Ajna Center (Stirn)
- Throat Center (Kehle)
- G Center (G-Zentrum)
- Heart Center (Herz)
- Solar Plexus Center (Solarplexus)
- Sacral Center (Sakral)
- Spleen Center (Milz)
- Root Center (Wurzel)

### 2. Alle 64 Gates
**Datei:** `production/knowledge/gates-detailed.txt`

Benötigt: Alle 64 Gates mit:
- Thema
- Zentrum
- Bedeutung
- Talent

### 3. Alle 36 Channels
**Datei:** `production/knowledge/channels-detailed.txt`

Benötigt: Alle 36 Channels mit:
- Verbindung (welche Zentren)
- Talent
- Bedeutung

### 4. Profile-Details (12 Profile)
**Datei:** `production/knowledge/profiles-detailed.txt`

Benötigt: Alle 12 Profile mit:
- Linie 1-6 Beschreibungen
- Lebensrolle
- Verhalten

### 5. Authority-Typen
**Datei:** `production/knowledge/authority-detailed.txt`

Benötigt: Alle Authority-Typen:
- Sacral Authority
- Emotional Authority
- Splenic Authority
- Ego Authority
- Self Authority
- Environmental Authority
- Lunar Authority

### 6. Penta-Formation
**Datei:** `production/knowledge/penta-formation.txt` (NEU)

Benötigt:
- Penta-Typen (Individual, Tribal, Collective)
- Penta-Channels
- Penta-Dynamik

### 7. Connection Key
**Datei:** `production/knowledge/connection-key.txt` (NEU)

Benötigt:
- Kompatibilitäts-Faktoren
- Synastrie
- Beziehungs-Dynamik

### 8. Incarnation Cross (erweitern)
**Datei:** `production/knowledge/incarnation-cross.txt` (erweitern)

Benötigt: Mehr Details zu allen Cross-Typen

---

## Template-Verbesserungen

### 1. Templates erweitern
- Mehr Platzhalter
- Detailliertere Struktur
- Bessere Formatierung

### 2. Neue Templates
- `transit.txt` - Transit-Analysen
- `yearly-forecast.txt` - Jahres-Vorhersagen
- `composite.txt` - Composite Charts

---

## Implementierungs-Plan

### Schritt 1: Knowledge-Dateien erstellen
```bash
cd production/knowledge
# Erstelle neue Dateien
touch centers-detailed.txt gates-detailed.txt channels-detailed.txt profiles-detailed.txt authority-detailed.txt penta-formation.txt connection-key.txt
```

### Schritt 2: Daten einfügen
- Human Design Daten aus zuverlässigen Quellen
- Strukturiert formatieren
- Für AI-Lesbarkeit optimieren

### Schritt 3: Server testen
```bash
# Knowledge neu laden
curl -X POST http://138.199.237.34:4001/admin/reload-knowledge \
  -H "Authorization: Bearer AGENT_SECRET"
```

---

## Daten-Quellen

### Empfohlene Quellen:
1. **Human Design System** - Offizielle Dokumentation
2. **Jovian Archive** - Ra Uru Hu's Original-Material
3. **Human Design Books** - Verifizierte Bücher
4. **Certified Analysts** - Professionelle Quellen

---

## Priorität

**HOCH:** Zentren, Gates, Channels, Profile, Authority
**MITTEL:** Penta, Connection Key
**NIEDRIG:** Transit, Forecast


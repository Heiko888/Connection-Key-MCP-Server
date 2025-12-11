# 🔧 Swiss Ephemeris Setup für n8n

## 📋 Übersicht

Swiss Ephemeris ist eine präzise Bibliothek für astronomische Berechnungen, die für Human Design Chart-Berechnungen benötigt wird.

---

## 🚀 Setup-Optionen

### Option 1: Swiss Ephemeris HTTP API (Empfohlen)

**Vorteile:**
- Keine Installation in n8n nötig
- Funktioniert sofort
- Externe API übernimmt Berechnungen

**Nachteile:**
- Abhängig von externem Service
- Mögliche Kosten

**Verfügbare APIs:**
- `https://api.astro.com/swisseph` (Beispiel)
- Eigene API mit Swiss Ephemeris Server

### Option 2: Swiss Ephemeris Node.js in n8n

**Vorteile:**
- Lokale Berechnungen
- Keine externe Abhängigkeit
- Schneller

**Nachteile:**
- Installation in n8n nötig
- Komplexer Setup

**Installation:**
```bash
# In n8n Docker Container
docker exec -it the-connection-key-n8n-1 npm install swisseph
```

### Option 3: Swiss Ephemeris Web Service (Eigener Server)

**Vorteile:**
- Vollständige Kontrolle
- Keine Abhängigkeiten
- Eigene API

**Nachteile:**
- Eigener Server nötig
- Setup-Aufwand

---

## 🔧 Implementierung im n8n Workflow

### Aktueller Workflow

Der Workflow `chart-calculation-workflow-swisseph.json` enthält:

1. **Swiss Ephemeris Integration** - Berechnung von Planetenpositionen
2. **Gate-Konvertierung** - Position → Human Design Gate (1-64)
3. **Linien-Konvertierung** - Position → Linie (1-6)
4. **Chart-Berechnung** - Typ, Profil, Autorität, Strategie, Channels, Zentren

### Code-Struktur

```javascript
// 1. Julian Day berechnen
const julianDay = calculateJulianDay(year, month, day, hours, minutes);

// 2. Planetenpositionen berechnen (via Swiss Ephemeris)
const planetsData = await calculatePlanets(julianDay);

// 3. Gates extrahieren
const gates = extractGates(planetsData);

// 4. Channels berechnen
const channels = calculateChannels(gates);

// 5. Zentren berechnen
const centers = calculateCenters(gates);

// 6. Typ, Profil, Autorität, Strategie berechnen
const type = calculateType(centers);
const profile = calculateProfile(planetsData.sun, planetsData.earth);
const authority = calculateAuthority(centers);
const strategy = calculateStrategy(type);

// 7. Incarnation Cross berechnen
const incarnationCross = calculateIncarnationCross(planetsData.sun, planetsData.earth);
```

---

## 🧪 Test

### Test-Request

```bash
curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

### Erwartete Response

```json
{
  "type": "Generator",
  "profile": "1/3",
  "authority": "Sacral",
  "strategy": "Wait to respond",
  "planets": {
    "sun": { "gate": 43, "line": 2, "longitude": 123.45 },
    "moon": { "gate": 23, "line": 4, "longitude": 234.56 },
    ...
  },
  "gates": {
    "defined": [1, 2, 7, 10, 13, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    "undefined": [...],
    "emphasis": [1, 2, 7, 10, 13, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
  },
  "channels": {
    "active": ["1-8", "2-14", "3-60", "7-31", "10-20", "13-33"],
    "details": {}
  },
  "centers": {
    "defined": ["sacral", "root", "solarPlexus"],
    "undefined": ["head", "ajna", "throat", "g", "heart", "spleen"],
    "details": {}
  },
  "incarnationCross": {
    "name": "Cross of 43-23",
    "type": "Right Angle",
    "sunGate": 43,
    "sunLine": 2,
    "earthGate": 23,
    "earthLine": 4
  }
}
```

---

## 📋 Nächste Schritte

1. ✅ **Workflow importieren** - `chart-calculation-workflow-swisseph.json` in n8n importieren
2. ✅ **Swiss Ephemeris API konfigurieren** - API-URL im Code Node anpassen
3. ✅ **Testen** - Chart-Berechnung testen
4. ✅ **Reading Agent erweitern** - n8n Webhook in Reading Agent integrieren

---

## 🔍 Troubleshooting

### Swiss Ephemeris API nicht erreichbar

- Prüfen Sie die API-URL
- Prüfen Sie Firewall-Regeln
- Nutzen Sie Fallback-Berechnung (im Code enthalten)

### Gate-Berechnungen falsch

- Prüfen Sie Julian Day Berechnung
- Prüfen Sie Position-zu-Gate Konvertierung
- Prüfen Sie Swiss Ephemeris API Response

### Chart-Daten unvollständig

- Prüfen Sie alle Hilfsfunktionen (calculateChannels, calculateCenters, etc.)
- Prüfen Sie n8n Execution Logs
- Prüfen Sie Code Node Output

---

## 📚 Ressourcen

- [Swiss Ephemeris Dokumentation](https://www.astro.com/swisseph/swephinfo_e.htm)
- [Human Design Gate Mapping](https://www.humandesignsystem.com/)
- [I-Ching Hexagramme](https://en.wikipedia.org/wiki/I_Ching)


# 🔭 Chart-Berechnung mit astronomy-engine - Implementierung

## ✅ Implementiert

Die Chart-Berechnung wurde erweitert, um **astronomy-engine** für präzise astronomische Berechnungen zu nutzen.

---

## 📋 Was wurde erstellt

### 1. **chart-calculation-astronomy.js** (NEU)
- ✅ Nutzt `astronomy-engine` für präzise Planetenpositionen
- ✅ Geocoding-Service für Geburtsorte (OpenStreetMap)
- ✅ Fallback-Berechnung, falls `astronomy-engine` nicht verfügbar
- ✅ Vollständige Human Design Chart-Berechnung:
  - Planeten (Sonne, Mond, Merkur, Venus, Mars, Jupiter, Saturn, Uranus, Neptun, Pluto)
  - North Node, South Node, Earth
  - Gates, Lines, Channels, Centers
  - Type, Profile, Authority, Strategy
  - Incarnation Cross

### 2. **setup-chart-astronomy.sh** (NEU)
- ✅ Installiert Dependencies (`node-geocoder`, `astronomy-engine`)
- ✅ Erweitert bestehendes `chart-calculation.js`
- ✅ Fügt astronomy-engine Methode als Priorität 0 (höchste) hinzu
- ✅ Prüft Syntax und erstellt Backups

---

## 🏗️ Architektur

### Berechnungs-Methoden (Priorität):

1. **astronomy-engine** (Priorität 0) - **NEU** ✅
   - Präzise astronomische Berechnungen
   - Geocoding für Geburtsorte
   - Fallback, falls nicht verfügbar

2. **n8n Webhook** (Priorität 1)
   - Falls n8n Chart-Berechnung vorhanden

3. **Externe API** (Priorität 2)
   - Falls CHART_API_URL konfiguriert

4. **Reading Agent** (Priorität 3)
   - Fallback

---

## 🚀 Installation

### Option 1: Automatisch (Empfohlen)

**Auf Hetzner Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/setup-chart-astronomy.sh
./integration/scripts/setup-chart-astronomy.sh
```

**Das Script:**
1. ✅ Erstellt Backup von `chart-calculation.js`
2. ✅ Kopiert `chart-calculation-astronomy.js` nach `/opt/mcp/`
3. ✅ Installiert Dependencies (`node-geocoder`, `astronomy-engine`)
4. ✅ Erweitert `chart-calculation.js` mit astronomy-engine Methode
5. ✅ Prüft JavaScript-Syntax
6. ✅ Startet MCP Server neu (optional)

---

### Option 2: Manuell

#### Schritt 1: Dateien kopieren

```bash
# Auf Server
cd /opt/mcp
cp /opt/mcp-connection-key/integration/scripts/chart-calculation-astronomy.js .
```

#### Schritt 2: Dependencies installieren

```bash
cd /opt/mcp

# Erstelle package.json (falls nicht vorhanden)
cat > package.json << 'PKG_END'
{
  "name": "mcp-server",
  "version": "1.0.0",
  "dependencies": {
    "node-geocoder": "^4.2.0"
  },
  "optionalDependencies": {
    "astronomy-engine": "^2.0.0"
  }
}
PKG_END

# Installiere Dependencies
npm install node-geocoder --save
npm install astronomy-engine --save-optional
```

#### Schritt 3: chart-calculation.js erweitern

**Füge Import hinzu (nach anderen requires):**

```javascript
const ChartCalculationAstronomy = require('./chart-calculation-astronomy');
```

**Füge ASTRONOMY_ENGINE zu CHART_CALCULATION_METHODS hinzu:**

```javascript
const CHART_CALCULATION_METHODS = {
  ASTRONOMY_ENGINE: 'astronomy',  // NEU
  N8N_WEBHOOK: 'n8n',
  EXTERNAL_API: 'external',
  READING_AGENT: 'reading'
};
```

**Füge astronomy-engine Methode zu setupMethods hinzu (als erste, Priorität 0):**

```javascript
setupMethods() {
  // Methode 0: astronomy-engine (höchste Priorität)
  try {
    const astronomyService = new ChartCalculationAstronomy();
    this.astronomyService = astronomyService;
    this.methods.push({
      name: CHART_CALCULATION_METHODS.ASTRONOMY_ENGINE,
      priority: 0,
      calculate: this.calculateViaAstronomy.bind(this)
    });
  } catch (error) {
    console.warn("astronomy-engine nicht verfügbar, überspringe:", error.message);
  }

  // ... bestehende Methoden
}
```

**Füge calculateViaAstronomy Methode hinzu:**

```javascript
async calculateViaAstronomy(birthDate, birthTime, birthPlace) {
  if (!this.astronomyService) {
    throw new Error("astronomy-engine service nicht verfügbar");
  }
  const chartData = await this.astronomyService.calculateHumanDesignChart(
    birthDate, birthTime, birthPlace
  );
  return this.normalizeChartData(chartData);
}
```

#### Schritt 4: MCP Server neu starten

```bash
systemctl restart mcp
```

---

## 🧪 Testing

### Test 1: Chart-Berechnung mit astronomy-engine

```bash
curl -X POST http://localhost:7000/chart/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "chartData": {
    "type": "Generator",
    "profile": "4/6",
    "authority": "Sacral",
    "strategy": "Wait to respond",
    "planets": {
      "sun": { "gate": 15, "line": 3, "longitude": 84.375 },
      "earth": { "gate": 51, "line": 3, "longitude": 264.375 },
      "moon": { "gate": 10, "line": 4, "longitude": 56.25 },
      ...
    },
    "gates": {
      "defined": [1, 2, 3, ...],
      "undefined": [...],
      "emphasis": [1, 2, 3, ...]
    },
    "channels": {
      "active": ["1-8", "2-14", ...],
      "details": {}
    },
    "centers": {
      "defined": ["head", "ajna", "throat", ...],
      "undefined": ["g", "heart", ...],
      "details": {...}
    },
    "incarnationCross": {
      "name": "Cross of 15-51",
      "type": "Right Angle",
      "sunGate": 15,
      "sunLine": 3,
      "earthGate": 51,
      "earthLine": 3
    }
  },
  "method": "astronomy",
  "cached": false,
  "timestamp": "2025-12-09T..."
}
```

### Test 2: Prüfe welche Methode verwendet wurde

```bash
curl http://localhost:7000/chart/stats
```

**Erwartete Response:**
```json
{
  "success": true,
  "cacheSize": 1,
  "methods": ["astronomy", "n8n", "reading"]
}
```

---

## 📊 Vergleich

| Feature | Vorher | Nachher |
|---------|--------|---------|
| astronomy-engine | ❌ | ✅ |
| Geocoding | ❌ | ✅ |
| Präzise Berechnungen | ❌ | ✅ |
| Fallback | ✅ | ✅ |
| Planetenpositionen | ⚠️ (Fallback) | ✅ (Präzise) |
| Priorität | n8n (1) | astronomy (0) |

---

## 🔧 Troubleshooting

### Problem: "astronomy-engine nicht verfügbar"

**Lösung:**
```bash
cd /opt/mcp
npm install astronomy-engine --save-optional
```

**Hinweis:** Falls `astronomy-engine` nicht installiert werden kann, nutzt das System automatisch die Fallback-Berechnung.

### Problem: "Geocoder konnte nicht initialisiert werden"

**Lösung:**
```bash
cd /opt/mcp
npm install node-geocoder --save
```

### Problem: "Syntax-Fehler in chart-calculation.js"

**Lösung:**
```bash
cd /opt/mcp
# Stelle Backup wieder her
cp chart-calculation.js.backup.* chart-calculation.js
# Oder führe Setup-Script erneut aus
```

---

## 📝 Hinweise

1. **astronomy-engine ist optional:**
   - Falls nicht verfügbar, nutzt das System automatisch Fallback-Berechnung
   - System funktioniert auch ohne astronomy-engine

2. **Geocoding:**
   - Nutzt OpenStreetMap (kostenlos, keine API-Key nötig)
   - Fallback: Standard-Koordinaten (Berlin)

3. **Performance:**
   - astronomy-engine Berechnungen sind präzise, aber langsamer als Fallback
   - Caching verbessert Performance

4. **Priorität:**
   - astronomy-engine hat Priorität 0 (höchste)
   - Wird zuerst versucht
   - Falls fehlgeschlagen, wird nächste Methode versucht

---

## ✅ Status

- ✅ Chart-Berechnungs-Modul mit astronomy-engine erstellt
- ✅ Geocoding-Service integriert
- ✅ Bestehendes chart-calculation.js erweitert
- ✅ Setup-Script erstellt
- ⏳ Installation auf Server (ausstehend)
- ⏳ Testing (ausstehend)

---

## 🚀 Nächste Schritte

1. **Installation auf Server:**
   ```bash
   ssh root@138.199.237.34
   cd /opt/mcp-connection-key
   ./integration/scripts/setup-chart-astronomy.sh
   ```

2. **Testing:**
   - Teste Chart-Berechnung mit verschiedenen Geburtsdaten
   - Prüfe ob astronomy-engine verwendet wird
   - Validiere Ergebnisse

3. **Optional: V2 mit 88° Solar Arc:**
   - Kann später hinzugefügt werden
   - Ähnliche Implementierung wie Hauptversion


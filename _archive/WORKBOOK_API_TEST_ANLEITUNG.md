# 🧪 Workbook API Test - Anleitung

**Datum:** 17.12.2025

**Ziel:** Workbook API-Route testen

---

## 📋 Voraussetzungen

1. **Frontend läuft** (Port 3005)
2. **MCP Server läuft** (Port 7000)
3. **Chart Architect Agent** ist aktiviert

---

## 🚀 Schnelltest (curl)

### Test 1: API Info (GET)

```bash
curl -X GET http://localhost:3005/api/workbook/chart-data \
  -H "Content-Type: application/json"
```

### Test 2: Single Chart (ohne SVG)

```bash
curl -X POST http://localhost:3005/api/workbook/chart-data \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": false,
      "includeData": true
    }
  }'
```

### Test 3: Single Chart (mit SVG)

```bash
curl -X POST http://localhost:3005/api/workbook/chart-data \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": true,
      "includeLayers": true,
      "includeData": true
    }
  }'
```

---

## 🧪 Test-Scripts

### Linux/macOS (Bash)

```bash
# Script ausführbar machen
chmod +x test-workbook-api.sh

# Lokal testen
./test-workbook-api.sh

# Server testen
./test-workbook-api.sh http://167.235.224.149:3005
```

### Windows (PowerShell)

```powershell
# Lokal testen
.\test-workbook-api.ps1

# Server testen
.\test-workbook-api.ps1 -ApiUrl http://167.235.224.149:3005
```

---

## ✅ Erwartete Ergebnisse

### Erfolgreiche Response

```json
{
  "success": true,
  "chart_id": "chart_001",
  "data": {
    "chart_id": "chart_001",
    "person": {...},
    "type": "Generator",
    "centers": {...},
    "channels": {...},
    "gates": {...}
  },
  "svg": "<svg>...</svg>",
  "svg_layers": {
    "centers": "<g>...</g>",
    "channels": "<g>...</g>",
    "gates": "<g>...</g>"
  },
  "metadata": {
    "version": "1.0",
    "generated_at": "2025-12-17T18:00:00Z",
    "svg_standard": "layer-based-v1",
    "chart_type": "single"
  }
}
```

### Fehler-Response

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELDS",
    "message": "chartType and birthData are required",
    "details": {...}
  }
}
```

---

## 🔍 Troubleshooting

### Problem: Connection refused

**Lösung:**
- Stelle sicher, dass das Frontend läuft
- Prüfe Port: `lsof -i :3005` (Linux/macOS) oder `netstat -ano | findstr :3005` (Windows)

### Problem: Chart Architect Agent nicht erreichbar

**Lösung:**
- Prüfe MCP Server: `curl http://138.199.237.34:7000/health`
- Prüfe Environment Variable: `MCP_SERVER_URL`

### Problem: Timeout

**Lösung:**
- Chart-Berechnung kann 30-180 Sekunden dauern
- Erhöhe Timeout in Test-Script

### Problem: JSON Parse Error

**Lösung:**
- Chart Architect Agent liefert möglicherweise Markdown mit JSON
- API-Route sollte JSON aus Markdown extrahieren (bereits implementiert)

---

## 📊 Test-Checkliste

- [ ] GET-Endpoint funktioniert (API Info)
- [ ] POST Single Chart (ohne SVG) funktioniert
- [ ] POST Single Chart (mit SVG) funktioniert
- [ ] POST Dual Chart funktioniert
- [ ] Fehler-Validierung funktioniert (fehlende Felder)
- [ ] Fehler-Validierung funktioniert (ungültiger chartType)
- [ ] Response-Format ist korrekt
- [ ] SVG ist vorhanden (wenn angefragt)
- [ ] SVG-Layers sind vorhanden (wenn angefragt)

---

## 🎯 Nächste Schritte

1. **API testen** (siehe oben)
2. **Fehler beheben** (falls vorhanden)
3. **Deployment** (Dateien auf Server kopieren)
4. **Integration** (in Workbook-System integrieren)

---

**🎉 Viel Erfolg beim Testen!** 🚀

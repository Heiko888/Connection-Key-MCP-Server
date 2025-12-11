# 🔧 Fix: sed-Fehler beim Chart-Berechnungs-Script

## ❌ Problem

**Fehler:**
```
sed: -e expression #1, char 335: extra characters after command
```

**Ursache:** Der `sed`-Befehl im Script ist fehlerhaft, besonders beim Einfügen von mehrzeiligem Code.

---

## ✅ Lösung

### Option 1: Korrigiertes Script verwenden

**Neues Script:** `integration/scripts/setup-chart-calculation-clean-fixed.sh`

**Änderungen:**
- ✅ Verwendet `mktemp` für temporäre Datei
- ✅ Fügt Code am Ende der Datei hinzu (statt mit sed)
- ✅ Robusteres Einfügen von Code

**Ausführen:**
```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/setup-chart-calculation-clean-fixed.sh
./integration/scripts/setup-chart-calculation-clean-fixed.sh
```

### Option 2: Manuell implementieren

**Schritt 1: Chart-Berechnungs-Modul erstellen**

```bash
cd /opt/mcp
cat > chart-calculation.js << 'EOF'
[Modul-Code hier - siehe CHART_CALCULATION_SAUBER_NEU.md]
EOF
```

**Schritt 2: MCP Server manuell erweitern**

```bash
cd /opt/mcp

# 1. Füge require hinzu (nach require('dotenv'))
# Öffne server.js und füge hinzu:
# const chartCalculationService = require('./chart-calculation');

# 2. Füge Endpoints hinzu (vor app.listen)
# Füge die Endpoints aus CHART_CALCULATION_SAUBER_NEU.md hinzu
```

**Schritt 3: MCP Server neu starten**

```bash
systemctl restart mcp
```

---

## 🔍 Was ist bereits erledigt?

Aus der Ausgabe:
- ✅ Backup erstellt: `/opt/mcp/server.js.backup.20251209_013722`
- ✅ Chart-Berechnungs-Modul erstellt: `/opt/mcp/chart-calculation.js`

**Noch zu tun:**
- ❌ MCP Server erweitern (sed-Fehler)
- ❌ Environment Variables prüfen
- ❌ MCP Server neu starten
- ❌ Test durchführen

---

## 🛠️ Quick Fix

**Prüfen Sie zuerst, ob das Modul erstellt wurde:**
```bash
ls -la /opt/mcp/chart-calculation.js
```

**Falls ja, erweitern Sie server.js manuell:**

```bash
cd /opt/mcp

# 1. Prüfe server.js
cat server.js | grep -A 5 "require('dotenv')"

# 2. Füge require hinzu (nach require('dotenv'))
# Öffne server.js mit nano oder vim und füge hinzu:
# const chartCalculationService = require('./chart-calculation');

# 3. Füge Endpoints hinzu (vor app.listen)
# Füge die Endpoints aus CHART_CALCULATION_SAUBER_NEU.md hinzu
```

**Oder verwenden Sie das korrigierte Script:**
```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/setup-chart-calculation-clean-fixed.sh
./integration/scripts/setup-chart-calculation-clean-fixed.sh
```

---

## 📋 Zusammenfassung

**Problem:** sed-Fehler beim Einfügen von Code  
**Lösung:** Korrigiertes Script oder manuelle Implementierung

**Status:**
- ✅ Chart-Berechnungs-Modul erstellt
- ❌ MCP Server noch nicht erweitert (sed-Fehler)

**Nächste Schritte:**
1. Verwenden Sie das korrigierte Script
2. Oder erweitern Sie server.js manuell


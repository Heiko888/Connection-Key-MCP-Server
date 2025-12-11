# 🔧 MCP Server Start-Problem - Fix

**Problem:** Service läuft (`active (running)`), aber Health Check schlägt fehl

**Ursache:** Server startet, aber stürzt sofort ab oder bindet nicht auf Port 7000

---

## 🔍 Schritt 1: Logs prüfen

```bash
# Systemd Logs (wichtig!)
journalctl -u mcp -n 50 --no-pager

# Oder Live-Logs
journalctl -u mcp -f
```

**Was zu prüfen:**
- Fehlermeldungen beim Start?
- Port-Bindungsfehler?
- Module-Fehler?
- Environment-Variable-Fehler?

---

## 🔍 Schritt 2: Prozess prüfen

```bash
# Prüfe ob Prozess läuft
ps aux | grep "server.js" | grep -v grep

# Prüfe Port 7000
netstat -tlnp | grep 7000
# Oder
ss -tlnp | grep 7000

# Falls Port nicht offen: Server stürzt ab
```

---

## 🔍 Schritt 3: Server.js direkt testen

```bash
# In Server-Verzeichnis wechseln
cd /opt/mcp-connection-key

# Server.js direkt starten (um Fehler zu sehen)
node server.js
```

**Was zu prüfen:**
- Startet der Server?
- Welche Fehlermeldungen erscheinen?
- Bindet er auf Port 7000?

**Falls Fehler:**
- Module fehlen? → `npm install`
- Environment-Variablen fehlen? → `.env` prüfen
- Port bereits belegt? → Anderen Prozess beenden

---

## 🔧 Lösung 1: Logs analysieren

```bash
# Detaillierte Logs
journalctl -u mcp -n 100 --no-pager | grep -i error

# Oder alle Logs
journalctl -u mcp --since "5 minutes ago" --no-pager
```

**Häufige Fehler:**
- `Cannot find module` → `npm install` im Verzeichnis
- `Port 7000 already in use` → Port belegen
- `OPENAI_API_KEY is not defined` → `.env` Datei prüfen

---

## 🔧 Lösung 2: Environment-Variablen prüfen

```bash
# .env Datei prüfen
cd /opt/mcp-connection-key
ls -la production/.env

# Falls nicht vorhanden:
cp production/env.example production/.env

# OPENAI_API_KEY prüfen
grep OPENAI_API_KEY production/.env

# Falls leer, setzen:
nano production/.env
```

---

## 🔧 Lösung 3: Service-Datei prüfen

```bash
# Service-Datei anzeigen
cat /etc/systemd/system/mcp.service

# Prüfe ob WorkingDirectory korrekt ist
# Sollte sein: WorkingDirectory=/opt/mcp-connection-key

# Prüfe ob ExecStart korrekt ist
# Sollte sein: ExecStart=/usr/bin/node /opt/mcp-connection-key/server.js
```

**Falls Pfad falsch:**
```bash
# Service-Datei bearbeiten
nano /etc/systemd/system/mcp.service

# Korrigieren:
# WorkingDirectory=/opt/mcp-connection-key
# ExecStart=/usr/bin/node /opt/mcp-connection-key/server.js

# Dann:
systemctl daemon-reload
systemctl restart mcp
```

---

## 🔧 Lösung 4: Server.js Pfad prüfen

```bash
# Prüfe ob server.js existiert
ls -la /opt/mcp-connection-key/server.js

# Falls nicht, prüfe alternativen Pfad:
find /opt -name "server.js" -type f 2>/dev/null

# Falls gefunden, Service-Datei anpassen
```

---

## 🔧 Lösung 5: Node.js Module installieren

```bash
# In Server-Verzeichnis
cd /opt/mcp-connection-key

# Prüfe ob package.json existiert
ls -la package.json

# Falls vorhanden, Module installieren
npm install

# Falls kein package.json, prüfe ob server.js alleine läuft
node server.js
```

---

## 🧪 Schnell-Diagnose

```bash
# 1. Logs prüfen
journalctl -u mcp -n 50 --no-pager

# 2. Prozess prüfen
ps aux | grep node | grep server.js

# 3. Port prüfen
netstat -tlnp | grep 7000

# 4. Server.js direkt testen
cd /opt/mcp-connection-key
node server.js
# (Drücke Ctrl+C nach ein paar Sekunden)

# 5. Service neu starten
systemctl restart mcp
sleep 3
systemctl status mcp
curl http://localhost:7000/health
```

---

## ✅ Nach dem Fix

```bash
# 1. Service Status
systemctl status mcp
# Sollte zeigen: Active: active (running) ✅

# 2. Health Check lokal
curl http://localhost:7000/health
# Sollte zeigen: {"status":"ok",...}

# 3. Health Check extern
curl http://138.199.237.34:7000/health
# Sollte zeigen: {"status":"ok",...}

# 4. Firewall prüfen
ufw allow 7000/tcp

# 5. Service aktivieren
systemctl enable mcp
```

---

## 🚨 Häufige Probleme

### Problem: "Cannot find module"

**Lösung:**
```bash
cd /opt/mcp-connection-key
npm install
systemctl restart mcp
```

### Problem: "Port 7000 already in use"

**Lösung:**
```bash
# Prozess finden
lsof -i:7000

# Prozess beenden
kill $(lsof -t -i:7000)

# Service neu starten
systemctl restart mcp
```

### Problem: "OPENAI_API_KEY is not defined"

**Lösung:**
```bash
cd /opt/mcp-connection-key
nano production/.env
# OPENAI_API_KEY=your-key-here eintragen
systemctl restart mcp
```

---

**Status:** 🔧 **Troubleshooting-Anleitung erstellt!**

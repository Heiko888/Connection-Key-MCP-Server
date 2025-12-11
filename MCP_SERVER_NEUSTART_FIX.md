# 🔧 MCP Server Neustart - Fix

**Problem:** systemd zeigt `failed`, aber Health Check funktioniert

**Ursache:** Server läuft außerhalb von systemd oder wurde manuell gestartet

---

## 🔍 Situation

```
systemctl status mcp
→ Active: failed (Result: signal)
→ Process wurde mit SIGKILL beendet

curl http://localhost:7000/health
→ {"status":"ok","port":7000,"service":"mcp-server"} ✅
```

**Das bedeutet:** Server läuft, aber nicht über systemd!

---

## 🔧 Lösung: Server ordentlich neu starten

### Schritt 1: Laufenden Prozess finden und beenden

```bash
# Prüfe ob Server läuft
ps aux | grep "server.js" | grep -v grep

# Oder prüfe Port 7000
netstat -tlnp | grep 7000
# Oder
ss -tlnp | grep 7000

# Falls Prozess läuft, beenden:
pkill -f "server.js"
# Oder spezifisch:
kill $(lsof -t -i:7000)
```

### Schritt 2: Service neu starten

```bash
# Service neu starten
systemctl restart mcp

# Status prüfen
systemctl status mcp

# Sollte zeigen:
# Active: active (running) ✅
```

### Schritt 3: Service aktivieren (Auto-Start)

```bash
# Service aktivieren (startet beim Boot)
systemctl enable mcp

# Status prüfen
systemctl is-enabled mcp
# Sollte zeigen: enabled
```

---

## 🔍 Falls Service nicht startet

### Prüfe Logs:

```bash
# Systemd Logs
journalctl -u mcp -n 50

# Oder Live-Logs
journalctl -u mcp -f
```

### Prüfe Service-Datei:

```bash
# Service-Datei prüfen
cat /etc/systemd/system/mcp.service

# Sollte enthalten:
# ExecStart=/usr/bin/node /opt/mcp-connection-key/server.js
# WorkingDirectory=/opt/mcp-connection-key
```

### Prüfe ob Datei existiert:

```bash
# Server.js prüfen
ls -la /opt/mcp-connection-key/server.js

# Falls nicht vorhanden, prüfe alternativen Pfad:
ls -la /opt/mcp/server.js
```

---

## 🔧 Alternative: Service-Datei korrigieren

### Falls Pfad falsch ist:

```bash
# Service-Datei bearbeiten
nano /etc/systemd/system/mcp.service
```

**Korrekte Service-Datei sollte sein:**

```ini
[Unit]
Description=MCP Multi-Agent Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mcp-connection-key
ExecStart=/usr/bin/node /opt/mcp-connection-key/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Falls Pfad anders ist, anpassen:**
- `WorkingDirectory` → Pfad zum MCP Server Verzeichnis
- `ExecStart` → Pfad zur server.js Datei

**Dann:**
```bash
# Service neu laden
systemctl daemon-reload

# Service starten
systemctl start mcp

# Status prüfen
systemctl status mcp
```

---

## ✅ Schnell-Fix (wenn alles funktioniert)

```bash
# 1. Laufenden Prozess beenden
pkill -f "server.js"

# 2. Service neu starten
systemctl restart mcp

# 3. Status prüfen
systemctl status mcp

# 4. Health Check testen
curl http://localhost:7000/health

# 5. Von außen testen
curl http://138.199.237.34:7000/health
```

---

## 🧪 Test nach Neustart

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

# 4. Marketing Agent testen
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## ✅ Checkliste

- [ ] Laufender Prozess beendet (`pkill -f "server.js"`)
- [ ] Service neu gestartet (`systemctl restart mcp`)
- [ ] Service Status: `active (running)` ✅
- [ ] Health Check lokal funktioniert
- [ ] Health Check extern funktioniert
- [ ] Port 7000 ist offen (`netstat -tlnp | grep 7000`)
- [ ] Firewall erlaubt Port 7000 (`ufw allow 7000/tcp`)
- [ ] Service aktiviert (`systemctl enable mcp`)

---

## 🚨 Falls weiterhin Probleme

### Problem: Service startet nicht

**Lösung:**
1. Logs prüfen: `journalctl -u mcp -n 50`
2. Service-Datei prüfen: `cat /etc/systemd/system/mcp.service`
3. Server.js Pfad prüfen: `ls -la /opt/mcp-connection-key/server.js`
4. Node.js prüfen: `which node` und `node --version`

### Problem: Port bereits belegt

**Lösung:**
```bash
# Prozess auf Port 7000 finden
lsof -i:7000

# Prozess beenden
kill $(lsof -t -i:7000)

# Service neu starten
systemctl restart mcp
```

---

**Status:** 🔧 **MCP Server Neustart-Anleitung erstellt!**

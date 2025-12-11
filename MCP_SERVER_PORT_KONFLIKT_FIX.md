# 🔧 MCP Server Port-Konflikt - Fix

**Problem:** Mehrere Server-Prozesse laufen gleichzeitig, Port 7000 ist belegt

**Ursache:** Alte Prozesse wurden nicht beendet, bevor der systemd-Service gestartet wurde

---

## 🔍 Situation

```
ps aux | grep server.js
→ 4 Prozesse laufen gleichzeitig:
  1. node connection-key/server.js (PID 523249) - alt, seit Dec 14
  2. node chatgpt-agent/server.js (PID 523291) - alt, seit Dec 14
  3. node /opt/mcp-connection-key/production/server.js (PID 566383) - neu
  4. /usr/bin/node /opt/mcp-connection-key/server.js (PID 566398) - systemd ✅

netstat -tlnp | grep 7000
→ Port 7000 ist belegt von PID 566398 (systemd)
```

**Das bedeutet:** Systemd-Service läuft, aber alte Prozesse sollten beendet werden.

---

## 🔧 Lösung: Alte Prozesse beenden

### Schritt 1: Alle alten Server-Prozesse beenden (außer systemd)

```bash
# Beende alle alten Prozesse
kill 523249 523291 566383

# Oder alle auf einmal:
pkill -f "connection-key/server.js"
pkill -f "chatgpt-agent/server.js"
pkill -f "production/server.js"

# WICHTIG: Systemd-Prozess (566398) NICHT beenden!
```

### Schritt 2: Prüfe ob nur systemd-Prozess läuft

```bash
# Prüfe Prozesse
ps aux | grep "server.js" | grep -v grep

# Sollte nur noch zeigen:
# root 566398 ... /usr/bin/node /opt/mcp-connection-key/server.js
```

### Schritt 3: Health Check testen

```bash
# Warte kurz (2 Sekunden)
sleep 2

# Health Check lokal
curl http://localhost:7000/health

# Health Check extern
curl http://138.199.237.34:7000/health
```

---

## ✅ Schnell-Fix (alle Befehle)

```bash
# 1. Alte Prozesse beenden (außer systemd)
kill 523249 523291 566383 2>/dev/null

# 2. Kurz warten
sleep 2

# 3. Prüfe ob nur systemd läuft
ps aux | grep "server.js" | grep -v grep

# 4. Health Check testen
curl http://localhost:7000/health

# 5. Extern testen
curl http://138.199.237.34:7000/health

# 6. Service Status prüfen
systemctl status mcp
```

---

## 🔍 Falls Health Check weiterhin fehlschlägt

### Prüfe ob Server wirklich läuft:

```bash
# 1. Service Status
systemctl status mcp
# Sollte zeigen: Active: active (running) ✅

# 2. Prozess prüfen
ps aux | grep 566398

# 3. Port prüfen
netstat -tlnp | grep 7000

# 4. Logs prüfen (Live)
journalctl -u mcp -f
# (Drücke Ctrl+C nach ein paar Sekunden)

# 5. Server direkt testen (wenn Port frei)
# Zuerst systemd beenden:
systemctl stop mcp
sleep 2

# Dann direkt starten:
cd /opt/mcp-connection-key
node server.js
# (Sollte ohne Fehler starten)
# (Drücke Ctrl+C)

# Dann systemd wieder starten:
systemctl start mcp
```

---

## 🚨 Falls Port weiterhin belegt ist

```bash
# Finde alle Prozesse auf Port 7000
lsof -i:7000

# Beende alle (außer systemd)
kill $(lsof -t -i:7000 | grep -v 566398)

# Oder alle beenden und systemd neu starten:
systemctl stop mcp
pkill -f "server.js"
sleep 2
systemctl start mcp
```

---

## ✅ Nach dem Fix

```bash
# 1. Nur ein Prozess sollte laufen
ps aux | grep "server.js" | grep -v grep
# Sollte nur systemd-Prozess zeigen ✅

# 2. Port 7000 sollte offen sein
netstat -tlnp | grep 7000
# Sollte systemd-Prozess zeigen ✅

# 3. Health Check lokal
curl http://localhost:7000/health
# Sollte zeigen: {"status":"ok",...} ✅

# 4. Health Check extern
curl http://138.199.237.34:7000/health
# Sollte zeigen: {"status":"ok",...} ✅

# 5. Service aktivieren (Auto-Start)
systemctl enable mcp
```

---

## 🧪 Test n8n Verbindung

```bash
# Marketing Agent testen (wie n8n es aufruft)
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

**Status:** 🔧 **Port-Konflikt-Fix-Anleitung erstellt!**

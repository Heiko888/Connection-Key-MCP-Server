# 🔧 n8n → MCP Server Verbindungsproblem beheben

**Fehler:** "The service refused the connection - perhaps it is offline"

**Problem:** n8n kann den MCP Server auf `http://138.199.237.34:7000` nicht erreichen

---

## 🔍 Schritt 1: MCP Server Status prüfen

### Auf Hetzner Server (138.199.237.34)

```bash
# SSH zum Server
ssh root@138.199.237.34

# MCP Server Status prüfen
systemctl status mcp

# Sollte zeigen:
# Active: active (running)
```

**Falls nicht aktiv:**
```bash
# MCP Server starten
systemctl start mcp

# Status nochmal prüfen
systemctl status mcp
```

---

## 🔍 Schritt 2: Health Check testen

### Vom Hetzner Server selbst:

```bash
# Health Check lokal
curl http://localhost:7000/health

# Erwartete Antwort:
# {"status":"ok","port":7000,"service":"mcp-server"}
```

### Von außen (vom n8n Server):

```bash
# Health Check extern
curl http://138.199.237.34:7000/health

# Falls Fehler: Firewall oder Netzwerk-Problem
```

---

## 🔍 Schritt 3: Port 7000 prüfen

### Auf Hetzner Server:

```bash
# Prüfe ob Port 7000 offen ist
netstat -tlnp | grep 7000

# Oder
ss -tlnp | grep 7000

# Sollte zeigen:
# tcp  0  0  0.0.0.0:7000  LISTEN  <PID>/node
```

**Falls Port nicht offen:**
```bash
# MCP Server neu starten
systemctl restart mcp

# Nochmal prüfen
netstat -tlnp | grep 7000
```

---

## 🔍 Schritt 4: Firewall prüfen

### Auf Hetzner Server:

```bash
# Firewall Status prüfen
ufw status

# Falls aktiv, Port 7000 erlauben:
ufw allow 7000/tcp

# Oder für spezifische IP (n8n Server):
# ufw allow from <n8n-server-ip> to any port 7000
```

### Prüfe ob Port von außen erreichbar ist:

```bash
# Von lokalem Rechner (nicht vom Server)
curl http://138.199.237.34:7000/health

# Falls Timeout: Firewall blockiert
# Falls Connection refused: Server läuft nicht oder bindet nicht auf 0.0.0.0
```

---

## 🔍 Schritt 5: MCP Server Konfiguration prüfen

### Prüfe ob Server auf 0.0.0.0 bindet (nicht nur localhost):

```bash
# MCP Server Konfiguration prüfen
cat /opt/mcp/server.js | grep -E "listen|app.listen|port"

# Sollte zeigen:
# app.listen(7000, '0.0.0.0', ...)  ✅
# ODER
# app.listen(7000, ...)  ✅ (bindet standardmäßig auf 0.0.0.0)

# NICHT:
# app.listen(7000, '127.0.0.1', ...)  ❌ (nur localhost)
```

**Falls nur localhost:**
```bash
# Server.js bearbeiten
nano /opt/mcp/server.js

# Ändern:
# app.listen(7000, '127.0.0.1', ...)  ❌
# Zu:
# app.listen(7000, '0.0.0.0', ...)  ✅

# Server neu starten
systemctl restart mcp
```

---

## 🔍 Schritt 6: n8n kann Server erreichen?

### Von n8n Container/Server aus:

```bash
# Falls n8n auf Hetzner Server läuft (Docker)
docker exec -it n8n-container curl http://138.199.237.34:7000/health

# Falls n8n auf anderem Server läuft
# SSH zum n8n Server und:
curl http://138.199.237.34:7000/health
```

**Falls Fehler:**
- Firewall blockiert zwischen Servern
- Netzwerk-Routing-Problem
- n8n läuft in isoliertem Netzwerk (Docker)

---

## 🔧 Lösung 1: Firewall öffnen

### Auf Hetzner Server:

```bash
# Port 7000 für alle öffnen (wenn sicher)
ufw allow 7000/tcp

# Oder nur für n8n Server IP
# ufw allow from <n8n-server-ip> to any port 7000

# Firewall neu laden
ufw reload
```

---

## 🔧 Lösung 2: MCP Server neu starten

```bash
# Auf Hetzner Server
systemctl restart mcp

# Status prüfen
systemctl status mcp

# Logs prüfen
journalctl -u mcp -n 50
```

---

## 🔧 Lösung 3: n8n Workflow URL prüfen

### In n8n Workflow:

**Prüfe die URL im "Marketing Agent" Node:**

1. **Workflow öffnen**
2. **"Marketing Agent" Node** doppelklicken
3. **URL-Feld prüfen:**
   - ✅ Korrekt: `http://138.199.237.34:7000/agent/marketing`
   - ❌ Falsch: `http://localhost:7000/agent/marketing`
   - ❌ Falsch: `https://138.199.237.34:7000/agent/marketing` (HTTPS)
   - ❌ Falsch: `http://138.199.237.34:7000/agents/marketing` (mit 's')

4. **Falls falsch, korrigieren:**
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Method: `POST`
   - Content-Type: `json`
   - Body: `{{ JSON.stringify({ message: '...' }) }}`

5. **Save** klicken

---

## 🔧 Lösung 4: n8n Docker Network prüfen

### Falls n8n in Docker läuft:

```bash
# Prüfe Docker Network
docker network ls

# Prüfe n8n Container Network
docker inspect n8n-container | grep -A 10 "Networks"

# Falls n8n in isoliertem Network:
# Option 1: Host-Network verwenden
docker run --network host n8n

# Option 2: Externe IP verwenden (nicht localhost)
# In Workflow: http://138.199.237.34:7000 (nicht localhost)
```

---

## 🧪 Test-Befehle

### 1. MCP Server Health Check

```bash
curl http://138.199.237.34:7000/health
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "port": 7000,
  "service": "mcp-server"
}
```

### 2. Marketing Agent direkt testen

```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "agent": "marketing",
  "response": "...",
  "tokens": 123,
  "model": "gpt-4"
}
```

### 3. Von n8n Server aus testen

```bash
# Falls n8n auf Hetzner Server (gleicher Server)
curl http://localhost:7000/health

# Falls n8n auf anderem Server
curl http://138.199.237.34:7000/health
```

---

## ✅ Checkliste

- [ ] MCP Server läuft (`systemctl status mcp`)
- [ ] Port 7000 ist offen (`netstat -tlnp | grep 7000`)
- [ ] Health Check funktioniert (`curl http://138.199.237.34:7000/health`)
- [ ] Firewall erlaubt Port 7000 (`ufw status`)
- [ ] MCP Server bindet auf 0.0.0.0 (nicht nur localhost)
- [ ] n8n Workflow URL ist korrekt (`http://138.199.237.34:7000/agent/marketing`)
- [ ] n8n kann Server erreichen (von n8n Server aus testen)

---

## 🚨 Häufige Probleme

### Problem 1: "Connection refused"

**Ursache:** MCP Server läuft nicht oder bindet nur auf localhost

**Lösung:**
```bash
# Server starten
systemctl start mcp

# Oder Server.js prüfen (muss auf 0.0.0.0 binden)
```

### Problem 2: "Connection timeout"

**Ursache:** Firewall blockiert Port 7000

**Lösung:**
```bash
# Firewall öffnen
ufw allow 7000/tcp
```

### Problem 3: "Cannot reach server"

**Ursache:** n8n läuft in isoliertem Docker Network

**Lösung:**
- Externe IP verwenden (nicht localhost)
- Docker Network konfigurieren
- Host-Network verwenden

---

## 📋 Schnell-Fix

### Wenn nichts funktioniert:

```bash
# Auf Hetzner Server
# 1. MCP Server neu starten
systemctl restart mcp

# 2. Firewall öffnen
ufw allow 7000/tcp

# 3. Status prüfen
systemctl status mcp
curl http://localhost:7000/health

# 4. Von außen testen (vom lokalen Rechner)
curl http://138.199.237.34:7000/health
```

**Falls Health Check funktioniert, aber n8n nicht:**
- n8n Workflow URL prüfen
- n8n Docker Network prüfen
- n8n Server Firewall prüfen

---

## ✅ Nach dem Fix

### Workflow in n8n testen:

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken
3. **Erwartung:**
   - ✅ Marketing Agent wird aufgerufen
   - ✅ Antwort kommt zurück
   - ✅ Mattermost erhält Nachricht

---

**Status:** 🔧 **Troubleshooting-Anleitung erstellt!**

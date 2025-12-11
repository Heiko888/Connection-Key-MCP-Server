# ⚡ n8n → MCP Server Verbindung - Quick Fix

**Fehler:** "The service refused the connection - perhaps it is offline"

---

## 🚀 Schnell-Diagnose (5 Minuten)

### Schritt 1: MCP Server Status prüfen

**Auf Hetzner Server (138.199.237.34):**

```bash
# SSH zum Server
ssh root@138.199.237.34

# Status prüfen
systemctl status mcp

# Falls nicht aktiv:
systemctl start mcp
systemctl enable mcp
```

### Schritt 2: Health Check testen

```bash
# Vom Server selbst
curl http://localhost:7000/health

# Von außen (vom lokalen Rechner)
curl http://138.199.237.34:7000/health
```

**Erwartete Antwort:**
```json
{"status":"ok","port":7000,"service":"mcp-server"}
```

### Schritt 3: Port prüfen

```bash
# Auf Hetzner Server
netstat -tlnp | grep 7000

# Sollte zeigen:
# tcp  0  0  0.0.0.0:7000  LISTEN  <PID>/node
```

### Schritt 4: Firewall prüfen

```bash
# Firewall Status
ufw status

# Falls Port 7000 nicht erlaubt:
ufw allow 7000/tcp
ufw reload
```

---

## 🔧 Schnell-Fix (wenn Server nicht läuft)

```bash
# Auf Hetzner Server
systemctl restart mcp
ufw allow 7000/tcp
curl http://localhost:7000/health
```

---

## 🔧 Schnell-Fix (wenn n8n Server nicht erreichen kann)

### Falls n8n auf anderem Server läuft:

1. **Firewall öffnen:**
```bash
# Auf Hetzner Server
ufw allow from <n8n-server-ip> to any port 7000
```

2. **n8n Workflow URL prüfen:**
   - ✅ `http://138.199.237.34:7000/agent/marketing`
   - ❌ `http://localhost:7000/agent/marketing` (funktioniert nicht von anderem Server)

### Falls n8n auf gleichem Server läuft (Docker):

1. **Docker Network prüfen:**
```bash
# n8n Container kann localhost nicht erreichen
# Verwende externe IP:
# http://138.199.237.34:7000/agent/marketing
```

---

## ✅ Test-Befehl

```bash
# Marketing Agent direkt testen
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Falls dieser Befehl funktioniert, aber n8n nicht:**
- n8n Workflow URL prüfen
- n8n Docker Network prüfen

---

## 📋 Häufigste Lösung

**90% der Fälle:**
```bash
# Auf Hetzner Server
systemctl restart mcp
ufw allow 7000/tcp
```

**Dann in n8n Workflow prüfen:**
- URL: `http://138.199.237.34:7000/agent/marketing` (nicht localhost!)
- Method: `POST`
- Content-Type: `json`

---

**Status:** ⚡ **Quick Fix Anleitung erstellt!**

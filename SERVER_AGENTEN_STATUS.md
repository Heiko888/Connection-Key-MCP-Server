# 🖥️ Agenten-Status auf Hetzner Server

## 📍 Aktuelle Situation auf Hetzner Server (138.199.237.34)

### ✅ Läuft bereits:

1. **chatgpt-agent** (Docker)
   - Port: **4000**
   - Status: ✅ Läuft (via Docker Compose)
   - Health: `http://localhost:4000/health`
   - Funktion: Chat-Interface, Multi-Tool-Integration, Session-Management

2. **n8n** (Docker)
   - Port: **5678**
   - Status: ✅ Läuft (via Docker Compose)
   - URL: `https://n8n.werdemeisterdeinergedankenagent.de`

3. **connection-key** (Docker)
   - Port: **3000**
   - Status: ✅ Läuft (via Docker Compose)
   - Funktion: Zentrale API, nutzt chatgpt-agent

4. **MCP Server** (PM2/Systemd)
   - Port: **7000**
   - Status: ✅ Läuft
   - Funktion: Multi-Agent Control Protocol (Marketing, Automation, Sales, Social-YouTube)

### ⚠️ Noch nicht gestartet:

5. **Reading Agent** (PM2)
   - Port: **4001** (oder 4000 wenn chatgpt-agent gestoppt wird)
   - Status: ⚠️ Noch nicht gestartet
   - Funktion: Spezialisiert auf Human Design Readings
   - Deployment: PM2 (unabhängig von Docker)

## 🔄 Port-Konflikte

**Problem:** Port 4000 wird bereits vom `chatgpt-agent` verwendet.

**Lösung:** Reading Agent auf Port 4001 konfigurieren.

## 📋 Nächste Schritte auf Hetzner Server

```bash
cd /opt/mcp-connection-key/production

# 1. Setze AGENT_SECRET
NEW_SECRET=$(openssl rand -hex 32)
sed -i '/^AGENT_SECRET=/d' ../production/.env
echo "AGENT_SECRET=$NEW_SECRET" >> ../production/.env

# 2. Ändere Port auf 4001
sed -i 's/^MCP_PORT=4000/MCP_PORT=4001/' ../production/.env

# 3. Starte Reading Agent
chmod +x start.sh
./start.sh

# 4. Prüfe Status
pm2 status reading-agent
curl http://localhost:4001/health
```

## 🖥️ Lokale Situation (Windows)

### ✅ Konfiguriert:

1. **mcp.json** (Cursor IDE)
   - OpenAI API Key: ✅ Gesetzt
   - Funktion: Lokaler MCP Server für Cursor IDE
   - Status: ✅ Konfiguriert, funktioniert

2. **.env** (Lokal)
   - OpenAI API Key: ✅ Gesetzt
   - Funktion: Für lokale Tests

### ❌ Läuft nicht lokal:

- Keine Docker-Container lokal
- Keine PM2-Prozesse lokal
- Nur Konfiguration für Cursor IDE

## 📊 Übersicht: Server vs. Lokal

| Service | Hetzner Server | Lokal (Windows) |
|---------|----------------|----------------|
| **chatgpt-agent** | ✅ Port 4000 (Docker) | ❌ Nicht installiert |
| **Reading Agent** | ⚠️ Port 4001 (PM2) - noch zu starten | ❌ Nicht installiert |
| **n8n** | ✅ Port 5678 (Docker) | ❌ Nicht installiert |
| **connection-key** | ✅ Port 3000 (Docker) | ❌ Nicht installiert |
| **MCP Server** | ✅ Port 7000 (PM2) | ❌ Nicht installiert |
| **mcp.json** | ❌ Nicht relevant | ✅ Konfiguriert (Cursor IDE) |
| **.env** | ✅ Konfiguriert | ✅ Konfiguriert |

## 🎯 Zusammenfassung

**Hetzner Server:**
- ✅ chatgpt-agent läuft (Port 4000)
- ⚠️ Reading Agent muss noch gestartet werden (Port 4001)
- ✅ Alle anderen Services laufen

**Lokal (Windows):**
- ✅ Nur Konfiguration für Cursor IDE
- ❌ Keine Services laufen lokal

## 🚀 Empfehlung

**Für den Hetzner Server:**
- Reading Agent auf Port 4001 starten (damit beide parallel laufen)
- Oder chatgpt-agent stoppen und Reading Agent auf Port 4000 starten

**Für lokal:**
- Nur Cursor IDE mit mcp.json verwenden
- Keine Services lokal nötig


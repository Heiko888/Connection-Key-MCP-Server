# ✅ Server-Setup: CORS & Firewall - Komplett

## 📋 Was wurde vom anderen Server gemeldet

### ✅ Wichtig – Netzwerk & CORS

1. **CORS auf Hetzner Server (138.199.237.34)**
   - MCP Server (Port 7000): CORS für 167.235.224.149 erlauben
   - Reading Agent (Port 4001): CORS für 167.235.224.149 erlauben
   - Der ck-agent hat bereits `app.use(cors())` – sollte funktionieren

2. **Firewall-Regeln**
   - Port 7000 (MCP Server) muss von 167.235.224.149 erreichbar sein
   - Port 4001 (Reading Agent) muss von 167.235.224.149 erreichbar sein

3. **Optional – Frontend-Komponenten**
   - AgentChat.tsx – nicht kritisch (es gibt bereits /ai-chat)
   - ReadingGenerator.tsx – nicht kritisch (wird über API-Routes verwendet)

---

## 🔧 Lösung: Prüf- und Konfigurations-Script

### Auf Hetzner Server (138.199.237.34) ausführen:

```bash
# Script herunterladen (falls nicht vorhanden)
cd /opt/mcp-connection-key

# Script ausführen
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

**Oder manuell (falls Script nicht vorhanden):**

```bash
# 1. CORS für Connection-Key Server
cd /opt/mcp-connection-key
sed -i '/^CORS_ORIGINS=/d' .env
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env

# 2. Firewall öffnen
ufw allow 7000/tcp
ufw allow 4001/tcp

# 3. Services neu starten
docker-compose restart connection-key
systemctl restart mcp
pm2 restart reading-agent

# 4. Prüfen
sleep 3
curl http://localhost:7000/health
curl http://localhost:4001/health
```

---

## ✅ Status-Checkliste

### Hetzner Server (138.199.237.34)

- [ ] **CORS für Connection-Key Server** - `CORS_ORIGINS` in `.env` gesetzt
- [ ] **CORS für MCP Server** - `app.use(cors())` in `server.js` vorhanden
- [ ] **CORS für Reading Agent** - `app.use(cors())` in `production/server.js` vorhanden ✅ (bereits vorhanden)
- [ ] **Firewall Port 7000** - Offen für 167.235.224.149
- [ ] **Firewall Port 4001** - Offen für 167.235.224.149

### CK-App Server (167.235.224.149)

- [ ] **Git Pull** - `integration/` Dateien vorhanden
- [ ] **Environment Variables** - `MCP_SERVER_URL` und `READING_AGENT_URL` gesetzt
- [ ] **API-Routes installiert** - Alle 5 API-Routes vorhanden
- [ ] **App neu gestartet** - Next.js App läuft mit neuen Routes

---

## 🧪 Test: Server-zu-Server Verbindung

### Vom CK-App Server (167.235.224.149) testen:

```bash
# Test MCP Server
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}'

# Test Reading Agent
curl http://138.199.237.34:4001/health
```

**Wenn diese Tests funktionieren:**
- ✅ Netzwerk-Verbindung OK
- ✅ CORS funktioniert
- ✅ Firewall OK

**Wenn diese Tests nicht funktionieren:**
- ❌ CORS-Problem → Prüfen Sie CORS-Konfiguration
- ❌ Firewall-Problem → Prüfen Sie Firewall-Regeln
- ❌ Netzwerk-Problem → Prüfen Sie IP-Adressen

---

## 📊 Zusammenfassung

| Komponente | Status | Aktion |
|------------|--------|--------|
| **CORS Connection-Key** | ⏳ | In `.env` setzen |
| **CORS MCP Server** | ⏳ | Prüfen ob `cors()` vorhanden |
| **CORS Reading Agent** | ✅ | Bereits `app.use(cors())` vorhanden |
| **Firewall Port 7000** | ⏳ | Mit `ufw allow 7000/tcp` öffnen |
| **Firewall Port 4001** | ⏳ | Mit `ufw allow 4001/tcp` öffnen |

---

## 🚀 Nächste Schritte

### 1. Auf Hetzner Server: CORS & Firewall prüfen/konfigurieren

```bash
# Script ausführen
./integration/VERIFY_CORS_FIREWALL.sh

# Oder manuell (siehe oben)
```

### 2. Auf CK-App Server: Deployment durchführen

```bash
# Git Pull
git pull origin main

# Environment Variables setzen
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# API-Routes installieren (falls nicht automatisch)
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# App neu starten
npm run dev
# Oder
pm2 restart nextjs-app
```

### 3. Testen

```bash
# Vom CK-App Server aus
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## ✅ Fazit

**Lokal:** ✅ Alles erledigt  
**Hetzner Server:** ⏳ CORS & Firewall prüfen/konfigurieren  
**CK-App Server:** ⏳ Deployment durchführen

**Die kritischen Komponenten sind implementiert. Nach dem Setup auf beiden Servern sollte die Kommunikation funktionieren!** 🚀


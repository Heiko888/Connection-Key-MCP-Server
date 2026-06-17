# 🚀 Relationship Analysis Agent - Manuelles Deployment (Kurz)

**Datum:** 17.12.2025

**Du bist auf:** MCP Server (`/opt/mcp-connection-key`)  
**Frontend läuft auf:** CK-App Server (`167.235.224.149`)

---

## 📋 Schritt 1: Agent erstellen (auf MCP Server)

```bash
# Auf MCP Server (wo du gerade bist)
cd /opt/mcp-connection-key

# Scripts ausführbar machen
chmod +x create-relationship-analysis-agent.sh

# Agent erstellen
./create-relationship-analysis-agent.sh
```

**Erwartet:**
- ✅ Agent-Config erstellt: `/opt/ck-agent/agents/relationship-analysis-agent.json`
- ✅ Prompt erstellt: `/opt/ck-agent/prompts/relationship-analysis-agent.txt`
- ✅ MCP Server neu gestartet

**Prüfen:**
```bash
# Prüfe ob Agent existiert
ls -la /opt/ck-agent/agents/relationship-analysis-agent.json

# Prüfe ob Agent im MCP Server registriert ist
curl http://localhost:7000/agents | grep relationship-analysis-agent
```

---

## 📋 Schritt 2: Frontend-Dateien auf CK-App Server kopieren

### Option A: Via SSH (vom MCP Server aus)

```bash
# Auf MCP Server: Dateien auf CK-App Server kopieren
ssh root@167.235.224.149 << 'EOF'
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Integration-Verzeichnis existiert
if [ ! -d "integration" ]; then
    echo "❌ Integration-Verzeichnis nicht gefunden!"
    echo "💡 Dateien müssen zuerst auf CK-App Server kopiert werden"
    exit 1
fi

# Komponente kopieren
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# API-Route kopieren
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Frontend-Seite kopieren
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

echo "✅ Frontend-Dateien kopiert"
EOF
```

### Option B: Direkt auf CK-App Server (SSH manuell)

```bash
# SSH zum CK-App Server
ssh root@167.235.224.149

# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Integration-Verzeichnis existiert
ls -la integration/frontend/components/RelationshipAnalysisGenerator.tsx

# Komponente kopieren
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# API-Route kopieren
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Frontend-Seite kopieren
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

# Prüfe ob kopiert wurde
ls -la components/RelationshipAnalysisGenerator.tsx
ls -la app/api/relationship-analysis/generate/route.ts
ls -la app/coach/readings/create/page.tsx
```

---

## 📋 Schritt 3: Environment Variable setzen (auf CK-App Server)

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob .env.local existiert
if [ ! -f ".env.local" ]; then
    touch .env.local
fi

# Prüfe ob MCP_SERVER_URL gesetzt ist
if ! grep -q "MCP_SERVER_URL" .env.local; then
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
    echo "✅ MCP_SERVER_URL hinzugefügt"
else
    echo "✅ MCP_SERVER_URL bereits gesetzt"
fi

# Prüfe
grep MCP_SERVER_URL .env.local
```

---

## 📋 Schritt 4: Frontend neu starten (auf CK-App Server)

### Option A: Docker (empfohlen)

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Prüfe ob docker-compose.yml existiert
ls -la docker-compose.yml

# Frontend neu starten
docker-compose restart frontend

# ODER neu bauen (falls nötig)
docker-compose up -d --build frontend

# Prüfe Status
docker ps | grep frontend
```

### Option B: PM2

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Frontend neu starten
pm2 restart frontend

# ODER neu starten
pm2 stop frontend
pm2 start npm --name "frontend" -- run dev -- -p 3005

# Prüfe Status
pm2 status
```

### Option C: Direkt (npm run dev)

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prozess stoppen (falls läuft)
pkill -f "next dev"

# Neu starten
npm run dev -p 3005 &
```

---

## 📋 Schritt 5: Verifikation

### 5.1 MCP Server prüfen (auf MCP Server)

```bash
# Auf MCP Server
curl http://localhost:7000/agents | grep relationship-analysis-agent
```

**Erwartet:** Agent sollte in der Liste sein

---

### 5.2 Frontend API prüfen (auf CK-App Server)

```bash
# Auf CK-App Server
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

**Erwartet:** JSON-Response mit API-Info

---

### 5.3 Frontend-Seite prüfen

```bash
# Auf CK-App Server
curl -I http://localhost:3005/coach/readings/create
```

**Erwartet:** HTTP 200

**Oder im Browser:**
```
http://167.235.224.149:3005/coach/readings/create
```

---

## 🎯 Komplette Befehls-Sequenz (Copy & Paste)

### Auf MCP Server:

```bash
# ============================================
# SCHRITT 1: Agent erstellen
# ============================================
cd /opt/mcp-connection-key
chmod +x create-relationship-analysis-agent.sh
./create-relationship-analysis-agent.sh

# Prüfe
curl http://localhost:7000/agents | grep relationship-analysis-agent
```

---

### Auf CK-App Server (SSH manuell):

```bash
# SSH zum CK-App Server
ssh root@167.235.224.149

# ============================================
# SCHRITT 2: Frontend-Dateien kopieren
# ============================================
cd /opt/hd-app/The-Connection-Key/frontend

# Komponente
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# API-Route
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Seite
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

# ============================================
# SCHRITT 3: Environment Variable
# ============================================
if ! grep -q "MCP_SERVER_URL" .env.local; then
  echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
fi

# ============================================
# SCHRITT 4: Frontend neu starten
# ============================================
cd /opt/hd-app/The-Connection-Key
docker-compose restart frontend
# ODER: pm2 restart frontend

# ============================================
# SCHRITT 5: Verifikation
# ============================================
sleep 5
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

---

## ✅ Checkliste

- [ ] Agent erstellt (auf MCP Server)
- [ ] Agent im MCP Server registriert
- [ ] Frontend-Dateien auf CK-App Server kopiert
- [ ] Environment Variable gesetzt
- [ ] Frontend neu gestartet
- [ ] MCP Server getestet
- [ ] Frontend API getestet
- [ ] Frontend-Seite getestet

---

## 🔍 Troubleshooting

### Problem: Integration-Verzeichnis fehlt auf CK-App Server

**Lösung:**
```bash
# Von lokal (Windows) auf CK-App Server kopieren
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

---

### Problem: Frontend startet nicht

**Lösung:**
```bash
# Prüfe Logs
docker logs frontend
# ODER
pm2 logs frontend

# Prüfe TypeScript-Fehler
cd /opt/hd-app/The-Connection-Key/frontend
npm run build
```

---

### Problem: API-Route gibt 404

**Lösung:**
```bash
# Prüfe Verzeichnisstruktur
ls -la app/api/relationship-analysis/generate/route.ts

# Prüfe ob Frontend neu gestartet wurde
# Prüfe Frontend-Logs
```

---

**🎉 Fertig!** 🚀

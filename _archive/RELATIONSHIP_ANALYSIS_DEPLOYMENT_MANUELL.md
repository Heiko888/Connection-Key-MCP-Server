# 🚀 Relationship Analysis Agent - Manuelles Deployment

**Datum:** 17.12.2025

**Ziel:** Relationship Analysis Agent komplett auf Server deployen

---

## 📋 Übersicht

Dieses Dokument beschreibt das **manuelle Deployment** des Relationship Analysis Agents Schritt für Schritt.

---

## ✅ Voraussetzungen

- ✅ Zugriff auf Server (SSH)
- ✅ MCP Server läuft (Port 7000)
- ✅ Frontend läuft (Port 3005)
- ✅ Integration-Verzeichnis vorhanden

---

## 🚀 Schritt 1: Agent erstellen

### 1.1 Script auf Server kopieren (falls nicht vorhanden)

```bash
# Auf Server
cd /opt/hd-app/The-Connection-Key

# Prüfe ob Script vorhanden
ls -la create-relationship-analysis-agent.sh
```

**Falls nicht vorhanden:** Script von lokal auf Server kopieren (via `scp` oder manuell erstellen)

---

### 1.2 Agent erstellen

```bash
# Auf Server
cd /opt/hd-app/The-Connection-Key

# Script ausführbar machen
chmod +x create-relationship-analysis-agent.sh

# Script ausführen
./create-relationship-analysis-agent.sh
```

**Erwartete Ausgabe:**
- ✅ Agent-Konfiguration erstellt
- ✅ System-Prompt erstellt
- ✅ MCP Server neu gestartet

---

### 1.3 Agent prüfen

```bash
# Prüfe ob Agent-Config existiert
ls -la /opt/ck-agent/agents/relationship-analysis-agent.json

# Prüfe ob Prompt existiert
ls -la /opt/ck-agent/prompts/relationship-analysis-agent.txt

# Prüfe MCP Server
curl http://localhost:7000/agents | grep relationship-analysis-agent
```

**Erwartet:** Agent sollte in der Liste erscheinen

---

## 🚀 Schritt 2: Frontend-Komponente kopieren

### 2.1 Komponente kopieren

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Integration-Verzeichnis existiert
ls -la integration/frontend/components/RelationshipAnalysisGenerator.tsx

# Komponente kopieren
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# Prüfe ob kopiert wurde
ls -la components/RelationshipAnalysisGenerator.tsx
```

**Erwartet:** Datei existiert in `components/`

---

## 🚀 Schritt 3: API-Route kopieren

### 3.1 API-Route kopieren

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob API-Route existiert
ls -la integration/api-routes/app-router/relationship-analysis/generate/route.ts

# API-Route kopieren
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Prüfe ob kopiert wurde
ls -la app/api/relationship-analysis/generate/route.ts
```

**Erwartet:** Datei existiert in `app/api/relationship-analysis/generate/`

---

## 🚀 Schritt 4: Frontend-Seite kopieren

### 4.1 Seite kopieren

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Seite existiert
ls -la integration/frontend/app/coach/readings/create/page.tsx

# Seite kopieren
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

# Prüfe ob kopiert wurde
ls -la app/coach/readings/create/page.tsx
```

**Erwartet:** Datei existiert in `app/coach/readings/create/`

---

## 🚀 Schritt 5: Environment Variable prüfen

### 5.1 .env.local prüfen

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob .env.local existiert
ls -la .env.local

# Prüfe ob MCP_SERVER_URL gesetzt ist
grep MCP_SERVER_URL .env.local
```

**Erwartet:** `MCP_SERVER_URL=http://138.199.237.34:7000`

---

### 5.2 Environment Variable setzen (falls fehlt)

```bash
# Falls nicht vorhanden
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local

# Prüfe nochmal
grep MCP_SERVER_URL .env.local
```

---

## 🚀 Schritt 6: Frontend neu starten

### 6.1 Prüfe ob Docker verwendet wird

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob docker-compose.yml existiert
ls -la ../docker-compose.yml
```

---

### 6.2 Frontend neu starten (Docker)

```bash
# Falls Docker verwendet wird
cd /opt/hd-app/The-Connection-Key

# Container neu starten
docker-compose restart frontend

# ODER neu bauen (falls nötig)
docker-compose up -d --build frontend

# Prüfe Status
docker ps | grep frontend
```

---

### 6.3 Frontend neu starten (PM2)

```bash
# Falls PM2 verwendet wird
cd /opt/hd-app/The-Connection-Key/frontend

# Prozess neu starten
pm2 restart frontend

# ODER neu starten
pm2 stop frontend
pm2 start npm --name "frontend" -- run dev -- -p 3005

# Prüfe Status
pm2 status
```

---

### 6.4 Frontend neu starten (direkt)

```bash
# Falls direkt mit npm run dev
cd /opt/hd-app/The-Connection-Key/frontend

# Prozess stoppen (falls läuft)
pkill -f "next dev"

# Neu starten
npm run dev -p 3005
```

---

## 🧪 Schritt 7: Verifikation

### 7.1 MCP Server prüfen

```bash
# Prüfe Health
curl http://localhost:7000/health

# Prüfe Agenten-Liste
curl http://localhost:7000/agents | grep relationship-analysis-agent
```

**Erwartet:** Agent sollte in der Liste sein

---

### 7.2 Frontend API prüfen

```bash
# Prüfe API-Endpoint (GET)
curl -X GET http://localhost:3005/api/relationship-analysis/generate

# Erwartet: JSON-Response mit API-Info
```

---

### 7.3 Frontend-Seite prüfen

```bash
# Prüfe ob Seite erreichbar ist
curl -I http://localhost:3005/coach/readings/create

# Erwartet: HTTP 200
```

---

## 📋 Komplette Befehls-Sequenz (Copy & Paste)

```bash
# ============================================
# SCHRITT 1: Agent erstellen
# ============================================
cd /opt/hd-app/The-Connection-Key
chmod +x create-relationship-analysis-agent.sh
./create-relationship-analysis-agent.sh

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
# SCHRITT 3: Environment Variable prüfen
# ============================================
if ! grep -q "MCP_SERVER_URL" .env.local; then
  echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
fi

# ============================================
# SCHRITT 4: Frontend neu starten
# ============================================
# Option A: Docker
cd /opt/hd-app/The-Connection-Key
docker-compose restart frontend

# Option B: PM2
# pm2 restart frontend

# Option C: Direkt
# pkill -f "next dev"
# npm run dev -p 3005

# ============================================
# SCHRITT 5: Verifikation
# ============================================
# Warte 5 Sekunden
sleep 5

# Test MCP Server
curl http://localhost:7000/agents | grep relationship-analysis-agent

# Test Frontend API
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

---

## ✅ Checkliste

- [ ] Agent erstellt (`/opt/ck-agent/agents/relationship-analysis-agent.json`)
- [ ] Prompt erstellt (`/opt/ck-agent/prompts/relationship-analysis-agent.txt`)
- [ ] MCP Server neu gestartet
- [ ] Komponente kopiert (`components/RelationshipAnalysisGenerator.tsx`)
- [ ] API-Route kopiert (`app/api/relationship-analysis/generate/route.ts`)
- [ ] Frontend-Seite kopiert (`app/coach/readings/create/page.tsx`)
- [ ] Environment Variable gesetzt (`MCP_SERVER_URL`)
- [ ] Frontend neu gestartet
- [ ] MCP Server getestet
- [ ] Frontend API getestet
- [ ] Frontend-Seite getestet

---

## 🔍 Troubleshooting

### Problem: Script nicht gefunden

**Lösung:**
```bash
# Script manuell erstellen oder von lokal kopieren
# Siehe create-relationship-analysis-agent.sh
```

---

### Problem: Integration-Verzeichnis nicht gefunden

**Lösung:**
```bash
# Prüfe ob Integration-Verzeichnis existiert
ls -la /opt/hd-app/The-Connection-Key/integration

# Falls nicht vorhanden: Dateien von lokal auf Server kopieren (via scp)
```

---

### Problem: Frontend startet nicht

**Lösung:**
```bash
# Prüfe Logs
docker logs frontend
# ODER
pm2 logs frontend

# Prüfe Fehler
cd /opt/hd-app/The-Connection-Key/frontend
npm run build  # Prüft TypeScript-Fehler
```

---

### Problem: API-Route gibt 404

**Lösung:**
```bash
# Prüfe Verzeichnisstruktur
ls -la app/api/relationship-analysis/generate/route.ts

# Prüfe ob Frontend neu gestartet wurde
# Prüfe Frontend-Logs auf Fehler
```

---

## 🎯 Nächste Schritte

1. **Teste Agent direkt:**
   ```bash
   curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
     -H "Content-Type: application/json" \
     -d '{"message": "Test", "userId": "test"}'
   ```

2. **Teste Frontend API:**
   ```bash
   curl -X POST http://localhost:3005/api/relationship-analysis/generate \
     -H "Content-Type: application/json" \
     -d '{
       "person1": {
         "birthDate": "1980-12-08",
         "birthTime": "22:10",
         "birthPlace": "Berlin, Germany"
       },
       "person2": {
         "birthDate": "1977-06-03",
         "birthTime": "19:49",
         "birthPlace": "München, Germany"
       }
     }'
   ```

3. **Teste Frontend-Seite:**
   - Öffne: `http://167.235.224.149:3005/coach/readings/create`
   - Fülle Formular aus
   - Klicke "Beziehungsanalyse erstellen"

---

**🎉 Deployment abgeschlossen!** 🚀

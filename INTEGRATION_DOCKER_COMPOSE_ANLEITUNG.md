# 🐳 Integration-Dateien einbauen mit Docker Compose

**Datum:** 17.12.2025

**Problem:** Wie baue ich die Integration-Dateien ein, wenn das Frontend mit Docker Compose läuft?

---

## 🔍 Schritt 1: Prüfen wie das Frontend läuft

**Auf dem CK-App Server (167.235.224.149) ausführen:**

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# Prüfe Docker Compose
docker compose ps

# Prüfe ob Frontend-Container läuft
docker ps | grep frontend

# Prüfe ob Frontend direkt läuft (Port 3005)
lsof -i :3005
netstat -tuln | grep 3005
```

---

## 📊 Zwei Möglichkeiten

### Option A: Frontend läuft in Docker

**Dann:**
- Dateien kopieren → Container neu bauen → Container neu starten

### Option B: Frontend läuft direkt (nicht in Docker)

**Dann:**
- Dateien kopieren → Next.js neu starten

---

## 🐳 Option A: Frontend in Docker (wahrscheinlich)

### Schritt 1: Integration-Dateien auf Server kopieren

**Von deinem lokalen Rechner:**

```bash
# Integration-Dateien zum Server kopieren
scp -r integration/ root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

**Oder direkt auf dem Server (falls Git-Repository):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
git pull origin main
```

---

### Schritt 2: API-Routes kopieren

**Auf dem Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Pages Router oder App Router
if [ -d "pages" ]; then
  echo "Pages Router erkannt"
  ROUTER_TYPE="pages"
elif [ -d "app" ]; then
  echo "App Router erkannt"
  ROUTER_TYPE="app"
else
  echo "❌ Weder pages/ noch app/ gefunden!"
  exit 1
fi

# API-Routes kopieren (für Pages Router)
if [ "$ROUTER_TYPE" = "pages" ]; then
  mkdir -p pages/api/agents
  mkdir -p pages/api/reading
  
  cp integration/api-routes/agents-marketing.ts pages/api/agents/marketing.ts
  cp integration/api-routes/agents-automation.ts pages/api/agents/automation.ts
  cp integration/api-routes/agents-sales.ts pages/api/agents/sales.ts
  cp integration/api-routes/agents-social-youtube.ts pages/api/agents/social-youtube.ts
  cp integration/api-routes/app-router/reading/generate/route.ts pages/api/reading/generate.ts
fi

# API-Routes kopieren (für App Router)
if [ "$ROUTER_TYPE" = "app" ]; then
  mkdir -p app/api/agents
  mkdir -p app/api/reading/generate
  
  cp integration/api-routes/app-router/reading/generate/route.ts app/api/reading/generate/route.ts
  # Für App Router müssen die Agent-Routes angepasst werden
  # (siehe integration/api-routes/app-router/)
fi
```

---

### Schritt 3: Frontend-Komponenten kopieren

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Komponenten-Verzeichnis erstellen
mkdir -p components/agents
mkdir -p lib/components

# Komponenten kopieren
cp integration/frontend/components/AgentChat.tsx components/agents/ 2>/dev/null || true
cp integration/frontend/components/ReadingDisplay.tsx lib/components/ 2>/dev/null || true
cp integration/frontend/components/ReadingGenerator.tsx lib/components/ 2>/dev/null || true
```

---

### Schritt 4: Environment Variables prüfen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe .env.local
if [ ! -f ".env.local" ]; then
  echo "Erstelle .env.local..."
  touch .env.local
fi

# Füge fehlende Variablen hinzu
grep -q "MCP_SERVER_URL" .env.local || echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
grep -q "READING_AGENT_URL" .env.local || echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local || echo "SUPABASE_SERVICE_ROLE_KEY=..." >> .env.local
grep -q "N8N_API_KEY" .env.local || echo "N8N_API_KEY=..." >> .env.local
```

---

### Schritt 5: Docker Container neu bauen

**WICHTIG:** Wenn das Frontend in Docker läuft, muss der Container neu gebaut werden!

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Stoppe Frontend-Container
docker compose stop frontend

# 2. Baue Frontend neu (inkludiert neue Dateien)
docker compose build frontend

# 3. Starte Frontend neu
docker compose up -d frontend

# 4. Warte bis Container bereit ist
sleep 10

# 5. Prüfe Logs
docker logs the-connection-key-frontend-1 --tail 30
```

---

### Schritt 6: Prüfen ob es funktioniert

```bash
# Prüfe ob Container läuft
docker ps | grep frontend

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test"}' | python3 -m json.tool
```

---

## ⚙️ Option B: Frontend läuft direkt (nicht in Docker)

**Falls das Frontend direkt läuft (z.B. `npm run dev` oder PM2):**

### Schritt 1-3: Wie bei Option A

(Kopiere Dateien wie oben beschrieben)

### Schritt 4: Next.js neu starten

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Falls PM2:
pm2 restart next-app
# Oder
pm2 reload next-app

# Falls direkt:
# Stoppe den Prozess (Ctrl+C) und starte neu:
npm run dev
# Oder für Production:
npm run build
npm start
```

---

## 🔧 Automatisches Script

**Erstelle ein Script für einfache Integration:**

```bash
# Erstelle: deploy-integration.sh
cat > /opt/hd-app/The-Connection-Key/deploy-integration.sh << 'EOF'
#!/bin/bash

cd /opt/hd-app/The-Connection-Key/frontend

echo "📦 Kopiere Integration-Dateien..."

# API-Routes (Pages Router)
if [ -d "pages" ]; then
  mkdir -p pages/api/agents pages/api/reading
  cp integration/api-routes/agents-*.ts pages/api/agents/ 2>/dev/null || true
  cp integration/api-routes/app-router/reading/generate/route.ts pages/api/reading/generate.ts 2>/dev/null || true
fi

# Komponenten
mkdir -p components/agents lib/components
cp integration/frontend/components/*.tsx components/agents/ 2>/dev/null || true
cp integration/frontend/components/*.tsx lib/components/ 2>/dev/null || true

echo "✅ Dateien kopiert"

# Prüfe Docker
if docker ps | grep -q frontend; then
  echo "🐳 Frontend läuft in Docker - baue Container neu..."
  cd /opt/hd-app/The-Connection-Key
  docker compose build frontend
  docker compose up -d frontend
  echo "✅ Container neu gebaut und gestartet"
else
  echo "⚠️ Frontend läuft nicht in Docker - bitte manuell neu starten"
fi
EOF

chmod +x /opt/hd-app/The-Connection-Key/deploy-integration.sh
```

**Dann einfach ausführen:**

```bash
/opt/hd-app/The-Connection-Key/deploy-integration.sh
```

---

## 📋 Checkliste

- [ ] Prüfe wie Frontend läuft (Docker oder direkt?)
- [ ] Integration-Dateien auf Server kopiert
- [ ] API-Routes kopiert (Pages Router oder App Router?)
- [ ] Frontend-Komponenten kopiert
- [ ] Environment Variables gesetzt (`.env.local`)
- [ ] Container neu gebaut (falls Docker)
- [ ] Frontend neu gestartet
- [ ] API-Routes getestet

---

## 🎯 Zusammenfassung

**Wenn Docker Compose:**
1. Dateien kopieren
2. `docker compose build frontend`
3. `docker compose up -d frontend`

**Wenn direkt:**
1. Dateien kopieren
2. Next.js neu starten (`pm2 restart` oder `npm run dev`)

---

**🔍 Wichtig:** Prüfe zuerst, wie das Frontend läuft, dann wähle die richtige Option! 🚀

# 🐳 Integration einbauen - Schnellanleitung (Docker)

**Status:** Frontend läuft in Docker ✅

**Container:** `the-connection-keyfrontend-1`  
**Port:** 3000

---

## 🚀 Schnell-Deployment (3 Schritte)

### Schritt 1: Integration-Dateien auf Server kopieren

**Von deinem lokalen Rechner:**

```bash
# Integration-Dateien zum Server kopieren
scp -r integration/ root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

**Oder auf dem Server (falls Git-Repository):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
git pull origin main
```

---

### Schritt 2: Dateien ins Frontend kopieren

**Auf dem Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Router-Typ
if [ -d "pages" ]; then
  echo "Pages Router"
  ROUTER_TYPE="pages"
elif [ -d "app" ]; then
  echo "App Router"
  ROUTER_TYPE="app"
fi

# API-Routes kopieren (Pages Router)
if [ "$ROUTER_TYPE" = "pages" ]; then
  mkdir -p pages/api/agents pages/api/reading
  cp integration/api-routes/agents-*.ts pages/api/agents/ 2>/dev/null || true
  cp integration/api-routes/app-router/reading/generate/route.ts pages/api/reading/generate.ts 2>/dev/null || true
fi

# API-Routes kopieren (App Router)
if [ "$ROUTER_TYPE" = "app" ]; then
  mkdir -p app/api/reading/generate
  cp integration/api-routes/app-router/reading/generate/route.ts app/api/reading/generate/route.ts 2>/dev/null || true
fi

# Komponenten kopieren
mkdir -p components/agents lib/components
cp integration/frontend/components/*.tsx components/agents/ 2>/dev/null || true
cp integration/frontend/components/*.tsx lib/components/ 2>/dev/null || true

echo "✅ Dateien kopiert"
```

---

### Schritt 3: Docker Container neu bauen

**WICHTIG:** Container muss neu gebaut werden, damit neue Dateien übernommen werden!

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen (inkludiert neue Dateien)
docker compose build frontend

# Container neu starten
docker compose up -d frontend

# Warte 10 Sekunden
sleep 10

# Prüfe Logs
docker logs the-connection-keyfrontend-1 --tail 30
```

---

## ✅ Testen

```bash
# Prüfe ob Container läuft
docker ps | grep frontend

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test"}' | python3 -m json.tool
```

---

## 🔧 Automatisches Script

**Oder verwende das automatische Script:**

```bash
# Script auf Server kopieren
scp deploy-integration-automatisch.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x deploy-integration-automatisch.sh
./deploy-integration-automatisch.sh
```

---

## 📋 Checkliste

- [ ] Integration-Dateien auf Server kopiert
- [ ] Dateien ins Frontend-Verzeichnis kopiert
- [ ] Docker Container neu gebaut (`docker compose build frontend`)
- [ ] Container neu gestartet (`docker compose up -d frontend`)
- [ ] API-Routes getestet

---

## 🎯 Zusammenfassung

**Da Frontend in Docker läuft:**
1. Dateien kopieren
2. `docker compose build frontend`
3. `docker compose up -d frontend`

**Das war's!** 🚀

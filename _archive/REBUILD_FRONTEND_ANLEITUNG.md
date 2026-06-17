# 🔨 Frontend-Container neu bauen - Anleitung

**Ziel:** Frontend-Container neu bauen, damit alle Routes verfügbar sind

---

## ✅ Lösung: Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren (von lokal)
scp rebuild-frontend-container.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x rebuild-frontend-container.sh
./rebuild-frontend-container.sh
```

---

## 🔄 Alternative: Manuell ausführen

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Prüfe ob Routes lokal existieren
echo "Prüfe Routes..."
ls -la frontend/app/api/ 2>/dev/null || echo "Routes nicht gefunden"

# 2. Stoppe Container
echo "Stoppe Container..."
docker compose stop frontend

# 3. Entferne Container
echo "Entferne Container..."
docker compose rm -f frontend

# 4. Baue neu
echo "Baue Container neu..."
docker compose build frontend

# 5. Starte Container
echo "Starte Container..."
docker compose up -d frontend

# 6. Warte auf Start
echo "Warte 15 Sekunden..."
sleep 15

# 7. Prüfe Status
echo "Prüfe Status..."
docker ps | grep frontend

# 8. Teste API
echo "Teste API..."
curl -s -X GET http://localhost:3000/api/agents/website-ux-agent | head -5
```

---

## ⚠️ Wichtig: Routes müssen lokal sein

**Falls Routes nicht lokal sind:**

```bash
# Prüfe ob Routes in integration/api-routes sind
ls -la integration/api-routes/app-router/

# Kopiere Routes nach frontend/app/api
mkdir -p frontend/app/api
cp -r integration/api-routes/app-router/* frontend/app/api/
```

---

## 🔍 Nach dem Neubau prüfen

```bash
# 1. Prüfe Container-Logs
docker compose logs frontend | tail -50

# 2. Prüfe ob Routes im Container sind
docker exec the-connection-key-frontend-1 find /app/app/api -name "route.ts" -type f

# 3. Teste wichtige Routes
curl -X GET http://localhost:3000/api/agents/website-ux-agent
curl -X GET http://localhost:3000/api/agents/tasks
curl -X GET http://localhost:3000/api/reading/generate
```

---

**🚀 Führe das Script aus, um den Container neu zu bauen!**

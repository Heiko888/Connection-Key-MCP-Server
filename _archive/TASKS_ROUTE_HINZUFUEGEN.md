# 📋 Tasks Route hinzufügen - Anleitung

**Problem:** `/api/agents/tasks` Route fehlt im Build

**Lösung:** Route auf Server kopieren und Container neu bauen

---

## ✅ Lösung: Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren (von lokal)
scp copy-tasks-route-to-server.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x copy-tasks-route-to-server.sh
./copy-tasks-route-to-server.sh
```

---

## 🔄 Alternative: Manuell ausführen

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Erstelle Verzeichnis
mkdir -p frontend/app/api/agents/tasks

# 2. Erstelle route.ts (siehe copy-tasks-route-to-server.sh für vollständigen Inhalt)
# Oder kopiere von lokal:
scp integration/api-routes/app-router/agents/tasks/route.ts \
  root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/tasks/

# 3. Container neu bauen
docker compose build frontend
docker compose restart frontend

# 4. Warte und teste
sleep 15
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## 📋 Route-Inhalt

Die Route-Datei muss in `frontend/app/api/agents/tasks/route.ts` erstellt werden.

**Vollständiger Inhalt:** Siehe `copy-tasks-route-to-server.sh` (enthält die komplette Datei)

---

## 🔍 Nach dem Neubau prüfen

```bash
# 1. Prüfe ob Route im Build ist
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f

# 2. Teste Route
curl -X GET http://localhost:3000/api/agents/tasks

# 3. Teste mit Parametern
curl -X GET "http://localhost:3000/api/agents/tasks?agentId=website-ux-agent&limit=10"
```

---

**🚀 Führe das Script aus, um die Route hinzuzufügen!**

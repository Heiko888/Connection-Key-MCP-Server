# 🔍 Tasks Route 404 - Debug Anleitung

**Problem:** `/api/agents/tasks` gibt 404, obwohl Datei erstellt wurde

**Mögliche Ursachen:**
1. Datei existiert nicht lokal
2. Route ist nicht im Build
3. Build-Fehler
4. Container-Cache

---

## ✅ Lösung: Debug-Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren
scp debug-tasks-route.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x debug-tasks-route.sh
./debug-tasks-route.sh
```

---

## 🔍 Manuelle Prüfung

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Prüfe ob Datei existiert
ls -la frontend/app/api/agents/tasks/route.ts

# 2. Prüfe ob Route im Build ist
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f

# 3. Prüfe Build-Logs
docker compose logs frontend | grep -i error | tail -20

# 4. Prüfe welche Agent-Routes im Build sind
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/*" -name "route.js" -type f | grep -v node_modules
```

---

## 🔧 Lösung: Container OHNE CACHE neu bauen

**Wenn Datei existiert, aber nicht im Build:**

```bash
cd /opt/hd-app/The-Connection-Key

# WICHTIG: --no-cache verwenden!
docker compose build --no-cache frontend

# Container neu starten
docker compose restart frontend

# Warte länger (Next.js Build braucht Zeit)
sleep 30

# Prüfe ob Route jetzt im Build ist
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f

# Teste Route
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## 🔧 Alternative: Route direkt in Container kopieren

**Falls Build nicht funktioniert:**

```bash
# Kopiere Route direkt in Container (wie bei website-ux-agent)
docker exec the-connection-key-frontend-1 mkdir -p /app/app/api/agents/tasks

# Kopiere Datei
docker cp frontend/app/api/agents/tasks/route.ts \
  the-connection-key-frontend-1:/app/app/api/agents/tasks/route.ts

# Container neu starten
docker compose restart frontend

# Warte und teste
sleep 15
curl -X GET http://localhost:3000/api/agents/tasks
```

**Hinweis:** Diese Lösung funktioniert nur, wenn Next.js im Development-Modus läuft. Im Production-Build müssen Routes beim Build vorhanden sein.

---

**🚀 Führe zuerst das Debug-Script aus, um das Problem zu identifizieren!**


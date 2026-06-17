# 🔍 Tasks Route 404 - Weiterhin Problem

**Status:** Route gibt weiterhin 404, obwohl Container OHNE CACHE neu gebaut wurde

**Mögliche Ursachen:**
1. Build-Fehler (TypeScript/Syntax)
2. Datei wurde nach Build erstellt
3. Next.js erkennt Route aus anderem Grund nicht

---

## ✅ Lösung: Prüfe Build-Logs

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Prüfe ob Route im Build ist
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f

# 2. Prüfe Build-Logs auf Fehler
docker compose logs frontend | grep -i "error\|typescript\|tasks" | tail -30

# 3. Prüfe ob Datei korrekt ist
head -20 frontend/app/api/agents/tasks/route.ts
```

---

## 🔧 Lösung: Prüfe TypeScript-Fehler

**Wenn Route nicht im Build ist, prüfe TypeScript:**

```bash
# Prüfe ob TypeScript-Fehler vorhanden sind
docker compose logs frontend | grep -i "typescript\|error\|failed" | tail -50

# Oder prüfe direkt im Container
docker exec the-connection-key-frontend-1 cat /app/app/api/agents/tasks/route.ts 2>/dev/null | head -20
```

---

## 🔧 Alternative: Route direkt in Container kopieren

**Falls Build nicht funktioniert, kopiere Route direkt (wie bei website-ux-agent):**

```bash
# Erstelle Verzeichnis im Container
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

**Hinweis:** Diese Lösung funktioniert nur, wenn Next.js im Development-Modus läuft oder die Route beim Start neu geladen wird.

---

## 🔍 Debug-Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren
scp check-tasks-route-after-build.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x check-tasks-route-after-build.sh
./check-tasks-route-after-build.sh
```

---

**🚀 Führe das Debug-Script aus, um die Ursache zu finden!**

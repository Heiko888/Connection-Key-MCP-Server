# 🔧 Tasks Route 404 Fix

**Problem:** `/api/agents/tasks` gibt 404, obwohl Datei erstellt wurde

**Mögliche Ursachen:**
1. Datei wurde nicht korrekt erstellt
2. Build hat Route nicht erkannt
3. Container muss ohne Cache neu gebaut werden

---

## ✅ Lösung: Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren
scp fix-tasks-route-404.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x fix-tasks-route-404.sh
./fix-tasks-route-404.sh
```

---

## 🔄 Alternative: Manuell

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Prüfe ob Datei existiert
ls -la frontend/app/api/agents/tasks/route.ts

# 2. Falls nicht, erstelle sie (siehe fix-tasks-route-404.sh für Inhalt)

# 3. Container ohne Cache neu bauen
docker compose build --no-cache frontend

# 4. Container neu starten
docker compose restart frontend

# 5. Warte und teste
sleep 20
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## 🔍 Debugging

**Prüfe Build-Logs:**

```bash
# Prüfe ob Route im Build ist
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f

# Prüfe Build-Logs auf Fehler
docker compose logs frontend | grep -i error | tail -20

# Prüfe ob Datei korrekt ist
head -20 frontend/app/api/agents/tasks/route.ts
```

---

**🚀 Führe das Script aus, um die Route zu fixen!**

# 🔧 Tasks Route direkt in Container kopieren

**Problem:** Route ist nicht im Build, obwohl Datei existiert

**Lösung:** Route direkt in Container kopieren (wie bei website-ux-agent)

---

## ✅ Lösung: Script ausführen

**Auf Server ausführen:**

```bash
# Script auf Server kopieren
scp copy-tasks-route-to-container.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x copy-tasks-route-to-container.sh
./copy-tasks-route-to-container.sh
```

---

## 🔄 Alternative: Manuell kopieren

**Auf Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Erstelle Verzeichnis im Container
docker exec the-connection-key-frontend-1 mkdir -p /app/app/api/agents/tasks

# 2. Kopiere Datei
docker cp frontend/app/api/agents/tasks/route.ts \
  the-connection-key-frontend-1:/app/app/api/agents/tasks/route.ts

# 3. Container neu starten
docker compose restart frontend

# 4. Warte und teste
sleep 15
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## ⚠️ Wichtig

**Diese Lösung funktioniert nur, wenn:**
- Next.js im Development-Modus läuft, ODER
- Next.js die Route beim Start neu lädt

**Im Production-Build muss die Route beim Build vorhanden sein!**

---

## 🔍 Nach dem Kopieren prüfen

```bash
# 1. Prüfe ob Datei im Container ist
docker exec the-connection-key-frontend-1 ls -la /app/app/api/agents/tasks/route.ts

# 2. Teste Route
curl -X GET http://localhost:3000/api/agents/tasks

# 3. Prüfe Container-Logs
docker compose logs frontend | tail -20
```

---

**🚀 Führe das Script aus, um die Route direkt in den Container zu kopieren!**

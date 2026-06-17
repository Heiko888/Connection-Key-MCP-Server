# 🔧 Tasks Route Production Fix

**Problem:** Route `/api/agents/tasks` gibt 404 zurück, obwohl Datei im Container existiert

**Ursache:** Next.js läuft im **Production-Modus** - Routen müssen beim **Build-Zeitpunkt** vorhanden sein!

---

## ❌ Warum das direkte Kopieren nicht funktioniert

**Next.js Production-Modus:**
- Routen werden beim **Build** kompiliert (nicht zur Laufzeit)
- Dateien werden in `.next/server/app/api/` kompiliert
- Kopieren zur Laufzeit funktioniert **NICHT** im Production-Modus

**Das bedeutet:**
```bash
# ❌ Funktioniert NICHT im Production-Modus:
docker cp route.ts container:/app/app/api/agents/tasks/route.ts
docker restart container
```

---

## ✅ Lösung: Route beim Build vorhanden machen

**Schritte:**

### 1. Stelle sicher, dass die Datei lokal existiert

```bash
cd /opt/hd-app/The-Connection-Key
ls -la frontend/app/api/agents/tasks/route.ts
```

**Falls nicht vorhanden:**
```bash
mkdir -p frontend/app/api/agents/tasks
# Datei erstellen (siehe Script)
```

### 2. Baue Container neu (OHNE Cache)

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Container
docker compose stop frontend

# Entferne Container
docker compose rm -f frontend

# Baue neu (ohne Cache - wichtig!)
docker compose build --no-cache frontend

# Starte Container
docker compose up -d frontend
```

### 3. Prüfe ob Route im Build vorhanden ist

```bash
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f
```

**Erwartete Ausgabe:**
```
/app/.next/server/app/api/agents/tasks/route.js
```

### 4. Teste API

```bash
curl -X GET http://localhost:3000/api/agents/tasks
```

**Erwartete Ausgabe:**
```json
{
  "success": true,
  "tasks": [],
  "pagination": { "limit": 50, "offset": 0, "total": 0 }
}
```

---

## 🚀 Automatisches Fix-Script

**Script ausführen:**
```bash
# Script auf Server kopieren
scp fix-tasks-route-production.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x fix-tasks-route-production.sh
./fix-tasks-route-production.sh
```

**Das Script macht:**
1. ✅ Prüft ob Datei lokal existiert (erstellt sie falls nicht)
2. ✅ Stoppt Container
3. ✅ Baut Container neu (ohne Cache)
4. ✅ Startet Container
5. ✅ Prüft ob Route im Build vorhanden ist
6. ✅ Testet API

---

## 🔍 Diagnose-Script

**Falls das Problem weiterhin besteht:**
```bash
# Script auf Server kopieren
scp diagnose-tasks-route.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x diagnose-tasks-route.sh
./diagnose-tasks-route.sh
```

**Das Script prüft:**
- Container-Status
- Lokale Datei
- Datei im Container
- Next.js Modus (Development vs Production)
- Route im Build
- Docker Compose Konfiguration
- API Route Test

---

## ⚠️ Wichtig: Bei zukünftigen Änderungen

**Wenn du die Route ändern willst:**

1. **Ändere die lokale Datei:**
   ```bash
   nano frontend/app/api/agents/tasks/route.ts
   ```

2. **Baue Container neu:**
   ```bash
   docker compose build --no-cache frontend
   docker compose up -d frontend
   ```

3. **Oder verwende das Fix-Script:**
   ```bash
   ./fix-tasks-route-production.sh
   ```

---

## 📋 Zusammenfassung

| Problem | Lösung |
|---------|--------|
| Route gibt 404 | Route muss beim Build vorhanden sein |
| Kopieren zur Laufzeit funktioniert nicht | Container neu bauen (ohne Cache) |
| Route nicht im Build | Datei muss lokal existieren: `frontend/app/api/agents/tasks/route.ts` |

---

**🚀 Führe das Fix-Script aus, um die Route zu reparieren!**

# 🔧 Frontend Dependencies fehlen - Fix

**Problem:** Dependencies (`reading-validation.ts`, `reading-response-types.ts`) fehlen im Container

---

## ✅ Schritt 1: Prüfe wo Route-Datei im Container liegt

**Auf Server 167:**

```bash
# Finde Route-Datei im Container
docker exec the-connection-key-frontend-1 find /app -name "route.ts" -type f | grep reading

# Prüfe Container-Struktur
docker exec the-connection-key-frontend-1 ls -la /app/app/api/reading/generate/ 2>/dev/null || echo "Pfad existiert nicht"
docker exec the-connection-key-frontend-1 ls -la /app/app/ 2>/dev/null || echo "app-Verzeichnis existiert nicht"
```

---

## ✅ Schritt 2: Dependencies auf Server kopieren

**Von Windows PowerShell:**

```powershell
# Kopiere Dependencies auf Server
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
```

**Auf Server 167 prüfen:**

```bash
# Prüfe Dateien wurden kopiert
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-validation.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-response-types.ts
```

---

## ✅ Schritt 3: Container neu bauen

**Auf Server 167:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Container stoppen und entfernen
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Container neu bauen
docker build -t the-connection-key-frontend -f Dockerfile .

# Container starten
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend

# Warte 10 Sekunden
sleep 10

# Prüfe Container läuft
docker ps | grep frontend

# Prüfe Dependencies jetzt vorhanden
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-validation.ts
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-response-types.ts
```

---

## ✅ Schritt 4: Route testen

**Auf Server 167:**

```bash
# Teste Route direkt (ohne nginx)
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "basic",
    "focus": "Karriere"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "...",
  "message": "Reading generation started",
  "status": "processing"
}
```

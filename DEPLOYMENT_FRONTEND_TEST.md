# ✅ Frontend Container läuft - Route testen

**Status:** Container erfolgreich gestartet ✅

---

## ✅ Schritt 1: Route testen

**Auf Server 167:**

```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate \
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

---

## ✅ Schritt 2: Falls Fehler auftreten

**Prüfe Container Logs:**

```bash
docker logs the-connection-key-frontend-1 --tail 50 | grep -i "error\|reading"
```

**Prüfe ob Route-Datei korrekt ist:**

```bash
grep -n "requiredFields.*name.*focus" /opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Sollte zeigen:**
```
108:    const requiredFields = ['name', 'birthDate', 'birthTime', 'birthPlace', 'readingType', 'focus'];
```

---

## ✅ Schritt 3: Dependencies prüfen

**Falls Route noch Fehler wirft:**

```bash
# Prüfe ob Dependencies existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-validation.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-response-types.ts
```

**Falls fehlen: Kopiere sie von lokal:**

```powershell
# Von Windows PowerShell
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
```

**Dann Container neu bauen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1
docker build -t the-connection-key-frontend -f Dockerfile .
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend
```

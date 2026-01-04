# 🔄 Frontend API Route aktualisieren - Server 167.235.224.149

**Server IP:** 167.235.224.149

---

## ✅ Schritt 1: Route auf Server kopieren

**Von Windows PowerShell (lokal):**

```powershell
# Route auf Server kopieren
scp integration/api-routes/app-router/reading/generate/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Oder auf Server 167 direkt:**

```bash
# SSH zu Server 167
ssh root@167.235.224.149

# Prüfe ob Git Repository vorhanden
cd /opt/hd-app/The-Connection-Key/frontend
git status

# Falls Git vorhanden: Pull
git pull origin feature/reading-agent-option-a-complete
```

---

## ✅ Schritt 2: Frontend Container neu starten

**Auf Server 167:**

```bash
# Auf Server 167
cd /opt/hd-app/The-Connection-Key/frontend

# Container neu starten (lädt neue Route)
docker-compose restart frontend

# Prüfe Container läuft
docker ps | grep frontend

# Prüfe Logs
docker logs the-connection-key-frontend-1 --tail 20
```

---

## ✅ Schritt 3: Route testen

**Test-Request:**

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
  "readingId": "uuid-here",
  "status": "pending",
  "message": "Reading job created successfully"
}
```

---

## ✅ Schritt 4: Validierung prüfen

**Test mit fehlendem Feld (sollte Fehler geben):**

```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "basic"
  }'
```

**Erwartete Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "name ist ein Pflichtfeld",
    "focus ist ein Pflichtfeld"
  ]
}
```

---

## 📋 Schnell-Befehle (kopierbar)

**1. Route kopieren:**
```powershell
scp integration/api-routes/app-router/reading/generate/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**2. Container neu starten (auf Server 167):**
```bash
cd /opt/hd-app/The-Connection-Key/frontend && docker-compose restart frontend
```

**3. Test:**
```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate -H "Content-Type: application/json" -d '{"name":"Test","birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"basic","focus":"Karriere"}'
```

---

**Nach dem Update sollte die Route die neuen Pflichtfelder korrekt validieren!** ✅

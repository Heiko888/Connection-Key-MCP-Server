# 🔄 Frontend API Route aktualisieren

**Problem:** Route auf Server ist veraltet (25. Dezember)
**Lösung:** Route mit neuer Version aktualisieren

---

## ✅ Schritt 1: Aktuelle Route prüfen

**Auf Server 167:**

```bash
# Prüfe aktuelle Route
head -50 /opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Sollte zeigen:**
- Alte Version ohne `name` und `focus` als Pflichtfelder

---

## ✅ Schritt 2: Route aktualisieren

### Option A: Via Git Pull (falls Repository vorhanden)

```bash
# Auf Server 167
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Git Status
git status

# Pull neueste Änderungen
git pull origin feature/reading-agent-option-a-complete

# ODER falls Branch anders heißt
git pull origin main
```

### Option B: Route direkt kopieren

**Von lokalem Rechner:**

```bash
# Route auf Server kopieren
scp integration/api-routes/app-router/reading/generate/route.ts \
   root@167.xxx.xxx.xxx:/opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Oder auf Server 167 direkt:**

```bash
# Route-Datei erstellen/überschreiben
nano /opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Füge den Inhalt aus `integration/api-routes/app-router/reading/generate/route.ts` ein**

---

## ✅ Schritt 3: Frontend Container neu starten

**Auf Server 167:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Container neu starten (lädt neue Route)
docker-compose restart frontend

# ODER neu bauen (falls nötig)
docker-compose up -d --build frontend
```

**Prüfe Container läuft:**
```bash
docker ps | grep frontend
```

---

## ✅ Schritt 4: Route testen

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

## ✅ Schritt 5: Validierung prüfen

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

## 📋 Checkliste

**Nach Deployment:**

- [ ] Route aktualisiert (neueste Version)
- [ ] Frontend Container neu gestartet
- [ ] Route testet erfolgreich
- [ ] Validierung funktioniert (Fehler bei fehlenden Feldern)
- [ ] End-to-End Test erfolgreich

---

**Nach dem Update sollte die Route die neuen Pflichtfelder `name` und `focus` korrekt validieren!** ✅

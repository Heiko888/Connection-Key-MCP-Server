# 🔧 Frontend Route Dependencies kopieren

**Problem:** Build fehlgeschlagen - Module nicht gefunden:
- `../../../reading-validation`
- `../../../reading-response-types`

**Lösung:** Fehlende Dateien auf Server kopieren

---

## ✅ Schritt 1: Verzeichnisstruktur prüfen

**Auf Server 167:**

```bash
# Prüfe ob integration/api-routes Verzeichnis existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/integration/api-routes/

# Falls nicht vorhanden: Erstelle Verzeichnis
mkdir -p /opt/hd-app/The-Connection-Key/frontend/integration/api-routes
```

---

## ✅ Schritt 2: Dependencies kopieren

**Von Windows PowerShell (lokal):**

```powershell
# 1. reading-validation.ts kopieren
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/reading-validation.ts

# 2. reading-response-types.ts kopieren
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/reading-response-types.ts
```

**Oder beide auf einmal:**

```powershell
# Beide Dateien kopieren
scp integration/api-routes/reading-validation.ts integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
```

---

## ✅ Schritt 3: Verzeichnisstruktur prüfen

**Auf Server 167:**

```bash
# Prüfe Dateien existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/integration/api-routes/

# Sollte zeigen:
# - reading-validation.ts
# - reading-response-types.ts
```

---

## ✅ Schritt 4: Frontend Container neu bauen

**Auf Server 167:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Container neu bauen (falls docker-compose vorhanden)
# ODER manuell neu starten
docker restart the-connection-key-frontend-1

# Prüfe Build-Logs
docker logs the-connection-key-frontend-1 --tail 50
```

**Falls Build fehlschlägt:** Prüfe ob alle Dateien korrekt kopiert wurden

---

## ✅ Schritt 5: Route testen

**Nach erfolgreichem Build:**

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

---

## 📋 Schnell-Befehle (kopierbar)

**1. Verzeichnis erstellen (auf Server 167):**
```bash
mkdir -p /opt/hd-app/The-Connection-Key/frontend/integration/api-routes
```

**2. Dateien kopieren (von Windows PowerShell):**
```powershell
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
```

**3. Container neu starten (auf Server 167):**
```bash
docker restart the-connection-key-frontend-1
```

---

**Nach dem Kopieren der Dependencies sollte der Build erfolgreich sein!** ✅

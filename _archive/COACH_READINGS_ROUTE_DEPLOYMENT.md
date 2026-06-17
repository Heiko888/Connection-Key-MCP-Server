# 🚀 Coach Readings API Route - Deployment

**Datum:** 18.12.2025

---

## ✅ Was wurde erstellt

**Datei:** `integration/api-routes/app-router/coach/readings/route.ts`

Diese Route:
- ✅ Unterstützt `reading_type === 'connection'`
- ✅ Verwendet die Relationship Analysis API bei Connection-Mode
- ✅ Speichert Readings in Supabase
- ✅ Transformiert Daten automatisch zwischen den Formaten

---

## 📋 Manuelles Deployment

### Schritt 1: Datei auf Server kopieren

```bash
# Auf CK-App Server
ssh root@167.235.224.149

# Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings

# Datei kopieren (von lokal)
# Windows PowerShell:
scp integration/api-routes/app-router/coach/readings/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts
```

### Schritt 2: Container neu bauen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Container neu bauen (ohne Cache)
docker compose build --no-cache frontend
```

### Schritt 3: Container neu starten

```bash
# Container neu starten
docker compose up -d frontend

# Warte 5 Sekunden
sleep 5

# Prüfe Status
docker compose ps frontend
```

---

## 🧪 Testen

### GET: API Info

```bash
curl -X GET http://localhost:3000/api/coach/readings
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "message": "Coach Readings API",
  "endpoint": "/api/coach/readings",
  "method": "POST",
  "description": "Erstellt Readings für Coaches (single, connection, penta)",
  "supportedTypes": {
    "connection": "Verwendet Relationship Analysis Agent",
    "single": "Wird noch implementiert",
    "penta": "Wird noch implementiert"
  }
}
```

### POST: Connection Reading

```bash
curl -X POST http://localhost:3000/api/coach/readings \
  -H "Content-Type: application/json" \
  -d '{
    "reading_type": "connection",
    "client_name": "Test",
    "reading_data": {
      "personA": {
        "name": "Heiko",
        "geburtsdatum": "1980-12-08",
        "geburtszeit": "22:10",
        "geburtsort": "Miltenberg, Germany"
      },
      "personB": {
        "name": "Jani",
        "geburtsdatum": "1977-06-03",
        "geburtszeit": "19:49",
        "geburtsort": "Wolfenbüttel, Germany"
      },
      "enabled_sections": ["grundkonstellation", "zentrenDynamik"],
      "options": {
        "includeEscalation": true,
        "includePartnerProfile": true
      }
    }
  }' | jq .
```

---

## 🔍 Funktionsweise

### Daten-Transformation

Die Route transformiert automatisch zwischen den Formaten:

**Input (von `page.tsx`):**
```json
{
  "reading_type": "connection",
  "reading_data": {
    "personA": {
      "name": "Heiko",
      "geburtsdatum": "1980-12-08",
      "geburtszeit": "22:10",
      "geburtsort": "Miltenberg, Germany"
    },
    "personB": {
      "name": "Jani",
      "geburtsdatum": "1977-06-03",
      "geburtszeit": "19:49",
      "geburtsort": "Wolfenbüttel, Germany"
    }
  }
}
```

**Transformiert zu (für Relationship Analysis API):**
```json
{
  "person1": {
    "name": "Heiko",
    "birthDate": "1980-12-08",
    "birthTime": "22:10",
    "birthPlace": "Miltenberg, Germany"
  },
  "person2": {
    "name": "Jani",
    "birthDate": "1977-06-03",
    "birthTime": "19:49",
    "birthPlace": "Wolfenbüttel, Germany"
  },
  "options": {
    "includeEscalation": true,
    "includePartnerProfile": true
  }
}
```

---

## ✅ Status

| Komponente | Status |
|------------|--------|
| Route erstellt | ✅ |
| Relationship Analysis Integration | ✅ |
| Supabase Persistenz | ✅ |
| Daten-Transformation | ✅ |
| **Bereit für Deployment** | ✅ |

---

**🎯 Nach dem Deployment funktioniert die bestehende `page.tsx` mit der Relationship Analysis API!** 🚀




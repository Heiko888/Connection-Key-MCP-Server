# 🐛 Debug-Test: Minimale Supabase-Integration

**Zweck:** Minimaler Test für Supabase-Integration ohne weitere Abhängigkeiten

---

## 📋 Übersicht

1. ✅ Supabase-Tabelle: `debug_test`
2. ✅ Policy: Erlaubt Inserts ohne Auth
3. ✅ API-Route: `POST /api/debug`
4. ❌ Kein Frontend
5. ❌ Kein n8n
6. ❌ Kein MCP

---

## 🗄️ Schritt 1: Supabase-Tabelle erstellen

### Datei

`integration/supabase/migrations/999_debug_test_table.sql`

### Ausführung in Supabase

#### Option A: Supabase Dashboard (SQL Editor)

1. Gehe zu [Supabase Dashboard](https://app.supabase.com)
2. Wähle dein Projekt
3. Klicke auf **SQL Editor** in der linken Sidebar
4. Klicke auf **New Query**
5. Kopiere den Inhalt von `999_debug_test_table.sql`
6. Klicke auf **Run** (oder `Ctrl+Enter`)

#### Option B: Supabase CLI

```bash
# Migration ausführen
supabase db push
```

### ⚠️ FEHLERQUELLE 1: Migration fehlgeschlagen

- **Symptom:** Tabelle existiert nicht
- **Prüfung:**

  ```sql
  SELECT * FROM debug_test;
  ```

- **Lösung:** Migration erneut ausführen, Fehler prüfen

### ⚠️ FEHLERQUELLE 2: Policy nicht erstellt

- **Symptom:** Insert wird blockiert (403 Forbidden)
- **Prüfung:**

  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'debug_test';
  ```

- **Lösung:** Policy manuell erstellen:

  ```sql
  CREATE POLICY "Allow public inserts" ON debug_test
    FOR INSERT
    WITH CHECK (true);
  ```

---

## 🔧 Schritt 2: Environment-Variablen prüfen

### Erforderliche Variablen

```bash
# .env.local (auf Server)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ FEHLERQUELLE 3: Environment-Variablen fehlen

- **Symptom:** `Server configuration error: Supabase credentials missing`
- **Prüfung:**

  ```bash
  # Auf Server
  cd /opt/hd-app/The-Connection-Key/frontend
  grep "SUPABASE" .env.local
  ```

- **Lösung:** Variablen in `.env.local` setzen

### ⚠️ FEHLERQUELLE 4: Service Role Key falsch

- **Symptom:** `Database insert failed` mit 401/403
- **Prüfung:** Key-Länge sollte > 200 Zeichen sein
- **Lösung:** Service Role Key aus Supabase Dashboard kopieren

---

## 🚀 Schritt 3: API-Route testen

### API-Route Datei

`integration/api-routes/app-router/debug/route.ts`

### Deployment

#### Option A: Git Pull (wenn auf Server)

```bash
cd /opt/hd-app/The-Connection-Key
git pull
```

#### Option B: Manuell kopieren

```bash
# Von lokal auf Server
scp integration/api-routes/app-router/debug/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/debug/route.ts
```

#### Container neu starten

```bash
cd /opt/hd-app/The-Connection-Key
docker compose -f docker-compose-redis-fixed.yml restart frontend
```

### Test-Request

```bash
# POST Request
curl -X POST http://localhost:3000/api/debug \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

#### Erwartete Response

```json
{
  "status": "ok"
}
```

### ⚠️ FEHLERQUELLE 5: JSON-Parse-Fehler

- **Symptom:** `Invalid JSON in request body`
- **Prüfung:** Request-Body ist valides JSON
- **Lösung:** Content-Type Header setzen: `Content-Type: application/json`

### ⚠️ FEHLERQUELLE 6: message-Feld fehlt

- **Symptom:** `message field is required and must be a string`
- **Prüfung:** Request-Body enthält `{"message": "..."}`
- **Lösung:** Korrektes JSON senden

### ⚠️ FEHLERQUELLE 7: Tabelle existiert nicht

- **Symptom:** `Database insert failed` mit "relation does not exist"
- **Prüfung:** Migration ausgeführt?
- **Lösung:** Migration in Supabase ausführen

### ⚠️ FEHLERQUELLE 8: Policy blockiert Insert

- **Symptom:** `Database insert failed` mit 403/RLS-Fehler
- **Prüfung:** Policy existiert?
- **Lösung:** Policy erstellen (siehe Schritt 1)

---

## ✅ Erfolgreicher Test

### Erwartetes Verhalten

1. Request:

   ```bash
   curl -X POST http://localhost:3000/api/debug \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello World"}'
   ```

2. Response:

   ```json
   {
     "status": "ok"
   }
   ```

3. **In Supabase prüfen:**

   ```sql
   SELECT * FROM debug_test ORDER BY created_at DESC LIMIT 1;
   ```

   Erwartet:

   ```text
   id: <uuid>
   message: "Hello World"
   created_at: <timestamp>
   ```

---

## 🔍 Debugging

### API-Info abrufen

```bash
curl http://localhost:3000/api/debug
```

#### Response

```json
{
  "endpoint": "/api/debug",
  "method": "POST",
  "description": "Minimaler Supabase-Debug-Test",
  "requiredFields": {
    "message": "string - Die Nachricht, die in die Tabelle geschrieben werden soll"
  },
  "example": {
    "message": "Hello World"
  },
  "possibleErrors": [
    "Supabase credentials missing",
    "Table debug_test does not exist",
    "Policy not created",
    "Invalid JSON",
    "message field missing"
  ]
}
```

### Logs prüfen

```bash
# Docker Container Logs
docker logs the-connection-key-frontend-1 --tail 50

# Sollte zeigen:
# [Debug API] Insert erfolgreich
# ODER
# [Debug API] Error: ...
```

### Supabase Logs prüfen

1. Supabase Dashboard → Logs
2. Prüfe "API Logs" für Fehler

---

## 🧹 Cleanup (Optional)

### Tabelle löschen (nach Test)

```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS debug_test CASCADE;
```

---

## 📝 Zusammenfassung: Mögliche Fehlerquellen

| #   | Fehlerquelle             | Symptom                                    | Lösung                         |
| --- | ------------------------ | ------------------------------------------ | ------------------------------ |
| 1   | Migration fehlgeschlagen | Tabelle existiert nicht                    | Migration erneut ausführen     |
| 2   | Policy nicht erstellt    | Insert blockiert (403)                     | Policy manuell erstellen       |
| 3   | Env-Variablen fehlen     | "Supabase credentials missing"              | `.env.local` prüfen             |
| 4   | Service Role Key falsch  | 401/403 Fehler                             | Key aus Dashboard kopieren      |
| 5   | JSON-Parse-Fehler        | "Invalid JSON"                             | Content-Type Header setzen      |
| 6   | message-Feld fehlt       | "message field is required"                | Korrektes JSON senden           |
| 7   | Tabelle existiert nicht  | "relation does not exist"                  | Migration ausführen             |
| 8   | Policy blockiert         | RLS-Fehler                                 | Policy erstellen                |

---

## ✅ Checkliste

- [ ] Migration in Supabase ausgeführt
- [ ] Tabelle `debug_test` existiert
- [ ] Policy "Allow public inserts" erstellt
- [ ] Environment-Variablen gesetzt (`.env.local`)
- [ ] API-Route deployed (`/app/api/debug/route.ts`)
- [ ] Container neu gestartet
- [ ] Test-Request erfolgreich
- [ ] Daten in Supabase sichtbar

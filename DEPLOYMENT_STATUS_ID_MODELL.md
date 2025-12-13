# 🚀 Deployment: Reading-Status- & ID-Modell

## 📋 Deployment-Checkliste

### ✅ Schritt 1: Supabase Migration ausführen

**Datei:** `integration/supabase/migrations/003_add_processing_status.sql`

**Auf Supabase Dashboard:**
1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Führe aus: `integration/supabase/migrations/003_add_processing_status.sql`

**Oder via Supabase CLI:**
```bash
supabase db push
```

**Prüfen:**
```sql
-- Status-Constraint prüfen
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'readings_status_check';

-- Status-History Tabelle prüfen
SELECT * FROM reading_status_history LIMIT 5;

-- Function prüfen
SELECT get_reading_status('uuid-hier');
```

---

### ✅ Schritt 2: API-Route deployen

**Dateien:**
- `integration/api-routes/app-router/reading/generate/route.ts` (aktualisiert)
- `integration/api-routes/app-router/readings/[id]/status/route.ts` (neu)

**Auf CK-App Server:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Backup erstellen
cp app/api/reading/generate/route.ts app/api/reading/generate/route.ts.backup

# Neue Dateien kopieren
cp integration/api-routes/app-router/reading/generate/route.ts \
   app/api/reading/generate/route.ts

# Status-Route erstellen
mkdir -p app/api/readings/[id]/status
cp integration/api-routes/app-router/readings/[id]/status/route.ts \
   app/api/readings/[id]/status/route.ts

# Prüfen
ls -la app/api/reading/generate/route.ts
ls -la app/api/readings/[id]/status/route.ts
```

---

### ✅ Schritt 3: Frontend Service deployen

**Datei:**
- `integration/frontend/services/readingService.ts`

**Auf CK-App Server:**
```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Service-Verzeichnis erstellen
mkdir -p lib/services

# Service kopieren
cp integration/frontend/services/readingService.ts lib/services/

# Prüfen
ls -la lib/services/readingService.ts
```

---

### ✅ Schritt 4: TypeScript-Kompilierung prüfen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Build testen
npm run build

# Falls Fehler:
# - Import-Pfade prüfen
# - TypeScript-Typen prüfen
# - Dependencies prüfen
```

---

### ✅ Schritt 5: Frontend neu starten

```bash
# PM2 Restart
pm2 restart the-connection-key

# Oder
npm run build && pm2 restart the-connection-key
```

---

### ✅ Schritt 6: Testen

**1. Status-API testen:**
```bash
# Erstelle ein Reading
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'

# Notiere die readingId aus der Response

# Status abrufen
curl "http://localhost:3000/api/readings/{readingId}/status"
```

**2. Frontend testen:**
- Öffne `https://www.the-connection-key.de`
- Teste Reading-Generierung
- Prüfe ob Status-Updates funktionieren

---

## 🚨 Troubleshooting

### Problem: Supabase Migration fehlgeschlagen

**Lösung:**
```sql
-- Prüfe ob Tabelle existiert
SELECT * FROM reading_status_history LIMIT 1;

-- Falls nicht, manuell ausführen:
-- integration/supabase/migrations/003_add_processing_status.sql
```

---

### Problem: API-Route nicht gefunden

**Lösung:**
```bash
# Prüfe ob Dateien vorhanden sind
ls -la app/api/reading/generate/route.ts
ls -la app/api/readings/[id]/status/route.ts

# Falls nicht, manuell kopieren
```

---

### Problem: TypeScript-Fehler

**Lösung:**
```bash
# Prüfe Import-Pfade
grep -r "reading-response-types" app/api/reading/generate/route.ts

# Falls falsch, anpassen:
# Von: ../../../reading-response-types
# Zu: ../../../../reading-response-types (oder entsprechend)
```

---

## ✅ Deployment-Status

- [ ] Supabase Migration ausgeführt
- [ ] API-Route deployed
- [ ] Frontend Service deployed
- [ ] TypeScript-Kompilierung erfolgreich
- [ ] Frontend neu gestartet
- [ ] Tests erfolgreich


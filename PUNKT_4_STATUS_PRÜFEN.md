# 🔍 Punkt 4: Supabase - Was noch zu tun ist

**Datum:** 17.12.2025

**Status:** Prüfung des aktuellen Status

---

## 🚀 Schnellprüfung auf dem Server

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x check-supabase-config.sh
./check-supabase-config.sh
```

**Das Skript prüft:**
- ✅ Sind Supabase Environment Variables gesetzt?
- ✅ Existiert die Migration-Datei?
- ✅ Ist Frontend .env.local konfiguriert?

---

## 📋 Manuelle Prüfung

### 1. Environment Variables prüfen

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key
echo "=== SUPABASE VARIABLEN ==="
grep -E "^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=" .env || echo "⚠️  Fehlende Variablen"
```

**Erwartung:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Falls fehlend:** Siehe unten "Environment Variables setzen"

---

### 2. Migration-Datei prüfen

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key
ls -la integration/supabase/migrations/008_user_registration_trigger.sql
```

**Erwartung:**
- ✅ Datei existiert

---

### 3. Migration ausgeführt? (in Supabase prüfen)

**In Supabase SQL Editor:**

```sql
-- Prüfe ob Funktion existiert
SELECT proname 
FROM pg_proc 
WHERE proname = 'trigger_user_registration_reading';

-- Prüfe ob Trigger existiert
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Funktion sollte existieren
- ✅ Trigger sollte existieren

**Falls nicht:** Migration ausführen (siehe unten)

---

## ✅ Was noch zu tun ist

### Option A: Environment Variables fehlen

**Schritt 1: Supabase Dashboard öffnen**
1. https://supabase.com
2. Projekt auswählen
3. **Settings** → **API**

**Schritt 2: Werte kopieren**
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** (Secret Key) → `SUPABASE_SERVICE_ROLE_KEY`

**Schritt 3: In .env eintragen**
```bash
cd /opt/mcp-connection-key
nano .env
```

**Hinzufügen:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Option B: Migration noch nicht ausgeführt

**Schritt 1: Migration-Datei öffnen**
```bash
cd /opt/mcp-connection-key
cat integration/supabase/migrations/008_user_registration_trigger.sql
```

**Schritt 2: In Supabase ausführen**
1. Supabase Dashboard → SQL Editor
2. SQL kopieren (Zeilen 10-43)
3. In SQL Editor einfügen
4. "Run" klicken

**Wichtig:** Falls Fehler "function net.http_post does not exist" → `pg_net` Extension aktivieren

---

### Option C: Frontend .env.local prüfen (optional)

**Falls Frontend separate .env.local hat:**

```bash
cd /opt/mcp-connection-key/integration/frontend
cat .env.local | grep SUPABASE || echo "⚠️  Supabase Variablen fehlen"
```

**Falls fehlend:**
- `NEXT_PUBLIC_SUPABASE_URL` (aus Supabase Dashboard)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key, nicht service_role!)

---

## 📊 Status-Checkliste

- [ ] `NEXT_PUBLIC_SUPABASE_URL` in `.env`?
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env`?
- [ ] Migration `008_user_registration_trigger.sql` ausgeführt?
- [ ] Funktion `trigger_user_registration_reading()` existiert?
- [ ] Trigger `user_registration_reading_trigger` existiert?
- [ ] Optional: Frontend `.env.local` geprüft?

---

## 🎯 Nächste Schritte

### Falls Environment Variables fehlen (5 Min)
1. Supabase Dashboard → Settings → API
2. Werte kopieren
3. In `.env` eintragen

### Falls Migration fehlt (5 Min)
1. Migration-Datei öffnen
2. SQL kopieren
3. In Supabase SQL Editor ausführen
4. Prüfen (Funktion + Trigger existieren)

---

**🔍 Führe die Prüfung aus und teile mir mit, was fehlt!** 🚀

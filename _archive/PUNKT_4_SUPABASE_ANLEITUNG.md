# 🔧 Punkt 4: Supabase Konfiguration - Schritt für Schritt

**Datum:** 17.12.2025

**Status:** Anleitung für Supabase Konfiguration

---

## 📋 Übersicht

**Was zu erledigen ist:**
1. Migration `008_user_registration_trigger.sql` ausführen
2. Environment Variables prüfen und setzen
3. Frontend .env.local prüfen (optional)

**Aufwand:** 10-15 Minuten

---

## Schritt 1: Migration ausführen

### 1.1 Supabase Dashboard öffnen

1. **Supabase öffnen:** https://supabase.com
2. **Projekt auswählen** (dein ConnectionKey Projekt)
3. **SQL Editor** öffnen (links im Menü)

---

### 1.2 Migration-Datei öffnen

**Datei:** `integration/supabase/migrations/008_user_registration_trigger.sql`

**Auf Server:**
```bash
cd /opt/mcp-connection-key
cat integration/supabase/migrations/008_user_registration_trigger.sql
```

**Oder lokal:** Datei im Workspace öffnen

---

### 1.3 SQL in Supabase ausführen

1. **SQL Editor** in Supabase öffnen
2. **Neue Query** erstellen
3. **SQL kopieren** aus `008_user_registration_trigger.sql`
4. **"Run"** klicken

**Wichtig:** Die Migration ist sicher (siehe `DROP TRIGGER IF EXISTS` Erklärung)

---

### 1.4 Prüfen: Migration erfolgreich?

**In Supabase SQL Editor:**

```sql
-- Prüfe ob Funktion existiert
SELECT proname FROM pg_proc WHERE proname = 'trigger_user_registration_reading';

-- Prüfe ob Trigger existiert
SELECT tgname FROM pg_trigger WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Funktion sollte existieren
- ✅ Trigger sollte existieren

---

## Schritt 2: Environment Variables prüfen

### 2.1 Prüfen: Sind Supabase Variablen gesetzt?

**Auf Server:**

```bash
cd /opt/mcp-connection-key
echo "=== SUPABASE VARIABLEN ==="
grep -E "^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=" .env || echo "⚠️  Fehlende Variablen"
```

---

### 2.2 Supabase URL finden

**In Supabase Dashboard:**
1. **Settings** → **API**
2. **Project URL** kopieren (z.B. `https://xxxxx.supabase.co`)
3. **service_role key** kopieren (Secret Key, nicht anon key!)

---

### 2.3 Environment Variables setzen

**Falls fehlend, in `.env` eintragen:**

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

**Speichern:** Ctrl+O, Enter, Ctrl+X

---

## Schritt 3: Frontend .env.local prüfen (optional)

**Falls Frontend separate .env.local hat:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Prüfe ob .env.local existiert
if [ -f ".env.local" ]; then
  echo "=== FRONTEND .env.local ==="
  grep -E "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)=" .env.local || echo "⚠️  Fehlende Variablen"
else
  echo "⚠️  .env.local nicht gefunden"
  echo "Erstelle .env.local mit Supabase Variablen"
fi
```

**Falls fehlend, erstellen:**

```bash
cd /opt/mcp-connection-key/integration/frontend
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

**Wichtig:** Verwende `anon key` für Frontend, nicht `service_role key`!

---

## Schritt 4: Test

### 4.1 Migration testen

**In Supabase SQL Editor:**

```sql
-- Test: Prüfe ob Trigger funktioniert
-- (Dieser Test erstellt keinen echten User, sondern prüft nur die Struktur)
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Trigger sollte existieren
- ✅ Funktion sollte verknüpft sein

---

### 4.2 Environment Variables testen

**Auf Server:**

```bash
cd /opt/mcp-connection-key
source .env 2>/dev/null || true

# Prüfe ob Variablen gesetzt sind
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "✅ NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
else
  echo "❌ NEXT_PUBLIC_SUPABASE_URL nicht gesetzt"
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
else
  echo "❌ SUPABASE_SERVICE_ROLE_KEY nicht gesetzt"
fi
```

---

## ✅ Checkliste: Punkt 4

- [ ] Migration `008_user_registration_trigger.sql` ausgeführt
- [ ] Funktion `trigger_user_registration_reading()` existiert
- [ ] Trigger `user_registration_reading_trigger` existiert
- [ ] `NEXT_PUBLIC_SUPABASE_URL` in `.env` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env` gesetzt
- [ ] Optional: Frontend `.env.local` geprüft/erstellt

---

## 🎯 Zusammenfassung

**Was erledigt wurde:**
- ✅ Migration ausgeführt
- ✅ Environment Variables gesetzt
- ✅ Frontend konfiguriert (optional)

**Nächste Schritte:**
- ✅ User-Registrierung → Reading Automation funktioniert vollständig
- ✅ Supabase Trigger löst automatisch n8n Webhook aus

---

**🎉 Punkt 4 abgeschlossen! Alle 4 Punkte sind jetzt erledigt!** 🚀

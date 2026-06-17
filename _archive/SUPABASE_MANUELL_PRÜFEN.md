# 🔍 Supabase Konfiguration manuell prüfen

**Datum:** 17.12.2025

**Status:** Schnelle manuelle Prüfung ohne Skript

---

## 🚀 Schnellprüfung auf dem Server

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 SUPABASE ENVIRONMENT VARIABLEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# NEXT_PUBLIC_SUPABASE_URL
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env 2>/dev/null; then
  SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "" ]; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL"
  else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL ist leer"
  fi
else
  echo "❌ NEXT_PUBLIC_SUPABASE_URL nicht gefunden"
fi

# SUPABASE_SERVICE_ROLE_KEY
if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env 2>/dev/null; then
  SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SUPABASE_KEY" ] && [ "$SUPABASE_KEY" != "" ]; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_KEY:0:20}...${SUPABASE_KEY: -10}"
  else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY ist leer"
  fi
else
  echo "❌ SUPABASE_SERVICE_ROLE_KEY nicht gefunden"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 MIGRATION-DATEI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MIGRATION_FILE="integration/supabase/migrations/008_user_registration_trigger.sql"

if [ -f "$MIGRATION_FILE" ]; then
  echo "✅ Migration-Datei gefunden: $MIGRATION_FILE"
  echo ""
  echo "Migration muss in Supabase SQL Editor ausgeführt werden:"
  echo "1. Supabase Dashboard öffnen"
  echo "2. SQL Editor öffnen"
  echo "3. Datei öffnen: $MIGRATION_FILE"
  echo "4. SQL kopieren und ausführen"
else
  echo "❌ Migration-Datei nicht gefunden: $MIGRATION_FILE"
fi
```

---

## 📋 Einfacher: Einzelne Befehle

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key

# 1. Environment Variables prüfen
echo "=== SUPABASE VARIABLEN ==="
grep -E "^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=" .env || echo "⚠️  Fehlende Variablen"

# 2. Migration-Datei prüfen
echo ""
echo "=== MIGRATION-DATEI ==="
ls -la integration/supabase/migrations/008_user_registration_trigger.sql 2>/dev/null && echo "✅ Datei existiert" || echo "❌ Datei nicht gefunden"
```

---

## ✅ Was noch zu tun ist

### Falls Environment Variables fehlen:

1. **Supabase Dashboard öffnen:** https://supabase.com
2. **Settings** → **API**
3. **Werte kopieren:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
4. **In .env eintragen:**
   ```bash
   nano .env
   # Hinzufügen:
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Falls Migration noch nicht ausgeführt:

1. **Migration-Datei öffnen:**
   ```bash
   cat integration/supabase/migrations/008_user_registration_trigger.sql
   ```

2. **In Supabase ausführen:**
   - Supabase Dashboard → SQL Editor
   - SQL kopieren (Zeilen 10-43)
   - In SQL Editor einfügen
   - "Run" klicken

3. **Prüfen:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'trigger_user_registration_reading';
   SELECT tgname FROM pg_trigger WHERE tgname = 'user_registration_reading_trigger';
   ```

---

**🔍 Führe die Prüfung aus!** 🚀

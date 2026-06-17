# 🔍 Supabase Trigger prüfen

**Datum:** 17.12.2025

**Status:** Prüfung ob Trigger `user_registration_reading_trigger` existiert

---

## 🚀 In Supabase SQL Editor prüfen

**In Supabase Dashboard → SQL Editor:**

### 1. Prüfe ob Trigger existiert

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
```
trigger_name                          | table_name | enabled
--------------------------------------|------------|--------
user_registration_reading_trigger     | auth.users | O
```

**Falls leer:** Trigger existiert nicht → Migration ausführen

---

### 2. Prüfe ob Funktion existiert

```sql
SELECT proname 
FROM pg_proc 
WHERE proname = 'trigger_user_registration_reading';
```

**Erwartung:**
```
proname
--------------------------------
trigger_user_registration_reading
```

**Falls leer:** Funktion existiert nicht → Migration ausführen

---

### 3. Prüfe Trigger-Details

```sql
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  t.tgenabled as enabled,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'Enabled'
    WHEN t.tgenabled = 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Trigger existiert
- ✅ Funktion ist verknüpft
- ✅ Status: Enabled

---

## ✅ Status-Interpretation

### Trigger existiert ✅
- Migration wurde erfolgreich ausgeführt
- Trigger ist aktiviert
- Automation sollte funktionieren

### Trigger existiert nicht ❌
- Migration muss noch ausgeführt werden
- Siehe `PUNKT_4_SUPABASE_STATUS.md` für SQL-Code

### Trigger existiert, aber disabled ⚠️
- Trigger muss aktiviert werden:
  ```sql
  ALTER TABLE auth.users ENABLE TRIGGER user_registration_reading_trigger;
  ```

---

## 🧪 Test: Funktioniert der Trigger?

**Nachdem Trigger existiert, kannst du testen:**

**Option 1: Test-User erstellen (in Supabase Dashboard)**
1. **Authentication** → **Users**
2. **"Add user"** klicken
3. **User erstellen** mit `raw_user_meta_data`:
   ```json
   {
     "birth_date": "1990-01-01",
     "birth_time": "12:00",
     "birth_place": "Berlin, Germany"
   }
   ```
4. **Prüfe:** Wurde n8n Webhook aufgerufen? (in n8n Executions prüfen)

**Option 2: Manuell testen (ohne echten User)**
- Trigger-Struktur prüfen (siehe oben)
- n8n Webhook manuell testen (bereits getestet ✅)

---

## 📊 Zusammenfassung

**Falls Trigger existiert:**
- ✅ Migration erfolgreich
- ✅ Automation ist aktiv
- ✅ User-Registrierung → Reading funktioniert automatisch

**Falls Trigger nicht existiert:**
- ⚠️ Migration ausführen (siehe `PUNKT_4_SUPABASE_STATUS.md`)

---

**🔍 Führe die Prüfung in Supabase SQL Editor aus!** 🚀

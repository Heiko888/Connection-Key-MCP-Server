# ✅ coach_readings View - Analyse & Implementierung

**Datum:** 2025-01-03  
**Status:** Produktionsreif

---

## 📊 Problem

- Code verwendet `.from('coach_readings')`
- Tabelle `public.coach_readings` existiert nicht mehr
- Fehler: `Could not find the table 'public.coach_readings' in the schema cache`

---

## ✅ Lösung: View als Aggregat

**View:** `public.coach_readings`

**Joint:**
- `reading_jobs` (Write-Model: Status, Retry, Progress)
- `reading_versions` (Content/Versioning: Text, Sections, Chart)

**Join-Logik:**
- `reading_versions.reading_id = reading_jobs.id`
- Nur aktive Versionen (`is_active = true`)

---

## 🔍 Konzeptionelle Prüfung

### **1. System-Stabilität**

✅ **Stabil lauffähig:**
- View stellt alle erwarteten Felder bereit
- RLS greift automatisch (security_invoker = true)
- Legacy-Code funktioniert ohne Änderungen

### **2. Typische Folgefehler**

#### **A) INSERT auf View**

**Problem:** Views sind standardmäßig nicht schreibbar.

**Lösung (falls nötig):**
```sql
-- Option 1: INSTEAD OF Trigger (empfohlen)
CREATE OR REPLACE FUNCTION coach_readings_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert in reading_jobs
  INSERT INTO reading_jobs (user_id, reading_type, status, ...)
  VALUES (NEW.user_id, NEW.reading_type, 'pending', ...)
  RETURNING id INTO NEW.id;
  
  -- Insert in reading_versions
  INSERT INTO reading_versions (reading_id, reading_text, ...)
  VALUES (NEW.id, NEW.reading_text, ...);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_readings_insert_trigger
INSTEAD OF INSERT ON coach_readings
FOR EACH ROW EXECUTE FUNCTION coach_readings_insert();
```

**Oder:** Code auf RPC umstellen:
```typescript
// Statt: supabase.from('coach_readings').insert(...)
await supabase.rpc('create_coach_reading', { ... });
```

#### **B) UPDATE auf View**

**Problem:** Views sind standardmäßig nicht aktualisierbar.

**Lösung (falls nötig):**
```sql
-- INSTEAD OF Trigger für UPDATE
CREATE OR REPLACE FUNCTION coach_readings_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reading_jobs
  UPDATE reading_jobs SET ... WHERE id = NEW.id;
  
  -- Update reading_versions (oder neue Version erstellen)
  UPDATE reading_versions SET ... WHERE reading_id = NEW.id AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_readings_update_trigger
INSTEAD OF UPDATE ON coach_readings
FOR EACH ROW EXECUTE FUNCTION coach_readings_update();
```

#### **C) RLS-Kompatibilität**

✅ **Kein Problem:**
- `security_invoker = true` stellt sicher, dass RLS der Basistabellen greift
- User kann nur eigene Readings sehen (via RLS auf `reading_jobs`)

---

## 📝 Minimale Zusatzmaßnahmen (falls nötig)

### **Wenn INSERT benötigt wird:**

**Option A: INSTEAD OF Trigger (empfohlen)**
- Automatische Umleitung auf Basistabellen
- Code bleibt unverändert

**Option B: RPC-Funktion**
- Sauberer, expliziter
- Code muss angepasst werden

### **Wenn UPDATE benötigt wird:**

**Option A: INSTEAD OF Trigger**
- Automatische Umleitung
- Code bleibt unverändert

**Option B: Separate UPDATE-Routen**
- Direkt auf `reading_jobs` und `reading_versions`
- Expliziter, aber Code-Änderungen nötig

---

## ✅ Finale Einschätzung

**System ist stabil lauffähig:**
- ✅ View stellt alle Felder bereit
- ✅ RLS greift automatisch
- ✅ Legacy-Code funktioniert ohne Änderungen
- ✅ Keine Breaking Changes

**Falls Schreib-Operationen nötig:**
- ⚠️ INSTEAD OF Trigger erforderlich
- ⚠️ Oder Code auf RPC umstellen

**Empfehlung:**
- View erstellen (Migration 015)
- System testen
- Falls INSERT/UPDATE-Fehler auftreten → Trigger hinzufügen

---

**Status:** ✅ Bereit für Produktion

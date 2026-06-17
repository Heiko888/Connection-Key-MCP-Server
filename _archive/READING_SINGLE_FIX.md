# ✅ Fix: "Cannot coerce the result to a single JSON object"

**Datum:** 2025-01-03  
**Problem:** Reading-Job schlägt fehl mit `progress = 100`  
**Fehler:** `Cannot coerce the result to a single JSON object`

---

## 🔍 Root Cause

Die View `coach_readings` kann manchmal mehrere Zeilen oder keine Zeile zurückgeben (z.B. durch RLS-Filterung oder JOIN-Mehrdeutigkeiten). `.single()` wirft einen Fehler, wenn:
- Mehrere Zeilen zurückgegeben werden
- Keine Zeile zurückgegeben wird

---

## ✅ Fix: `.single()` → `.maybeSingle()`

**Datei:** `frontend/lib/db/readings-v2.ts`

### **Änderung 1: `updateReadingStatus` (Zeile 151-160)**

**Vorher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('current_version_id')
  .eq('id', readingId)
  .single(); // ❌ Wirft Fehler bei 0 oder >1 Zeilen

if (readingError) {
  throw readingError;
}
```

**Nachher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('current_version_id')
  .eq('id', readingId)
  .maybeSingle(); // ✅ Tolerant: 0 oder 1 Zeile

if (readingError) {
  throw readingError;
}

if (!reading) {
  throw new Error(`Reading nicht gefunden: ${readingId}`);
}
```

---

### **Änderung 2: `updateReadingStatus` (Zeile 196-209)**

**Vorher:**
```typescript
const { data, error } = await supabase
  .from('coach_readings')
  .update({...})
  .eq('id', readingId)
  .select()
  .single(); // ❌ Wirft Fehler bei 0 oder >1 Zeilen

if (error) {
  throw error;
}
```

**Nachher:**
```typescript
const { data, error } = await supabase
  .from('coach_readings')
  .update({...})
  .eq('id', readingId)
  .select()
  .maybeSingle(); // ✅ Tolerant: 0 oder 1 Zeile

if (error) {
  throw error;
}

if (!data) {
  throw new Error(`Reading nicht gefunden nach Update: ${readingId}`);
}
```

---

### **Änderung 3: `getReadingV2WithVersions` (Zeile 232-241)**

**Vorher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('*')
  .eq('id', readingId)
  .eq('coach_id', coachId)
  .is('deleted_at', null)
  .single(); // ❌ Wirft Fehler bei 0 oder >1 Zeilen

if (readingError || !reading) {
  return null;
}
```

**Nachher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('*')
  .eq('id', readingId)
  .eq('coach_id', coachId)
  .is('deleted_at', null)
  .maybeSingle(); // ✅ Tolerant: 0 oder 1 Zeile

if (readingError || !reading) {
  return null;
}
```

---

### **Änderung 4: `getLastReadingVersion` (Zeile 303-315)**

**Vorher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('current_version_id')
  .eq('id', readingId)
  .single(); // ❌ Wirft Fehler bei 0 oder >1 Zeilen

if (readingError) {
  if (readingError.code === 'PGRST116') {
    return null;
  }
  console.error('Fehler beim Laden des Readings:', readingError);
  return null;
}
```

**Nachher:**
```typescript
const { data: reading, error: readingError } = await supabase
  .from('coach_readings')
  .select('current_version_id')
  .eq('id', readingId)
  .maybeSingle(); // ✅ Tolerant: 0 oder 1 Zeile

if (readingError) {
  console.error('Fehler beim Laden des Readings:', readingError);
  return null;
}

if (!reading) {
  return null;
}
```

---

## 📝 Zusammenfassung

**Geänderte Datei:**
- `frontend/lib/db/readings-v2.ts`

**Geänderte Funktionen:**
1. `updateReadingStatus` (2x `.single()` → `.maybeSingle()`)
2. `getReadingV2WithVersions` (1x `.single()` → `.maybeSingle()`)
3. `getLastReadingVersion` (1x `.single()` → `.maybeSingle()`)

**Gesamt:** 4x `.single()` → `.maybeSingle()`

---

## ✅ Erwartetes Verhalten

- ✅ Reading-Job kann erfolgreich mit `progress = 100` abschließen
- ✅ Keine "Cannot coerce" Fehler mehr
- ✅ Tolerante Fehlerbehandlung bei fehlenden Readings
- ✅ Keine Breaking Changes

---

**Status:** ✅ Fix implementiert, bereit für Deployment

# 🔍 Supabase JS/TS ↔ DB Audit

**Datum:** 28.12.2024  
**Status:** Vollständige Code-Analyse nach DB-Refactoring

---

## 📊 Gesamteinschätzung

**Kritikalität:** 🟡 **MITTEL-HOCH**

### **Hauptprobleme:**

1. ❌ **Keine Schema-Referenzen:** Code verwendet nur Tabellennamen ohne Schema
2. ⚠️ **Service Role Key überall:** RLS wird komplett umgangen
3. ⚠️ **Viele `.select('*')`:** Performance-Probleme bei großen Tabellen
4. ⚠️ **Keine Views verwendet:** Direkte Tabellenzugriffe statt API-Layer
5. ⚠️ **Keine Migration zu neuen Schemas:** Code zeigt noch auf `public.*`

### **Positive Aspekte:**

✅ RPC-Funktionen werden teilweise verwendet (`get_agent_task_statistics`)  
✅ Indizes sind vorhanden (in DB)  
✅ RLS Policies sind definiert (werden aber umgangen)  
✅ Strukturierte Fehlerbehandlung vorhanden

---

## 1️⃣ Datenbank-Zugriffe: Analyse

### **1.1 Gefundene Tabellen-Zugriffe**

| Tabelle | Anzahl Zugriffe | Dateien | Schema-Referenz |
|---------|----------------|---------|-----------------|
| `readings` | 8 | 4 Dateien | ❌ Keine |
| `reading_jobs` | 6 | 2 Dateien | ❌ Keine |
| `reading_history` | 1 | 1 Datei | ❌ Keine |
| `agent_tasks` | 25+ | 10+ Dateien | ❌ Keine |
| `agent_responses` | 3 | 2 Dateien | ❌ Keine |
| `subscribers` | 2 | 1 Datei | ❌ Keine |
| `debug_test` | 1 | 1 Datei | ❌ Keine |

**Gesamt:** ~46 direkte Tabellenzugriffe ohne Schema-Referenz

### **1.2 RPC-Funktionen**

| Funktion | Verwendungen | Status |
|----------|--------------|--------|
| `get_agent_task_statistics` | 3 | ✅ Verwendet |
| `get_user_readings()` | 0 | ❌ Nicht verwendet (existiert in DB) |
| `get_reading_by_id()` | 0 | ❌ Nicht verwendet (existiert in DB) |
| `get_user_agent_tasks()` | 0 | ❌ Nicht verwendet (existiert in DB) |

**Problem:** Viele RPC-Funktionen existieren in der DB, werden aber nicht genutzt!

### **1.3 SQL-Strings**

**Gefunden:** Keine rohen SQL-Strings im Code ✅

---

## 2️⃣ Architektur-Abgleich

### **2.1 Schema-Migration Status**

**Aktueller Code:** Alle Zugriffe verwenden nur Tabellennamen ohne Schema

```typescript
// ❌ AKTUELL (überall im Code):
supabase.from('readings')
supabase.from('agent_tasks')
supabase.from('reading_jobs')
```

**Erwartet nach DB-Refactoring:**
- Tabellen in `public_core`, `public_features`, `public_future`
- Views als Kompatibilitäts-Layer in `public`

**Problem:** Code zeigt noch auf `public.*` (Standard), aber Tabellen wurden verschoben!

### **2.2 Views als API-Layer**

**Status:** ❌ **NICHT verwendet**

**Erwartet:**
```typescript
// ✅ SOLLTE SEIN:
supabase.from('v_readings')  // View statt Tabelle
supabase.from('v_agent_tasks') // View statt Tabelle
```

**Aktuell:**
```typescript
// ❌ IST:
supabase.from('readings')     // Direkter Tabellenzugriff
supabase.from('agent_tasks')  // Direkter Tabellenzugriff
```

### **2.3 Bewertung pro Datei**

#### **❌ KRITISCH (bricht oder ist unsicher):**

| Datei | Problem | Auswirkung |
|-------|---------|------------|
| `integration/api-routes/app-router/reading/generate/route.ts` | Direkter Zugriff auf `reading_jobs` | ❌ Bricht, wenn Tabelle verschoben wurde |
| `integration/api-routes/app-router/readings/history/route.ts` | Direkter Zugriff auf `readings` | ❌ Bricht, wenn Tabelle verschoben wurde |
| `frontend/lib/agent/task-manager.ts` | Direkter Zugriff auf `agent_tasks` | ❌ Bricht, wenn Tabelle verschoben wurde |
| Alle Agent-Routes | Direkter Zugriff auf `agent_tasks` | ❌ Bricht, wenn Tabelle verschoben wurde |

#### **⚠️ TECHNISCH LAUFFÄHIG, ABER UNSAUBER:**

| Datei | Problem | Auswirkung |
|-------|---------|------------|
| `integration/api-routes/app-router/readings/[id]/route.ts` | `.select('*')` statt gezielte Spalten | ⚠️ Performance-Problem |
| `integration/api-routes/app-router/readings/history/route.ts` | `.select('*')` + Count-Query | ⚠️ Performance-Problem |
| `frontend/lib/agent/task-manager.ts` | `.select('*')` in mehreren Methoden | ⚠️ Performance-Problem |
| Alle Dateien | Service Role Key umgeht RLS | ⚠️ Sicherheitsrisiko |

#### **✅ SAUBER & ZUKUNFTSFÄHIG:**

| Datei | Status | Bemerkung |
|-------|--------|-----------|
| `integration/api-routes/app-router/agents/tasks/route.ts` | ✅ | Verwendet RPC für Statistiken |

---

## 3️⃣ RLS-Kompatibilität

### **3.1 Service Role Key Verwendung**

**Gefunden:** Service Role Key wird in **ALLEM** Server-Code verwendet:

```typescript
// ❌ ÜBERALL:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Umgeht RLS komplett!
);
```

**Betroffene Dateien:**
- `integration/api-routes/app-router/reading/generate/route.ts`
- `integration/api-routes/app-router/readings/history/route.ts`
- `integration/api-routes/app-router/readings/[id]/route.ts`
- `integration/api-routes/app-router/notifications/reading/route.ts`
- `integration/api-routes/app-router/agents/tasks/route.ts`
- Alle Agent-Routes (10+ Dateien)
- `frontend/lib/agent/task-manager.ts` (verwendet ANON_KEY, aber Client-side)

**Problem:** RLS Policies werden komplett umgangen!

### **3.2 RLS-Policies in DB**

**Vorhanden:**
- ✅ `readings`: User kann eigene Readings sehen
- ✅ `reading_jobs`: User kann eigene Jobs sehen
- ✅ `agent_tasks`: User kann eigene Tasks sehen
- ✅ `agent_responses`: Alle können sehen (für n8n)

**Problem:** Werden nicht genutzt, weil Service Role Key verwendet wird!

### **3.3 Client vs. Server Kontext**

**Client-side (Frontend):**
```typescript
// ✅ KORREKT:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ← RLS wird angewendet
);
```

**Server-side (API Routes):**
```typescript
// ❌ PROBLEMATISCH:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← RLS wird umgangen
);
```

**Empfehlung:** Service Role Key nur für Admin-Operationen, nicht für User-Queries!

---

## 4️⃣ Performance & Best Practices

### **4.1 `.select('*')` Probleme**

**Gefunden:** 17+ Vorkommen von `.select('*')`

| Datei | Zeile | Problem | Impact |
|-------|-------|---------|--------|
| `readings/history/route.ts` | 63 | `.select('*')` bei großen Tabellen | 🔴 HOCH |
| `readings/history/route.ts` | 90 | `.select('*', { count: 'exact' })` | 🔴 HOCH |
| `readings/[id]/route.ts` | 52 | `.select('*')` für einzelnes Reading | 🟡 MITTEL |
| `task-manager.ts` | 161, 199 | `.select('*')` in mehreren Methoden | 🟡 MITTEL |
| `agents/tasks/route.ts` | 30 | `.select('*')` für Task-Liste | 🟡 MITTEL |

**Lösung:** Gezielte Spaltenauswahl

```typescript
// ❌ AKTUELL:
.select('*')

// ✅ BESSER:
.select('id, user_id, reading_type, reading_text, created_at')
```

### **4.2 Fehlende Filter**

**Problem:** Queries ohne Filter bei großen Tabellen

```typescript
// ❌ PROBLEMATISCH:
supabase
  .from('readings')
  .select('*')
  .order('created_at', { ascending: false })
  // ← Kein Filter, lädt ALLE Readings!
```

**Besser:**
```typescript
// ✅ BESSER:
supabase
  .from('readings')
  .select('id, reading_type, created_at')
  .eq('user_id', userId)  // ← Filter!
  .order('created_at', { ascending: false })
  .limit(50)
```

### **4.3 RPC-Funktionen nicht genutzt**

**Vorhanden in DB, aber nicht verwendet:**
- `get_user_readings()` - Stattdessen: Direkter Query
- `get_reading_by_id()` - Stattdessen: Direkter Query
- `get_user_agent_tasks()` - Stattdessen: Direkter Query

**Vorteile von RPCs:**
- ✅ Performance (serverseitige Logik)
- ✅ Konsistenz (zentrale Logik)
- ✅ Sicherheit (RLS in Funktion)
- ✅ Wartbarkeit (Änderungen nur in DB)

---

## 5️⃣ Problemliste (Detailliert)

### **A) Kritische Probleme**

#### **A1: Schema-Referenzen fehlen**

**Dateien:** Alle Dateien mit `.from()` Aufrufen

**Problem:**
```typescript
// ❌ AKTUELL:
supabase.from('readings')
// ← Nimmt an, dass Tabelle in 'public' Schema liegt
```

**Auswirkung:**
- ❌ Bricht, wenn Tabellen nach `public_core` oder `public_features` verschoben wurden
- ❌ Keine Views als Kompatibilitäts-Layer verwendet

**Lösung:**
```typescript
// ✅ OPTION 1: View verwenden
supabase.from('v_readings')  // View in public Schema

// ✅ OPTION 2: Schema explizit angeben
supabase.schema('public_core').from('readings')
```

#### **A2: Service Role Key umgeht RLS**

**Dateien:** Alle Server-API-Routes

**Problem:**
```typescript
// ❌ ÜBERALL:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Umgeht RLS!
);
```

**Auswirkung:**
- ⚠️ RLS Policies werden ignoriert
- ⚠️ Sicherheitsrisiko (Zugriff auf alle Daten)
- ⚠️ Keine User-Isolation

**Lösung:**
```typescript
// ✅ OPTION 1: ANON_KEY für User-Queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`  // ← User-Token!
      }
    }
  }
);

// ✅ OPTION 2: Service Role nur für Admin-Operationen
// Nur für: INSERT, UPDATE ohne User-Kontext
```

#### **A3: Tabellen möglicherweise verschoben**

**Problem:** Code zeigt auf Tabellen, die möglicherweise nicht mehr in `public` liegen

**Betroffene Tabellen:**
- `readings` → Möglicherweise in `public_core` oder `public_features`
- `reading_jobs` → Möglicherweise in `public_core`
- `agent_tasks` → Möglicherweise in `public_features`
- `agent_responses` → Möglicherweise in `public_features`

**Lösung:** Prüfen, ob Views existieren oder Schema explizit angeben

---

### **B) Performance-Probleme**

#### **B1: `.select('*')` überall**

**Dateien:**
- `readings/history/route.ts` (2x)
- `readings/[id]/route.ts` (1x)
- `task-manager.ts` (2x)
- `agents/tasks/route.ts` (1x)
- Weitere 10+ Dateien

**Problem:**
```typescript
// ❌ LÄDT ALLE SPALTEN:
.select('*')
```

**Auswirkung:**
- 🔴 Hoher Datenverkehr
- 🔴 Langsame Queries bei großen Tabellen
- 🔴 Unnötige JSONB-Felder werden übertragen

**Lösung:**
```typescript
// ✅ GEZIELTE SPALTEN:
.select('id, user_id, reading_type, reading_text, created_at')
// Oder für komplexe Felder:
.select('id, user_id, reading_type, reading_text, created_at, metadata->tokens')
```

#### **B2: Fehlende Pagination-Limits**

**Dateien:**
- `readings/history/route.ts` - Limit vorhanden ✅
- `task-manager.ts` - Limit vorhanden ✅
- `agents/tasks/route.ts` - Limit vorhanden ✅

**Status:** ✅ Meistens vorhanden

#### **B3: Count-Queries ohne Optimierung**

**Dateien:**
- `readings/history/route.ts` (Zeile 88-97)

**Problem:**
```typescript
// ❌ SEPARATE COUNT-QUERY:
const { count } = await supabase
  .from('readings')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);
```

**Besser:**
```typescript
// ✅ IN EINER QUERY:
const { data, count } = await supabase
  .from('readings')
  .select('id, reading_type, created_at', { count: 'exact' })
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

---

### **C) Architektur-Probleme**

#### **C1: RPC-Funktionen nicht genutzt**

**Vorhanden in DB:**
- `get_user_readings()` - ❌ Nicht verwendet
- `get_reading_by_id()` - ❌ Nicht verwendet
- `get_user_agent_tasks()` - ❌ Nicht verwendet
- `get_agent_task_statistics()` - ✅ Wird verwendet

**Problem:** Code macht manuelle Queries statt RPCs zu nutzen

**Lösung:** RPCs verwenden für:
- User-Readings abrufen
- Einzelnes Reading abrufen
- User-Tasks abrufen

#### **C2: Keine Views als API-Layer**

**Problem:** Direkte Tabellenzugriffe statt Views

**Lösung:** Views erstellen als Kompatibilitäts-Layer:
```sql
-- View für Readings
CREATE VIEW v_readings AS
SELECT * FROM public_core.readings;

-- View für Agent Tasks
CREATE VIEW v_agent_tasks AS
SELECT * FROM public_features.agent_tasks;
```

---

## 6️⃣ Konkrete Lösungsvorschläge

### **6.1 Schema-Migration: Code anpassen**

#### **Option A: Views verwenden (Empfohlen)**

**Schritt 1: Views in DB erstellen**
```sql
-- Views als Kompatibilitäts-Layer
CREATE VIEW public.v_readings AS
SELECT * FROM public_core.readings;

CREATE VIEW public.v_reading_jobs AS
SELECT * FROM public_core.reading_jobs;

CREATE VIEW public.v_agent_tasks AS
SELECT * FROM public_features.agent_tasks;

CREATE VIEW public.v_agent_responses AS
SELECT * FROM public_features.agent_responses;
```

**Schritt 2: Code anpassen**
```typescript
// ❌ ALT:
supabase.from('readings')

// ✅ NEU:
supabase.from('v_readings')  // View statt Tabelle
```

**Vorteile:**
- ✅ Minimaler Code-Change
- ✅ Kompatibilitäts-Layer
- ✅ Einfache Migration

#### **Option B: Schema explizit angeben**

```typescript
// ✅ EXPLIZIT:
supabase.schema('public_core').from('readings')
supabase.schema('public_features').from('agent_tasks')
```

**Nachteile:**
- ⚠️ Mehr Code-Änderungen
- ⚠️ Schema muss überall angegeben werden

### **6.2 RLS-Kompatibilität: Service Role Key reduzieren**

#### **Schritt 1: User-Token für User-Queries**

```typescript
// ✅ NEU: User-Token verwenden
export async function GET(request: NextRequest) {
  // User-Token aus Request extrahieren
  const authHeader = request.headers.get('authorization');
  const userToken = authHeader?.replace('Bearer ', '');

  // ANON_KEY mit User-Token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    }
  );

  // Query mit RLS
  const { data } = await supabase
    .from('v_readings')
    .select('id, reading_type, created_at')
    .eq('user_id', userId);  // ← RLS filtert automatisch!
}
```

#### **Schritt 2: Service Role nur für Admin-Operationen**

```typescript
// ✅ NUR FÜR ADMIN-OPERATIONEN:
function getAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Nur für Admin!
  );
}

// Verwenden für:
// - System-Operationen
// - n8n-Webhooks
// - Admin-Tasks
```

### **6.3 Performance: `.select('*')` ersetzen**

#### **Beispiel 1: Reading History**

```typescript
// ❌ AKTUELL:
let query = supabase
  .from('readings')
  .select('*')  // ← Lädt ALLES
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// ✅ BESSER:
let query = supabase
  .from('v_readings')
  .select('id, user_id, reading_type, reading_text, created_at, metadata->tokens')  // ← Gezielt
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

#### **Beispiel 2: Task Manager**

```typescript
// ❌ AKTUELL:
const { data, error } = await supabase
  .from('agent_tasks')
  .select('*', { count: 'exact' })  // ← Lädt ALLES
  .order('created_at', { ascending: false });

// ✅ BESSER:
const { data, error, count } = await supabase
  .from('v_agent_tasks')
  .select('id, agent_id, agent_name, task_message, status, created_at, updated_at', { count: 'exact' })  // ← Gezielt
  .order('created_at', { ascending: false });
```

### **6.4 RPC-Funktionen nutzen**

#### **Beispiel: Reading History**

```typescript
// ❌ AKTUELL:
const { data: readings, error } = await supabase
  .from('readings')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// ✅ BESSER: RPC verwenden
const { data: readings, error } = await supabase
  .rpc('get_user_readings', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
    p_reading_type: readingType || null
  });
```

**Vorteile:**
- ✅ Performance (serverseitige Logik)
- ✅ Konsistenz
- ✅ RLS in Funktion
- ✅ Wartbarkeit

---

## 7️⃣ Empfohlene Zielarchitektur

### **7.1 Schema-Struktur**

```
public (Views als API-Layer)
├── v_readings → public_core.readings
├── v_reading_jobs → public_core.reading_jobs
├── v_agent_tasks → public_features.agent_tasks
└── v_agent_responses → public_features.agent_responses

public_core (Kern-Daten)
├── readings
├── reading_jobs
└── reading_history

public_features (Feature-Daten)
├── agent_tasks
└── agent_responses

public_future (Experimentelle Features)
└── (zukünftige Tabellen)
```

### **7.2 Code-Struktur**

#### **Was bleibt im Code:**

✅ **API Routes:**
- Input-Validierung
- Business-Logik
- Error-Handling
- Response-Formatierung

✅ **Client-Side:**
- User-Authentifizierung
- Token-Management
- UI-Logik

#### **Was gehört in die DB:**

✅ **Views:**
- Kompatibilitäts-Layer
- Schema-Abstraktion
- Performance-Optimierung

✅ **RPC-Funktionen:**
- Komplexe Queries
- Aggregationen
- Statistiken
- User-spezifische Queries

✅ **RLS Policies:**
- Zugriffskontrolle
- User-Isolation
- Sicherheit

### **7.3 API-Schicht**

#### **Client-Side (Frontend):**
```typescript
// ✅ ANON_KEY mit User-Token
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    }
  }
);

// Views verwenden
const { data } = await supabase
  .from('v_readings')
  .select('id, reading_type, created_at')
  .eq('user_id', userId);
```

#### **Server-Side (API Routes):**
```typescript
// ✅ ANON_KEY für User-Queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`  // ← User-Token!
      }
    }
  }
);

// ✅ Service Role NUR für Admin-Operationen
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Nur Admin!
  );
}
```

---

## 8️⃣ Migrationsplan

### **Phase 1: Views erstellen (DB)**

1. ✅ Views in DB erstellen als Kompatibilitäts-Layer
2. ✅ RLS auf Views anpassen
3. ✅ Testen, ob Views funktionieren

**SQL:**
```sql
-- Views erstellen
CREATE VIEW public.v_readings AS
SELECT * FROM public_core.readings;

CREATE VIEW public.v_reading_jobs AS
SELECT * FROM public_core.reading_jobs;

CREATE VIEW public.v_agent_tasks AS
SELECT * FROM public_features.agent_tasks;

-- RLS auf Views
ALTER VIEW v_readings SET (security_invoker = true);
```

### **Phase 2: Code anpassen (Minimal)**

1. ✅ `.from('readings')` → `.from('v_readings')`
2. ✅ `.from('agent_tasks')` → `.from('v_agent_tasks')`
3. ✅ Testen

**Aufwand:** 1-2 Stunden

### **Phase 3: Performance optimieren**

1. ✅ `.select('*')` → Gezielte Spalten
2. ✅ RPC-Funktionen verwenden
3. ✅ Count-Queries optimieren

**Aufwand:** 2-3 Stunden

### **Phase 4: RLS aktivieren**

1. ✅ Service Role Key reduzieren
2. ✅ User-Token für User-Queries
3. ✅ Service Role nur für Admin

**Aufwand:** 3-4 Stunden

---

## 9️⃣ Priorisierte To-Do-Liste

### **🔴 Priorität 1 (Kritisch - sofort)**

1. **Views erstellen** (DB)
   - [ ] `v_readings` View erstellen
   - [ ] `v_reading_jobs` View erstellen
   - [ ] `v_agent_tasks` View erstellen
   - [ ] `v_agent_responses` View erstellen
   - [ ] RLS auf Views testen

2. **Code auf Views umstellen**
   - [ ] `readings` → `v_readings` (4 Dateien)
   - [ ] `reading_jobs` → `v_reading_jobs` (2 Dateien)
   - [ ] `agent_tasks` → `v_agent_tasks` (10+ Dateien)
   - [ ] `agent_responses` → `v_agent_responses` (2 Dateien)

**Aufwand:** 2-3 Stunden  
**Impact:** 🔴 HOCH - Verhindert Brüche nach Schema-Migration

### **🟡 Priorität 2 (Wichtig - diese Woche)**

3. **Performance optimieren**
   - [ ] `.select('*')` in `readings/history/route.ts` ersetzen
   - [ ] `.select('*')` in `readings/[id]/route.ts` ersetzen
   - [ ] `.select('*')` in `task-manager.ts` ersetzen
   - [ ] `.select('*')` in `agents/tasks/route.ts` ersetzen

4. **RPC-Funktionen nutzen**
   - [ ] `get_user_readings()` verwenden
   - [ ] `get_reading_by_id()` verwenden
   - [ ] `get_user_agent_tasks()` verwenden

**Aufwand:** 3-4 Stunden  
**Impact:** 🟡 MITTEL - Bessere Performance

### **🟢 Priorität 3 (Optional - später)**

5. **RLS aktivieren**
   - [ ] Service Role Key reduzieren
   - [ ] User-Token für User-Queries
   - [ ] Service Role nur für Admin-Operationen

6. **Weitere Optimierungen**
   - [ ] Count-Queries optimieren
   - [ ] Indizes prüfen
   - [ ] Query-Performance messen

**Aufwand:** 4-6 Stunden  
**Impact:** 🟢 NIEDRIG - Bessere Sicherheit

---

## ✅ Zusammenfassung

### **Kritische Probleme:**
1. ❌ Keine Schema-Referenzen → Code bricht nach Schema-Migration
2. ❌ Service Role Key überall → RLS wird umgangen
3. ⚠️ Viele `.select('*')` → Performance-Probleme

### **Lösungen:**
1. ✅ Views als Kompatibilitäts-Layer erstellen
2. ✅ Code auf Views umstellen (minimaler Aufwand)
3. ✅ Performance optimieren (gezielte Spaltenauswahl)
4. ✅ RPC-Funktionen nutzen
5. ✅ RLS aktivieren (User-Token statt Service Role)

### **Empfohlene Reihenfolge:**
1. **Views erstellen** (DB) → 30 Minuten
2. **Code auf Views umstellen** → 1-2 Stunden
3. **Performance optimieren** → 2-3 Stunden
4. **RLS aktivieren** → 3-4 Stunden

**Gesamt-Aufwand:** 6-9 Stunden  
**Impact:** 🔴 HOCH - Verhindert Brüche, verbessert Performance & Sicherheit

---

## 📋 Quick Reference

### **Views erstellen:**
```sql
CREATE VIEW public.v_readings AS SELECT * FROM public_core.readings;
CREATE VIEW public.v_reading_jobs AS SELECT * FROM public_core.reading_jobs;
CREATE VIEW public.v_agent_tasks AS SELECT * FROM public_features.agent_tasks;
```

### **Code anpassen:**
```typescript
// ❌ ALT:
supabase.from('readings')

// ✅ NEU:
supabase.from('v_readings')
```

### **Performance optimieren:**
```typescript
// ❌ ALT:
.select('*')

// ✅ NEU:
.select('id, reading_type, created_at')
```

### **RPC verwenden:**
```typescript
// ❌ ALT:
supabase.from('readings').select('*').eq('user_id', userId)

// ✅ NEU:
supabase.rpc('get_user_readings', { p_user_id: userId })
```

# 🔐 Supabase Service Role Key - Vollständige Anleitung

**Stand:** 28.12.2024

---

## 📋 Was ist der Service Role Key?

Der **Supabase Service Role Key** ist ein **Admin-Key**, der:
- ✅ **Row Level Security (RLS) umgeht**
- ✅ **Vollständigen Zugriff** auf alle Tabellen hat
- ✅ **NUR Server-Side** verwendet werden darf
- ❌ **NIEMALS** im Frontend/Browser verwendet werden darf

---

## 🔍 Wo wird er verwendet?

### **1. API Routes (Server-Side)**

Der Service Role Key wird in **allen API Routes** verwendet, die auf Supabase zugreifen:

#### **Reading APIs:**
- ✅ `integration/api-routes/app-router/reading/generate/route.ts`
- ✅ `integration/api-routes/app-router/readings/[id]/route.ts`
- ✅ `integration/api-routes/app-router/readings/[id]/status/route.ts`
- ✅ `integration/api-routes/app-router/readings/history/route.ts`

#### **Agent APIs:**
- ✅ `integration/api-routes/app-router/agents/marketing/route.ts`
- ✅ `integration/api-routes/app-router/agents/automation/route.ts`
- ✅ `integration/api-routes/app-router/agents/sales/route.ts`
- ✅ `integration/api-routes/app-router/agents/social-youtube/route.ts`
- ✅ `integration/api-routes/app-router/agents/chart-development/route.ts`
- ✅ `integration/api-routes/app-router/agents/website-ux-agent/route.ts`
- ✅ `integration/api-routes/app-router/agents/tasks/route.ts`

#### **Weitere APIs:**
- ✅ `integration/api-routes/app-router/coach/readings/route.ts`
- ✅ `integration/api-routes/app-router/notifications/reading/route.ts`
- ✅ `integration/api-routes/app-router/system/agents/tasks/route.ts`
- ✅ `integration/api-routes/new-subscriber/route.ts`

### **2. Verwendungsbeispiel:**

```typescript
// Server-Side API Route
import { createClient } from '@supabase/supabase-js';

// Supabase Client mit Service Role Key (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Service Role Key
);

// Jetzt kann man alle Daten lesen/schreiben (RLS umgangen)
const { data, error } = await supabase
  .from('readings')
  .select('*');
```

---

## ⚙️ Konfiguration

### **1. Environment Variable**

**Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`

**Wichtig:**
- ✅ **KEIN** `NEXT_PUBLIC_` Prefix!
- ❌ **NIEMALS** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` verwenden!

### **2. Wo konfigurieren?**

#### **Lokal (Development):**
```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTk2ODAwMCwiZXhwIjoxOTYxNTQ0MDAwfQ.xxxxx
```

#### **CK-App Server (Production):**
```bash
# /opt/hd-app/The-Connection-Key/frontend/.env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Docker Compose:**
```yaml
# docker-compose-redis-fixed.yml
services:
  frontend:
    environment:
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
```

---

## 🔑 Service Role Key finden (Supabase Dashboard)

### **Schritt 1: Supabase Dashboard öffnen**
1. Gehe zu [https://app.supabase.com](https://app.supabase.com)
2. Wähle dein Projekt aus

### **Schritt 2: API Settings öffnen**
1. Klicke auf **Settings** (⚙️) in der linken Sidebar
2. Klicke auf **API** unter "Project Settings"

### **Schritt 3: Service Role Key kopieren**
1. Scrolle zu **"Project API keys"**
2. Finde **"service_role"** Key
3. Klicke auf **"Reveal"** oder **"Copy"**
4. Kopiere den **kompletten Key** (beginnt mit `eyJ...`)

**Wichtig:**
- ✅ Kopiere den **kompletten Key** (mehrere hundert Zeichen)
- ✅ Der Key beginnt mit `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ **NIEMALS** den "anon" Key verwenden!

---

## ✅ Prüfen: Ist der Key gesetzt?

### **Lokal prüfen:**
```bash
# Prüfe .env.local
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local

# Sollte zeigen:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Auf Server prüfen:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
grep "SUPABASE_SERVICE_ROLE_KEY" .env.local
```

### **Im Docker Container prüfen:**
```bash
# Prüfe ob Key im Container gesetzt ist
docker exec $(docker ps -q -f name=frontend) env | grep "SUPABASE_SERVICE_ROLE_KEY"

# Sollte zeigen:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Key-Länge prüfen:**
```bash
# Service Role Key sollte ~200-300 Zeichen lang sein
KEY_LENGTH=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d= -f2 | wc -c)
echo "Key-Länge: $KEY_LENGTH Zeichen"

# Sollte > 200 Zeichen sein
```

---

## 🚨 Sicherheitshinweise

### **❌ NIEMALS:**

1. **Service Role Key im Frontend verwenden:**
   ```typescript
   // ❌ FALSCH - Service Role Key im Frontend
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← NIEMALS!
   );
   ```

2. **NEXT_PUBLIC_ Prefix verwenden:**
   ```bash
   # ❌ FALSCH
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=xxxxx
   
   # ✅ RICHTIG
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   ```

3. **Key in Git committen:**
   ```bash
   # ❌ NIEMALS in .env.local committen!
   # ✅ .env.local sollte in .gitignore sein
   ```

4. **Key im Browser/Client-Code verwenden:**
   - Der Key würde im Browser sichtbar sein!
   - Jeder könnte dann auf alle Daten zugreifen!

### **✅ RICHTIG:**

1. **Nur in Server-Side API Routes verwenden:**
   ```typescript
   // ✅ RICHTIG - Server-Side API Route
   export async function POST(request: NextRequest) {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← OK in API Route
     );
   }
   ```

2. **In .env.local speichern (nicht in Git):**
   ```bash
   # ✅ .env.local (nicht in Git)
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   ```

3. **Nur auf Server verfügbar machen:**
   - ✅ In `.env.local` auf Server
   - ✅ In Docker Environment Variables
   - ❌ NIEMALS im Frontend-Bundle

---

## 🔄 Unterschied: Service Role vs Anon Key

| Key | Typ | RLS | Verwendung | Sicherheit |
|-----|-----|-----|------------|------------|
| **Service Role Key** | Secret | ❌ Umgeht RLS | Server-Side ONLY | ⚠️ Vollzugriff |
| **Anon Key** | Public | ✅ RLS aktiv | Frontend/Client | ✅ Eingeschränkt |

### **Warum zwei Keys?**

1. **Anon Key (Frontend):**
   - Für Client-Side Zugriff
   - Row Level Security (RLS) wird angewendet
   - Benutzer kann nur seine eigenen Daten sehen

2. **Service Role Key (Backend):**
   - Für Server-Side Admin-Zugriff
   - Bypass Row Level Security
   - Kann alle Daten lesen/schreiben
   - NUR für Backend-Operationen

---

## 📊 Verwendung in n8n

### **n8n Supabase Node:**

In n8n Workflows kann der Service Role Key auch verwendet werden:

```json
{
  "credentials": {
    "supabase": {
      "apiKey": "{{ $env.SUPABASE_SERVICE_ROLE_KEY }}",
      "url": "{{ $env.NEXT_PUBLIC_SUPABASE_URL }}"
    }
  }
}
```

**Wichtig:**
- ✅ In n8n Credentials konfigurieren
- ✅ Als Environment Variable setzen: `SUPABASE_SERVICE_ROLE_KEY`

---

## 🛠️ Troubleshooting

### **Problem 1: Key fehlt**

**Fehler:**
```
Error: SUPABASE_SERVICE_ROLE_KEY is not defined
```

**Lösung:**
1. Prüfe `.env.local` auf Server
2. Stelle sicher, dass Key gesetzt ist
3. Container neu starten: `docker compose restart frontend`

### **Problem 2: Key zu kurz**

**Fehler:**
```
Invalid API key
```

**Lösung:**
1. Prüfe Key-Länge (sollte > 200 Zeichen sein)
2. Kopiere **kompletten Key** aus Supabase Dashboard
3. Stelle sicher, dass keine Zeilenumbrüche im Key sind

### **Problem 3: RLS blockiert trotz Service Role Key**

**Fehler:**
```
Row Level Security policy violation
```

**Lösung:**
1. Prüfe, dass `SUPABASE_SERVICE_ROLE_KEY` verwendet wird (nicht Anon Key)
2. Prüfe Supabase Client-Initialisierung:
   ```typescript
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Service Role Key!
   );
   ```

### **Problem 4: Key im Frontend sichtbar**

**Fehler:**
- Key erscheint im Browser DevTools

**Lösung:**
1. Prüfe, dass **KEIN** `NEXT_PUBLIC_` Prefix verwendet wird
2. Prüfe, dass Key nur in Server-Side Code verwendet wird
3. Prüfe `.env.local` (nicht `.env`)

---

## ✅ Checkliste

### **Konfiguration:**
- [ ] Service Role Key aus Supabase Dashboard kopiert
- [ ] Key in `.env.local` gesetzt (auf Server)
- [ ] **KEIN** `NEXT_PUBLIC_` Prefix verwendet
- [ ] Key-Länge > 200 Zeichen
- [ ] Key in Docker Environment Variables gesetzt (falls Docker)

### **Verwendung:**
- [ ] Key nur in Server-Side API Routes verwendet
- [ ] Key **NICHT** im Frontend/Client-Code verwendet
- [ ] Supabase Client korrekt initialisiert:
  ```typescript
  createClient(URL, SERVICE_ROLE_KEY)
  ```

### **Sicherheit:**
- [ ] `.env.local` in `.gitignore`
- [ ] Key nicht in Git committed
- [ ] Key nicht im Browser sichtbar
- [ ] Key nur auf Server verfügbar

---

## 📝 Zusammenfassung

**Service Role Key:**
- ✅ **Admin-Key** für Supabase
- ✅ **Bypass Row Level Security**
- ✅ **NUR Server-Side** verwenden
- ❌ **NIEMALS** im Frontend/Browser
- ❌ **KEIN** `NEXT_PUBLIC_` Prefix

**Verwendung:**
- ✅ In allen API Routes
- ✅ In n8n Workflows
- ✅ Für Admin-Operationen

**Sicherheit:**
- ⚠️ Vollzugriff auf alle Daten
- ⚠️ Geheim halten
- ⚠️ Nur Server-Side verwenden


# 🔑 Keys Übersicht - Alle verwendeten Keys

## 🔍 Problem: Zwei verschiedene Keys

Es gibt verschiedene Keys für verschiedene Services. Hier ist die vollständige Übersicht:

---

## 1. Supabase Keys (2 verschiedene!)

### Key 1: NEXT_PUBLIC_SUPABASE_URL
- **Typ:** Public Key (Client-Side)
- **Verwendung:** Frontend, Browser
- **Sicherheit:** Öffentlich sichtbar (kann im Browser gesehen werden)
- **Verwendung:** Supabase Client initialisieren im Frontend

**Beispiel:**
```typescript
// Frontend (Client-Side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ← Public Key
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ← Anon Key (optional)
);
```

**Environment Variable:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Optional
```

---

### Key 2: SUPABASE_SERVICE_ROLE_KEY
- **Typ:** Secret Key (Server-Side ONLY!)
- **Verwendung:** Server-Side API Routes, Backend
- **Sicherheit:** NIEMALS im Frontend verwenden!
- **Verwendung:** Admin-Zugriff auf Supabase (Bypass Row Level Security)

**Beispiel:**
```typescript
// Server-Side API Route
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ← Public URL (OK)
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // ← Service Role Key (Secret!)
);
```

**Environment Variable:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTk2ODAwMCwiZXhwIjoxOTYxNTQ0MDAwfQ.xxxxx
```

**Wichtig:** 
- ✅ Nur in Server-Side Code verwenden
- ❌ NIEMALS im Frontend/Browser
- ❌ NIEMALS in `NEXT_PUBLIC_*` Variablen

---

## 2. n8n API Key

### N8N_API_KEY
- **Typ:** Secret Key (Server-Side)
- **Verwendung:** Authentifizierung für n8n → Next.js API Calls
- **Verwendung:** In API Routes für Authentifizierung

**Beispiel:**
```typescript
// API Route: /api/new-subscriber
const authHeader = request.headers.get('authorization');
const apiKey = authHeader?.replace('Bearer ', '');

if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Environment Variable:**
```bash
N8N_API_KEY=your-secure-api-key-here
```

**Wo wird es verwendet:**
- `integration/api-routes/new-subscriber/route.ts` - Authentifizierung von n8n Webhooks

---

## 3. OpenAI API Key

### OPENAI_API_KEY
- **Typ:** Secret Key
- **Verwendung:** OpenAI API Aufrufe
- **Verwendung:** MCP Server, Reading Agent, ChatGPT Agent

**Environment Variable:**
```bash
OPENAI_API_KEY=sk-proj-xxxxx
```

**Wo wird es verwendet:**
- Hetzner Server: `/opt/mcp-connection-key/.env`
- Hetzner Server: `/opt/mcp-connection-key/production/.env`
- Reading Agent: Production Server

---

## 📋 Vollständige Key-Liste für CK-App Server

### Environment Variables (`.env.local`)

```bash
# ============================================
# Supabase (2 Keys!)
# ============================================
# Public Key (Client-Side) - OK für Frontend
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Optional

# Service Role Key (Server-Side ONLY!) - Secret!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTk2ODAwMCwiZXhwIjoxOTYxNTQ0MDAwfQ.xxxxx

# ============================================
# n8n API Key
# ============================================
N8N_API_KEY=your-secure-api-key-here

# ============================================
# MCP Server & Reading Agent URLs
# ============================================
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001

# ============================================
# CK Agent (Fallback)
# ============================================
CK_AGENT_URL=http://localhost:3000/api/ck-agent
NEXT_PUBLIC_CK_AGENT_URL=http://localhost:3000/api/ck-agent
```

---

## 🔍 Wo werden die Keys verwendet?

### 1. Supabase Keys

**Datei:** `integration/api-routes/new-subscriber/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // ← Public URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!       // ← Service Role Key (Secret!)
);
```

**Wichtig:** 
- `NEXT_PUBLIC_SUPABASE_URL` = Public, kann im Frontend verwendet werden
- `SUPABASE_SERVICE_ROLE_KEY` = Secret, NUR Server-Side!

---

### 2. n8n API Key

**Datei:** `integration/api-routes/new-subscriber/route.ts`

```typescript
// Authentifizierung
const authHeader = request.headers.get('authorization');
const apiKey = authHeader?.replace('Bearer ', '');

if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## ⚠️ Wichtige Unterschiede

### Supabase: Public vs Service Role

| Key | Typ | Verwendung | Sicherheit |
|-----|-----|------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Frontend, Client-Side | ✅ OK für Browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-Side ONLY | ❌ NIEMALS im Frontend! |

### Warum zwei Keys?

1. **Public Key (`NEXT_PUBLIC_SUPABASE_URL`):**
   - Für Frontend-Zugriff
   - Row Level Security (RLS) wird angewendet
   - Benutzer kann nur seine eigenen Daten sehen

2. **Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`):**
   - Für Server-Side Admin-Zugriff
   - Bypass Row Level Security
   - Kann alle Daten lesen/schreiben
   - NUR für Backend-Operationen

---

## 🚨 Häufige Fehler

### Fehler 1: Service Role Key im Frontend

```typescript
// ❌ FALSCH - Service Role Key im Frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← NIEMALS!
);
```

**Problem:** Service Role Key wird im Browser sichtbar!

**Lösung:** Nur in Server-Side API Routes verwenden

---

### Fehler 2: NEXT_PUBLIC_ Prefix für Secret Keys

```bash
# ❌ FALSCH
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=xxxxx  # ← NIEMALS!

# ✅ RICHTIG
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # ← Kein NEXT_PUBLIC_ Prefix!
```

**Problem:** `NEXT_PUBLIC_*` Variablen werden ins Frontend gebundelt!

---

## ✅ Checkliste: Keys richtig konfigurieren

### Auf CK-App Server (`.env.local`):

- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt (Public URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt (Secret Key, kein `NEXT_PUBLIC_` Prefix!)
- [ ] `N8N_API_KEY` gesetzt (für n8n Authentifizierung)
- [ ] `MCP_SERVER_URL` gesetzt
- [ ] `READING_AGENT_URL` gesetzt

### Prüfen:

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Keys
grep -E "SUPABASE|N8N_API_KEY" .env.local

# Sollte zeigen:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# N8N_API_KEY=your-key-here
```

---

## 📝 Zusammenfassung

**Zwei verschiedene Supabase Keys:**

1. **`NEXT_PUBLIC_SUPABASE_URL`** - Public, für Frontend
2. **`SUPABASE_SERVICE_ROLE_KEY`** - Secret, nur Server-Side

**Zusätzlich:**

3. **`N8N_API_KEY`** - Für n8n Authentifizierung

**Alle drei Keys müssen in `.env.local` auf dem CK-App Server gesetzt werden!**


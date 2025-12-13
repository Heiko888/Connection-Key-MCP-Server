# 🔑 Aktuell verwendete API Keys

## 📋 Übersicht: Welche Keys werden aktuell verwendet?

Basierend auf dem aktuellen Code:

---

## ✅ Hauptverwendung: `/api/new-subscriber`

**Datei:** `integration/api-routes/new-subscriber/route.ts`

### Verwendete Keys:

1. **`N8N_API_KEY`** ✅ **AKTIV VERWENDET**
   - **Zeile 23:** Authentifizierung von n8n Webhooks
   ```typescript
   if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```
   - **Zweck:** Authentifizierung für n8n → Next.js API Calls
   - **Benötigt:** ✅ JA

2. **`SUPABASE_SERVICE_ROLE_KEY`** ✅ **AKTIV VERWENDET**
   - **Zeile 14:** Supabase Client initialisieren
   ```typescript
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Wird verwendet!
   );
   ```
   - **Zweck:** Admin-Zugriff auf Supabase (Bypass RLS)
   - **Benötigt:** ✅ JA

3. **`NEXT_PUBLIC_SUPABASE_URL`** ✅ **AKTIV VERWENDET**
   - **Zeile 13:** Supabase URL
   ```typescript
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ← Wird verwendet!
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   ```
   - **Zweck:** Supabase URL
   - **Benötigt:** ✅ JA

---

## ✅ Admin Upload Routes

**Dateien:**
- `integration/api-routes/admin-upload/route.ts`
- `integration/api-routes/admin-upload-knowledge/route.ts`
- `integration/api-routes/admin-upload-workflow/route.ts`

### Verwendete Keys:

**`ADMIN_API_KEY` oder `API_KEY`** ✅ **AKTIV VERWENDET**
- **Fallback-Logik:** `process.env.ADMIN_API_KEY || process.env.API_KEY`
- **Zweck:** Authentifizierung für Admin-Upload Endpoints
- **Benötigt:** ✅ JA (einer von beiden)

---

## 📊 Zusammenfassung: Aktuell verwendete Keys

| Key | Verwendet in | Status | Benötigt |
|-----|--------------|--------|----------|
| **`N8N_API_KEY`** | `new-subscriber/route.ts` | ✅ Aktiv | ✅ JA |
| **`SUPABASE_SERVICE_ROLE_KEY`** | `new-subscriber/route.ts` | ✅ Aktiv | ✅ JA |
| **`NEXT_PUBLIC_SUPABASE_URL`** | `new-subscriber/route.ts` | ✅ Aktiv | ✅ JA |
| **`ADMIN_API_KEY`** | `admin-upload/*.ts` | ✅ Aktiv | ⚠️ Optional (Fallback zu API_KEY) |
| **`API_KEY`** | `admin-upload/*.ts` | ✅ Aktiv | ⚠️ Optional (Fallback von ADMIN_API_KEY) |

---

## 🎯 Für CK-App Server benötigt (`.env.local`)

### Erforderlich:

```bash
# n8n Authentifizierung
N8N_API_KEY=your-secure-api-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional (für Admin-Upload):

```bash
# Admin Upload Authentifizierung
ADMIN_API_KEY=your-admin-key-here
# ODER
API_KEY=your-api-key-here
```

---

## 🔍 Prüfen: Welche Keys sind gesetzt?

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe alle verwendeten Keys
grep -E "N8N_API_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_URL|ADMIN_API_KEY|^API_KEY=" .env.local

# Sollte zeigen:
# N8N_API_KEY=xxxxx
# SUPABASE_SERVICE_ROLE_KEY=xxxxx
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# ADMIN_API_KEY=xxxxx (optional)
# API_KEY=xxxxx (optional)
```

---

## ⚠️ Wichtig: Zwei verschiedene Supabase Keys

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Typ:** Public (Client-Side)
- **Verwendung:** Supabase URL
- **Sicherheit:** ✅ OK für Browser

### 2. `SUPABASE_SERVICE_ROLE_KEY`
- **Typ:** Secret (Server-Side ONLY!)
- **Verwendung:** Admin-Zugriff
- **Sicherheit:** ❌ NIEMALS im Frontend!

**Beide werden in `new-subscriber/route.ts` verwendet!**

---

## 📝 Antwort: Welcher Key wird verwendet?

**Aktuell werden verwendet:**

1. **`N8N_API_KEY`** - Für n8n Authentifizierung ✅
2. **`SUPABASE_SERVICE_ROLE_KEY`** - Für Supabase Admin-Zugriff ✅
3. **`NEXT_PUBLIC_SUPABASE_URL`** - Für Supabase URL ✅
4. **`ADMIN_API_KEY` oder `API_KEY`** - Für Admin-Upload (optional) ⚠️

**Alle müssen in `.env.local` auf dem CK-App Server gesetzt werden!**


# 📋 Frontend .env.local - Welche Variablen werden kopiert?

**Datum:** 17.12.2025

---

## 🔍 Was wird aus Server `.env` kopiert?

Das Skript `create-frontend-env.sh` kopiert folgende Variablen:

### 1. **MCP_SERVER_URL** (Erforderlich)
- **Wofür:** Agent API Routes (`/api/agents/*`)
- **Aus Server .env:** `MCP_SERVER_URL=http://138.199.237.34:7000`
- **Fallback:** `http://138.199.237.34:7000`
- **Wird verwendet in:**
  - `integration/api-routes/agents-marketing.ts`
  - `integration/api-routes/agents-automation.ts`
  - `integration/api-routes/agents-sales.ts`
  - `integration/api-routes/agents-social-youtube.ts`
  - `integration/api-routes/agents-chart-development.ts`

---

### 2. **READING_AGENT_URL** (Erforderlich)
- **Wofür:** Reading API Route (`/api/reading/generate`)
- **Aus Server .env:** `READING_AGENT_URL=http://138.199.237.34:4001`
- **Fallback:** `http://138.199.237.34:4001`
- **Wird verwendet in:**
  - `integration/api-routes/app-router/reading/generate/route.ts`
  - `integration/api-routes/agents-chart-development.ts`

---

### 3. **NEXT_PUBLIC_SUPABASE_URL** (Erforderlich)
- **Wofür:** Supabase Client in API Routes
- **Aus Server .env:** `NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co`
- **Fallback:** `https://njjcywgskzepikyzhihy.supabase.co`
- **Wird verwendet in:**
  - `integration/api-routes/app-router/reading/generate/route.ts`
  - `integration/api-routes/new-subscriber/route.ts`
  - Alle Supabase-basierten API Routes

---

### 4. **SUPABASE_SERVICE_ROLE_KEY** (Erforderlich)
- **Wofür:** Supabase Service Role Key für Admin-Zugriff in API Routes
- **Aus Server .env:** `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Wird verwendet in:**
  - `integration/api-routes/app-router/reading/generate/route.ts`
  - `integration/api-routes/new-subscriber/route.ts`
  - Alle Supabase-basierten API Routes

---

### 5. **N8N_API_KEY** (Optional)
- **Wofür:** API-Key Authentifizierung für `/api/new-subscriber`
- **Aus Server .env:** `N8N_API_KEY=b6b3c7f6e333769dba39...`
- **Wird verwendet in:**
  - `integration/api-routes/new-subscriber/route.ts`

---

## 📝 Beispiel: Was wird erstellt?

**Frontend `.env.local` wird erstellt mit:**

```bash
# MCP Server (für Agent API Routes)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Reading API Route)
READING_AGENT_URL=http://138.199.237.34:4001

# Supabase (für API Routes)
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamN5d2dza3plcGlreXpoaWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDAwMDAwMDB9.xyz...

# N8N API Key (für /api/new-subscriber)
N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1
```

---

## ✅ Prüfung: Was muss in Server `.env` stehen?

**Vor dem Ausführen des Skripts prüfen:**

```bash
cd /opt/mcp-connection-key

# Prüfe alle benötigten Variablen
echo "=== ERFORDERLICH ==="
grep -E "^(MCP_SERVER_URL|READING_AGENT_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=" .env || echo "❌ Fehlende Variablen"

echo ""
echo "=== OPTIONAL ==="
grep -E "^N8N_API_KEY=" .env || echo "⚠️  N8N_API_KEY fehlt (optional)"
```

**Erwartung:**
- ✅ `MCP_SERVER_URL` vorhanden
- ✅ `READING_AGENT_URL` vorhanden (oder wird Fallback verwendet)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` vorhanden
- ✅ `SUPABASE_SERVICE_ROLE_KEY` vorhanden
- ⚠️ `N8N_API_KEY` vorhanden (optional)

---

## 🔧 Manuell kopieren (falls Skript nicht funktioniert)

**Falls das Skript nicht funktioniert, manuell erstellen:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Erstelle .env.local manuell
cat > .env.local << 'EOF'
# MCP Server (für Agent API Routes)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Reading API Route)
READING_AGENT_URL=http://138.199.237.34:4001

# Supabase (für API Routes)
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=HIER_DEN_KEY_AUS_SERVER_ENV_EINTRAGEN

# N8N API Key (für /api/new-subscriber)
N8N_API_KEY=HIER_DEN_KEY_AUS_SERVER_ENV_EINTRAGEN
EOF
```

**Dann die Keys aus Server `.env` kopieren:**

```bash
# Keys aus Server .env holen
cd /opt/mcp-connection-key

# SUPABASE_SERVICE_ROLE_KEY
grep "^SUPABASE_SERVICE_ROLE_KEY=" .env

# N8N_API_KEY
grep "^N8N_API_KEY=" .env | head -1
```

**Und in Frontend `.env.local` eintragen!**

---

## 🎯 Zusammenfassung

**Was wird kopiert:**
1. ✅ `MCP_SERVER_URL` → Für Agent APIs
2. ✅ `READING_AGENT_URL` → Für Reading API
3. ✅ `NEXT_PUBLIC_SUPABASE_URL` → Für Supabase Client
4. ✅ `SUPABASE_SERVICE_ROLE_KEY` → Für Supabase Admin-Zugriff
5. ⚠️ `N8N_API_KEY` → Für `/api/new-subscriber` (optional)

**Alle diese Variablen müssen in der Server `.env` vorhanden sein!**

---

**🔍 Prüfe zuerst, ob alle Variablen in Server `.env` vorhanden sind!** 🚀

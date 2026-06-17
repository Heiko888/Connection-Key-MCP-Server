# 🔍 Environment Variables manuell prüfen

**Datum:** 17.12.2025

**Status:** Schnelle manuelle Prüfung ohne Skript

---

## 🚀 Schnellprüfung auf dem Server

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key

# Prüfe alle wichtigen Variablen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ERFORDERLICH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# OPENAI_API_KEY
if grep -q "^OPENAI_API_KEY=" .env 2>/dev/null; then
  echo "✅ OPENAI_API_KEY = $(grep '^OPENAI_API_KEY=' .env | cut -d= -f2 | head -c 20)..."
else
  echo "❌ OPENAI_API_KEY = (nicht gefunden)"
fi

# N8N_PASSWORD
if grep -q "^N8N_PASSWORD=" .env 2>/dev/null; then
  echo "✅ N8N_PASSWORD = $(grep '^N8N_PASSWORD=' .env | cut -d= -f2 | head -c 20)..."
else
  echo "❌ N8N_PASSWORD = (nicht gefunden)"
fi

# API_KEY
if grep -q "^API_KEY=" .env 2>/dev/null; then
  echo "✅ API_KEY = $(grep '^API_KEY=' .env | cut -d= -f2 | head -c 20)..."
else
  echo "❌ API_KEY = (nicht gefunden)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 WICHTIG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# MCP_SERVER_URL
if grep -q "^MCP_SERVER_URL=" .env 2>/dev/null; then
  echo "✅ MCP_SERVER_URL = $(grep '^MCP_SERVER_URL=' .env | cut -d= -f2)"
else
  echo "⚠️  MCP_SERVER_URL = (nicht gefunden)"
fi

# N8N_API_KEY
if grep -q "^N8N_API_KEY=" .env 2>/dev/null; then
  echo "✅ N8N_API_KEY = $(grep '^N8N_API_KEY=' .env | cut -d= -f2 | head -c 20)..."
else
  echo "⚠️  N8N_API_KEY = (nicht gefunden)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUPABASE (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# NEXT_PUBLIC_SUPABASE_URL
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env 2>/dev/null; then
  echo "✅ NEXT_PUBLIC_SUPABASE_URL = $(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env | cut -d= -f2)"
else
  echo "⚠️  NEXT_PUBLIC_SUPABASE_URL = (nicht gefunden)"
fi

# SUPABASE_SERVICE_ROLE_KEY
if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env 2>/dev/null; then
  echo "✅ SUPABASE_SERVICE_ROLE_KEY = $(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env | cut -d= -f2 | head -c 20)..."
else
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY = (nicht gefunden)"
fi
```

---

## 📋 Einfacher: Einzelne Variablen prüfen

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key

# ERFORDERLICH
echo "=== ERFORDERLICH ==="
grep "^OPENAI_API_KEY=" .env || echo "❌ OPENAI_API_KEY fehlt"
grep "^N8N_PASSWORD=" .env || echo "❌ N8N_PASSWORD fehlt"
grep "^API_KEY=" .env || echo "❌ API_KEY fehlt"

echo ""
echo "=== WICHTIG ==="
grep "^MCP_SERVER_URL=" .env || echo "⚠️  MCP_SERVER_URL fehlt"
grep "^N8N_API_KEY=" .env || echo "⚠️  N8N_API_KEY fehlt"

echo ""
echo "=== SUPABASE (Optional) ==="
grep "^NEXT_PUBLIC_SUPABASE_URL=" .env || echo "⚠️  NEXT_PUBLIC_SUPABASE_URL fehlt"
grep "^SUPABASE_SERVICE_ROLE_KEY=" .env || echo "⚠️  SUPABASE_SERVICE_ROLE_KEY fehlt"
```

---

## 🔧 Skript auf Server kopieren (Alternative)

**Falls du das Skript verwenden möchtest:**

**Option A: Von lokalem Rechner auf Server kopieren**

```bash
# Auf lokalem Rechner (Windows PowerShell)
scp check-env-variables.sh root@138.199.237.34:/opt/mcp-connection-key/

# Dann auf Server:
ssh root@138.199.237.34
cd /opt/mcp-connection-key
chmod +x check-env-variables.sh
./check-env-variables.sh .env
```

**Option B: Skript direkt auf Server erstellen**

```bash
# Auf Server
cd /opt/mcp-connection-key
nano check-env-variables.sh
# Dann Inhalt aus dem Workspace kopieren
chmod +x check-env-variables.sh
./check-env-variables.sh .env
```

---

## ✅ Schnellste Methode

**Einfach diese Befehle auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
echo "=== ERFORDERLICH ===" && grep -E "^(OPENAI_API_KEY|N8N_PASSWORD|API_KEY)=" .env || echo "❌ Fehlende Variablen gefunden"
echo "" && echo "=== WICHTIG ===" && grep -E "^(MCP_SERVER_URL|N8N_API_KEY)=" .env || echo "⚠️  Fehlende Variablen gefunden"
```

---

**🎯 Führe die Schnellprüfung aus!** 🚀

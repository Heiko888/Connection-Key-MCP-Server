#!/bin/bash

# ============================================
# Agent-Verbindung prüfen (auf Server ausführen)
# ============================================
# Prüft die Verbindung zwischen Frontend und Agenten
# ============================================

echo "========================================"
echo "Agent-Verbindung prüfen"
echo "========================================"
echo ""

SERVER_PATH="/opt/hd-app/The-Connection-Key"
HETZNER="138.199.237.34"

cd "$SERVER_PATH" || exit 1

echo "[*] Prüfe Frontend-Struktur..."
echo ""

# Prüfe Pages Router
echo "  Test 1: Pages Router - /coach/readings/create"
if [ -f "frontend/pages/coach/readings/create.tsx" ]; then
    echo "  ✅ Frontend-Seite existiert (Pages Router)"
    ls -lh frontend/pages/coach/readings/create.tsx
else
    echo "  ❌ Frontend-Seite fehlt (Pages Router)"
fi

echo ""

# Prüfe App Router
echo "  Test 2: App Router - /coach/readings/create"
if [ -f "frontend/app/coach/readings/create/page.tsx" ]; then
    echo "  ✅ Frontend-Seite existiert (App Router)"
    ls -lh frontend/app/coach/readings/create/page.tsx
else
    echo "  ❌ Frontend-Seite fehlt (App Router)"
fi

echo ""

# Prüfe API-Route
echo "  Test 3: API-Route - /api/readings/generate"
if [ -f "frontend/pages/api/readings/generate.ts" ]; then
    echo "  ✅ API-Route existiert (Pages Router)"
    ls -lh frontend/pages/api/readings/generate.ts
else
    echo "  ❌ API-Route fehlt (Pages Router)"
fi

echo ""

# Prüfe ReadingGenerator Komponente
echo "  Test 4: ReadingGenerator Komponente"
if [ -f "frontend/components/agents/ReadingGenerator.tsx" ]; then
    echo "  ✅ ReadingGenerator Komponente existiert"
    ls -lh frontend/components/agents/ReadingGenerator.tsx
else
    echo "  ❌ ReadingGenerator Komponente fehlt"
fi

echo ""

# Prüfe Environment Variables
echo "[*] Prüfe Environment Variables..."
echo ""

echo "  Test 5: .env Datei"
if grep -q "^MCP_SERVER_URL=" .env 2>/dev/null; then
    echo "  ✅ MCP_SERVER_URL gefunden:"
    grep "^MCP_SERVER_URL=" .env
else
    echo "  ❌ MCP_SERVER_URL fehlt in .env"
fi

if grep -q "^READING_AGENT_URL=" .env 2>/dev/null; then
    echo "  ✅ READING_AGENT_URL gefunden:"
    grep "^READING_AGENT_URL=" .env
else
    echo "  ❌ READING_AGENT_URL fehlt in .env"
fi

echo ""

echo "  Test 6: Frontend .env.local"
if [ -f "frontend/.env.local" ]; then
    if grep -q "^MCP_SERVER_URL=" frontend/.env.local 2>/dev/null; then
        echo "  ✅ MCP_SERVER_URL gefunden:"
        grep "^MCP_SERVER_URL=" frontend/.env.local
    else
        echo "  ⚠️  MCP_SERVER_URL fehlt in frontend/.env.local"
    fi
    
    if grep -q "^READING_AGENT_URL=" frontend/.env.local 2>/dev/null; then
        echo "  ✅ READING_AGENT_URL gefunden:"
        grep "^READING_AGENT_URL=" frontend/.env.local
    else
        echo "  ⚠️  READING_AGENT_URL fehlt in frontend/.env.local"
    fi
else
    echo "  ⚠️  frontend/.env.local existiert nicht"
fi

echo ""

# Prüfe MCP Server
echo "[*] Prüfe MCP Server Erreichbarkeit..."
echo ""

echo "  Test 7: MCP Server Health"
MCP_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://${HETZNER}:7000/health 2>&1)
if [ "$MCP_HEALTH" = "200" ]; then
    echo "  ✅ MCP Server erreichbar (HTTP $MCP_HEALTH)"
else
    echo "  ❌ MCP Server nicht erreichbar (HTTP $MCP_HEALTH)"
fi

echo ""

# Prüfe Reading Agent
echo "[*] Prüfe Reading Agent Erreichbarkeit..."
echo ""

echo "  Test 8: Reading Agent Health"
READING_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://${HETZNER}:4001/health 2>&1)
if [ "$READING_HEALTH" = "200" ]; then
    echo "  ✅ Reading Agent erreichbar (HTTP $READING_HEALTH)"
else
    echo "  ❌ Reading Agent nicht erreichbar (HTTP $READING_HEALTH)"
fi

echo ""

# Prüfe Docker Container
echo "[*] Prüfe Docker Container..."
echo ""

echo "  Test 9: Frontend Container"
if docker ps | grep -q "frontend"; then
    echo "  ✅ Frontend Container läuft"
    docker ps | grep "frontend"
else
    echo "  ❌ Frontend Container läuft nicht"
fi

echo ""

echo "========================================"
echo "Zusammenfassung"
echo "========================================"
echo ""
echo "Zu prüfen:"
echo "1. Frontend-Seite existiert? (/coach/readings/create)"
echo "2. API-Route existiert? (/api/readings/generate)"
echo "3. ReadingGenerator Komponente installiert?"
echo "4. Environment Variables gesetzt? (MCP_SERVER_URL, READING_AGENT_URL)"
echo "5. MCP Server erreichbar? (http://${HETZNER}:7000)"
echo "6. Reading Agent erreichbar? (http://${HETZNER}:4001)"
echo "7. Frontend Container läuft?"
echo ""



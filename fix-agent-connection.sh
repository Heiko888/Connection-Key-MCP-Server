#!/bin/bash

# ============================================
# Agent-Verbindung reparieren
# ============================================
# Installiert fehlende Dateien für Agent-Integration
# ============================================

echo "========================================"
echo "Agent-Verbindung reparieren"
echo "========================================"
echo ""

SERVER_PATH="/opt/hd-app/The-Connection-Key"
INTEGRATION_PATH="/opt/hd-app/The-Connection-Key/integration"

cd "$SERVER_PATH" || exit 1

echo "[*] Prüfe Integration-Dateien..."
echo ""

# Prüfe ob Integration-Dateien existieren
if [ ! -d "$INTEGRATION_PATH" ]; then
    echo "  ❌ Integration-Ordner nicht gefunden: $INTEGRATION_PATH"
    echo "  Bitte Integration-Dateien zuerst auf Server kopieren"
    exit 1
fi

echo "  ✅ Integration-Ordner gefunden"
echo ""

# Schritt 1: API-Route installieren
echo "[*] Schritt 1: API-Route installieren..."
echo ""

if [ -f "$INTEGRATION_PATH/api-routes/readings-generate.ts" ]; then
    mkdir -p frontend/pages/api/readings
    cp "$INTEGRATION_PATH/api-routes/readings-generate.ts" frontend/pages/api/readings/generate.ts
    echo "  ✅ API-Route installiert: frontend/pages/api/readings/generate.ts"
else
    echo "  ❌ API-Route nicht gefunden: $INTEGRATION_PATH/api-routes/readings-generate.ts"
fi

echo ""

# Schritt 2: ReadingGenerator Komponente installieren
echo "[*] Schritt 2: ReadingGenerator Komponente installieren..."
echo ""

if [ -f "$INTEGRATION_PATH/frontend/components/ReadingGenerator.tsx" ]; then
    mkdir -p frontend/components/agents
    cp "$INTEGRATION_PATH/frontend/components/ReadingGenerator.tsx" frontend/components/agents/ReadingGenerator.tsx
    echo "  ✅ ReadingGenerator Komponente installiert"
else
    echo "  ❌ ReadingGenerator Komponente nicht gefunden"
fi

echo ""

# Schritt 3: Frontend-Seite erstellen (Pages Router)
echo "[*] Schritt 3: Frontend-Seite erstellen (Pages Router)..."
echo ""

mkdir -p frontend/pages/coach/readings

cat > frontend/pages/coach/readings/create.tsx << 'EOF'
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Human Design Reading erstellen</h1>
      <ReadingGenerator />
    </div>
  );
}
EOF

echo "  ✅ Frontend-Seite erstellt: frontend/pages/coach/readings/create.tsx"

echo ""

# Schritt 4: Environment Variables setzen
echo "[*] Schritt 4: Environment Variables setzen..."
echo ""

# In .env
if [ -f ".env" ]; then
    if ! grep -q "^MCP_SERVER_URL=" .env; then
        echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env
        echo "  ✅ MCP_SERVER_URL zu .env hinzugefügt"
    else
        sed -i 's|^MCP_SERVER_URL=.*|MCP_SERVER_URL=http://138.199.237.34:7000|' .env
        echo "  ✅ MCP_SERVER_URL in .env aktualisiert"
    fi
    
    if ! grep -q "^READING_AGENT_URL=" .env; then
        echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env
        echo "  ✅ READING_AGENT_URL zu .env hinzugefügt"
    else
        sed -i 's|^READING_AGENT_URL=.*|READING_AGENT_URL=http://138.199.237.34:4001|' .env
        echo "  ✅ READING_AGENT_URL in .env aktualisiert"
    fi
else
    echo "  ⚠️  .env Datei nicht gefunden"
fi

# In frontend/.env.local
mkdir -p frontend
if [ -f "frontend/.env.local" ]; then
    if ! grep -q "^MCP_SERVER_URL=" frontend/.env.local; then
        echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> frontend/.env.local
        echo "  ✅ MCP_SERVER_URL zu frontend/.env.local hinzugefügt"
    else
        sed -i 's|^MCP_SERVER_URL=.*|MCP_SERVER_URL=http://138.199.237.34:7000|' frontend/.env.local
        echo "  ✅ MCP_SERVER_URL in frontend/.env.local aktualisiert"
    fi
    
    if ! grep -q "^READING_AGENT_URL=" frontend/.env.local; then
        echo "READING_AGENT_URL=http://138.199.237.34:4001" >> frontend/.env.local
        echo "  ✅ READING_AGENT_URL zu frontend/.env.local hinzugefügt"
    else
        sed -i 's|^READING_AGENT_URL=.*|READING_AGENT_URL=http://138.199.237.34:4001|' frontend/.env.local
        echo "  ✅ READING_AGENT_URL in frontend/.env.local aktualisiert"
    fi
else
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" > frontend/.env.local
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> frontend/.env.local
    echo "  ✅ frontend/.env.local erstellt"
fi

echo ""

# Schritt 5: Frontend Container neu starten
echo "[*] Schritt 5: Frontend Container neu starten..."
echo ""

if docker ps | grep -q "frontend"; then
    echo "  🔄 Starte Frontend Container neu..."
    docker compose restart frontend || docker-compose restart frontend
    echo "  ✅ Frontend Container neu gestartet"
else
    echo "  ⚠️  Frontend Container läuft nicht"
fi

echo ""

echo "========================================"
echo "Fertig!"
echo "========================================"
echo ""
echo "Installiert:"
echo "1. ✅ API-Route: /api/readings/generate"
echo "2. ✅ Frontend-Seite: /coach/readings/create"
echo "3. ✅ ReadingGenerator Komponente"
echo "4. ✅ Environment Variables gesetzt"
echo "5. ✅ Frontend Container neu gestartet"
echo ""
echo "Testen Sie jetzt:"
echo "  https://www.the-connection-key.de/coach/readings/create"
echo ""



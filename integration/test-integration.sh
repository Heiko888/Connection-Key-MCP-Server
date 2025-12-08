#!/bin/bash
# Test-Script für die Agenten-Integration
# Führen Sie dieses Script auf dem CK-App Server aus

set -e

echo "🧪 Teste Agenten-Integration"
echo "============================="
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
MCP_SERVER="${MCP_SERVER:-http://138.199.237.34:7000}"
READING_AGENT="${READING_AGENT:-http://138.199.237.34:4001}"

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test-Funktion
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "   Teste $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}❌ Fehler${NC} (HTTP $http_code)"
        echo "      Response: $body"
        return 1
    fi
}

# 1. Test API-Routes (lokal)
echo "1. Teste lokale API-Routes..."
echo ""

test_endpoint "Marketing Agent API" \
    "$BASE_URL/api/agents/marketing" \
    "POST" \
    '{"message": "Gib mir 3 Hooks für ein Reel"}'

test_endpoint "Automation Agent API" \
    "$BASE_URL/api/agents/automation" \
    "POST" \
    '{"message": "Erkläre mir n8n"}'

test_endpoint "Sales Agent API" \
    "$BASE_URL/api/agents/sales" \
    "POST" \
    '{"message": "Schreibe mir eine Salespage"}'

test_endpoint "Social-YouTube Agent API" \
    "$BASE_URL/api/agents/social-youtube" \
    "POST" \
    '{"message": "Erstelle mir ein YouTube-Skript"}'

test_endpoint "Reading Generator API" \
    "$BASE_URL/api/readings/generate" \
    "POST" \
    '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin", "readingType": "basic"}'

echo ""

# 2. Test direkte Agenten-Verbindung
echo "2. Teste direkte Verbindung zu Agenten..."
echo ""

test_endpoint "MCP Server Health" \
    "$MCP_SERVER/health" \
    "GET"

test_endpoint "MCP Server Agents" \
    "$MCP_SERVER/agents" \
    "GET"

test_endpoint "Reading Agent Health" \
    "$READING_AGENT/health" \
    "GET"

echo ""

# 3. Test Agent-Aufrufe
echo "3. Teste Agent-Aufrufe direkt..."
echo ""

test_endpoint "Marketing Agent direkt" \
    "$MCP_SERVER/agent/marketing" \
    "POST" \
    '{"message": "Test"}'

test_endpoint "Reading Agent direkt" \
    "$READING_AGENT/reading/generate" \
    "POST" \
    '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'

echo ""

# 4. Zusammenfassung
echo "============================="
echo "✅ Tests abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. Öffnen Sie im Browser:"
echo "   $BASE_URL/agents-dashboard"
echo ""
echo "2. Testen Sie die Frontend-Komponenten"
echo ""
echo "3. Prüfen Sie die Browser-Console auf Fehler"
echo ""
echo "============================="
echo ""


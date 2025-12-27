#!/bin/bash
# Reading-Flow End-to-End Tests

set -e

MCP_SERVER_URL="${MCP_SERVER_URL:-http://138.199.237.34:7000}"
MCP_API_KEY="${MCP_API_KEY:-YOUR_MCP_API_KEY}"
FRONTEND_URL="${FRONTEND_URL:-http://167.235.224.149:3000}"

echo "🧪 Reading-Flow End-to-End Tests"
echo "=================================="
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "----------------------"
curl -s "${MCP_SERVER_URL}/health" | jq '.' || echo "❌ Health Check fehlgeschlagen"
echo ""

# Test 2: Reading Generate (MCP Gateway)
echo "📋 Test 2: Reading Generate (MCP Gateway)"
echo "------------------------------------------"
curl -X POST "${MCP_SERVER_URL}/agents/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MCP_API_KEY}" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15",
      "birthTime": "14:30",
      "birthPlace": "Berlin, Deutschland",
      "userId": "test-user-123",
      "readingType": "detailed"
    },
    "requestId": "test-req-001"
  }' | jq '.' || echo "❌ Reading Generate fehlgeschlagen"
echo ""

# Test 3: Invalid Auth
echo "📋 Test 3: Invalid Auth"
echo "----------------------"
curl -X POST "${MCP_SERVER_URL}/agents/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WRONG_KEY" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15",
      "birthTime": "14:30",
      "birthPlace": "Berlin"
    }
  }' | jq '.' || echo "❌ Invalid Auth Test fehlgeschlagen"
echo ""

# Test 4: Invalid Payload
echo "📋 Test 4: Invalid Payload"
echo "-------------------------"
curl -X POST "${MCP_SERVER_URL}/agents/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MCP_API_KEY}" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15"
    }
  }' | jq '.' || echo "❌ Invalid Payload Test fehlgeschlagen"
echo ""

# Test 5: Frontend API Route
echo "📋 Test 5: Frontend API Route"
echo "-----------------------------"
curl -X POST "${FRONTEND_URL}/api/reading/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Deutschland",
    "userId": "test-user-123",
    "readingType": "detailed"
  }' | jq '.' || echo "❌ Frontend API Route Test fehlgeschlagen"
echo ""

echo "✅ Tests abgeschlossen"

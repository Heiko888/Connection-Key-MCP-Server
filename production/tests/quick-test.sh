#!/bin/bash
# Quick Test für B3 - Manuelle Prüfung einzelner Tests

READING_AGENT_URL="${READING_AGENT_URL:-http://localhost:4000}"

echo "🧪 B3 Quick Test"
echo "================="
echo "Reading Agent URL: $READING_AGENT_URL"
echo ""

# Test-Chart
TEST_CHART='{
  "chart_id": "test-001",
  "chart_version": "1.0.0",
  "chart": {
    "core": {
      "type": "Generator",
      "authority": "Sacral",
      "strategy": "To Respond",
      "profile": "1/3",
      "definition": "Single"
    },
    "centers": {
      "head": "undefined",
      "ajna": "undefined",
      "throat": "defined",
      "g": "defined",
      "heart": "undefined",
      "spleen": "undefined",
      "solar_plexus": "defined",
      "sacral": "defined",
      "root": "defined"
    },
    "channels": [
      {"number": 34, "name": "Channel of Power"},
      {"number": 20, "name": "Channel of Awakening"}
    ],
    "gates": {
      "34": {"line": 1, "name": "Gate of Power"},
      "20": {"line": 2, "name": "Gate of Contemplation"}
    }
  },
  "context": "personality",
  "depth": "advanced",
  "style": "ruhig"
}'

echo "📋 TEST 1: Determinismus (3x gleiche Inputs)"
echo "--------------------------------------------"
echo "Generiere Reading 1..."
RESPONSE1=$(curl -s -X POST "$READING_AGENT_URL/reading/generate" \
  -H "Content-Type: application/json" \
  -d "$TEST_CHART")

echo "Generiere Reading 2..."
RESPONSE2=$(curl -s -X POST "$READING_AGENT_URL/reading/generate" \
  -H "Content-Type: application/json" \
  -d "$TEST_CHART")

echo "Generiere Reading 3..."
RESPONSE3=$(curl -s -X POST "$READING_AGENT_URL/reading/generate" \
  -H "Content-Type: application/json" \
  -d "$TEST_CHART")

# Prüfe ob alle erfolgreich
if echo "$RESPONSE1" | grep -q '"success":true' && \
   echo "$RESPONSE2" | grep -q '"success":true' && \
   echo "$RESPONSE3" | grep -q '"success":true'; then
  echo "✅ Alle 3 Readings generiert"
  echo ""
  echo "Reading 1 (Ausschnitt):"
  echo "$RESPONSE1" | jq -r '.reading' | head -3
  echo ""
  echo "Reading 2 (Ausschnitt):"
  echo "$RESPONSE2" | jq -r '.reading' | head -3
  echo ""
  echo "Reading 3 (Ausschnitt):"
  echo "$RESPONSE3" | jq -r '.reading' | head -3
else
  echo "❌ Fehler beim Generieren der Readings"
  echo "$RESPONSE1" | jq '.'
fi

echo ""
echo "📋 TEST 4: Halluzinations-Probe (Chart OHNE channels)"
echo "------------------------------------------------------"

# Chart ohne channels
TEST_CHART_NO_CHANNELS='{
  "chart_id": "test-002",
  "chart_version": "1.0.0",
  "chart": {
    "core": {
      "type": "Generator",
      "authority": "Sacral"
    },
    "centers": {
      "sacral": "defined"
    },
    "channels": [],
    "gates": {}
  },
  "context": "personality",
  "depth": "advanced",
  "style": "ruhig"
}'

RESPONSE_NO_CHANNELS=$(curl -s -X POST "$READING_AGENT_URL/reading/generate" \
  -H "Content-Type: application/json" \
  -d "$TEST_CHART_NO_CHANNELS")

if echo "$RESPONSE_NO_CHANNELS" | grep -q '"success":true'; then
  READING_TEXT=$(echo "$RESPONSE_NO_CHANNELS" | jq -r '.reading')
  
  # Prüfe ob Agent explizit sagt, dass channels fehlen
  if echo "$READING_TEXT" | grep -qiE "keine.*Kanäle|Kanäle.*nicht|keine.*Channels|Channels.*nicht|keine.*eindeutige.*Aussage"; then
    echo "✅ Agent benennt fehlende channels explizit"
  else
    echo "❌ Agent benennt fehlende channels NICHT explizit"
  fi
  
  # Prüfe ob Agent halluziniert
  if echo "$READING_TEXT" | grep -qiE "Channel.*34|Channel.*20|Kanal.*34|Kanal.*20"; then
    echo "❌ Agent halluziniert channels (erwähnt Channel 34 oder 20)"
  else
    echo "✅ Agent halluziniert keine channels"
  fi
  
  echo ""
  echo "Reading (Ausschnitt):"
  echo "$READING_TEXT" | head -10
else
  echo "❌ Fehler beim Generieren des Readings"
  echo "$RESPONSE_NO_CHANNELS" | jq '.'
fi

echo ""
echo "✅ Quick Test abgeschlossen"

#!/bin/bash

# Test-Script für Workbook API
# Testet die /api/workbook/chart-data Route

echo "🧪 Workbook API Test"
echo "==================="
echo ""

# API-URL (lokal oder Server)
API_URL="${1:-http://localhost:3005}"
ENDPOINT="${API_URL}/api/workbook/chart-data"

echo "📍 API URL: ${ENDPOINT}"
echo ""

# Test 1: GET - API Info
echo "📋 Test 1: GET - API Info"
echo "------------------------"
curl -X GET "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X GET "${ENDPOINT}" -H "Content-Type: application/json" -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""

# Test 2: POST - Single Chart (ohne SVG)
echo "📋 Test 2: POST - Single Chart (ohne SVG)"
echo "------------------------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": false,
      "includeData": true
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": false,
      "includeData": true
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""

# Test 3: POST - Single Chart (mit SVG)
echo "📋 Test 3: POST - Single Chart (mit SVG)"
echo "----------------------------------------"
echo "⚠️  Dieser Test kann länger dauern (Chart-Berechnung + SVG-Generierung)..."
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": true,
      "includeLayers": true,
      "includeData": true
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.success, .chart_id, .metadata, (.svg != null), (.svg_layers != null)' 2>/dev/null || \
  curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    },
    "options": {
      "includeSVG": true,
      "includeLayers": true,
      "includeData": true
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""

# Test 4: POST - Dual Chart (Connection Key)
echo "📋 Test 4: POST - Dual Chart (Connection Key)"
echo "----------------------------------------------"
echo "⚠️  Dieser Test kann länger dauern..."
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "dual",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      },
      "person_B": {
        "date": "1985-03-20",
        "time": "10:15",
        "location": "München, Germany"
      }
    },
    "options": {
      "includeSVG": true,
      "mode": "dual-overlay"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.success, .chart_id, .metadata.chart_type, (.data.connections != null)' 2>/dev/null || \
  curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "dual",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      },
      "person_B": {
        "date": "1985-03-20",
        "time": "10:15",
        "location": "München, Germany"
      }
    },
    "options": {
      "includeSVG": true,
      "mode": "dual-overlay"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""

# Test 5: POST - Fehler-Test (fehlende Felder)
echo "📋 Test 5: POST - Fehler-Test (fehlende Felder)"
echo "------------------------------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.success, .error.code, .error.message' 2>/dev/null || \
  curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "single"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""

# Test 6: POST - Fehler-Test (ungültiger chartType)
echo "📋 Test 6: POST - Fehler-Test (ungültiger chartType)"
echo "-----------------------------------------------------"
curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "invalid",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.success, .error.code, .error.message' 2>/dev/null || \
  curl -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d '{
    "chartType": "invalid",
    "birthData": {
      "person_A": {
        "date": "1978-05-12",
        "time": "14:32",
        "location": "Berlin, Germany"
      }
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" -s

echo ""
echo ""
echo "✅ Tests abgeschlossen!"
echo ""
echo "💡 Tipp: Verwende 'jq' für bessere JSON-Formatierung:"
echo "   sudo apt-get install jq  # Ubuntu/Debian"
echo "   brew install jq          # macOS"

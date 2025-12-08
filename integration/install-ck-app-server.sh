#!/bin/bash
# Installation auf CK-App Server (167.235.224.149)
# Führen Sie dieses Script auf dem CK-App Server aus

set -e

echo "🚀 Installation der Agenten-Integration auf CK-App Server"
echo "=========================================================="
echo ""

# Prüfe ob wir im Next.js Projekt-Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo "❌ Fehler: package.json nicht gefunden!"
    echo "   Bitte führen Sie dieses Script im Next.js Projekt-Verzeichnis aus"
    exit 1
fi

echo "✅ Next.js Projekt gefunden"
echo ""

# 1. API-Routes installieren
echo "1. Installiere API-Routes..."
echo ""

# Prüfe ob Pages Router oder App Router
if [ -d "pages" ]; then
    echo "   📁 Pages Router erkannt"
    
    # Erstelle Verzeichnisse
    mkdir -p pages/api/agents
    mkdir -p pages/api/readings
    
    # Kopiere API-Routes
    if [ -f "integration/api-routes/agents-marketing.ts" ]; then
        cp integration/api-routes/agents-marketing.ts pages/api/agents/marketing.ts
        cp integration/api-routes/agents-automation.ts pages/api/agents/automation.ts
        cp integration/api-routes/agents-sales.ts pages/api/agents/sales.ts
        cp integration/api-routes/agents-social-youtube.ts pages/api/agents/social-youtube.ts
        cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
        echo "   ✅ API-Routes kopiert"
    else
        echo "   ⚠️  integration/api-routes/ nicht gefunden"
        echo "   Bitte kopieren Sie die Dateien manuell"
    fi
    
elif [ -d "app" ]; then
    echo "   📁 App Router erkannt"
    echo "   ⚠️  App Router benötigt Anpassungen"
    echo "   Bitte siehe README_API_ROUTES.md für Details"
else
    echo "   ❌ Weder pages/ noch app/ Verzeichnis gefunden"
    exit 1
fi

echo ""

# 2. Frontend-Komponenten installieren
echo "2. Installiere Frontend-Komponenten..."
echo ""

# Erstelle Komponenten-Verzeichnis
mkdir -p components/agents

# Kopiere Komponenten
if [ -f "integration/frontend/components/AgentChat.tsx" ]; then
    cp integration/frontend/components/AgentChat.tsx components/agents/
    cp integration/frontend/components/ReadingGenerator.tsx components/agents/
    echo "   ✅ Komponenten kopiert"
else
    echo "   ⚠️  integration/frontend/components/ nicht gefunden"
    echo "   Bitte kopieren Sie die Dateien manuell"
fi

# Kopiere Dashboard-Seite (nur für Pages Router)
if [ -d "pages" ] && [ -f "integration/frontend/pages/agents-dashboard.tsx" ]; then
    cp integration/frontend/pages/agents-dashboard.tsx pages/agents-dashboard.tsx
    echo "   ✅ Dashboard-Seite kopiert"
fi

echo ""

# 3. Environment Variables prüfen/setzen
echo "3. Prüfe Environment Variables..."
echo ""

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "   📝 Erstelle .env.local..."
    touch "$ENV_FILE"
fi

# Prüfe ob Variablen bereits gesetzt sind
if ! grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
    echo "   ➕ Füge MCP_SERVER_URL hinzu..."
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
fi

if ! grep -q "READING_AGENT_URL" "$ENV_FILE"; then
    echo "   ➕ Füge READING_AGENT_URL hinzu..."
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
fi

echo "   ✅ Environment Variables gesetzt"
echo ""

# 4. CSS erstellen (optional)
echo "4. CSS für Agenten-Komponenten..."
echo ""

CSS_FILE="styles/agents.css"
if [ ! -f "$CSS_FILE" ]; then
    echo "   📝 Erstelle $CSS_FILE..."
    mkdir -p styles
    cat > "$CSS_FILE" << 'CSS_EOF'
/* Agenten-Komponenten Styles */
.agent-chat-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chat-history {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chat-item {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.user-message {
  margin-bottom: 10px;
  color: #333;
}

.agent-response {
  color: #666;
}

.response-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.chat-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.submit-button {
  padding: 10px 20px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin: 10px 0;
}

.reading-generator-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.reading-form {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.generate-button {
  padding: 12px 24px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.reading-result {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.reading-content {
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 20px 0;
}

.agents-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.agent-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
}
CSS_EOF
    echo "   ✅ CSS-Datei erstellt"
else
    echo "   ✅ CSS-Datei existiert bereits"
fi

echo ""

# 5. Zusammenfassung
echo "=========================================================="
echo "✅ Installation abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. CSS importieren (in _app.tsx oder layout.tsx):"
echo "   import '../styles/agents.css'"
echo ""
echo "2. Testen Sie die API-Routes:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Test\"}'"
echo ""
echo "3. Öffnen Sie im Browser:"
echo "   http://localhost:3000/agents-dashboard"
echo ""
echo "4. Prüfen Sie .env.local:"
echo "   cat .env.local"
echo ""
echo "=========================================================="
echo ""


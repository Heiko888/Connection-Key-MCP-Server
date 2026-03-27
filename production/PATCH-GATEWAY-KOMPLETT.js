/**
 * KOMPLETTE PATCH-ANLEITUNG mcp-gateway.js
 * ==========================================
 * Pfad auf Server 138: /opt/mcp-connection-key/production/mcp-gateway.js
 * 
 * 3 Bereiche anpassen:
 *   1. Imports oben
 *   2. OAuth-Routes (neu)
 *   3. Agent-Handler ersetzen
 */

// ═══════════════════════════════════════════════════════════════
// BEREICH 1: IMPORTS — oben in mcp-gateway.js hinzufügen
// ═══════════════════════════════════════════════════════════════

const { handleMarketingAgent } = require('./agent-marketing');
const { handleSalesAgent }     = require('./agent-sales');
const { handleSocialAgent }    = require('./agent-social');
const { handleVideoAgent }     = require('./agent-video');
const { handleDesignAgent }    = require('./agent-design');

const {
  startCanvaAuth,
  handleCanvaCallback,
  getCanvaToken,
  checkCanvaStatus,
  disconnectCanva,
} = require('./canva-oauth');


// ═══════════════════════════════════════════════════════════════
// BEREICH 2: OAUTH-ROUTES — vor den /agent/* Routes einfügen
// ═══════════════════════════════════════════════════════════════

app.get('/auth/canva/start',        startCanvaAuth);
app.get('/auth/canva/callback',     handleCanvaCallback);
app.get('/auth/canva/token',        getCanvaToken);
app.get('/auth/canva/status',       checkCanvaStatus);
app.post('/auth/canva/disconnect',  disconnectCanva);


// ═══════════════════════════════════════════════════════════════
// BEREICH 3: AGENT-HANDLER ERSETZEN
// ═══════════════════════════════════════════════════════════════
//
// Alte Handler (app.post('/agent/marketing', async (req,res) => { ... }))
// durch diese ersetzen:

app.post('/agent/marketing',        handleMarketingAgent);
app.post('/agent/sales',            handleSalesAgent);
app.post('/agent/social-youtube',   handleSocialAgent);
app.post('/agent/video',            handleVideoAgent);   // NEU — optional
app.post('/agent/ui-ux',            handleDesignAgent);


// ═══════════════════════════════════════════════════════════════
// BEREICH 4: .env ERGÄNZUNGEN auf Server 138
// ═══════════════════════════════════════════════════════════════
//
// Datei: /opt/mcp-connection-key/production/.env
//
// # Canva Integration
// CANVA_CLIENT_ID=<aus Canva Developer Portal>
// CANVA_CLIENT_SECRET=<aus Canva Developer Portal>
// CANVA_REDIRECT_URI=https://mcp.the-connection-key.de/auth/canva/callback
// CANVA_MCP_URL=https://mcp.canva.com/mcp
//
// # Figma Integration (nur für Design-Agent)
// FIGMA_MCP_URL=https://mcp.figma.com/mcp
// # Figma OAuth läuft über Figma Developer App (ähnlich wie Canva)
// FIGMA_CLIENT_ID=<aus Figma Developer Portal>
// FIGMA_CLIENT_SECRET=<aus Figma Developer Portal>
// FIGMA_REDIRECT_URI=https://mcp.the-connection-key.de/auth/figma/callback
//
// FRONTEND_URL=https://coach.the-connection-key.de


// ═══════════════════════════════════════════════════════════════
// BEREICH 5: DEPLOYMENT COMMANDS
// ═══════════════════════════════════════════════════════════════

/*
# 1. Dateien auf Server 138 kopieren
scp agent-marketing.js agent-sales.js agent-social.js agent-video.js agent-design.js canva-oauth.js \
  root@138.199.237.34:/opt/mcp-connection-key/production/

# 2. .env bearbeiten
nano /opt/mcp-connection-key/production/.env
# → Canva + Figma Vars hinzufügen (siehe Bereich 4)

# 3. mcp-gateway.js patchen (Bereiche 1-3 oben)
nano /opt/mcp-connection-key/production/mcp-gateway.js

# 4. Container neu bauen und starten
cd /opt/mcp-connection-key/production
docker compose build mcp-gateway
docker compose up -d mcp-gateway

# 5. Smoke-Tests
curl https://mcp.the-connection-key.de/health
curl https://mcp.the-connection-key.de/auth/canva/status?session_id=test
curl -X POST https://mcp.the-connection-key.de/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Schreibe einen Instagram Post über Human Design Generator"}'
*/


// ═══════════════════════════════════════════════════════════════
// BEREICH 6: CANVA DEVELOPER APP SETUP
// ═══════════════════════════════════════════════════════════════
//
// 1. https://www.canva.com/developers/ → "Create app"
// 2. App Name: "The Connection Key"
// 3. Redirect URL: https://mcp.the-connection-key.de/auth/canva/callback
// 4. Scopes aktivieren:
//      asset:read, asset:write
//      design:content:read, design:content:write, design:meta:read
//      brandtemplate:content:read, brandtemplate:meta:read
//      folder:read, folder:write
//      profile:read
// 5. "Connect apps" → MCP aktivieren
// 6. Client ID + Secret → in .env eintragen


// ═══════════════════════════════════════════════════════════════
// BEREICH 7: FIGMA DEVELOPER APP SETUP (für Design-Agent)
// ═══════════════════════════════════════════════════════════════
//
// 1. https://www.figma.com/developers/apps → "Create new app"
// 2. App Name: "The Connection Key Design"
// 3. Redirect URL: https://mcp.the-connection-key.de/auth/figma/callback
// 4. Scopes: files:read, file_variables:read, file_variables:write
// 5. Client ID + Secret → in .env eintragen
//
// HINWEIS: Für Figma OAuth analog zu canva-oauth.js eine figma-oauth.js erstellen
// Token-URL: https://api.figma.com/v1/oauth/token
// Auth-URL:  https://www.figma.com/oauth


// ═══════════════════════════════════════════════════════════════
// BEREICH 8: API — wie Frontend die Agenten aufruft
// ═══════════════════════════════════════════════════════════════
//
// Alle Agenten akzeptieren:
// {
//   message: string,                    // Pflicht
//   canva_access_token?: string,        // Optional — aktiviert Canva
//   figma_access_token?: string,        // Nur Design-Agent
//   conversation_history?: Message[],   // Multi-Turn Support
//   platform?: string,                  // Social-Agent: "instagram", "youtube"
//   video_type?: string,                // Video-Agent: "youtube", "reel", "short"
// }
//
// Response:
// {
//   response: string,           // Claude's Antwort
//   canva_connected: boolean,
//   figma_connected: boolean,   // nur Design-Agent
//   tool_activities: Array,     // welche Canva/Figma Tools genutzt wurden
//   model: string,
// }

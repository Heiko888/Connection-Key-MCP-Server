# 🔧 Fix: Fehlende API-Routes auf CK-App Server

## ❌ Problem

**Verifikation zeigt:**
- ✅ `chart-development.ts` existiert
- ❌ `marketing.ts` fehlt
- ❌ `automation.ts` fehlt
- ❌ `sales.ts` fehlt
- ❌ `social-youtube.ts` fehlt

---

## ✅ Lösung: Alle API-Routes installieren

### Auf CK-App Server ausführen:

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Verzeichnis erstellen
mkdir -p pages/api/agents

# Marketing Agent Route erstellen
cat > pages/api/agents/marketing.ts << 'EOF'
/**
 * API Route für Marketing Agent
 * Route: /api/agents/marketing
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'marketing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Marketing Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF

# Automation Agent Route erstellen
cat > pages/api/agents/automation.ts << 'EOF'
/**
 * API Route für Automation Agent
 * Route: /api/agents/automation
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'automation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Automation Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF

# Sales Agent Route erstellen
cat > pages/api/agents/sales.ts << 'EOF'
/**
 * API Route für Sales Agent
 * Route: /api/agents/sales
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'sales';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Sales Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF

# Social-YouTube Agent Route erstellen
cat > pages/api/agents/social-youtube.ts << 'EOF'
/**
 * API Route für Social-YouTube Agent
 * Route: /api/agents/social-youtube
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'social-youtube';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Social-YouTube Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF

# Prüfe alle Dateien
echo "✅ API-Routes erstellt:"
ls -la pages/api/agents/*.ts

# Next.js App neu starten
echo ""
echo "🔄 Starte Next.js App neu..."
docker restart the-connection-key-frontend-1

echo ""
echo "✅ Fertig! Testen Sie:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Test\"}'"
```

---

## 📋 Zusammenfassung

**Fehlende Dateien:**
- ❌ `pages/api/agents/marketing.ts`
- ❌ `pages/api/agents/automation.ts`
- ❌ `pages/api/agents/sales.ts`
- ❌ `pages/api/agents/social-youtube.ts`

**Vorhandene Dateien:**
- ✅ `pages/api/agents/chart-development.ts`

**Lösung:** Führen Sie das Script oben aus, um alle fehlenden Routes zu erstellen.


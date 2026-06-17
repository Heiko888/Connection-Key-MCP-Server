#!/bin/bash

# Kopiert die Website-UX-Agent Route direkt in den Container
# Führt auf dem Server aus (167.235.224.149)

set -e

CONTAINER_NAME="the-connection-key-frontend-1"
ROUTE_DIR="/app/app/api/agents/website-ux-agent"
ROUTE_FILE="$ROUTE_DIR/route.ts"

echo "🚀 Kopiere Website-UX-Agent Route in Container"
echo "=============================================="

# Prüfe ob Container läuft
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME läuft nicht!"
    echo "Starte Container..."
    cd /opt/hd-app/The-Connection-Key
    docker compose up -d frontend
    sleep 10
fi

# Erstelle Verzeichnis im Container
echo "📁 Erstelle Verzeichnis im Container..."
docker exec $CONTAINER_NAME mkdir -p "$ROUTE_DIR"

# Route-Datei Inhalt
cat > /tmp/website-ux-agent-route.ts << 'EOF'
/**
 * Website / UX Agent API Route (App Router)
 * Route: /api/agents/website-ux-agent
 * 
 * Analysiert Webseiten, Landingpages und App-Seiten aus UX-, Struktur- und Conversion-Sicht
 * Erstellt Tasks und speichert Ergebnisse in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'website-ux-agent';
const AGENT_NAME = 'Website / UX Agent';

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  let taskId: string | null = null;
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { message, userId } = body;

    // Validierung
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'message is required and must be a string'
      }, { status: 400 });
    }

    // ============================================
    // SCHRITT 1: Task in Supabase erstellen (Status: pending)
    // ============================================
    const { data: pendingTask, error: createError } = await supabase
      .from('agent_tasks')
      .insert([{
        user_id: userId || null,
        agent_id: AGENT_ID,
        agent_name: AGENT_NAME,
        task_message: message,
        task_type: 'analysis',
        status: 'pending'
      }])
      .select()
      .single();

    if (createError || !pendingTask) {
      console.error('Supabase Task Create Error:', createError);
      // Weiter machen, auch wenn Task-Erstellung fehlschlägt
    } else {
      taskId = pendingTask.id;
    }

    // ============================================
    // SCHRITT 2: Status auf 'processing' setzen
    // ============================================
    if (taskId) {
      await supabase
        .from('agent_tasks')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', taskId);
    }

    // ============================================
    // SCHRITT 3: Website / UX Agent aufrufen
    // ============================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 Minuten Timeout

    let response: Response;
    try {
      response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: userId || 'anonymous'
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Task als failed markieren
      if (taskId) {
        await supabase
          .from('agent_tasks')
          .update({
            status: 'failed',
            error_message: fetchError.name === 'AbortError' 
              ? 'Request timeout after 5 minutes'
              : fetchError.message || 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
      }

      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Website / UX Agent request timeout after 5 minutes',
          taskId
        }, { status: 504 });
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      
      // Task als failed markieren
      if (taskId) {
        await supabase
          .from('agent_tasks')
          .update({
            status: 'failed',
            error_message: `Agent request failed: ${response.status} ${errorText}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
      }

      return NextResponse.json({
        success: false,
        error: `Agent request failed: ${response.status} ${errorText}`,
        taskId
      }, { status: response.status || 500 });
    }

    const data = await response.json();
    const duration = Date.now() - startTime;
    const responseText = data.response || data.message || 'No response from agent';

    // ============================================
    // SCHRITT 4: Task als completed markieren und Ergebnis speichern
    // ============================================
    if (taskId) {
      await supabase
        .from('agent_tasks')
        .update({
          status: 'completed',
          response: responseText,
          response_data: {
            tokens: data.tokens,
            model: data.model || 'gpt-4',
            duration_ms: duration
          },
          metadata: {
            tokens: data.tokens,
            model: data.model || 'gpt-4',
            duration_ms: duration
          },
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      // Auch in agent_responses speichern (für n8n-Workflows)
      await supabase
        .from('agent_responses')
        .insert([{
          task_id: taskId,
          agent: AGENT_ID,
          agent_id: AGENT_ID,
          response: responseText,
          response_data: data,
          tokens: data.tokens,
          model: data.model || 'gpt-4',
          duration_ms: duration,
          metadata: {
            task_id: taskId,
            user_id: userId || null
          }
        }]);

      // Optional: Mattermost-Benachrichtigung via n8n-Webhook
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost';
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: AGENT_ID,
            message: message,
            response: responseText,
            userId: userId || 'anonymous',
            taskId: taskId
          })
        });
      } catch (error) {
        // Fehler ignorieren (Mattermost ist optional)
        console.error('Mattermost notification failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      agentId: AGENT_ID,
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      taskId,
      duration_ms: duration
    });

  } catch (error: any) {
    console.error('Website / UX Agent API Error:', error);

    // Task als failed markieren
    if (taskId) {
      await supabase
        .from('agent_tasks')
        .update({
          status: 'failed',
          error_message: error.message || 'Internal server error',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      taskId
    }, { status: 500 });
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Website / UX Agent API',
    endpoint: '/api/agents/website-ux-agent',
    method: 'POST',
    description: 'Analysiert Webseiten, Landingpages und App-Seiten aus UX-, Struktur- und Conversion-Sicht',
    requiredFields: {
      message: 'string - Die Nachricht/Anfrage an den Agent'
    },
    optionalFields: {
      userId: 'string - User-ID (optional)'
    },
    example: {
      message: 'Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.example.com'
    }
  });
}
EOF

# Kopiere Datei in Container
echo "📤 Kopiere Route-Datei in Container..."
docker cp /tmp/website-ux-agent-route.ts "$CONTAINER_NAME:$ROUTE_FILE"

# Prüfe ob Datei kopiert wurde
echo "🔍 Prüfe ob Datei im Container existiert..."
if docker exec $CONTAINER_NAME test -f "$ROUTE_FILE"; then
    echo "✅ Datei erfolgreich kopiert!"
    docker exec $CONTAINER_NAME ls -lh "$ROUTE_FILE"
else
    echo "❌ Datei nicht gefunden!"
    exit 1
fi

# Container neu starten (damit Next.js die Route erkennt)
echo "🔄 Starte Container neu..."
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend

# Warte 15 Sekunden
echo "⏳ Warte 15 Sekunden auf Container-Start..."
sleep 15

# Teste API
echo "🧪 Teste API..."
echo ""
echo "GET Request:"
curl -s -X GET http://localhost:3000/api/agents/website-ux-agent | head -20
echo ""
echo ""
echo "POST Request (Test):"
curl -s -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H 'Content-Type: application/json' \
  -d '{"message": "Test", "userId": "test"}' | head -50

echo ""
echo "✅ Route erfolgreich kopiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Container-Logs: docker compose logs frontend"
echo "2. Teste API vollständig: curl -X POST http://localhost:3000/api/agents/website-ux-agent -H 'Content-Type: application/json' -d '{\"message\": \"Analysiere https://www.example.com\"}'"

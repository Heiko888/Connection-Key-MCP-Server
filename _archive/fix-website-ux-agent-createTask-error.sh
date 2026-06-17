#!/bin/bash

# Fix Website/UX Agent - createTask is not defined Fehler
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Website/UX Agent - createTask Fehler"
echo "============================================"
echo ""

# 1. Prüfe aktuelle Route
echo "1. Prüfe aktuelle Route..."
echo "-------------------------"
if [ -f "frontend/app/api/agents/website-ux-agent/route.ts" ]; then
    echo "   ✅ Route vorhanden"
    
    # Prüfe auf createTask
    if grep -q "createTask" "frontend/app/api/agents/website-ux-agent/route.ts"; then
        echo "   ❌ ALTE VERSION: createTask gefunden!"
        echo "   Zeilen mit createTask:"
        grep -n "createTask" "frontend/app/api/agents/website-ux-agent/route.ts"
        NEEDS_FIX=true
    else
        echo "   ✅ Route sieht korrekt aus (kein createTask)"
        NEEDS_FIX=false
    fi
else
    echo "   ❌ Route fehlt!"
    exit 1
fi
echo ""

# 2. Erstelle korrigierte Route
if [ "$NEEDS_FIX" = true ]; then
    echo "2. Erstelle korrigierte Route..."
    echo "-------------------------------"
    
    # Backup erstellen
    cp "frontend/app/api/agents/website-ux-agent/route.ts" \
       "frontend/app/api/agents/website-ux-agent/route.ts.backup"
    echo "   ✅ Backup erstellt"
    
    # Erstelle korrigierte Version (basierend auf funktionierender Route)
    cat > "frontend/app/api/agents/website-ux-agent/route.ts" << 'ROUTE_EOF'
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
ROUTE_EOF

    echo "   ✅ Korrigierte Route erstellt"
    echo ""
    
    # Prüfe ob createTask noch vorhanden ist
    if grep -q "createTask" "frontend/app/api/agents/website-ux-agent/route.ts"; then
        echo "   ❌ FEHLER: createTask ist immer noch vorhanden!"
        exit 1
    else
        echo "   ✅ Route ist korrekt (kein createTask)"
    fi
else
    echo "2. Route ist bereits korrekt"
    echo "---------------------------"
fi
echo ""

# 3. Container neu bauen
echo "3. Baue Container neu..."
echo "----------------------"
docker compose -f docker-compose.yml stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose -f docker-compose.yml rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose -f docker-compose.yml build --no-cache frontend
echo ""

# 4. Container starten
echo "4. Starte Container..."
echo "-------------------"
docker compose -f docker-compose.yml up -d frontend
echo ""

# 5. Warte auf Start
echo "5. Warte 30 Sekunden auf Container-Start..."
sleep 30
echo ""

# 6. Teste Route
echo "6. Teste Website/UX Agent Route..."
echo "----------------------------------"
HTTP_CODE=$(curl -s -o /tmp/website-ux-response.json -w "%{http_code}" \
    -X POST "http://localhost:3000/api/agents/website-ux-agent" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $HTTP_CODE)"
    echo "   Response (erste 5 Zeilen):"
    cat /tmp/website-ux-response.json | head -5 | jq '.' 2>/dev/null || cat /tmp/website-ux-response.json | head -5
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ❌ Route gibt immer noch HTTP 500"
    echo "   Response:"
    cat /tmp/website-ux-response.json
    echo ""
    echo "   Prüfe Logs:"
    echo "   docker compose -f docker-compose.yml logs frontend | tail -50"
else
    echo "   ⚠️  Route antwortet mit HTTP $HTTP_CODE"
    cat /tmp/website-ux-response.json | head -10
fi
echo ""

# 7. Zusammenfassung
echo "7. Zusammenfassung:"
echo "------------------"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website/UX Agent Route funktioniert jetzt!"
    echo ""
    echo "📋 Teste auch Marketing und Sales:"
    echo "   curl -X POST http://localhost:3000/api/agents/marketing -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
    echo "   curl -X POST http://localhost:3000/api/agents/sales -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
else
    echo "⚠️  Route hat noch Probleme"
    echo ""
    echo "🔍 Debugging:"
    echo "   1. Prüfe Logs: docker compose -f docker-compose.yml logs frontend | tail -100"
    echo "   2. Prüfe Route: cat frontend/app/api/agents/website-ux-agent/route.ts | head -60"
fi
echo ""

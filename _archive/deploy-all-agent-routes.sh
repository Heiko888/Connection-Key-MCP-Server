#!/bin/bash

# Deploys ALL Agent Routes to Server (Marketing, Automation, Sales, Social-YouTube, Chart Development)
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🚀 Deploy ALL Agent Routes"
echo "==========================="
echo ""

# Funktion: Erstelle Route
create_route() {
  local AGENT_ID=$1
  local AGENT_NAME=$2
  local DESCRIPTION=$3
  local EXAMPLE=$4
  local TASK_TYPE=${5:-'chat'}
  
  echo "📝 Erstelle $AGENT_NAME Route..."
  mkdir -p "frontend/app/api/agents/$AGENT_ID"
  
  cat > "frontend/app/api/agents/$AGENT_ID/route.ts" << EOF
/**
 * $AGENT_NAME API Route (App Router)
 * Route: /api/agents/$AGENT_ID
 * 
 * $DESCRIPTION
 * Erstellt Tasks und speichert Ergebnisse in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = '$AGENT_ID';
const AGENT_NAME = '$AGENT_NAME';

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
        task_type: '$TASK_TYPE',
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
    // SCHRITT 3: $AGENT_NAME aufrufen
    // ============================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 Minuten Timeout

    let response: Response;
    try {
      response = await fetch(\`\${MCP_SERVER_URL}/agent/\${AGENT_ID}\`, {
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
          error: '$AGENT_NAME request timeout after 5 minutes',
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
            error_message: \`Agent request failed: \${response.status} \${errorText}\`,
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
      }

      return NextResponse.json({
        success: false,
        error: \`Agent request failed: \${response.status} \${errorText}\`,
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
    console.error('$AGENT_NAME API Error:', error);

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
    message: '$AGENT_NAME API',
    endpoint: '/api/agents/$AGENT_ID',
    method: 'POST',
    description: '$DESCRIPTION',
    requiredFields: {
      message: 'string - Die Nachricht/Anfrage an den Agent'
    },
    optionalFields: {
      userId: 'string - User-ID (optional)'
    },
    example: {
      message: '$EXAMPLE'
    }
  });
}
EOF

  echo "   ✅ $AGENT_NAME Route erstellt"
}

# 1. Erstelle alle Routen
echo "1. Erstelle alle Agent-Routen..."
echo "--------------------------------"
create_route "marketing" "Marketing Agent" "Marketingstrategien, Reels, Newsletter, Funnels, Social Media Content" "Erstelle eine Marketingstrategie für ein neues Produkt" "chat"
create_route "automation" "Automation Agent" "n8n Workflows, APIs, Webhooks, Serverkonfiguration, CI/CD" "Erstelle einen n8n Workflow für automatische E-Mail-Benachrichtigungen" "chat"
create_route "sales" "Sales Agent" "Verkaufstexte, Funnels, Buyer Journey, Closing, Verkaufspsychologie" "Erstelle einen Verkaufstext für ein neues Produkt" "chat"
create_route "social-youtube" "Social-YouTube Agent" "YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen, Social-Media-Content" "Erstelle ein YouTube-Video-Skript für ein Tutorial" "chat"
create_route "chart-development" "Chart Development Agent" "Chart-Analysen, Human Design Interpretationen, Chart-Berechnungen" "Analysiere einen Human Design Chart" "analysis"
echo ""

# 2. Container neu bauen
echo "2. Baue Container neu..."
echo "----------------------"
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose build --no-cache frontend
echo ""

# 3. Container starten
echo "3. Starte Container..."
echo "-------------------"
docker compose up -d frontend
echo ""

# 4. Warte auf Start
echo "4. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 5. Teste alle Routen
echo "5. Teste alle Routen..."
echo "---------------------"

AGENTS=("marketing" "automation" "sales" "social-youtube" "chart-development")
SUCCESS_COUNT=0
FAIL_COUNT=0

for agent in "${AGENTS[@]}"; do
  echo ""
  echo "   Teste $agent..."
  HTTP_CODE=$(curl -s -o /tmp/${agent}-response.json -w "%{http_code}" \
    -X POST "http://localhost:3000/api/agents/${agent}" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ $agent funktioniert! (HTTP $HTTP_CODE)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  $agent gibt 404 zurück (möglicherweise Build noch nicht fertig)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "   ⚠️  $agent antwortet mit HTTP $HTTP_CODE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""

# 6. Prüfe Routes im Build
echo "6. Prüfe Routes im Build..."
echo "-------------------------"
for agent in "${AGENTS[@]}"; do
  BUILD_ROUTE=$(docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/${agent}/*" -name "route.js" -type f 2>/dev/null | head -1)
  if [ -n "$BUILD_ROUTE" ]; then
    echo "   ✅ $agent im Build gefunden"
  else
    echo "   ⚠️  $agent NICHT im Build gefunden"
  fi
done
echo ""

# 7. Zusammenfassung
echo "7. Zusammenfassung:"
echo "------------------"
echo "   Erfolgreich: $SUCCESS_COUNT / ${#AGENTS[@]}"
echo "   Fehler: $FAIL_COUNT / ${#AGENTS[@]}"
echo ""

if [ $SUCCESS_COUNT -eq ${#AGENTS[@]} ]; then
  echo "✅ ALLE Agent-Routen erfolgreich deployt!"
else
  echo "⚠️  Einige Routen haben noch Probleme"
  echo "   Prüfe Container-Logs: docker compose logs frontend | tail -50"
fi
echo ""

echo "📋 Nächste Schritte:"
echo "1. Teste Routes einzeln:"
for agent in "${AGENTS[@]}"; do
  echo "   curl -X POST http://localhost:3000/api/agents/${agent} -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
done
echo ""
echo "2. Prüfe Tasks Dashboard: http://167.235.224.149:3000/coach/agents/tasks"
echo "3. Prüfe Container-Logs: docker compose logs frontend | tail -50"
echo ""

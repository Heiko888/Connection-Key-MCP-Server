#!/bin/bash

# Fix HTTP 401 bei Tasks Route - Komplett
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix HTTP 401 bei Tasks Route"
echo "==============================="
echo ""

# 1. Prüfe ob Route vorhanden ist
echo "1. Prüfe Route-Datei..."
echo "----------------------"
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Route vorhanden"
    
    # Prüfe ob Route korrekt ist
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" "frontend/app/api/agents/tasks/route.ts"; then
        echo "   ✅ Route verwendet Service Role Key (bypass RLS)"
    else
        echo "   ⚠️  Route verwendet möglicherweise nicht Service Role Key"
    fi
else
    echo "   ❌ Route fehlt - erstelle sie..."
    
    # Erstelle Verzeichnis
    mkdir -p frontend/app/api/agents/tasks
    
    # Erstelle Route-Datei
    cat > "frontend/app/api/agents/tasks/route.ts" << 'ROUTE_EOF'
/**
 * Agent Tasks API Route (App Router)
 * Route: /api/agents/tasks
 * 
 * Abrufen von Agent-Tasks und Ergebnissen
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Client mit Service Role Key (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Tasks abrufen
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query aufbauen
    let query = supabase
      .from('agent_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter anwenden
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tasks',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      pagination: {
        limit,
        offset,
        total: tasks?.length || 0
      }
    });

  } catch (error: any) {
    console.error('Agent Tasks API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Task-Statistiken abrufen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, agentId } = body;

    // Statistiken abrufen
    const { data: stats, error } = await supabase
      .rpc('get_agent_task_statistics', {
        p_user_id: userId || null,
        p_agent_id: agentId || null
      });

    if (error) {
      console.error('Supabase RPC Error:', error);
      // Fallback: Manuelle Statistiken berechnen
      let statsQuery = supabase
        .from('agent_tasks')
        .select('status, agent_id', { count: 'exact' });
      
      if (userId) {
        statsQuery = statsQuery.eq('user_id', userId);
      }
      if (agentId) {
        statsQuery = statsQuery.eq('agent_id', agentId);
      }
      
      const { data: tasks, error: queryError } = await statsQuery;
      
      if (queryError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch statistics',
          details: queryError.message
        }, { status: 500 });
      }
      
      // Manuelle Statistiken berechnen
      const statistics = {
        total: tasks?.length || 0,
        pending: tasks?.filter(t => t.status === 'pending').length || 0,
        processing: tasks?.filter(t => t.status === 'processing').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        failed: tasks?.filter(t => t.status === 'failed').length || 0
      };
      
      return NextResponse.json({
        success: true,
        statistics
      });
    }

    return NextResponse.json({
      success: true,
      statistics: stats?.[0] || {}
    });

  } catch (error: any) {
    console.error('Agent Tasks Statistics Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
ROUTE_EOF
    
    echo "   ✅ Route erstellt"
fi
echo ""

# 2. Prüfe ob Route in integration/ vorhanden ist und kopiere sie
echo "2. Prüfe Route in integration/..."
echo "--------------------------------"
if [ -f "integration/api-routes/app-router/agents/tasks/route.ts" ]; then
    echo "   ✅ Route in integration/ vorhanden"
    
    # Vergleiche mit Server-Version
    if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
        DIFF_COUNT=$(diff -u integration/api-routes/app-router/agents/tasks/route.ts frontend/app/api/agents/tasks/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---" | wc -l)
        if [ $DIFF_COUNT -gt 0 ]; then
            echo "   ⚠️  Unterschiede gefunden - aktualisiere Route"
            cp integration/api-routes/app-router/agents/tasks/route.ts frontend/app/api/agents/tasks/route.ts
            echo "   ✅ Route aktualisiert"
        else
            echo "   ✅ Route ist identisch"
        fi
    else
        echo "   ⚠️  Route auf Server fehlt - kopiere von integration/"
        mkdir -p frontend/app/api/agents/tasks
        cp integration/api-routes/app-router/agents/tasks/route.ts frontend/app/api/agents/tasks/route.ts
        echo "   ✅ Route kopiert"
    fi
else
    echo "   ⚠️  Route nicht in integration/ gefunden"
fi
echo ""

# 3. Prüfe Environment Variables
echo "3. Prüfe Environment Variables..."
echo "---------------------------------"
if docker exec $(docker ps -q -f name=frontend) env | grep -q "NEXT_PUBLIC_SUPABASE_URL"; then
    echo "   ✅ NEXT_PUBLIC_SUPABASE_URL gesetzt"
    SUPABASE_URL=$(docker exec $(docker ps -q -f name=frontend) env | grep "NEXT_PUBLIC_SUPABASE_URL" | cut -d'=' -f2)
    echo "   URL: ${SUPABASE_URL:0:50}..."
else
    echo "   ❌ NEXT_PUBLIC_SUPABASE_URL fehlt!"
fi

if docker exec $(docker ps -q -f name=frontend) env | grep -q "SUPABASE_SERVICE_ROLE_KEY"; then
    echo "   ✅ SUPABASE_SERVICE_ROLE_KEY gesetzt"
    KEY_LENGTH=$(docker exec $(docker ps -q -f name=frontend) env | grep "SUPABASE_SERVICE_ROLE_KEY" | cut -d'=' -f2 | wc -c)
    echo "   Key-Länge: $KEY_LENGTH Zeichen"
else
    echo "   ❌ SUPABASE_SERVICE_ROLE_KEY fehlt!"
    echo "   ⚠️  Das könnte das Problem sein!"
fi
echo ""

# 4. Teste Supabase-Verbindung direkt
echo "4. Teste Supabase-Verbindung..."
echo "-------------------------------"
SUPABASE_URL=$(docker exec $(docker ps -q -f name=frontend) env | grep "NEXT_PUBLIC_SUPABASE_URL" | cut -d'=' -f2 || echo "")
SUPABASE_KEY=$(docker exec $(docker ps -q -f name=frontend) env | grep "SUPABASE_SERVICE_ROLE_KEY" | cut -d'=' -f2 || echo "")

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
    echo "   Teste Supabase Query..."
    TEST_RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/agent_tasks" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -H "Range: 0-0" 2>&1)
    
    if echo "$TEST_RESULT" | grep -q "error\|Error\|ERROR"; then
        echo "   ⚠️  Supabase Query gibt Fehler:"
        echo "$TEST_RESULT" | head -5
    else
        echo "   ✅ Supabase-Verbindung funktioniert"
    fi
else
    echo "   ⚠️  Kann Supabase-Verbindung nicht testen (URL oder Key fehlt)"
fi
echo ""

# 5. Container neu bauen
echo "5. Baue Container neu..."
echo "----------------------"
docker compose -f docker-compose.yml stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose -f docker-compose.yml rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose -f docker-compose.yml build --no-cache frontend
echo ""

# 6. Container starten
echo "6. Starte Container..."
echo "-------------------"
docker compose -f docker-compose.yml up -d frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 30 Sekunden auf Container-Start..."
sleep 30
echo ""

# 8. Teste Route
echo "8. Teste Tasks Route..."
echo "----------------------"
BASE_URL="http://localhost:3000"

# GET Test
HTTP_CODE_GET=$(curl -s -o /tmp/tasks-test-get.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" 2>/dev/null || echo "000")

if [ "$HTTP_CODE_GET" = "200" ]; then
    echo "   ✅ GET funktioniert! (HTTP $HTTP_CODE_GET)"
    TASK_COUNT=$(cat /tmp/tasks-test-get.json | jq -r '.tasks | length' 2>/dev/null || echo "?")
    echo "   📊 Tasks gefunden: $TASK_COUNT"
elif [ "$HTTP_CODE_GET" = "401" ]; then
    echo "   ❌ GET gibt immer noch HTTP 401"
    echo "   Response:"
    cat /tmp/tasks-test-get.json | head -10
    echo ""
    echo "   ⚠️  Problem könnte sein:"
    echo "   1. Supabase RLS ist aktiv (trotz Service Role Key)"
    echo "   2. Next.js Middleware blockiert die Route"
    echo "   3. Environment Variables sind nicht korrekt gesetzt"
else
    echo "   ⚠️  GET gibt HTTP $HTTP_CODE_GET"
    cat /tmp/tasks-test-get.json | head -10
fi
echo ""

# POST Test
HTTP_CODE_POST=$(curl -s -o /tmp/tasks-test-post.json -w "%{http_code}" \
    -X POST "${BASE_URL}/api/agents/tasks" \
    -H "Content-Type: application/json" \
    -d '{"userId": "test"}' 2>/dev/null || echo "000")

if [ "$HTTP_CODE_POST" = "200" ]; then
    echo "   ✅ POST funktioniert! (HTTP $HTTP_CODE_POST)"
elif [ "$HTTP_CODE_POST" = "401" ]; then
    echo "   ❌ POST gibt immer noch HTTP 401"
    echo "   Response:"
    cat /tmp/tasks-test-post.json | head -10
else
    echo "   ⚠️  POST gibt HTTP $HTTP_CODE_POST"
    cat /tmp/tasks-test-post.json | head -10
fi
echo ""

# 9. Zusammenfassung
echo "9. Zusammenfassung:"
echo "------------------"
if [ "$HTTP_CODE_GET" = "200" ] && [ "$HTTP_CODE_POST" = "200" ]; then
    echo "✅ Tasks Route funktioniert jetzt!"
    echo ""
    echo "🎯 Teste alle Routen:"
    echo "   ./test-all-agents.sh"
else
    echo "⚠️  Tasks Route hat noch Probleme"
    echo ""
    echo "🔍 Weitere Debugging-Schritte:"
    echo "   1. Prüfe Container-Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
    echo ""
    echo "   2. Prüfe Route-Datei:"
    echo "      cat frontend/app/api/agents/tasks/route.ts | head -30"
    echo ""
    echo "   3. Prüfe Environment Variables:"
    echo "      docker exec \$(docker ps -q -f name=frontend) env | grep SUPABASE"
    echo ""
    echo "   4. Teste Supabase direkt:"
    echo "      curl -X GET \"\${SUPABASE_URL}/rest/v1/agent_tasks?select=*&limit=1\" \\"
    echo "        -H \"apikey: \${SUPABASE_KEY}\" \\"
    echo "        -H \"Authorization: Bearer \${SUPABASE_KEY}\""
fi
echo ""

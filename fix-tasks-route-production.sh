#!/bin/bash

# Fix für Tasks Route im Production-Modus
# Route muss beim Build vorhanden sein, nicht zur Laufzeit kopiert werden
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

CONTAINER_NAME="the-connection-key-frontend-1"
LOCAL_ROUTE_FILE="frontend/app/api/agents/tasks/route.ts"

echo "🔧 Fix: Tasks Route für Production-Build"
echo "========================================="
echo ""

# 1. Prüfe ob lokale Datei existiert
echo "1. Prüfe lokale Datei:"
echo "----------------------"
if [ -f "$LOCAL_ROUTE_FILE" ]; then
    echo "   ✅ Datei existiert: $LOCAL_ROUTE_FILE"
    ls -lh "$LOCAL_ROUTE_FILE"
else
    echo "   ❌ Datei existiert NICHT!"
    echo "   Erstelle Datei..."
    mkdir -p "$(dirname "$LOCAL_ROUTE_FILE")"
    
    # Erstelle Route-Datei
    cat > "$LOCAL_ROUTE_FILE" << 'EOF'
/**
 * Agent Tasks API Route (App Router)
 * Route: /api/agents/tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('agent_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) query = query.eq('user_id', userId);
    if (agentId) query = query.eq('agent_id', agentId);
    if (status) query = query.eq('status', status);

    const { data: tasks, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tasks'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      pagination: { limit, offset, total: tasks?.length || 0 }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, agentId } = body;

    const { data: stats, error } = await supabase.rpc('get_agent_task_statistics', {
      p_user_id: userId || null,
      p_agent_id: agentId || null
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch statistics'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statistics: stats?.[0] || {}
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
EOF
    
    echo "   ✅ Datei erstellt!"
fi
echo ""

# 2. Prüfe ob Datei im integration-Verzeichnis existiert (für Git)
echo "2. Prüfe integration-Verzeichnis:"
echo "---------------------------------"
INTEGRATION_ROUTE_FILE="integration/api-routes/app-router/agents/tasks/route.ts"
if [ -f "$INTEGRATION_ROUTE_FILE" ]; then
    echo "   ✅ Datei existiert in integration: $INTEGRATION_ROUTE_FILE"
else
    echo "   ⚠️  Datei existiert NICHT in integration"
    echo "   Kopiere von lokal nach integration..."
    mkdir -p "$(dirname "$INTEGRATION_ROUTE_FILE")"
    cp "$LOCAL_ROUTE_FILE" "$INTEGRATION_ROUTE_FILE"
    echo "   ✅ Datei nach integration kopiert"
fi
echo ""

# 3. Stoppe Container
echo "3. Stoppe Container:"
echo "-------------------"
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
echo ""

# 4. Entferne alten Container
echo "4. Entferne alten Container:"
echo "---------------------------"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
echo ""

# 5. Baue Container neu (OHNE Cache)
echo "5. Baue Container neu (ohne Cache):"
echo "-----------------------------------"
echo "   ⏳ Das kann einige Minuten dauern..."
docker compose build --no-cache frontend
echo ""

# 6. Starte Container
echo "6. Starte Container:"
echo "-------------------"
docker compose up -d frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 8. Prüfe Container-Status
echo "8. Prüfe Container-Status:"
echo "-------------------------"
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "   ✅ Container läuft"
else
    echo "   ❌ Container läuft nicht!"
    echo "   Prüfe Logs: docker compose logs frontend"
    exit 1
fi
echo ""

# 9. Prüfe ob Route im Build vorhanden ist
echo "9. Prüfe Route im Build:"
echo "-----------------------"
BUILD_ROUTE=$(docker exec $CONTAINER_NAME find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | head -1)
if [ -n "$BUILD_ROUTE" ]; then
    echo "   ✅ Route im Build gefunden: $BUILD_ROUTE"
    docker exec $CONTAINER_NAME ls -lh "$BUILD_ROUTE" 2>/dev/null
else
    echo "   ❌ Route NICHT im Build gefunden!"
    echo "   Prüfe Build-Logs auf Fehler..."
    docker compose logs frontend | grep -i error | tail -10
fi
echo ""

# 10. Teste API
echo "10. Teste API:"
echo "-------------"
echo "   Teste GET /api/agents/tasks..."
HTTP_CODE=$(curl -s -o /tmp/tasks-response.json -w "%{http_code}" http://localhost:3000/api/agents/tasks || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $HTTP_CODE)"
    echo "   Response:"
    head -20 /tmp/tasks-response.json
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Route gibt immer noch 404 zurück"
    echo "   Prüfe Container-Logs:"
    docker compose logs frontend | tail -30
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ⚠️  Route gibt 500 zurück (Server-Fehler)"
    echo "   Response:"
    cat /tmp/tasks-response.json
else
    echo "   ❌ Route nicht erreichbar (HTTP $HTTP_CODE)"
fi
echo ""

# 11. Zusammenfassung
echo "11. Zusammenfassung:"
echo "-------------------"
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ ERFOLG: Route funktioniert!"
    echo ""
    echo "   📋 Nächste Schritte:"
    echo "   - Route ist jetzt im Build enthalten"
    echo "   - Bei zukünftigen Änderungen: Container neu bauen"
else
    echo "   ❌ PROBLEM: Route funktioniert noch nicht"
    echo ""
    echo "   🔍 Debugging:"
    echo "   1. Prüfe Build-Logs: docker compose logs frontend | grep -i error"
    echo "   2. Prüfe ob Datei lokal existiert: ls -la $LOCAL_ROUTE_FILE"
    echo "   3. Prüfe Container-Inhalt: docker exec $CONTAINER_NAME find /app/app/api/agents/tasks"
    echo "   4. Prüfe Build-Verzeichnis: docker exec $CONTAINER_NAME find /app/.next -path '*/api/agents/tasks/*'"
fi
echo ""

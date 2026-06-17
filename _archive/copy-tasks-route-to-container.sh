#!/bin/bash

# Kopiert Tasks Route direkt in den Container
# Führt auf Server aus (167.235.224.149)

set -e

CONTAINER_NAME="the-connection-key-frontend-1"
ROUTE_DIR="/app/app/api/agents/tasks"
ROUTE_FILE="$ROUTE_DIR/route.ts"

echo "🚀 Kopiere Tasks Route in Container"
echo "===================================="
echo ""

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

# Prüfe ob lokale Datei existiert
if [ ! -f "/opt/hd-app/The-Connection-Key/frontend/app/api/agents/tasks/route.ts" ]; then
    echo "❌ Lokale Datei nicht gefunden!"
    echo "Erstelle Datei..."
    mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/agents/tasks
    # Datei wird unten erstellt
fi

# Route-Datei Inhalt
cat > /tmp/tasks-route.ts << 'EOF'
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

# Kopiere Datei in Container
echo "📤 Kopiere Route-Datei in Container..."
docker cp /tmp/tasks-route.ts "$CONTAINER_NAME:$ROUTE_FILE"

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
curl -s -X GET http://localhost:3000/api/agents/tasks | head -20
echo ""

echo "✅ Route erfolgreich kopiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Container-Logs: docker compose logs frontend"
echo "2. Teste API vollständig: curl -X GET http://localhost:3000/api/agents/tasks"

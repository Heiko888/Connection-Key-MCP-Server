#!/bin/bash

# Fix für Tasks Route 404
# Führt auf Server aus

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Tasks Route 404"
echo "======================"
echo ""

# 1. Prüfe ob Datei existiert
echo "1. Prüfe ob Datei existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Größe: $(wc -l < frontend/app/api/agents/tasks/route.ts) Zeilen"
    head -5 frontend/app/api/agents/tasks/route.ts
else
    echo "   ❌ Datei existiert nicht!"
    echo "   Erstelle Datei..."
    mkdir -p frontend/app/api/agents/tasks
    # Datei wird unten erstellt
fi
echo ""

# 2. Prüfe ob Datei korrekt ist
echo "2. Prüfe Datei-Inhalt..."
if grep -q "export async function GET" frontend/app/api/agents/tasks/route.ts 2>/dev/null; then
    echo "   ✅ Datei sieht korrekt aus"
else
    echo "   ⚠️  Datei scheint unvollständig zu sein"
    echo "   Erstelle Datei neu..."
    # Datei wird unten neu erstellt
fi
echo ""

# 3. Erstelle/Überschreibe route.ts mit korrektem Inhalt
echo "3. Erstelle route.ts mit korrektem Inhalt..."
cat > frontend/app/api/agents/tasks/route.ts << 'ROUTE_EOF'
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
ROUTE_EOF

echo "   ✅ route.ts erstellt/aktualisiert"
echo ""

# 4. Prüfe ob Datei jetzt existiert
echo "4. Prüfe ob Datei existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Zeilen: $(wc -l < frontend/app/api/agents/tasks/route.ts)"
else
    echo "   ❌ Datei existiert immer noch nicht!"
    exit 1
fi
echo ""

# 5. Container komplett neu bauen (ohne Cache)
echo "5. Baue Container neu (ohne Cache)..."
docker compose build --no-cache frontend
echo ""

# 6. Container neu starten
echo "6. Starte Container neu..."
docker compose restart frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 8. Prüfe ob Route im Build ist
echo "8. Prüfe ob Route im Build ist..."
if docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | grep -q tasks; then
    echo "   ✅ Route ist im Build!"
else
    echo "   ⚠️  Route ist noch nicht im Build"
    echo "   Prüfe Build-Logs..."
    docker compose logs frontend | tail -30 | grep -i error || echo "   Keine offensichtlichen Fehler"
fi
echo ""

# 9. Teste Route
echo "9. Teste Route..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/agents/tasks 2>/dev/null)
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -3)

if [ "$http_code" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $http_code)"
    echo "$body" | head -1
elif echo "$body" | grep -q "success"; then
    echo "   ✅ Route antwortet! (HTTP $http_code)"
    echo "$body" | head -1
else
    echo "   ⚠️  Route antwortet mit HTTP $http_code"
    echo "$body" | head -1
fi
echo ""

echo "✅ Fertig!"

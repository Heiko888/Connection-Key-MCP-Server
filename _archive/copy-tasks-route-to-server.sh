#!/bin/bash

# Kopiert tasks Route auf Server und baut Container neu
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "📋 Kopiere Tasks Route auf Server"
echo "=================================="
echo ""

# 1. Erstelle Verzeichnis
echo "1. Erstelle Verzeichnis..."
mkdir -p frontend/app/api/agents/tasks
echo "   ✅ Verzeichnis erstellt"
echo ""

# 2. Erstelle route.ts Datei
echo "2. Erstelle route.ts Datei..."
cat > frontend/app/api/agents/tasks/route.ts << 'EOF'
/**
 * Agent Tasks API Route (App Router)
 * Route: /api/agents/tasks
 * 
 * Abrufen von Agent-Tasks und Ergebnissen
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
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
        error: 'Failed to fetch tasks'
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

    // Verwende RPC-Funktion für Statistiken
    const { data: stats, error } = await supabase.rpc('get_agent_task_statistics', {
      p_user_id: userId || null,
      p_agent_id: agentId || null
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch statistics'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statistics: stats || {}
    });

  } catch (error: any) {
    console.error('Agent Tasks Statistics API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
EOF

echo "   ✅ route.ts erstellt"
echo ""

# 3. Prüfe ob Datei existiert
echo "3. Prüfe ob Datei existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Größe: $(wc -l < frontend/app/api/agents/tasks/route.ts) Zeilen"
else
    echo "   ❌ Datei existiert nicht!"
    exit 1
fi
echo ""

# 4. Container neu bauen
echo "4. Baue Container neu..."
docker compose build frontend
echo ""

# 5. Container neu starten
echo "5. Starte Container neu..."
docker compose restart frontend
echo ""

# 6. Warte auf Start
echo "6. Warte 15 Sekunden..."
sleep 15
echo ""

# 7. Teste Route
echo "7. Teste Route..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/agents/tasks 2>/dev/null)
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -3)

if [ "$http_code" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $http_code)"
    echo "$body" | head -1
else
    echo "   ⚠️  Route antwortet mit HTTP $http_code"
    echo "$body" | head -1
fi
echo ""

echo "✅ Fertig!"

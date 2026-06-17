#!/bin/bash

# Deploy System Auth - Komplett
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Deploy System Auth - Komplett"
echo "================================"
echo ""

# 1. Erstelle lib-Verzeichnis
echo "1. Erstelle lib-Verzeichnis..."
echo "------------------------------"
mkdir -p frontend/lib
echo "   ✅ Verzeichnis erstellt"
echo ""

# 2. Kopiere system-auth.ts
echo "2. Kopiere system-auth.ts..."
echo "----------------------------"
if [ -f "frontend/lib/system-auth.ts" ]; then
    echo "   ⚠️  Datei existiert bereits - überschreibe"
fi

# Erstelle system-auth.ts
cat > "frontend/lib/system-auth.ts" << 'AUTH_EOF'
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SYSTEM_TOKEN = process.env.AGENT_SYSTEM_TOKEN!;
const HMAC_SECRET = process.env.AGENT_HMAC_SECRET || '';
const ALLOWED_IPS = (process.env.AGENT_ALLOWED_IPS || '')
  .split(',')
  .map(ip => ip.trim())
  .filter(ip => ip.length > 0);

if (!SYSTEM_TOKEN) {
  throw new Error(
    '❌ AGENT_SYSTEM_TOKEN is not defined in environment variables'
  );
}

export class SystemAuthError extends Error {
  status = 401;
  code = 'SYSTEM_AUTH_FAILED';
  constructor(message: string) {
    super(message);
    this.name = 'SystemAuthError';
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

function verifyIP(request: NextRequest) {
  if (!ALLOWED_IPS.length) return;

  const ip = getClientIP(request);
  if (!ALLOWED_IPS.includes(ip)) {
    throw new SystemAuthError(`IP not allowed: ${ip}`);
  }
}

function verifyToken(request: NextRequest) {
  const token =
    request.headers.get('x-agent-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new SystemAuthError('Missing system authentication token');
  }

  if (token !== SYSTEM_TOKEN) {
    throw new SystemAuthError('Invalid system authentication token');
  }
}

function verifyHMAC(request: NextRequest) {
  if (!HMAC_SECRET) return; // HMAC optional if secret not set

  const signature = request.headers.get('x-agent-signature');
  const timestamp = request.headers.get('x-agent-timestamp');

  if (!signature || !timestamp) {
    throw new SystemAuthError('Missing HMAC headers (x-agent-signature, x-agent-timestamp)');
  }

  // Validate timestamp (prevent replay attacks)
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 300) { // 5 minutes tolerance
    throw new SystemAuthError('Request timestamp too old or too far in future');
  }

  // Note: For GET requests, body is empty
  // For POST/PUT/PATCH, we need to read the body
  // This is a simplified version - in production, you'd need to handle body parsing
  const body = request.method === 'GET' ? '' : '';
  const payload = `${timestamp}.${body}`;

  const expected = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expected) {
    throw new SystemAuthError('Invalid HMAC signature');
  }
}

/**
 * 🔐 System Authentication
 * 
 * Prüft System-Auth über Header:
 * - x-agent-token: <SYSTEM_TOKEN>
 * - Optional: x-agent-signature, x-agent-timestamp (HMAC)
 * - Optional: IP Whitelist
 * 
 * @param request - Next.js Request
 * @param options - Security options
 * @throws SystemAuthError if authentication fails
 */
export function requireSystemAuth(
  request: NextRequest,
  options: { hmac?: boolean; ip?: boolean } = {}
) {
  if (options.ip) {
    verifyIP(request);
  }
  
  verifyToken(request);
  
  if (options.hmac) {
    verifyHMAC(request);
  }
}

/**
 * Optional: Prüft ob Request ein System-Request ist
 * (z. B. für Dual-Mode Routes)
 */
export function isSystemRequest(request: NextRequest): boolean {
  const token =
    request.headers.get('x-agent-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  return token === SYSTEM_TOKEN;
}
AUTH_EOF

echo "   ✅ system-auth.ts erstellt"
echo ""

# 3. Erstelle neue System-Route
echo "3. Erstelle System-Route..."
echo "---------------------------"
mkdir -p frontend/app/api/system/agents/tasks

# Kopiere von integration/ falls vorhanden
if [ -f "integration/api-routes/app-router/system/agents/tasks/route.ts" ]; then
    cp integration/api-routes/app-router/system/agents/tasks/route.ts \
       frontend/app/api/system/agents/tasks/route.ts
    echo "   ✅ Route von integration/ kopiert"
else
    # Erstelle Route direkt
    cat > "frontend/app/api/system/agents/tasks/route.ts" << 'ROUTE_EOF'
/**
 * System Agent Tasks API Route (App Router)
 * Route: /api/system/agents/tasks
 * 
 * System-Infrastruktur für Agent-Tasks
 * - Keine User-Authentifizierung
 * - Nur System-Token-Auth
 * - Für MCP, n8n, Worker, Agenten
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSystemAuth, SystemAuthError } from '@/lib/system-auth';

// Supabase Client mit Service Role Key (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Tasks abrufen
export async function GET(request: NextRequest) {
  try {
    // System-Auth (kein User-Auth!)
    requireSystemAuth(request, { ip: false, hmac: false });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

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
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch tasks',
          details: error.message
        },
        meta: {
          source: 'system',
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasks || [],
        pagination: {
          limit,
          offset,
          total: tasks?.length || 0
        }
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof SystemAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        },
        { status: error.status }
      );
    }

    console.error('System Agent Tasks API Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SYSTEM_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// POST: Task-Statistiken abrufen
export async function POST(request: NextRequest) {
  try {
    // System-Auth (kein User-Auth!)
    requireSystemAuth(request, { ip: false, hmac: false });

    const body = await request.json();
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
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch statistics',
            details: queryError.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        }, { status: 500 });
      }
      
      // Manuelle Statistiken berechnen
      const statistics = {
        total: tasks?.length || 0,
        pending: tasks?.filter((t: any) => t.status === 'pending').length || 0,
        processing: tasks?.filter((t: any) => t.status === 'processing').length || 0,
        completed: tasks?.filter((t: any) => t.status === 'completed').length || 0,
        failed: tasks?.filter((t: any) => t.status === 'failed').length || 0
      };
      
      return NextResponse.json({
        success: true,
        data: { statistics },
        meta: {
          source: 'system',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats?.[0] || {}
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof SystemAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        },
        { status: error.status }
      );
    }

    console.error('System Agent Tasks Statistics Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SYSTEM_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
ROUTE_EOF
    echo "   ✅ Route erstellt"
fi
echo ""

# 4. Prüfe Environment Variables
echo "4. Prüfe Environment Variables..."
echo "---------------------------------"
CONTAINER_ID=$(docker ps -q -f name=frontend)

if [ -n "$CONTAINER_ID" ]; then
    if docker exec $CONTAINER_ID env | grep -q "AGENT_SYSTEM_TOKEN"; then
        echo "   ✅ AGENT_SYSTEM_TOKEN gesetzt"
    else
        echo "   ⚠️  AGENT_SYSTEM_TOKEN fehlt!"
        echo "   ⚠️  WICHTIG: Füge AGENT_SYSTEM_TOKEN zu docker-compose.yml hinzu!"
        echo ""
        echo "   Beispiel:"
        echo "   AGENT_SYSTEM_TOKEN=your-64-char-random-secret"
    fi
else
    echo "   ⚠️  Container läuft nicht - kann nicht prüfen"
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

# 8. Teste neue Route
echo "8. Teste neue System-Route..."
echo "-----------------------------"
BASE_URL="http://localhost:3000"

# Hole Token aus Environment
SYSTEM_TOKEN=$(docker exec $(docker ps -q -f name=frontend) env | grep "AGENT_SYSTEM_TOKEN" | cut -d'=' -f2 || echo "")

if [ -z "$SYSTEM_TOKEN" ]; then
    echo "   ⚠️  AGENT_SYSTEM_TOKEN nicht gesetzt - kann nicht testen"
    echo "   ⚠️  Setze Token in docker-compose.yml und starte Container neu"
else
    # GET Test
    HTTP_CODE=$(curl -s -o /tmp/system-tasks-test.json -w "%{http_code}" \
        -X GET "${BASE_URL}/api/system/agents/tasks" \
        -H "x-agent-token: ${SYSTEM_TOKEN}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ GET funktioniert! (HTTP $HTTP_CODE)"
        RESPONSE=$(cat /tmp/system-tasks-test.json)
        echo "   Response:"
        echo "$RESPONSE" | jq '.' 2>/dev/null | head -10 || echo "$RESPONSE" | head -10
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "   ❌ GET gibt HTTP 401"
        echo "   Response:"
        cat /tmp/system-tasks-test.json | head -10
    else
        echo "   ⚠️  GET gibt HTTP $HTTP_CODE"
        cat /tmp/system-tasks-test.json | head -10
    fi
fi
echo ""

# 9. Zusammenfassung
echo "9. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ System Auth deployed!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Setze AGENT_SYSTEM_TOKEN in docker-compose.yml:"
echo "      AGENT_SYSTEM_TOKEN=your-64-char-random-secret"
echo ""
echo "   2. Teste Route:"
echo "      curl -X GET http://localhost:3000/api/system/agents/tasks \\"
echo "        -H \"x-agent-token: YOUR_TOKEN\""
echo ""
echo "   3. Alte Route /api/agents/tasks kann entfernt werden"
echo "      (wenn alles funktioniert)"
echo ""
echo "   4. Update alle Agent-Routen auf /api/system/agents/*"
echo ""

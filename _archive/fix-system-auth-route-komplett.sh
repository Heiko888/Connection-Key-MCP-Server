#!/bin/bash

# Fix System-Auth Route komplett: Deploy + Build + Test
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix System-Auth Route Komplett"
echo "=================================="
echo ""

# 1. Deploy System-Auth Dateien
echo "1. Deploy System-Auth Dateien..."
echo "--------------------------------"

if [ -f "deploy-system-auth-direkt.sh" ]; then
    chmod +x deploy-system-auth-direkt.sh
    ./deploy-system-auth-direkt.sh
elif [ -f "deploy-system-auth-auf-server.sh" ]; then
    chmod +x deploy-system-auth-auf-server.sh
    ./deploy-system-auth-auf-server.sh
else
    echo "   ⚠️  deploy-system-auth-auf-server.sh nicht gefunden"
    echo "   📝 Erstelle Dateien manuell..."
    
    FRONTEND_DIR="integration/frontend"
    mkdir -p "$FRONTEND_DIR/lib"
    mkdir -p "$FRONTEND_DIR/app/api/system/agents/tasks"
    
    # Kopiere system-auth.ts
    if [ -f "frontend/lib/system-auth.ts" ]; then
        cp frontend/lib/system-auth.ts "$FRONTEND_DIR/lib/system-auth.ts"
        echo "   ✅ system-auth.ts kopiert"
    elif [ -f "integration/api-routes/app-router/system/agents/tasks/route.ts" ]; then
        # Erstelle system-auth.ts direkt
        cat > "$FRONTEND_DIR/lib/system-auth.ts" << 'AUTH_EOF'
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
  if (!HMAC_SECRET) return;

  const signature = request.headers.get('x-agent-signature');
  const timestamp = request.headers.get('x-agent-timestamp');

  if (!signature || !timestamp) {
    throw new SystemAuthError('Missing HMAC headers (x-agent-signature, x-agent-timestamp)');
  }

  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 300) {
    throw new SystemAuthError('Request timestamp too old or too far in future');
  }

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

export function isSystemRequest(request: NextRequest): boolean {
  const token =
    request.headers.get('x-agent-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  return token === SYSTEM_TOKEN;
}
AUTH_EOF
        echo "   ✅ system-auth.ts erstellt"
    fi
    
    # Kopiere Route
    if [ -f "integration/api-routes/app-router/system/agents/tasks/route.ts" ]; then
        cp integration/api-routes/app-router/system/agents/tasks/route.ts \
           "$FRONTEND_DIR/app/api/system/agents/tasks/route.ts"
        echo "   ✅ Route kopiert"
    else
        echo "   ❌ Route-Datei nicht gefunden!"
        exit 1
    fi
fi

echo ""

# 2. Prüfe ob Dateien jetzt vorhanden sind
echo "2. Prüfe Dateien..."
echo "------------------"

# Prüfe beide mögliche Verzeichnisse
if [ -d "frontend" ]; then
    FRONTEND_DIR="frontend"
elif [ -d "integration/frontend" ]; then
    FRONTEND_DIR="integration/frontend"
else
    echo "   ❌ Weder frontend/ noch integration/frontend/ gefunden!"
    exit 1
fi

SYSTEM_AUTH_FILE="$FRONTEND_DIR/lib/system-auth.ts"
SYSTEM_ROUTE_FILE="$FRONTEND_DIR/app/api/system/agents/tasks/route.ts"

if [ ! -f "$SYSTEM_AUTH_FILE" ]; then
    echo "   ❌ system-auth.ts immer noch nicht vorhanden!"
    exit 1
fi

if [ ! -f "$SYSTEM_ROUTE_FILE" ]; then
    echo "   ❌ Route immer noch nicht vorhanden!"
    exit 1
fi

echo "   ✅ Alle Dateien vorhanden"
echo ""

# 3. Container neu bauen
echo "3. Container neu bauen..."
echo "------------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "   Stoppe Container: $FRONTEND_CONTAINER"
    docker compose -f docker-compose.yml stop frontend
fi

echo "   Baue Container neu..."
docker compose -f docker-compose.yml build --no-cache frontend

if [ $? -ne 0 ]; then
    echo "   ❌ Build fehlgeschlagen!"
    exit 1
fi

echo "   ✅ Build erfolgreich"
echo ""

# 4. Container starten
echo "4. Container starten..."
echo "----------------------"

docker compose -f docker-compose.yml up -d frontend

echo "   ⏳ Warte 15 Sekunden auf Container-Start..."
sleep 15

echo ""

# 5. Prüfe ob Dateien im Container sind
echo "5. Prüfe Dateien im Container..."
echo "-------------------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    echo "   ❌ Container läuft nicht!"
    echo "   📝 Prüfe Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend"
    exit 1
fi

echo "   Container: $FRONTEND_CONTAINER"

if docker exec $FRONTEND_CONTAINER test -f /app/lib/system-auth.ts; then
    echo "   ✅ system-auth.ts im Container"
else
    echo "   ❌ system-auth.ts FEHLT im Container!"
    echo "   📝 Prüfe Build-Logs"
    exit 1
fi

if docker exec $FRONTEND_CONTAINER test -f /app/app/api/system/agents/tasks/route.ts; then
    echo "   ✅ Route im Container"
else
    echo "   ❌ Route FEHLT im Container!"
    echo "   📝 Prüfe Build-Logs"
    exit 1
fi

echo ""

# 6. Teste Route
echo "6. Teste Route..."
echo "----------------"

if [ -f "test-system-auth-final.sh" ]; then
    chmod +x test-system-auth-final.sh
    ./test-system-auth-final.sh
else
    echo "   ⚠️  test-system-auth-final.sh nicht gefunden"
    echo ""
    echo "   📝 Manueller Test:"
    TOKEN=$(grep "AGENT_SYSTEM_TOKEN" .env | cut -d'=' -f2 | tr -d ' ')
    echo "   curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: $TOKEN\""
fi

echo ""
echo "✅ Fix abgeschlossen!"

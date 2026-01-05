import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

/**
 * Generische Agent-Route mit strikter Sicherheit
 * Blockiert alle nicht-whitelisteten Agenten und unautorisierte Zugriffe
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;

  // SECURITY: CoachAuth ZWINGEND erforderlich
  const auth = await checkCoachAuth(request);
  
  if (!auth || !auth.user || !auth.isCoach) {
    console.warn('[SECURITY] Unauthorized agent access', {
      type: 'agent-api',
      agentId,
      authorized: false,
      hasUser: !!auth?.user,
      isCoach: auth?.isCoach,
    });

    return NextResponse.json(
      { error: 'Unauthorized – coach access required' },
      { status: 401 }
    );
  }

  // SECURITY: Agent-Whitelist prüfen
  if (!isAllowedAgent(agentId)) {
    console.warn('[SECURITY] Unknown agent attempted', {
      type: 'agent-api',
      agentId,
      userId: auth.user.id,
      allowedAgents: ['marketing', 'automation', 'sales', 'social-youtube', 'chart', 'ui-ux'],
    });

    return NextResponse.json(
      { error: 'Unknown agent' },
      { status: 404 }
    );
  }

  // SECURITY: Task-Kontext prüfen
  const body = await request.json();
  const { taskId } = body;

  if (!taskId) {
    console.warn('[SECURITY] Missing task context', {
      type: 'agent-api',
      agentId,
      userId: auth.user.id,
    });

    return NextResponse.json(
      { error: 'Task context required' },
      { status: 400 }
    );
  }

  // Security-Logging
  console.log('[SECURITY] Authorized agent access', {
    type: 'agent-api',
    agentId,
    userId: auth.user.id,
    taskId,
    authorized: true,
  });

  // Weiterleitung an spezifische Route (falls vorhanden)
  // Ansonsten: 404 (sollte nicht passieren, da Whitelist prüft)
  return NextResponse.json(
    { 
      error: 'Use specific agent route',
      message: `Please use /api/agents/${agentId} instead of /api/agents/[agentId]`,
      availableRoutes: ['/api/agents/marketing', '/api/agents/automation', '/api/agents/sales', '/api/agents/social-youtube', '/api/agents/chart', '/api/agents/ui-ux']
    },
    { status: 404 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;

  // SECURITY: CoachAuth ZWINGEND erforderlich
  const auth = await checkCoachAuth(request);
  
  if (!auth || !auth.user || !auth.isCoach) {
    return NextResponse.json(
      { error: 'Unauthorized – coach access required' },
      { status: 401 }
    );
  }

  // SECURITY: Agent-Whitelist prüfen
  if (!isAllowedAgent(agentId)) {
    return NextResponse.json(
      { error: 'Unknown agent' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: `Agent ${agentId} API`,
    agentId,
    method: 'POST',
    requiredFields: ['message', 'taskId'],
    note: 'Use specific route: /api/agents/' + agentId,
  });
}

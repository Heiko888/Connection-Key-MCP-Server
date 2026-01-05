import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { tasksStore, type AgentTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

export const runtime = 'nodejs';

interface TaskStatistics {
  total_tasks: number;
  pending_tasks: number;
  processing_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  avg_duration_ms?: number;
}

// GET /api/agents/tasks - Tasks abrufen
export async function GET(request: NextRequest) {
  try {
    // Debug: Prüfe Authorization Header
    const authHeader = request.headers.get('authorization');
    const debugMsg1 = `🔍 GET /api/agents/tasks - Authorization Header: ${authHeader ? 'Vorhanden' : 'Fehlt'}\n`;
    console.log(debugMsg1.trim());
    process.stderr.write(debugMsg1);
    
    // Authentifizierung prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    const debugMsg2 = `🔍 GET /api/agents/tasks - Auth-Ergebnis: ${JSON.stringify({ 
      hasUser: !!user, 
      userId: user?.id, 
      isCoach 
    })}\n`;
    console.log(debugMsg2.trim());
    process.stderr.write(debugMsg2);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    // Filter Tasks
    let filteredTasks = [...tasksStore];

    if (agentId) {
      filteredTasks = filteredTasks.filter(task => 
        task.agent_id === agentId || task.agent_name.toLowerCase().includes(agentId.toLowerCase())
      );
    }

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    // Sortiere nach created_at (neueste zuerst)
    filteredTasks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pagination
    const paginatedTasks = filteredTasks.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      tasks: paginatedTasks,
      pagination: {
        limit,
        offset,
        total: filteredTasks.length
      }
    });

  } catch (error) {
    console.error('Fehler beim Abrufen der Agent Tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        tasks: [],
        pagination: {
          limit: 20,
          offset: 0,
          total: 0
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/agents/tasks - Statistiken abrufen oder neuen Task erstellen
export async function POST(request: NextRequest) {
  try {
    // Debug: Prüfe Authorization Header
    const authHeader = request.headers.get('authorization');
    const debugMsg1 = `🔍 POST /api/agents/tasks - Authorization Header: ${authHeader ? 'Vorhanden' : 'Fehlt'}\n`;
    console.log(debugMsg1.trim());
    process.stderr.write(debugMsg1);
    
    // Authentifizierung prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    const debugMsg2 = `🔍 POST /api/agents/tasks - Auth-Ergebnis: ${JSON.stringify({ 
      hasUser: !!user, 
      userId: user?.id, 
      isCoach 
    })}\n`;
    console.log(debugMsg2.trim());
    process.stderr.write(debugMsg2);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { agentId } = body;

    // Wenn nur agentId übergeben wird, handelt es sich um eine Statistik-Anfrage
    if (agentId !== undefined && Object.keys(body).length === 1) {
      // Filter Tasks nach Agent
      let filteredTasks = [...tasksStore];
      if (agentId) {
        filteredTasks = filteredTasks.filter(task => 
          task.agent_id === agentId || task.agent_name.toLowerCase().includes(agentId.toLowerCase())
        );
      }

      // Berechne Statistiken
      const statistics: TaskStatistics = {
        total_tasks: filteredTasks.length,
        pending_tasks: filteredTasks.filter(t => t.status === 'pending').length,
        processing_tasks: filteredTasks.filter(t => t.status === 'processing').length,
        completed_tasks: filteredTasks.filter(t => t.status === 'completed').length,
        failed_tasks: filteredTasks.filter(t => t.status === 'failed').length,
      };

      return NextResponse.json({
        success: true,
        statistics
      });
    }

    // Ansonsten: Neuen Task erstellen (falls alle erforderlichen Felder vorhanden sind)
    const { agent_id, agent_name, task_message, task_type } = body;

    if (!agent_id || !agent_name || !task_message) {
      return NextResponse.json(
        { error: 'agent_id, agent_name und task_message sind erforderlich' },
        { status: 400 }
      );
    }

    // SECURITY: Agent-Whitelist prüfen
    if (!isAllowedAgent(agent_id)) {
      console.warn('[SECURITY] Unknown agent attempted in task creation', {
        type: 'agent-api',
        agentId: agent_id,
        userId: user.id,
        allowedAgents: ['marketing', 'automation', 'sales', 'social-youtube', 'chart', 'ui-ux'],
      });

      return NextResponse.json(
        { error: 'Unknown agent' },
        { status: 404 }
      );
    }

    // Security-Logging
    console.log('[SECURITY] Task created', {
      type: 'agent-api',
      agentId: agent_id,
      userId: user.id,
      taskType: task_type,
    });

    const newTask: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      agent_id,
      agent_name,
      task_message,
      task_type: task_type || 'general',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: body.metadata || {}
    };

    tasksStore.push(newTask);

    return NextResponse.json({
      success: true,
      task: newTask
    });

  } catch (error) {
    console.error('Fehler beim Verarbeiten der Agent Task Anfrage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

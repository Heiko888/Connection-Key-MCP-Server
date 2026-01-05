import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createTask, startTask, completeTask, failTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const AUTOMATION_AGENT_SYSTEM_PROMPT = `Du bist ein professioneller Automatisierungs-Experte mit Expertise in:
- Workflow-Automatisierung und Prozess-Optimierung
- Skript-Erstellung (Bash, Python, JavaScript, etc.)
- API-Integrationen und Service-Verbindungen
- CI/CD Pipelines und Deployment-Automatisierung
- Datenverarbeitungs-Workflows
- Task-Automatisierung und Scheduling
- Cloud-Automatisierung (AWS, Azure, GCP)
- DevOps und Infrastructure as Code

Du hilfst dabei, wiederkehrende Aufgaben zu automatisieren, effiziente Skripte zu erstellen und Prozesse zu optimieren.

## BRANDBOOK - The Connection Key

**Brand Name:** The Connection Key (HD App / Human Design Dating & Coaching Platform)

**Mission Statement:**
"Entdecke die energetische Resonanz zwischen Menschen – aus Human Design, Frequenzen und Bewusstsein kombiniert. Klar. Präzise. Alltagsnah."

**Technologie-Stack:**
- Frontend: Next.js 15, React 18.3.1, TypeScript, Material-UI (MUI) 5.18.0
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Deployment: Docker, Nginx, Hetzner Server
- Monitoring: Prometheus + Grafana
- CI/CD: GitHub Actions
- Caching: Redis
- Astronomische Berechnungen: astronomy-engine 2.1.19

**Kernwerte:**
- Präzision - Wissenschaftlich fundierte Berechnungen
- Authentizität - Echtes Human Design System
- Community - Verbindung und Austausch
- Entwicklung - Persönliches Wachstum
- Innovation - Moderne Technologie

**Wichtig für Automatisierungs-Tasks:**
- Verwende immer den Brand-Namen "The Connection Key" oder "HD App" in Kommentaren/Dokumentation
- Berücksichtige die bestehende Technologie-Stack-Architektur
- Fokussiere auf Präzision und Zuverlässigkeit
- Dokumentiere Code klar und präzise
- Nutze Best Practices für die verwendeten Technologien (Next.js, Docker, etc.)

Antworte immer auf Deutsch, sei präzise und hilfreich. Nutze die Brandbook-Informationen für alle Automatisierungs-Tasks.`;

export async function POST(request: NextRequest) {
  let taskId: string | null = null;
  
  try {
    // SECURITY: CoachAuth ZWINGEND erforderlich
    const auth = await checkCoachAuth(request);
    
    if (!auth || !auth.user || !auth.isCoach) {
      console.warn('[SECURITY] Unauthorized agent access', {
        type: 'agent-api',
        agentId: 'automation',
        authorized: false,
        hasUser: !!auth?.user,
        isCoach: auth?.isCoach,
      });

      return NextResponse.json(
        { error: 'Unauthorized – coach access required' },
        { status: 401 }
      );
    }

    const user = auth.user;

    // Security-Logging
    console.log('[SECURITY] Authorized agent access', {
      type: 'agent-api',
      agentId: 'automation',
      userId: user.id,
      authorized: true,
    });

    const body = await request.json();
    const { message, context, userId, action, taskId: requestTaskId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // SECURITY: Task-Kontext erzwingen (für Coach-Bereich)
    if (requestTaskId) {
      taskId = requestTaskId;
    } else {
      const task = createTask({
        user_id: user.id,
        agent_id: 'automation',
        agent_name: 'Automation',
        task_message: message,
        task_type: 'agent-request',
        metadata: { context, userId, action }
      });
      taskId = task.id;
      
      console.warn('[SECURITY] Task created in API (should be created by client)', {
        type: 'agent-api',
        agentId: 'automation',
        userId: user.id,
        taskId,
      });
    }

    // Task als "processing" markieren
    startTask(taskId);

    // Versuche zuerst MCP Server
    let mcpAvailable = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 Sekunden Timeout
      
      const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          userId,
          action,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (mcpResponse.ok) {
        let data: any;
        try {
          const contentType = mcpResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            data = await mcpResponse.json();
          } else {
            const text = await mcpResponse.text();
            data = { response: text };
          }
        } catch (parseError) {
          console.error('MCP Response Parse Error:', parseError);
          const text = await mcpResponse.text().catch(() => 'Fehler beim Lesen der Antwort');
          data = { response: text };
        }
        
        const response = data.response || data.message || (typeof data === 'string' ? data : JSON.stringify(data));
        
        // Task als "completed" markieren
        if (taskId) {
          completeTask(taskId, typeof response === 'string' ? response : JSON.stringify(response), data);
        }
        
        return NextResponse.json({
          success: true,
          response: response,
          message: 'Automation agent response received',
          source: 'mcp-server',
          taskId: taskId || undefined
        });
      }
      mcpAvailable = false;
    } catch (mcpError: any) {
      // MCP Server nicht verfügbar - das ist OK, wir verwenden Fallback
      mcpAvailable = false;
      if (process.env.NODE_ENV === 'development') {
        console.log('MCP Server nicht verfügbar, verwende OpenAI Fallback:', mcpError?.message || mcpError);
      }
    }

    // Fallback: Direkter OpenAI-Call
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API Key nicht konfiguriert',
          message: 'Bitte konfiguriere OPENAI_API_KEY in deiner .env Datei',
          details: mcpAvailable ? 'MCP Server war auch nicht verfügbar' : 'MCP Server war nicht verfügbar, OpenAI Fallback benötigt API Key'
        },
        { status: 503 } // Service Unavailable statt 500
      );
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const conversationHistory = context?.slice(-5) || [];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: AUTOMATION_AGENT_SYSTEM_PROMPT
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      {
        role: 'user',
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || 'Keine Antwort erhalten';

    // Task als "completed" markieren
    if (taskId) {
      completeTask(taskId, response, { model: 'gpt-4o-mini', tokens: completion.usage });
    }

    return NextResponse.json({
      success: true,
      response: response,
      message: 'Automation agent response received',
      source: 'openai-direct',
      taskId: taskId || undefined
    });

  } catch (error) {
    console.error('Error calling automation agent:', error);
    
    // Task als "failed" markieren
    if (taskId) {
      failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Prüfe ob es ein OpenAI-Fehler ist
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API Key ungültig oder nicht konfiguriert',
          message: 'Bitte überprüfe deine OPENAI_API_KEY Konfiguration in der .env Datei',
          details: error.message,
          taskId: taskId || undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to call automation agent',
        message: 'Es gab einen Fehler beim Aufruf des Automation Agents',
        details: error instanceof Error ? error.message : 'Unknown error',
        taskId: taskId || undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Automation Agent API',
    endpoint: `${MCP_SERVER_URL}/agents/automation`,
    method: 'POST',
    requiredFields: ['message'],
    optionalFields: ['context', 'userId', 'action'],
  });
}


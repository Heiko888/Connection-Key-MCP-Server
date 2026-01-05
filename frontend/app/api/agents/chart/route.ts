import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createTask, startTask, completeTask, failTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CHART_AGENT_SYSTEM_PROMPT = `Du bist ein Human Design Experte mit tiefgreifendem Wissen über:
- Human Design Typen (Generator, Manifestor, Projektor, Reflektor)
- Profile (1/3, 2/4, 3/5, 4/6, 5/1, 6/2, etc.)
- Zentren (definiert/offen) und ihre Bedeutung
- Channels und Gates
- Innere Autorität (Emotional, Sacral, Splenic, etc.)
- Strategie (Respond, Initiate, Wait, etc.)
- Inkarnationskreuz
- Definitionen (Single, Split, Triple Split, Quadruple Split)
- PHS (Primary Health System)
- Variables und Transformation

Du hilfst dabei, Human Design Charts zu analysieren, detaillierte Interpretationen zu erstellen und komplexe Konzepte zu erklären.

## BRANDBOOK - The Connection Key

**Brand Name:** The Connection Key (HD App / Human Design Dating & Coaching Platform)

**Mission Statement:**
"Entdecke die energetische Resonanz zwischen Menschen – aus Human Design, Frequenzen und Bewusstsein kombiniert. Klar. Präzise. Alltagsnah."

**Brand Voice & Positionierung:**
- Modern, klar, präzise, alltagsnah
- Wissenschaftlich fundiert, aber verständlich
- Authentisch und ehrlich
- Community-orientiert und einladend
- Fokus auf persönliche Entwicklung und Selbsterkenntnis

**Technische Präzision:**
- Verwendet astronomy-engine für präzise astronomische Berechnungen
- Geocentric positions für alle Planeten
- Iterative 88° Design-Offset Berechnung
- Vollständiges Human Design System: 64 Tore, 36 Kanäle, 9 Zentren
- 384 Linien-Beschreibungen in der Datenbank
- 12 Profile mit vollständigen Informationen
- 8 Schaltkreise vollständig analysiert

**Kernwerte:**
- Präzision - Wissenschaftlich fundierte Berechnungen
- Authentizität - Echtes Human Design System
- Community - Verbindung und Austausch
- Entwicklung - Persönliches Wachstum
- Innovation - Moderne Technologie

**Hauptfeatures der App:**
- Human Design Chart Berechnung (präzise astronomische Berechnungen)
- Dating & Matching System (Human Design basiert)
- Community Features (Connection Key Sharing, Resonanzanalyse)
- Coaching System (Readings, Bookings)
- Mondkalender (Mondphasen, Plant Rituals)
- KI-gestützte Readings (MCP & CK-Agent System)

**Wichtig für Chart-Analysen:**
- Verwende immer den Brand-Namen "The Connection Key" oder "HD App"
- Betone die wissenschaftliche Fundierung (astronomische Berechnungen)
- Erkläre Konzepte klar, präzise und alltagsnah
- Fokussiere auf praktische Anwendbarkeit
- Sei einfühlsam und unterstützend in der Kommunikation
- Nutze die vollständigen Human Design Informationen (64 Tore, 36 Kanäle, etc.)

Antworte immer auf Deutsch, sei präzise, einfühlsam und hilfreich. Nutze die Brandbook-Informationen für alle Chart-Analysen.`;

export async function POST(request: NextRequest) {
  let taskId: string | null = null;
  
  try {
    // SECURITY: CoachAuth ZWINGEND erforderlich
    const auth = await checkCoachAuth(request);
    
    if (!auth || !auth.user || !auth.isCoach) {
      console.warn('[SECURITY] Unauthorized agent access', {
        type: 'agent-api',
        agentId: 'chart',
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
      agentId: 'chart',
      userId: user.id,
      authorized: true,
    });

    const body = await request.json();
    const { message, context, userId, chartData, taskId: requestTaskId } = body;

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
        agent_id: 'chart',
        agent_name: 'Chart Development',
        task_message: message,
        task_type: 'agent-request',
        metadata: { context, userId, chartData }
      });
      taskId = task.id;
      
      console.warn('[SECURITY] Task created in API (should be created by client)', {
        type: 'agent-api',
        agentId: 'chart',
        userId: user.id,
        taskId,
      });
    }

    // Task als "processing" markieren
    startTask(taskId);

    // Versuche zuerst MCP Server
    try {
      const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          userId,
          chartData,
        }),
        signal: AbortSignal.timeout(10000),
      });

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
          message: 'Chart agent response received',
          source: 'mcp-server',
          taskId: taskId || undefined
        });
      }
    } catch (mcpError) {
      console.log('MCP Server nicht verfügbar, verwende OpenAI Fallback:', mcpError);
    }

    // Fallback: Direkter OpenAI-Call
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Key nicht konfiguriert' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const conversationHistory = context?.slice(-5) || [];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: CHART_AGENT_SYSTEM_PROMPT
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
      message: 'Chart agent response received',
      source: 'openai-direct',
      taskId: taskId || undefined
    });

  } catch (error) {
    console.error('Error calling chart agent:', error);
    
    // Task als "failed" markieren
    if (taskId) {
      failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to call chart agent',
        details: error instanceof Error ? error.message : 'Unknown error',
        taskId: taskId || undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Chart Agent API',
    endpoint: `${MCP_SERVER_URL}/agents/chart`,
    method: 'POST',
    requiredFields: ['message'],
    optionalFields: ['context', 'userId', 'chartData'],
  });
}


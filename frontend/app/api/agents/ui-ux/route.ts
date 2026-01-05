import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createTask, startTask, completeTask, failTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// UI/UX Agent System Prompt
const UI_UX_AGENT_SYSTEM_PROMPT = `Du bist ein professioneller UI/UX Design-Agent mit Expertise in:
- User Interface Design (UI)
- User Experience Design (UX)
- Design Systems und Komponenten-Bibliotheken
- Responsive Design und Mobile-First Ansätze
- Accessibility (Barrierefreiheit)
- Design-Patterns und Best Practices
- Material Design (MUI)
- Framer Motion Animationen
- Dark Mode Design
- Glassmorphism und moderne Design-Trends

Du hilfst dabei, benutzerfreundliche und ansprechende UI/UX-Lösungen zu erstellen, die:
- Intuitiv und leicht verständlich sind
- Konsistent mit dem Design-System sind
- Responsive und mobile-optimiert sind
- Accessibility-Standards erfüllen
- Moderne Design-Trends berücksichtigen
- Brand-Voice und Design-Sprache respektieren

## BRANDBOOK - The Connection Key

**Brand Name:** The Connection Key (HD App / Human Design Dating & Coaching Platform)

**Design & Farbpalette:**
- Hauptfarbe: Gold/Orange (#F29F05) - für Typ & Autorität
- Weitere Farben: Blau (Strategie), Rot/Grün (Nicht-Selbst & Signatur), Lila (Definition)
- Design-Sprache: Modern, intuitiv, responsive, animiert
- Stil: Material Design mit MUI, Framer Motion Animationen
- Dark Theme: Dunkler Hintergrund (#0b0a0f) mit Gold-Accents
- Glassmorphism: Transparente Elemente mit Blur-Effekten

**Technologie-Stack:**
- Frontend: Next.js 14.2.15, React, TypeScript
- UI Library: Material-UI (MUI)
- Animation: Framer Motion
- Styling: CSS-in-JS, Tailwind CSS (teilweise)

**Design-Prinzipien:**
- Klarheit und Präzision
- Moderne, intuitive Navigation
- Responsive Design (Mobile-First)
- Accessibility (WCAG 2.1)
- Konsistente Design-Sprache
- Smooth Animationen und Transitions

Antworte immer auf Deutsch, sei präzise und hilfreich. Nutze die Brandbook-Informationen für alle UI/UX-Design-Empfehlungen.`;

export async function POST(request: NextRequest) {
  let taskId: string | null = null;
  
  try {
    // SECURITY: CoachAuth ZWINGEND erforderlich
    const auth = await checkCoachAuth(request);
    
    if (!auth || !auth.user || !auth.isCoach) {
      console.warn('[SECURITY] Unauthorized agent access', {
        type: 'agent-api',
        agentId: 'ui-ux',
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
      agentId: 'ui-ux',
      userId: user.id,
      authorized: true,
    });

    const body = await request.json();
    const { message, context, userId, taskId: requestTaskId } = body;

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
        agent_id: 'ui-ux',
        agent_name: 'UI/UX',
        task_message: message,
        task_type: 'agent-request',
        metadata: { context, userId }
      });
      taskId = task.id;
      
      console.warn('[SECURITY] Task created in API (should be created by client)', {
        type: 'agent-api',
        agentId: 'ui-ux',
        userId: user.id,
        taskId,
      });
    }

    // Task als "processing" markieren
    startTask(taskId);

    // Versuche zuerst MCP Server
    try {
      const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/ui-ux`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          userId,
        }),
        signal: AbortSignal.timeout(10000), // 10 Sekunden Timeout
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
          message: 'UI/UX agent response received',
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

    // Baue Kontext aus vorherigen Nachrichten
    const conversationHistory = context?.slice(-5) || [];
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: UI_UX_AGENT_SYSTEM_PROMPT
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
      message: 'UI/UX agent response received',
      source: 'openai-direct',
      taskId: taskId || undefined
    });

  } catch (error) {
    console.error('Error calling UI/UX agent:', error);
    
    // Task als "failed" markieren
    if (taskId) {
      failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to call UI/UX agent',
        details: error instanceof Error ? error.message : 'Unknown error',
        taskId: taskId || undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'UI/UX Agent API',
    endpoint: `${MCP_SERVER_URL}/agents/ui-ux`,
    method: 'POST',
    requiredFields: ['message'],
    optionalFields: ['context', 'userId'],
  });
}

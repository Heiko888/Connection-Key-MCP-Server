import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createTask, startTask, completeTask, failTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SALES_AGENT_SYSTEM_PROMPT = `Du bist ein professioneller Sales-Experte mit Expertise in:
- Verkaufsstrategien und Sales-Prozesse
- Pitch Deck Erstellung und Präsentationen
- Verkaufsgespräche und Kommunikation
- Einwände-Behandlung und Objection Handling
- Abschluss-Techniken und Closing-Methoden
- Angebotserstellung und Pricing-Strategien
- CRM und Sales-Pipeline-Management
- Kundenbeziehungs-Management

Du hilfst dabei, überzeugende Verkaufsstrategien zu entwickeln, professionelle Pitch Decks zu erstellen und erfolgreiche Verkaufsgespräche zu führen.

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

**Zielgruppe:**
- Menschen, die sich für Human Design interessieren
- Personen auf der Suche nach tieferen Beziehungen
- Coaches und Berater im Human Design Bereich
- Community-orientierte Menschen
- Menschen auf der Suche nach persönlicher Entwicklung

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

**Unique Selling Points:**
1. Präzise astronomische Berechnungen (astronomy-engine)
2. Vollständiges Human Design System (64 Tore, 36 Kanäle, 9 Zentren)
3. Erste Human Design basierte Dating-Plattform
4. Professionelle Coaching Tools
5. Aktive Community mit Resonanzanalyse

**Subscription-Modelle:**
- Free Plan (0€) - Grundlegendes Chart, Mondkalender, Community
- Basic Plan (9,99€/Monat) - Erweiterte Analyse, Dating-System
- Premium Plan (19,99€/Monat) - Connection Key Analyse, Personal Readings
- VIP Plan (49,99€/Monat) - Personal Coach, API Access, VIP Community

**Einzelbuchungen:**
- Basis Analyse Human Design (99€)
- Erweiterte Analyse Human Design (149€)
- Premium Analyse Human Design (199€)
- Connection Key Analysen (149€ - 599€)
- Penta Analysen (299€ - 699€)

**Wichtig für Sales-Content:**
- Verwende immer den Brand-Namen "The Connection Key" oder "HD App"
- Fokussiere auf die Kernwerte: Präzision, Authentizität, Community, Entwicklung
- Erwähne die wissenschaftliche Fundierung (astronomische Berechnungen)
- Betone die praktische Anwendbarkeit (alltagsnah, klar, präzise)
- Stelle die Unique Selling Points heraus (präzise Berechnungen, vollständiges System)
- Erwähne die verschiedenen Subscription-Modelle und Einzelbuchungen wenn passend
- Fokussiere auf den Wert und die Transformation für den Kunden

Antworte immer auf Deutsch, sei präzise und hilfreich. Nutze die Brandbook-Informationen für alle Sales-Content-Erstellungen.`;

export async function POST(request: NextRequest) {
  let taskId: string | null = null;
  
  try {
    // SECURITY: CoachAuth ZWINGEND erforderlich
    const auth = await checkCoachAuth(request);
    
    if (!auth || !auth.user || !auth.isCoach) {
      console.warn('[SECURITY] Unauthorized agent access', {
        type: 'agent-api',
        agentId: 'sales',
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
      agentId: 'sales',
      userId: user.id,
      authorized: true,
    });

    const body = await request.json();
    const { message, context, userId, product, taskId: requestTaskId } = body;

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
        agent_id: 'sales',
        agent_name: 'Sales',
        task_message: message,
        task_type: 'agent-request',
        metadata: { context, userId, product }
      });
      taskId = task.id;
      
      console.warn('[SECURITY] Task created in API (should be created by client)', {
        type: 'agent-api',
        agentId: 'sales',
        userId: user.id,
        taskId,
      });
    }

    // Task als "processing" markieren
    startTask(taskId);

    // Versuche zuerst MCP Server
    try {
      const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          userId,
          product,
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
          message: 'Sales agent response received',
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
        content: SALES_AGENT_SYSTEM_PROMPT
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
      message: 'Sales agent response received',
      source: 'openai-direct',
      taskId: taskId || undefined
    });

  } catch (error) {
    console.error('Error calling sales agent:', error);
    
    // Task als "failed" markieren
    if (taskId) {
      failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to call sales agent',
        details: error instanceof Error ? error.message : 'Unknown error',
        taskId: taskId || undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Sales Agent API',
    endpoint: `${MCP_SERVER_URL}/agents/sales`,
    method: 'POST',
    requiredFields: ['message'],
    optionalFields: ['context', 'userId', 'product'],
  });
}


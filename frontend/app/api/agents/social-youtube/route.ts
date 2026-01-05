import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkCoachAuth } from '@/lib/coach-auth';
import { createTask, startTask, completeTask, failTask } from '@/lib/agent/task-manager';
import { isAllowedAgent } from '@/lib/agents/allowedAgents';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Social/YouTube Agent System Prompt
const SOCIAL_YOUTUBE_AGENT_SYSTEM_PROMPT = `Du bist ein professioneller Social Media & YouTube Content-Agent mit Expertise in:
- YouTube-Video Scripts und Content-Strategien
- Instagram Posts, Stories, Reels und IGTV
- LinkedIn Posts und Artikel
- Facebook Content und Gruppen-Posts
- Twitter/X Tweets und Threads
- TikTok Videos und Trends
- Content-Kalender und Redaktionspläne
- Hashtag-Research und SEO für Social Media
- Video-Optimierung und Thumbnail-Design
- Community-Management und Engagement-Strategien

Du hilfst dabei, ansprechende Social Media und YouTube-Inhalte zu erstellen, die:
- Plattform-spezifisch optimiert sind
- Viral-Potenzial haben
- Zielgruppen-orientiert sind
- Trendig und aktuell sind
- Klare Call-to-Actions haben
- SEO-optimiert sind (für YouTube)

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

**Design & Farbpalette:**
- Hauptfarbe: Gold/Orange (#F29F05) - für Typ & Autorität
- Weitere Farben: Blau (Strategie), Rot/Grün (Nicht-Selbst & Signatur), Lila (Definition)
- Design-Sprache: Modern, intuitiv, responsive, animiert
- Stil: Material Design mit MUI, Framer Motion Animationen

**Social Media Kanäle:**
- YouTube: @TheConnectionKey
- Instagram: @theconnectionkey
- Telegram: @TheConnectionKey
- Website: https://www.the-connection-key.de

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

**Wichtig für Content-Erstellung:**
- Verwende immer den Brand-Namen "The Connection Key" oder "HD App"
- Nutze die Gold/Orange-Farbe (#F29F05) als Akzentfarbe in Beschreibungen
- Fokussiere auf die Kernwerte: Präzision, Authentizität, Community, Entwicklung
- Erwähne die wissenschaftliche Fundierung (astronomische Berechnungen)
- Betone die praktische Anwendbarkeit (alltagsnah, klar, präzise)
- Verweise auf die Social Media Kanäle wenn relevant

Antworte immer auf Deutsch, sei präzise und hilfreich. Nutze die Brandbook-Informationen für alle Content-Erstellungen.`;

export async function POST(request: NextRequest) {
  let taskId: string | null = null;
  
  try {
    // SECURITY: CoachAuth ZWINGEND erforderlich
    const auth = await checkCoachAuth(request);
    
    if (!auth || !auth.user || !auth.isCoach) {
      console.warn('[SECURITY] Unauthorized agent access', {
        type: 'agent-api',
        agentId: 'social-youtube',
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
      agentId: 'social-youtube',
      userId: user.id,
      authorized: true,
    });

    const body = await request.json();
    const { message, context, userId, platform, contentType, taskId: requestTaskId } = body;

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
        agent_id: 'social-youtube',
        agent_name: 'Social-YouTube',
        task_message: message,
        task_type: 'agent-request',
        metadata: { context, userId, platform, contentType }
      });
      taskId = task.id;
      
      console.warn('[SECURITY] Task created in API (should be created by client)', {
        type: 'agent-api',
        agentId: 'social-youtube',
        userId: user.id,
        taskId,
      });
    }

    // Task als "processing" markieren
    startTask(taskId);

    // Versuche zuerst MCP Server
    try {
      const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/social-youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          userId,
          platform: platform || 'youtube',
          contentType,
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
          message: 'Social/YouTube agent response received',
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
        content: SOCIAL_YOUTUBE_AGENT_SYSTEM_PROMPT
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
      message: 'Social/YouTube agent response received',
      source: 'openai-direct',
      taskId: taskId || undefined
    });

  } catch (error) {
    console.error('Error calling social-youtube agent:', error);
    
    // Task als "failed" markieren
    if (taskId) {
      failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to call social-youtube agent',
        details: error instanceof Error ? error.message : 'Unknown error',
        taskId: taskId || undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Social/YouTube Agent API',
    endpoint: `${MCP_SERVER_URL}/agents/social-youtube`,
    method: 'POST',
    requiredFields: ['message'],
    optionalFields: ['context', 'userId', 'platform', 'contentType'],
  });
}


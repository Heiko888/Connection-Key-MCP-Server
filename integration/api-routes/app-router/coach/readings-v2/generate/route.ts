/**
 * C2 – Multi-Agent Reading Orchestrator
 * Route: POST /api/coach/readings-v2/generate
 * 
 * Zentrale Entry-Point für alle Reading-Agents
 * Orchestriert Chart-Loading, Agent-Auswahl, Persistenz
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../../../../lib/supabase-clients';
import { getAgent, isValidAgent, AgentId, Depth, Style } from '../../../../../production/agents/registry';

// Reading Agent URL (kann intern oder extern sein)
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://localhost:4000';

/**
 * Input-Format
 */
interface ReadingGenerateInput {
  chart_id: string;
  context: AgentId;
  depth?: Depth;
  style?: Style;
  locale?: string;
  userId?: string;
}

/**
 * Lädt Chart aus public_core.charts
 */
async function loadChart(chartId: string): Promise<any> {
  const supabase = getSystemSupabaseClient();
  
  const { data: chart, error } = await supabase
    .schema('public_core')
    .from('charts')
    .select('id, chart_version, input, chart')
    .eq('id', chartId)
    .single();

  if (error || !chart) {
    throw new Error(`Chart not found: ${chartId}. Error: ${error?.message || 'Unknown'}`);
  }

  return {
    chart_id: chart.id,
    chart_version: chart.chart_version,
    chart: chart.chart
  };
}

/**
 * Ruft Reading-Agent auf
 */
async function callReadingAgent(
  agentId: AgentId,
  chartData: any,
  depth: Depth,
  style: Style,
  userId?: string
): Promise<{ reading: string; essence?: string; tokens?: number }> {
  const agent = getAgent(agentId);
  
  // Agent-Request zusammenstellen
  const agentRequest = {
    chart_id: chartData.chart_id,
    chart_version: chartData.chart_version,
    chart: chartData.chart,
    context: agentId,
    depth,
    style,
    userId
  };

  try {
    const response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reading Agent failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.reading) {
      throw new Error(`Reading Agent returned invalid response: ${result.error || 'Unknown error'}`);
    }

    return {
      reading: result.reading,
      essence: result.essence || undefined,
      tokens: result.tokens || undefined
    };
  } catch (error: any) {
    throw new Error(`Failed to call Reading Agent: ${error.message}`);
  }
}

/**
 * Persistiert Reading
 */
async function persistReading(
  chartId: string,
  chartVersion: string,
  agentId: AgentId,
  depth: Depth,
  style: Style,
  reading: string,
  essence: string | null,
  userId: string | null,
  tokens: number | undefined
): Promise<string> {
  const supabase = getSystemSupabaseClient();
  
  const readingId = `reading-${Date.now()}-${userId || 'anonymous'}`;
  
  // Metadata für vollständige Reproduzierbarkeit
  const metadata = {
    context: agentId,
    depth,
    style,
    tokens: tokens || 0,
    model: 'gpt-4',
    timestamp: new Date().toISOString()
  };

  // Prompt-Hash berechnen (optional, für Reproduzierbarkeit)
  const { createHash } = await import('crypto');
  const agentConfig = getAgent(agentId);
  const promptHash = createHash('sha256')
    .update(agentConfig.systemPrompt)
    .digest('hex');

  const { error } = await supabase
    .from('readings')
    .insert({
      id: readingId,
      user_id: userId || null,
      reading_type: agentId, // Verwende agentId als reading_type
      reading_text: reading,
      essence: essence,
      chart_id: chartId,
      chart_version: chartVersion,
      chart_data: null, // Chart-JSON wird nicht gespeichert (nur chart_id)
      agent_id: agentId,
      agent_version: '1.0.0', // Agent-Version
      prompt_hash: promptHash, // Prompt-Hash für Reproduzierbarkeit
      metadata: metadata,
      status: 'completed'
    });

  if (error) {
    throw new Error(`Failed to persist reading: ${error.message}`);
  }

  return readingId;
}

/**
 * POST: Generiere Reading über Multi-Agent-System
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let chartId: string | null = null;
  let agentId: AgentId | null = null;

  try {
    const body = await request.json();

    // Validierung
    if (!body.chart_id || typeof body.chart_id !== 'string') {
      return NextResponse.json(
        { error: 'chart_id is required and must be a string (UUID)' },
        { status: 400 }
      );
    }

    if (!body.context || typeof body.context !== 'string') {
      return NextResponse.json(
        { error: 'context is required and must be a string (business|relationship|crisis|personality)' },
        { status: 400 }
      );
    }

    if (!isValidAgent(body.context)) {
      return NextResponse.json(
        { error: `Invalid context: ${body.context}. Supported: business, relationship, crisis, personality` },
        { status: 400 }
      );
    }

    chartId = body.chart_id;
    agentId = body.context;

    const depth: Depth = body.depth || 'advanced';
    const style: Style = body.style || getAgent(agentId).defaultStyle;
    const userId = body.userId || null;

    // Validierung: Depth muss vom Agent unterstützt werden
    const agent = getAgent(agentId);
    if (!agent.supportedDepth.includes(depth)) {
      return NextResponse.json(
        { error: `Depth "${depth}" not supported by agent "${agentId}". Supported: ${agent.supportedDepth.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Lade Chart aus public_core.charts
    const chartData = await loadChart(chartId);

    // 2. Rufe Reading-Agent auf
    const agentResult = await callReadingAgent(agentId, chartData, depth, style, userId || undefined);

    // 3. Persistiere Reading
    const readingId = await persistReading(
      chartId,
      chartData.chart_version,
      agentId,
      depth,
      style,
      agentResult.reading,
      agentResult.essence || null,
      userId,
      agentResult.tokens
    );

    const duration = Date.now() - startTime;

    // Logging
    console.log(`[C2 Orchestrator] Reading generated: ${readingId}`, {
      chart_id: chartId,
      context: agentId,
      depth,
      style,
      duration,
      tokens: agentResult.tokens
    });

    return NextResponse.json({
      success: true,
      readingId,
      reading: agentResult.reading,
      essence: agentResult.essence || null,
      chart_id: chartId,
      chart_version: chartData.chart_version,
      context: agentId,
      depth,
      style,
      agent_id: agentId,
      tokens: agentResult.tokens,
      duration,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error('[C2 Orchestrator] Error:', {
      error: error.message,
      chart_id: chartId,
      context: agentId,
      duration
    });

    // Optional: reading_jobs auf failed setzen (falls vorhanden)
    // TODO: Implementiere reading_jobs Update bei Fehler

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        chart_id: chartId,
        context: agentId,
        duration
      },
      { status: 500 }
    );
  }
}

/**
 * GET: API Info
 */
export async function GET() {
  const { getSupportedAgents } = await import('../../../../../production/agents/registry');
  
  return NextResponse.json({
    endpoint: '/api/coach/readings-v2/generate',
    method: 'POST',
    description: 'Multi-Agent Reading Orchestrator (C2)',
    inputFormat: {
      chart_id: 'string (UUID, required)',
      context: 'string (required: business|relationship|crisis|personality)',
      depth: 'string (optional: basic|advanced|professional, default: advanced)',
      style: 'string (optional: klar|direkt|ruhig|empathisch, default: agent-specific)',
      locale: 'string (optional, default: de)',
      userId: 'string (optional)'
    },
    supportedAgents: getSupportedAgents().map(id => {
      const agent = getAgent(id);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        supportedDepth: agent.supportedDepth,
        defaultStyle: agent.defaultStyle
      };
    }),
    example: {
      chart_id: '550e8400-e29b-41d4-a716-446655440000',
      context: 'business',
      depth: 'advanced',
      style: 'klar'
    }
  });
}

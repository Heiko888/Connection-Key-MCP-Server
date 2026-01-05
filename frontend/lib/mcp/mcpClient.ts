/**
 * MCP Client Wrapper
 * 
 * Single Source of Truth für MCP-Calls.
 * Verantwortung:
 * - Request an MCP
 * - Timing messen
 * - Response validieren
 * - Usage extrahieren
 * - Logging in mcp_usage
 */

import { createMcpUsage } from '@/lib/db/mcp-usage';
import { calculateCost } from '@/lib/mcp/modelPricing';
import { normalizeMcpOutput } from '@/lib/mcp/normalizeMcpOutput';
import { classifyMcpError, getMcpErrorMessage } from '@/lib/mcp/mcpErrorTypes';

export interface McpCallOptions {
  agent: string;
  payload: any;
  coachId: string;
  readingId?: string | null;
  promptVersion?: string | null;
  model?: string | null; // Optional: Modell-Name (falls bekannt)
}

export interface McpCallResult {
  success: boolean;
  output?: string | null;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
    durationMs: number;
    model: string | null;
  };
  error?: string;
  errorCode?: string;
}

/**
 * Ruft einen MCP-Agent auf und tracked Usage
 * 
 * @param options - MCP-Call-Optionen
 * @returns McpCallResult mit Output und Usage-Daten
 */
export async function callMcpAgent(options: McpCallOptions): Promise<McpCallResult> {
  const MCP_SERVER_URL = process.env.MCP_SERVER_URL || process.env.NEXT_PUBLIC_MCP_SERVER_URL;
  if (!MCP_SERVER_URL) {
    throw new Error('MCP_SERVER_URL ist nicht konfiguriert');
  }

  const startTime = Date.now();
  let durationMs = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  let model: string | null = options.model || null;
  let success = false;
  let errorCode: string | null = null;
  let output: string | null = null;
  let error: string | null = null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000); // 180 Sekunden Timeout

  try {
    // MCP-Request
    const response = await fetch(`${MCP_SERVER_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': process.env.MCP_API_KEY || process.env.AGENT_SECRET || '',
      },
      body: JSON.stringify({
        agent: options.agent,
        input: options.payload,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    durationMs = Date.now() - startTime;

    // HTTP-Fehler behandeln
    if (!response.ok) {
      const { safeResponseText } = await import('@/lib/utils/safeJson');
      const errorText = await safeResponseText(response, 'Unknown error');
      const mcpError = classifyMcpError({ message: errorText }, response.status);
      
      errorCode = mcpError.type;
      error = getMcpErrorMessage(mcpError);
      success = false;

      // Usage speichern (auch bei Fehler)
      await createMcpUsage({
        reading_id: options.readingId || null,
        coach_id: options.coachId,
        agent: options.agent,
        prompt_version: options.promptVersion || null,
        model: model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: 0,
        duration_ms: durationMs,
        success: false,
        error_code: errorCode,
      });

      return {
        success: false,
        error,
        errorCode,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          costUsd: 0,
          durationMs,
          model,
        },
      };
    }

    // Response parsen
    const mcpData = await response.json();

    // Output normalisieren
    const normalized = normalizeMcpOutput(mcpData, response.status);

    // Token-Informationen extrahieren (falls vorhanden)
    if (mcpData.usage) {
      inputTokens = mcpData.usage.input_tokens || mcpData.usage.prompt_tokens || 0;
      outputTokens = mcpData.usage.output_tokens || mcpData.usage.completion_tokens || 0;
      totalTokens = mcpData.usage.total_tokens || inputTokens + outputTokens;
    } else if (mcpData.input_tokens || mcpData.output_tokens) {
      // Alternative Felder
      inputTokens = mcpData.input_tokens || 0;
      outputTokens = mcpData.output_tokens || 0;
      totalTokens = mcpData.total_tokens || inputTokens + outputTokens;
    }

    // Modell extrahieren (falls vorhanden)
    if (mcpData.model && !model) {
      model = mcpData.model;
    }

    // Validierung: generatedText muss vorhanden sein
    if (!normalized.generatedText || typeof normalized.generatedText !== 'string' || normalized.generatedText.trim().length === 0) {
      error = normalized.error || 'MCP-Server hat keinen verwertbaren Text geliefert';
      errorCode = 'EMPTY_RESPONSE';
      success = false;

      // Usage speichern (auch bei leerem Response)
      const costUsd = calculateCost(model, inputTokens, outputTokens);
      await createMcpUsage({
        reading_id: options.readingId || null,
        coach_id: options.coachId,
        agent: options.agent,
        prompt_version: options.promptVersion || null,
        model: model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: costUsd,
        duration_ms: durationMs,
        success: false,
        error_code: errorCode,
      });

      return {
        success: false,
        error,
        errorCode,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          costUsd,
          durationMs,
          model,
        },
      };
    }

    output = normalized.generatedText;
    success = true;

    // Kosten berechnen
    const costUsd = calculateCost(model, inputTokens, outputTokens);

    // Usage speichern
    await createMcpUsage({
      reading_id: options.readingId || null,
      coach_id: options.coachId,
      agent: options.agent,
      prompt_version: options.promptVersion || null,
      model: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: costUsd,
      duration_ms: durationMs,
      success: true,
      error_code: null,
    });

    return {
      success: true,
      output,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
        durationMs,
        model,
      },
    };

  } catch (fetchError: any) {
    clearTimeout(timeout);
    durationMs = Date.now() - startTime;

    const mcpError = classifyMcpError(fetchError);
    errorCode = mcpError.type;
    error = getMcpErrorMessage(mcpError);
    success = false;

    // Usage speichern (auch bei Fetch-Fehler)
    await createMcpUsage({
      reading_id: options.readingId || null,
      coach_id: options.coachId,
      agent: options.agent,
      prompt_version: options.promptVersion || null,
      model: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: 0,
      duration_ms: durationMs,
      success: false,
      error_code: errorCode,
    });

    return {
      success: false,
      error,
      errorCode,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd: 0,
        durationMs,
        model,
      },
    };
  }
}


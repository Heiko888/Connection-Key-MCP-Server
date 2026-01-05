/**
 * MCP Reading Payload Builder
 * 
 * Zentrale Logik zum Erstellen von MCP-Requests aus readingType und strukturiertem Input.
 * Single Source of Truth für MCP-Payload-Struktur.
 */

import { getReadingType, isValidReadingType } from '@/lib/readingTypes';
import { getPromptVersion, getDefaultVersion, type PromptVersion } from '@/lib/prompts/promptRegistry';
import { randomUUID } from 'crypto';

export interface McpReadingPayload {
  agent: string;
  input: {
    type: string;
    readingTypeKey: string;
    schemaVersion: string;
    data: Record<string, any>;
    prompt?: {
      system: string;
      user: string;
      promptVersion: string;
      promptLabel: string;
    };
    debug: {
      source: string;
      ts: string;
      requestId: string;
    };
  };
  meta: {
    readingTypeKey: string;
    mcpType: string;
    version: string;
    promptVersion: string;
    promptLabel: string;
  };
}

/**
 * Baut einen deterministischen MCP-Request-Payload aus readingType und Input
 * 
 * @param readingTypeKey - Der Reading-Type Key (muss in readingTypes existieren)
 * @param input - Strukturiertes Input aus dem Formular
 * @param promptVersion - Optional: Prompt-Version (default: latest stable)
 * @returns MCP-Request-Payload
 * @throws Error wenn readingTypeKey ungültig ist oder promptVersion nicht existiert
 */
export function buildMcpReadingPayload(
  readingTypeKey: string,
  input: Record<string, any>,
  promptVersion?: string
): McpReadingPayload {
  // 1. Validierung: readingTypeKey MUSS valid sein
  if (!isValidReadingType(readingTypeKey)) {
    throw new Error(`Ungültiger readingTypeKey: ${readingTypeKey}`);
  }

  const readingConfig = getReadingType(readingTypeKey);
  if (!readingConfig) {
    throw new Error(`Reading-Konfiguration nicht gefunden für: ${readingTypeKey}`);
  }

  // 2. Mapping aus readingTypes.ts
  const agent = readingConfig.agent || 'reading'; // Fallback: "reading"
  const mcpType = readingConfig.mcpType;
  const schemaVersion = readingConfig.schemaVersion || '1.0.0';

  // 3. Prompt-Version bestimmen
  const requestedVersion = promptVersion || getDefaultVersion(readingTypeKey);
  
  if (!requestedVersion) {
    throw new Error(`Keine Prompt-Version gefunden für Reading-Type: ${readingTypeKey}`);
  }

  const promptVersionData = getPromptVersion(readingTypeKey, requestedVersion);
  
  if (!promptVersionData) {
    throw new Error(`Prompt-Version "${requestedVersion}" nicht gefunden für Reading-Type: ${readingTypeKey}`);
  }

  // 4. Prompt aus Registry laden
  let prompt: { system: string; user: string; promptVersion: string; promptLabel: string } | undefined;
  
  if (readingConfig.usePrompts !== false) {
    prompt = {
      system: promptVersionData.systemPrompt,
      user: promptVersionData.userPromptTemplate(input),
      promptVersion: requestedVersion,
      promptLabel: promptVersionData.label,
    };
  }

  // 4. Debug-Informationen
  const requestId = randomUUID();
  const debug = {
    source: 'coach-ui',
    ts: new Date().toISOString(),
    requestId,
  };

  // 5. MCP Input-Struktur
  const mcpInput: McpReadingPayload['input'] = {
    type: mcpType,
    readingTypeKey: readingTypeKey,
    schemaVersion: schemaVersion,
    data: input, // EXACT das Formular-Input
    debug,
  };

  // Prompt hinzufügen, falls vorhanden
  if (prompt) {
    mcpInput.prompt = prompt;
  }

  // 6. Meta-Informationen
  const meta = {
    readingTypeKey: readingTypeKey,
    mcpType: mcpType,
    version: schemaVersion,
    promptVersion: requestedVersion,
    promptLabel: promptVersionData.label,
  };

  return {
    agent,
    input: mcpInput,
    meta,
  };
}

/**
 * Gibt die Request-ID aus einem Payload zurück (für Logging)
 */
export function getRequestIdFromPayload(payload: McpReadingPayload): string {
  return payload.input.debug.requestId;
}


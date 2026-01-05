/**
 * Create Reading Version - Domain Function
 * 
 * Erstellt eine neue Reading-Version durch:
 * 1. Laden des aktiven Prompts aus der Datenbank
 * 2. Ermitteln der nächsten Versionsnummer
 * 3. Aufruf des MCP-Servers
 * 4. Speichern in reading_versions
 */

import { createClient } from '@/lib/supabase/server';

export interface CreateReadingVersionParams {
  readingId: string;
  readingType: string;
  clientName: string;
}

export interface Prompt {
  id: string;
  key: string;
  content: string;
  version: string;
  is_active: boolean;
}

export interface ReadingVersion {
  id: string;
  reading_id: string;
  reading_type: string;
  version_number: number;
  mcp_agent: string;
  prompt_id: string;
  prompt_version: string;
  generated_text: string;
  status: string;
  created_at: string;
}

export async function createReadingVersion(
  params: CreateReadingVersionParams
): Promise<ReadingVersion> {
  const { readingId, readingType, clientName } = params;
  const supabase = createClient();

  // 1. Lade aktiven Prompt aus prompts Tabelle
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('id, key, content, version, is_active')
    .eq('key', readingType)
    .eq('is_active', true)
    .single();

  if (promptError || !prompt) {
    throw new Error(
      `Aktiver Prompt für Reading-Typ '${readingType}' nicht gefunden: ${promptError?.message || 'Kein Prompt gefunden'}`
    );
  }

  // 2. Ermittle nächste version_number
  const { data: existingVersions, error: versionError } = await supabase
    .from('reading_versions')
    .select('version_number')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionError) {
    throw new Error(`Fehler beim Ermitteln der Versionsnummer: ${versionError.message}`);
  }

  const nextVersionNumber = existingVersions && existingVersions.length > 0
    ? existingVersions[0].version_number + 1
    : 1;

  // 3. Baue MCP-Request
  const MCP_SERVER_URL = process.env.MCP_SERVER_URL || process.env.NEXT_PUBLIC_MCP_SERVER_URL;
  if (!MCP_SERVER_URL) {
    throw new Error('MCP_SERVER_URL ist nicht konfiguriert');
  }

  const MCP_API_KEY = process.env.MCP_API_KEY;
  if (!MCP_API_KEY) {
    throw new Error('MCP_API_KEY ist nicht konfiguriert');
  }

  const mcpPayload = {
    agent: 'reading',
    input: {
      prompt: prompt.content,
      clientName,
      readingType,
    },
  };

  // 4. Rufe MCP-Server auf
  const startTime = Date.now();
  let mcpResponse: { success: boolean; output?: string; error?: string };
  let generatedText: string;

  try {
    const response = await fetch(`${MCP_SERVER_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': MCP_API_KEY || process.env.AGENT_SECRET || '',
      },
      body: JSON.stringify(mcpPayload),
    });

    if (!response.ok) {
      throw new Error(`MCP-Server Fehler: ${response.status} ${response.statusText}`);
    }

    mcpResponse = await response.json();
    const durationMs = Date.now() - startTime;

    if (!mcpResponse.success || !mcpResponse.output) {
      throw new Error(
        mcpResponse.error || 'MCP-Server hat keinen Output zurückgegeben'
      );
    }

    generatedText = mcpResponse.output;
  } catch (error: any) {
    throw new Error(`MCP-Aufruf fehlgeschlagen: ${error.message}`);
  }

  // 5. Speichere in reading_versions
  const { data: savedVersion, error: saveError } = await supabase
    .from('reading_versions')
    .insert({
      reading_id: readingId,
      reading_type: readingType,
      version_number: nextVersionNumber,
      mcp_agent: 'reading',
      prompt_id: prompt.id,
      prompt_version: prompt.version,
      generated_text: generatedText,
      status: 'completed',
    })
    .select()
    .single();

  if (saveError || !savedVersion) {
    throw new Error(
      `Fehler beim Speichern der Reading-Version: ${saveError?.message || 'Keine Daten zurückgegeben'}`
    );
  }

  return savedVersion as ReadingVersion;
}


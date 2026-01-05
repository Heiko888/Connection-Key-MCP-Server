import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getReadingType } from '@/lib/readingTypes';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getLastReadingVersion, createReadingVersion, updateReadingVersion, setCurrentVersion } from '@/lib/db/reading-versions';
import { buildMcpReadingPayload, getRequestIdFromPayload } from '@/lib/mcp/readingPayloadBuilder';
import { normalizeMcpOutput, handleMcpError } from '@/lib/mcp/normalizeMcpOutput';
import { classifyMcpError, McpErrorType, getMcpErrorMessage } from '@/lib/mcp/mcpErrorTypes';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

type GenerateResponse =
  | { success: true; versionId: string; versionNumber: number; generatedText: string | null }
  | { success: false; error: string };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();

  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // 1. Lade Reading
    const reading = await getCoachReadingById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // 2. Ermittle letzte version_number
    const lastVersion = await getLastReadingVersion(readingId);
    const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

    // Reading-Config abrufen
    const readingConfig = getReadingType(reading.reading_type);
    if (!readingConfig) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: `Unbekannter readingType: ${reading.reading_type}` },
        { status: 400 }
      );
    }

    // Input aus letzter Version oder reading_data holen
    let input: Record<string, any>;
    if (lastVersion) {
      input = lastVersion.input;
    } else {
      // Fallback: Versuche aus reading_data zu extrahieren
      input = (reading.reading_data as any)?.input || {};
    }

    // MCP-Server URL prüfen
    const MCP_SERVER_URL =
      process.env.MCP_SERVER_URL ||
      process.env.NEXT_PUBLIC_MCP_SERVER_URL;

    if (!MCP_SERVER_URL) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'MCP_SERVER_URL ist nicht konfiguriert' },
        { status: 500 }
      );
    }

    // 3. MCP-Payload bauen (mit gleicher Prompt-Version wie Original, falls vorhanden)
    // Versuche promptVersion aus der letzten Version zu holen, sonst default
    let promptVersion: string | undefined;
    if (lastVersion?.prompt_id) {
      // Extrahiere Version aus prompt_id (Format: "readingType.version")
      const parts = lastVersion.prompt_id.split('.');
      if (parts.length >= 2) {
        promptVersion = parts[parts.length - 1]; // Letzter Teil ist die Version
      }
    }

    let mcpPayload;
    try {
      mcpPayload = buildMcpReadingPayload(reading.reading_type, input, promptVersion);
    } catch (payloadError: any) {
      console.error('Fehler beim Erstellen des MCP-Payloads:', payloadError);
      return NextResponse.json<GenerateResponse>(
        { success: false, error: `Fehler beim Erstellen des Payloads: ${payloadError?.message}` },
        { status: 500 }
      );
    }

    const requestId = getRequestIdFromPayload(mcpPayload);
    const promptVersionUsed = mcpPayload.meta.promptVersion;
    const promptLabel = mcpPayload.meta.promptLabel;

      // 4. Neue Version anlegen (pending)
      let newVersion;
      try {
        newVersion = await createReadingVersion(readingId, {
          version_number: newVersionNumber,
          schema_version: readingConfig.schemaVersion || '1.0',
          reading_type: reading.reading_type,
          input: input,
          mcp_agent: mcpPayload.agent,
          status: 'pending',
          prompt_id: `${reading.reading_type}.${promptVersionUsed}`,
          prompt_version: promptVersionUsed,
        });
    } catch (versionError: any) {
      console.error('Fehler beim Erstellen der Version:', versionError);
      return NextResponse.json<GenerateResponse>(
        { success: false, error: `Fehler beim Erstellen der Version: ${versionError?.message}` },
        { status: 500 }
      );
    }

    // 5. MCP aufrufen mit robustem Error-Handling
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 120 Sekunden Timeout

    let mcpResponse: Response | null = null;
    let mcpData: any = null;
    let normalized: ReturnType<typeof normalizeMcpOutput>;
    let mcpError: ReturnType<typeof classifyMcpError> | null = null;
    const mcpStartTime = Date.now();

    try {
      console.log(`[${requestId}] MCP-Aufruf gestartet für Reading ${readingId}, Version ${newVersionNumber}`);
      
      mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-key': process.env.MCP_API_KEY || process.env.AGENT_SECRET || '',
        },
        body: JSON.stringify({
          agent: mcpPayload.agent,
          input: mcpPayload.input,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // HTTP-Fehler behandeln
      if (!mcpResponse.ok) {
        const mcpRuntimeMsError = Date.now() - mcpStartTime;
        const { safeResponseText } = await import('@/lib/utils/safeJson');
        const errorText = await safeResponseText(mcpResponse, 'Unknown error');
        mcpError = classifyMcpError({ message: errorText }, mcpResponse.status);
        normalized = normalizeMcpOutput({ success: false, error: errorText }, mcpResponse.status);
        
        console.error(`[${requestId}] MCP HTTP-Fehler (${mcpResponse.status}):`, {
          type: mcpError.type,
          message: mcpError.message,
        });

        // Version aktualisieren: status = error
        await updateReadingVersion(newVersion.id, {
          status: 'error',
          error_message: getMcpErrorMessage(mcpError),
          mcp_runtime_ms: mcpRuntimeMsError,
          prompt_id: `${reading.reading_type}.${promptVersionUsed}`,
          prompt_version: promptVersionUsed,
        });

        return NextResponse.json<GenerateResponse>({
          success: false,
          error: getMcpErrorMessage(mcpError),
        });
      }

      // Response parsen (mit Validierung)
      try {
        mcpData = await mcpResponse.json();
      } catch (parseError: any) {
        const mcpRuntimeMsParse = Date.now() - mcpStartTime;
        mcpError = classifyMcpError(parseError, mcpResponse.status);
        
        console.error(`[${requestId}] MCP JSON-Parse-Fehler:`, parseError);

        await updateReadingVersion(newVersion.id, {
          status: 'error',
          error_message: 'MCP-Server hat ungültige Daten zurückgegeben',
          mcp_runtime_ms: mcpRuntimeMsParse,
        });

        return NextResponse.json<GenerateResponse>({
          success: false,
          error: 'MCP-Server hat ungültige Daten zurückgegeben',
        });
      }

      // Output normalisieren und validieren
      normalized = normalizeMcpOutput(mcpData, mcpResponse.status);
      const mcpRuntimeMs = Date.now() - mcpStartTime;

      // Validierung: generatedText muss String sein und nicht leer
      if (!normalized.generatedText || typeof normalized.generatedText !== 'string' || normalized.generatedText.trim().length === 0) {
        mcpError = normalized.errorDetails || classifyMcpError(mcpData, mcpResponse.status);
        
        console.error(`[${requestId}] MCP Empty Response:`, {
          type: normalized.errorType,
          message: normalized.error,
        });

        await updateReadingVersion(newVersion.id, {
          status: 'error',
          error_message: normalized.error || 'MCP-Server hat keinen verwertbaren Text geliefert',
          mcp_runtime_ms: mcpRuntimeMs,
        });

        return NextResponse.json<GenerateResponse>({
          success: false,
          error: normalized.error || 'MCP-Server hat keinen verwertbaren Text geliefert',
        });
      }

      // Erfolg: Text wurde generiert
      console.log(`[${requestId}] MCP-Text erfolgreich generiert (${normalized.generatedText.length} Zeichen)`);

    } catch (fetchError: any) {
      clearTimeout(timeout);
      const mcpRuntimeMs = Date.now() - mcpStartTime;

      // Fehler klassifizieren
      mcpError = classifyMcpError(fetchError, mcpResponse?.status);
      
      console.error(`[${requestId}] MCP-Aufruf fehlgeschlagen:`, {
        type: mcpError.type,
        message: mcpError.message,
        error: fetchError,
      });

      // Version aktualisieren: status = error
      await updateReadingVersion(newVersion.id, {
        status: 'error',
        error_message: getMcpErrorMessage(mcpError),
        mcp_runtime_ms: mcpRuntimeMs,
      });

      // Timeout: Spezielle Behandlung
      if (mcpError.type === McpErrorType.TIMEOUT) {
        return NextResponse.json<GenerateResponse>({
          success: false,
          error: getMcpErrorMessage(mcpError),
        });
      }

      // Andere Fehler: Weiterwerfen für zentrale Fehlerbehandlung
      throw fetchError;
    }

    const generatedText = normalized.generatedText;
    const mcpRuntimeMs = Date.now() - mcpStartTime;

    // 6. Version aktualisieren: generatedText, status = success
    await updateReadingVersion(newVersion.id, {
      generated_text: generatedText,
      status: 'success',
      mcp_runtime_ms: mcpRuntimeMs,
    });

    // 7. Setze reading.current_version_id
    await setCurrentVersion(readingId, newVersion.id);

    // Erfolgreiche Response
    return NextResponse.json<GenerateResponse>({
      success: true,
      versionId: newVersion.id,
      versionNumber: newVersion.version_number,
      generatedText: generatedText,
    });
  } catch (err: any) {
    console.error('Unerwarteter Fehler in readings-v2/[id]/generate:', err);
    return NextResponse.json<GenerateResponse>(
      {
        success: false,
        error: err?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}


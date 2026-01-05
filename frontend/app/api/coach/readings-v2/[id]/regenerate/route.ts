import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getReadingType } from '@/lib/readingTypes';
import { getReadingV2JSONById, addVersionToReadingV2JSON, type ReadingVersion } from '@/lib/db/readings-v2-json';
import { buildMcpReadingPayload, getRequestIdFromPayload } from '@/lib/mcp/readingPayloadBuilder';
import { normalizeMcpOutput, handleMcpError } from '@/lib/mcp/normalizeMcpOutput';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

type RegenerateResponse =
  | { success: true; readingId: string; versionId: string; generatedText: string | null }
  | { success: false; reading: { id: string; status: string; errorMessage: string | null } };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<RegenerateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Nicht autorisiert' } },
        { status: 401 }
      );
    }

    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json<RegenerateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Reading-ID fehlt' } },
        { status: 400 }
      );
    }

    // 1. Reading laden
    const reading = await getReadingV2JSONById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<RegenerateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Reading nicht gefunden' } },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<RegenerateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Kein Zugriff auf dieses Reading' } },
        { status: 403 }
      );
    }

    // 2. Hole aktuelle Version
    const currentVersion = reading.reading_data.versions.find(
      (v) => v.id === reading.reading_data.currentVersionId
    );

    if (!currentVersion) {
      return NextResponse.json<RegenerateResponse>(
        { success: false, reading: { id: readingId, status: 'error', errorMessage: 'Aktuelle Version nicht gefunden' } },
        { status: 404 }
      );
    }

    // 3. Nutze readingTypeKey und input (exakt gleich)
    const readingTypeKey = currentVersion.readingTypeKey;
    const input = currentVersion.input;

    // readingType validieren
    const readingConfig = getReadingType(readingTypeKey);
    if (!readingConfig) {
      return NextResponse.json<RegenerateResponse>(
        {
          success: false,
          reading: { id: readingId, status: 'error', errorMessage: `Unbekannter readingType: ${readingTypeKey}` },
        },
        { status: 400 }
      );
    }

    // MCP-Server URL prüfen
    const MCP_SERVER_URL =
      process.env.MCP_SERVER_URL ||
      process.env.NEXT_PUBLIC_MCP_SERVER_URL;

    if (!MCP_SERVER_URL) {
      return NextResponse.json<RegenerateResponse>(
        {
          success: false,
          reading: { id: readingId, status: 'error', errorMessage: 'MCP_SERVER_URL ist nicht konfiguriert' },
        },
        { status: 500 }
      );
    }

    // 4. MCP-Payload bauen (gleicher input)
    let mcpPayload;
    try {
      mcpPayload = buildMcpReadingPayload(readingTypeKey, input);
    } catch (payloadError: any) {
      console.error('Fehler beim Erstellen des MCP-Payloads:', payloadError);
      return NextResponse.json<RegenerateResponse>(
        {
          success: false,
          reading: { id: readingId, status: 'error', errorMessage: `Fehler beim Erstellen des Payloads: ${payloadError?.message}` },
        },
        { status: 500 }
      );
    }

    const requestId = getRequestIdFromPayload(mcpPayload);

    // Logging
    console.log('[MCP Regenerate]', {
      requestId,
      readingId: readingId,
      readingTypeKey: readingTypeKey,
      mcpType: mcpPayload.meta.mcpType,
      agent: mcpPayload.agent,
    });

    // 5. Neuer MCP Call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    let mcpResponse;
    let mcpData: any;
    let normalized: any;

    try {
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

      if (!mcpResponse.ok) {
        const { safeResponseText } = await import('@/lib/utils/safeJson');
        const errorText = await safeResponseText(mcpResponse, 'Unknown error');
        normalized = normalizeMcpOutput({ success: false, error: errorText }, mcpResponse.status);
        const errorMessage = normalized.error || `MCP-Server Fehler (${mcpResponse.status}): ${errorText}`;

        // Erstelle neue Version mit error
        const errorVersion: ReadingVersion = {
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          readingTypeKey: readingTypeKey,
          schemaVersion: readingConfig.schemaVersion || '1.0.0',
          input: input,
          mcpPayload: mcpPayload.input,
          mcpResponseRaw: { success: false, error: errorText, httpStatus: mcpResponse.status },
          generatedText: null,
          status: 'error',
          error: errorMessage,
          meta: {
            agent: mcpPayload.agent,
            mcpType: mcpPayload.meta.mcpType,
            requestId: requestId,
          },
        };

        const updatedReading = await addVersionToReadingV2JSON(user.id, readingId, errorVersion);

        return NextResponse.json<RegenerateResponse>({
          success: false,
          reading: {
            id: readingId,
            status: 'error',
            errorMessage: errorMessage,
          },
        });
      }

      mcpData = await mcpResponse.json();

      // Output normalisieren
      normalized = normalizeMcpOutput(mcpData, mcpResponse.status);

      if (!normalized.generatedText) {
        const errorMessage = normalized.error || 'MCP-Server hat keinen Text generiert';

        // Erstelle neue Version mit error
        const errorVersion: ReadingVersion = {
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          readingTypeKey: readingTypeKey,
          schemaVersion: readingConfig.schemaVersion || '1.0.0',
          input: input,
          mcpPayload: mcpPayload.input,
          mcpResponseRaw: normalized.raw,
          generatedText: null,
          status: 'error',
          error: errorMessage,
          meta: {
            agent: mcpPayload.agent,
            mcpType: mcpPayload.meta.mcpType,
            requestId: requestId,
          },
        };

        await addVersionToReadingV2JSON(user.id, readingId, errorVersion);

        return NextResponse.json<RegenerateResponse>({
          success: false,
          reading: {
            id: readingId,
            status: 'error',
            errorMessage: errorMessage,
          },
        });
      }
    } catch (fetchError: any) {
      clearTimeout(timeout);

      const errorMessage = handleMcpError(fetchError);

      // Erstelle neue Version mit error
      const errorVersion: ReadingVersion = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        readingTypeKey: readingTypeKey,
        schemaVersion: readingConfig.schemaVersion || '1.0.0',
        input: input,
        mcpPayload: mcpPayload.input,
        mcpResponseRaw: { success: false, error: errorMessage },
        generatedText: null,
        status: 'error',
        error: errorMessage,
        meta: {
          agent: mcpPayload.agent,
          mcpType: mcpPayload.meta.mcpType,
          requestId: requestId,
        },
      };

      await addVersionToReadingV2JSON(user.id, readingId, errorVersion);

      if (fetchError?.name === 'AbortError') {
        return NextResponse.json<RegenerateResponse>({
          success: false,
          reading: {
            id: readingId,
            status: 'error',
            errorMessage: errorMessage,
          },
        });
      }

      throw fetchError;
    }

    const generatedText = normalized.generatedText;

    // 6. Erzeuge neue Version (success)
    const newVersion: ReadingVersion = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      readingTypeKey: readingTypeKey,
      schemaVersion: readingConfig.schemaVersion || '1.0.0',
      input: input,
      mcpPayload: mcpPayload.input,
      mcpResponseRaw: normalized.raw,
      generatedText: generatedText,
      status: 'success',
      meta: {
        agent: mcpPayload.agent,
        mcpType: mcpPayload.meta.mcpType,
        requestId: requestId,
      },
    };

    // 7. Append in versions[] und setze currentVersionId neu
    const updatedReading = await addVersionToReadingV2JSON(user.id, readingId, newVersion);

    // Erfolgreiche Response
    return NextResponse.json<RegenerateResponse>({
      success: true,
      readingId: readingId,
      versionId: newVersion.id,
      generatedText: generatedText,
    });
  } catch (err: any) {
    console.error('Unerwarteter Fehler in readings-v2/[id]/regenerate:', err);
    return NextResponse.json<RegenerateResponse>(
      {
        success: false,
        reading: { id: '', status: 'error', errorMessage: err?.message || 'Unbekannter Serverfehler' },
      },
      { status: 500 }
    );
  }
}

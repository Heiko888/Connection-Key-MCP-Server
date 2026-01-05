import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getReadingType, isValidReadingType } from '@/lib/readingTypes';
import { getReadingSchema, validateSchemaInput } from '@/lib/readingSchemas';
import { createCoachReading } from '@/lib/db/coach-readings';
import { createReadingJob, hasActiveReadingJob } from '@/lib/db/reading-jobs';
import { createReadingVersion } from '@/lib/db/reading-versions';
import { startReadingJob } from '@/lib/jobs/readingWorker';

export const runtime = 'nodejs';

type CreateResponse =
  | { success: true; readingId: string; jobId: string; status: 'pending' }
  | { success: false; reading: { id: string; status: string; errorMessage: string | null } };

/**
 * Erstellt ein neues Reading mit asynchronem Job
 * 
 * Flow:
 * 1. Validierung
 * 2. Reading anlegen (status = pending)
 * 3. Job anlegen (status = pending)
 * 4. Worker starten (im Hintergrund)
 * 5. SOFORT Response zurückgeben
 * 
 * KEIN MCP-CALL HIER
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[readings-v2/create] Start - Auth-Prüfung');
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      console.error('[readings-v2/create] Coach-Auth fehlgeschlagen:', {
        hasUser: !!user,
        isCoach,
        userId: user?.id,
        email: user?.email,
      });
      return NextResponse.json<CreateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Nicht autorisiert' } },
        { status: 401 }
      );
    }

    console.log('[readings-v2/create] Auth erfolgreich:', {
      userId: user.id,
      email: user.email,
      isCoach,
    });

    const body = await req.json();
    const { readingType, input, promptVersion } = body ?? {};

    // 1. Validierung: readingType und input sind Pflicht
    if (!readingType || !input) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: 'readingType und input sind Pflichtfelder' },
        },
        { status: 400 }
      );
    }

    // Validierung: readingType muss in readingTypes existieren
    if (!isValidReadingType(readingType)) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: `Unbekannter readingType: ${readingType}` },
        },
        { status: 400 }
      );
    }

    // Reading-Config abrufen
    const readingConfig = getReadingType(readingType);
    if (!readingConfig) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: `Reading-Konfiguration nicht gefunden für: ${readingType}` },
        },
        { status: 500 }
      );
    }

    // Validierung: Schema-basierte Validierung
    if (!readingConfig.schemaKey) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: `Kein Schema definiert für: ${readingType}` },
        },
        { status: 400 }
      );
    }

    const schema = getReadingSchema(readingConfig.schemaKey);
    if (!schema) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: `Schema nicht gefunden: ${readingConfig.schemaKey}` },
        },
        { status: 400 }
      );
    }

    const validation = validateSchemaInput(schema, input);
    if (!validation.valid) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: '', status: 'error', errorMessage: validation.error || 'Validierungsfehler' },
        },
        { status: 400 }
      );
    }

    // Prompt-Version validieren (falls angegeben)
    if (promptVersion) {
      const { hasPromptVersion } = await import('@/lib/prompts/promptRegistry');
      if (!hasPromptVersion(readingType, promptVersion)) {
        return NextResponse.json<CreateResponse>(
          {
            success: false,
            reading: { id: '', status: 'error', errorMessage: `Ungültige Prompt-Version: ${promptVersion} für Reading-Type: ${readingType}` },
          },
          { status: 400 }
        );
      }
    }

    // Client-Name aus Input extrahieren
    const clientName = input.clientName || input.personA?.name || input.personB?.name || 'Unbekannt';

    // 2. Reading anlegen (status = pending)
    let reading;
    try {
      reading = await createCoachReading(user.id, {
        reading_type: readingType,
        client_name: clientName,
        status: 'pending',
        reading_data: { input: input, promptVersion: promptVersion }, // Store input + promptVersion
      });
    } catch (dbError: any) {
      console.error('DB-Fehler beim Erstellen des Readings:', dbError);
      return NextResponse.json<CreateResponse>(
        { success: false, reading: { id: '', status: 'error', errorMessage: 'Fehler beim Speichern des Readings in der Datenbank.' } },
        { status: 500 }
      );
    }

    // 3. Initiale Version anlegen (status = pending, ohne generatedText)
    console.log('[readings-v2/create] Erstelle initiale Version für Reading:', reading.id);
    let version;
    try {
      const versionPayload = {
        // version_number wird automatisch von createReadingVersion bestimmt
        schema_version: readingConfig.schemaVersion || '1.0',
        reading_type: readingType,
        input: input,
        mcp_agent: readingConfig.agent || 'reading',
        status: 'pending' as const,
        generated_text: null,
        prompt_id: null, // Wird später vom Worker gesetzt
        prompt_version: null, // Wird später vom Worker gesetzt
      };
      
      console.log('[readings-v2/create] Version-Payload:', {
        reading_id: reading.id,
        reading_type: versionPayload.reading_type,
        mcp_agent: versionPayload.mcp_agent,
        status: versionPayload.status,
        hasInput: !!versionPayload.input,
      });

      version = await createReadingVersion(reading.id, versionPayload);
      console.log('[readings-v2/create] Initiale Version erfolgreich erstellt:', {
        versionId: version.id,
        versionNumber: version.version_number,
      });

      // Setze current_version_id auf die initiale Version
      try {
        const { setCurrentVersion } = await import('@/lib/db/reading-versions');
        await setCurrentVersion(reading.id, version.id);
        console.log('[readings-v2/create] current_version_id gesetzt:', version.id);
      } catch (setVersionError: any) {
        // Warnung: current_version_id konnte nicht gesetzt werden, aber Version existiert
        // Reading bleibt bestehen, da Architektur-Annahme (jedes Reading hat eine Version) erfüllt ist
        console.warn('[readings-v2/create] current_version_id konnte nicht gesetzt werden:', {
          error: setVersionError,
          readingId: reading.id,
          versionId: version.id,
          message: 'Reading hat Version, aber current_version_id ist nicht gesetzt. Fallback auf Array-Query funktioniert.',
        });
      }
    } catch (versionError: any) {
      console.error('[readings-v2/create] DB-Fehler beim Erstellen der initialen Version:', {
        error: versionError,
        message: versionError?.message,
        code: versionError?.code,
        details: versionError?.details,
        hint: versionError?.hint,
        readingId: reading.id,
      });
      
      // Rollback: Lösche das Reading, da keine Version erstellt werden konnte
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { error: deleteError } = await supabase
          .from('coach_readings')
          .delete()
          .eq('id', reading.id);
        
        if (deleteError) {
          console.error('[readings-v2/create] Fehler beim Rollback (Löschen des Readings):', deleteError);
        } else {
          console.log('[readings-v2/create] Reading gelöscht (Rollback nach Version-Fehler):', reading.id);
        }
      } catch (deleteError: any) {
        console.error('[readings-v2/create] Unerwarteter Fehler beim Rollback:', deleteError);
      }
      
      return NextResponse.json<CreateResponse>(
        { 
          success: false, 
          reading: { 
            id: '', 
            status: 'error', 
            errorMessage: `Fehler beim Speichern der initialen Reading-Version: ${versionError?.message || 'Unbekannter Fehler'}. Reading wurde nicht erstellt.` 
          } 
        },
        { status: 500 }
      );
    }

    // 4. Prüfe ob bereits ein aktiver Job existiert (Schutzmechanismus)
    let hasActive = false;
    try {
      hasActive = await hasActiveReadingJob(reading.id);
    } catch (jobCheckError: any) {
      // Wenn es ein Schema-Fehler ist, geben wir eine hilfreiche Fehlermeldung zurück
      if (jobCheckError?.message?.includes('Datenbank-Schema-Fehler')) {
        console.error('[readings-v2/create] Datenbank-Schema-Fehler:', jobCheckError);
        return NextResponse.json<CreateResponse>(
          {
            success: false,
            reading: {
              id: reading.id,
              status: 'error',
              errorMessage: jobCheckError.message || 'Datenbank-Schema-Fehler: reading_jobs Tabelle fehlt. Bitte führen Sie die SQL-Migration aus.',
            },
          },
          { status: 500 }
        );
      }
      // Bei anderen Fehlern weiterwerfen
      throw jobCheckError;
    }
    
    if (hasActive) {
      return NextResponse.json<CreateResponse>(
        {
          success: false,
          reading: { id: reading.id, status: 'error', errorMessage: 'Es läuft bereits ein Job für dieses Reading.' },
        },
        { status: 409 } // Conflict
      );
    }

    // 5. Job anlegen (status = pending)
    let job;
    try {
      job = await createReadingJob(reading.id);
    } catch (jobError: any) {
      console.error('Fehler beim Erstellen des Jobs:', jobError);
      // Wenn es ein Schema-Fehler ist, geben wir eine hilfreiche Fehlermeldung zurück
      if (jobError?.message?.includes('Datenbank-Schema-Fehler')) {
        return NextResponse.json<CreateResponse>(
          {
            success: false,
            reading: {
              id: reading.id,
              status: 'error',
              errorMessage: jobError.message || 'Datenbank-Schema-Fehler: reading_jobs Tabelle fehlt. Bitte führen Sie die SQL-Migration aus.',
            },
          },
          { status: 500 }
        );
      }
      return NextResponse.json<CreateResponse>(
        { success: false, reading: { id: reading.id, status: 'error', errorMessage: `Fehler beim Erstellen des Jobs: ${jobError?.message || 'Unbekannter Fehler'}` } },
        { status: 500 }
      );
    }

    // 6. Worker starten (im Hintergrund)
    try {
      startReadingJob(job.id);
      console.log(`[Job ${job.id}] Worker gestartet für Reading ${reading.id}`);
    } catch (workerError: any) {
      console.error('Fehler beim Starten des Workers:', workerError);
      // Job als fehlgeschlagen markieren
      const { updateReadingJob } = await import('@/lib/db/reading-jobs');
      await updateReadingJob(job.id, {
        status: 'failed',
        error: `Fehler beim Starten des Workers: ${workerError?.message}`,
      });
      return NextResponse.json<CreateResponse>(
        { success: false, reading: { id: reading.id, status: 'error', errorMessage: 'Fehler beim Starten des Workers.' } },
        { status: 500 }
      );
    }

    // 7. SOFORT Response zurückgeben
    return NextResponse.json<CreateResponse>({
      success: true,
      readingId: reading.id,
      jobId: job.id,
      status: 'pending',
    });
  } catch (err: any) {
    console.error('Unerwarteter Fehler in readings-v2/create:', err);
    return NextResponse.json<CreateResponse>(
      {
        success: false,
        reading: { id: '', status: 'error', errorMessage: err?.message || 'Unbekannter Serverfehler' },
      },
      { status: 500 }
    );
  }
}

/**
 * Reading Worker
 * 
 * Verarbeitet asynchrone MCP-Generierungs-Jobs im Hintergrund.
 * Läuft als Node Worker Thread oder Background Promise.
 */

import { getReadingJobById, updateReadingJob } from '@/lib/db/reading-jobs';
import { getCoachReadingById, updateCoachReading } from '@/lib/db/coach-readings';
import { getLastReadingVersion, createReadingVersion, updateReadingVersion, setCurrentVersion } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';
import { buildMcpReadingPayload, getRequestIdFromPayload } from '@/lib/mcp/readingPayloadBuilder';
import { callMcpAgent } from '@/lib/mcp/mcpClient';

export interface WorkerResult {
  success: boolean;
  error?: string;
  generatedText?: string | null;
}

/**
 * Verarbeitet einen Reading-Job
 * 
 * @param jobId - Die Job-ID
 * @returns WorkerResult
 */
export async function processReadingJob(jobId: string): Promise<WorkerResult> {
  const requestId = `job-${jobId.substring(0, 8)}`;
  
  try {
    console.log(`[${requestId}] Job-Verarbeitung gestartet`);

    // 1. Job laden
    const job = await getReadingJobById(jobId);
    if (!job) {
      throw new Error(`Job nicht gefunden: ${jobId}`);
    }

    // 2. Status → running
    await updateReadingJob(jobId, {
      status: 'running',
      progress: 10,
    });

    console.log(`[${requestId}] Job-Status: running`);

    // 3. Reading laden
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    
    const { data: reading, error: readingError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', job.reading_id)
      .maybeSingle(); // ✅ Tolerant: verhindert PGRST116 bei Race Conditions

    if (readingError || !reading) {
      throw new Error(`Reading nicht gefunden: ${job.reading_id}`);
    }

    const readingConfig = getReadingType(reading.reading_type);
    if (!readingConfig) {
      throw new Error(`Reading-Konfiguration nicht gefunden: ${reading.reading_type}`);
    }

    // Input aus reading_data extrahieren
    const input = reading.reading_data?.input || {};
    
    // Prompt-Version aus letzter Version (falls vorhanden)
    const existingVersion = await getLastReadingVersion(job.reading_id);
    let promptVersion: string | undefined;
    if (existingVersion?.prompt_id) {
      const parts = existingVersion.prompt_id.split('.');
      if (parts.length >= 2) {
        promptVersion = parts[parts.length - 1];
      }
    }

    // 4. MCP-Payload bauen
    await updateReadingJob(jobId, { progress: 20 });
    
    let mcpPayload;
    try {
      mcpPayload = buildMcpReadingPayload(reading.reading_type, input, promptVersion);
    } catch (payloadError: any) {
      throw new Error(`Fehler beim Erstellen des MCP-Payloads: ${payloadError?.message}`);
    }

    const mcpRequestId = getRequestIdFromPayload(mcpPayload);
    const promptVersionUsed = mcpPayload.meta.promptVersion;
    const promptLabel = mcpPayload.meta.promptLabel;

    console.log(`[${requestId}] MCP-Request vorbereitet`, {
      readingType: reading.reading_type,
      promptVersion: promptVersionUsed,
      mcpRequestId,
    });

    // 5. MCP aufrufen (über zentralen Client)
    await updateReadingJob(jobId, { progress: 30 });

    console.log(`[${requestId}] MCP-Aufruf gestartet`);

    const mcpResult = await callMcpAgent({
      agent: mcpPayload.agent,
      payload: mcpPayload.input,
      coachId: reading.coach_id,
      readingId: job.reading_id,
      promptVersion: promptVersionUsed,
      model: null, // Wird aus MCP-Response extrahiert
    });

    await updateReadingJob(jobId, { progress: 70 });

    // Fehlerbehandlung
    if (!mcpResult.success || !mcpResult.output) {
      const errorMessage = mcpResult.error || 'MCP-Server hat keinen verwertbaren Text geliefert';
      
      console.error(`[${requestId}] MCP-Aufruf fehlgeschlagen:`, {
        error: errorMessage,
        errorCode: mcpResult.errorCode,
        usage: mcpResult.usage,
      });

      await updateReadingJob(jobId, {
        status: 'failed',
        error: errorMessage,
        progress: 100,
      });

      // Version als fehlerhaft markieren
      const lastVersion = await getLastReadingVersion(job.reading_id);
      if (lastVersion) {
        await updateReadingVersion(lastVersion.id, {
          status: 'error',
          error_message: errorMessage,
          mcp_runtime_ms: mcpResult.usage?.durationMs || 0,
          prompt_id: `${reading.reading_type}.${promptVersionUsed}`,
          prompt_version: promptVersionUsed,
        });
      }

      await updateCoachReading(reading.coach_id, job.reading_id, { status: 'error' });

      return {
        success: false,
        error: errorMessage,
      };
    }

    const generatedText = mcpResult.output;
    const mcpRuntimeMs = mcpResult.usage?.durationMs || 0;

    // 6. Version aktualisieren oder erstellen
    await updateReadingJob(jobId, { progress: 85 });

    const lastVersion = await getLastReadingVersion(job.reading_id);
    if (lastVersion) {
      // Aktualisiere bestehende Version
      await updateReadingVersion(lastVersion.id, {
        generated_text: generatedText,
        status: 'success',
        mcp_runtime_ms: mcpRuntimeMs,
        prompt_id: `${reading.reading_type}.${promptVersionUsed}`,
        prompt_version: promptVersionUsed,
      });
      await setCurrentVersion(job.reading_id, lastVersion.id);
    } else {
      // Erstelle neue Version
      // version_number wird automatisch von createReadingVersion bestimmt
      const newVersion = await createReadingVersion(job.reading_id, {
        schema_version: readingConfig.schemaVersion || '1.0',
        reading_type: reading.reading_type,
        input: input,
        generated_text: generatedText,
        mcp_agent: mcpPayload.agent,
        mcp_runtime_ms: mcpRuntimeMs,
        status: 'success',
        prompt_id: `${reading.reading_type}.${promptVersionUsed}`,
        prompt_version: promptVersionUsed,
      });
      await setCurrentVersion(job.reading_id, newVersion.id);
    }

    // 7. Reading-Status aktualisieren
    await updateCoachReading(reading.coach_id, job.reading_id, { status: 'completed' });

    // 8. Job → completed
    await updateReadingJob(jobId, {
      status: 'completed',
      progress: 100,
    });

    console.log(`[${requestId}] Job erfolgreich abgeschlossen`);

    // 9. Optional: AI-Quality-Review (wenn aktiviert)
    try {
      const { reviewReadingQualityWithAI } = await import('@/lib/ai/readingQualityReviewer');
      const enableAIReview = process.env.ENABLE_AI_QUALITY_REVIEW === 'true';
      
      if (enableAIReview) {
        console.log(`[${requestId}] Starte AI-Quality-Review...`);
        await reviewReadingQualityWithAI(job.reading_id, generatedText, reading.reading_type);
        
        // Update approval_status → ai_reviewed
        await updateCoachReading(reading.coach_id, job.reading_id, { 
          status: 'completed',
          approval_status: 'ai_reviewed',
        });
        
        console.log(`[${requestId}] AI-Quality-Review abgeschlossen`);
      } else {
        // Ohne AI-Review: approval_status bleibt draft
        await updateCoachReading(reading.coach_id, job.reading_id, { 
          status: 'completed',
          approval_status: 'draft',
        });
      }
    } catch (reviewError: any) {
      // AI-Review-Fehler nicht kritisch, nur loggen
      console.error(`[${requestId}] Fehler bei AI-Quality-Review:`, reviewError);
      // Reading trotzdem als completed markieren
      await updateCoachReading(reading.coach_id, job.reading_id, { 
        status: 'completed',
        approval_status: 'draft',
      });
    }

    return {
      success: true,
      generatedText: generatedText,
    };

  } catch (error: any) {
    console.error(`[${requestId}] Job-Verarbeitung fehlgeschlagen:`, error);

    // Job als fehlgeschlagen markieren
    try {
      await updateReadingJob(jobId, {
        status: 'failed',
        error: error?.message || 'Unbekannter Fehler',
        progress: 100,
      });
    } catch (updateError) {
      console.error(`[${requestId}] Fehler beim Aktualisieren des Job-Status:`, updateError);
    }

    return {
      success: false,
      error: error?.message || 'Unbekannter Fehler',
    };
  }
}

/**
 * Startet einen Job im Hintergrund (setImmediate für Node.js)
 */
export function startReadingJob(jobId: string): void {
  // Option 3: setImmediate / background promise
  // Für Startphase ausreichend, später auf Worker Thread erweiterbar
  setImmediate(async () => {
    await processReadingJob(jobId);
  });
}


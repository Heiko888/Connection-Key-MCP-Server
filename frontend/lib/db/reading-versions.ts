/**
 * Reading Versions Datenbank-Service
 * 
 * Verwaltet alle Versionen eines Readings in der reading_versions Tabelle.
 * Jede MCP-Generierung erzeugt eine neue Version.
 */

import { createClient } from '@/lib/supabase/server';

export interface ReadingVersion {
  id: string;
  reading_id: string;
  version_number: number;
  schema_version: string;
  reading_type: string;
  input: Record<string, any>;
  generated_text: string | null;
  mcp_agent: string;
  mcp_runtime_ms: number | null;
  status: 'pending' | 'success' | 'error';
  error_message: string | null;
  prompt_id?: string | null; // ID des verwendeten Prompt-Templates
  prompt_version?: string | null; // Version des verwendeten Prompt-Templates
  created_at: string;
}

export interface ReadingVersionSummary {
  id: string;
  version_number: number;
  created_at: string;
  mcp_runtime_ms: number | null;
  schema_version: string;
  status: 'pending' | 'success' | 'error';
}

/**
 * Erstellt eine neue Version für ein Reading
 * Bestimmt automatisch die nächste version_number, um UNIQUE Constraint Verstöße zu vermeiden
 */
export async function createReadingVersion(
  readingId: string,
  versionData: {
    version_number?: number; // Optional: wird automatisch bestimmt, falls nicht angegeben oder bereits existiert
    schema_version: string;
    reading_type: string;
    input: Record<string, any>;
    mcp_agent: string;
    generated_text?: string | null;
    mcp_runtime_ms?: number | null;
    status?: 'pending' | 'success' | 'error';
    error_message?: string | null;
    prompt_id?: string | null;
    prompt_version?: string | null;
  }
): Promise<ReadingVersion> {
  const supabase = createClient();

  // Bestimme die nächste version_number atomar
  // Lade die höchste bestehende version_number für dieses reading
  const { data: existingVersions, error: versionError } = await supabase
    .from('reading_versions')
    .select('version_number')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionError) {
    console.error('[createReadingVersion] Fehler beim Ermitteln der Versionsnummer:', versionError);
    throw new Error(`Fehler beim Ermitteln der Versionsnummer: ${versionError.message}`);
  }

  // Berechne die nächste version_number
  const highestVersionNumber = existingVersions && existingVersions.length > 0
    ? existingVersions[0].version_number
    : 0;

  // Wenn version_number angegeben wurde, prüfe ob sie bereits existiert
  let nextVersionNumber: number;
  if (versionData.version_number !== undefined) {
    // Prüfe ob die angegebene version_number bereits existiert
    if (versionData.version_number <= highestVersionNumber) {
      // Die angegebene version_number existiert bereits oder ist zu niedrig
      // Verwende stattdessen die nächste verfügbare
      console.warn(
        `[createReadingVersion] version_number ${versionData.version_number} existiert bereits oder ist zu niedrig (höchste: ${highestVersionNumber}). Verwende ${highestVersionNumber + 1}`
      );
      nextVersionNumber = highestVersionNumber + 1;
    } else {
      // Die angegebene version_number ist höher als die höchste, verwende sie
      nextVersionNumber = versionData.version_number;
    }
  } else {
    // Keine version_number angegeben, verwende die nächste
    nextVersionNumber = highestVersionNumber + 1;
  }

  const insertData = {
    reading_id: readingId,
    version_number: nextVersionNumber,
    schema_version: versionData.schema_version,
    reading_type: versionData.reading_type,
    input: versionData.input,
    generated_text: versionData.generated_text || null,
    mcp_agent: versionData.mcp_agent,
    mcp_runtime_ms: versionData.mcp_runtime_ms || null,
    status: versionData.status || 'pending',
    error_message: versionData.error_message || null,
    prompt_id: versionData.prompt_id || null,
    prompt_version: versionData.prompt_version || null,
  };

  console.log('[createReadingVersion] Insert-Payload:', {
    reading_id: insertData.reading_id,
    version_number: insertData.version_number,
    requested_version_number: versionData.version_number,
    highest_existing: highestVersionNumber,
    reading_type: insertData.reading_type,
    mcp_agent: insertData.mcp_agent,
    status: insertData.status,
    hasInput: !!insertData.input,
    prompt_id: insertData.prompt_id,
    prompt_version: insertData.prompt_version,
  });

  const { data, error } = await supabase
    .from('reading_versions')
    .insert(insertData)
    .select()
    .maybeSingle();

  if (error) {
    // Prüfe ob es ein UNIQUE Constraint Verstoß ist (Race Condition)
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      console.warn(
        `[createReadingVersion] UNIQUE Constraint Verstoß (Race Condition). Versuche erneut mit erhöhter version_number...`,
        { error: error.message, code: error.code, readingId, attemptedVersion: nextVersionNumber }
      );
      
      // Retry: Lade erneut die höchste version_number und versuche es nochmal
      const { data: retryVersions, error: retryError } = await supabase
        .from('reading_versions')
        .select('version_number')
        .eq('reading_id', readingId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (retryError) {
        console.error('[createReadingVersion] Fehler beim Retry:', retryError);
        throw new Error(`Fehler beim Retry nach UNIQUE Constraint Verstoß: ${retryError.message}`);
      }

      const retryHighestVersion = retryVersions && retryVersions.length > 0
        ? retryVersions[0].version_number
        : 0;

      const retryVersionNumber = retryHighestVersion + 1;
      insertData.version_number = retryVersionNumber;

      console.log(`[createReadingVersion] Retry mit version_number: ${retryVersionNumber}`);

      // Retry INSERT
      const { data: retryData, error: retryInsertError } = await supabase
        .from('reading_versions')
        .insert(insertData)
        .select()
        .maybeSingle();

      if (retryInsertError) {
        console.error('[createReadingVersion] DB-Fehler beim Retry:', {
          error: retryInsertError,
          message: retryInsertError.message,
          code: retryInsertError.code,
          details: retryInsertError.details,
          hint: retryInsertError.hint,
          readingId,
          insertData,
        });
        throw retryInsertError;
      }

      if (!retryData) {
        throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: reading_versions');
      }

      console.log('[createReadingVersion] Version erfolgreich erstellt (nach Retry):', {
        versionId: retryData.id,
        readingId,
        versionNumber: retryData.version_number,
      });

      return retryData as ReadingVersion;
    }

    // Anderer Fehler
    console.error('[createReadingVersion] DB-Fehler:', {
      error: error,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      readingId,
      insertData,
    });
    throw error;
  }

  if (!data) {
    throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: reading_versions');
  }

  console.log('[createReadingVersion] Version erfolgreich erstellt:', {
    versionId: data.id,
    readingId,
    versionNumber: data.version_number,
  });

  return data as ReadingVersion;
}

/**
 * Holt alle Versionen eines Readings (Summary)
 */
export async function getReadingVersions(
  readingId: string
): Promise<ReadingVersionSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_versions')
    .select('id, version_number, created_at, mcp_runtime_ms, schema_version, status')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Reading-Versionen:', error);
    throw error;
  }

  return (data || []) as ReadingVersionSummary[];
}

/**
 * Holt eine spezifische Version
 */
export async function getReadingVersionById(
  versionId: string
): Promise<ReadingVersion | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Fehler beim Laden der Reading-Version:', error);
    throw error;
  }

  return data as ReadingVersion;
}

/**
 * Holt die letzte Version eines Readings
 * Verwendet current_version_id falls verfügbar, sonst die neueste Version
 */
export async function getLastReadingVersion(
  readingId: string
): Promise<ReadingVersion | null> {
  const supabase = createClient();

  // Lade zuerst das Reading, um current_version_id zu prüfen
  const { data: reading, error: readingError } = await supabase
    .from('coach_readings')
    .select('current_version_id')
    .eq('id', readingId)
    .maybeSingle(); // ✅ Tolerant: verhindert PGRST116 bei Race Conditions

  if (readingError) {
    if (readingError.code === 'PGRST116') {
      return null;
    }
    console.error('Fehler beim Laden des Readings:', readingError);
    throw readingError;
  }

  // Wenn current_version_id vorhanden ist, lade diese Version
  if (reading?.current_version_id) {
    const { data: version, error: versionError } = await supabase
      .from('reading_versions')
      .select('*')
      .eq('id', reading.current_version_id)
      .maybeSingle(); // ✅ Tolerant: verhindert PGRST116 wenn Version gelöscht wurde

    if (versionError) {
      if (versionError.code === 'PGRST116') {
        // current_version_id verweist auf nicht existierende Version, lade neueste
        console.warn(`current_version_id ${reading.current_version_id} existiert nicht, lade neueste Version`);
      } else {
        console.error('Fehler beim Laden der Version über current_version_id:', versionError);
        throw versionError;
      }
    } else if (version) {
      return version as ReadingVersion;
    }
  }

  // Fallback: Lade neueste Version über reading_id
  const { data: versions, error: versionsError } = await supabase
    .from('reading_versions')
    .select('*')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionsError) {
    console.error('Fehler beim Laden der neuesten Reading-Version:', versionsError);
    throw versionsError;
  }

  if (!versions || versions.length === 0) {
    return null;
  }

  return versions[0] as ReadingVersion;
}

/**
 * Aktualisiert eine Version (z.B. nach MCP-Generierung)
 */
export async function updateReadingVersion(
  versionId: string,
  updates: {
    generated_text?: string | null;
    mcp_runtime_ms?: number | null;
    status?: 'pending' | 'success' | 'error';
    error_message?: string | null;
    prompt_id?: string | null;
    prompt_version?: string | null;
  }
): Promise<ReadingVersion> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_versions')
    .update(updates)
    .eq('id', versionId)
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Aktualisieren der Reading-Version:', error);
    throw error;
  }

  return data as ReadingVersion;
}

/**
 * Setzt die aktuelle Version eines Readings
 */
export async function setCurrentVersion(
  readingId: string,
  versionId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('coach_readings')
    .update({ current_version_id: versionId })
    .eq('id', readingId);

  if (error) {
    console.error('Fehler beim Setzen der aktuellen Version:', error);
    throw error;
  }
}


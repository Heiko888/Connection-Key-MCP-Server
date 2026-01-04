/**
 * Readings v2 Datenbank-Service
 * Versions-basierte Persistenz mit MCP-Payload/Response-Speicherung
 */

import { createClient } from '@/lib/supabase/server';

export interface ReadingV2 {
  id: string;
  coach_id: string;
  reading_type: string;
  input: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  created_at: string;
  updated_at: string;
}

export interface ReadingVersion {
  id: string;
  reading_id: string;
  version: number;
  mcp_payload: Record<string, any>;
  mcp_response: Record<string, any> | null;
  generated_text: string | null;
  status: 'pending' | 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

/**
 * Erstellt ein neues Reading (ohne Versionen)
 */
export async function createReadingV2(
  coachId: string,
  reading: {
    reading_type: string;
    input: Record<string, any>;
  }
): Promise<ReadingV2> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('coach_readings')
    .insert({
      coach_id: coachId,
      reading_type: reading.reading_type,
      input: reading.input,
      status: 'pending',
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Erstellen des Reading v2:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: coach_readings');
  }

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    input: data.input,
    status: data.status || 'pending',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Erstellt eine neue Version eines Readings
 */
export async function createReadingVersion(
  readingId: string,
  version: {
    version: number;
    mcp_payload: Record<string, any>;
    status: 'pending' | 'success' | 'error';
    mcp_response?: Record<string, any> | null;
    generated_text?: string | null;
    error_message?: string | null;
  }
): Promise<ReadingVersion> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_versions')
    .insert({
      reading_id: readingId,
      version: version.version,
      mcp_payload: version.mcp_payload,
      mcp_response: version.mcp_response || null,
      generated_text: version.generated_text || null,
      status: version.status,
      error_message: version.error_message || null,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Erstellen der Reading-Version:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: reading_versions');
  }

  return data as ReadingVersion;
}

/**
 * Aktualisiert eine Reading-Version
 */
export async function updateReadingVersion(
  versionId: string,
  updates: {
    mcp_response?: Record<string, any> | null;
    generated_text?: string | null;
    status?: 'pending' | 'success' | 'error';
    error_message?: string | null;
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
 * Aktualisiert den Reading-Status basierend auf der letzten Version
 */
export async function updateReadingStatus(readingId: string): Promise<ReadingV2> {
  const supabase = createClient();

  // Lade zuerst das Reading, um current_version_id zu prüfen
  const { data: reading, error: readingError } = await supabase
    .from('coach_readings')
    .select('current_version_id')
    .eq('id', readingId)
    .maybeSingle();

  if (readingError) {
    console.error('Fehler beim Laden des Readings für Status-Update:', readingError);
    throw readingError;
  }

  if (!reading) {
    throw new Error(`Reading nicht gefunden: ${readingId}`);
  }

  let lastVersionStatus: string | null = null;

  // Wenn current_version_id vorhanden ist, lade diese Version
  if (reading?.current_version_id) {
    const { data: version, error: versionError } = await supabase
      .from('reading_versions')
      .select('status')
      .eq('id', reading.current_version_id)
      .single();

    if (!versionError && version) {
      lastVersionStatus = version.status;
    }
  }

  // Fallback: Lade neueste Version über reading_id
  if (!lastVersionStatus) {
    const { data: versions, error: versionsError } = await supabase
      .from('reading_versions')
      .select('status')
      .eq('reading_id', readingId)
      .order('version', { ascending: false })
      .limit(1);

    if (versionsError) {
      console.error('Fehler beim Laden der letzten Version für Status-Update:', versionsError);
    } else if (versions && versions.length > 0) {
      lastVersionStatus = versions[0].status;
    }
  }

  const newStatus = lastVersionStatus === 'success' ? 'success' : lastVersionStatus === 'error' ? 'error' : 'pending';

  // Aktualisiere Reading-Status
  const { data, error } = await supabase
    .from('coach_readings')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', readingId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Aktualisieren des Reading-Status:', error);
    throw error;
  }

  if (!data) {
    throw new Error(`Reading nicht gefunden nach Update: ${readingId}`);
  }

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    input: data.input,
    status: data.status || 'pending',
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Lädt ein Reading mit allen Versionen
 */
export async function getReadingV2WithVersions(
  coachId: string,
  readingId: string
): Promise<{ reading: ReadingV2; versions: ReadingVersion[] } | null> {
  const supabase = createClient();

  // Lade das Reading
  const { data: reading, error: readingError } = await supabase
    .from('coach_readings')
    .select('*')
    .eq('id', readingId)
    .eq('coach_id', coachId)
    .is('deleted_at', null)
    .maybeSingle();

  if (readingError || !reading) {
    return null;
  }

  // Lade alle Versionen
  const { data: versions, error: versionsError } = await supabase
    .from('reading_versions')
    .select('*')
    .eq('reading_id', readingId)
    .order('version', { ascending: true });

  if (versionsError) {
    console.error('Fehler beim Laden der Versionen:', versionsError);
    return {
      reading: {
        id: reading.id,
        coach_id: reading.coach_id,
        reading_type: reading.reading_type,
        input: reading.input,
        status: reading.status || 'pending',
        created_at: reading.created_at,
        updated_at: reading.updated_at,
      },
      versions: [],
    };
  }

  // Bestimme Reading-Status aus letzter Version
  const lastVersion = versions && versions.length > 0 ? versions[versions.length - 1] : null;
  const readingStatus = lastVersion?.status === 'success' ? 'success' : lastVersion?.status === 'error' ? 'error' : 'pending';

  return {
    reading: {
      id: reading.id,
      coach_id: reading.coach_id,
      reading_type: reading.reading_type,
      input: reading.input,
      status: readingStatus,
      created_at: reading.created_at,
      updated_at: reading.updated_at,
    },
    versions: (versions || []).map((v) => ({
      id: v.id,
      reading_id: v.reading_id,
      version: v.version,
      mcp_payload: v.mcp_payload,
      mcp_response: v.mcp_response,
      generated_text: v.generated_text,
      status: v.status,
      error_message: v.error_message,
      created_at: v.created_at,
    })),
  };
}

/**
 * Gibt die letzte Version eines Readings zurück
 * Verwendet current_version_id falls verfügbar, sonst die neueste Version
 */
export async function getLastReadingVersion(readingId: string): Promise<ReadingVersion | null> {
  const supabase = createClient();

  // Lade zuerst das Reading, um current_version_id zu prüfen
  const { data: reading, error: readingError } = await supabase
    .from('coach_readings')
    .select('current_version_id')
    .eq('id', readingId)
    .maybeSingle();

  if (readingError) {
    console.error('Fehler beim Laden des Readings:', readingError);
    return null;
  }

  if (!reading) {
    return null;
  }

  // Wenn current_version_id vorhanden ist, lade diese Version
  if (reading?.current_version_id) {
    const { data: version, error: versionError } = await supabase
      .from('reading_versions')
      .select('*')
      .eq('id', reading.current_version_id)
      .single();

    if (versionError) {
      if (versionError.code === 'PGRST116') {
        // current_version_id verweist auf nicht existierende Version, lade neueste
        console.warn(`current_version_id ${reading.current_version_id} existiert nicht, lade neueste Version`);
      } else {
        console.error('Fehler beim Laden der Version über current_version_id:', versionError);
        return null;
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
    .order('version', { ascending: false })
    .limit(1);

  if (versionsError) {
    console.error('Fehler beim Laden der neuesten Reading-Version:', versionsError);
    return null;
  }

  if (!versions || versions.length === 0) {
    return null;
  }

  return versions[0] as ReadingVersion;
}

/**
 * Readings v2 JSON-basiertes Versionsmodell
 * 
 * Versions werden in reading_data als JSON gespeichert.
 * Minimal invasiv - nutzt vorhandene coach_readings Tabelle.
 */

import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

export interface ReadingVersion {
  id: string; // uuid
  createdAt: string; // ISOString
  readingTypeKey: string;
  schemaVersion: string;
  input: Record<string, any>; // raw structured input (Form)
  mcpPayload: Record<string, any>; // payload wie an MCP gesendet
  mcpResponseRaw: Record<string, any> | null; // raw response
  generatedText: string | null;
  status: 'success' | 'error' | 'empty';
  error?: string;
  meta: {
    agent: string;
    mcpType: string;
    requestId: string;
    promptVersion?: string; // Prompt-Version (z.B. "v1")
    promptLabel?: string; // Prompt-Label (z.B. "Basic – neutral")
  };
}

export interface ReadingDataV2 {
  currentVersionId: string;
  versions: ReadingVersion[];
}

export interface ReadingV2JSON {
  id: string;
  coach_id: string;
  reading_type: string;
  client_name: string;
  status: 'pending' | 'completed' | 'error';
  reading_data: ReadingDataV2;
  created_at: string;
  updated_at: string;
}

/**
 * Erstellt ein neues Reading mit Version 1
 */
export async function createReadingV2JSON(
  coachId: string,
  reading: {
    reading_type: string;
    client_name: string;
    version: ReadingVersion;
  }
): Promise<ReadingV2JSON> {
  const supabase = createClient();

  const readingData: ReadingDataV2 = {
    currentVersionId: reading.version.id,
    versions: [reading.version],
  };

  // Status bestimmen
  const status = reading.version.status === 'success' ? 'completed' : reading.version.status === 'error' ? 'error' : 'pending';

  const { data, error } = await supabase
    .from('coach_readings')
    .insert({
      coach_id: coachId,
      reading_type: reading.reading_type,
      client_name: reading.client_name,
      reading_data: readingData,
      status: status,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Erstellen des Reading v2 JSON:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: coach_readings');
  }

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    client_name: data.client_name,
    status: data.status as 'pending' | 'completed' | 'error',
    reading_data: data.reading_data as ReadingDataV2,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Lädt ein Reading mit allen Versionen
 */
export async function getReadingV2JSONById(
  coachId: string,
  readingId: string
): Promise<ReadingV2JSON | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('coach_readings')
    .select('*')
    .eq('id', readingId)           // PRIMARY KEY garantiert Eindeutigkeit
    .eq('coach_id', coachId)       // Ownership-Filter
    .is('deleted_at', null)         // Soft-Delete-Filter
    .maybeSingle();                 // ✅ Tolerant: 0 oder 1 Row (verhindert PGRST116 bei Race Conditions)

  if (error) {
    console.error('Fehler beim Laden des Reading v2 JSON:', error);
    return null;
  }

  if (!data) {
    return null; // Nicht gefunden
  }

  // Prüfe ob reading_data die neue Struktur hat
  const readingData = data.reading_data as any;
  if (!readingData || !readingData.versions || !Array.isArray(readingData.versions)) {
    // Legacy-Format - migriere zu neuem Format
    const legacyData = readingData || {};
    const legacyVersion: ReadingVersion = {
      id: randomUUID(),
      createdAt: data.created_at,
      readingTypeKey: data.reading_type,
      schemaVersion: '1.0.0',
      input: legacyData.input || {},
      mcpPayload: legacyData.mcpPayload || {},
      mcpResponseRaw: legacyData.mcpResponseRaw || null,
      generatedText: legacyData.generatedText || null,
      status: data.status === 'completed' ? 'success' : data.status === 'error' ? 'error' : 'empty',
      error: legacyData.error,
      meta: {
        agent: legacyData.meta?.agent || 'reading',
        mcpType: legacyData.meta?.mcpType || data.reading_type,
        requestId: legacyData.meta?.requestId || randomUUID(),
      },
    };

    const migratedData: ReadingDataV2 = {
      currentVersionId: legacyVersion.id,
      versions: [legacyVersion],
    };

    // Update Reading mit migrierter Struktur
    await updateReadingV2JSON(coachId, readingId, {
      reading_data: migratedData,
    });

    return {
      id: data.id,
      coach_id: data.coach_id,
      reading_type: data.reading_type,
      client_name: data.client_name,
      status: data.status as 'pending' | 'completed' | 'error',
      reading_data: migratedData,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  // Status aus aktueller Version ableiten
  const currentVersion = readingData.versions.find((v: ReadingVersion) => v.id === readingData.currentVersionId);
  const status = currentVersion?.status === 'success' ? 'completed' : currentVersion?.status === 'error' ? 'error' : 'pending';

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    client_name: data.client_name,
    status: status,
    reading_data: readingData,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Fügt eine neue Version zu einem Reading hinzu
 */
export async function addVersionToReadingV2JSON(
  coachId: string,
  readingId: string,
  newVersion: ReadingVersion
): Promise<ReadingV2JSON> {
  const supabase = createClient();

  // Lade aktuelles Reading
  const current = await getReadingV2JSONById(coachId, readingId);
  if (!current) {
    throw new Error('Reading nicht gefunden');
  }

  // Neue Version hinzufügen
  const updatedReadingData: ReadingDataV2 = {
    currentVersionId: newVersion.id,
    versions: [...current.reading_data.versions, newVersion],
  };

  // Status aus neuer Version ableiten
  const status = newVersion.status === 'success' ? 'completed' : newVersion.status === 'error' ? 'error' : 'pending';

  const { data, error } = await supabase
    .from('coach_readings')
    .update({
      reading_data: updatedReadingData,
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', readingId)           // PRIMARY KEY garantiert Eindeutigkeit
    .eq('coach_id', coachId)       // Ownership-Filter
    .select()
    .maybeSingle();                 // ✅ Tolerant: verhindert PGRST116 bei Race Conditions

  if (error || !data) {
    console.error('Fehler beim Hinzufügen der Version:', error);
    throw new Error(error?.message || 'Fehler beim Aktualisieren des Readings');
  }

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    client_name: data.client_name,
    status: data.status as 'pending' | 'completed' | 'error',
    reading_data: updatedReadingData,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Aktualisiert ein Reading (z.B. currentVersionId ändern)
 */
export async function updateReadingV2JSON(
  coachId: string,
  readingId: string,
  updates: {
    reading_data?: ReadingDataV2;
    status?: 'pending' | 'completed' | 'error';
  }
): Promise<ReadingV2JSON> {
  const supabase = createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.reading_data !== undefined) {
    updateData.reading_data = updates.reading_data;
  }

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  const { data, error } = await supabase
    .from('coach_readings')
    .update(updateData)
    .eq('id', readingId)           // PRIMARY KEY garantiert Eindeutigkeit
    .eq('coach_id', coachId)       // Ownership-Filter
    .select()
    .maybeSingle();                 // ✅ Tolerant: verhindert PGRST116 bei Race Conditions

  if (error || !data) {
    console.error('Fehler beim Aktualisieren des Reading v2 JSON:', error);
    throw new Error(error?.message || 'Fehler beim Aktualisieren des Readings');
  }

  const readingData = data.reading_data as ReadingDataV2;
  const currentVersion = readingData.versions.find((v) => v.id === readingData.currentVersionId);
  const status = currentVersion?.status === 'success' ? 'completed' : currentVersion?.status === 'error' ? 'error' : 'pending';

  return {
    id: data.id,
    coach_id: data.coach_id,
    reading_type: data.reading_type,
    client_name: data.client_name,
    status: status,
    reading_data: readingData,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}


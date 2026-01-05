/**
 * Get Reading Versions - Domain Function
 * 
 * Lädt Reading-Versionen aus der Datenbank.
 */

import { createClient } from '@/lib/supabase/server';

export interface ReadingVersion {
  id: string;
  reading_id: string;
  reading_type: string;
  version_number: number;
  mcp_agent: string;
  prompt_id: string | null;
  prompt_version: string | null;
  generated_text: string | null;
  status: string;
  created_at: string;
}

/**
 * Lädt alle Versionen für eine reading_id
 * Sortiert nach version_number DESC (neueste zuerst)
 */
export async function getReadingVersions(
  readingId: string
): Promise<ReadingVersion[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_versions')
    .select('id, reading_id, reading_type, version_number, mcp_agent, prompt_id, prompt_version, generated_text, status, created_at')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false });

  if (error) {
    throw new Error(`Fehler beim Laden der Reading-Versionen: ${error.message}`);
  }

  return (data || []) as ReadingVersion[];
}

/**
 * Lädt die neueste Version (höchste version_number) für eine reading_id
 * Verwendet current_version_id falls verfügbar, sonst die neueste Version
 * Gibt null zurück, wenn keine Version existiert
 */
export async function getLatestReadingVersion(
  readingId: string
): Promise<ReadingVersion | null> {
  const supabase = createClient();

  // Lade zuerst das Reading, um current_version_id zu prüfen
  const { data: reading, error: readingError } = await supabase
    .from('coach_readings')
    .select('current_version_id')
    .eq('id', readingId)
    .single();

  if (readingError) {
    if (readingError.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Fehler beim Laden des Readings: ${readingError.message}`);
  }

  // Wenn current_version_id vorhanden ist, lade diese Version
  if (reading?.current_version_id) {
    const { data: version, error: versionError } = await supabase
      .from('reading_versions')
      .select('id, reading_id, reading_type, version_number, mcp_agent, prompt_id, prompt_version, generated_text, status, created_at')
      .eq('id', reading.current_version_id)
      .single();

    if (versionError) {
      if (versionError.code === 'PGRST116') {
        // current_version_id verweist auf nicht existierende Version, lade neueste
        console.warn(`current_version_id ${reading.current_version_id} existiert nicht, lade neueste Version`);
      } else {
        throw new Error(`Fehler beim Laden der Version über current_version_id: ${versionError.message}`);
      }
    } else if (version) {
      return version as ReadingVersion;
    }
  }

  // Fallback: Lade neueste Version über reading_id
  const { data: versions, error: versionsError } = await supabase
    .from('reading_versions')
    .select('id, reading_id, reading_type, version_number, mcp_agent, prompt_id, prompt_version, generated_text, status, created_at')
    .eq('reading_id', readingId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionsError) {
    throw new Error(`Fehler beim Laden der neuesten Reading-Version: ${versionsError.message}`);
  }

  if (!versions || versions.length === 0) {
    return null;
  }

  return versions[0] as ReadingVersion;
}


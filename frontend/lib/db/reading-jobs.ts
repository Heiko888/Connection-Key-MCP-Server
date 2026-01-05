/**
 * Reading Jobs Datenbank-Service
 * 
 * Verwaltet asynchrone MCP-Generierungs-Jobs.
 * Single Source of Truth für Jobstatus.
 */

import { createClient } from '@/lib/supabase/server';

export interface ReadingJob {
  id: string;
  reading_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Erstellt einen neuen Job für ein Reading
 */
export async function createReadingJob(readingId: string): Promise<ReadingJob> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reading_jobs')
    .insert({
      reading_id: readingId,
      status: 'pending',
    })
    .select()
    .maybeSingle();

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle oder Spalte existiert nicht)
    if (error.message?.includes('does not exist') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: reading_jobs Tabelle oder Spalte existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'reading_jobs' oder die Spalte 'reading_id' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-reading-jobs-table.sql' aus.`
      );
    }
    console.error('Fehler beim Erstellen des Reading-Jobs:', error);
    throw new Error(`Fehler beim Erstellen des Reading-Jobs: ${error.message}`);
  }

  if (!data) {
    throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: reading_jobs');
  }

  return data;
}

/**
 * Holt einen Job anhand der ID
 */
export async function getReadingJobById(jobId: string): Promise<ReadingJob | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reading_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.error('[PGRST116 TRACE] reading-jobs.ts:68', {
        file: 'reading-jobs.ts',
        fn: 'getReadingJobById',
        line: 68,
        queryContext: {
          table: 'reading_jobs',
          filter: { id: jobId },
          method: 'single()',
        },
        error: error,
      });
      console.error(new Error('PGRST116 STACK').stack);
      return null; // Nicht gefunden
    }
    // Prüfe ob es ein Schema-Fehler ist (Tabelle oder Spalte existiert nicht)
    if (error.message?.includes('does not exist') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: reading_jobs Tabelle oder Spalte existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'reading_jobs' oder die Spalte 'reading_id' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-reading-jobs-table.sql' aus.`
      );
    }
    console.error('Fehler beim Laden des Reading-Jobs:', error);
    throw new Error(`Fehler beim Laden des Reading-Jobs: ${error.message}`);
  }

  return data;
}

/**
 * Holt den aktiven Job für ein Reading
 */
export async function getActiveReadingJob(readingId: string): Promise<ReadingJob | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reading_jobs')
    .select('*')
    .eq('reading_id', readingId)
    .in('status', ['pending', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle oder Spalte existiert nicht)
    if (error.message?.includes('does not exist') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: reading_jobs Tabelle oder Spalte existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'reading_jobs' oder die Spalte 'reading_id' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-reading-jobs-table.sql' aus.`
      );
    }
    console.error('Fehler beim Laden des aktiven Reading-Jobs:', error);
    throw new Error(`Fehler beim Laden des aktiven Reading-Jobs: ${error.message}`);
  }

  return data;
}

/**
 * Aktualisiert einen Job
 */
export async function updateReadingJob(
  jobId: string,
  updates: {
    status?: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number | null;
    error?: string | null;
  }
): Promise<ReadingJob> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reading_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle oder Spalte existiert nicht)
    if (error.message?.includes('does not exist') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: reading_jobs Tabelle oder Spalte existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'reading_jobs' oder die Spalte 'reading_id' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-reading-jobs-table.sql' aus.`
      );
    }
    console.error('Fehler beim Aktualisieren des Reading-Jobs:', error);
    throw new Error(`Fehler beim Aktualisieren des Reading-Jobs: ${error.message}`);
  }

  return data;
}

/**
 * Prüft ob ein aktiver Job für ein Reading existiert
 */
export async function hasActiveReadingJob(readingId: string): Promise<boolean> {
  const job = await getActiveReadingJob(readingId);
  return job !== null;
}


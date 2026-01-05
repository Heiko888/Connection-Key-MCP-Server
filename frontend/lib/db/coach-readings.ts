/**
 * Coach Readings Datenbank-Service
 * CRUD-Operationen für Coach Readings in Supabase
 */

import { createClient } from '@/lib/supabase/server';

export interface CoachReading {
  id: string;
  coach_id: string;
  reading_type: string;
  client_name: string;
  status: 'pending' | 'zoom-scheduled' | 'completed' | 'approved';
  approval_status?: 'draft' | 'ai_reviewed' | 'approved' | 'revision_required';
  client_status?: 'internal' | 'shared' | 'client_viewed' | 'client_commented' | 'client_approved';
  reading_data: any;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CoachReadingStats {
  total: number;
  pending: number;
  zoomScheduled: number;
  completed: number;
  approved: number;
}

export interface CoachReadingFilters {
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Holt alle Readings für einen Coach
 */
export async function getCoachReadings(
  coachId: string,
  filters?: CoachReadingFilters
): Promise<CoachReading[]> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('coach_readings')
      .select('*')
      .eq('coach_id', coachId)
      .is('deleted_at', null);

    // Filter nach Status
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Sortierung
    const sortBy = filters?.sortBy || 'created_at';
    const order = filters?.order || 'desc';
    query = query.order(sortBy, { ascending: order === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Fehler beim Abrufen der Coach-Readings:', error);
      throw error;
    }

    return (data || []) as CoachReading[];
  } catch (error) {
    console.error('Fehler in getCoachReadings:', error);
    throw error;
  }
}

/**
 * Holt ein einzelnes Reading
 */
export async function getCoachReadingById(
  coachId: string,
  readingId: string
): Promise<CoachReading | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', readingId)           // PRIMARY KEY garantiert Eindeutigkeit
      .eq('coach_id', coachId)       // Ownership-Filter
      .is('deleted_at', null)         // Soft-Delete-Filter
      .maybeSingle();                 // ✅ Tolerant: 0 oder 1 Row (verhindert PGRST116 bei Race Conditions)

    if (error) {
      console.error('Fehler beim Abrufen des Coach-Readings:', error);
      return null;
    }

    if (!data) {
      return null; // Nicht gefunden
    }

    // Debug: Prüfe ob generatedText im geladenen Reading vorhanden ist
    console.log('📖 Coach Reading aus Supabase geladen:', {
      id: data.id,
      hasReadingData: !!data.reading_data,
      hasGeneratedText: !!data.reading_data?.generatedText,
      generatedTextLength: data.reading_data?.generatedText?.length || 0,
      readingDataType: typeof data.reading_data,
      readingDataIsObject: data.reading_data instanceof Object,
      readingDataKeys: data.reading_data ? Object.keys(data.reading_data) : [],
      generatedTextPreview: data.reading_data?.generatedText?.substring(0, 100) || 'KEIN TEXT',
    });

    return data as CoachReading;
  } catch (error) {
    console.error('Fehler in getCoachReadingById:', error);
    throw error;
  }
}

/**
 * Erstellt ein neues Reading
 */
export async function createCoachReading(
  coachId: string,
  reading: {
    reading_type: string;
    client_name: string;
    reading_data: any;
    status?: string;
  }
): Promise<CoachReading> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('coach_readings')
      .insert({
        coach_id: coachId,
        reading_type: reading.reading_type,
        client_name: reading.client_name,
        reading_data: reading.reading_data,
        status: (reading.status || 'pending') as any,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Fehler beim Erstellen des Coach-Readings:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Insert returned 0 rows (likely RLS/RETURNING issue) - Tabelle: coach_readings');
    }

    // Debug: Prüfe ob generatedText im gespeicherten Reading vorhanden ist
    console.log('💾 Coach Reading in Supabase gespeichert:', {
      id: data.id,
      hasReadingData: !!data.reading_data,
      hasGeneratedText: !!data.reading_data?.generatedText,
      generatedTextLength: data.reading_data?.generatedText?.length || 0,
      readingDataType: typeof data.reading_data,
      readingDataIsObject: data.reading_data instanceof Object,
    });

    return data as CoachReading;
  } catch (error) {
    console.error('Fehler in createCoachReading:', error);
    throw error;
  }
}

/**
 * Aktualisiert ein Reading
 */
export async function updateCoachReading(
  coachId: string,
  readingId: string,
  updates: {
    reading_type?: string;
    client_name?: string;
    reading_data?: any;
    status?: string;
    approval_status?: 'draft' | 'ai_reviewed' | 'approved' | 'revision_required';
    client_status?: 'internal' | 'shared' | 'client_viewed' | 'client_commented' | 'client_approved';
    cost_summary?: {
      total_tokens: number;
      total_cost: number;
      generation_count: number;
      avg_duration_ms: number;
    };
  }
): Promise<CoachReading> {
  try {
    const supabase = createClient();
    
    // Wenn reading_data aktualisiert wird, merge es mit dem bestehenden
    if (updates.reading_data) {
      const existing = await getCoachReadingById(coachId, readingId);
      if (existing) {
        updates.reading_data = {
          ...existing.reading_data,
          ...updates.reading_data,
        };
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.reading_type !== undefined) {
      updateData.reading_type = updates.reading_type;
    }
    if (updates.client_name !== undefined) {
      updateData.client_name = updates.client_name;
    }
    if (updates.reading_data !== undefined) {
      updateData.reading_data = updates.reading_data;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.approval_status !== undefined) {
      updateData.approval_status = updates.approval_status;
    }
    if (updates.client_status !== undefined) {
      updateData.client_status = updates.client_status;
    }
    if (updates.cost_summary !== undefined) {
      updateData.cost_summary = updates.cost_summary;
    }

    // Führe Update durch
    const { error: updateError } = await supabase
      .from('coach_readings')
      .update(updateData)
      .eq('id', readingId)
      .eq('coach_id', coachId);

    if (updateError) {
      console.error('Fehler beim Aktualisieren des Coach-Readings:', updateError);
      throw updateError;
    }

    // Lade das aktualisierte Reading separat (vermeidet "Cannot coerce" Fehler)
    const { data, error: selectError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', readingId)
      .eq('coach_id', coachId)
      .maybeSingle();

    if (selectError) {
      console.error('Fehler beim Laden des aktualisierten Coach-Readings:', selectError);
      // Wenn das Laden fehlschlägt, aber das Update erfolgreich war, werfen wir keinen Fehler
      // sondern geben die updateData als Fallback zurück
      return {
        id: readingId,
        coach_id: coachId,
        ...updateData,
      } as CoachReading;
    }

    if (!data) {
      throw new Error(`Reading ${readingId} nicht gefunden nach Update`);
    }

    return data as CoachReading;
  } catch (error) {
    console.error('Fehler in updateCoachReading:', error);
    throw error;
  }
}

/**
 * Löscht ein Reading (Soft Delete)
 */
export async function deleteCoachReading(
  coachId: string,
  readingId: string
): Promise<void> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('coach_readings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', readingId)
      .eq('coach_id', coachId);

    if (error) {
      console.error('Fehler beim Löschen des Coach-Readings:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fehler in deleteCoachReading:', error);
    throw error;
  }
}

/**
 * Holt Statistiken für einen Coach
 */
export async function getCoachReadingStats(
  coachId: string
): Promise<CoachReadingStats> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('coach_readings')
      .select('status')
      .eq('coach_id', coachId)
      .is('deleted_at', null);

    if (error) {
      console.error('Fehler beim Abrufen der Coach-Reading-Statistiken:', error);
      throw error;
    }

    const stats: CoachReadingStats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      zoomScheduled: data?.filter(r => r.status === 'zoom-scheduled').length || 0,
      completed: data?.filter(r => r.status === 'completed').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
    };

    return stats;
  } catch (error) {
    console.error('Fehler in getCoachReadingStats:', error);
    throw error;
  }
}


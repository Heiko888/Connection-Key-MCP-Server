/**
 * Reading Share Datenbank-Service
 * 
 * Verwaltet geteilte Readings mit Token-basiertem Zugriff.
 * Kontrolliertes Sharing für Kunden.
 */

import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export interface ReadingShare {
  id: string;
  reading_id: string;
  token: string;
  access_level: 'view' | 'comment';
  expires_at: string | null;
  max_views: number | null;
  views: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingShareInput {
  reading_id: string;
  access_level?: 'view' | 'comment';
  expires_at?: string | null;
  max_views?: number | null;
}

/**
 * Generiert einen kryptografisch sicheren Token (64 Zeichen)
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex'); // 64 Zeichen
}

/**
 * Erstellt einen neuen Share für ein Reading
 */
export async function createReadingShare(
  coachId: string,
  input: ReadingShareInput
): Promise<ReadingShare> {
  const supabase = createClient();

  const token = generateSecureToken();

  const { data, error } = await supabase
    .from('reading_share')
    .insert({
      reading_id: input.reading_id,
      token: token,
      access_level: input.access_level || 'view',
      expires_at: input.expires_at || null,
      max_views: input.max_views || null,
      views: 0,
      is_active: true,
      created_by: coachId,
    })
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen des Reading-Shares:', error);
    throw new Error(`Fehler beim Erstellen des Reading-Shares: ${error.message}`);
  }

  // Update client_status → shared
  await supabase
    .from('coach_readings')
    .update({ client_status: 'shared' })
    .eq('id', input.reading_id)
    .eq('coach_id', coachId);

  return data;
}

/**
 * Holt einen Share anhand des Tokens (öffentlicher Zugriff)
 */
export async function getReadingShareByToken(token: string): Promise<ReadingShare | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_share')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle(); // ✅ Tolerant: verhindert PGRST116 wenn kein Share gefunden wird

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Nicht gefunden
    }
    console.error('Fehler beim Laden des Reading-Shares:', error);
    throw new Error(`Fehler beim Laden des Reading-Shares: ${error.message}`);
  }

  // Prüfe Ablaufdatum
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null; // Abgelaufen
  }

  // Prüfe max_views
  if (data.max_views !== null && data.views >= data.max_views) {
    return null; // Max. Aufrufe erreicht
  }

  return data;
}

/**
 * Holt alle Shares für ein Reading (Coach-Zugriff)
 */
export async function getReadingShares(readingId: string, coachId: string): Promise<ReadingShare[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_share')
    .select('*')
    .eq('reading_id', readingId)
    .eq('created_by', coachId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Reading-Shares:', error);
    throw new Error(`Fehler beim Laden der Reading-Shares: ${error.message}`);
  }

  return data || [];
}

/**
 * Erhöht die View-Anzahl eines Shares
 */
export async function incrementShareViews(shareId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.rpc('increment_share_views', { share_id: shareId });

  if (error) {
    // Fallback: Manuelles Update
    const { data: share } = await supabase
      .from('reading_share')
      .select('views, reading_id')
      .eq('id', shareId)
      .single();

    if (share) {
      await supabase
        .from('reading_share')
        .update({ views: share.views + 1 })
        .eq('id', shareId);

      // Update client_status → client_viewed (beim ersten View)
      const { data: reading } = await supabase
        .from('coach_readings')
        .select('client_status')
        .eq('id', share.reading_id)
        .single();

      if (reading && reading.client_status === 'shared') {
        await supabase
          .from('coach_readings')
          .update({ client_status: 'client_viewed' })
          .eq('id', share.reading_id);
      }
    }
  }
}

/**
 * Deaktiviert einen Share
 */
export async function deactivateReadingShare(shareId: string, coachId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('reading_share')
    .update({ is_active: false })
    .eq('id', shareId)
    .eq('created_by', coachId);

  if (error) {
    console.error('Fehler beim Deaktivieren des Reading-Shares:', error);
    throw new Error(`Fehler beim Deaktivieren des Reading-Shares: ${error.message}`);
  }
}


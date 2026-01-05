/**
 * Reading Quality Datenbank-Service
 * 
 * Verwaltet Qualitätsbewertungen für Readings.
 * Mehrere Reviews pro Reading möglich (AI + Human).
 */

import { createClient } from '@/lib/supabase/server';

export interface ReadingQuality {
  id: string;
  reading_id: string;
  clarity: number;
  relevance: number;
  depth: number;
  tone: number;
  actionability: number;
  quality_score: number;
  reviewer_type: 'ai' | 'human';
  reviewer_id: string | null;
  comment: string | null;
  created_at: string;
}

export interface ReadingQualityInput {
  reading_id: string;
  clarity: number;
  relevance: number;
  depth: number;
  tone: number;
  actionability: number;
  reviewer_type: 'ai' | 'human';
  reviewer_id?: string | null;
  comment?: string | null;
}

/**
 * Berechnet den quality_score aus den Metriken
 */
export function calculateQualityScore(metrics: {
  clarity: number;
  relevance: number;
  depth: number;
  tone: number;
  actionability: number;
}): number {
  const sum = metrics.clarity + metrics.relevance + metrics.depth + metrics.tone + metrics.actionability;
  return Math.round((sum / 5) * 100) / 100; // Auf 2 Dezimalstellen gerundet
}

/**
 * Erstellt eine neue Quality-Bewertung
 */
export async function createReadingQuality(
  input: ReadingQualityInput
): Promise<ReadingQuality> {
  const supabase = createClient();

  const quality_score = calculateQualityScore({
    clarity: input.clarity,
    relevance: input.relevance,
    depth: input.depth,
    tone: input.tone,
    actionability: input.actionability,
  });

  const { data, error } = await supabase
    .from('reading_quality')
    .insert({
      reading_id: input.reading_id,
      clarity: input.clarity,
      relevance: input.relevance,
      depth: input.depth,
      tone: input.tone,
      actionability: input.actionability,
      quality_score: quality_score,
      reviewer_type: input.reviewer_type,
      reviewer_id: input.reviewer_id || null,
      comment: input.comment || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Fehler beim Erstellen der Quality-Bewertung:', error);
    throw new Error(`Fehler beim Erstellen der Quality-Bewertung: ${error.message}`);
  }

  return data;
}

/**
 * Holt alle Quality-Bewertungen für ein Reading
 */
export async function getReadingQualities(readingId: string): Promise<ReadingQuality[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_quality')
    .select('*')
    .eq('reading_id', readingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Quality-Bewertungen:', error);
    throw new Error(`Fehler beim Laden der Quality-Bewertungen: ${error.message}`);
  }

  return data || [];
}

/**
 * Holt die neueste Quality-Bewertung für ein Reading
 */
export async function getLatestReadingQuality(readingId: string): Promise<ReadingQuality | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_quality')
    .select('*')
    .eq('reading_id', readingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Laden der neuesten Quality-Bewertung:', error);
    throw new Error(`Fehler beim Laden der neuesten Quality-Bewertung: ${error.message}`);
  }

  return data;
}

/**
 * Holt die AI-Bewertung für ein Reading
 */
export async function getAIReadingQuality(readingId: string): Promise<ReadingQuality | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_quality')
    .select('*')
    .eq('reading_id', readingId)
    .eq('reviewer_type', 'ai')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Laden der AI-Quality-Bewertung:', error);
    throw new Error(`Fehler beim Laden der AI-Quality-Bewertung: ${error.message}`);
  }

  return data;
}

/**
 * Holt die Human-Bewertung für ein Reading
 */
export async function getHumanReadingQuality(readingId: string): Promise<ReadingQuality | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_quality')
    .select('*')
    .eq('reading_id', readingId)
    .eq('reviewer_type', 'human')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Fehler beim Laden der Human-Quality-Bewertung:', error);
    throw new Error(`Fehler beim Laden der Human-Quality-Bewertung: ${error.message}`);
  }

  return data;
}

/**
 * Berechnet Durchschnitts-Qualität für einen Reading-Typ
 */
export async function getAverageQualityByReadingType(readingType: string): Promise<number | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reading_quality')
    .select('quality_score')
    .in('reading_id', 
      supabase
        .from('coach_readings')
        .select('id')
        .eq('reading_type', readingType)
    );

  if (error || !data || data.length === 0) {
    return null;
  }

  const sum = data.reduce((acc, item) => acc + parseFloat(item.quality_score.toString()), 0);
  return Math.round((sum / data.length) * 100) / 100;
}

/**
 * MCP Usage Datenbank-Service
 * 
 * Verwaltet MCP-Usage-Tracking für Kostenkontrolle und Optimierung.
 */

import { createClient } from '@/lib/supabase/server';

export interface McpUsage {
  id: string;
  reading_id: string | null;
  coach_id: string;
  agent: string;
  prompt_version: string | null;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  duration_ms: number;
  success: boolean;
  error_code: string | null;
  created_at: string;
}

export interface McpUsageInput {
  reading_id?: string | null;
  coach_id: string;
  agent: string;
  prompt_version?: string | null;
  model?: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  duration_ms: number;
  success: boolean;
  error_code?: string | null;
}

/**
 * Erstellt einen neuen MCP-Usage-Eintrag
 */
export async function createMcpUsage(input: McpUsageInput): Promise<McpUsage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mcp_usage')
    .insert({
      reading_id: input.reading_id || null,
      coach_id: input.coach_id,
      agent: input.agent,
      prompt_version: input.prompt_version || null,
      model: input.model || null,
      input_tokens: input.input_tokens,
      output_tokens: input.output_tokens,
      total_tokens: input.total_tokens,
      estimated_cost_usd: input.estimated_cost_usd,
      duration_ms: input.duration_ms,
      success: input.success,
      error_code: input.error_code || null,
    })
    .select()
    .single();

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle existiert nicht)
    if (error.message?.includes('does not exist') || error.message?.includes('schema cache') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: mcp_usage Tabelle existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'mcp_usage' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-mcp-usage-table.sql' aus.`
      );
    }
    console.error('Fehler beim Erstellen des MCP-Usage-Eintrags:', error);
    throw new Error(`Fehler beim Erstellen des MCP-Usage-Eintrags: ${error.message}`);
  }

  // Update cost_summary im Reading (falls reading_id vorhanden)
  if (input.reading_id) {
    await updateReadingCostSummary(input.reading_id);
  }

  return data;
}

/**
 * Aktualisiert die cost_summary eines Readings
 */
async function updateReadingCostSummary(readingId: string): Promise<void> {
  const supabase = createClient();

  // Aggregiere Usage-Daten für dieses Reading
  const { data: usageData, error } = await supabase
    .from('mcp_usage')
    .select('total_tokens, estimated_cost_usd, duration_ms, success')
    .eq('reading_id', readingId);

  if (error || !usageData || usageData.length === 0) {
    return; // Keine Usage-Daten vorhanden
  }

  const totalTokens = usageData.reduce((sum, u) => sum + u.total_tokens, 0);
  const totalCost = usageData.reduce((sum, u) => sum + parseFloat(u.estimated_cost_usd.toString()), 0);
  const generationCount = usageData.filter((u) => u.success).length;
  const avgDurationMs = Math.round(
    usageData.reduce((sum, u) => sum + u.duration_ms, 0) / usageData.length
  );

  // Update cost_summary
  // Erstelle das JSON-Objekt explizit
  const costSummary = {
    total_tokens: totalTokens,
    total_cost: totalCost,
    generation_count: generationCount,
    avg_duration_ms: avgDurationMs,
  };

  try {
    // Versuche zuerst direktes Update ohne select (vermeidet "Cannot coerce" Fehler)
    const { error: updateError } = await supabase
      .from('coach_readings')
      .update({
        cost_summary: costSummary,
      })
      .eq('id', readingId);

    if (updateError) {
      // Wenn das Update fehlschlägt, loggen wir es, aber werfen keinen Fehler
      // (da dies eine Nebenfunktion ist und das Haupt-Insert bereits erfolgreich war)
      console.error('Fehler beim Aktualisieren der cost_summary:', {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        readingId,
        costSummary,
      });
      
      // Prüfe ob es ein JSONB-Konvertierungsfehler ist
      if (updateError.message?.includes('Cannot coerce') || updateError.message?.includes('JSON') || updateError.message?.includes('single JSON')) {
        console.warn('JSONB-Konvertierungsfehler bei cost_summary Update. Versuche alternative Methode...');
        
        // Alternative: Verwende RPC-Funktion oder SQL direkt
        // Oder: Versuche es mit expliziter JSON-String-Konvertierung
        try {
          // Versuche es mit expliziter JSON-String-Konvertierung
          const costSummaryJson = JSON.stringify(costSummary);
          
          // Verwende updateCoachReading als Fallback (ohne select().single() Problem)
          const { updateCoachReading } = await import('@/lib/db/coach-readings');
          // Lade zuerst die coach_id
          const { data: reading, error: readError } = await supabase
            .from('coach_readings')
            .select('coach_id')
            .eq('id', readingId)
            .maybeSingle();
          
          if (readError) {
            console.error('Fehler beim Laden der coach_id für Fallback:', readError);
            return; // Abbrechen, da wir die coach_id nicht laden konnten
          }
          
          if (reading) {
            // Verwende updateCoachReading, aber fange den Fehler ab
            try {
              await updateCoachReading(reading.coach_id, readingId, { cost_summary });
            } catch (fallbackUpdateError: any) {
              // Wenn auch das fehlschlägt, loggen wir es, aber werfen keinen Fehler
              console.error('Auch Fallback-Update mit updateCoachReading fehlgeschlagen:', {
                error: fallbackUpdateError,
                message: fallbackUpdateError?.message,
                readingId,
                coachId: reading.coach_id,
              });
            }
          }
        } catch (fallbackError) {
          console.error('Fehler im Fallback-Mechanismus:', fallbackError);
        }
      }
    }
  } catch (error) {
    // Catch-all für unerwartete Fehler
    console.error('Unerwarteter Fehler beim Aktualisieren der cost_summary:', error);
  }
}

/**
 * Holt Usage-Daten für einen Coach (mit Filtern)
 */
export async function getCoachMcpUsage(
  coachId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    readingType?: string;
    agent?: string;
  }
): Promise<McpUsage[]> {
  const supabase = createClient();

  let query = supabase
    .from('mcp_usage')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.agent) {
    query = query.eq('agent', filters.agent);
  }

  // Reading-Type-Filter (über JOIN)
  if (filters?.readingType) {
    query = query.in(
      'reading_id',
      supabase
        .from('coach_readings')
        .select('id')
        .eq('reading_type', filters.readingType)
    );
  }

  const { data, error } = await query;

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle existiert nicht)
    if (error.message?.includes('does not exist') || error.message?.includes('schema cache') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: mcp_usage Tabelle existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'mcp_usage' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-mcp-usage-table.sql' aus.`
      );
    }
    console.error('Fehler beim Laden der MCP-Usage-Daten:', error);
    throw new Error(`Fehler beim Laden der MCP-Usage-Daten: ${error.message}`);
  }

  return data || [];
}

/**
 * Berechnet Usage-Summary für einen Coach
 */
export async function getCoachUsageSummary(
  coachId: string,
  period?: 'today' | 'week' | 'month' | 'all'
): Promise<{
  totalCost: number;
  totalTokens: number;
  byReadingType: Record<string, { cost: number; tokens: number; count: number }>;
  byModel: Record<string, { cost: number; tokens: number; count: number }>;
  errorRate: number;
}> {
  const supabase = createClient();

  // Datum-Filter
  let startDate: string | undefined;
  if (period === 'today') {
    startDate = new Date().toISOString().split('T')[0];
  } else if (period === 'week') {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    startDate = date.toISOString();
  } else if (period === 'month') {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    startDate = date.toISOString();
  }

  let query = supabase
    .from('mcp_usage')
    .select('*')
    .eq('coach_id', coachId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  const { data: usageData, error } = await query;

  if (error) {
    // Prüfe ob es ein Schema-Fehler ist (Tabelle existiert nicht)
    if (error.message?.includes('does not exist') || error.message?.includes('schema cache') || error.code === '42P01' || error.code === '42703') {
      console.error('Datenbank-Schema-Fehler: mcp_usage Tabelle existiert nicht:', error);
      throw new Error(
        `Datenbank-Schema-Fehler: Die Tabelle 'mcp_usage' existiert nicht. ` +
        `Bitte führen Sie die SQL-Migration 'supabase-mcp-usage-table.sql' aus.`
      );
    }
    console.error('Fehler beim Laden der Usage-Summary:', error);
    throw new Error(`Fehler beim Laden der Usage-Summary: ${error.message}`);
  }

  if (!usageData || usageData.length === 0) {
    return {
      totalCost: 0,
      totalTokens: 0,
      byReadingType: {},
      byModel: {},
      errorRate: 0,
    };
  }

  // Aggregationen
  const totalCost = usageData.reduce((sum, u) => sum + parseFloat(u.estimated_cost_usd.toString()), 0);
  const totalTokens = usageData.reduce((sum, u) => sum + u.total_tokens, 0);
  const totalCalls = usageData.length;
  const failedCalls = usageData.filter((u) => !u.success).length;
  const errorRate = totalCalls > 0 ? (failedCalls / totalCalls) * 100 : 0;

  // Nach Reading-Type aggregieren
  const byReadingType: Record<string, { cost: number; tokens: number; count: number }> = {};
  for (const usage of usageData) {
    if (usage.reading_id) {
      // Lade Reading-Type
      const { data: reading, error: readingError } = await supabase
        .from('coach_readings')
        .select('reading_type')
        .eq('id', usage.reading_id)
        .maybeSingle(); // Verwende maybeSingle() statt single() für bessere Fehlerbehandlung

      if (readingError) {
        // Wenn das Reading nicht gefunden wurde oder ein Fehler auftrat, überspringe es
        console.warn(`Reading nicht gefunden für usage ${usage.id}:`, readingError);
        continue;
      }

      if (reading) {
        const type = reading.reading_type;
        if (!byReadingType[type]) {
          byReadingType[type] = { cost: 0, tokens: 0, count: 0 };
        }
        byReadingType[type].cost += parseFloat(usage.estimated_cost_usd.toString());
        byReadingType[type].tokens += usage.total_tokens;
        byReadingType[type].count += 1;
      }
    }
  }

  // Nach Modell aggregieren
  const byModel: Record<string, { cost: number; tokens: number; count: number }> = {};
  for (const usage of usageData) {
    const model = usage.model || 'unknown';
    if (!byModel[model]) {
      byModel[model] = { cost: 0, tokens: 0, count: 0 };
    }
    byModel[model].cost += parseFloat(usage.estimated_cost_usd.toString());
    byModel[model].tokens += usage.total_tokens;
    byModel[model].count += 1;
  }

  return {
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
    totalTokens,
    byReadingType,
    byModel,
    errorRate: Math.round(errorRate * 100) / 100,
  };
}


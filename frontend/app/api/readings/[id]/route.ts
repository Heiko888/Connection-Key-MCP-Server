/**
 * ============================================================================
 * LEGACY API - ADAPTER auf V2 System
 * ============================================================================
 * 
 * GET /api/readings/[id] - Lädt ein Reading
 * 
 * Öffentlicher Zugriff auf ein Reading (mit optionalem Token-Auth).
 * Read-only Ansicht für Kunden.
 * 
 * REGELN:
 * - Reiner Forwarder zu V2 System (coach_readings)
 * - Keine Business-Logik in diesem Adapter
 * - Nur Format-Transformation (Legacy → V2 Format)
 * - Einheitliche readingId = coach_readings.id
 * 
 * Liefert:
 * - coach_readings (Reading-Metadaten)
 * - current_version (aktuelle Version)
 * - versions (alle Versionen)
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getLastReadingVersion, getReadingVersions } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';
import { getPromptVersion } from '@/lib/prompts/promptRegistry';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type GetResponse =
  | {
      success: true;
      reading: {
        id: string;
        readingType: string;
        clientName: string;
        generatedText: string | null;
        createdAt: string;
        status?: string; // 'pending' | 'completed' | 'error'
        message?: string; // Für pending-Status
        promptVersion?: string;
        promptLabel?: string;
        versions?: Array<{
          id: string;
          versionNumber: number;
          createdAt: string;
          status: string;
        }>;
      };
    }
  | { success: false; error: string };

/**
 * Öffentlicher Zugriff auf ein Reading (mit optionalem Token-Auth)
 * 
 * Read-only Ansicht für Kunden.
 * KEIN Edit, KEIN Regenerate, KEIN Prompt-Auswahl.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token'); // Optional: Token für öffentlichen Zugriff

    if (!readingId) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // TODO [KRITISCH]: Token-Validierung für öffentlichen Zugriff implementieren
    // Für jetzt: Öffentlicher Zugriff (später mit Token-Auth erweitern)
    // Priorität: Hoch - Sicherheitsrelevant

    // Reading laden aus V2 System (coach_readings)
    // WICHTIG: Kein .single() ohne eindeutige Filter - nutze getCoachReadingById oder direkte Query mit .maybeSingle()
    const supabase = await createClient();
    
    // Nutze .maybeSingle() statt .single() um PGRST116 zu vermeiden
    const { data: reading, error: readingError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', readingId) // id ist PRIMARY KEY, daher eindeutig
      .maybeSingle();

    if (readingError) {
      console.error('[api/readings/[id]] Fehler beim Laden des Readings:', readingError);
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Fehler beim Laden des Readings' },
        { status: 500 }
      );
    }

    if (!reading) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // OPTION-B-GUARD: Prüfe ob current_version_id existiert
    // Wenn nicht, ist das Reading noch nicht vollständig generiert (Race Condition)
    if (!reading.current_version_id) {
      // Reading existiert, aber noch keine Version erstellt
      // Saubere, legacy-kompatible Response zurückgeben
      return NextResponse.json<GetResponse>({
        success: true,
        reading: {
          id: reading.id,
          readingType: reading.reading_type,
          clientName: reading.client_name,
          generatedText: null,
          createdAt: reading.created_at,
          status: 'pending',
          message: 'Reading wird gerade generiert',
        },
      });
    }

    // Version laden (letzte/aktuelle) - nur wenn current_version_id existiert
    const currentVersion = await getLastReadingVersion(readingId);

    if (!currentVersion) {
      // current_version_id existiert, aber Version nicht gefunden (inkonsistenter Zustand)
      // Fallback: Pending-Response
      return NextResponse.json<GetResponse>({
        success: true,
        reading: {
          id: reading.id,
          readingType: reading.reading_type,
          clientName: reading.client_name,
          generatedText: null,
          createdAt: reading.created_at,
          status: 'pending',
          message: 'Reading wird gerade generiert',
        },
      });
    }

    // Alle Versionen laden (für Versions-Liste)
    const allVersions = await getReadingVersions(readingId);

    // Prompt-Version-Info (falls vorhanden)
    let promptVersion: string | undefined;
    let promptLabel: string | undefined;
    if (currentVersion.prompt_id) {
      const parts = currentVersion.prompt_id.split('.');
      if (parts.length >= 2) {
        const readingType = parts[0];
        const promptVersionKey = parts[parts.length - 1];
        const promptData = getPromptVersion(readingType, promptVersionKey);
        if (promptData) {
          promptVersion = promptVersionKey;
          promptLabel = promptData.label;
        }
      }
    }

    // Response: Legacy-kompatibles Format + Versions-Liste
    return NextResponse.json<GetResponse>({
      success: true,
      reading: {
        id: reading.id, // Einheitliche readingId = coach_readings.id
        readingType: reading.reading_type,
        clientName: reading.client_name,
        generatedText: currentVersion.generated_text,
        createdAt: currentVersion.created_at,
        status: currentVersion.status === 'success' ? 'completed' : currentVersion.status === 'error' ? 'error' : 'pending',
        promptVersion,
        promptLabel,
        versions: allVersions.map(v => ({
          id: v.id,
          versionNumber: v.version_number,
          createdAt: v.created_at,
          status: v.status,
        })),
      },
    });
  } catch (error: any) {
    console.error('[api/readings/[id]] Fehler beim Laden des Readings:', error);
    return NextResponse.json<GetResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readingsStore } from '../store'; // Fallback
import { checkCoachAuth } from '@/lib/coach-auth';
import {
  getCoachReadingById,
  updateCoachReading,
  deleteCoachReading,
} from '@/lib/db/coach-readings';

export const runtime = 'nodejs';

// GET /api/coach/readings/[id] - Einzelnes Reading abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authentifizierung und Coach-Rechte prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    try {
      // ⚡ Versuche aus Supabase zu laden
      const reading = await getCoachReadingById(user.id, id);

      if (!reading) {
        return NextResponse.json(
          { error: 'Reading nicht gefunden' },
          { status: 404 }
        );
      }

      // Konvertiere für Kompatibilität
      const readingWithAliases = {
        ...reading,
        createdAt: reading.created_at,
        updatedAt: reading.updated_at,
      };

      console.log('📖 Reading aus Supabase geladen (API Route):', {
        id: reading.id,
        hasReadingData: !!reading.reading_data,
        hasGeneratedText: !!reading.reading_data?.generatedText,
        generatedTextLength: reading.reading_data?.generatedText?.length || 0,
        readingDataType: typeof reading.reading_data,
        readingDataKeys: reading.reading_data ? Object.keys(reading.reading_data) : [],
        generatedTextPreview: reading.reading_data?.generatedText?.substring(0, 100) || 'KEIN TEXT',
        agentStatus: reading.reading_data?.agentStatus,
      });

      return NextResponse.json(
        {
          success: true,
          reading: readingWithAliases,
        },
        { status: 200 }
      );
    } catch (dbError) {
      // ⚠️ Fallback auf In-Memory Store
      console.warn('⚠️ Supabase-Fehler, verwende In-Memory Store als Fallback:', dbError);
      
      const reading = readingsStore.find((r) => r.id === id);

      if (!reading) {
        return NextResponse.json(
          { error: 'Reading nicht gefunden' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          reading,
          _fallback: true, // Flag für Debugging
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Coach-Readings:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH /api/coach/readings/[id] - Reading aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Authentifizierung und Coach-Rechte prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    try {
      // ⚡ Versuche in Supabase zu aktualisieren
      const updatedReading = await updateCoachReading(user.id, id, body);

      // Konvertiere für Kompatibilität
      const readingWithAliases = {
        ...updatedReading,
        createdAt: updatedReading.created_at,
        updatedAt: updatedReading.updated_at,
      };

      return NextResponse.json(
        {
          success: true,
          reading: readingWithAliases,
        },
        { status: 200 }
      );
    } catch (dbError) {
      // ⚠️ Fallback auf In-Memory Store
      console.warn('⚠️ Supabase-Fehler, verwende In-Memory Store als Fallback:', dbError);
      
      const readingIndex = readingsStore.findIndex((r) => r.id === id);

      if (readingIndex === -1) {
        return NextResponse.json(
          { error: 'Reading nicht gefunden' },
          { status: 404 }
        );
      }

      const existingReading = readingsStore[readingIndex];
      const updatedReading = {
        ...existingReading,
        ...body,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (body.reading_data) {
        updatedReading.reading_data = {
          ...existingReading.reading_data,
          ...body.reading_data,
        };
      }

      readingsStore[readingIndex] = updatedReading;

      return NextResponse.json(
        {
          success: true,
          reading: updatedReading,
          _fallback: true, // Flag für Debugging
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Coach-Readings:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/coach/readings/[id] - Reading löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authentifizierung und Coach-Rechte prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    try {
      // ⚡ Versuche in Supabase zu löschen
      await deleteCoachReading(user.id, id);

      return NextResponse.json(
        {
          success: true,
          message: 'Reading erfolgreich gelöscht',
        },
        { status: 200 }
      );
    } catch (dbError) {
      // ⚠️ Fallback auf In-Memory Store
      console.warn('⚠️ Supabase-Fehler, verwende In-Memory Store als Fallback:', dbError);
      
      const readingIndex = readingsStore.findIndex((r) => r.id === id);

      if (readingIndex === -1) {
        return NextResponse.json(
          { error: 'Reading nicht gefunden' },
          { status: 404 }
        );
      }

      readingsStore.splice(readingIndex, 1);

      return NextResponse.json(
        {
          success: true,
          message: 'Reading erfolgreich gelöscht (Fallback)',
          _fallback: true, // Flag für Debugging
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Coach-Readings:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


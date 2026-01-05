import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId fehlt' },
        { status: 400 }
      );
    }

    // UUID-Format validieren
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(analysisId)) {
      return NextResponse.json(
        { error: 'Ungültiges UUID-Format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Lade Analyse-Daten
    const { data: analysis, error } = await supabase
      .from('resonanzanalysen')
      .select('*')
      .eq('id', analysisId)
      .eq('status', 'completed')
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analyse nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        analysis: {
          id: analysis.id,
          person1: analysis.person1_data,
          person2: analysis.person2_data,
          analysisMode: analysis.analysis_mode,
          result: analysis.analysis_result,
          status: analysis.status,
          created_at: analysis.created_at,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fehler beim Laden der Analyse:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      person1, 
      person2, 
      analysisResult, 
      analysisMode 
    } = body;

    if (!person1 || !analysisResult) {
      return NextResponse.json(
        { error: 'Person1 und analysisResult sind erforderlich' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prüfe ob User authentifiziert ist (optional für öffentliche Analysen)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Erstelle Analyse-Datensatz
    const { data: analysis, error } = await supabase
      .from('resonanzanalysen')
      .insert({
        user_id: userId,
        person1_data: person1,
        person2_data: person2 || null,
        analysis_mode: analysisMode || 'connection',
        analysis_result: analysisResult,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Fehler beim Speichern der Analyse:', error);
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Analyse' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        analysisId: analysis.id 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fehler beim Speichern:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

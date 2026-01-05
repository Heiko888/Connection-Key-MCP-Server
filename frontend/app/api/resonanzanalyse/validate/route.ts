import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId fehlt', valid: false },
        { status: 400 }
      );
    }

    // UUID-Format validieren
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(analysisId)) {
      return NextResponse.json(
        { error: 'Ungültiges UUID-Format', valid: false },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prüfe ob Analyse existiert und Status 'completed' hat
    const { data: analysis, error } = await supabase
      .from('resonanzanalysen')
      .select('id, status, created_at')
      .eq('id', analysisId)
      .eq('status', 'completed')
      .single();

    if (error || !analysis) {
      // Kein technischer Fehler, einfach ungültig
      return NextResponse.json(
        { valid: false, error: 'Analyse nicht gefunden oder nicht abgeschlossen' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        valid: true, 
        analysis: {
          id: analysis.id,
          status: analysis.status,
          created_at: analysis.created_at,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fehler bei Validierung:', error);
    return NextResponse.json(
      { valid: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

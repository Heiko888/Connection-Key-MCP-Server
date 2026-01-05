import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import {
  getCoachReadingById,
  updateCoachReading,
} from '@/lib/db/coach-readings';
import {
  generateConnectionReadingText,
  generateStandardReadingText,
  getAgentUrl,
} from '@/lib/agent/ck-agent';

export const runtime = 'nodejs';

// POST /api/coach/readings/[id]/regenerate - Reading-Text erneut generieren
export async function POST(
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

    // Lade das bestehende Reading
    const reading = await getCoachReadingById(user.id, id);

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    const readingData = reading.reading_data || {};
    const readingType = reading.reading_type;
    const clientName = reading.client_name;

    console.log('🔄 Starte Neugenerierung des Reading-Textes:', {
      readingId: id,
      readingType,
      clientName,
    });

    // Generiere Reading-Text mit CK-Agent
    let generatedText: string | null = null;
    const agentConfig = readingData.agentConfig || undefined;

    try {
      if (readingType === 'connection' && readingData.connectionKeys) {
        // Connection-Reading mit Connection Keys
        generatedText = await generateConnectionReadingText(
          clientName,
          readingData,
          readingData.connectionKeys.analysis,
          readingData.charts,
          agentConfig
        );
      } else if (readingType === 'penta' && readingData.pentaAnalysis && readingData.charts) {
        // Penta-Reading mit Penta-Analyse
        const { generatePentaReadingText } = await import('@/lib/agent/ck-agent');
        generatedText = await generatePentaReadingText(
          clientName,
          readingData,
          readingData.pentaAnalysis,
          readingData.charts,
          agentConfig
        );
      } else {
        // Standard-Reading
        generatedText = await generateStandardReadingText(
          readingType,
          clientName,
          readingData,
          agentConfig
        );
      }

      if (generatedText) {
        console.log('✅ Reading-Text erfolgreich regeneriert:', {
          length: generatedText.length,
          preview: generatedText.substring(0, 100) + '...',
        });

        // Aktualisiere das Reading mit dem neuen Text
        const updatedReading = await updateCoachReading(user.id, id, {
          reading_data: {
            ...readingData,
            generatedText,
            agentStatus: 'success',
            agentError: undefined,
            agentErrorDetails: undefined,
          },
        });

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
            message: 'Reading-Text erfolgreich regeneriert',
          },
          { status: 200 }
        );
      } else {
        console.warn('⚠️ Reading-Text konnte nicht regeneriert werden');
        
        // Aktualisiere Status, aber behalte den alten Text
        const updatedReading = await updateCoachReading(user.id, id, {
          reading_data: {
            ...readingData,
            agentStatus: 'failed',
            agentError: 'Der KI-Agent konnte den Reading-Text nicht generieren. Bitte prüfe, ob der Agent-Service läuft.',
            agentErrorDetails: (() => {
              const agentUrl = getAgentUrl();
              const isLocalhost = agentUrl.includes('localhost') || agentUrl.includes('127.0.0.1');
              const isDockerService = agentUrl.includes('ck-agent:4000');
              
              let details = `Der Agent-Service ist möglicherweise nicht erreichbar. Prüfe die Umgebungsvariable CK_AGENT_URL (Standard: ${agentUrl}).`;
              
              if (isLocalhost) {
                details += `\n\nLokale Entwicklung:\n- Stelle sicher, dass der Agent auf ${agentUrl} läuft\n- Starte den Agent mit: cd ck-agent && node server.js`;
              } else if (isDockerService) {
                details += `\n\nDocker-Umgebung:\n- Prüfe mit: docker compose ps ck-agent\n- Starte mit: docker compose up -d ck-agent`;
              } else {
                details += `\n\nProduktionsumgebung:\n- Prüfe ob der Agent-Service auf ${agentUrl} erreichbar ist`;
              }
              
              return details;
            })(),
          },
        });

        const readingWithAliases = {
          ...updatedReading,
          createdAt: updatedReading.created_at,
          updatedAt: updatedReading.updated_at,
        };

        return NextResponse.json(
          {
            success: false,
            reading: readingWithAliases,
            error: 'Reading-Text konnte nicht generiert werden',
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('⚠️ Fehler bei Reading-Text-Regenerierung:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      // Aktualisiere Status mit Fehler
      const updatedReading = await updateCoachReading(user.id, id, {
        reading_data: {
          ...readingData,
          agentStatus: 'error',
          agentError: `Agent-Fehler: ${errorMessage}`,
          agentErrorDetails: error instanceof Error 
            ? `Fehlertyp: ${error.name}. Bitte prüfe die Server-Logs für Details.`
            : 'Unbekannter Fehler beim Aufruf des KI-Agenten.',
        },
      });

      const readingWithAliases = {
        ...updatedReading,
        createdAt: updatedReading.created_at,
        updatedAt: updatedReading.updated_at,
      };

      return NextResponse.json(
        {
          success: false,
          reading: readingWithAliases,
          error: errorMessage,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Regenerieren des Reading-Textes:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


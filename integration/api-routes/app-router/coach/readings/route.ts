/**
 * Coach Readings API Route (App Router)
 * Route: /api/coach/readings
 * 
 * Erstellt Readings für Coaches
 * Unterstützt: single, connection, penta
 * Bei connection: Verwendet Relationship Analysis API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const RELATIONSHIP_ANALYSIS_AGENT_ID = 'relationship-analysis-agent';
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:7000';

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reading_type, client_name, reading_data } = body;

    // Validierung
    if (!reading_type) {
      return NextResponse.json({
        success: false,
        error: 'reading_type ist erforderlich (single, connection, penta)'
      }, { status: 400 });
    }

    if (!reading_data) {
      return NextResponse.json({
        success: false,
        error: 'reading_data ist erforderlich'
      }, { status: 400 });
    }

    // ============================================
    // CONNECTION MODE: Relationship Analysis API
    // ============================================
    if (reading_type === 'connection' || reading_type === 'connectionKey') {
      const rd = reading_data;
      
      // Validierung für Connection
      if (!rd.personA || !rd.personB) {
        return NextResponse.json({
          success: false,
          error: 'personA und personB sind erforderlich für connection readings'
        }, { status: 400 });
      }

      // Transformiere Daten in Relationship Analysis Format
      const person1 = {
        name: rd.personA.name || 'Person A',
        birthDate: rd.personA.geburtsdatum || rd.personA.birthDate,
        birthTime: rd.personA.geburtszeit || rd.personA.birthTime,
        birthPlace: rd.personA.geburtsort || rd.personA.birthPlace,
      };

      const person2 = {
        name: rd.personB.name || 'Person B',
        birthDate: rd.personB.geburtsdatum || rd.personB.birthDate,
        birthTime: rd.personB.geburtszeit || rd.personB.birthTime,
        birthPlace: rd.personB.geburtsort || rd.personB.birthPlace,
      };

      // Validierung
      if (!person1.birthDate || !person1.birthTime || !person1.birthPlace) {
        return NextResponse.json({
          success: false,
          error: 'Person A: birthDate, birthTime und birthPlace sind erforderlich'
        }, { status: 400 });
      }

      if (!person2.birthDate || !person2.birthTime || !person2.birthPlace) {
        return NextResponse.json({
          success: false,
          error: 'Person B: birthDate, birthTime und birthPlace sind erforderlich'
        }, { status: 400 });
      }

      // Options aus reading_data extrahieren
      const options = {
        includeEscalation: rd.enabled_sections?.includes('eskalation') || rd.options?.includeEscalation || false,
        includePartnerProfile: rd.enabled_sections?.includes('partnerProfil') || rd.options?.includePartnerProfile || false,
      };

      // Erstelle Message für Relationship Analysis Agent
      let message = `Erstelle eine tiefe Beziehungsanalyse zwischen zwei Personen:\n\n`;
      
      message += `PERSON 1:\n`;
      message += `Name: ${person1.name}\n`;
      message += `Geburtsdatum: ${person1.birthDate}\n`;
      message += `Geburtszeit: ${person1.birthTime}\n`;
      message += `Geburtsort: ${person1.birthPlace}\n\n`;
      
      message += `PERSON 2:\n`;
      message += `Name: ${person2.name}\n`;
      message += `Geburtsdatum: ${person2.birthDate}\n`;
      message += `Geburtszeit: ${person2.birthTime}\n`;
      message += `Geburtsort: ${person2.birthPlace}\n\n`;
      
      message += `Analysiere:\n`;
      message += `1. Grundkonstellation (Typ-Dynamik, Profil, Autorität)\n`;
      message += `2. Zentren-Dynamik (elektromagnetisch, Kompromiss, Dominanz, etc.)\n`;
      message += `3. Trigger-Punkte (Sollbruchstellen, unbewusste Muster)\n`;
      message += `4. Nähe, Sexualität & Intimität\n`;
      message += `5. Beziehungs-Typ (Lebens-, Lern- oder Übergangsbeziehung)\n`;
      
      if (options.includeEscalation) {
        message += `6. Eskalationsebenen (Warum "zu viel", Trennungs-Trigger, Machtkonflikte, Identität, Kipppunkte, Nach-Trennung, Wiederannäherung, Integration, Abschluss)\n`;
      }
      
      if (options.includePartnerProfile) {
        message += `7. Partnerinnen-Profil für Person 1 (Kompatibilität, Red Flags, Green Flags, energetische Anziehung)\n`;
      }
      
      message += `\nLiefer eine strukturierte, ehrliche Analyse ohne romantische Verklärung.`;

      // Relationship Analysis Agent aufrufen
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 Minuten Timeout

      let response: Response;
      try {
        response = await fetch(`${MCP_SERVER_URL}/agent/${RELATIONSHIP_ANALYSIS_AGENT_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            userId: body.userId || 'anonymous'
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          return NextResponse.json({
            success: false,
            error: 'Relationship Analysis Agent request timeout after 5 minutes'
          }, { status: 504 });
        }
        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          success: false,
          error: `Relationship Analysis Agent request failed: ${response.status} ${errorText}`
        }, { status: response.status || 500 });
      }

      const agentResponse = await response.json();
      const analysisText = agentResponse.response || agentResponse.message || '';

      // Reading in Supabase speichern
      const { data: savedReading, error: saveError } = await supabase
        .from('readings')
        .insert([{
          user_id: body.userId || null,
          reading_type: 'connection',
          reading_text: analysisText,
          reading_data: {
            person1,
            person2,
            options,
            ...rd,
            generatedText: analysisText,
            agentStatus: 'completed',
            agent: RELATIONSHIP_ANALYSIS_AGENT_ID,
          },
          status: 'completed',
        }])
        .select()
        .single();

      if (saveError) {
        console.error('Supabase Save Error:', saveError);
        // Weiter machen, auch wenn Speichern fehlschlägt
      }

      // Response formatieren
      return NextResponse.json({
        success: true,
        reading: {
          id: savedReading?.id || `relationship-analysis-${Date.now()}`,
          reading_type: 'connection',
          reading_text: analysisText,
          reading_data: {
            person1,
            person2,
            options,
            ...rd,
            generatedText: analysisText,
            agentStatus: 'completed',
            sections: {
              grundkonstellation: 'Grundkonstellation',
              zentrenDynamik: 'Zentren-Dynamik',
              triggerPunkte: 'Trigger-Punkte',
              naeheSexualitaet: 'Nähe, Sexualität & Intimität',
              beziehungsTyp: 'Beziehungs-Typ',
              ...(options.includeEscalation && {
                eskalation: 'Eskalationsebenen'
              }),
              ...(options.includePartnerProfile && {
                partnerProfil: 'Partnerinnen-Profil'
              })
            },
            metadata: {
              person1,
              person2,
              options,
              timestamp: new Date().toISOString(),
              model: 'gpt-4',
              agent: RELATIONSHIP_ANALYSIS_AGENT_ID
            }
          },
          status: 'completed',
        },
        message: 'Relationship Analysis erfolgreich erstellt'
      });

    }

    // ============================================
    // SINGLE & PENTA MODE: Standard Reading Agent
    // ============================================
    // TODO: Implementiere Single und Penta Reading-Generierung
    // Für jetzt: Fehler zurückgeben
    return NextResponse.json({
      success: false,
      error: `Reading type '${reading_type}' wird noch nicht unterstützt. Bitte verwende 'connection' für Beziehungsanalysen.`
    }, { status: 501 });

  } catch (error: any) {
    console.error('Coach Readings API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Coach Readings API',
    endpoint: '/api/coach/readings',
    method: 'POST',
    description: 'Erstellt Readings für Coaches (single, connection, penta)',
    supportedTypes: {
      connection: 'Verwendet Relationship Analysis Agent',
      single: 'Wird noch implementiert',
      penta: 'Wird noch implementiert'
    }
  });
}




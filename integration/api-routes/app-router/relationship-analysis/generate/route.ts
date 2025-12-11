/**
 * Relationship Analysis Generate API Route (App Router)
 * Route: /api/relationship-analysis/generate
 * 
 * Erstellt tiefe Beziehungsanalysen zwischen zwei Personen
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const RELATIONSHIP_ANALYSIS_AGENT_ID = 'relationship-analysis-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { person1, person2, options, userId } = body;

    // Validierung
    if (!person1 || !person1.birthDate || !person1.birthTime || !person1.birthPlace) {
      return NextResponse.json({
        success: false,
        error: 'Person 1 Daten sind erforderlich (birthDate, birthTime, birthPlace)'
      }, { status: 400 });
    }

    if (!person2 || !person2.birthDate || !person2.birthTime || !person2.birthPlace) {
      return NextResponse.json({
        success: false,
        error: 'Person 2 Daten sind erforderlich (birthDate, birthTime, birthPlace)'
      }, { status: 400 });
    }

    // Erstelle Message für Relationship Analysis Agent
    let message = `Erstelle eine tiefe Beziehungsanalyse zwischen zwei Personen:\n\n`;
    
    message += `PERSON 1:\n`;
    message += `Name: ${person1.name || 'Person 1'}\n`;
    message += `Geburtsdatum: ${person1.birthDate}\n`;
    message += `Geburtszeit: ${person1.birthTime}\n`;
    message += `Geburtsort: ${person1.birthPlace}\n\n`;
    
    message += `PERSON 2:\n`;
    message += `Name: ${person2.name || 'Person 2'}\n`;
    message += `Geburtsdatum: ${person2.birthDate}\n`;
    message += `Geburtszeit: ${person2.birthTime}\n`;
    message += `Geburtsort: ${person2.birthPlace}\n\n`;
    
    message += `Analysiere:\n`;
    message += `1. Grundkonstellation (Typ-Dynamik, Profil, Autorität)\n`;
    message += `2. Zentren-Dynamik (elektromagnetisch, Kompromiss, Dominanz, etc.)\n`;
    message += `3. Trigger-Punkte (Sollbruchstellen, unbewusste Muster)\n`;
    message += `4. Nähe, Sexualität & Intimität\n`;
    message += `5. Beziehungs-Typ (Lebens-, Lern- oder Übergangsbeziehung)\n`;
    
    if (options?.includeEscalation) {
      message += `6. Eskalationsebenen (Warum "zu viel", Trennungs-Trigger, Machtkonflikte, Identität, Kipppunkte, Nach-Trennung, Wiederannäherung, Integration, Abschluss)\n`;
    }
    
    if (options?.includePartnerProfile) {
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
          userId: userId || 'anonymous'
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

    // Response formatieren
    const analysisResponse = {
      success: true,
      readingId: `relationship-analysis-${Date.now()}`,
      reading: analysisText,
      readingType: 'relationship-analysis',
      sections: {
        grundkonstellation: 'Grundkonstellation',
        zentrenDynamik: 'Zentren-Dynamik',
        triggerPunkte: 'Trigger-Punkte',
        naeheSexualitaet: 'Nähe, Sexualität & Intimität',
        beziehungsTyp: 'Beziehungs-Typ',
        ...(options?.includeEscalation && {
          eskalation: 'Eskalationsebenen'
        }),
        ...(options?.includePartnerProfile && {
          partnerProfil: 'Partnerinnen-Profil'
        })
      },
      metadata: {
        person1: {
          name: person1.name || 'Person 1',
          birthDate: person1.birthDate,
          birthTime: person1.birthTime,
          birthPlace: person1.birthPlace
        },
        person2: {
          name: person2.name || 'Person 2',
          birthDate: person2.birthDate,
          birthTime: person2.birthTime,
          birthPlace: person2.birthPlace
        },
        options,
        timestamp: new Date().toISOString(),
        model: 'gpt-4',
        agent: RELATIONSHIP_ANALYSIS_AGENT_ID
      }
    };

    return NextResponse.json(analysisResponse);

  } catch (error: any) {
    console.error('Relationship Analysis API Error:', error);
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
    message: 'Relationship Analysis API',
    endpoint: '/api/relationship-analysis/generate',
    method: 'POST',
    description: 'Erstellt tiefe Beziehungsanalysen zwischen zwei Personen basierend auf Human Design',
    requiredFields: {
      person1: {
        birthDate: 'YYYY-MM-DD',
        birthTime: 'HH:MM',
        birthPlace: 'string',
        name: 'string (optional)'
      },
      person2: {
        birthDate: 'YYYY-MM-DD',
        birthTime: 'HH:MM',
        birthPlace: 'string',
        name: 'string (optional)'
      }
    },
    optionalFields: {
      options: {
        includeEscalation: 'boolean (default: false)',
        includePartnerProfile: 'boolean (default: false)'
      },
      userId: 'string (optional)'
    }
  });
}

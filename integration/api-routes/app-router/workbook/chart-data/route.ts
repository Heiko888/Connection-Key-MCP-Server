/**
 * Workbook Chart Data API Route (App Router)
 * Route: /api/workbook/chart-data
 * 
 * Schnittstelle zwischen Workbook-System und Chart Architect Agent
 * Liefert Chart-Daten und SVG-Grafiken für Workbook (PDF/Web)
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const CHART_ARCHITECT_AGENT_ID = 'chart-architect-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chartType, birthData, options } = body;

    // Validierung
    if (!chartType || !birthData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'chartType and birthData are required',
          details: {
            required: ['chartType', 'birthData'],
            received: Object.keys(body)
          }
        }
      }, { status: 400 });
    }

    // Chart-Type Validierung
    if (!['single', 'dual', 'penta'].includes(chartType)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CHART_TYPE',
          message: 'chartType must be one of: single, dual, penta',
          details: {
            received: chartType,
            valid: ['single', 'dual', 'penta']
          }
        }
      }, { status: 400 });
    }

    // Birth-Data Validierung
    if (!birthData.person_A || !birthData.person_A.date || !birthData.person_A.time || !birthData.person_A.location) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_BIRTH_DATA',
          message: 'person_A must have date, time, and location',
          details: {
            required: ['date', 'time', 'location'],
            received: Object.keys(birthData.person_A || {})
          }
        }
      }, { status: 400 });
    }

    // Für Dual/Penta: Person_B Validierung
    if ((chartType === 'dual' || chartType === 'penta') && !birthData.person_B) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_PERSON_B',
          message: 'person_B is required for dual and penta charts',
          details: {
            chartType,
            required: ['person_B']
          }
        }
      }, { status: 400 });
    }

    // Erstelle Message für Chart Architect Agent
    let message = '';
    
    if (chartType === 'single') {
      message = `Erstelle ein Single-Bodygraph für:\n\nGeburtsdatum: ${birthData.person_A.date}\nGeburtszeit: ${birthData.person_A.time}\nGeburtsort: ${birthData.person_A.location}\n\nLiefer die Datenstruktur im Standard-Format (JSON) mit:\n- chart_id\n- person (name, birth)\n- type, authority, profile, definition\n- centers (definiert/undefiniert)\n- channels (aktiv/inaktiv)\n- gates (aktiviert)\n- incarnation_cross`;
      
      if (options?.includeSVG) {
        message += '\n\nErstelle auch ein SVG (Layer-basiert, zustandsfähig, für Workbook geeignet). SVG-Struktur:\n- Vollständiges SVG in "svg.full"\n- SVG-Layer in "svg_layers" (centers, channels, gates, person_A)';
      }
    } else if (chartType === 'dual') {
      message = `Erstelle ein Dual-Bodygraph (Connection Key) für:\n\nPerson A: ${birthData.person_A.date}, ${birthData.person_A.time}, ${birthData.person_A.location}\nPerson B: ${birthData.person_B.date}, ${birthData.person_B.time}, ${birthData.person_B.location}\n\nBerechne Verbindungen (elektromagnetisch, dominant, compromise, friendship) und liefer die Datenstruktur mit:\n- connection_chart_id\n- person_A (vollständige Chart-Daten)\n- person_B (vollständige Chart-Daten)\n- connections (Array mit Verbindungstypen)\n- composite_channels\n- defined_centers (gemeinsam/individuell)`;
      
      if (options?.includeSVG) {
        const mode = options.mode || 'dual-overlay';
        message += `\n\nErstelle auch ein SVG im ${mode}-Modus. SVG-Struktur:\n- Vollständiges SVG in "svg.full"\n- SVG-Layer in "svg_layers" (centers, channels, gates, person_A, person_B, connections)`;
      }
    } else if (chartType === 'penta') {
      const personCount = Object.keys(birthData).length;
      message = `Erstelle ein Penta-Chart für ${personCount} Personen:\n\n`;
      
      Object.entries(birthData).forEach(([personId, data]: [string, any]) => {
        message += `${personId}: ${data.date}, ${data.time}, ${data.location}\n`;
      });
      
      message += '\nBerechne gemeinsame Zentren, Kanäle und fehlende Energien. Liefer die Datenstruktur mit:\n- penta_id\n- participants (Array)\n- person_A, person_B, person_C, ... (vollständige Chart-Daten)\n- defined_centers (gemeinsam)\n- missing_centers\n- group_channels\n- penta_type\n- group_energy';
      
      if (options?.includeSVG) {
        message += '\n\nErstelle auch ein SVG im Penta-Modus. SVG-Struktur:\n- Vollständiges SVG in "svg.full"\n- SVG-Layer in "svg_layers" (centers, channels, gates, person_A, person_B, person_C, ..., connections, group_energy)';
      }
    }

    // Chart Architect Agent aufrufen
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 Minuten Timeout

    let response: Response;
    try {
      response = await fetch(`${MCP_SERVER_URL}/agent/${CHART_ARCHITECT_AGENT_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: body.userId || 'workbook'
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CHART_ARCHITECT_TIMEOUT',
            message: 'Chart Architect Agent request timeout after 180 seconds',
            details: {
              timeout: 180000,
              chartType
            }
          }
        }, { status: 504 });
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: {
          code: 'CHART_ARCHITECT_ERROR',
          message: 'Chart Architect Agent request failed',
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          }
        }
      }, { status: response.status || 500 });
    }

    const agentResponse = await response.json();
    
    // Parse Response (kann JSON-String oder Objekt sein)
    let chartData;
    try {
      const responseText = agentResponse.response || agentResponse.message || agentResponse;
      
      // Versuche JSON zu parsen
      if (typeof responseText === 'string') {
        // Versuche JSON-String zu extrahieren (kann in Markdown-Code-Blöcken sein)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/```\s*([\s\S]*?)\s*```/);
        
        if (jsonMatch) {
          chartData = JSON.parse(jsonMatch[1]);
        } else {
          // Versuche direkt zu parsen
          chartData = JSON.parse(responseText);
        }
      } else {
        chartData = responseText;
      }
    } catch (e) {
      // Falls kein JSON, verwende Response direkt (für Fehlerbehandlung)
      console.warn('Could not parse Chart Architect response as JSON:', e);
      chartData = {
        raw_response: agentResponse.response || agentResponse.message || agentResponse,
        parse_error: e instanceof Error ? e.message : 'Unknown parse error'
      };
    }

    // Response für Workbook formatieren
    const workbookResponse = {
      success: true,
      chart_id: chartData.chart_id || chartData.connection_chart_id || chartData.penta_id || `chart_${Date.now()}`,
      data: chartData,
      svg: chartData.svg?.full || chartData.svg || null,
      svg_layers: chartData.svg_layers || chartData.svg?.layers || null,
      metadata: {
        version: "1.0",
        generated_at: new Date().toISOString(),
        svg_standard: "layer-based-v1",
        chart_type: chartType,
        calculation_method: chartData.calculation_method || 'chart-architect-agent',
        compatibility: {
          workbook: ">=1.0",
          frontend: ">=1.0"
        }
      }
    };

    return NextResponse.json(workbookResponse);

  } catch (error: any) {
    console.error('Workbook Chart Data API Error:', error);

    // JSON Parse Error
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON in request body',
          details: {
            error: error.message
          }
        }
      }, { status: 400 });
    }

    // Allgemeiner Fehler
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: {
          error: error instanceof Error ? error.stack : String(error)
        }
      }
    }, { status: 500 });
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Workbook Chart Data API',
    endpoint: '/api/workbook/chart-data',
    method: 'POST',
    description: 'Schnittstelle zwischen Workbook-System und Chart Architect Agent',
    requiredFields: {
      chartType: 'single | dual | penta',
      birthData: {
        person_A: {
          date: 'YYYY-MM-DD',
          time: 'HH:MM',
          location: 'string'
        },
        person_B: {
          date: 'YYYY-MM-DD (required for dual/penta)',
          time: 'HH:MM',
          location: 'string'
        }
      }
    },
    optionalFields: {
      options: {
        includeSVG: 'boolean (default: false)',
        includeLayers: 'boolean (default: false)',
        includeData: 'boolean (default: true)',
        mode: 'string (for dual: dual-comparison | dual-overlay)'
      },
      userId: 'string (optional)'
    },
    responseFormat: {
      success: 'boolean',
      chart_id: 'string',
      data: 'object (Chart-Datenstruktur)',
      svg: 'string | null (vollständiges SVG)',
      svg_layers: 'object | null (modulare SVG-Layer)',
      metadata: 'object'
    },
    chartTypes: {
      single: 'Einzelner Bodygraph',
      dual: 'Connection Key (zwei Personen)',
      penta: 'Penta/Gruppen-Chart (3-5 Personen)'
    }
  });
}

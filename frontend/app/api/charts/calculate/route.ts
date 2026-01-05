import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { calculateHumanDesignChart, type ChartCalculationInput } from '@/lib/astro/chartCalculation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, birthPlace } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'Birth date and time are required' },
        { status: 400 }
      );
    }

    logger.apiCall('/api/charts/calculate', 'POST');

    // Bereite Input für Chart-Berechnung vor
    // Unterstützt sowohl Koordinaten als auch Ortsnamen (Geocoding)
    const chartInput: ChartCalculationInput = {
      birthDate, // Format: YYYY-MM-DD
      birthTime, // Format: HH:MM
      birthPlace: {
        latitude: birthPlace?.latitude,
        longitude: birthPlace?.longitude,
        timezone: birthPlace?.timezone,
        name: birthPlace?.name || (typeof birthPlace === 'string' ? birthPlace : undefined)
      }
    };

    // Berechne echtes Human Design Chart mit astronomy-engine
    const chart = await calculateHumanDesignChart(chartInput);

    logger.info('Chart calculation completed', { 
      type: chart.type, 
      profile: chart.profile,
      authority: chart.authority
    });

    // Response mit echten Daten
    return NextResponse.json({
      success: true,
      chart: {
        id: `chart-${Date.now()}`,
        ...chart,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Chart mit echten astronomischen Daten berechnet',
      source: 'astronomy-engine' // Kennzeichnung dass echte Berechnungen verwendet wurden
    });

  } catch (error) {
    logger.error('Chart calculation failed', error);
    
    // Detaillierte Fehlermeldung für besseres Debugging
    let errorMessage = 'Chart calculation failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Spezifische Fehlercodes
      if (error.message.includes('Invalid date') || error.message.includes('date')) {
        statusCode = 400;
        errorMessage = 'Ungültiges Datumsformat. Bitte verwende das Format JJJJ-MM-TT.';
      } else if (error.message.includes('time') || error.message.includes('Invalid time')) {
        statusCode = 400;
        errorMessage = 'Ungültiges Zeitformat. Bitte verwende das Format HH:MM.';
      } else if (error.message.includes('latitude') || error.message.includes('longitude') || error.message.includes('location')) {
        statusCode = 400;
        errorMessage = 'Ungültige Ortsangabe. Bitte überprüfe den Geburtsort.';
      } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        statusCode = 503;
        errorMessage = 'Verbindungsfehler. Bitte versuche es später erneut.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

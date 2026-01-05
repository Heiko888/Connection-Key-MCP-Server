import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.apiCall('/api/moon-calendar/current', 'GET');

    // Mock-Mondphase-Daten
    const currentMoonPhase = {
      id: 'current-moon',
      name: 'Zunehmender Halbmond',
      phase: 'waxing_gibbous',
      illumination: 0.75,
      age: 10.5, // Tage seit Neumond
      nextPhase: {
        name: 'Vollmond',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 Tage
        type: 'full_moon'
      },
      previousPhase: {
        name: 'Neumond',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 Tage
        type: 'new_moon'
      },
      zodiac: {
        sign: 'Widder',
        degree: 15.3
      },
      energy: {
        level: 'high',
        description: 'Zeit für Manifestation und Handlung',
        activities: [
          'Projekte vorantreiben',
          'Ziele verfolgen',
          'Energie nutzen',
          'Aktivitäten planen'
        ]
      },
      guidance: {
        personal: 'Nutzen Sie die zunehmende Energie für Ihre Projekte',
        relationships: 'Zeit für klare Kommunikation',
        health: 'Aktiv sein und Energie kanalisieren',
        spiritual: 'Meditation und Intention setzen'
      },
      timestamp: new Date().toISOString()
    };

    logger.info('Current moon phase fetched successfully', { 
      phase: currentMoonPhase.phase,
      illumination: currentMoonPhase.illumination 
    });

    return NextResponse.json({
      success: true,
      moonPhase: currentMoonPhase
    });

  } catch (error) {
    logger.error('Failed to fetch current moon phase', error);
    return NextResponse.json(
      { error: 'Failed to fetch current moon phase' },
      { status: 500 }
    );
  }
}

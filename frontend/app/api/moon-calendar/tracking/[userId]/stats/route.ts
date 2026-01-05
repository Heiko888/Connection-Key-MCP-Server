import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    logger.apiCall(`/api/moon-calendar/tracking/${userId}/stats`, 'GET');

    // Moon Tracking Statistiken aus Supabase berechnen
    const supabase = await createClient();
    const { data: trackingData, error } = await supabase
      .from('moon_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      logger.error('Fehler beim Laden der Moon Tracking Daten:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Moon Tracking Daten' },
        { status: 500 }
      );
    }

    if (!trackingData || trackingData.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          total_entries: 0,
          average_mood: 0,
          average_energy: 0,
          most_common_phase: null,
          phase_correlations: {}
        }
      });
    }

    // Statistiken berechnen
    const totalEntries = trackingData.length;
    const validMoods = trackingData.filter(d => d.mood !== null).map(d => d.mood);
    const validEnergies = trackingData.filter(d => d.energy !== null).map(d => d.energy);
    
    const averageMood = validMoods.length > 0 
      ? validMoods.reduce((sum, mood) => sum + mood, 0) / validMoods.length 
      : 0;
    
    const averageEnergy = validEnergies.length > 0 
      ? validEnergies.reduce((sum, energy) => sum + energy, 0) / validEnergies.length 
      : 0;

    // Häufigste Mondphase
    const phaseCounts: { [key: string]: number } = {};
    trackingData.forEach(entry => {
      if (entry.moon_phase) {
        phaseCounts[entry.moon_phase] = (phaseCounts[entry.moon_phase] || 0) + 1;
      }
    });
    
    const phaseKeys = Object.keys(phaseCounts);
    const mostCommonPhase = phaseKeys.length > 0 
      ? phaseKeys.reduce((a, b) => phaseCounts[a] > phaseCounts[b] ? a : b)
      : null;

    // Phase-Korrelationen
    const phaseCorrelations: { [key: string]: { mood: number; energy: number; count: number } } = {};
    Object.keys(phaseCounts).forEach(phase => {
      const phaseEntries = trackingData.filter(d => d.moon_phase === phase);
      const phaseMoods = phaseEntries.filter(d => d.mood !== null).map(d => d.mood);
      const phaseEnergies = phaseEntries.filter(d => d.energy !== null).map(d => d.energy);
      
      phaseCorrelations[phase] = {
        mood: phaseMoods.length > 0 ? phaseMoods.reduce((sum, mood) => sum + mood, 0) / phaseMoods.length : 0,
        energy: phaseEnergies.length > 0 ? phaseEnergies.reduce((sum, energy) => sum + energy, 0) / phaseEnergies.length : 0,
        count: phaseEntries.length
      };
    });

    const stats = {
      total_entries: totalEntries,
      average_mood: Math.round(averageMood * 10) / 10,
      average_energy: Math.round(averageEnergy * 10) / 10,
      most_common_phase: mostCommonPhase,
      phase_correlations: phaseCorrelations
    };

    logger.info('Moon Tracking Statistiken erfolgreich berechnet', { 
      user_id: userId, 
      total_entries: totalEntries 
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Failed to calculate moon tracking stats', error);
    return NextResponse.json(
      { error: 'Failed to calculate moon tracking stats' },
      { status: 500 }
    );
  }
}

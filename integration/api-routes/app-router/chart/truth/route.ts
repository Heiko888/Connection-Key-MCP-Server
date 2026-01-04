/**
 * Chart Truth API Route
 * Route: POST /api/chart/truth
 * 
 * Single Source of Truth für Chart-Berechnungen
 * Ruft ausschließlich getChartTruth() auf
 * Keine Berechnung, keine Interpretation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChartTruth, ChartTruthInput, ChartTruthOutput, getSupportedVersions } from '../../../../services/chart-truth/chartTruthService';
import { getSystemSupabaseClient } from '../../../../lib/supabase-clients';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung: Exakt das definierte Input-Format
    if (!body.birth_date || typeof body.birth_date !== 'string') {
      return NextResponse.json(
        { error: 'birth_date is required and must be a string (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (!body.birth_time || typeof body.birth_time !== 'string') {
      return NextResponse.json(
        { error: 'birth_time is required and must be a string (HH:MM)' },
        { status: 400 }
      );
    }

    if (typeof body.latitude !== 'number' || isNaN(body.latitude)) {
      return NextResponse.json(
        { error: 'latitude is required and must be a number' },
        { status: 400 }
      );
    }

    if (typeof body.longitude !== 'number' || isNaN(body.longitude)) {
      return NextResponse.json(
        { error: 'longitude is required and must be a number' },
        { status: 400 }
      );
    }

    if (!body.timezone || typeof body.timezone !== 'string') {
      return NextResponse.json(
        { error: 'timezone is required and must be a string (IANA timezone)' },
        { status: 400 }
      );
    }

    // Optional: chart_version validieren
    const supportedVersions = ['1.0.0', '1.1.0', '1.1.1'];
    if (body.chart_version && !supportedVersions.includes(body.chart_version)) {
      return NextResponse.json(
        { error: `Unsupported chart_version: ${body.chart_version}. Supported: ${supportedVersions.join(', ')}` },
        { status: 400 }
      );
    }

    // Input-Format (verbindlich, chart_version optional)
    const input: ChartTruthInput = {
      birth_date: body.birth_date,
      birth_time: body.birth_time,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      chart_version: body.chart_version || undefined // Optional, Default in Service
    };

    // Ruft ausschließlich getChartTruth() auf
    const chart = await getChartTruth(input);

    // Persistiere Chart in public_core.charts (Dedupe über input_hash + chart_version)
    const supabase = getSystemSupabaseClient();
    
    // Chart-JSON ohne calculated_at (calculated_at separat in DB)
    // Enthält: core, centers, channels, gates (stabil, kein calculated_at)
    const chartJson = {
      core: chart.core,
      centers: chart.centers,
      channels: chart.channels,
      gates: chart.gates
    };

    // Upsert: Dedupe über (input_hash, chart_version)
    // WICHTIG: Chart ist immutable - bei gleichem (input_hash, chart_version) wird existierender Datensatz wiederverwendet
    const { data: chartData, error: upsertError } = await supabase
      .schema('public_core')
      .from('charts')
      .upsert({
        input_hash: chart.input_hash,
        chart_version: chart.chart_version,
        input: chart.input,
        chart: chartJson,
        calculated_at: chart.calculated_at
      }, {
        onConflict: 'input_hash,chart_version'
      })
      .select('id')
      .single();

    if (upsertError) {
      console.error('Chart Persist Error:', upsertError);
      // Fehler bei Persistenz → Chart-Berechnung war erfolgreich, aber DB-Fehler
      // Gib Chart trotzdem zurück, aber ohne chart_id
      return NextResponse.json({
        ...chart,
        persisted: false,
        error: 'Chart calculation successful but persistence failed',
        details: upsertError.message
      }, { status: 500 });
    }

    // Chart erfolgreich persistiert (oder deduped)
    const chartId = chartData?.id;

    // Output erweitert um chart_id, persisted und engine
    const versionInfo = chart.chart_version ? {
      engine: chart.chart_version.startsWith('1.1') ? 'swiss-ephemeris' : 'astronomy-engine',
      version_status: chart.chart_version === '1.0.0' ? 'stable' : 
                      chart.chart_version === '1.1.0' ? 'experimental' : 'stable'
    } : {};

    return NextResponse.json({
      chart_id: chartId,
      persisted: true,
      ...versionInfo,
      ...chart
    });

  } catch (error: any) {
    // Fehler werden nicht verschluckt, sondern als 4xx/5xx zurückgegeben
    console.error('Chart Truth API Error:', error);

    // Input-Validierungsfehler → 400
    if (error.message && error.message.includes('Invalid input')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Berechnungsfehler → 500
    return NextResponse.json(
      { 
        error: 'Chart calculation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/chart/truth',
    method: 'POST',
    description: 'Single Source of Truth für Chart-Berechnungen',
    inputFormat: {
      birth_date: 'string (YYYY-MM-DD)',
      birth_time: 'string (HH:MM)',
      latitude: 'number',
      longitude: 'number',
      timezone: 'string (IANA, z.B. Europe/Berlin)',
      chart_version: 'string (optional, default: 1.0.0, supported: 1.0.0, 1.1.0, 1.1.1)'
    },
    supportedVersions: getSupportedVersions(),
    outputFormat: {
      chart_id: 'uuid (neu)',
      persisted: 'boolean (neu)',
      chart_version: 'string',
      calculated_at: 'string (ISO-8601)',
      input_hash: 'string (sha256)',
      input: 'ChartTruthInput',
      core: 'object',
      centers: 'object',
      channels: 'array',
      gates: 'object'
    },
    example: {
      birth_date: '1990-01-15',
      birth_time: '14:30',
      latitude: 52.52,
      longitude: 13.405,
      timezone: 'Europe/Berlin'
    }
  });
}

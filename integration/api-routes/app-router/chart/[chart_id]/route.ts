// API Route: GET /api/chart/{chart_id}
// Lädt Chart-Daten aus public_core.charts
// KEINE Berechnung, KEINE Ableitung, KEINE Defaults

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../../../../lib/supabase-clients';

// Supported Chart Versions
const SUPPORTED_VERSIONS = ['1.0.0'] as const;

// Chart Data Response Type
interface ChartResponse {
  chart_id: string;
  chart_version: string;
  chart_input_hash: string;
  chart_data: {
    core: {
      type: string;
      authority: string;
      strategy: string;
      profile: string;
      definition: string;
    };
    centers: {
      head: 'defined' | 'undefined';
      ajna: 'defined' | 'undefined';
      throat: 'defined' | 'undefined';
      g: 'defined' | 'undefined';
      heart: 'defined' | 'undefined';
      spleen: 'defined' | 'undefined';
      solar_plexus: 'defined' | 'undefined';
      sacral: 'defined' | 'undefined';
      root: 'defined' | 'undefined';
    };
    channels: Array<{
      number: number;
      gate1: number;
      gate2: number;
      name: string;
      defined: boolean;
    }>;
    gates: {
      [gateNumber: string]: {
        line: number;
        planet: string;
      };
    };
  };
  created_at: string;
}

// Error Response Types
interface ChartNotFoundError {
  error: 'CHART_NOT_FOUND';
  message: string;
  chart_id: string;
}

interface UnsupportedVersionError {
  error: 'UNSUPPORTED_VERSION';
  message: string;
  chart_id: string;
  chart_version: string;
  supported_versions: string[];
}

interface AccessDeniedError {
  error: 'ACCESS_DENIED';
  message: string;
  chart_id: string;
}

interface InternalError {
  error: 'INTERNAL_ERROR';
  message: string;
  chart_id: string;
}

/**
 * GET /api/chart/{chart_id}
 * 
 * Lädt Chart-Daten aus public_core.charts
 * 
 * @param request - NextRequest
 * @param params - Route params mit chart_id
 * @returns ChartResponse oder Error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { chart_id: string } }
) {
  const chartId = params.chart_id;

  // Validierung: chart_id muss UUID sein
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(chartId)) {
    return NextResponse.json<ChartNotFoundError>(
      {
        error: 'CHART_NOT_FOUND',
        message: `Invalid chart_id format: ${chartId}`,
        chart_id: chartId,
      },
      { status: 404 }
    );
  }

  try {
    // Lade Chart aus Supabase
    const supabase = getSystemSupabaseClient();
    const { data: chart, error } = await supabase
      .schema('public_core')
      .from('charts')
      .select('id, chart_version, input_hash, chart, created_at')
      .eq('id', chartId)
      .single();

    // Fehler: Chart nicht gefunden
    if (error || !chart) {
      return NextResponse.json<ChartNotFoundError>(
        {
          error: 'CHART_NOT_FOUND',
          message: `Chart with ID ${chartId} not found`,
          chart_id: chartId,
        },
        { status: 404 }
      );
    }

    // Validierung: Chart-Version unterstützt?
    if (!SUPPORTED_VERSIONS.includes(chart.chart_version as any)) {
      return NextResponse.json<UnsupportedVersionError>(
        {
          error: 'UNSUPPORTED_VERSION',
          message: `Chart version ${chart.chart_version} is not supported`,
          chart_id: chartId,
          chart_version: chart.chart_version,
          supported_versions: [...SUPPORTED_VERSIONS],
        },
        { status: 400 }
      );
    }

    // Validierung: Chart-Daten vorhanden?
    if (!chart.chart || typeof chart.chart !== 'object') {
      return NextResponse.json<InternalError>(
        {
          error: 'INTERNAL_ERROR',
          message: `Chart data is invalid for chart_id ${chartId}`,
          chart_id: chartId,
        },
        { status: 500 }
      );
    }

    // Chart-Daten validieren (minimal)
    const chartData = chart.chart as any;
    if (!chartData.core || !chartData.centers || !chartData.channels || !chartData.gates) {
      return NextResponse.json<InternalError>(
        {
          error: 'INTERNAL_ERROR',
          message: `Chart data structure is invalid for chart_id ${chartId}`,
          chart_id: chartId,
        },
        { status: 500 }
      );
    }

    // Response zusammenstellen
    const response: ChartResponse = {
      chart_id: chart.id,
      chart_version: chart.chart_version,
      chart_input_hash: chart.input_hash,
      chart_data: {
        core: chartData.core,
        centers: chartData.centers,
        channels: chartData.channels,
        gates: chartData.gates,
      },
      created_at: chart.created_at,
    };

    return NextResponse.json<ChartResponse>(response, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/chart/{chart_id}] Error:', error);
    return NextResponse.json<InternalError>(
      {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        chart_id: chartId,
      },
      { status: 500 }
    );
  }
}

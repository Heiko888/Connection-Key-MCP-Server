/**
 * API Route: Connection Keys Analysis
 * 
 * POST /api/connection-keys/analyze
 * 
 * Analyzes connection keys between two Human Design charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeConnectionKeys, type ChartInput } from '@/lib/human-design/connection-key-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personA, personB, personAId, personBId } = body;

    // Validate input
    if (!personA || !personB) {
      return NextResponse.json(
        { error: 'personA und personB sind erforderlich' },
        { status: 400 }
      );
    }

    if (!personA.gates || !Array.isArray(personA.gates)) {
      return NextResponse.json(
        { error: 'personA.gates muss ein Array sein' },
        { status: 400 }
      );
    }

    if (!personB.gates || !Array.isArray(personB.gates)) {
      return NextResponse.json(
        { error: 'personB.gates muss ein Array sein' },
        { status: 400 }
      );
    }

    // Prepare chart inputs
    const chartA: ChartInput = {
      gates: personA.gates,
      channels: personA.channels || [],
      type: personA.type,
      profile: personA.profile,
      authority: personA.authority,
      strategy: personA.strategy,
      centers: personA.centers
    };

    const chartB: ChartInput = {
      gates: personB.gates,
      channels: personB.channels || [],
      type: personB.type,
      profile: personB.profile,
      authority: personB.authority,
      strategy: personB.strategy,
      centers: personB.centers
    };

    // Analyze connection keys
    const result = analyzeConnectionKeys(
      chartA,
      chartB,
      personAId || 'personA',
      personBId || 'personB'
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in connection keys analysis:', error);
    return NextResponse.json(
      {
        error: 'Fehler bei der Connection-Key-Analyse',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


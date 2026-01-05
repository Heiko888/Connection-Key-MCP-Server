import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachUsageSummary } from '@/lib/db/mcp-usage';

export const runtime = 'nodejs';

type UsageSummaryResponse =
  | {
      success: true;
      summary: {
        totalCost: number;
        totalTokens: number;
        byReadingType: Record<string, { cost: number; tokens: number; count: number }>;
        byModel: Record<string, { cost: number; tokens: number; count: number }>;
        errorRate: number;
      };
    }
  | { success: false; error: string };

/**
 * Usage-Summary für einen Coach
 * 
 * Aggregierte Daten für Dashboard und Kostenkontrolle.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<UsageSummaryResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as 'today' | 'week' | 'month' | 'all') || 'month';

    // Summary laden
    const summary = await getCoachUsageSummary(user.id, period);

    return NextResponse.json<UsageSummaryResponse>({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Fehler beim Laden der Usage-Summary:', error);
    return NextResponse.json<UsageSummaryResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}


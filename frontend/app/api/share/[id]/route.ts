import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id: shareId } = params;

    // Fetch shared chart
    const { data: sharedChart, error } = await supabase
      .from('shared_charts')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error || !sharedChart) {
      return NextResponse.json(
        { error: 'Shared chart not found' },
        { status: 404 }
      );
    }

    // Check if expired
    const expiresAt = new Date(sharedChart.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Shared chart has expired' },
        { status: 410 }
      );
    }

    // Increment view count
    await supabase
      .from('shared_charts')
      .update({ views: sharedChart.views + 1 })
      .eq('share_id', shareId);

    // Return chart data
    return NextResponse.json({
      type: sharedChart.data.type,
      profile: sharedChart.data.profile,
      authority: sharedChart.data.authority,
      centers: sharedChart.data.centers,
      gates: sharedChart.data.gates,
      channels: sharedChart.data.channels,
      isAnonymous: sharedChart.is_anonymous,
      createdAt: sharedChart.created_at,
      expiresAt: sharedChart.expires_at,
      views: sharedChart.views + 1
    });

  } catch (error) {
    console.error('Error fetching shared chart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


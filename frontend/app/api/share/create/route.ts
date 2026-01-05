import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data, anonymize } = body;

    // Generate unique share ID
    const shareId = nanoid(10);

    // Anonymize data if requested
    let shareData = data;
    if (anonymize) {
      shareData = {
        ...data,
        name: undefined,
        birthDate: undefined,
        birthTime: undefined,
        birthPlace: undefined,
        // Keep chart-specific data
        type: data.type,
        profile: data.profile,
        authority: data.authority,
        centers: data.centers,
        gates: data.gates,
        channels: data.channels
      };
    }

    // Store in database
    const { error } = await supabase
      .from('shared_charts')
      .insert({
        share_id: shareId,
        user_id: user.id,
        type,
        data: shareData,
        is_anonymous: anonymize,
        views: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    if (error) {
      console.error('Error creating share:', error);
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    // Track share action for analytics
    await supabase
      .from('user_actions')
      .insert({
        user_id: user.id,
        action: 'share_created',
        metadata: {
          type,
          anonymous: anonymize,
          share_id: shareId
        }
      });

    return NextResponse.json({
      shareId,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`
    });

  } catch (error) {
    console.error('Error in share/create:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


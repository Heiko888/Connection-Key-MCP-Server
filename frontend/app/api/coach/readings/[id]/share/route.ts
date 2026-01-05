import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { createReadingShare, getReadingShares } from '@/lib/db/reading-share';

export const runtime = 'nodejs';

type CreateShareResponse =
  | {
      success: true;
      share: {
        id: string;
        token: string;
        shareUrl: string;
        accessLevel: string;
        expiresAt: string | null;
        maxViews: number | null;
      };
    }
  | { success: false; error: string };

type GetSharesResponse =
  | {
      success: true;
      shares: Array<{
        id: string;
        token: string;
        shareUrl: string;
        accessLevel: string;
        expiresAt: string | null;
        maxViews: number | null;
        views: number;
        isActive: boolean;
        createdAt: string;
      }>;
    }
  | { success: false; error: string };

/**
 * Erstellt einen neuen Share für ein Reading
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<CreateShareResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    if (!readingId) {
      return NextResponse.json<CreateShareResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden und Ownership prüfen
    const reading = await getCoachReadingById(user.id, readingId);
    if (!reading) {
      return NextResponse.json<CreateShareResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Body parsen
    const body = await req.json();
    const { accessLevel, expiresInDays, maxViews } = body ?? {};

    // Validierung
    if (accessLevel && !['view', 'comment'].includes(accessLevel)) {
      return NextResponse.json<CreateShareResponse>(
        { success: false, error: 'accessLevel muss "view" oder "comment" sein' },
        { status: 400 }
      );
    }

    // Berechne expires_at
    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      expiresAt = expiryDate.toISOString();
    }

    // Erstelle Share
    const share = await createReadingShare(user.id, {
      reading_id: readingId,
      access_level: accessLevel || 'view',
      expires_at: expiresAt,
      max_views: maxViews || null,
    });

    // Share-URL generieren
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
    const shareUrl = `${baseUrl}/share/reading/${share.token}`;

    return NextResponse.json<CreateShareResponse>({
      success: true,
      share: {
        id: share.id,
        token: share.token,
        shareUrl: shareUrl,
        accessLevel: share.access_level,
        expiresAt: share.expires_at,
        maxViews: share.max_views,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Erstellen des Shares:', error);
    return NextResponse.json<CreateShareResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

/**
 * Holt alle Shares für ein Reading
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<GetSharesResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    if (!readingId) {
      return NextResponse.json<GetSharesResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden und Ownership prüfen
    const reading = await getCoachReadingById(user.id, readingId);
    if (!reading) {
      return NextResponse.json<GetSharesResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Shares laden
    const shares = await getReadingShares(readingId, user.id);

    // Share-URLs generieren
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';

    return NextResponse.json<GetSharesResponse>({
      success: true,
      shares: shares.map((share) => ({
        id: share.id,
        token: share.token,
        shareUrl: `${baseUrl}/share/reading/${share.token}`,
        accessLevel: share.access_level,
        expiresAt: share.expires_at,
        maxViews: share.max_views,
        views: share.views,
        isActive: share.is_active,
        createdAt: share.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Fehler beim Laden der Shares:', error);
    return NextResponse.json<GetSharesResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}


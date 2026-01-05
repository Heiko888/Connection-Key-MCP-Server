/**
 * Dev-Route: MCP Payload Preview
 * 
 * Nur in Development verfügbar.
 * Ermöglicht schnelles Testen des Payload-Builders ohne DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildMcpReadingPayload } from '@/lib/mcp/readingPayloadBuilder';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Nur in Development verfügbar
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { readingTypeKey, input } = body ?? {};

    if (!readingTypeKey || !input) {
      return NextResponse.json(
        { error: 'readingTypeKey und input sind Pflichtfelder' },
        { status: 400 }
      );
    }

    // Payload bauen
    const mcpPayload = buildMcpReadingPayload(readingTypeKey, input);

    return NextResponse.json({
      success: true,
      mcpPayload,
    });
  } catch (error: any) {
    console.error('Fehler beim Erstellen des Payload-Previews:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}

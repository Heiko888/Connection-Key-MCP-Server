/**
 * Video Generation Status API Route (App Router)
 * Route: /api/agents/video-generation/status/[taskId]
 *
 * Pollt den Status einer laufenden Runway/Seedance-Generierung über das
 * Backend (.138 mcp-gateway). Bei status === 'SUCCEEDED' enthält die Antwort
 * `output: string[]` (Video-URLs, laufen nach einiger Zeit ab → ggf. in
 * Supabase Storage sichern).
 *
 * Deployment-Ziel: Server .167, frontend-coach
 *   app/api/agents/video-generation/status/[taskId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';

export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const { taskId } = params;
  if (!taskId) {
    return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${MCP_SERVER_URL}/agent/video/status/${encodeURIComponent(taskId)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `Backend error ${response.status}` },
        { status: response.status || 500 },
      );
    }
    // { success, taskId, status, progress, output?, error? }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video Generation Status API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Backend unreachable' },
      { status: 502 },
    );
  }
}

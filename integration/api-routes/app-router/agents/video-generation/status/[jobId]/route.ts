/**
 * Video Generation Status API Route (App Router)
 * Route: /api/agents/video-generation/status/[jobId]
 *
 * Pollt den persistenten video_jobs-Status über den reading-worker (.138:4000).
 * Bei status === 'completed' enthält die Antwort `video_url` (permanente
 * Supabase-Storage-URL — läuft NICHT ab).
 *
 * Deployment-Ziel: Server .167, frontend-coach
 *   app/api/agents/video-generation/status/[jobId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4000';

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  const { jobId } = params;
  if (!jobId) {
    return NextResponse.json({ success: false, error: 'jobId is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${READING_AGENT_URL}/api/videos/${encodeURIComponent(jobId)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `Backend error ${response.status}` },
        { status: response.status || 500 },
      );
    }
    // { success, status, progress, video_url, error, ... }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video Generation Status API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Backend unreachable' },
      { status: 502 },
    );
  }
}

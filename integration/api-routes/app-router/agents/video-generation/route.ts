/**
 * Video Generation API Route (App Router)
 * Route: /api/agents/video-generation
 *
 * Robuster, persistenter Pfad: leitet an den reading-worker (.138:4000) weiter,
 * der einen video_jobs-Eintrag anlegt, in die BullMQ-Queue "video-queue" stellt
 * und das fertige Video permanent im Supabase-Storage speichert.
 * Antwort: { success, jobId } — Status via /status/[jobId] pollen.
 *
 * Deployment-Ziel: Server .167, frontend-coach (app/api/agents/video-generation/route.ts)
 */

import { NextRequest, NextResponse } from 'next/server';

// reading-worker (gleiche Basis wie die Psychology-/Transit-Proxies)
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = 'text', prompt, shots, images, ratio, duration, userId, coachId } = body || {};

    const hasShots = Array.isArray(shots) && shots.length > 0;
    if ((!prompt || typeof prompt !== 'string') && !hasShots) {
      return NextResponse.json(
        { success: false, error: 'prompt (string) oder shots[] ist erforderlich' },
        { status: 400 },
      );
    }
    if ((mode === 'image' || mode === 'reference') && !(Array.isArray(images) && images.length)) {
      return NextResponse.json(
        { success: false, error: `mode "${mode}" requires images[] (HTTPS-URLs or base64 data URIs)` },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Enqueue ist schnell

    let response: Response;
    try {
      response = await fetch(`${READING_AGENT_URL}/api/videos/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt, shots, images, ratio, duration, userId, coachId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchError.name === 'AbortError';
      return NextResponse.json(
        { success: false, error: isTimeout ? 'Backend timeout' : (fetchError.message || 'Backend unreachable') },
        { status: isTimeout ? 504 : 502 },
      );
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `Backend error ${response.status}` },
        { status: response.status || 500 },
      );
    }
    // { success, jobId }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video Generation API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Video Generation API (Runway / Seedance 2.0, persistent)',
    endpoint: '/api/agents/video-generation',
    method: 'POST',
    description: 'Legt einen video_jobs an; Status via /status/[jobId]. Video wird in Supabase Storage gesichert.',
    fields: {
      mode: 'text | image | reference (Default: text)',
      prompt: 'string — Beschreibung (erforderlich, außer shots[])',
      shots: 'string[] — Multi-Shot: mehrere Szenen-Beschreibungen (längeres Video)',
      images: 'string[] — HTTPS-URLs oder base64 (bei mode image/reference)',
      ratio: 'string — z. B. 1280:720 (Default) oder 720:1280',
      duration: 'number — Sekunden (Default: 5; bei shots automatisch)',
    },
    example: { mode: 'text', shots: ['Weite Berglandschaft bei Sonnenaufgang', 'Nahaufnahme eines Adlers im Flug', 'Kamera schwenkt über ein Tal'] },
  });
}

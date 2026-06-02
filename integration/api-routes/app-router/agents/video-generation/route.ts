/**
 * Video Generation API Route (App Router)
 * Route: /api/agents/video-generation
 *
 * Startet eine echte Video-Generierung via Runway / Seedance 2.0 auf dem
 * Backend (.138 mcp-gateway). Asynchron: liefert eine taskId zurück, der
 * Status wird über /api/agents/video-generation/status/[taskId] gepollt.
 *
 * Deployment-Ziel: Server .167, frontend-coach (app/api/agents/video-generation/route.ts)
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = 'text', prompt, images, ratio, duration } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt is required and must be a string' },
        { status: 400 },
      );
    }
    if ((mode === 'image' || mode === 'reference') && (!Array.isArray(images) || images.length === 0)) {
      return NextResponse.json(
        { success: false, error: `mode "${mode}" requires images[] (HTTPS-URLs or base64 data URIs)` },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Start-Request ist schnell

    let response: Response;
    try {
      response = await fetch(`${MCP_SERVER_URL}/agent/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, prompt, images, ratio, duration }),
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

    // { success, taskId, status, model, mode }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Video Generation API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Video Generation API (Runway / Seedance 2.0)',
    endpoint: '/api/agents/video-generation',
    method: 'POST',
    description: 'Startet eine Video-Generierung; pollt Status über /status/[taskId]',
    fields: {
      mode: 'text | image | reference (Default: text)',
      prompt: 'string (erforderlich) — Beschreibung des Videos',
      images: 'string[] — HTTPS-URLs oder base64 data URIs (bei mode image/reference)',
      ratio: 'string — z. B. 1280:720 (Default) oder 720:1280',
      duration: 'number — Sekunden (Default: 5)',
    },
    example: { mode: 'text', prompt: 'Sonnenaufgang über den Bergen, langsame Kamerafahrt', ratio: '1280:720', duration: 5 },
  });
}

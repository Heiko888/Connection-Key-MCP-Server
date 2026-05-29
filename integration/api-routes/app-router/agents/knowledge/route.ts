/**
 * Knowledge & Templates Agent API Route (App Router)
 * Route: /api/agents/knowledge
 *
 * Proxy auf den MCP-Gateway-Agenten (.138:7000 /agent/knowledge).
 * Liest HD-Knowledge und Reading-Templates aus. Aktionen:
 *   action: "list"   -> Katalog aller Templates + Knowledge
 *   action: "get"    -> Roh-Inhalt einer Datei { kind: "template"|"knowledge", name }
 *   action: "search" -> Volltextsuche { query, limit? }
 *   action: "ask"    -> Claude antwortet grounded auf den passendsten Dateien { message }
 *
 * Hinweis: Bewusst KEIN Supabase-Task-Tracking wie bei den generativen Agenten —
 * list/get/search sind schnelle Reads, ask ist ein einzelner Lookup. Wir reichen
 * den Body 1:1 an das Gateway durch und geben die Antwort unverändert zurück.
 */

import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'knowledge';
const VALID_ACTIONS = ['list', 'get', 'search', 'ask'];

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));

    // Default-Action ableiten (wie im Agent selbst): message -> ask, sonst list
    const action = (body.action || (body.message ? 'ask' : 'list')).toLowerCase();

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Unbekannte action '${action}'. Erlaubt: ${VALID_ACTIONS.join(', ')}.` },
        { status: 400 }
      );
    }

    // Minimal-Validierung pro Action
    if (action === 'get' && !body.name) {
      return NextResponse.json({ success: false, error: "action 'get' braucht 'name' (und 'kind': template|knowledge)" }, { status: 400 });
    }
    if (action === 'search' && !body.query) {
      return NextResponse.json({ success: false, error: "action 'search' braucht 'query'" }, { status: 400 });
    }
    if (action === 'ask' && !body.message) {
      return NextResponse.json({ success: false, error: "action 'ask' braucht 'message'" }, { status: 400 });
    }

    // 'ask' kann Claude aufrufen -> großzügiges Timeout; Reads sind schnell
    const timeoutMs = action === 'ask' ? 120000 : 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, action }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: `Knowledge Agent request timeout after ${timeoutMs / 1000}s` },
          { status: 504 }
        );
      }
      throw fetchError;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return NextResponse.json(
        { success: false, error: `Agent request failed: ${response.status}`, details: data },
        { status: response.status || 502 }
      );
    }

    // Antwort des Gateways 1:1 durchreichen, Laufzeit ergänzen
    return NextResponse.json({ ...data, proxyMs: Date.now() - startTime });
  } catch (error: any) {
    console.error('Knowledge Agent API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: API-Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Knowledge & Templates Agent API',
    endpoint: '/api/agents/knowledge',
    method: 'POST',
    description: 'Liest HD-Knowledge und Reading-Templates aus (list / get / search / ask).',
    actions: {
      list: { body: {}, description: 'Katalog aller Templates + Knowledge (Name, Kategorie, Größe).' },
      get: { body: { kind: 'template|knowledge', name: 'string' }, description: 'Roh-Inhalt einer Datei.' },
      search: { body: { query: 'string', limit: 'number? (default 10)' }, description: 'Volltextsuche mit Snippets.' },
      ask: { body: { message: 'string' }, description: 'Claude antwortet grounded auf den passendsten Dateien.' },
    },
    examples: [
      { action: 'list' },
      { action: 'get', kind: 'knowledge', name: 'types-detailed' },
      { action: 'search', query: 'emotionale autorität', limit: 5 },
      { action: 'ask', message: 'Was ist der Unterschied zwischen Strategie und Autorität?' },
    ],
  });
}

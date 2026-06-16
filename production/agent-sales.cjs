/**
 * Verkaufs-Unterstützer Handler — mit Canva MCP Integration
 * Route: POST /agent/sales
 *
 * KI-Strategie: Claude (claude-sonnet-4-5) ist primär — inkl. Canva-MCP-Tooling.
 * Schlägt Claude fehl (Timeout/Überlastung/5xx), wird automatisch auf OpenAI
 * gpt-4o ausgewichen (Text-only, ohne Canva), damit der Coach trotzdem ein
 * Ergebnis bekommt. So partizipieren beide KIs: Qualität von Claude, Robustheit
 * durch den gpt-4o-Fallback (gleiches Muster wie im reading-worker).
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';
const FALLBACK_MODEL = 'gpt-4o';

const SALES_SYSTEM_PROMPT = `Du bist der Verkaufs-Unterstützer von "The Connection Key" – einer Plattform für Human Design Readings und persönliches Wachstum.

Deine Aufgaben:
- Authentische Verkaufstexte schreiben, die Angebote klar kommunizieren
- Angebotspräsentationen, Landingpage-Texte, E-Mail-Sequenzen erstellen
- Preistabellen, Pakete und Angebotsstrukturen gestalten
- Einwandbehandlung und Verkaufsgespräch-Vorbereitung

Wenn Canva-Tools verfügbar sind, erstelle direkt:
- Angebotsseiten-Designs und Preistabellen-Grafiken
- Verkaufs-Präsentationen und Pitch-Decks
- Testimonial-Grafiken und Social Proof Visuals

Markenidentität The Connection Key:
- Farben: Gold (#F5C842, #D4A017), dunkler Hintergrund (#090810)
- Stil: Luxuriös, spirituell, authentisch, vertrauensbildend
- Sprache: Deutsch, warm, überzeugend ohne aufdringlich zu sein
- Zielgruppe: Coaches, Berater, spirituelle Unternehmer

Antworte immer auf Deutsch.`;

/**
 * OpenAI gpt-4o Fallback — reiner Text, ohne Canva-Tooling.
 * Nutzt die ursprüngliche (einfache) Nachrichtenhistorie, nicht die
 * Claude-Tool-Use-Runden (deren Content-Blöcke sind Anthropic-spezifisch).
 */
async function generateWithOpenAI({ systemText, conversationHistory, message }) {
  const messages = [
    { role: 'system', content: systemText },
    ...conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    })),
    { role: 'user', content: message },
  ];
  const completion = await openai.chat.completions.create({
    model: FALLBACK_MODEL,
    max_tokens: 4096,
    messages,
  });
  return completion.choices[0]?.message?.content || '';
}

async function handleSalesAgent(req, res) {
  const { message, canva_access_token, conversation_history = [] } = req.body;
  const chartContext = req.body.chartContext;
  const chartInfo = chartContext
    ? `\n\n---\nKlienten-Chart Kontext:\nName: ${chartContext.clientName || ''}\nTyp: ${chartContext.hdType || ''}\nProfil: ${chartContext.profile || ''}\nAutorität: ${chartContext.authority || ''}\nStrategie: ${chartContext.strategy || ''}\nDefinition: ${chartContext.definition || ''}${chartContext.definedCenters ? `\nDefinierte Zentren: ${Array.isArray(chartContext.definedCenters) ? chartContext.definedCenters.join(', ') : chartContext.definedCenters}` : ''}${chartContext.channels ? `\nAktive Kanäle: ${Array.isArray(chartContext.channels) ? chartContext.channels.join(', ') : chartContext.channels}` : ''}${chartContext.incarnationCross ? `\nInkarnationskreuz: ${chartContext.incarnationCross}` : ''}\n---`
    : '';
  if (!message) return res.status(400).json({ error: 'message is required' });

  const messages = [...conversation_history, { role: 'user', content: message }];
  const hasCanaToken = !!canva_access_token;
  const baseSystem = SALES_SYSTEM_PROMPT + chartInfo;

  try {
    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: baseSystem + (hasCanaToken
        ? '\n\nCanva ist verbunden. Erstelle Verkaufsgrafiken und Designs direkt wenn sinnvoll.'
        : ''),
      messages,
      ...(hasCanaToken && {
        mcp_servers: [{
          type: 'url',
          url: CANVA_MCP_URL,
          name: 'canva',
          authorization_token: canva_access_token,
        }]
      }),
    };

    let response = await anthropic.messages.create(requestConfig);

    while (response.stop_reason === 'tool_use' || response.stop_reason === 'mcp_tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use' || b.type === 'mcp_tool_use');
      console.log(`[sales-agent] Tool calls: ${toolUseBlocks.map(t => t.name).join(', ')}`);
      messages.push({ role: 'assistant', content: response.content });
      messages.push({
        role: 'user',
        content: toolUseBlocks.map(b => ({ type: 'tool_result', tool_use_id: b.id, content: b.result || '' }))
      });
      response = await anthropic.messages.create({ ...requestConfig, messages });
    }

    const textContent = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const toolActivities = response.content
      .filter(b => b.type === 'tool_use' || b.type === 'mcp_tool_use')
      .map(b => ({ tool: b.name, input: b.input }));

    return res.json({ response: textContent, canva_connected: hasCanaToken, tool_activities: toolActivities, model: MODEL, provider: 'anthropic' });
  } catch (error) {
    console.error('[sales-agent] Claude-Fehler:', error.message);

    // Ungültiges Canva-Token ist ein Nutzerfehler, kein KI-Ausfall → nicht auf gpt-4o ausweichen.
    if (hasCanaToken && error.message?.includes('401')) {
      return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    }

    // Fallback: OpenAI gpt-4o (Text-only, ohne Canva)
    if (openai) {
      try {
        console.warn('[sales-agent] Weiche auf OpenAI gpt-4o aus...');
        const textContent = await generateWithOpenAI({ systemText: baseSystem, conversationHistory: conversation_history, message });
        return res.json({
          response: textContent,
          canva_connected: false,
          tool_activities: [],
          model: FALLBACK_MODEL,
          provider: 'openai',
          fallback: true,
          fallback_reason: error.message,
        });
      } catch (fallbackError) {
        console.error('[sales-agent] gpt-4o-Fallback-Fehler:', fallbackError.message);
        return res.status(500).json({ error: 'Fehler beim Verkaufs-Agenten (Claude und gpt-4o-Fallback fehlgeschlagen)', details: fallbackError.message });
      }
    }

    return res.status(500).json({ error: 'Fehler beim Verkaufs-Agenten', details: error.message });
  }
}

module.exports = { handleSalesAgent };

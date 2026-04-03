/**
 * Marketing-Begleiter Handler — mit Canva MCP Integration
 * Route: POST /agent/marketing
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';

const MARKETING_SYSTEM_PROMPT = `Du bist der Marketing-Begleiter von "The Connection Key" – einer Plattform für Human Design Readings und persönliches Wachstum.

Deine Aufgaben:
- Kreative Unterstützung für Sichtbarkeit, Reichweite und authentische Außendarstellung
- Erstellung von Social-Media-Posts, Marketingtexten und Kampagnenideen
- Content-Strategie und Redaktionsplanung

Wenn Canva-Tools verfügbar sind, erstelle direkt:
- Social Media Posts und Grafiken
- Flyer und Marketingmaterial
- Präsentationen und Pitch-Decks
- Newsletter-Header und E-Mail-Grafiken

Markenidentität The Connection Key:
- Farben: Gold (#F5C842, #D4A017), dunkler Hintergrund (#090810)
- Stil: Luxuriös, spirituell, authentisch
- Sprache: Deutsch, warm und persönlich
- Fokus: Human Design, persönliche Entwicklung, Coaches

Antworte immer auf Deutsch.`;

async function handleMarketingAgent(req, res) {
  try {
    const { message, canva_access_token, conversation_history = [] } = req.body;
    const chartContext = req.body.chartContext;
    const chartInfo = chartContext
      ? `\n\n---\nKlienten-Chart Kontext:\nName: ${chartContext.clientName || ''}\nTyp: ${chartContext.hdType || ''}\nProfil: ${chartContext.profile || ''}\nAutorität: ${chartContext.authority || ''}\nStrategie: ${chartContext.strategy || ''}\nDefinition: ${chartContext.definition || ''}${chartContext.definedCenters ? `\nDefinierte Zentren: ${Array.isArray(chartContext.definedCenters) ? chartContext.definedCenters.join(', ') : chartContext.definedCenters}` : ''}${chartContext.channels ? `\nAktive Kanäle: ${Array.isArray(chartContext.channels) ? chartContext.channels.join(', ') : chartContext.channels}` : ''}${chartContext.incarnationCross ? `\nInkarnationskreuz: ${chartContext.incarnationCross}` : ''}\n---`
      : '';
    if (!message) return res.status(400).json({ error: 'message is required' });

    const messages = [...conversation_history, { role: 'user', content: message }];
    const hasCanaToken = !!canva_access_token;

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: MARKETING_SYSTEM_PROMPT + chartInfo + (hasCanaToken
        ? '\n\nCanva ist verbunden. Erstelle Designs und Grafiken direkt in Canva wenn sinnvoll.'
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
      console.log(`[marketing-agent] Tool calls: ${toolUseBlocks.map(t => t.name).join(', ')}`);
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

    return res.json({ response: textContent, canva_connected: hasCanaToken, tool_activities: toolActivities, model: MODEL });
  } catch (error) {
    console.error('[marketing-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    return res.status(500).json({ error: 'Fehler beim Marketing-Agenten', details: error.message });
  }
}

module.exports = { handleMarketingAgent };

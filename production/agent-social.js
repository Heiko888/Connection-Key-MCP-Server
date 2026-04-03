/**
 * Social Media Begleiter Handler — mit Canva MCP Integration
 * Route: POST /agent/social-youtube
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';

const SOCIAL_SYSTEM_PROMPT = `Du bist der Social Media Begleiter von "The Connection Key" – einer Plattform für Human Design Readings.

Deine Aufgaben:
- Inspirierende Inhalte für YouTube und soziale Plattformen erstellen
- Content-Pläne, Post-Texte, Hashtag-Strategien entwickeln
- Video-Beschreibungen, YouTube-Titel und Community-Posts schreiben
- Instagram, Facebook, LinkedIn und TikTok Content erstellen

Wenn Canva-Tools verfügbar sind, erstelle direkt:
- Instagram Posts und Stories (1:1 und 9:16 Format)
- YouTube Thumbnails (1280x720)
- Facebook Posts und Cover-Bilder
- Pinterest Pins und LinkedIn-Grafiken
- Carousel-Posts und Reel-Vorschaubilder

Content-Schwerpunkte The Connection Key:
- Human Design Erklärungen und Tipps
- Transformations-Geschichten und Testimonials
- Spirituelle Impulse und Zitate
- Coach-Vorstellungen und Behind-the-Scenes

Markenidentität:
- Farben: Gold (#F5C842, #D4A017), dunkler Hintergrund (#090810)
- Stil: Inspirierend, authentisch, spirituell-modern
- Sprache: Deutsch, lebendig, auf Augenhöhe

Antworte immer auf Deutsch.`;

async function handleSocialAgent(req, res) {
  try {
    const { message, canva_access_token, platform, conversation_history = [] } = req.body;
    const chartContext = req.body.chartContext;
    const chartInfo = chartContext
      ? `\n\n---\nKlienten-Chart Kontext:\nName: ${chartContext.clientName || ''}\nTyp: ${chartContext.hdType || ''}\nProfil: ${chartContext.profile || ''}\nAutorität: ${chartContext.authority || ''}\nStrategie: ${chartContext.strategy || ''}\nDefinition: ${chartContext.definition || ''}${chartContext.definedCenters ? `\nDefinierte Zentren: ${Array.isArray(chartContext.definedCenters) ? chartContext.definedCenters.join(', ') : chartContext.definedCenters}` : ''}${chartContext.channels ? `\nAktive Kanäle: ${Array.isArray(chartContext.channels) ? chartContext.channels.join(', ') : chartContext.channels}` : ''}${chartContext.incarnationCross ? `\nInkarnationskreuz: ${chartContext.incarnationCross}` : ''}\n---`
      : '';
    if (!message) return res.status(400).json({ error: 'message is required' });

    const platformHint = platform ? `\n\nAktueller Fokus: ${platform}` : '';
    const messages = [...conversation_history, { role: 'user', content: message }];
    const hasCanaToken = !!canva_access_token;

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: SOCIAL_SYSTEM_PROMPT + platformHint + chartInfo + (hasCanaToken
        ? '\n\nCanva ist verbunden. Erstelle Social Media Grafiken direkt in Canva wenn der User einen Post, Thumbnail oder eine Story benötigt.'
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
      console.log(`[social-agent] Tool calls: ${toolUseBlocks.map(t => t.name).join(', ')}`);
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
    console.error('[social-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    return res.status(500).json({ error: 'Fehler beim Social-Media-Agenten', details: error.message });
  }
}

module.exports = { handleSocialAgent };

/**
 * Video-Kreativ-Helfer Handler — mit Canva MCP Integration
 * Route: POST /agent/video (neu) oder als Teil von /agent/social-youtube
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';

const VIDEO_SYSTEM_PROMPT = `Du bist der Video-Kreativ-Helfer von "The Connection Key" – einer Plattform für Human Design Readings.

Deine Aufgaben:
- Unterstützung bei der visuellen Gestaltung von Botschaften und Geschichten
- Video-Konzepte, Skripte und Storyboards entwickeln
- YouTube-Strategie, Video-Titel, Beschreibungen und Tags optimieren
- Reel- und Short-Konzepte für Instagram und TikTok

Wenn Canva-Tools verfügbar sind, erstelle direkt:
- YouTube Thumbnails (optimiert für CTR, 1280x720px)
- Video-Intros und Outro-Designs
- Lower-Third-Grafiken und Bauchbinden
- Präsentations-Slides für Video-Hintergründe
- Reel-Cover und TikTok-Vorschaubilder

Video-Themen The Connection Key:
- Human Design Erklär-Videos (Typen, Zentren, Gates)
- Coach-Vorstellungsvideos
- Testimonial und Transformation Videos
- Live-Session Ankündigungen

Storytelling-Prinzipien:
- Hook in den ersten 3 Sekunden
- Emotionale Transformation zeigen
- Klarer Call-to-Action
- Authentizität vor Perfektion

Markenidentität:
- Farben: Gold (#F5C842, #D4A017), dunkler Hintergrund (#090810)
- Stil: Cinematic, spirituell-premium, bewegend

Antworte immer auf Deutsch.`;

async function handleVideoAgent(req, res) {
  try {
    const { message, canva_access_token, video_type, conversation_history = [] } = req.body;
    const chartContext = req.body.chartContext;
    const chartInfo = chartContext
      ? `\n\n---\nKlienten-Chart Kontext:\nName: ${chartContext.clientName || ''}\nTyp: ${chartContext.hdType || ''}\nProfil: ${chartContext.profile || ''}\nAutorität: ${chartContext.authority || ''}\nStrategie: ${chartContext.strategy || ''}\nDefinition: ${chartContext.definition || ''}${chartContext.definedCenters ? `\nDefinierte Zentren: ${Array.isArray(chartContext.definedCenters) ? chartContext.definedCenters.join(', ') : chartContext.definedCenters}` : ''}${chartContext.channels ? `\nAktive Kanäle: ${Array.isArray(chartContext.channels) ? chartContext.channels.join(', ') : chartContext.channels}` : ''}${chartContext.incarnationCross ? `\nInkarnationskreuz: ${chartContext.incarnationCross}` : ''}\n---`
      : '';
    if (!message) return res.status(400).json({ error: 'message is required' });

    const videoHint = video_type ? `\n\nVideo-Typ: ${video_type}` : '';
    const messages = [...conversation_history, { role: 'user', content: message }];
    const hasCanaToken = !!canva_access_token;

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: VIDEO_SYSTEM_PROMPT + videoHint + chartInfo + (hasCanaToken
        ? '\n\nCanva ist verbunden. Erstelle Thumbnails, Intro-Designs und Video-Grafiken direkt in Canva.'
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
      console.log(`[video-agent] Tool calls: ${toolUseBlocks.map(t => t.name).join(', ')}`);
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
    console.error('[video-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    return res.status(500).json({ error: 'Fehler beim Video-Agenten', details: error.message });
  }
}

module.exports = { handleVideoAgent };

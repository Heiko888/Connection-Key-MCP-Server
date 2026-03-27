/**
 * Verkaufs-Unterstützer Handler — mit Canva MCP Integration
 * Route: POST /agent/sales
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';

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

async function handleSalesAgent(req, res) {
  try {
    const { message, canva_access_token, conversation_history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const messages = [...conversation_history, { role: 'user', content: message }];
    const hasCanaToken = !!canva_access_token;

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: SALES_SYSTEM_PROMPT + (hasCanaToken
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

    return res.json({ response: textContent, canva_connected: hasCanaToken, tool_activities: toolActivities, model: MODEL });
  } catch (error) {
    console.error('[sales-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    return res.status(500).json({ error: 'Fehler beim Verkaufs-Agenten', details: error.message });
  }
}

module.exports = { handleSalesAgent };

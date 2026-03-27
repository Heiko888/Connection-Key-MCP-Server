/**
 * Design-Begleiter Handler — mit Canva UND Figma MCP Integration
 * Route: POST /agent/ui-ux
 * 
 * Einziger Agent mit BEIDEN Tools:
 *   - Canva → fertige Designs, Grafiken, Marketingmaterial
 *   - Figma → Wireframes, UI-Komponenten, Prototypen, Design-Systeme
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const FIGMA_MCP_URL = process.env.FIGMA_MCP_URL || 'https://mcp.figma.com/mcp';
const MODEL = 'claude-sonnet-4-5';

const DESIGN_SYSTEM_PROMPT = `Du bist der Design-Begleiter von "The Connection Key" – einer Plattform für Human Design Readings.

Deine Aufgaben:
- Intuitive Gestaltung für eine stimmige und einladende Benutzererfahrung
- UI/UX Konzepte, Design-Systeme und Komponenten entwickeln
- Visuelles Feedback zu bestehenden Designs geben
- Brand-Konsistenz sicherstellen

Tool-Einsatz (wenn verfügbar):
CANVA → Für: Marketing-Grafiken, Social Media Posts, Präsentationen, fertige Designs
FIGMA → Für: Wireframes, UI-Komponenten, Prototypen, Design-Tokens, Entwickler-Handoff

Entscheide aktiv welches Tool besser passt:
- "Erstelle einen Instagram Post" → Canva
- "Wireframe für die Dashboard-Seite" → Figma
- "Design-System Komponente" → Figma
- "Präsentation für Klienten" → Canva

Design-System The Connection Key:
Farben:
  - Primary: #F5C842 (Gold hell)
  - Secondary: #D4A017 (Gold mittel)
  - Accent: #8B6914 (Gold dunkel)
  - Background: #090810 (Fast-Schwarz)
  - Surface: #12111F (Dunkel-Lila)
  - Text: #F5F0E8 (Warm-Weiß)

Typografie:
  - Display: Cinzel (Headlines, Titel)
  - Body: Cormorant Garamond (Fließtext)
  - UI: EB Garamond (Interface-Text)

Komponenten-Stil:
  - Abgerundete Ecken: 8px (Cards), 4px (Buttons)
  - Gold-Akzente auf dunklen Hintergründen
  - Subtile Gold-Gradienten für Premium-Wirkung
  - Großzügiges Whitespace / Darkspace

Antworte immer auf Deutsch.`;

async function handleDesignAgent(req, res) {
  try {
    const { message, canva_access_token, figma_access_token, conversation_history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const hasCanva = !!canva_access_token;
    const hasFigma = !!figma_access_token;

    const messages = [...conversation_history, { role: 'user', content: message }];

    // Tool-Status in System-Prompt
    let toolStatus = '';
    if (hasCanva && hasFigma) toolStatus = '\n\nCanva UND Figma sind verbunden. Wähle aktiv das passende Tool.';
    else if (hasCanva) toolStatus = '\n\nCanva ist verbunden. Nutze es für fertige Designs und Grafiken.';
    else if (hasFigma) toolStatus = '\n\nFigma ist verbunden. Nutze es für Wireframes und UI-Komponenten.';

    // MCP Servers konfigurieren
    const mcpServers = [];
    if (hasCanva) mcpServers.push({ type: 'url', url: CANVA_MCP_URL, name: 'canva', authorization_token: canva_access_token });
    if (hasFigma) mcpServers.push({ type: 'url', url: FIGMA_MCP_URL, name: 'figma', authorization_token: figma_access_token });

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: DESIGN_SYSTEM_PROMPT + toolStatus,
      messages,
      ...(mcpServers.length > 0 && { mcp_servers: mcpServers }),
    };

    let response = await anthropic.messages.create(requestConfig);

    while (response.stop_reason === 'tool_use' || response.stop_reason === 'mcp_tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use' || b.type === 'mcp_tool_use');
      console.log(`[design-agent] Tool calls: ${toolUseBlocks.map(t => t.name).join(', ')}`);
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

    return res.json({
      response: textContent,
      canva_connected: hasCanva,
      figma_connected: hasFigma,
      tool_activities: toolActivities,
      model: MODEL,
    });
  } catch (error) {
    console.error('[design-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Token ungültig', canva_auth_required: !canva_access_token, figma_auth_required: !figma_access_token });
    return res.status(500).json({ error: 'Fehler beim Design-Agenten', details: error.message });
  }
}

module.exports = { handleDesignAgent };

/**
 * Social Media Begleiter Handler — mit Canva MCP Integration
 * Route: POST /agent/social-youtube
 *
 * Seit 2026-04-20: Content-Topics-Integration.
 * Optional Request-Felder: topic_id, category_id, format, channel, custom_hook.
 * Wenn gesetzt, nutzt der Agent die content-topics.json als Themenquelle und
 * injiziert Brand-Voice + verbotene Phrasen in den System-Prompt. Tracking in
 * public.content_topic_usage (Supabase).
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
let _supabaseLib = null;
try { _supabaseLib = require('@supabase/supabase-js'); } catch { /* optional */ }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CANVA_MCP_URL = process.env.CANVA_MCP_URL || 'https://mcp.canva.com/mcp';
const MODEL = 'claude-sonnet-4-5';

// ── Content-Topics laden (beim Modul-Start) ────────────────────────────────
const CONTENT_TOPICS_PATHS = [
  '/app/content-topics/content-topics.json',   // Docker-Mount
  '/opt/mcp-connection-key/content-topics/content-topics.json', // Host-Fallback
  path.join(__dirname, '..', 'content-topics', 'content-topics.json'),
];
let contentTopics = null;

function loadContentTopics() {
  for (const p of CONTENT_TOPICS_PATHS) {
    try {
      if (fs.existsSync(p)) {
        contentTopics = JSON.parse(fs.readFileSync(p, 'utf-8'));
        const cats = contentTopics.categories?.length || 0;
        const total = contentTopics.meta?.total_topics || contentTopics.categories?.reduce((s, c) => s + c.topics.length, 0);
        console.log(`[social-youtube] Loaded ${cats} categories, ${total} topics from ${p}`);
        return true;
      }
    } catch (err) {
      console.error(`[social-youtube] Failed to parse ${p}:`, err.message);
    }
  }
  console.warn('[social-youtube] content-topics.json not found (topic-based mode disabled, legacy mode active)');
  return false;
}
loadContentTopics();

// ── Supabase-Client (lazy, nur für Usage-Tracking) ─────────────────────────
let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  if (!_supabaseLib?.createClient) return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _sb = _supabaseLib.createClient(url, key, { auth: { persistSession: false } });
  return _sb;
}

// ── Topic-Selection-Helper ──────────────────────────────────────────────────
function findTopicById(id) {
  if (!contentTopics) return null;
  for (const cat of contentTopics.categories) {
    const t = cat.topics.find(t => t.id === id);
    if (t) return { ...t, category_id: cat.id, category_name: cat.name };
  }
  return null;
}

function pickTopicFromCategory(catId) {
  if (!contentTopics) return null;
  const cat = contentTopics.categories.find(c => c.id === catId);
  if (!cat || !cat.topics.length) return null;
  const idx = Math.floor(Math.random() * cat.topics.length);
  return { ...cat.topics[idx], category_id: cat.id, category_name: cat.name };
}

function pickNextTopicByRotation() {
  if (!contentTopics) return null;
  const p1 = contentTopics.categories.filter(c => c.priority === 1);
  if (p1.length === 0) return null;
  const cat = p1[Math.floor(Math.random() * p1.length)];
  return pickTopicFromCategory(cat.id);
}

async function trackTopicUsage({ topic_id, topic_title, category_id, channel, format }) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { error } = await sb.from('content_topic_usage').insert({
      topic_id, topic_title, category_id, channel, format,
      generated_at: new Date().toISOString(),
    });
    if (error) console.warn('[social-youtube] trackTopicUsage failed:', error.message);
  } catch (e) {
    console.warn('[social-youtube] trackTopicUsage exception:', e.message);
  }
}

function buildTopicSystemPrompt(topic, opts) {
  const m = contentTopics.meta;
  const format = opts.format || topic.format?.[0] || 'reel_30s';
  const channel = opts.channel || 'instagram';
  return `Du bist der social-youtube Content-Generator von The Connection Key.

BRAND VOICE (unverhandelbar):
${m.brand_voice}

VERBOTENE PHRASEN (NIEMALS verwenden):
${(m.forbidden_phrases || []).map(p => `- ${p}`).join('\n')}

FORMAT: ${format}
KANAL: ${channel}
PILLAR: ${topic.pillar || 'awareness'}
KATEGORIE: ${topic.category_name}

THEMA: ${topic.title}
HOOK (unverändert als Opener verwenden): ${opts.custom_hook || topic.hook}
${topic.cta ? `CTA am Ende: ${topic.cta}` : ''}

Halte dich strikt an Brand Voice. Kein Clickbait, keine Leerformeln. Format-angemessene Länge.`;
}

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
    const {
      message, canva_access_token, platform, conversation_history = [],
      // Topic-basierte Parameter (seit 2026-04-20)
      topic_id, category_id, format, channel, custom_hook,
    } = req.body;
    const chartContext = req.body.chartContext;
    const chartInfo = chartContext
      ? `\n\n---\nKlienten-Chart Kontext:\nName: ${chartContext.clientName || ''}\nTyp: ${chartContext.hdType || ''}\nProfil: ${chartContext.profile || ''}\nAutorität: ${chartContext.authority || ''}\nStrategie: ${chartContext.strategy || ''}\nDefinition: ${chartContext.definition || ''}${chartContext.definedCenters ? `\nDefinierte Zentren: ${Array.isArray(chartContext.definedCenters) ? chartContext.definedCenters.join(', ') : chartContext.definedCenters}` : ''}${chartContext.channels ? `\nAktive Kanäle: ${Array.isArray(chartContext.channels) ? chartContext.channels.join(', ') : chartContext.channels}` : ''}${chartContext.incarnationCross ? `\nInkarnationskreuz: ${chartContext.incarnationCross}` : ''}\n---`
      : '';

    // ─── Topic-basierter Modus (seit 2026-04-20) ─────────────────────────
    // Wenn topic_id / category_id / format / channel gesetzt sind, nutzt der
    // Agent die Content-Topics-DB und injiziert Brand-Voice/forbidden_phrases.
    // Backward-compat: ohne Topic-Params weiterhin freie Conversation.
    const isTopicMode = !!(topic_id || category_id || (format && channel));
    let topic = null;
    let selectedFormat = format;
    let selectedChannel = channel || 'instagram';

    if (isTopicMode) {
      if (!contentTopics) {
        return res.status(503).json({ error: 'content_topics_unavailable', details: 'content-topics.json konnte nicht geladen werden' });
      }
      if (topic_id) topic = findTopicById(topic_id);
      else if (category_id) topic = pickTopicFromCategory(category_id);
      else topic = pickNextTopicByRotation();
      if (!topic) return res.status(404).json({ error: 'no_topic_found', details: `topic_id=${topic_id} category_id=${category_id}` });

      selectedFormat = selectedFormat || topic.format?.[0] || 'reel_30s';
    }

    // Legacy-Pfad prüft auf message. Topic-Mode braucht sie nicht.
    if (!isTopicMode && !message) return res.status(400).json({ error: 'message is required' });

    const platformHint = platform ? `\n\nAktueller Fokus: ${platform}` : '';
    const hasCanaToken = !!canva_access_token;

    // Im Topic-Mode: System-Prompt aus content-topics, User-Message = „Erstelle …"
    // Legacy-Mode: unveränderter SOCIAL_SYSTEM_PROMPT
    const systemPromptBase = isTopicMode
      ? buildTopicSystemPrompt(topic, { format: selectedFormat, channel: selectedChannel, custom_hook })
      : SOCIAL_SYSTEM_PROMPT;

    const userMessage = isTopicMode
      ? `Erstelle einen ${selectedFormat}-Post für ${selectedChannel} zum Thema „${topic.title}". Beginne mit dem Hook und halte dich strikt an die Brand Voice.`
      : message;

    const messages = [...conversation_history, { role: 'user', content: userMessage }];

    const requestConfig = {
      model: MODEL,
      max_tokens: 4096,
      system: systemPromptBase + platformHint + chartInfo + (hasCanaToken
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

    // Topic-Mode: Usage tracking (non-blocking)
    if (isTopicMode && topic) {
      trackTopicUsage({
        topic_id: topic.id,
        topic_title: topic.title,
        category_id: topic.category_id,
        channel: selectedChannel,
        format: selectedFormat,
      }).catch(() => { /* non-critical */ });
    }

    return res.json({
      response: textContent,
      canva_connected: hasCanaToken,
      tool_activities: toolActivities,
      model: MODEL,
      ...(isTopicMode && topic ? {
        topic: {
          id: topic.id, title: topic.title, hook: topic.hook,
          category_id: topic.category_id, category_name: topic.category_name,
          pillar: topic.pillar, cta: topic.cta,
        },
        format: selectedFormat,
        channel: selectedChannel,
      } : {}),
    });
  } catch (error) {
    console.error('[social-agent] Error:', error.message);
    if (error.message?.includes('401')) return res.status(401).json({ error: 'Canva-Token ungültig', canva_auth_required: true });
    return res.status(500).json({ error: 'Fehler beim Social-Media-Agenten', details: error.message });
  }
}

module.exports = { handleSocialAgent };

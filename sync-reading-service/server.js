/**
 * Sync Reading Service
 * HTTP Service für synchrone Reading-Generierung im Chat
 * Läuft auf Port 7001
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = process.env.PORT || 7001;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sync-reading-service', port: PORT });
});

const readingTypes = {
  business: {
    name: 'Business Reading',
    systemPrompt: `Du bist ein Human Design Reading Experte mit Fokus auf Business und Karriere.
Erstelle ein prägnantes, umsetzungsorientiertes Business Reading basierend auf der Anfrage.
**Struktur:**
1. **Kurze Einleitung** (1-2 Sätze)
2. **Kernaussage** zum Business-Thema (2-3 Absätze)
3. **Konkrete Handlungsempfehlungen** (3-5 Bullet Points)
4. **Zusammenfassung** (1-2 Sätze)
Stil: Direkt, professionell, umsetzbar.`,
  },
  basic: {
    name: 'Personality Reading',
    systemPrompt: `Du bist ein Human Design Reading Experte mit Fokus auf Persönlichkeit und Selbsterkenntnis.
Erstelle ein prägnantes Personality Reading basierend auf der Anfrage.
**Struktur:**
1. **Kurze Einleitung** (1-2 Sätze)
2. **Persönlichkeitsaspekte** (2-3 Absätze)
3. **Stärken & Potenziale** (3-5 Bullet Points)
4. **Zusammenfassung** (1-2 Sätze)
Stil: Empathisch, inspirierend, erkenntnisreich.`,
  },
  relationship: {
    name: 'Relationship Reading',
    systemPrompt: `Du bist ein Human Design Reading Experte mit Fokus auf Beziehungen und Interaktion.
Erstelle ein prägnantes Relationship Reading basierend auf der Anfrage.
**Struktur:**
1. **Kurze Einleitung** (1-2 Sätze)
2. **Beziehungsdynamik** (2-3 Absätze)
3. **Kommunikationstipps** (3-5 Bullet Points)
4. **Zusammenfassung** (1-2 Sätze)
Stil: Sensibel, praktisch, beziehungsorientiert.`,
  },
  detailed: {
    name: 'Crisis/Detailed Reading',
    systemPrompt: `Du bist ein Human Design Reading Experte mit Fokus auf tiefgehende Analysen und Krisenbegleitung.
Erstelle ein ausführliches, tiefgehendes Reading basierend auf der Anfrage.
**Struktur:**
1. **Situationsanalyse** (2-3 Absätze)
2. **Tiefere Einsichten** (3-4 Absätze)
3. **Transformationsschritte** (5-7 Bullet Points)
4. **Abschluss & Ausblick** (2-3 Sätze)
Stil: Einfühlsam, tiefgründig, transformativ.`,
  },
};

app.post('/reading/generate', async (req, res) => {
  const startTime = Date.now();
  try {
    const { readingType, clientName, message } = req.body;
    if (!readingType || !message) {
      return res.status(400).json({ ok: false, error: 'readingType and message are required' });
    }
    const readingConfig = readingTypes[readingType];
    if (!readingConfig) {
      return res.status(400).json({ ok: false, error: `Invalid readingType: ${readingType}. Valid: ${Object.keys(readingTypes).join(', ')}` });
    }
    const userName = clientName || 'Coach-User';
    console.log(`📖 [${readingType}] Reading-Anfrage von ${userName}: "${message.substring(0, 50)}..."`);

    const result = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: readingConfig.systemPrompt,
      messages: [{ role: 'user', content: `**Anfrage von ${userName}:**\n\n${message}` }]
    });

    const text = result.content[0].text;
    const tokensUsed = result.usage.input_tokens + result.usage.output_tokens;
    const runtime = Date.now() - startTime;

    console.log(`✅ [${readingType}] Reading generiert (${tokensUsed} tokens, ${runtime}ms)`);

    res.json({
      ok: true,
      result: text,
      metadata: { readingType, clientName: userName, tokens: tokensUsed, model: 'claude-sonnet-4-5', runtimeMs: runtime, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    const runtime = Date.now() - startTime;
    console.error('❌ Reading Error:', error.message);
    res.status(500).json({ ok: false, error: error.message, metadata: { runtimeMs: runtime, timestamp: new Date().toISOString() } });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sync Reading Service läuft auf Port ${PORT}`);
  console.log(`   Endpoint: POST /reading/generate`);
  console.log(`   Health: GET /health`);
  console.log(`   Verfügbare Reading-Types: ${Object.keys(readingTypes).join(', ')}`);
});

/**
 * Sync Reading Service — synchrone HD-Reading-Generierung.
 * Port 7001.
 *
 * Input-Modi (jeweils per readingType):
 *   relationship: { person1, chart1, person2, chart2 } — Fakten werden hier berechnet
 *   basic / personality: { person, chart }
 *   business / detailed: { message } (legacy)
 *
 * Legacy-Fallback: wer einen freien `message`-String schickt, kriegt das alte
 * Verhalten (ohne deterministische Fakten).
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import {
  SYSTEM_PROMPTS,
  buildPersonalityUserPrompt,
  buildRelationshipUserPrompt,
} from './lib/prompt-builder.js';

const app = express();
const PORT = process.env.PORT || 7001;
const MODEL = process.env.SYNC_READING_MODEL || 'claude-sonnet-4-5';
const MAX_TOKENS = parseInt(process.env.SYNC_READING_MAX_TOKENS || '2200', 10);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sync-reading-service', port: PORT, model: MODEL });
});

const TYPE_ALIASES = {
  basic: 'basic',
  personality: 'basic',
  relationship: 'relationship',
  resonance: 'relationship',
  business: 'business',
  detailed: 'detailed',
};

/**
 * Streicht typische Konjunktiv-/Vagheits-Phrasen aus der finalen Antwort,
 * falls Claude sie trotz Verbot benutzt hat.
 */
function stripHedging(text) {
  if (!text) return text;
  let out = text;
  // Wort-für-Wort-Ersetzungen — case-insensitiv, Wortgrenzen beachten
  const replacements = [
    [/\bpotenziell\s+/gi, ''],
    [/\bpotentiell\s+/gi, ''],
    [/\bmöglicherweise\s+/gi, ''],
    [/\bvielleicht\s+/gi, ''],
    [/\beventuell\s+/gi, ''],
    [/\btendenziell\s+/gi, ''],
    [/\bvermutlich\s+/gi, ''],
    [/\bwahrscheinlich\s+/gi, ''],
    [/\bunter\s+Umständen\s+/gi, ''],
    [/\bkann\s+(\w+)\s+werden\b/gi, 'wird $1'],
    [/\bkönnte\s+(\w+en)\b/gi, '$1'],
    [/\bwird\s+potenziell\s+aktiviert\b/gi, 'ist aktiviert'],
    [/\bwird\s+potentiell\s+aktiviert\b/gi, 'ist aktiviert'],
    [/\bpotenziell\s+aktiviert\b/gi, 'aktiviert'],
    // Doppel-Spaces nach den Streichungen
  ];
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  out = out.replace(/[ \t]{2,}/g, ' ');
  return out;
}

function buildPrompts(readingType, body) {
  const t = TYPE_ALIASES[readingType] || readingType;

  if (t === 'relationship') {
    const { person1, chart1, person2, chart2, message } = body;
    if (chart1 && chart2) {
      return {
        type: t,
        system: SYSTEM_PROMPTS.relationship,
        user: buildRelationshipUserPrompt({ person1, chart1, person2, chart2 }),
        mode: 'structured',
      };
    }
    if (message) {
      return { type: t, system: SYSTEM_PROMPTS.relationship, user: message, mode: 'legacy' };
    }
    throw new Error('relationship: chart1 und chart2 (oder legacy message) erforderlich');
  }

  if (t === 'basic') {
    const { person, chart, message } = body;
    if (chart) {
      return {
        type: t,
        system: SYSTEM_PROMPTS.basic,
        user: buildPersonalityUserPrompt({ person, chart }),
        mode: 'structured',
      };
    }
    if (message) {
      return { type: t, system: SYSTEM_PROMPTS.basic, user: message, mode: 'legacy' };
    }
    throw new Error('basic: chart (oder legacy message) erforderlich');
  }

  // business / detailed: kein strukturierter Modus, nur message
  if (!body.message) throw new Error(`${t}: message erforderlich`);
  return { type: t, system: SYSTEM_PROMPTS[t] || SYSTEM_PROMPTS.basic, user: body.message, mode: 'legacy' };
}

app.post('/reading/generate', async (req, res) => {
  const startTime = Date.now();
  try {
    const { readingType, clientName } = req.body || {};
    if (!readingType) {
      return res.status(400).json({ ok: false, error: 'readingType ist erforderlich' });
    }
    if (!TYPE_ALIASES[readingType]) {
      return res.status(400).json({
        ok: false,
        error: `Ungültiger readingType: ${readingType}. Gültig: ${Object.keys(TYPE_ALIASES).join(', ')}`,
      });
    }

    let prompts;
    try {
      prompts = buildPrompts(readingType, req.body || {});
    } catch (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }

    const userName = clientName || 'Anfragende:r';
    console.log(
      `📖 [${prompts.type}/${prompts.mode}] Reading-Anfrage von ${userName} ` +
      `(promptLen=${prompts.user.length})`
    );

    const result = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: prompts.system,
      messages: [{ role: 'user', content: prompts.user }],
    });

    const rawText = (result.content?.[0]?.text || '').trim();
    const cleanedText = stripHedging(rawText);
    const tokensUsed = (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0);
    const runtime = Date.now() - startTime;

    console.log(
      `✅ [${prompts.type}/${prompts.mode}] generiert (${tokensUsed} tokens, ${runtime}ms, ` +
      `cleaned=${cleanedText.length !== rawText.length})`
    );

    res.json({
      ok: true,
      result: cleanedText,
      metadata: {
        readingType: prompts.type,
        promptMode: prompts.mode,
        clientName: userName,
        tokens: tokensUsed,
        model: MODEL,
        runtimeMs: runtime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const runtime = Date.now() - startTime;
    console.error('❌ Reading Error:', error.message);
    res.status(500).json({
      ok: false,
      error: error.message,
      metadata: { runtimeMs: runtime, timestamp: new Date().toISOString() },
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sync Reading Service läuft auf Port ${PORT}`);
  console.log(`   Model: ${MODEL}, MaxTokens: ${MAX_TOKENS}`);
  console.log(`   Endpoint: POST /reading/generate`);
  console.log(`   Health: GET /health`);
  console.log(`   ReadingTypes: ${[...new Set(Object.values(TYPE_ALIASES))].join(', ')}`);
});

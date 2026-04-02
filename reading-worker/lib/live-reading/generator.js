/**
 * Live Reading Agent — Anthropic API Calls
 * FIX (2026-03-31): highlightElements aus echten Chart-Daten
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildStepUserPrompt, buildSummaryPrompt, buildHighlightElements } from './prompts.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

export async function generateStepContent(session, stepId, coachNotes, readingType) {
  const systemPrompt = buildSystemPrompt(
    session.chart_data,
    session.completed_steps,
    coachNotes,
    session.language,
    readingType
  );
  const userPrompt = buildStepUserPrompt(stepId, session.chart_data);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0]?.text || '{}';
  const parsed = parseJSON(raw);

  const highlightElements = buildHighlightElements(stepId, session.chart_data);

  return {
    talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
    highlightElements,
    transitionPrompt: parsed.transitionPrompt ?? '',
    generatedAt: new Date().toISOString(),
  };
}

export async function generateSessionSummary(session) {
  const completedEntries = Object.entries(session.completed_steps || {});
  const stepsCompleted = completedEntries.length;
  const sessionDuration = completedEntries.reduce(
    (sum, [, step]) => sum + (step.timeSpent || 0),
    0
  );

  const { system, user } = buildSummaryPrompt(session);

  let keyInsights = [];
  let nextSteps = [];

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const parsed = parseJSON(response.content[0]?.text || '{}');
    keyInsights = Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [];
    nextSteps = Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [];
  } catch (err) {
    console.error('[Live-Reading] Summary-Generierung fehlgeschlagen:', err.message);
  }

  return { keyInsights, nextSteps, sessionDuration, stepsCompleted };
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    try {
      return JSON.parse(stripped);
    } catch {
      console.error('[Live-Reading] JSON-Parse fehlgeschlagen:', raw.substring(0, 200));
      return {};
    }
  }
}

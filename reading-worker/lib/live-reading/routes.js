/**
 * Live Reading Agent — Express Router
 *
 * Endpoints:
 *   POST   /api/live-reading/session
 *   GET    /api/live-reading/session/:sessionId
 *   POST   /api/live-reading/session/:sessionId/step/:stepId/generate
 *   PUT    /api/live-reading/session/:sessionId/step/:stepId/notes
 *   POST   /api/live-reading/session/:sessionId/complete
 */

import { Router } from 'express';
import { getSteps, isValidStep } from './templates.js';
import { createSessionStore } from './session.js';
import { generateStepContent, generateSessionSummary } from './generator.js';

export function createLiveReadingRouter(supabase) {
  const router = Router();
  const store = createSessionStore(supabase);

  // ── POST /api/live-reading/session ──────────────────────────────────────────
  router.post('/session', async (req, res) => {
    try {
      const { mode, template, chartData, language = 'de', readingType } = req.body || {};

      if (!mode || !template || !chartData?.person1) {
        return res.status(400).json({ success: false, error: 'mode, template und chartData.person1 sind erforderlich' });
      }
      if (mode === 'connection' && !chartData.person2) {
        return res.status(400).json({ success: false, error: 'chartData.person2 ist erforderlich für Connection-Mode' });
      }

      const steps = getSteps(mode, template);
      const session = await store.create({ mode, template, language, chartData, steps, readingType });

      return res.status(201).json({
        sessionId: session.id,
        mode: session.mode,
        template: session.template,
        steps: session.steps,
        createdAt: session.created_at,
      });
    } catch (err) {
      console.error('[Live-Reading] Session erstellen:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── GET /api/live-reading/session/:sessionId ────────────────────────────────
  router.get('/session/:sessionId', async (req, res) => {
    try {
      const session = await store.get(req.params.sessionId);
      if (!session) return res.status(404).json({ success: false, error: 'Session nicht gefunden' });
      return res.json(session);
    } catch (err) {
      console.error('[Live-Reading] Session laden:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── POST /api/live-reading/session/:sessionId/step/:stepId/generate ─────────
  router.post('/session/:sessionId/step/:stepId/generate', async (req, res) => {
    try {
      const { sessionId, stepId } = req.params;
      const regenerate = req.query.regenerate === 'true';
      const { coachNotes, readingType } = req.body || {};

      const session = await store.get(sessionId);
      if (!session) return res.status(404).json({ success: false, error: 'Session nicht gefunden' });
      if (session.status === 'completed') return res.status(400).json({ success: false, error: 'Session ist bereits abgeschlossen' });
      if (!isValidStep(stepId, session.steps)) return res.status(400).json({ success: false, error: `Step "${stepId}" existiert nicht in dieser Session` });

      // Cache check
      const cached = session.completed_steps?.[stepId];
      if (cached?.result && !regenerate) {
        return res.json({ stepId, ...cached.result, cached: true });
      }

      const effectiveReadingType = readingType || session.reading_type;
      const result = await generateStepContent(session, stepId, coachNotes, effectiveReadingType);

      // Cache in session
      const existingStep = cached || {};
      await store.saveStep(sessionId, stepId, {
        result,
        ...(existingStep.coachNotes !== undefined ? { coachNotes: existingStep.coachNotes } : {}),
        ...(existingStep.timeSpent !== undefined ? { timeSpent: existingStep.timeSpent } : {}),
      });

      return res.json({ stepId, ...result, cached: false });
    } catch (err) {
      console.error('[Live-Reading] Step generieren:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── PUT /api/live-reading/session/:sessionId/step/:stepId/notes ─────────────
  router.put('/session/:sessionId/step/:stepId/notes', async (req, res) => {
    try {
      const { sessionId, stepId } = req.params;
      const { notes, timeSpent } = req.body || {};

      if (typeof notes !== 'string') {
        return res.status(400).json({ success: false, error: '"notes" muss ein String sein' });
      }

      const session = await store.get(sessionId);
      if (!session) return res.status(404).json({ success: false, error: 'Session nicht gefunden' });
      if (!isValidStep(stepId, session.steps)) return res.status(400).json({ success: false, error: `Step "${stepId}" existiert nicht in dieser Session` });

      await store.saveNotes(sessionId, stepId, notes, timeSpent);
      return res.json({ success: true, stepId, saved: true });
    } catch (err) {
      console.error('[Live-Reading] Notizen speichern:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── POST /api/live-reading/session/:sessionId/complete ──────────────────────
  router.post('/session/:sessionId/complete', async (req, res) => {
    try {
      const session = await store.get(req.params.sessionId);
      if (!session) return res.status(404).json({ success: false, error: 'Session nicht gefunden' });
      if (session.status === 'completed') return res.status(400).json({ success: false, error: 'Session ist bereits abgeschlossen' });

      const [summary] = await Promise.all([
        generateSessionSummary(session),
        store.complete(req.params.sessionId),
      ]);

      return res.json({ summary });
    } catch (err) {
      console.error('[Live-Reading] Session abschließen:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

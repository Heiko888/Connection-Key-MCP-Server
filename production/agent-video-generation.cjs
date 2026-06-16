/**
 * Video-Generierungs-Handler — echte Videos via Runway API (Modell: seedance2)
 *
 * Routen (in mcp-gateway.js registriert):
 *   POST /agent/video/generate          → startet Generierung, liefert { taskId, status }
 *   GET  /agent/video/status/:taskId    → fragt Status ab, liefert bei SUCCEEDED { output: [urls] }
 *
 * Auth: Env-Var RUNWAYML_API_SECRET (Runway Developer Portal). Nie hardcoden.
 * Im Gegensatz zu agent-video.js (nur Text/Skripte via Claude) erzeugt dieser
 * Handler fertige Videodateien.
 *
 * Modi:
 *   - text       : promptText
 *   - image      : promptImage (HTTPS-URL) als erstes Frame + promptText
 *   - reference  : references[] (HTTPS-URLs, Tags IMG_1..IMG_n, im promptText via @IMG_n adressiert)
 *
 * Asynchron: /generate startet nur (Runway-Generierung dauert Minuten); der Client
 * pollt /status. So vermeiden wir HTTP-/Nginx-Timeouts.
 */

const RunwayMLModule = require('@runwayml/sdk');
const RunwayML = RunwayMLModule.default || RunwayMLModule;
const { toFile, TaskFailedError } = RunwayMLModule;

const MODEL = process.env.RUNWAY_VIDEO_MODEL || 'seedance2';
const DEFAULT_RATIO = '1280:720';
const DEFAULT_DURATION = 5;

function getClient() {
  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) {
    const err = new Error('RUNWAYML_API_SECRET nicht konfiguriert');
    err.code = 'NO_API_KEY';
    throw err;
  }
  return new RunwayML({ apiKey });
}

const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);
const isDataUri = (s) => typeof s === 'string' && /^data:/i.test(s);

// Bild-Input → nutzbare Runway-URI.
// HTTPS-URL: direkt. Data-URI/base64: per Ephemeral-Upload hochladen.
async function resolveImage(client, src) {
  if (isUrl(src)) return src;
  if (isDataUri(src)) {
    const m = src.match(/^data:([^;]+);base64,(.*)$/);
    if (!m) throw new Error('Ungültige Data-URI für Bild');
    const buffer = Buffer.from(m[2], 'base64');
    const ext = (m[1].split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
    const uploaded = await client.uploads.createEphemeral({
      file: await toFile(buffer, `upload.${ext}`, { type: m[1] }),
    });
    return uploaded.uri;
  }
  throw new Error('Bild muss eine HTTPS-URL oder Data-URI (base64) sein');
}

async function buildRequest(client, body) {
  const mode = body.mode || 'text';
  const ratio = body.ratio || DEFAULT_RATIO;
  const duration = Number(body.duration) || DEFAULT_DURATION;
  const model = body.model || MODEL;
  const promptText = body.prompt || body.promptText;
  const images = body.images || (body.image ? [body.image] : []);
  const common = { model, ratio, duration };

  switch (mode) {
    case 'text':
      return { resource: 'textToVideo', body: { ...common, promptText } };
    case 'image': {
      if (images.length < 1) throw new Error('mode "image" braucht ein Bild (images[0])');
      const uri = await resolveImage(client, images[0]);
      return { resource: 'imageToVideo', body: { ...common, promptImage: uri, promptText } };
    }
    case 'reference': {
      if (images.length < 1) throw new Error('mode "reference" braucht mindestens ein Bild');
      const references = [];
      for (let i = 0; i < images.length; i++) {
        references.push({ uri: await resolveImage(client, images[i]), tag: `IMG_${i + 1}` });
      }
      return { resource: 'textToVideo', body: { ...common, promptText, references } };
    }
    default:
      throw new Error(`Unbekannter mode: ${mode} (erlaubt: text|image|reference)`);
  }
}

// POST /agent/video/generate
async function handleVideoGenerate(req, res) {
  const startTime = Date.now();
  try {
    const { prompt, promptText, mode = 'text' } = req.body || {};
    if (!prompt && !promptText) {
      return res.status(400).json({ success: false, agent: 'video-generation', error: 'prompt is required' });
    }
    const client = getClient();
    const { resource, body } = await buildRequest(client, req.body);

    // Nur starten – NICHT auf Fertigstellung warten (Client pollt /status).
    const task = await client[resource].create(body);

    return res.json({
      success: true,
      agent: 'video-generation',
      taskId: task.id,
      status: 'PENDING',
      model: body.model,
      mode,
      runtimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[video-generation] generate Fehler:', error.message);
    const status = error.code === 'NO_API_KEY' ? 503 : (error.status || 500);
    return res.status(status).json({
      success: false, agent: 'video-generation', error: error.message,
      runtimeMs: Date.now() - startTime, timestamp: new Date().toISOString(),
    });
  }
}

// GET /agent/video/status/:taskId
async function handleVideoStatus(req, res) {
  try {
    const taskId = req.params.taskId;
    if (!taskId) return res.status(400).json({ success: false, error: 'taskId is required' });

    const client = getClient();
    const task = await client.tasks.retrieve(taskId);

    const payload = {
      success: true,
      agent: 'video-generation',
      taskId,
      status: task.status, // PENDING | THROTTLED | RUNNING | SUCCEEDED | FAILED | CANCELLED
      progress: task.progress ?? null,
      timestamp: new Date().toISOString(),
    };
    if (task.status === 'SUCCEEDED') payload.output = task.output || [];
    if (task.status === 'FAILED') {
      payload.error = task.failure || 'Task fehlgeschlagen';
      payload.failureCode = task.failureCode || null;
    }
    return res.json(payload);
  } catch (error) {
    console.error('[video-generation] status Fehler:', error.message);
    const status = error.code === 'NO_API_KEY' ? 503 : (error.status || 500);
    return res.status(status).json({ success: false, agent: 'video-generation', error: error.message });
  }
}

module.exports = { handleVideoGenerate, handleVideoStatus };

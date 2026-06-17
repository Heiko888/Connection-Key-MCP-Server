/**
 * Zentrales TTS-Util auf .138 — EINE Quelle für Sprachausgabe.
 *
 * Wird genutzt von:
 *   - POST /api/tts/speak (synchron, Chat-Vorlesen → MP3-Bytes; server.js)
 *   - workers/audio-worker.js (Voice-Reading, gechunkt → MP3 in Storage)
 *
 * Provider per ENV umschaltbar (TTS_PROVIDER = 'openai' (Default) | 'elevenlabs').
 * API-Keys leben ausschließlich hier auf .138 (Goldene Regel: alle KI/Berechnung auf .138).
 *   OpenAI:     OPENAI_API_KEY, TTS_OPENAI_MODEL (gpt-4o-mini-tts), TTS_OPENAI_VOICE (nova)
 *   ElevenLabs: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID (eleven_multilingual_v2)
 */

export const MAX_TTS_CHARS = 5000;

const EL_API_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const EL_OUTPUT_FORMAT = process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";

/** Welche Stimm-/Modell-Signatur ist aktiv (für Cache-Busting auf .167 abrufbar). */
export function ttsVoiceSignature() {
  const provider = (process.env.TTS_PROVIDER || "openai").toLowerCase();
  if (provider === "elevenlabs") {
    return `elevenlabs:${process.env.ELEVENLABS_VOICE_ID || ""}:${process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2"}`;
  }
  return `openai:${process.env.TTS_OPENAI_VOICE || "nova"}:${process.env.TTS_OPENAI_MODEL || "gpt-4o-mini-tts"}`;
}

/**
 * Low-Level ElevenLabs-Call → MP3-Buffer. Wirft bei Fehler (err.statusCode gesetzt).
 * Einziger ElevenLabs-Aufrufer im System.
 */
export async function elevenLabsTTS(text, { voiceId, modelId, speed } = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) { const e = new Error("ELEVENLABS_API_KEY nicht konfiguriert"); e.statusCode = 503; e.code = "NO_API_KEY"; throw e; }
  const vId = voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const model = modelId || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

  const voiceSettings = { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true };
  if (typeof speed === "number") voiceSettings.speed = Math.min(1.2, Math.max(0.7, speed));

  const res = await fetch(`${EL_API_BASE}/${encodeURIComponent(vId)}?output_format=${encodeURIComponent(EL_OUTPUT_FORMAT)}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: model, voice_settings: voiceSettings }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { const j = await res.json(); detail = j?.detail?.message || j?.detail?.status || JSON.stringify(j?.detail || j) || detail; } catch { /* non-JSON */ }
    const e = new Error(`ElevenLabs TTS fehlgeschlagen: ${detail}`); e.statusCode = res.status; throw e;
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Low-Level OpenAI-TTS-Call → MP3-Buffer. Wirft bei Fehler (err.statusCode gesetzt). */
export async function openAiTTS(text, { voice, model, speed } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { const e = new Error("OPENAI_API_KEY nicht konfiguriert"); e.statusCode = 503; e.code = "NO_API_KEY"; throw e; }
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || process.env.TTS_OPENAI_MODEL || "gpt-4o-mini-tts",
      voice: voice || process.env.TTS_OPENAI_VOICE || "nova",
      input: text,
      response_format: "mp3",
      speed: Math.min(4, Math.max(0.25, typeof speed === "number" ? speed : 1.0)),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`OpenAI ${res.status}: ${detail.slice(0, 140)}`); e.statusCode = res.status; throw e;
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Synchroner Provider-Switch für kurze Texte (Chat-Vorlesen).
 * Liefert { ok, audio: Buffer, contentType } oder { ok:false, status, error }.
 */
export async function synthesizeSpeech(rawText, { speed, provider, voiceId } = {}) {
  const text = (rawText || "").trim().slice(0, MAX_TTS_CHARS);
  if (!text) return { ok: false, status: 400, error: "Kein Text" };
  const prov = (provider || process.env.TTS_PROVIDER || "openai").toLowerCase();
  const spd = typeof speed === "number" ? speed : (Number(process.env.TTS_SPEED) || 1.1);
  try {
    const audio = prov === "elevenlabs"
      ? await elevenLabsTTS(text, { voiceId, speed: spd })
      : await openAiTTS(text, { speed: spd });
    return { ok: true, audio, contentType: "audio/mpeg" };
  } catch (e) {
    return { ok: false, status: e.statusCode || 502, error: e.message || "TTS-Fehler" };
  }
}

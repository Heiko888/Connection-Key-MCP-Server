/**
 * Audio Worker — Voice-Reading via ElevenLabs TTS (v8 Phase 1)
 * Queue: audio-queue
 *
 * Robuster, persistenter Pfad (vgl. video-worker / psychology-worker):
 *   1. HTTP-Route /api/audio/generate legt eine audio_jobs-Row an (pending) + enqueued { jobId }
 *   2. Dieser Worker löst den Text auf (direkt ODER aus public.readings.reading_data.text),
 *      ruft ElevenLabs TTS auf (chunked bei langen Readings), konkateniert die MP3-Teile,
 *      speichert das Ergebnis PERMANENT im Supabase-Storage-Bucket "generated-audio" und
 *      schreibt status/audio_url zurück in audio_jobs.
 *
 * Kein neues SDK nötig — ElevenLabs wird über die REST-API (fetch) angesprochen.
 * Der MP3-Voiceover ist bewusst ein eigenständiger Baustein, damit ihn die spätere
 * Reading→Video-Phase (v8 Phase 2) als Tonspur wiederverwenden kann.
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import { elevenLabsTTS } from "../lib/tts.js";

const QUEUE_NAME = "audio-queue";
const BUCKET = "generated-audio";
const DEFAULT_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
// Multilingual-fähige Default-Stimme ("Rachel"); via ENV überschreibbar.
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
// ElevenLabs verarbeitet pro Request begrenzt viele Zeichen → Readings werden gechunkt.
const MAX_CHARS = parseInt(process.env.ELEVENLABS_MAX_CHARS || "4500", 10);

// ─── Clients ────────────────────────────────────────────────────────────────
function createClients() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
  const supabaseUrl = process.env.V4_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const apiKey = process.env.ELEVENLABS_API_KEY || null;
  return { redis, supabase, apiKey };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Text in TTS-freundliche Chunks ≤ MAX_CHARS schneiden (an Absätzen/Sätzen). */
function chunkText(text, maxChars = MAX_CHARS) {
  const clean = String(text || "").replace(/\r\n/g, "\n").trim();
  if (clean.length <= maxChars) return clean ? [clean] : [];

  const paragraphs = clean.split(/\n{2,}/);
  const chunks = [];
  let buf = "";

  const pushBuf = () => { if (buf.trim()) chunks.push(buf.trim()); buf = ""; };

  for (const para of paragraphs) {
    if ((buf + "\n\n" + para).length <= maxChars) {
      buf = buf ? `${buf}\n\n${para}` : para;
      continue;
    }
    pushBuf();
    if (para.length <= maxChars) { buf = para; continue; }
    // Absatz selbst zu lang → an Satzgrenzen weiter zerlegen
    const sentences = para.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [para];
    for (const s of sentences) {
      if ((buf + " " + s).length <= maxChars) {
        buf = buf ? `${buf} ${s}`.trim() : s.trim();
      } else {
        pushBuf();
        // Notfall: harter Schnitt, falls ein einzelner "Satz" > maxChars
        let rest = s.trim();
        while (rest.length > maxChars) {
          chunks.push(rest.slice(0, maxChars));
          rest = rest.slice(maxChars);
        }
        buf = rest;
      }
    }
  }
  pushBuf();
  return chunks;
}

async function updateJob(supabase, jobId, fields) {
  const { error } = await supabase
    .from("audio_jobs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", jobId);
  if (error) console.error(`   ⚠️ [Audio] audio_jobs UPDATE (${jobId}):`, error.message);
}

/** Reading-Text aus public.readings auflösen (gleiches Feld wie PDF/E-Mail: reading_data.text). */
async function resolveReadingText(supabase, readingId) {
  const { data, error } = await supabase
    .from("readings")
    .select("reading_data, client_name")
    .eq("id", readingId)
    .single();
  if (error || !data) throw new Error(`Reading ${readingId} nicht gefunden: ${error?.message || "—"}`);
  const text = data.reading_data?.text || "";
  if (!text.trim()) throw new Error(`Reading ${readingId} enthält keinen Text (reading_data.text leer)`);
  return { text, title: data.client_name || null };
}

// ─── Job Processor ──────────────────────────────────────────────────────────
async function processJob(job, { supabase, apiKey }) {
  const { jobId } = job.data;
  console.log(`📥 [Audio] Job ${job.id} | audio_jobs=${jobId}`);

  if (!apiKey) {
    await updateJob(supabase, jobId, { status: "failed", error: "ELEVENLABS_API_KEY nicht konfiguriert", error_code: "NO_API_KEY" });
    throw new Error("ELEVENLABS_API_KEY nicht konfiguriert");
  }

  const { data: row, error: loadErr } = await supabase
    .from("audio_jobs").select("*").eq("id", jobId).single();
  if (loadErr || !row) throw new Error(`audio_jobs ${jobId} nicht gefunden: ${loadErr?.message}`);

  await updateJob(supabase, jobId, { status: "processing", progress: 5, started_at: new Date().toISOString() });

  try {
    // Text auflösen
    let text = row.text || "";
    let resolvedTitle = row.title || null;
    if (row.source === "reading" && row.reading_id) {
      const r = await resolveReadingText(supabase, row.reading_id);
      text = text || r.text;
      resolvedTitle = resolvedTitle || r.title;
    }
    if (!text.trim()) throw new Error("Kein Text zum Vertonen (text leer und kein Reading-Text)");

    const voiceId = row.voice_id || DEFAULT_VOICE;
    const modelId = row.model_id || DEFAULT_MODEL;
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("Text ergab keine vertonbaren Chunks");

    await updateJob(supabase, jobId, { status: "generating", progress: 10 });
    console.log(`   🔊 [Audio] ${chunks.length} Chunk(s), voice=${voiceId}, model=${modelId}, chars=${text.length}`);

    // Chunks vertonen, Fortschritt 10→80 über die Chunks verteilen
    const buffers = [];
    for (let i = 0; i < chunks.length; i++) {
      const buf = await elevenLabsTTS(chunks[i], { voiceId, modelId });
      buffers.push(buf);
      const progress = 10 + Math.round(((i + 1) / chunks.length) * 70);
      await updateJob(supabase, jobId, { progress });
    }

    const audioBuffer = Buffer.concat(buffers);
    await updateJob(supabase, jobId, { progress: 85, title: resolvedTitle });

    // Permanent in Supabase Storage sichern
    const path = `${jobId}.mp3`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, audioBuffer, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw new Error(`Storage-Upload fehlgeschlagen: ${upErr.message}`);

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    await updateJob(supabase, jobId, {
      status: "completed",
      progress: 100,
      audio_path: `${BUCKET}/${path}`,
      audio_url: pub?.publicUrl || null,
      result: { size: audioBuffer.length, char_count: text.length, chunks: chunks.length, voice_id: voiceId, model_id: modelId },
      finished_at: new Date().toISOString(),
    });

    console.log(`   ✅ [Audio] Job ${job.id} fertig → ${pub?.publicUrl}`);
    return { jobId, status: "completed", audio_url: pub?.publicUrl };
  } catch (err) {
    console.error(`   ❌ [Audio] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateJob(supabase, jobId, {
      status: "failed",
      error: err.message,
      error_code: err.statusCode ? `ELEVENLABS_${err.statusCode}` : "TTS_ERROR",
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────
let audioQueue = null;
export function getAudioQueue() { return audioQueue; }

export function startAudioWorker() {
  const { redis, supabase, apiKey } = createClients();
  audioQueue = new Queue(QUEUE_NAME, { connection: redis });

  const worker = new Worker(
    QUEUE_NAME,
    (job) => processJob(job, { supabase, apiKey }),
    { connection: redis, concurrency: 2, settings: { maxStalledCount: 1 } }
  );
  worker.on("failed", (job, err) => {
    console.error(`❌ [Audio] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Audio Worker aktiv (Queue: ${QUEUE_NAME}, Modell: ${DEFAULT_MODEL}, ElevenLabs: ${apiKey ? "✅" : "❌ kein Key"})`);
  return { worker, queue: audioQueue };
}

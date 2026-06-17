/**
 * Reading-Video Worker — Reading → narriertes Video (v8 Phase 2, MVP).
 * Queue: reading-video-queue
 *
 * Flow (persistenter Row-Pattern wie audio/video/psychology):
 *   1. /api/reading-video/generate legt reading_video_jobs-Row (pending) an + enqueued { jobId }
 *   2. Dieser Worker: Reading laden → Voiceover (TTS, Default OpenAI) → Slides rendern
 *      (Titel + chart-spezifischer Bodygraph + Text-Slides) → ffmpeg-Slideshow + Audiospur
 *      → MP4 permanent in Bucket "generated-reading-videos" → status/video_url fortschreiben.
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { synthesizeLongText } from "../lib/tts.js";
import { titleSlidePng, bodygraphSlidePng, textSlidePng, paginateReadingText } from "../lib/slides.js";
import { composeSlideshow, probeDurationSec } from "../lib/video-compose.js";

const QUEUE_NAME = "reading-video-queue";
const BUCKET = "generated-reading-videos";
const TIMEOUT_MS = parseInt(process.env.READING_VIDEO_TIMEOUT_MS || "900000", 10);
const RES = (process.env.READING_VIDEO_RESOLUTION || "720p") === "1080p"
  ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };

function createClients() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
  const supabase = createClient(
    process.env.V4_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY,
  );
  return { redis, supabase };
}

async function updateJob(supabase, jobId, fields) {
  const { error } = await supabase.from("reading_video_jobs")
    .update({ ...fields, updated_at: new Date().toISOString() }).eq("id", jobId);
  if (error) console.error(`   ⚠️ [ReadingVideo] UPDATE (${jobId}):`, error.message);
}

const READING_TYPE_LABEL = {
  basic: "Basis-Reading", business: "Business-Reading", relationship: "Beziehungs-Reading",
  connection: "Connection-Reading", penta: "Penta-Reading", detailed: "Ausführliches Reading",
};

async function processJob(job, { supabase }) {
  const { jobId } = job.data;
  console.log(`📥 [ReadingVideo] Job ${job.id} | reading_video_jobs=${jobId}`);

  const { data: row, error: loadErr } = await supabase
    .from("reading_video_jobs").select("*").eq("id", jobId).single();
  if (loadErr || !row) throw new Error(`reading_video_jobs ${jobId} nicht gefunden: ${loadErr?.message}`);

  await updateJob(supabase, jobId, { status: "processing", progress: 5, started_at: new Date().toISOString() });

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `rv-${jobId}-`));
  try {
    // 1) Reading laden
    const { data: reading, error: rErr } = await supabase
      .from("readings").select("reading_data, chart_data, client_name, reading_type").eq("id", row.reading_id).single();
    if (rErr || !reading) throw new Error(`Reading ${row.reading_id} nicht gefunden: ${rErr?.message || "—"}`);
    const text = reading.reading_data?.text || "";
    if (!text.trim()) throw new Error("Reading enthält keinen Text (reading_data.text leer)");
    const chart = reading.chart_data || {};
    const name = reading.client_name || "Dein Reading";
    const subtitle = READING_TYPE_LABEL[reading.reading_type] || "Human Design Reading";

    // 2) Voiceover (TTS, Default OpenAI → kein ElevenLabs-Key nötig)
    await updateJob(supabase, jobId, { status: "generating", progress: 15 });
    // Sichtbarer Fortschritt: Vertonung langer Readings dauert Minuten (~51s/Chunk).
    // Progress pro Chunk im Fenster 15→40 fortschreiben (45% kommt nach probeDuration).
    const { audio, provider } = await synthesizeLongText(text, {
      voiceId: row.voice_id || undefined,
      onProgress: (done, total) =>
        updateJob(supabase, jobId, { progress: 15 + Math.round((done / total) * 25) }),
    });
    const audioPath = path.join(workDir, "voice.mp3");
    await fs.writeFile(audioPath, audio);
    const durationSec = await probeDurationSec(audioPath);
    await updateJob(supabase, jobId, { progress: 45 });

    // 3) Slides rendern (Titel + Bodygraph + Text-Slides)
    const textSlides = paginateReadingText(text);
    const slidePlan = [];
    slidePlan.push({ kind: "title", png: titleSlidePng(name, subtitle, RES), weight: 0.06 });
    slidePlan.push({ kind: "bodygraph", png: bodygraphSlidePng(chart, { ...RES, caption: "Dein Bodygraph" }), weight: 0.10 });
    const textWeightTotal = 0.84;
    const totalChars = textSlides.reduce((s, t) => s + Math.max(1, t.chars), 0);
    for (const ts of textSlides) {
      slidePlan.push({ kind: "text", png: textSlidePng(ts.lines, RES), weight: textWeightTotal * (Math.max(1, ts.chars) / totalChars) });
    }

    // 4) Slide-PNGs schreiben + Dauer aus Audiolänge verteilen
    const weightSum = slidePlan.reduce((s, p) => s + p.weight, 0);
    const slides = [];
    for (let i = 0; i < slidePlan.length; i++) {
      const pngPath = path.join(workDir, `slide-${String(i).padStart(3, "0")}.png`);
      await fs.writeFile(pngPath, slidePlan[i].png);
      slides.push({ pngPath, durationSec: (slidePlan[i].weight / weightSum) * durationSec });
    }
    await updateJob(supabase, jobId, { progress: 60 });

    // 5) ffmpeg-Composition
    const outPath = path.join(workDir, "out.mp4");
    await composeSlideshow({ slides, audioPath, outPath, ...RES, timeoutMs: TIMEOUT_MS });
    await updateJob(supabase, jobId, { progress: 85 });

    // 6) Permanent in Storage
    const buffer = await fs.readFile(outPath);
    const storagePath = `${jobId}.mp4`;
    const { error: upErr } = await supabase.storage.from(BUCKET)
      .upload(storagePath, buffer, { contentType: "video/mp4", upsert: true });
    if (upErr) throw new Error(`Storage-Upload fehlgeschlagen: ${upErr.message}`);
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    await updateJob(supabase, jobId, {
      status: "completed", progress: 100,
      video_path: `${BUCKET}/${storagePath}`, video_url: pub?.publicUrl || null,
      duration: Math.round(durationSec),
      result: { size: buffer.length, slides: slides.length, tts_provider: provider, resolution: `${RES.width}x${RES.height}` },
      finished_at: new Date().toISOString(),
    });
    console.log(`   ✅ [ReadingVideo] Job ${job.id} fertig → ${pub?.publicUrl}`);
    return { jobId, status: "completed", video_url: pub?.publicUrl };
  } catch (err) {
    console.error(`   ❌ [ReadingVideo] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateJob(supabase, jobId, {
      status: "failed", error: err.message,
      error_code: err.statusCode ? `TTS_${err.statusCode}` : "RENDER_ERROR",
      finished_at: new Date().toISOString(),
    });
    throw err;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

let readingVideoQueue = null;
export function getReadingVideoQueue() { return readingVideoQueue; }

export function startReadingVideoWorker() {
  const { redis, supabase } = createClients();
  readingVideoQueue = new Queue(QUEUE_NAME, { connection: redis });
  const worker = new Worker(
    QUEUE_NAME,
    (job) => processJob(job, { supabase }),
    { connection: redis, concurrency: 1, settings: { maxStalledCount: 1 } }, // CPU-schwer → seriell
  );
  worker.on("failed", (job, err) => console.error(`❌ [ReadingVideo] Job failed: ${job?.id}`, err.message));
  console.log(`🟢 Reading-Video Worker aktiv (Queue: ${QUEUE_NAME}, ${RES.width}x${RES.height})`);
  return { worker, queue: readingVideoQueue };
}

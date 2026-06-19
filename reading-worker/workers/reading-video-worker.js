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
import { titleSlidePng, bodygraphSlidePng, contentSlidePng, buildContentSlides } from "../lib/slides.js";
import { summarizeDefinition } from "../lib/bodygraph-svg.js";
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

    // 2) Slides bauen (Titel + chart-spezifischer Bodygraph + markdown-formatierte Content-Slides)
    await updateJob(supabase, jobId, { status: "generating", progress: 12 });
    const sum = summarizeDefinition(chart);
    const bgSpeak = sum.centerCount
      ? `Werfen wir einen Blick auf deinen Bodygraph. Du hast ${sum.centerCount} definierte Zentren: ${sum.centerLabels.join(", ")}.`
      : "Werfen wir einen Blick auf deinen Bodygraph.";
    const segments = [
      { png: titleSlidePng(name, subtitle, RES), speak: `${name}. ${subtitle}.` },
      { png: bodygraphSlidePng(chart, { ...RES, caption: "Dein Bodygraph" }), speak: bgSpeak },
      ...buildContentSlides(text, { height: RES.height }).map((s) => ({ png: contentSlidePng(s, RES), speak: s.speakText })),
    ];

    // 3) Voiceover in EINEM Durchlauf (chunked) — EINE Synthese, NICHT pro Slide.
    //    Pro-Slide-Calls wären bei ElevenLabs zu langsam/teuer. Reihenfolge der Narration
    //    == Reihenfolge der Slides (inkl. Titel + Bodygraph) → kein Intro-Versatz mehr.
    const fullNarration = segments.map((s) => s.speak).join("\n\n");
    const { audio } = await synthesizeLongText(fullNarration, {
      voiceId: row.voice_id || undefined,
      onProgress: (done, total) => updateJob(supabase, jobId, { progress: 15 + Math.round((done / total) * 50) }),
    });
    const audioPath = path.join(workDir, "voice.mp3");
    await fs.writeFile(audioPath, Buffer.from(audio));
    const durationSec = await probeDurationSec(audioPath);
    await updateJob(supabase, jobId, { progress: 70 });

    // 4) Slides rendern + Dauer proportional zur gesprochenen Zeichenzahl verteilen.
    //    Anteil je Slide == Anteil ihres Sprechtexts an der Gesamtnarration → Bild folgt dem Ton.
    const weights = segments.map((s) => Math.max(8, (s.speak || "").length));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const slides = [];
    for (let i = 0; i < segments.length; i++) {
      const pPath = path.join(workDir, `slide-${String(i).padStart(3, "0")}.png`);
      await fs.writeFile(pPath, segments[i].png);
      slides.push({ pngPath: pPath, durationSec: durationSec * (weights[i] / weightSum) });
    }
    await updateJob(supabase, jobId, { progress: 80 });

    // 5) ffmpeg-Composition (Slide-Dauern summieren sich auf die Audiolänge → synchron)
    const outPath = path.join(workDir, "out.mp4");
    await composeSlideshow({ slides, audioPath, outPath, ...RES, timeoutMs: TIMEOUT_MS });
    await updateJob(supabase, jobId, { progress: 88 });

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
      result: { size: buffer.length, slides: slides.length, tts_provider: (process.env.TTS_PROVIDER || "openai"), resolution: `${RES.width}x${RES.height}` },
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

/**
 * Video Worker — echte Video-Generierung via Runway / Seedance 2.0
 * Queue: video-queue
 *
 * Robuster, persistenter Pfad (vgl. psychology-worker):
 *   1. HTTP-Route /api/videos/generate legt eine video_jobs-Row an (pending) + enqueued { jobId }
 *   2. Dieser Worker ruft Runway auf, pollt bis fertig, lädt das Video herunter,
 *      speichert es PERMANENT im Supabase-Storage-Bucket "generated-videos" und
 *      schreibt status/video_url zurück in video_jobs.
 *
 * Multi-Shot (Seedance 2.0): `shots: string[]` wird zu einem strukturierten
 * Prompt ("Shot 1: … / Shot 2: …") zusammengesetzt; die Gesamtdauer wird erhöht.
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import RunwayML, { toFile, TaskFailedError } from "@runwayml/sdk";

const QUEUE_NAME = "video-queue";
const BUCKET = "generated-videos";
const MODEL = process.env.RUNWAY_VIDEO_MODEL || "seedance2";
const POLL_TIMEOUT_MS = parseInt(process.env.VIDEO_TIMEOUT_MS || "900000", 10); // 15 min
const PER_SHOT_SECONDS = 5;

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
  const runway = process.env.RUNWAYML_API_SECRET
    ? new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET })
    : null;
  return { redis, supabase, runway };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);
const isDataUri = (s) => typeof s === "string" && /^data:/i.test(s);

async function resolveImage(runway, src) {
  if (isUrl(src)) return src;
  if (isDataUri(src)) {
    const m = src.match(/^data:([^;]+);base64,(.*)$/);
    if (!m) throw new Error("Ungültige Data-URI für Bild");
    const buffer = Buffer.from(m[2], "base64");
    const ext = (m[1].split("/")[1] || "png").replace(/[^a-z0-9]/gi, "");
    const up = await runway.uploads.createEphemeral({
      file: await toFile(buffer, `upload.${ext}`, { type: m[1] }),
    });
    return up.uri;
  }
  throw new Error("Bild muss HTTPS-URL oder Data-URI (base64) sein");
}

// Multi-Shot → strukturierter Prompt
function composePrompt(prompt, shots) {
  if (Array.isArray(shots) && shots.length > 0) {
    return shots.map((s, i) => `Shot ${i + 1}: ${s}`).join("\n");
  }
  return prompt;
}

async function buildRequest(runway, row) {
  const shots = Array.isArray(row.shots) ? row.shots : null;
  const duration = shots && shots.length > 1
    ? Math.min(shots.length * PER_SHOT_SECONDS, 30)
    : (Number(row.duration) || 5);
  const promptText = composePrompt(row.prompt, shots);
  const common = { model: row.model || MODEL, ratio: row.ratio || "1280:720", duration };
  const images = Array.isArray(row.images) ? row.images : [];

  switch (row.mode) {
    case "image": {
      if (images.length < 1) throw new Error('mode "image" braucht ein Bild');
      const uri = await resolveImage(runway, images[0]);
      return { resource: "imageToVideo", body: { ...common, promptImage: uri, promptText } };
    }
    case "reference": {
      if (images.length < 1) throw new Error('mode "reference" braucht mindestens ein Bild');
      const references = [];
      for (let i = 0; i < images.length; i++) {
        references.push({ uri: await resolveImage(runway, images[i]), tag: `IMG_${i + 1}` });
      }
      return { resource: "textToVideo", body: { ...common, promptText, references } };
    }
    case "text":
    default:
      return { resource: "textToVideo", body: { ...common, promptText } };
  }
}

async function updateJob(supabase, jobId, fields) {
  const { error } = await supabase
    .from("video_jobs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", jobId);
  if (error) console.error(`   ⚠️ [Video] video_jobs UPDATE (${jobId}):`, error.message);
}

// ─── Job Processor ──────────────────────────────────────────────────────────
async function processJob(job, { supabase, runway }) {
  const { jobId } = job.data;
  console.log(`📥 [Video] Job ${job.id} | video_jobs=${jobId}`);

  if (!runway) {
    await updateJob(supabase, jobId, { status: "failed", error: "RUNWAYML_API_SECRET nicht konfiguriert", error_code: "NO_API_KEY" });
    throw new Error("RUNWAYML_API_SECRET nicht konfiguriert");
  }

  // Row laden
  const { data: row, error: loadErr } = await supabase
    .from("video_jobs").select("*").eq("id", jobId).single();
  if (loadErr || !row) throw new Error(`video_jobs ${jobId} nicht gefunden: ${loadErr?.message}`);

  await updateJob(supabase, jobId, { status: "generating", progress: 10, started_at: new Date().toISOString() });

  try {
    const { resource, body } = await buildRequest(runway, row);
    console.log(`   🎬 [Video] ${resource}.create model=${body.model} dur=${body.duration}s`);

    const created = await runway[resource].create(body);
    await updateJob(supabase, jobId, { runway_task_id: created.id, progress: 40 });

    const task = await created.waitForTaskOutput({ timeout: POLL_TIMEOUT_MS });
    const urls = task.output || [];
    if (urls.length === 0) throw new Error("Task SUCCEEDED, aber keine Output-URL");

    await updateJob(supabase, jobId, { progress: 80 });

    // Permanent in Supabase Storage sichern
    const res = await fetch(urls[0]);
    if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const path = `${jobId}.mp4`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: "video/mp4", upsert: true });
    if (upErr) throw new Error(`Storage-Upload fehlgeschlagen: ${upErr.message}`);

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    await updateJob(supabase, jobId, {
      status: "completed",
      progress: 100,
      video_path: `${BUCKET}/${path}`,
      video_url: pub?.publicUrl || null,
      result: { size: buffer.length, source_url: urls[0], duration: body.duration },
      finished_at: new Date().toISOString(),
    });

    console.log(`   ✅ [Video] Job ${job.id} fertig → ${pub?.publicUrl}`);
    return { jobId, status: "completed", video_url: pub?.publicUrl };
  } catch (err) {
    const isFail = err instanceof TaskFailedError;
    const meta = isFail ? err.taskDetails : undefined;
    console.error(`   ❌ [Video] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateJob(supabase, jobId, {
      status: "failed",
      error: isFail ? (meta?.failure || err.message) : err.message,
      error_code: isFail ? (meta?.failureCode || "TASK_FAILED") : "RUNWAY_ERROR",
      error_meta: meta ? { failureCode: meta.failureCode } : null,
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────
let videoQueue = null;
export function getVideoQueue() { return videoQueue; }

export function startVideoWorker() {
  const { redis, supabase, runway } = createClients();
  videoQueue = new Queue(QUEUE_NAME, { connection: redis });

  const worker = new Worker(
    QUEUE_NAME,
    (job) => processJob(job, { supabase, runway }),
    { connection: redis, concurrency: 2, settings: { maxStalledCount: 1 } }
  );
  worker.on("failed", (job, err) => {
    console.error(`❌ [Video] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Video Worker aktiv (Queue: ${QUEUE_NAME}, Modell: ${MODEL}, Runway: ${runway ? "✅" : "❌ kein Key"})`);
  return { worker, queue: videoQueue };
}

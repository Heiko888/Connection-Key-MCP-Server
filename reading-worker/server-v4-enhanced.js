import express from "express";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";

import { generateReading } from "./lib/generateReading.js";
import { loadKnowledge } from "./lib/loadKnowledge.js";
import { loadTemplates } from "./lib/loadTemplates.js";

const app = express();

// ======================================================
// Knowledge & Templates laden
// ======================================================
const knowledge = loadKnowledge("/app/knowledge");
const templates = loadTemplates("/app/templates");

console.log("📚 Knowledge-Dateien:", Object.keys(knowledge).length);
console.log("📄 Template-Dateien:", Object.keys(templates).length);

// ======================================================
// Supabase Clients (V3 + V4)
// ======================================================

// V3 Client (altes Supabase)
const supabaseV3 = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// V4 Client (neues Supabase)
const supabaseV4 = createClient(
  process.env.V4_SUPABASE_URL,
  process.env.V4_SUPABASE_SERVICE_KEY
);

console.log("✅ V3 Supabase:", process.env.SUPABASE_URL?.substring(0, 30) + "...");
console.log("✅ V4 Supabase:", process.env.V4_SUPABASE_URL?.substring(0, 30) + "...");

// ======================================================
// Redis / BullMQ
// ======================================================
const redis = new IORedis({
  host: process.env.REDIS_HOST || "redis-queue-secure",
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

// ======================================================
// WORKER 1: V3 Queue (legacy)
// ======================================================
const workerV3 = new Worker(
  "reading-queue",
  async (job) => {
    console.log("📥 [V3] Job empfangen:", job.id);

    const { readingId, agentId } = job.data;

    try {
      // Reading erzeugen
      const content = await generateReading({
        agentId,
        template: agentId,
        userData: job.data
      });

      // V3: Update coach_readings
      const { error } = await supabaseV3
        .from("coach_readings")
        .update({
          status: "completed",
          content
        })
        .eq("id", readingId);

      if (error) throw error;

      console.log("✅ [V3] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [V3] Fehler:", err);
      throw err;
    }
  },
  { connection: redis }
);

workerV3.on("failed", (job, err) => {
  console.error("❌ [V3] Job failed:", job?.id, err);
});

console.log("🟢 V3 Worker aktiv (Queue: reading-queue)");

// ======================================================
// WORKER 2: V4 Queue (new - mit reading_jobs)
// ======================================================
const workerV4 = new Worker(
  "reading-queue-v4",
  async (job) => {
    console.log("📥 [V4] Job empfangen:", job.id);

    const { readingId } = job.data;

    try {
      // 1. Job in reading_jobs finden
      const { data: jobData, error: jobError } = await supabaseV4
        .from("reading_jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      if (jobError) throw jobError;

      // 2. Reading aus readings Tabelle holen
      const { data: reading, error: readingError } = await supabaseV4
        .from("readings")
        .select("*")
        .eq("id", readingId)
        .single();

      if (readingError) throw readingError;

      // 3. Job Status auf "processing" setzen
      await supabaseV4
        .from("reading_jobs")
        .update({
          status: "processing",
          progress: 10,
          started_at: new Date().toISOString()
        })
        .eq("id", job.id);

      // 4. Reading erzeugen
      const content = await generateReading({
        agentId: reading.reading_type,
        template: reading.reading_type,
        userData: {
          client_name: reading.client_name,
          birth_date: reading.birth_date,
          birth_time: reading.birth_time,
          birth_location: reading.birth_location,
          ...reading.client_data
        }
      });

      // 5. Reading aktualisieren
      await supabaseV4
        .from("readings")
        .update({
          status: "completed",
          content,
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId);

      // 6. Job als completed markieren
      await supabaseV4
        .from("reading_jobs")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq("id", job.id);

      console.log("✅ [V4] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [V4] Fehler:", err);

      // Job als failed markieren
      await supabaseV4
        .from("reading_jobs")
        .update({
          status: "failed",
          error: err.message,
          retry_count: (jobData?.retry_count || 0) + 1
        })
        .eq("id", job.id);

      throw err;
    }
  },
  { connection: redis }
);

workerV4.on("failed", (job, err) => {
  console.error("❌ [V4] Job failed:", job?.id, err);
});

console.log("🟢 V4 Worker aktiv (Queue: reading-queue-v4)");

// ======================================================
// Health-Endpoint
// ======================================================
app.get("/health", async (_, res) => {
  try {
    // Prüfe V3 Supabase
    const { error: v3Error } = await supabaseV3.from("coach_readings").select("id").limit(1);
    
    // Prüfe V4 Supabase
    const { error: v4Error } = await supabaseV4.from("readings").select("id").limit(1);

    res.json({
      status: "ok",
      workers: {
        v3: workerV3.isRunning() ? "running" : "stopped",
        v4: workerV4.isRunning() ? "running" : "stopped"
      },
      supabase: {
        v3: v3Error ? "error" : "ok",
        v4: v4Error ? "error" : "ok"
      },
      redis: redis.status
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

app.listen(4000, () => {
  console.log("🚀 Enhanced Reading Worker läuft auf Port 4000");
  console.log("   - V3 Queue: reading-queue (coach_readings)");
  console.log("   - V4 Queue: reading-queue-v4 (readings + reading_jobs)");
});

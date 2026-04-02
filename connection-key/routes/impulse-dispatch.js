/**
 * impulse-dispatch.js
 *
 * Zentraler Endpunkt um einen generierten Impuls in mehrere Kanäle zu senden:
 *   - telegram        → Telegram Bot (via n8n oder direkt)
 *   - canva-story     → PNG 1080×1920 (Supabase Storage)
 *   - canva-feed      → PNG 1080×1350 (Supabase Storage)
 *
 * POST /api/impulse/dispatch
 * Body: { impulseId?, impulseData?, channels: ["telegram","canva-story","canva-feed"] }
 *
 * impulseId   — lädt Impuls-Daten aus Supabase v4.reading_jobs oder public.readings
 * impulseData — direkte Übergabe ohne DB-Lookup (für Tests oder frische Jobs)
 */
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { generateAndStoreImpulseImage } from "../lib/impulseImage.js";
import { formatImpulseForTelegram } from "../lib/telegramFormatter.js";

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const N8N_TELEGRAM_WEBHOOK = process.env.N8N_BASE_URL
  ? `${process.env.N8N_BASE_URL}/webhook/CFF5P8ZC5YTq6M6R/webhook/telegram-impulse`
  : null;
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Ladet Impuls-Daten aus der DB.
 * Prüft zuerst v4.reading_jobs (tagesimpuls-Jobs), dann public.readings.
 */
async function loadImpulseFromDb(impulseId) {
  if (!supabase) throw new Error("Supabase nicht konfiguriert");

  // Zuerst v4.reading_jobs (direktes result)
  const { data: job } = await supabase
    .schema("v4")
    .from("reading_jobs")
    .select("id, result, payload")
    .eq("id", impulseId)
    .maybeSingle();

  if (job?.result) {
    const r = job.result;
    return {
      text: r.text || r.reel?.caption || "",
      reel: r.reel || null,
      format: r.format || "standard",
      transit: job.payload?.transit || null,
      date: job.payload?.date || new Date().toISOString().split("T")[0],
    };
  }

  // Fallback: public.readings
  const { data: reading } = await supabase
    .from("readings")
    .select("reading_data")
    .eq("id", impulseId)
    .maybeSingle();

  if (reading?.reading_data) {
    const rd = reading.reading_data;
    return {
      text: rd.text || "",
      transit: rd.transit || null,
      date: rd.date || new Date().toISOString().split("T")[0],
    };
  }

  throw new Error(`Impuls ${impulseId} nicht gefunden`);
}

/**
 * Extrahiert Transit-Felder aus dem Transit-Objekt.
 */
function extractTransitFields(transit) {
  return {
    sunGate: transit?.sun?.gate || transit?.planets?.sun?.gate || "",
    sunLine: transit?.sun?.line || transit?.planets?.sun?.line || "",
    moonGate: transit?.moon?.gate || transit?.planets?.moon?.gate || "",
    moonLine: transit?.moon?.line || transit?.planets?.moon?.line || "",
  };
}

/**
 * Sendet Impuls via Telegram (n8n-Webhook oder direkte API).
 */
async function dispatchTelegram({ text, transit, date, chatId, channelPost }) {
  const formattedText = formatImpulseForTelegram({ text, transit, date });
  const targetChat = chatId || TELEGRAM_CHANNEL_ID;

  if (!targetChat) throw new Error("Kein Telegram-Empfänger: chat_id oder TELEGRAM_CHANNEL_ID fehlt");

  // Option A: n8n
  if (N8N_TELEGRAM_WEBHOOK) {
    const res = await fetch(N8N_TELEGRAM_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        impulse_text: formattedText,
        client_telegram_id: chatId,
        channel_post: channelPost ?? true,
      }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { via: "n8n", ...data };
    }
    console.warn("[Dispatch] n8n-Telegram fehlgeschlagen, direkter Fallback");
  }

  // Option B: Direkte Telegram API
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN nicht gesetzt");

  const tgRes = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: targetChat, text: formattedText, parse_mode: "MarkdownV2" }),
  });
  const data = await tgRes.json();
  if (!data.ok) throw new Error(`Telegram API: ${data.description}`);
  return { via: "direct", message_id: data.result?.message_id };
}

// ── Route ───────────────────────────────────────────────────────────────────

router.post("/dispatch", async (req, res) => {
  const {
    impulseId,
    impulseData,
    impulseText,
    channels = [],
    telegram_chat_id,
    channel_post = true,
  } = req.body || {};

  if (!channels.length) {
    return res.status(400).json({ success: false, error: "channels Array ist leer" });
  }
  if (!impulseId && !impulseData && !impulseText) {
    return res.status(400).json({ success: false, error: "impulseId, impulseData oder impulseText erforderlich" });
  }

  let data;
  try {
    if (impulseText) {
      data = { text: impulseText, date: new Date().toISOString().split("T")[0] };
    } else {
      data = impulseData || await loadImpulseFromDb(impulseId);
    }
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message });
  }

  const { text, transit, date = new Date().toISOString().split("T")[0] } = data;
  const transitFields = extractTransitFields(transit);
  const results = {};

  // Alle Kanäle parallel abarbeiten
  await Promise.allSettled(
    channels.map(async (channel) => {
      try {
        switch (channel) {
          case "telegram":
            results.telegram = await dispatchTelegram({
              text, transit, date,
              chatId: telegram_chat_id,
              channelPost: channel_post,
            });
            break;

          case "canva-story": {
            const r = await generateAndStoreImpulseImage({ impulseText: text, ...transitFields, date, format: "story" });
            results["canva-story"] = { success: true, url: r.url, fileName: r.fileName };
            break;
          }

          case "canva-feed": {
            const r = await generateAndStoreImpulseImage({ impulseText: text, ...transitFields, date, format: "feed" });
            results["canva-feed"] = { success: true, url: r.url, fileName: r.fileName };
            break;
          }

          default:
            results[channel] = { error: `Unbekannter Kanal: ${channel}` };
        }
      } catch (err) {
        results[channel] = { error: err.message };
      }
    })
  );

  const allOk = Object.values(results).every((r) => !r.error);
  return res.status(allOk ? 200 : 207).json({ success: allOk, results });
});

export default router;

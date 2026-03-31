import express from "express";
import crypto from "crypto";
import { formatImpulseForTelegram, formatReelForTelegram, escapeMarkdownV2 } from "../lib/telegramFormatter.js";

const router = express.Router();

// Supabase Client
let supabase = null;
try {
  const supabaseModule = await import("../config-with-supabase.js");
  supabase = supabaseModule.supabase;
} catch {
  console.warn("⚠️  Supabase nicht verfügbar in telegram.js");
}
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Interne Hilfsfunktion: sendet eine Telegram-Nachricht (plain Markdown)
async function sendBotMessage(chatId, text) {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error("[Telegram] sendBotMessage Fehler:", err.message);
  }
}
const N8N_WEBHOOK_URL = process.env.N8N_BASE_URL
  ? `${process.env.N8N_BASE_URL}/webhook/telegram-impulse`
  : null;

/**
 * Sendet eine Nachricht direkt über die Telegram Bot API.
 * Wird als Fallback genutzt wenn kein n8n-Webhook konfiguriert ist.
 */
async function sendViaTelegramAPI(chatId, text, photoUrl) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN nicht gesetzt");

  const endpoint = photoUrl ? "sendPhoto" : "sendMessage";
  const body = photoUrl
    ? { chat_id: chatId, photo: photoUrl, caption: text, parse_mode: "MarkdownV2" }
    : { chat_id: chatId, text, parse_mode: "MarkdownV2" };

  const res = await fetch(`${TELEGRAM_API}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API Fehler: ${data.description}`);
  return { message_id: data.result?.message_id };
}

/**
 * Sendet Impuls über n8n-Webhook (preferred) oder direkt über Telegram API.
 */
async function sendImpulse({ text, chatId, channelPost, photoUrl }) {
  // Option A: n8n Webhook
  if (N8N_WEBHOOK_URL) {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        impulse_text: text,
        client_telegram_id: chatId,
        channel_post: channelPost,
        image_url: photoUrl || null,
      }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { via: "n8n", ...data };
    }
    console.warn("[Telegram] n8n-Webhook fehlgeschlagen, fallback auf direkte API");
  }

  // Option B: Direkte Telegram API
  const targetId = channelPost
    ? (process.env.TELEGRAM_CHANNEL_ID || chatId)
    : chatId;

  const result = await sendViaTelegramAPI(targetId, text, photoUrl);
  return { via: "direct", ...result };
}

// POST /api/telegram/send-impulse
// Body: { text, chat_id?, channel_post?, photo_url?, transit?, date?, format_type? }
router.post("/send-impulse", async (req, res) => {
  try {
    const {
      text,
      chat_id,
      channel_post = false,
      photo_url,
      transit,
      date,
      format_type = "standard",
    } = req.body || {};

    if (!text) return res.status(400).json({ success: false, error: "text ist erforderlich" });

    const chatId = chat_id || process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) return res.status(400).json({ success: false, error: "chat_id oder TELEGRAM_CHANNEL_ID erforderlich" });

    const formattedText = formatImpulseForTelegram({ text, date, transit });
    const result = await sendImpulse({ text: formattedText, chatId, channelPost: channel_post, photoUrl: photo_url });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Telegram] send-impulse Fehler:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/telegram/send-reel
// Body: { reel: { hook, body[], cta, caption, hashtags[], duration_estimate }, chat_id? }
router.post("/send-reel", async (req, res) => {
  try {
    const { reel, chat_id, channel_post = false } = req.body || {};
    if (!reel?.hook) return res.status(400).json({ success: false, error: "reel Objekt mit hook ist erforderlich" });

    const chatId = chat_id || process.env.TELEGRAM_CHANNEL_ID;
    if (!chatId) return res.status(400).json({ success: false, error: "chat_id oder TELEGRAM_CHANNEL_ID erforderlich" });

    const formattedText = formatReelForTelegram(reel);
    const result = await sendImpulse({ text: formattedText, chatId, channelPost: channel_post });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[Telegram] send-reel Fehler:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/telegram/send-raw
// Body: { text, chat_id, parse_mode?, photo_url? }  — Direktversand ohne Formatierung
router.post("/send-raw", async (req, res) => {
  try {
    const { text, chat_id, parse_mode = "MarkdownV2", photo_url } = req.body || {};
    if (!text || !chat_id) return res.status(400).json({ success: false, error: "text und chat_id erforderlich" });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(503).json({ success: false, error: "TELEGRAM_BOT_TOKEN nicht konfiguriert" });

    const endpoint = photo_url ? "sendPhoto" : "sendMessage";
    const body = photo_url
      ? { chat_id, photo: photo_url, caption: text, parse_mode }
      : { chat_id, text, parse_mode };

    const tgRes = await fetch(`${TELEGRAM_API}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(400).json({ success: false, error: data.description });

    return res.json({ success: true, message_id: data.result?.message_id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/telegram/webhook
// Telegram ruft diesen Endpoint bei jeder Nachricht an den Bot auf
router.post("/webhook", async (req, res) => {
  // Telegram erwartet immer 200, sonst wiederholt es den Request
  res.sendStatus(200);

  const message = req.body?.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();
  const firstName = message.from?.first_name || "du";

  if (!supabase) {
    console.error("[Telegram] Webhook: Supabase nicht verfügbar");
    return;
  }

  if (text.startsWith("/start")) {
    const code = text.split(" ")[1] || null;

    if (!code) {
      await sendBotMessage(chatId,
        `Willkommen bei The Connection Key ✨\n\n` +
        `Um deinen persönlichen Tagesimpuls zu erhalten, ` +
        `brauche ich einen Verbindungscode von deinem Coach.\n\n` +
        `Frag deinen Coach nach dem Telegram-Link.`
      );
      return;
    }

    // Code in Supabase nachschlagen
    const { data: codeEntry, error } = await supabase
      .from("telegram_codes")
      .select("*")
      .eq("code", code)
      .is("used_at", null)
      .single();

    if (error || !codeEntry) {
      await sendBotMessage(chatId,
        `Dieser Code ist ungültig oder bereits verwendet.\n` +
        `Bitte frag deinen Coach nach einem neuen Link.`
      );
      return;
    }

    if (new Date(codeEntry.expires_at) < new Date()) {
      await sendBotMessage(chatId,
        `Dieser Code ist abgelaufen.\n` +
        `Bitte frag deinen Coach nach einem neuen Link.`
      );
      return;
    }

    // telegram_chat_id in profiles speichern
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ telegram_chat_id: String(chatId) })
      .eq("id", codeEntry.user_id);

    if (updateError) {
      console.error("[Telegram] Profil-Update fehlgeschlagen:", updateError.message);
      await sendBotMessage(chatId,
        `Es gab ein Problem bei der Verknüpfung. Bitte versuch es nochmal.`
      );
      return;
    }

    // Code als benutzt markieren
    await supabase
      .from("telegram_codes")
      .update({ used_at: new Date().toISOString(), telegram_chat_id: chatId })
      .eq("id", codeEntry.id);

    console.log(`✅ [Telegram] Klient ${codeEntry.user_id} verbunden (chat_id=${chatId})`);

    await sendBotMessage(chatId,
      `Verbunden ✨\n\n` +
      `Hallo ${firstName}! Dein Profil ist jetzt mit Telegram verknüpft.\n\n` +
      `Du erhältst ab jetzt deinen persönlichen Tagesimpuls direkt hier.\n\n` +
      `_The Connection Key_`
    );
    return;
  }

  // Alle anderen Nachrichten
  await sendBotMessage(chatId,
    `Ich bin der Connection Key Bot ✨\n\n` +
    `Ich sende dir deinen täglichen Tagesimpuls, ` +
    `sobald dein Coach die Verbindung eingerichtet hat.`
  );
});

// POST /api/telegram/generate-code
// Body: { userId, coachId? }
router.post("/generate-code", async (req, res) => {
  const { userId, coachId } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  if (!supabase) {
    return res.status(503).json({ error: "Datenbank nicht verfügbar" });
  }

  // Prüfe ob der Klient schon verbunden ist
  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .eq("id", userId)
    .single();

  if (profile?.telegram_chat_id) {
    return res.json({
      alreadyConnected: true,
      message: "Klient ist bereits mit Telegram verbunden.",
    });
  }

  // Bestehenden ungenutzten Code wiederverwenden
  const { data: existingCode } = await supabase
    .from("telegram_codes")
    .select("code, expires_at")
    .eq("user_id", userId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existingCode) {
    return res.json({
      code: existingCode.code,
      link: `https://t.me/theconnectionkey_bot?start=${existingCode.code}`,
      expiresAt: existingCode.expires_at,
      reused: true,
    });
  }

  // Neuen Code generieren (8 Zeichen, URL-safe)
  const code = crypto.randomBytes(4).toString("base64url").slice(0, 8);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("telegram_codes")
    .insert({ code, user_id: userId, coach_id: coachId || null, expires_at: expiresAt });

  if (error) {
    console.error("[Telegram] generate-code Fehler:", error.message);
    return res.status(500).json({ error: "Code konnte nicht erstellt werden" });
  }

  return res.json({
    code,
    link: `https://t.me/theconnectionkey_bot?start=${code}`,
    expiresAt,
    reused: false,
  });
});

export default router;

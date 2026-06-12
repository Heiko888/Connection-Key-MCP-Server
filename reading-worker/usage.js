/**
 * KI-Kosten-Tracking für den reading-worker.
 *
 * Gegenstück zum Frontend-Tracking auf .167 (siehe frontend/lib/mcp/modelPricing.ts
 * und frontend/lib/db/mcp-usage.ts). Schreibt Token-Verbrauch + geschätzte Kosten
 * pro Claude-Call in die Supabase-Tabelle `public.mcp_usage` (gleiche DB/Tabelle
 * wie das Frontend).
 *
 * ⚠️ VORAUSSETZUNG: Die Migration `supabase-mcp-usage-costs.sql` muss in Supabase
 * eingespielt sein — sie macht `coach_id` NULLABLE (Worker-Calls haben nicht immer
 * einen Coach) und fügt die Spalte `source` hinzu (z. B. 'reading-worker').
 *
 * ESM-Modul (server.js läuft als ESM, "type": "module").
 */

/**
 * Preis-Tabelle: USD pro 1 Mio. Token, getrennt nach Input/Output.
 * Schlüssel sind Modell-Präfixe — gematcht wird gegen das tatsächlich von
 * Anthropic zurückgegebene `response.model` (z. B. "claude-sonnet-4-6",
 * "claude-opus-4-5-20251101", "claude-haiku-4-5-20251001").
 */
export const MODEL_PRICING = {
  "claude-sonnet-4": { input: 3, output: 15 },
  "claude-opus-4": { input: 5, output: 25 },
  "claude-haiku-4": { input: 1, output: 5 },
};

// Konservativer Default (= Sonnet), falls ein unbekanntes Modell zurückkommt.
const DEFAULT_PRICING = { input: 3, output: 15 };

/**
 * Liefert die Preis-Struktur ($/Mio Token) für ein Modell per Präfix-Matching.
 * Längster passender Präfix gewinnt.
 */
export function getPricing(model) {
  if (!model) return DEFAULT_PRICING;
  const m = String(model).toLowerCase();
  const keys = Object.keys(MODEL_PRICING).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (m.startsWith(key)) return MODEL_PRICING[key];
  }
  return DEFAULT_PRICING;
}

/**
 * Geschätzte Kosten eines Claude-Calls in USD.
 * @param {string} model     Modell-Name (response.model)
 * @param {number} inTok     Input-Tokens
 * @param {number} outTok    Output-Tokens
 * @returns {number} Kosten in USD, auf 6 Dezimalstellen gerundet
 */
export function calculateCost(model, inTok = 0, outTok = 0) {
  const p = getPricing(model);
  const cost = ((inTok || 0) * p.input + (outTok || 0) * p.output) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

/**
 * Schreibt einen Usage-Eintrag in `public.mcp_usage`.
 *
 * Fire-and-forget: wirft NIE und blockiert die Reading-Generierung nicht. Fehler
 * werden geloggt und verschluckt. Bewusst NICHT `await`-pflichtig aufrufbar.
 *
 * @param {object} supabase  Supabase-Client mit Zugriff auf das public-Schema
 * @param {object} meta      { reading_id, coach_id, agent, source, model,
 *                             input_tokens, output_tokens, total_tokens,
 *                             estimated_cost_usd, duration_ms, success, error_code }
 */
export async function logUsage(supabase, meta = {}) {
  try {
    if (!supabase) return;

    const inTok = meta.input_tokens || 0;
    const outTok = meta.output_tokens || 0;
    const model = meta.model || null;

    const row = {
      reading_id: meta.reading_id || null,
      coach_id: meta.coach_id || null,
      agent: meta.agent || meta.source || "reading-worker",
      model,
      input_tokens: inTok,
      output_tokens: outTok,
      total_tokens: meta.total_tokens != null ? meta.total_tokens : inTok + outTok,
      estimated_cost_usd:
        meta.estimated_cost_usd != null
          ? meta.estimated_cost_usd
          : calculateCost(model, inTok, outTok),
      duration_ms: meta.duration_ms || 0,
      success: meta.success !== false,
      error_code: meta.error_code || null,
      source: meta.source || "reading-worker",
    };

    const { error } = await supabase.from("mcp_usage").insert(row);
    if (error) {
      console.warn("⚠️ [usage] mcp_usage Insert fehlgeschlagen:", error.message || error);
    }
  } catch (err) {
    // Tracking darf die Reading-Generierung NIEMALS blockieren oder werfen.
    console.warn("⚠️ [usage] logUsage Fehler (ignoriert):", err?.message || err);
  }
}

import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Supabase-Client (Service-Role) — exakt wie chart.js/stripe.js es machen.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Felder, die zurückgegeben werden (alle existieren in public.profiles).
const PUBLIC_FIELDS =
  "id, email, role, first_name, last_name, phone, website, location, bio, " +
  "avatar_url, birth_date, birth_time, birth_place, " +
  "hd_type, hd_profile, hd_authority, hd_strategy, hd_incarnation_cross, " +
  "subscription_tier, onboarding_completed, created_at";

// Per PUT änderbar — bewusst OHNE id/email/role/subscription_tier (Identitäts-/
// Abrechnungs-/Privileg-Felder). hd_* bleiben draußen, da sie aus der
// Chart-Berechnung stammen und nicht frei editierbar sein sollen.
const UPDATABLE_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "website",
  "location",
  "bio",
  "avatar_url",
  "birth_date",
  "birth_time",
  "birth_place",
];

/**
 * GET /api/user/:userId
 * Gibt das Profil (public.profiles) zurück.
 */
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: "Supabase nicht konfiguriert" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(PUBLIC_FIELDS)
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: "User nicht gefunden" });
    }

    res.json({ success: true, user: data });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/:userId
 * Aktualisiert erlaubte Profil-Felder (Whitelist).
 */
router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const body = req.body || {};

    const updates = {};
    for (const field of UPDATABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: `Keine aktualisierbaren Felder. Erlaubt: ${UPDATABLE_FIELDS.join(", ")}`,
      });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: "Supabase nicht konfiguriert" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select(PUBLIC_FIELDS)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: "User nicht gefunden" });
    }

    res.json({ success: true, user: data });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };

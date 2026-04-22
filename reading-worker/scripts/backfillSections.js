#!/usr/bin/env node
// scripts/backfillSections.js
// Einmalig: alle bestehenden completed readings in Sections überführen.
// Idempotent dank Unique-Constraint (reading_id, area, version).

import { createClient } from '@supabase/supabase-js';
import { writeSectionsForReading } from '../lib/sectionsWriter.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY'); process.exit(1); }

const supabasePublic = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  const pageSize = 100;
  let from = 0;
  let total = 0;
  let withSections = 0;
  let totalSections = 0;

  console.log('=== BACKFILL Sections — START ===\n');

  for (;;) {
    const { data, error } = await supabasePublic
      .from('readings')
      .select('id, client_name, reading_type')
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) { console.error('DB Error:', error.message); break; }
    if (!data || data.length === 0) break;

    for (const r of data) {
      total++;
      try {
        const res = await writeSectionsForReading(supabasePublic, r.id);
        if (res.created > 0) {
          withSections++;
          totalSections += res.created;
        }
        console.log(`[${total}] ${r.id.substring(0, 8)} (${r.reading_type || '?'}) ${r.client_name || '?'}: ${res.created} sections`);
      } catch (e) {
        console.error(`[${total}] ${r.id.substring(0, 8)} ERROR:`, e.message);
      }
    }
    from += data.length;
    if (data.length < pageSize) break;
  }

  console.log(`\n=== BACKFILL ABGESCHLOSSEN ===`);
  console.log(`${total} readings geprüft`);
  console.log(`${withSections} mit neuen Sections`);
  console.log(`${totalSections} Sections insgesamt erzeugt`);
  process.exit(0);
})();

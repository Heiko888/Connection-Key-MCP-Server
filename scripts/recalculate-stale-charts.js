/**
 * recalculate-stale-charts.js
 *
 * Neuberechnung aller Readings, bei denen reading_data.chart_data durch den alten
 * Chiron/Lilith-Bug (vor Commit 86c99b0) falsche Zentren/Typ enthalten könnte.
 *
 * Struktur: chart_data liegt in readings.reading_data.chart_data (nested JSONB)
 *           Geburtsdaten in readings.birth_data { date, time, location, coords }
 *
 * Usage:
 *   node scripts/recalculate-stale-charts.js --dry-run    # nur Differenz-CSV, kein Update
 *   node scripts/recalculate-stale-charts.js --apply      # Updates in Supabase schreiben
 */

import { createClient } from '@supabase/supabase-js';
import { calculateHumanDesignChart } from '../connection-key/lib/astro/chartCalculation.js';
import { writeFileSync, appendFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- .env laden (Fallback wenn nicht als ENV im Container) ---
const envPath = path.join(__dirname, '..', '.env');
try {
  const envVars = Object.fromEntries(
    readFileSync(envPath, 'utf8').split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  for (const [k, v] of Object.entries(envVars)) {
    if (!process.env[k]) process.env[k] = v;
  }
} catch (_) { /* Im Container sind ENV-Variablen direkt gesetzt */ }

// --- Modus ---
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const APPLY   = args.includes('--apply');

if (!DRY_RUN && !APPLY) {
  console.error('Usage: node scripts/recalculate-stale-charts.js --dry-run | --apply');
  process.exit(1);
}
if (DRY_RUN && APPLY) {
  console.error('--dry-run und --apply können nicht gleichzeitig gesetzt sein.');
  process.exit(1);
}

// --- Supabase ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_KEY fehlen in .env');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CSV ---
const ts = new Date().toISOString().slice(0, 16).replace(':', '-');
const CSV_FILE = path.join(__dirname, `stale-charts-${DRY_RUN ? 'dryrun' : 'applied'}-${ts}.csv`);
const CSV_HEADER = 'reading_id,client_name,birth_date,birth_time,birth_location,old_type,new_type,old_definition,new_definition,old_channel_count,new_channel_count\n';

function initCSV() { writeFileSync(CSV_FILE, CSV_HEADER); }
function appendCSV(row) {
  appendFileSync(CSV_FILE, Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',') + '\n');
}

// --- Hauptlogik ---
async function main() {
  console.log(`\n=== Stale Chart Recalculation — Modus: ${DRY_RUN ? 'DRY-RUN (kein Update)' : 'APPLY (schreibt in Supabase)'} ===\n`);

  // Alle completed Readings mit birth_data + reading_data laden (paginiert)
  let allReadings = [];
  const PAGE = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('readings')
      .select('id, client_name, birth_data, reading_data')
      .eq('status', 'completed')
      .not('birth_data', 'is', null)
      .not('reading_data', 'is', null)
      .range(from, from + PAGE - 1);

    if (error) { console.error('Supabase Fehler:', error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    allReadings = allReadings.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  // Nur Readings mit chart_data.type UND vollständigen Geburtsdaten
  const candidates = allReadings.filter(r =>
    r.reading_data?.chart_data?.type &&
    r.birth_data?.date &&
    r.birth_data?.location
  );

  console.log(`Readings geladen (completed + birth_data + reading_data): ${allReadings.length}`);
  console.log(`Davon mit chart_data + vollst. Geburtsdaten:              ${candidates.length}`);
  console.log(`Übersprungen (kein chart_data oder unvollst. Geburt):     ${allReadings.length - candidates.length}\n`);

  if (candidates.length === 0) {
    console.log('Keine Kandidaten gefunden. Nichts zu tun.');
    return;
  }

  initCSV();
  let checked = 0, changed = 0, errors = 0, updated = 0;

  for (const reading of candidates) {
    checked++;
    const bd = reading.birth_data;
    const oldChart = reading.reading_data.chart_data;

    try {
      const newChart = await calculateHumanDesignChart({
        birthDate:  bd.date,
        birthTime:  bd.time || '12:00',
        birthPlace: bd.coords
          ? { lat: bd.coords.lat, lon: bd.coords.lon }
          : bd.location,
      });

      const oldType = oldChart.type        || '';
      const newType = newChart.type        || '';
      const oldDef  = oldChart.definition  || '';
      const newDef  = newChart.definition  || '';
      const oldCh   = (oldChart.channels   || []).length;
      const newCh   = (newChart.channels   || []).length;

      const isDifferent = oldType !== newType || oldDef !== newDef || oldCh !== newCh;

      if (isDifferent) {
        changed++;
        appendCSV({
          reading_id:        reading.id,
          client_name:       reading.client_name || '',
          birth_date:        bd.date,
          birth_time:        bd.time || '',
          birth_location:    bd.location || '',
          old_type:          oldType,
          new_type:          newType,
          old_definition:    oldDef,
          new_definition:    newDef,
          old_channel_count: oldCh,
          new_channel_count: newCh,
        });
        console.log(`  GEÄNDERT  ${reading.id.slice(0, 8)}… ${(reading.client_name || '').padEnd(20)} | Typ: ${oldType} → ${newType} | Def: ${oldDef} → ${newDef} | Kanäle: ${oldCh}→${newCh}`);

        if (APPLY) {
          const newReadingData = { ...reading.reading_data, chart_data: newChart };
          const { error: updateError } = await supabase
            .from('readings')
            .update({ reading_data: newReadingData })
            .eq('id', reading.id);

          if (updateError) {
            console.error(`    ❌ Update-Fehler für ${reading.id}: ${updateError.message}`);
            errors++;
          } else {
            updated++;
          }
        }
      }
    } catch (err) {
      errors++;
      console.warn(`  ⚠️  Fehler bei ${reading.id}: ${err.message}`);
    }

    if (checked % 20 === 0) {
      process.stdout.write(`\r  Fortschritt: ${checked}/${candidates.length} geprüft, ${changed} unterschiedlich…  `);
    }
  }

  process.stdout.write('\n');
  console.log(`\n=== ERGEBNIS ===`);
  console.log(`Geprüft:        ${checked}`);
  console.log(`Unterschiede:   ${changed}`);
  console.log(`Fehler:         ${errors}`);
  if (APPLY) console.log(`Aktualisiert:   ${updated}`);
  if (changed > 0) console.log(`CSV:            ${CSV_FILE}`);

  if (DRY_RUN && changed > 0) {
    console.log(`\nDry-Run abgeschlossen. ${changed} betroffene Readings.`);
    console.log(`Zum Anwenden: node scripts/recalculate-stale-charts.js --apply`);
  }
  if (APPLY) {
    console.log(`\n${updated}/${changed} Readings erfolgreich aktualisiert.`);
  }
}

main().catch(err => {
  console.error('Fataler Fehler:', err);
  process.exit(1);
});

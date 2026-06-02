#!/usr/bin/env node
/**
 * Runway / Seedance 2.0 Video-Generator (Standalone Skill-Helfer)
 *
 * Erzeugt Videos über die Runway-API mit dem Modell `seedance2`:
 *   - text       : Text-to-Video (nur Prompt)
 *   - image      : Image-to-Video (ein Startbild als erstes Frame + Prompt)
 *   - reference  : Reference-to-Video (1..n Referenzbilder, im Prompt via @IMG_1.. adressiert)
 *
 * Auth: Env-Var RUNWAYML_API_SECRET (nie hardcoden).
 * Lokale Bilder werden per uploads.createEphemeral hochgeladen; URLs werden direkt genutzt.
 *
 * Beispiele:
 *   node generate.mjs --mode text --prompt "Sonnenaufgang über den Bergen, Kamerafahrt"
 *   node generate.mjs --mode image --image ./start.png --prompt "Die Kamera zoomt langsam heraus"
 *   node generate.mjs --mode reference --image a.png --image b.png \
 *        --prompt "@IMG_1 trifft @IMG_2 in einem Café, warmes Licht"
 *   node generate.mjs --mode text --prompt "..." --dry-run   # validiert ohne API-Call/Credits
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RunwayML, { toFile, TaskFailedError } from '@runwayml/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Konfiguration --------------------------------------------------------
const MODEL = 'seedance2';        // Runway-Identifier für Seedance 2.0 (s. organization model list)
const DEFAULT_RATIO = '1280:720';
const DEFAULT_DURATION = 5;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

// ---- Minimaler Flag-Parser ------------------------------------------------
function parseArgs(argv) {
  const out = { mode: 'text', images: [], ratio: DEFAULT_RATIO, duration: DEFAULT_DURATION,
                model: MODEL, dryRun: false, timeout: DEFAULT_TIMEOUT_MS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--mode': out.mode = next(); break;
      case '--prompt': out.prompt = next(); break;
      case '--image': out.images.push(next()); break;
      case '--ratio': out.ratio = next(); break;
      case '--duration': out.duration = Number(next()); break;
      case '--output': out.output = next(); break;
      case '--model': out.model = next(); break;
      case '--timeout': out.timeout = Number(next()); break;
      case '--dry-run': out.dryRun = true; break;
      case '-h': case '--help': out.help = true; break;
      default:
        if (a.startsWith('--')) throw new Error(`Unbekanntes Flag: ${a}`);
    }
  }
  return out;
}

const HELP = `Runway/Seedance 2.0 Video-Generator

  --mode <text|image|reference>   Generierungsmodus (Default: text)
  --prompt "<text>"               Text-Prompt (erforderlich)
  --image <pfad|https-url>        Bild (mehrfach erlaubt; reference → @IMG_1, @IMG_2, ...)
  --ratio <w:h>                   Seitenverhältnis (Default: ${DEFAULT_RATIO})
  --duration <sek>                Dauer in Sekunden (Default: ${DEFAULT_DURATION})
  --output <pfad.mp4>             Zielpfad (Default: output/seedance-<ts>.mp4)
  --model <id>                    Modell-Override (Default: ${MODEL})
  --timeout <ms>                  Polling-Timeout (Default: ${DEFAULT_TIMEOUT_MS})
  --dry-run                       Nur Request validieren/anzeigen, KEIN API-Call (keine Credits)
`;

const isUrl = (s) => /^https?:\/\//i.test(s);

// Lokale Datei hochladen → Runway-URI; URL direkt durchreichen.
async function resolveImage(client, src, dryRun) {
  if (isUrl(src)) return src;
  if (!fs.existsSync(src)) throw new Error(`Bilddatei nicht gefunden: ${src}`);
  if (dryRun) return `<<würde hochladen: ${src}>>`;
  const uploaded = await client.uploads.createEphemeral({
    file: await toFile(fs.createReadStream(src), path.basename(src)),
  });
  return uploaded.uri;
}

// Baut (resource, body) für den jeweiligen Modus.
async function buildRequest(client, args, dryRun) {
  const common = { model: args.model, ratio: args.ratio, duration: args.duration };
  switch (args.mode) {
    case 'text':
      return { resource: 'textToVideo', body: { ...common, promptText: args.prompt } };
    case 'image': {
      if (args.images.length < 1) throw new Error('--mode image braucht genau ein --image');
      const uri = await resolveImage(client, args.images[0], dryRun);
      return { resource: 'imageToVideo',
               body: { ...common, promptImage: uri, promptText: args.prompt } };
    }
    case 'reference': {
      if (args.images.length < 1) throw new Error('--mode reference braucht mindestens ein --image');
      const references = [];
      for (let i = 0; i < args.images.length; i++) {
        const uri = await resolveImage(client, args.images[i], dryRun);
        references.push({ uri, tag: `IMG_${i + 1}` });
      }
      return { resource: 'textToVideo',
               body: { ...common, promptText: args.prompt, references } };
    }
    default:
      throw new Error(`Unbekannter Modus: ${args.mode} (erlaubt: text|image|reference)`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  if (!args.prompt) throw new Error('--prompt ist erforderlich. (--help für Hilfe)');

  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey && !args.dryRun) {
    throw new Error('RUNWAYML_API_SECRET ist nicht gesetzt. Key setzen (Env oder .env) und erneut versuchen.');
  }

  // Im Dry-Run ohne echten Key: nur Request bauen/anzeigen.
  const client = new RunwayML({ apiKey: apiKey || 'dry-run' });
  const { resource, body } = await buildRequest(client, args, args.dryRun);

  console.log(`\n▶ Modell: ${args.model} | Modus: ${args.mode} | Endpoint: ${resource}.create`);
  console.log('▶ Request-Body:\n' + JSON.stringify(body, null, 2));

  if (args.dryRun) {
    console.log('\n✓ Dry-Run: Request ist valide. Kein API-Call ausgeführt, keine Credits verbraucht.');
    return;
  }

  console.log('\n⏳ Starte Generierung & polle auf Fertigstellung (kann einige Minuten dauern)…');
  let task;
  try {
    task = await client[resource].create(body).waitForTaskOutput({ timeout: args.timeout });
  } catch (err) {
    if (err instanceof TaskFailedError) {
      const d = err.taskDetails || {};
      throw new Error(`Runway-Task fehlgeschlagen: ${d.failure || 'unbekannt'}` +
                      (d.failureCode ? ` [${d.failureCode}]` : ''));
    }
    throw err;
  }

  const urls = task.output || [];
  if (urls.length === 0) throw new Error('Task SUCCEEDED, aber keine Output-URL erhalten.');

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = args.output || path.join(__dirname, 'output', `seedance-${ts}.mp4`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const res = await fetch(urls[0]);
  if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);

  console.log(`\n✅ Video gespeichert: ${outPath} (${(buf.length / 1e6).toFixed(2)} MB)`);
  if (urls.length > 1) console.log(`   Weitere Outputs: ${urls.slice(1).join(', ')}`);
  console.log(`   Quell-URL (läuft ab): ${urls[0]}`);
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});

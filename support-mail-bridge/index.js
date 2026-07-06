/**
 * support-mail-bridge
 * --------------------
 * Pollt das Support-IMAP-Postfach (all-inkl / KAS) und postet jede NEUE Mail
 * in einen Mattermost-Incoming-Webhook.
 *
 * Design-Entscheidungen:
 *  - Das Postfach wird READ-ONLY geöffnet: wir verändern NIE die \Seen-Flags.
 *    So bleibt der Ungelesen-Status im Webmail für das Support-Team erhalten,
 *    und ob eine Mail schon nach Mattermost ging, hängt NICHT daran, ob sie
 *    jemand im Webmail geöffnet hat.
 *  - Idempotenz über die IMAP-UID: wir merken uns die höchste bereits
 *    verarbeitete UID (+ uidValidity) persistent in STATE_FILE. Nur Mails mit
 *    UID > lastUid werden gepostet. UIDs sind pro Mailbox monoton steigend.
 *  - Erststart legt eine Baseline (höchste vorhandene UID) an und postet die
 *    Bestandsmails NICHT (kein Flooding). Ab dann zählt jede neue Mail.
 *  - Fehlgeschlagener Mattermost-Post => lastUid wird NICHT weitergesetzt =>
 *    Retry im nächsten Zyklus (at-least-once).
 */

import fs from 'fs';
import path from 'path';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

// ---------- Config ----------
const CFG = {
  host: process.env.SUPPORT_IMAP_HOST || '',
  port: parseInt(process.env.SUPPORT_IMAP_PORT || '993', 10),
  secure: (process.env.SUPPORT_IMAP_SECURE || 'true') !== 'false',
  user: process.env.SUPPORT_IMAP_USER || '',
  pass: process.env.SUPPORT_IMAP_PASSWORD || '',
  mailbox: process.env.SUPPORT_IMAP_MAILBOX || 'INBOX',
  pollMs: parseInt(process.env.SUPPORT_POLL_INTERVAL_MS || '60000', 10),
  webhook: process.env.MATTERMOST_WEBHOOK_SUPPORT || '',
  mmUser: process.env.SUPPORT_MATTERMOST_USERNAME || 'Support-Postfach',
  mmIcon: process.env.SUPPORT_MATTERMOST_ICON || ':email:',
  mmChannel: process.env.SUPPORT_MATTERMOST_CHANNEL || '', // optional Channel-Override
  stateFile: process.env.SUPPORT_STATE_FILE || '/data/state.json',
  bodyMaxChars: parseInt(process.env.SUPPORT_BODY_MAX_CHARS || '1800', 10),
};

const log = (...a) => console.log(new Date().toISOString(), '[support-mail]', ...a);
const errlog = (...a) => console.error(new Date().toISOString(), '[support-mail]', ...a);

function assertConfig() {
  const missing = [];
  if (!CFG.host) missing.push('SUPPORT_IMAP_HOST');
  if (!CFG.user) missing.push('SUPPORT_IMAP_USER');
  if (!CFG.pass) missing.push('SUPPORT_IMAP_PASSWORD');
  if (!CFG.webhook) missing.push('MATTERMOST_WEBHOOK_SUPPORT');
  if (missing.length) {
    errlog('FEHLENDE ENV-Variablen:', missing.join(', '), '— Service kann nicht starten.');
    process.exit(1);
  }
}

// ---------- Persistenter Zustand ----------
function loadState() {
  try {
    const raw = fs.readFileSync(CFG.stateFile, 'utf8');
    const s = JSON.parse(raw);
    return { uidValidity: s.uidValidity ?? null, lastUid: s.lastUid ?? 0 };
  } catch {
    return { uidValidity: null, lastUid: 0 };
  }
}

function saveState(state) {
  try {
    fs.mkdirSync(path.dirname(CFG.stateFile), { recursive: true });
    fs.writeFileSync(CFG.stateFile, JSON.stringify(state), 'utf8');
  } catch (e) {
    errlog('Konnte State nicht speichern:', e?.message);
  }
}

// ---------- Mattermost ----------
async function postToMattermost(text) {
  const payload = { text, username: CFG.mmUser, icon_emoji: CFG.mmIcon };
  if (CFG.mmChannel) payload.channel = CFG.mmChannel;
  const res = await fetch(CFG.webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Mattermost HTTP ${res.status} ${body.slice(0, 200)}`);
  }
}

function fmtAddress(addr) {
  if (!addr) return '(unbekannt)';
  if (addr.text) return addr.text;
  if (Array.isArray(addr.value)) {
    return addr.value.map((v) => (v.name ? `${v.name} <${v.address}>` : v.address)).join(', ');
  }
  return String(addr);
}

function buildMessage(parsed) {
  const from = fmtAddress(parsed.from);
  const subject = parsed.subject || '(kein Betreff)';
  const date = parsed.date ? new Date(parsed.date).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—';

  let body = (parsed.text || '').trim();
  if (!body && parsed.html) body = '(nur HTML-Inhalt — im Postfach ansehen)';
  if (body.length > CFG.bodyMaxChars) {
    body = body.slice(0, CFG.bodyMaxChars) + '\n… (gekürzt, komplett im Postfach)';
  }

  const attachments = (parsed.attachments || [])
    .filter((a) => a.filename)
    .map((a) => a.filename);

  const lines = [
    '#### 📨 Neue Support-Mail',
    `**Von:** ${from}`,
    `**Betreff:** ${subject}`,
    `**Empfangen:** ${date}`,
  ];
  if (attachments.length) lines.push(`**Anhänge:** ${attachments.join(', ')}`);
  lines.push('', '```text', body || '(kein Textinhalt)', '```');
  return lines.join('\n');
}

// ---------- IMAP ----------
function makeClient() {
  return new ImapFlow({
    host: CFG.host,
    port: CFG.port,
    secure: CFG.secure,
    auth: { user: CFG.user, pass: CFG.pass },
    logger: false,
    emitLogs: false,
  });
}

/**
 * Ein Poll-Durchlauf: neue Mails (UID > lastUid) posten und State fortschreiben.
 * Verändert die Mailbox nicht (read-only Lock).
 */
async function pollOnce(client, state) {
  const lock = await client.getMailboxLock(CFG.mailbox, { readOnly: true });
  try {
    const mb = client.mailbox; // aktueller Mailbox-Status inkl. uidValidity/uidNext
    const uidValidity = Number(mb.uidValidity);

    // uidValidity gewechselt => UIDs sind nicht mehr vergleichbar. Neu baselinen.
    if (state.uidValidity !== null && state.uidValidity !== uidValidity) {
      log(`uidValidity gewechselt (${state.uidValidity} → ${uidValidity}) — Baseline wird neu gesetzt.`);
      state.uidValidity = uidValidity;
      state.lastUid = Math.max(0, Number(mb.uidNext) - 1);
      saveState(state);
      return;
    }

    // Erststart: Baseline setzen, Bestand nicht fluten.
    if (state.uidValidity === null) {
      state.uidValidity = uidValidity;
      state.lastUid = Math.max(0, Number(mb.uidNext) - 1);
      saveState(state);
      log(`Baseline gesetzt: uidValidity=${uidValidity}, lastUid=${state.lastUid} (Bestandsmails werden nicht gepostet).`);
      return;
    }

    // Neue Mails holen: UID-Range (lastUid+1):*
    const from = state.lastUid + 1;
    let processed = 0;
    for await (const msg of client.fetch(
      { uid: `${from}:*` },
      { uid: true, source: true },
      { uid: true }
    )) {
      // Schutz: fetch mit "*" kann die letzte Nachricht auch dann liefern,
      // wenn keine mit UID >= from existiert. Explizit filtern.
      if (Number(msg.uid) < from) continue;

      const parsed = await simpleParser(msg.source);
      const text = buildMessage(parsed);
      await postToMattermost(text); // wirft bei Fehler → Schleife bricht ab, Retry nächster Zyklus
      state.lastUid = Number(msg.uid);
      saveState(state);
      processed++;
      log(`Gepostet: UID=${msg.uid} | ${parsed.subject || '(kein Betreff)'}`);
    }
    if (processed) log(`${processed} neue Mail(s) verarbeitet. lastUid=${state.lastUid}`);
  } finally {
    lock.release();
  }
}

// ---------- Main-Loop ----------
let running = true;
let client = null;

async function ensureConnected() {
  if (client && client.usable) return client;
  if (client) {
    try { await client.logout(); } catch { /* ignore */ }
  }
  client = makeClient();
  client.on('error', (err) => errlog('IMAP-Fehler:', err?.message));
  await client.connect();
  log(`IMAP verbunden: ${CFG.user}@${CFG.host}:${CFG.port} (secure=${CFG.secure}), Mailbox=${CFG.mailbox}`);
  return client;
}

async function main() {
  assertConfig();
  const state = loadState();
  log(`Start. Poll-Intervall=${CFG.pollMs}ms, StateFile=${CFG.stateFile}, geladen: uidValidity=${state.uidValidity}, lastUid=${state.lastUid}`);

  while (running) {
    try {
      await ensureConnected();
      await pollOnce(client, state);
    } catch (e) {
      errlog('Zyklus-Fehler:', e?.message);
      // Verbindung verwerfen, damit der nächste Zyklus frisch aufbaut.
      try { if (client) await client.logout(); } catch { /* ignore */ }
      client = null;
    }
    await sleep(CFG.pollMs);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    log(`${sig} empfangen — beende sauber.`);
    running = false;
    try { if (client) await client.logout(); } catch { /* ignore */ }
    process.exit(0);
  });
}

main().catch((e) => {
  errlog('Fataler Fehler:', e?.message);
  process.exit(1);
});

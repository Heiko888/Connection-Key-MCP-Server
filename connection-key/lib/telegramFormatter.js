// Telegram MarkdownV2 formatter für Tagesimpuls-Nachrichten

/**
 * Escaped alle MarkdownV2-Sonderzeichen gemäß Telegram-Spec.
 * Muss auf alle Nutzertexte angewendet werden bevor sie in einer
 * MarkdownV2-Nachricht erscheinen.
 */
export function escapeMarkdownV2(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

/**
 * Formatiert einen Tagesimpuls-Text für Telegram (MarkdownV2).
 * @param {Object} opts
 * @param {string} opts.text        - Der fertige Impuls-Text
 * @param {string} [opts.date]      - Datum (YYYY-MM-DD), default: heute
 * @param {Object} [opts.transit]   - Transit-Daten { sun, moon, earth, moonPhase }
 * @param {string} [opts.clientName]
 * @returns {string} Telegram MarkdownV2-String
 */
export function formatImpulseForTelegram({ text, date, transit, clientName } = {}) {
  const displayDate = date || new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const lines = [];

  lines.push(`✨ *Tagesimpuls — ${escapeMarkdownV2(displayDate)}*`);

  if (transit?.sun?.gate) {
    lines.push(`☀️ Tor ${escapeMarkdownV2(String(transit.sun.gate))}\\.${escapeMarkdownV2(String(transit.sun.line || ''))}`);
  }
  if (transit?.moon?.gate) {
    lines.push(`🌙 Mond Tor ${escapeMarkdownV2(String(transit.moon.gate))}\\.${escapeMarkdownV2(String(transit.moon.line || ''))}`);
  }
  if (transit?.moonPhase) {
    lines.push(`🔮 ${escapeMarkdownV2(transit.moonPhase)}`);
  }

  lines.push('');
  lines.push(escapeMarkdownV2(text));
  lines.push('');
  lines.push(`_The Connection Key_`);

  return lines.join('\n');
}

/**
 * Formatiert ein Reel-Script für Telegram (als Text-Preview).
 * @param {Object} reel - Parsed reel JSON { hook, body[], cta, caption, hashtags[], duration_estimate }
 * @returns {string} Telegram MarkdownV2-String
 */
export function formatReelForTelegram(reel) {
  const lines = [];
  lines.push(`🎬 *Reel\\-Script \\(${escapeMarkdownV2(reel.duration_estimate || '~50s')}\\)*`);
  lines.push('');
  lines.push(`*Hook:* ${escapeMarkdownV2(reel.hook)}`);

  if (reel.body?.length) {
    lines.push('');
    lines.push('*Body:*');
    reel.body.forEach((s, i) => lines.push(`${i + 1}\\. ${escapeMarkdownV2(s)}`));
  }

  if (reel.cta) {
    lines.push('');
    lines.push(`*CTA:* ${escapeMarkdownV2(reel.cta)}`);
  }

  if (reel.caption) {
    lines.push('');
    lines.push(`*Caption:*`);
    lines.push(escapeMarkdownV2(reel.caption));
  }

  lines.push('');
  lines.push(`_The Connection Key_`);
  return lines.join('\n');
}

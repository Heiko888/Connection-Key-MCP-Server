# support-mail-bridge

Kleiner Dienst auf **.138**, der das Support-IMAP-Postfach (all-inkl / KAS) pollt
und **jede neue Mail** in einen **Mattermost-Incoming-Webhook** postet. So sieht das
Team eingehende Support-Mails direkt in Mattermost.

## Funktionsweise

- Öffnet das Postfach **read-only** — die `\Seen`-Flags werden nie verändert
  (Ungelesen-Status im Webmail bleibt erhalten).
- Idempotenz über die **IMAP-UID**: die höchste bereits verarbeitete UID wird
  persistent in `/data/state.json` gemerkt (Named Volume `support_mail_data`).
  Nur Mails mit `UID > lastUid` werden gepostet.
- **Erststart** setzt eine Baseline (höchste vorhandene UID) und postet den
  Bestand **nicht** (kein Flooding). Ab dann zählt jede neue Mail.
- Poll-Intervall Default **60 s**. Scheitert der Mattermost-Post, bleibt `lastUid`
  stehen → Retry im nächsten Zyklus (at-least-once).

## ENV (Root-`.env` auf .138)

| Variable | Pflicht | Default | Zweck |
|----------|---------|---------|-------|
| `SUPPORT_IMAP_HOST` | ✅ | — | all-inkl/KAS-IMAP-Server (z. B. `w01XXXXX.kasserver.com`) |
| `SUPPORT_IMAP_USER` | ✅ | — | volle Mailadresse, z. B. `support@the-connection-key.de` |
| `SUPPORT_IMAP_PASSWORD` | ✅ | — | Postfach-Passwort |
| `MATTERMOST_WEBHOOK_SUPPORT` | ✅ | — | Incoming-Webhook-URL des Ziel-Channels |
| `SUPPORT_IMAP_PORT` | | `993` | IMAP-Port (SSL) |
| `SUPPORT_IMAP_SECURE` | | `true` | TLS an/aus |
| `SUPPORT_IMAP_MAILBOX` | | `INBOX` | zu überwachender Ordner |
| `SUPPORT_POLL_INTERVAL_MS` | | `60000` | Poll-Intervall |
| `SUPPORT_MATTERMOST_USERNAME` | | `Support-Postfach` | Anzeigename in Mattermost |
| `SUPPORT_MATTERMOST_ICON` | | `:email:` | Emoji-Icon |
| `SUPPORT_MATTERMOST_CHANNEL` | | — | optionaler Channel-Override |

## Deploy

```bash
cd /opt/mcp-connection-key
docker compose build support-mail-bridge
docker compose up -d support-mail-bridge
docker logs -f support-mail-bridge
```

Erwartete Startlogs: `IMAP verbunden …` und (beim allerersten Start) `Baseline gesetzt …`.
Danach löst eine **neu eingehende** Test-Mail an das Postfach einen Mattermost-Post aus.

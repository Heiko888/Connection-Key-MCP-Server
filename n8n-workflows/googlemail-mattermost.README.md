# Google Mail → Mattermost (n8n-Workflow)

Postet **jede neue eingehende E-Mail** aus einem Google-Mail-Postfach als Nachricht in
einen Mattermost-Channel. Reine n8n-Automatisierung — kein App-Code, kein .138-Worker.

Datei: [`googlemail-mattermost.json`](./googlemail-mattermost.json)

```
Gmail Trigger  ──►  Send to Mattermost (Incoming-Webhook)
(pollt jede Minute)   $env.MATTERMOST_WEBHOOK_URL
```

## Nodes

| Node | Typ | Zweck |
|------|-----|-------|
| **Gmail Trigger** | `n8n-nodes-base.gmailTrigger` | Pollt das Postfach jede Minute auf neue Mails. Braucht eine **Gmail-OAuth2-Credential**. |
| **Send to Mattermost** | `n8n-nodes-base.httpRequest` | POSTet Von/Betreff/Snippet als Markdown an den Mattermost-Incoming-Webhook (`$env.MATTERMOST_WEBHOOK_URL`). |

## Einrichtung

1. **Import:** In n8n (`http://<server>:5678`) → *Workflows* → *Import from File* →
   `googlemail-mattermost.json`.
2. **Gmail-Credential anlegen:** *Credentials* → *New* → **Gmail OAuth2 API**
   (Google-Cloud-OAuth-Client mit Scope `https://www.googleapis.com/auth/gmail.readonly`,
   Redirect-URI aus n8n übernehmen). Danach im *Gmail Trigger*-Node auswählen — der Import
   trägt einen Platzhalter (`REPLACE_WITH_GMAIL_CREDENTIAL_ID`) ein, der ersetzt werden muss.
3. **ENV am n8n-Container** (wie die übrigen Mattermost-Workflows):
   - `MATTERMOST_WEBHOOK_URL` — Incoming-Webhook-URL (Secret, **Pflicht**).
   - `MATTERMOST_CHANNEL_MAIL` — optionaler Ziel-Channel-Override (Default: `MATTERMOST_CHANNEL`, sonst `#googlemail`).
   - `MATTERMOST_MAIL_USERNAME` — optionaler Anzeigename (Default: `Google Mail`).
4. **Aktivieren:** Workflow im n8n-Editor auf *Active* schalten.

## Hinweise

- Der Trigger nutzt `simple: true` (aufgelöste Felder). Das Mattermost-Body-Template greift
  defensiv auf mehrere Feldnamen zu (`from`/`From`/`headers.from`, `subject`/`Subject`/
  `headers.subject`, `snippet`/`textPlain`/`text`) und kürzt die Vorschau auf 1500 Zeichen.
- Optional lässt sich der Trigger über sein Feld *Filters* (Label, Absender, Suchbegriff)
  einschränken, damit nur bestimmte Mails gemeldet werden.
- Der Poll-Intervall steht auf *jede Minute*; für weniger Traffic in n8n auf ein größeres
  Intervall stellen.

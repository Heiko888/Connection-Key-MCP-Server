# ✅ Workflow importieren - Einfach erklärt

## 🎯 Was Sie tun müssen (3 Schritte)

### Schritt 1: Datei öffnen
1. Öffnen Sie diese Datei auf Ihrem Computer:
   ```
   C:\AppProgrammierung\Projekte\MCP_Connection_Key\integration\n8n-workflows\chart-calculation-workflow.json
   ```
2. Markieren Sie **ALLES** (Strg+A)
3. Kopieren Sie **ALLES** (Strg+C)

### Schritt 2: In n8n einfügen
1. Öffnen Sie n8n: `https://werdemeisterdeinergedankenagent.de`
2. Klicken Sie links auf **"Workflows"**
3. Klicken Sie oben rechts auf **"Import from URL or File"**
4. Klicken Sie auf **"Paste JSON"** (nicht "Import from URL"!)
5. Fügen Sie den kopierten Text ein (Strg+V)
6. Klicken Sie auf **"Import"**

### Schritt 3: Aktivieren
1. Der Workflow öffnet sich automatisch
2. Klicken Sie oben rechts auf **"Active"** (Toggle muss GRÜN sein)
3. Fertig!

---

## 🧪 Testen (Optional)

Nach dem Aktivieren können Sie testen:

```bash
curl -X POST https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'
```

---

## ❓ Falls es nicht funktioniert

**Problem:** "URL does not point to valid JSON file"
**Lösung:** Sie haben "Import from URL" verwendet - nutzen Sie stattdessen **"Paste JSON"**!

---

## ✅ Zusammenfassung

1. Datei öffnen → Alles kopieren
2. n8n öffnen → "Paste JSON" → Einfügen → Import
3. "Active" aktivieren

**Das war's!**


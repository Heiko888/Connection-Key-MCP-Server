# 📊 Marketingkonzepte-Workflow - Final

**Datum:** 18.12.2025  
**Status:** ✅ Erstellt

---

## ✅ Workflow erstellt

**Datei:** `n8n-workflows/marketing-concepts-generation.json`

**Features:**
- ✅ Schedule Trigger (täglich 9:00 Uhr)
- ✅ Marketing Agent aufrufen
- ✅ Spezifische Anfrage nach vollständigem Marketingkonzept
- ✅ Strukturierte Daten vorbereiten
- ✅ In Supabase speichern (`marketing_concepts` Tabelle)
- ✅ Mattermost Notification

---

## 🔄 Workflow-Struktur

```
1. Schedule Trigger (täglich 9:00)
   ↓
2. Call Marketing Agent
   Message: "Erstelle ein vollständiges Marketingkonzept für diese Woche:
             - Marketingstrategie
             - Kampagnen-Ideen
             - Content-Plan
             - Zielgruppen-Analyse
             - Kanal-Strategie"
   ↓
3. Prepare Data
   - concept_type: "weekly_marketing_concept"
   - marketing_concept: Agent-Antwort
   - week: Aktuelles Datum
   - agent_id: "marketing"
   - tokens: Von Agent
   ↓
4. Save to Supabase
   Tabelle: marketing_concepts
   ↓
5. Send to Mattermost
   Notification mit Vorschau
```

---

## 📋 Supabase-Tabelle benötigt

**Tabelle:** `marketing_concepts`

**Schema:**
```sql
CREATE TABLE marketing_concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_type VARCHAR(100) NOT NULL,
  marketing_concept TEXT NOT NULL,
  week DATE NOT NULL,
  agent_id VARCHAR(100),
  tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Migration erstellen:** `010_create_marketing_concepts_table.sql`

---

## 🚀 Aktivierung

1. **Supabase-Migration ausführen:**
   ```sql
   -- Tabelle marketing_concepts erstellen
   ```

2. **n8n-Workflow importieren:**
   - n8n öffnen
   - Workflow `marketing-concepts-generation.json` importieren
   - Supabase-Credentials konfigurieren
   - Mattermost-Webhook konfigurieren

3. **Workflow aktivieren:**
   - Active = GRÜN
   - Schedule Trigger konfigurieren (falls gewünscht)

---

## 📊 Integration mit Task-Management

**Optional:** Workflow kann auch `agent_tasks` Tabelle nutzen:

1. Vor Agent-Aufruf: Task erstellen
2. Nach Agent-Antwort: Task als completed markieren
3. Ergebnis in `agent_responses` speichern

**Vorteil:** Einheitliches Task-Management für alle Agenten

---

## ✅ Status

- ✅ Workflow erstellt
- ⏳ Supabase-Tabelle erstellen
- ⏳ n8n-Workflow importieren
- ⏳ Testen




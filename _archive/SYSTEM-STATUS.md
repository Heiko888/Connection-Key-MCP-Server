---

# SYSTEM STATUS – Reading System

⚠️ Dieses Dokument ist die verbindliche Quelle der Wahrheit.
Wenn Code, Migrationen oder Agenten davon abweichen, ist der Code falsch – nicht dieses Dokument.

## Aktives Reading-System (V2)
- Tabelle: coach_readings
- Versionsbasiertes System
- Unterstützt Single, Connection und Penta Readings
- Alle neuen Readings laufen ausschließlich über V2
- Job-System: reading_jobs

## Legacy-System
- Tabelle `readings` wurde bewusst entfernt
- Alte Endpoints existieren nur als Forwarder oder sind deaktiviert (410 Gone)
- Keine Migration zurück vorgesehen
- Keine neuen Features auf Legacy-Struktur

## Reading-Agent
- Externer Textgenerator (stateless)
- Keine eigene Datenhaltung
- Kein CRUD
- Keine Kenntnis von Datenbankstrukturen
- Liefert ausschließlich:
  - generatedText
  - essence

## Essence
- Kein eigenständiges System
- Keine eigene Tabelle
- Kein CRUD
- Bestandteil einer Reading-Version
- Wird aus generatedText abgeleitet
- Darf niemals isoliert gespeichert oder versioniert werden

## Migrationen
- Migrationen, die sich auf die Tabelle `readings` beziehen, sind obsolet
- Neue Migrationen dürfen sich ausschließlich auf:
  - coach_readings
  - reading_versions
  - reading_jobs
  beziehen
- Essence-bezogene Migrationen dürfen nur Felder innerhalb bestehender V2-Strukturen erweitern

## Architektur-Grundsatz
- Frontend erzeugt Readings ausschließlich über /api/coach/readings-v2/*
- Datenhaltung erfolgt nur über V2-Tabellen
- Agents sind austauschbar und niemals systemführend
- Die Datenbank ist die einzige Quelle der Wahrheit

---

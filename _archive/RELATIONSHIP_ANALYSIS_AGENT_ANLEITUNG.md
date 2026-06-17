# 🤖 Relationship Analysis Agent - Anleitung

**Datum:** 17.12.2025

**Ziel:** Tiefe Beziehungsanalysen im Human Design erstellen

---

## 📋 Übersicht

Der Relationship Analysis Agent erstellt strukturierte, ehrliche Beziehungsanalysen zwischen zwei Personen basierend auf ihren Human Design Charts.

---

## 🚀 Installation

### Schritt 1: Agent erstellen

```bash
# Script ausführbar machen
chmod +x create-relationship-analysis-agent.sh

# Auf Server ausführen
./create-relationship-analysis-agent.sh
```

**Oder manuell:**

```bash
# Auf Server
cd /opt/ck-agent

# Agent-Config erstellen
cat > agents/relationship-analysis-agent.json << 'EOF'
{
  "id": "relationship-analysis-agent",
  "name": "Relationship Analysis Agent",
  "description": "Hochspezialisierter Agent für tiefe Beziehungsanalysen im Human Design.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/relationship-analysis-agent.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 10000
}
EOF

# Prompt erstellen (siehe create-relationship-analysis-agent.sh)
# MCP Server neu starten
systemctl restart mcp
```

---

## 📦 Frontend-Integration

### Schritt 1: Komponente kopieren

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Komponente kopieren
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# Seite erstellen
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/
```

### Schritt 2: API-Route kopieren

```bash
# API-Route kopieren
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/
```

### Schritt 3: Frontend neu starten

```bash
# Docker
docker-compose restart frontend

# ODER direkt
pm2 restart frontend
```

---

## 🧪 Testen

### API-Test

```bash
curl -X POST http://localhost:3005/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "name": "Heiko",
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Miltenberg, Germany"
    },
    "person2": {
      "name": "Jani",
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "Wolfenbüttel, Germany"
    },
    "options": {
      "includeEscalation": true,
      "includePartnerProfile": true
    }
  }'
```

---

## 📝 Verwendung

### Frontend

1. Navigiere zu `/coach/readings/create`
2. Wähle "Beziehungsanalyse"
3. Fülle Daten für beide Personen aus
4. Wähle Optionen (Eskalation, Partnerinnen-Profil)
5. Klicke "Beziehungsanalyse erstellen"

### API

**Endpoint:** `POST /api/relationship-analysis/generate`

**Request:**
```json
{
  "person1": {
    "name": "Person 1",
    "birthDate": "1980-12-08",
    "birthTime": "22:10",
    "birthPlace": "Berlin, Germany"
  },
  "person2": {
    "name": "Person 2",
    "birthDate": "1977-06-03",
    "birthTime": "19:49",
    "birthPlace": "München, Germany"
  },
  "options": {
    "includeEscalation": false,
    "includePartnerProfile": false
  },
  "userId": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "relationship-analysis-1234567890",
  "reading": "...",
  "readingType": "relationship-analysis",
  "sections": {...},
  "metadata": {...}
}
```

---

## ✅ Checkliste

- [ ] Agent erstellt (`/opt/ck-agent/agents/relationship-analysis-agent.json`)
- [ ] Prompt erstellt (`/opt/ck-agent/prompts/relationship-analysis-agent.txt`)
- [ ] MCP Server neu gestartet
- [ ] Frontend-Komponente kopiert
- [ ] API-Route kopiert
- [ ] Frontend neu gestartet
- [ ] API getestet
- [ ] Frontend getestet

---

**🎉 Der Relationship Analysis Agent ist einsatzbereit!** 🚀

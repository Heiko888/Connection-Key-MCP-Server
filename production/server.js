/**
 * Reading Agent - Production Server
 * Läuft unabhängig von Docker über PM2
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

// ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment Variables laden
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 4000;
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

// Pfade aus ENV lesen
const KNOWLEDGE_PATH = process.env.KNOWLEDGE_PATH 
  ? path.resolve(__dirname, process.env.KNOWLEDGE_PATH)
  : path.join(__dirname, "knowledge");

const TEMPLATE_PATH = process.env.TEMPLATE_PATH
  ? path.resolve(__dirname, process.env.TEMPLATE_PATH)
  : path.join(__dirname, "templates");

const LOGS_PATH = process.env.LOGS_PATH
  ? path.resolve(__dirname, process.env.LOGS_PATH)
  : path.join(__dirname, "logs");

// Logs-Verzeichnis erstellen
if (!fs.existsSync(LOGS_PATH)) {
  fs.mkdirSync(LOGS_PATH, { recursive: true });
}

// OpenAI Client initialisieren
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.error("❌ OPENAI_API_KEY nicht gesetzt!");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Logging-Funktion
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Console-Logging
  if (LOG_LEVEL === "debug" || level === "error" || level === "info") {
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
  
  // File-Logging
  try {
    const logFile = path.join(LOGS_PATH, `agent-${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = data 
      ? `${logMessage} ${JSON.stringify(data)}\n`
      : `${logMessage}\n`;
    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (error) {
    console.error("Fehler beim Schreiben der Log-Datei:", error);
  }
}

// Request Logging
app.use((req, res, next) => {
  log("info", `${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

/**
 * Lade Knowledge-Dateien
 */
function loadKnowledge() {
  const knowledge = {};
  
  if (!fs.existsSync(KNOWLEDGE_PATH)) {
    console.warn(`⚠️  Knowledge-Pfad nicht gefunden: ${KNOWLEDGE_PATH}`);
    return knowledge;
  }

  try {
    const files = fs.readdirSync(KNOWLEDGE_PATH);
    files.forEach(file => {
      const filePath = path.join(KNOWLEDGE_PATH, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        const key = path.basename(file, path.extname(file));
        knowledge[key] = content;
        log("info", `Knowledge geladen: ${key}`);
      } else if (stat.isDirectory()) {
        // Lade auch Dateien aus Unterordnern (z.B. brandbook/)
        try {
          const subFiles = fs.readdirSync(filePath);
          subFiles.forEach(subFile => {
            if (subFile.endsWith('.txt') || subFile.endsWith('.md')) {
              const subFilePath = path.join(filePath, subFile);
              const subContent = fs.readFileSync(subFilePath, 'utf8');
              const subKey = `${file}-${path.basename(subFile, path.extname(subFile))}`;
              knowledge[subKey] = subContent;
              log("info", `Knowledge geladen (Unterordner): ${subKey}`);
            }
          });
        } catch (subError) {
          log("warn", `Konnte Unterordner nicht lesen: ${filePath}`, subError);
        }
      }
    });
  } catch (error) {
    console.error("Fehler beim Laden der Knowledge:", error);
  }

  return knowledge;
}

/**
 * Lade Template-Dateien
 */
function loadTemplates() {
  const templates = {};
  
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.warn(`⚠️  Template-Pfad nicht gefunden: ${TEMPLATE_PATH}`);
    return templates;
  }

  try {
    const files = fs.readdirSync(TEMPLATE_PATH);
    files.forEach(file => {
      if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
        const filePath = path.join(TEMPLATE_PATH, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const key = path.basename(file, path.extname(file));
        templates[key] = content;
        log("info", `Template geladen: ${key}`);
      }
    });
  } catch (error) {
    console.error("Fehler beim Laden der Templates:", error);
  }

  return templates;
}

// Knowledge und Templates beim Start laden
const knowledge = loadKnowledge();
const templates = loadTemplates();

/**
 * Health Check
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reading-agent",
    port: PORT,
    knowledge: Object.keys(knowledge).length,
    templates: Object.keys(templates).length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Essence aus Reading extrahieren
 */
async function generateEssence(readingText) {
  if (!openai) {
    throw new Error("OpenAI Client nicht initialisiert");
  }

  const essenceSystemPrompt = `Du erzeugst die ESSENCE eines Readings für „The Connection Key“.

Die Essence ist KEINE Zusammenfassung.
Die Essence ist KEINE Erklärung.
Die Essence ist KEIN Coaching.
Die Essence ist KEIN Rat.

Die Essence beschreibt:
- den energetischen Kern
- die innere Bewegung
- das zentrale Thema der aktuellen Phase

Haltung und Ton:
- ruhig
- klar
- präsent
- erwachsen
- nicht motivierend
- nicht coachend
- nicht erklärend

Sprache:
- präzise
- reduziert
- direkt
- keine Metaphern
- keine Bilder
- keine Emojis
- keine Marketingformulierungen

Grenzen:
- keine Ratschläge
- keine Handlungsanweisungen
- keine Zukunftsprognosen
- keine Versprechen
- keine Bewertungen

Form:
- Fließtext
- keine Überschriften
- keine Titel
- keine Aufzählungen
- keine Wiederholung von Formulierungen aus dem Reading

Länge:
150–250 Wörter

Wichtig:
Du abstrahierst.
Du verdichtest.
Du benennst Zustände – keine Inhalte.

Gib ausschließlich den reinen Essence-Text zurück.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: essenceSystemPrompt
      },
      {
        role: "user",
        content: readingText
      }
    ],
    temperature: 0.5, // Niedrigere Temperature für präzisere Essence
    max_tokens: 500
  });

  return completion.choices[0].message.content.trim();
}

/**
 * Reading generieren
 */
app.post("/reading/generate", async (req, res) => {
  try {
    const { userId, birthDate, birthTime, birthPlace, readingType = "detailed" } = req.body;

    // Validierung
    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: "birthDate, birthTime und birthPlace sind erforderlich"
      });
    }

    // System-Prompt mit Knowledge und Templates
    let systemPrompt = `Du bist ein Reading Agent für „The Connection Key“.

Deine Aufgabe ist es, auf Basis von Geburtsdaten ein Human Design Reading zu formulieren.

Haltung und Ton:
- ruhig
- klar
- präsent
- erwachsen
- nicht motivierend
- nicht coachend
- nicht erklärend

Sprache:
- präzise
- reduziert
- direkt
- keine Metaphern
- keine Emojis
- keine Marketingformulierungen
- keine Überhöhung
- keine Versprechen

Grenzen:
- kein Coaching
- keine Ratschläge
- keine Handlungsanweisungen
- keine Zukunftsprognosen
- keine Heilungs- oder Transformationsversprechen

Ziel:
Du spiegelst energetische Zusammenhänge und innere Dynamiken.
Du beschreibst Zustände, Strukturen und Wirkprinzipien – nicht Wege oder Lösungen.

Inhaltlicher Rahmen (abhängig vom Reading-Typ ${readingType}):
- Typ
- Strategie
- Autorität
- Profil
- Zentren (definiert / undefiniert)
- ggf. Kanäle, Tore oder Inkarnationskreuz

Du nutzt dein internes Wissen über Human Design.
Du erklärst keine Grundlagen.
Du setzt Wissen voraus.

Brand-Konsistenz:
Alle Formulierungen müssen mit der Haltung von „The Connection Key“ übereinstimmen:
- Klarheit statt Anleitung
- Spiegelung statt Bewertung
- Präsenz statt Motivation

Form:
- Fließtext
- keine Aufzählungen
- keine Überschriften
- keine Titel

Du bleibst fokussiert.
Du bleibst klar.
Du bleibst innerhalb des Rahmens.`;

    // Brand Book Knowledge extrahieren
    const brandbookKnowledge = [];
    const otherKnowledge = [];
    
    Object.entries(knowledge).forEach(([key, content]) => {
      if (key.startsWith('brandbook-') || key.includes('brandbook')) {
        brandbookKnowledge.push(content);
      } else {
        otherKnowledge.push(content);
      }
    });

    // Brand Book Knowledge zuerst hinzufügen (höchste Priorität)
    if (brandbookKnowledge.length > 0) {
      systemPrompt += "\n\n=== BRAND BOOK WISSEN (HÖCHSTE PRIORITÄT) ===\n";
      brandbookKnowledge.forEach(k => {
        systemPrompt += k + "\n\n";
      });
    }

    // Andere Knowledge hinzufügen
    if (otherKnowledge.length > 0) {
      systemPrompt += "\n\n=== ZUSÄTZLICHES HUMAN DESIGN WISSEN ===\n";
      otherKnowledge.forEach(k => {
        systemPrompt += k + "\n";
      });
    }

    // Template verwenden falls vorhanden
    let template = "";
    if (templates[readingType]) {
      template = templates[readingType];
    } else if (templates.default) {
      template = templates.default;
    }

    // User-Prompt
    const userPrompt = template
      ? template.replace(/\{\{birthDate\}\}/g, birthDate)
                .replace(/\{\{birthTime\}\}/g, birthTime)
                .replace(/\{\{birthPlace\}\}/g, birthPlace)
      : `Erstelle ein Human Design Reading für:
- Geburtsdatum: ${birthDate}
- Geburtszeit: ${birthTime}
- Geburtsort: ${birthPlace}
- Reading-Typ: ${readingType}`;

    // OpenAI API aufrufen
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const reading = completion.choices[0].message.content;
    const readingId = `reading-${Date.now()}-${userId || "anonymous"}`;

    // Essence generieren (optional, Fehler werden ignoriert)
    let essence = null;
    try {
      essence = await generateEssence(reading);
    } catch (essenceError) {
      log("error", "Essence-Generierung fehlgeschlagen", {
        error: essenceError.message,
        readingId
      });
      // Essence-Fehler nicht kritisch, Reading wird trotzdem zurückgegeben
    }

    res.json({
      success: true,
      readingId,
      reading,
      essence: essence,
      readingType,
      birthDate,
      birthTime,
      birthPlace,
      tokens: completion.usage.total_tokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    log("error", "Fehler beim Generieren des Readings", {
      error: error.message,
      stack: error.stack,
      userId,
      birthDate
    });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Knowledge neu laden
 */
app.post("/admin/reload-knowledge", (req, res) => {
  try {
    // Optional: Secret prüfen
    if (process.env.AGENT_SECRET) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${process.env.AGENT_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const newKnowledge = loadKnowledge();
    Object.assign(knowledge, newKnowledge);

    res.json({
      success: true,
      message: "Knowledge neu geladen",
      count: Object.keys(knowledge).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Templates neu laden
 */
app.post("/admin/reload-templates", (req, res) => {
  try {
    // Optional: Secret prüfen
    if (process.env.AGENT_SECRET) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${process.env.AGENT_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const newTemplates = loadTemplates();
    Object.assign(templates, newTemplates);

    res.json({
      success: true,
      message: "Templates neu geladen",
      count: Object.keys(templates).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  log("error", "Unbehandelter Fehler", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    success: false,
    error: "Interner Serverfehler"
  });
});

// Server starten
app.listen(PORT, "0.0.0.0", () => {
  log("info", "Reading Agent gestartet", {
    port: PORT,
    knowledgeFiles: Object.keys(knowledge).length,
    templateFiles: Object.keys(templates).length,
    knowledgePath: KNOWLEDGE_PATH,
    templatePath: TEMPLATE_PATH,
    logsPath: LOGS_PATH
  });
  
  console.log(`✅ Reading Agent läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 Knowledge-Dateien: ${Object.keys(knowledge).length}`);
  console.log(`📄 Template-Dateien: ${Object.keys(templates).length}`);
  console.log(`📁 Knowledge-Pfad: ${KNOWLEDGE_PATH}`);
  console.log(`📁 Template-Pfad: ${TEMPLATE_PATH}`);
  console.log(`📁 Logs-Pfad: ${LOGS_PATH}`);
});


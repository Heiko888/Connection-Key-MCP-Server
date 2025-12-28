import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "./config.js";

// MCP Server erstellen
const server = new McpServer(
  {
    name: "mcp-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// ---- TOOL REGISTRIEREN ----

// Ping Tool - Test-Tool für Verbindung
server.registerTool(
  "ping",
  {
    title: "Ping Tool",
    description: "Antwortet mit pong. Nützlich zum Testen der Server-Verbindung.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      message: z.string()
    })
  },
  async () => ({
    content: [
      { type: "text", text: "pong" }
    ],
    structuredContent: { message: "pong" }
  })
);

// Echo Tool - Gibt eingegebenen Text zurück
server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Gibt den eingegebenen Text zurück. Nützlich zum Testen von Parametern.",
    inputSchema: z.object({
      text: z.string().describe("Der Text, der zurückgegeben werden soll")
    }),
    outputSchema: z.object({
      echo: z.string()
    })
  },
  async ({ text }) => ({
    content: [
      { type: "text", text: `Echo: ${text}` }
    ],
    structuredContent: { echo: text }
  })
);

// Datum/Zeit Tool - Gibt aktuelle Datum und Zeit zurück
server.registerTool(
  "getDateTime",
  {
    title: "Datum und Zeit",
    description: "Gibt das aktuelle Datum und die aktuelle Uhrzeit zurück.",
    inputSchema: z.object({
      timezone: z.string().optional().describe("Zeitzone (z.B. 'Europe/Berlin'), Standard: UTC")
    }),
    outputSchema: z.object({
      dateTime: z.string(),
      timestamp: z.number(),
      timezone: z.string()
    })
  },
  async ({ timezone }) => {
    const now = new Date();
    const tz = timezone || "UTC";
    const dateTimeStr = now.toLocaleString("de-DE", { 
      timeZone: tz,
      dateStyle: "full",
      timeStyle: "long"
    });
    
    return {
      content: [
        { type: "text", text: `Aktuelles Datum und Zeit (${tz}): ${dateTimeStr}` }
      ],
      structuredContent: {
        dateTime: dateTimeStr,
        timestamp: now.getTime(),
        timezone: tz
      }
    };
  }
);

// Calculator Tool - Führt einfache Berechnungen durch
server.registerTool(
  "calculate",
  {
    title: "Taschenrechner",
    description: "Führt mathematische Berechnungen durch. Unterstützt +, -, *, /, %, ** (Potenz).",
    inputSchema: z.object({
      expression: z.string().describe("Mathematischer Ausdruck (z.B. '2 + 2', '10 * 5', '2 ** 3')")
    }),
    outputSchema: z.object({
      result: z.number(),
      expression: z.string()
    })
  },
  async ({ expression }) => {
    try {
      // Sicherheitsprüfung: Nur mathematische Zeichen erlauben
      const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function(`"use strict"; return (${safeExpression})`)();
      
      if (typeof result !== "number" || !isFinite(result)) {
        throw new Error("Ungültiges Berechnungsergebnis");
      }
      
      return {
        content: [
          { type: "text", text: `${expression} = ${result}` }
        ],
        structuredContent: {
          result,
          expression
        }
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Fehler bei der Berechnung: ${error.message}` }
        ],
        structuredContent: {
          result: 0,
          expression,
          error: error.message
        }
      };
    }
  }
);

// UUID Generator Tool - Generiert eine UUID
server.registerTool(
  "generateUUID",
  {
    title: "UUID Generator",
    description: "Generiert eine eindeutige UUID (Universally Unique Identifier).",
    inputSchema: z.object({
      version: z.enum(["v4", "v1"]).optional().default("v4").describe("UUID Version (v4 = zufällig, v1 = zeitbasiert)")
    }),
    outputSchema: z.object({
      uuid: z.string(),
      version: z.string()
    })
  },
  async ({ version }) => {
    let uuid;
    if (version === "v4") {
      // Einfache v4 UUID Generierung
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      // v1 UUID (vereinfacht)
      const timestamp = Date.now();
      const random = Math.random().toString(16).substring(2, 10);
      uuid = `${timestamp.toString(16)}-${random}-1xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    return {
      content: [
        { type: "text", text: `Generierte UUID (${version}): ${uuid}` }
      ],
      structuredContent: {
        uuid,
        version
      }
    };
  }
);

// ============================================
// n8n INTEGRATION TOOLS
// ============================================

// callN8N - Ruft die n8n API auf
server.registerTool(
  "callN8N",
  {
    title: "n8n API aufrufen",
    description: "Ruft die n8n REST API auf. Kann Workflows starten, Daten senden oder abrufen.",
    inputSchema: z.object({
      endpoint: z.string().describe("API-Endpoint (z.B. '/api/v1/workflows' oder '/webhook/reading')"),
      method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("POST").describe("HTTP-Methode"),
      body: z.record(z.unknown()).optional().describe("Request Body als JSON-Objekt"),
      headers: z.record(z.string()).optional().describe("Zusätzliche HTTP-Header")
    }),
    outputSchema: z.object({
      status: z.number(),
      data: z.unknown(),
      success: z.boolean()
    })
  },
  async ({ endpoint, method = "POST", body, headers = {} }) => {
    try {
      const url = `${config.n8n.baseUrl}${endpoint}`;
      const requestHeaders = {
        "Content-Type": "application/json",
        ...headers
      };

      if (config.n8n.apiKey) {
        requestHeaders["X-N8N-API-KEY"] = config.n8n.apiKey;
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json().catch(() => ({ message: "Keine JSON-Antwort" }));

      return {
        content: [
          {
            type: "text",
            text: `n8n API-Aufruf: ${method} ${endpoint}\nStatus: ${response.status}\nAntwort: ${JSON.stringify(data, null, 2)}`
          }
        ],
        structuredContent: {
          status: response.status,
          data,
          success: response.ok
        }
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim n8n API-Aufruf: ${error.message}`
          }
        ],
        structuredContent: {
          status: 500,
          data: { error: error.message },
          success: false
        }
      };
    }
  }
);

// createN8NWorkflow - Erstellt einen neuen n8n Workflow
server.registerTool(
  "createN8NWorkflow",
  {
    title: "n8n Workflow erstellen",
    description: "Erstellt einen neuen n8n Workflow mit dem angegebenen Namen und Nodes.",
    inputSchema: z.object({
      name: z.string().describe("Name des Workflows"),
      nodes: z.array(z.record(z.unknown())).describe("Array von Workflow-Nodes"),
      active: z.boolean().optional().default(false).describe("Workflow aktivieren (Standard: false)"),
      tags: z.array(z.string()).optional().describe("Tags für den Workflow")
    }),
    outputSchema: z.object({
      workflowId: z.string(),
      name: z.string(),
      nodeCount: z.number(),
      message: z.string()
    })
  },
  async ({ name, nodes, active = false, tags = [] }) => {
    try {
      const workflowData = {
        name,
        nodes,
        active,
        tags,
        connections: {},
        settings: {},
        staticData: null
      };

      const result = await fetch(`${config.n8n.baseUrl}${config.n8n.api.workflows}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.n8n.apiKey && { "X-N8N-API-KEY": config.n8n.apiKey })
        },
        body: JSON.stringify(workflowData)
      });

      const data = await result.json();

      if (result.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Workflow '${name}' wurde erfolgreich erstellt mit ${nodes.length} Nodes.\nWorkflow ID: ${data.id || "N/A"}`
            }
          ],
          structuredContent: {
            workflowId: data.id || "",
            name,
            nodeCount: nodes.length,
            message: `Workflow '${name}' wurde erstellt mit ${nodes.length} Nodes.`
          }
        };
      } else {
        throw new Error(data.message || "Workflow konnte nicht erstellt werden");
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Erstellen des Workflows: ${error.message}`
          }
        ],
        structuredContent: {
          workflowId: "",
          name,
          nodeCount: nodes.length,
          message: `Fehler: ${error.message}`
        }
      };
    }
  }
);

// triggerN8NWebhook - Startet einen n8n Webhook-Workflow
server.registerTool(
  "triggerN8NWebhook",
  {
    title: "n8n Webhook auslösen",
    description: "Löst einen n8n Webhook-Workflow aus. Nützlich zum Starten von Automatisierungen.",
    inputSchema: z.object({
      webhookPath: z.string().describe("Webhook-Pfad (z.B. 'reading', 'matching', 'chart-analysis')"),
      data: z.record(z.unknown()).describe("Daten, die an den Webhook gesendet werden sollen")
    }),
    outputSchema: z.object({
      success: z.boolean(),
      executionId: z.string().optional(),
      message: z.string()
    })
  },
  async ({ webhookPath, data }) => {
    try {
      // Webhook-Pfad normalisieren (mit oder ohne /webhook/)
      const path = webhookPath.startsWith("/") 
        ? webhookPath 
        : `/webhook/${webhookPath}`;

      const url = `${config.n8n.baseUrl}${path}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Webhook '${webhookPath}' erfolgreich ausgelöst.\nAntwort: ${JSON.stringify(responseData, null, 2)}`
            }
          ],
          structuredContent: {
            success: true,
            executionId: responseData.executionId || responseData.id || "",
            message: `Webhook '${webhookPath}' erfolgreich ausgelöst`
          }
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Auslösen des Webhooks: ${error.message}`
          }
        ],
        structuredContent: {
          success: false,
          message: `Fehler: ${error.message}`
        }
      };
    }
  }
);

// ============================================
// HUMAN DESIGN TOOLS
// ============================================

// generateReading - Generiert ein Human Design Reading
server.registerTool(
  "generateReading",
  {
    title: "Human Design Reading generieren",
    description: "Generiert ein Human Design Reading basierend auf Geburtsdaten. Ruft n8n Workflow auf.",
    inputSchema: z.object({
      readingId: z.string().describe("Reading Job ID (UUID) - ZWINGEND erforderlich"),
      name: z.string().describe("Name (PFLICHTFELD)"),
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Geburtsdatum im Format YYYY-MM-DD (PFLICHTFELD)"),
      birthTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).describe("Geburtszeit im Format HH:mm (PFLICHTFELD)"),
      birthPlace: z.string().min(2).max(255).describe("Geburtsort (PFLICHTFELD)"),
      readingType: z.enum(["basic", "detailed", "business", "relationship"]).describe("Reading-Typ (PFLICHTFELD)"),
      focus: z.string().min(1).max(500).describe("Focus (PFLICHTFELD)"),
      userId: z.string().optional().describe("User-ID (optional)"),
      birthDate2: z.string().optional().describe("Geburtsdatum Person 2 (nur für Compatibility)"),
      birthTime2: z.string().optional().describe("Geburtszeit Person 2 (nur für Compatibility)"),
      birthPlace2: z.string().optional().describe("Geburtsort Person 2 (nur für Compatibility)")
    }),
    outputSchema: z.object({
      readingId: z.string(),
      chartData: z.record(z.unknown()),
      reading: z.string(),
      success: z.boolean()
    })
  },
  async ({ readingId, name, birthDate, birthTime, birthPlace, readingType, focus, userId, birthDate2, birthTime2, birthPlace2 }) => {
    const startTime = Date.now();
    
    console.log(`[MCP Core] generateReading aufgerufen für readingId: ${readingId}, readingType: ${readingType}`);
    
    // HARTE VALIDIERUNG: Alle PFLICHTFELDER müssen vorhanden sein
    const requiredFields = { readingId, name, birthDate, birthTime, birthPlace, readingType, focus };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      const errorMsg = `PFLICHTFELDER fehlen: ${missingFields.join(', ')}`;
      console.error(`[MCP Core] VALIDIERUNGSFEHLER: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    // Format-Validierung
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      throw new Error('birthDate muss im Format YYYY-MM-DD sein');
    }
    
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(birthTime)) {
      throw new Error('birthTime muss im Format HH:mm sein');
    }
    
    try {
      // Payload-Struktur (Contract) - Normalisiert
      const payload = {
        readingId: readingId.trim(),
        name: name.trim(),
        birthDate: birthDate.trim(),
        birthTime: birthTime.trim(),
        birthPlace: birthPlace.trim(),
        readingType: readingType,
        focus: focus.trim(),
        userId: userId || null,
        // Für Compatibility Reading
        ...(readingType === 'compatibility' && birthDate2 && birthTime2 && birthPlace2 && {
          birthDate2: birthDate2.trim(),
          birthTime2: birthTime2.trim(),
          birthPlace2: birthPlace2.trim()
        })
      };
      
      console.log(`[MCP Core] Payload validiert und normalisiert für readingId: ${readingId}`);

      console.log(`[MCP Core] Rufe n8n Webhook auf für readingId: ${readingId}`);

      // n8n Webhook aufrufen (verbindlich: /webhook/reading)
      const webhookPath = config.n8n.webhooks.reading; // = "/webhook/reading"
      const url = `${config.n8n.baseUrl}${webhookPath}`;

      console.log(`[MCP Core] n8n Webhook URL: ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[MCP Core] n8n Webhook Fehler (${response.status}) für readingId: ${readingId}`, errorText);
        throw new Error(`n8n webhook failed (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log(`[MCP Core] n8n Webhook erfolgreich für readingId: ${readingId}`);

      // Normalisierte Response (für MCP Gateway)
      return {
        content: [
          {
            type: "text",
            text: result.reading || result.summary || "Reading wurde generiert"
          }
        ],
        structuredContent: {
          success: true,
          readingId: readingId, // ← Verwende readingId aus Input (nicht aus n8n Response)
          reading: result.reading || result.summary || "Reading wurde generiert",
          chartData: result.chartData || chartData,
          tokens: result.tokens || 0,
          runtimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error(`[MCP Core] Fehler beim Generieren des Readings für readingId: ${readingId}`, error);
      
      // Normalisierte Error-Response
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Generieren des Readings: ${error.message}`
          }
        ],
        structuredContent: {
          success: false,
          readingId: readingId || "",
          reading: `Fehler: ${error.message}`,
          chartData: chartData || {},
          tokens: 0,
          runtimeMs: Date.now() - startTime,
          error: {
            code: "READING_GENERATION_ERROR",
            message: error.message
          }
        }
      };
    }
  }
);

// analyzeChart - Analysiert Human Design Chart-Daten
server.registerTool(
  "analyzeChart",
  {
    title: "Human Design Chart analysieren",
    description: "Analysiert Human Design Chart-Daten und gibt detaillierte Informationen zurück.",
    inputSchema: z.object({
      chartData: z.record(z.unknown()).describe("Chart-Daten (Typ, Zentren, Channels, etc.)"),
      analysisType: z.enum(["type", "centers", "channels", "gates", "profile", "full"]).optional().default("full").describe("Art der Analyse")
    }),
    outputSchema: z.object({
      analysis: z.record(z.unknown()),
      summary: z.string(),
      success: z.boolean()
    })
  },
  async ({ chartData, analysisType = "full" }) => {
    try {
      // n8n Webhook für Chart-Analyse aufrufen
      const webhookPath = config.n8n.webhooks.chartAnalysis;
      const url = `${config.n8n.baseUrl}${webhookPath}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chartData,
          analysisType,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Chart-Analyse erfolgreich durchgeführt.\n\n${result.summary || result.analysis || "Analyse abgeschlossen"}`
            }
          ],
          structuredContent: {
            analysis: result.analysis || result,
            summary: result.summary || "Analyse erfolgreich abgeschlossen",
            success: true
          }
        };
      } else {
        throw new Error(result.message || "Chart-Analyse fehlgeschlagen");
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler bei der Chart-Analyse: ${error.message}`
          }
        ],
        structuredContent: {
          analysis: {},
          summary: `Fehler: ${error.message}`,
          success: false
        }
      };
    }
  }
);

// ============================================
// MATCHING TOOLS
// ============================================

// matchPartner - Führt Partner-Matching durch
server.registerTool(
  "matchPartner",
  {
    title: "Partner-Matching durchführen",
    description: "Führt Human Design Partner-Matching zwischen zwei Personen durch.",
    inputSchema: z.object({
      user1Chart: z.record(z.unknown()).describe("Chart-Daten der ersten Person"),
      user2Chart: z.record(z.unknown()).describe("Chart-Daten der zweiten Person"),
      matchingType: z.enum(["compatibility", "relationship", "business", "full"]).optional().default("compatibility").describe("Art des Matchings"),
      userId1: z.string().optional().describe("User-ID der ersten Person"),
      userId2: z.string().optional().describe("User-ID der zweiten Person")
    }),
    outputSchema: z.object({
      matchId: z.string(),
      compatibilityScore: z.number(),
      analysis: z.record(z.unknown()),
      recommendations: z.array(z.string()),
      success: z.boolean()
    })
  },
  async ({ user1Chart, user2Chart, matchingType = "compatibility", userId1, userId2 }) => {
    try {
      // n8n Webhook für Matching aufrufen
      const webhookPath = config.n8n.webhooks.matching;
      const url = `${config.n8n.baseUrl}${webhookPath}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user1Chart,
          user2Chart,
          matchingType,
          userId1,
          userId2,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Partner-Matching erfolgreich durchgeführt.\nKompatibilitäts-Score: ${result.compatibilityScore || result.score || "N/A"}\n\nEmpfehlungen:\n${(result.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join("\n")}`
            }
          ],
          structuredContent: {
            matchId: result.matchId || result.id || "",
            compatibilityScore: result.compatibilityScore || result.score || 0,
            analysis: result.analysis || result,
            recommendations: result.recommendations || [],
            success: true
          }
        };
      } else {
        throw new Error(result.message || "Matching fehlgeschlagen");
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Partner-Matching: ${error.message}`
          }
        ],
        structuredContent: {
          matchId: "",
          compatibilityScore: 0,
          analysis: {},
          recommendations: [],
          success: false
        }
      };
    }
  }
);

// ============================================
// USER DATA TOOLS
// ============================================

// saveUserData - Speichert User-Daten über n8n
server.registerTool(
  "saveUserData",
  {
    title: "User-Daten speichern",
    description: "Speichert User-Daten über n8n Webhook. Nützlich für App-User-Login und Datenverarbeitung.",
    inputSchema: z.object({
      userId: z.string().describe("User-ID"),
      data: z.record(z.unknown()).describe("Zu speichernde Daten"),
      dataType: z.enum(["profile", "chart", "reading", "preferences", "custom"]).optional().default("custom").describe("Art der Daten")
    }),
    outputSchema: z.object({
      success: z.boolean(),
      recordId: z.string().optional(),
      message: z.string()
    })
  },
  async ({ userId, data, dataType = "custom" }) => {
    try {
      const webhookPath = config.n8n.webhooks.userData;
      const url = `${config.n8n.baseUrl}${webhookPath}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          data,
          dataType,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `User-Daten erfolgreich gespeichert.\nRecord ID: ${result.recordId || result.id || "N/A"}`
            }
          ],
          structuredContent: {
            success: true,
            recordId: result.recordId || result.id || "",
            message: "User-Daten erfolgreich gespeichert"
          }
        };
      } else {
        throw new Error(result.message || "Daten konnten nicht gespeichert werden");
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Speichern der User-Daten: ${error.message}`
          }
        ],
        structuredContent: {
          success: false,
          message: `Fehler: ${error.message}`
        }
      };
    }
  }
);

// ---- SERVER STARTEN ----
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server is running...");
}

main().catch(error => {
  console.error("Server error:", error);
  process.exit(1);
});

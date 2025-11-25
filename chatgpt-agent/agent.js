import OpenAI from "openai";
import { MCPClient } from "./mcp-client.js";
import { MemoryManager } from "./memory.js";
import { ToolRegistry } from "./tools/index.js";

/**
 * ChatGPT-Agent - Hauptklasse für KI-Interaktionen
 * 
 * Dieser Agent:
 * - Verwaltet Chat-Sessions mit Memory
 * - Nutzt MCP Tools
 * - Ruft n8n Workflows auf
 * - Führt Human Design Readings durch
 * - Macht Business- und Beziehungsauswertungen
 */
export class ChatGPTAgent {
  constructor(config = {}) {
    this.config = {
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      model: config.model || "gpt-4o",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
      mcpServerUrl: config.mcpServerUrl || process.env.MCP_SERVER_URL || "http://localhost:7777",
      n8nBaseUrl: config.n8nBaseUrl || process.env.N8N_BASE_URL || "http://localhost:5678",
      ...config
    };

    if (!this.config.openaiApiKey) {
      throw new Error("OPENAI_API_KEY ist erforderlich");
    }

    // OpenAI Client initialisieren
    this.openai = new OpenAI({
      apiKey: this.config.openaiApiKey
    });

    // Memory Manager für Sessions
    this.memory = new MemoryManager();

    // MCP Client für Tool-Aufrufe
    this.mcpClient = new MCPClient(this.config.mcpServerUrl);

    // Tool Registry
    this.tools = new ToolRegistry(this);

    // System-Prompt für den Agent
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Erstellt den System-Prompt für den Agent
   */
  buildSystemPrompt() {
    return `Du bist ein spezialisierter Human Design KI-Assistent.

Deine Hauptaufgaben:
1. Human Design Readings generieren und analysieren
2. Partner-Matching durchführen
3. Business-Readings erstellen
4. Coaching-Gespräche führen
5. Chart-Daten analysieren
6. Nutzer-Sessions verwalten

Verfügbare Tools:
- generateReading: Erstellt Human Design Readings
- analyzeChart: Analysiert Chart-Daten
- matchPartner: Führt Partner-Matching durch
- callN8N: Ruft n8n Workflows auf
- saveUserData: Speichert User-Daten

Du solltest:
- Immer freundlich und professionell sein
- Präzise und hilfreiche Antworten geben
- Bei Bedarf Tools verwenden, um Aufgaben zu erfüllen
- Den Kontext aus vorherigen Nachrichten berücksichtigen
- Bei komplexen Anfragen mehrere Tools kombinieren

Antworte immer auf Deutsch, es sei denn, der Nutzer spricht eine andere Sprache.`;
  }

  /**
   * Verarbeitet eine Nachricht vom Nutzer
   * @param {string} userId - Eindeutige User-ID
   * @param {string} message - Nachricht vom Nutzer
   * @param {object} context - Zusätzlicher Kontext (optional)
   * @returns {Promise<object>} Antwort des Agents
   */
  async processMessage(userId, message, context = {}) {
    try {
      // Session-Memory laden
      const session = this.memory.getSession(userId);
      const conversationHistory = session.messages || [];

      // Verfügbare Tools für OpenAI
      const availableTools = this.tools.getOpenAITools();

      // Konversationsverlauf aufbauen
      const messages = [
        { role: "system", content: this.systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ];

      // OpenAI API aufrufen
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        tools: availableTools.length > 0 ? availableTools : undefined,
        tool_choice: "auto",
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const assistantMessage = response.choices[0].message;

      // Tool-Aufrufe verarbeiten
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolResults = await this.processToolCalls(assistantMessage.tool_calls, userId, context);
        
        // Zweiter API-Aufruf mit Tool-Ergebnissen
        messages.push(assistantMessage);
        messages.push({
          role: "tool",
          tool_call_id: assistantMessage.tool_calls[0].id,
          content: JSON.stringify(toolResults[0])
        });

        const finalResponse = await this.openai.chat.completions.create({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        });

        const finalMessage = finalResponse.choices[0].message;

        // Memory aktualisieren
        this.memory.addMessage(userId, "user", message);
        this.memory.addMessage(userId, "assistant", finalMessage.content);

        return {
          success: true,
          message: finalMessage.content,
          toolCalls: assistantMessage.tool_calls,
          toolResults: toolResults,
          sessionId: session.id
        };
      }

      // Keine Tools, direkte Antwort
      const responseText = assistantMessage.content || "Ich konnte keine Antwort generieren.";

      // Memory aktualisieren
      this.memory.addMessage(userId, "user", message);
      this.memory.addMessage(userId, "assistant", responseText);

      return {
        success: true,
        message: responseText,
        sessionId: session.id
      };

    } catch (error) {
      console.error("Fehler beim Verarbeiten der Nachricht:", error);
      return {
        success: false,
        message: `Entschuldigung, es ist ein Fehler aufgetreten: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Verarbeitet Tool-Aufrufe von OpenAI
   */
  async processToolCalls(toolCalls, userId, context) {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

        // Tool ausführen
        const result = await this.tools.executeTool(toolName, {
          ...toolArgs,
          userId,
          ...context
        });

        results.push({
          tool_call_id: toolCall.id,
          name: toolName,
          result
        });
      } catch (error) {
        console.error(`Fehler beim Ausführen von Tool ${toolCall.function.name}:`, error);
        results.push({
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Generiert ein Human Design Reading
   */
  async generateReading(userId, birthData) {
    try {
      const result = await this.mcpClient.callTool("generateReading", {
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        birthPlace: birthData.birthPlace,
        userId,
        readingType: birthData.readingType || "detailed"
      });

      return result;
    } catch (error) {
      throw new Error(`Fehler beim Generieren des Readings: ${error.message}`);
    }
  }

  /**
   * Führt Partner-Matching durch
   */
  async matchPartners(userId1, userId2, user1Chart, user2Chart) {
    try {
      const result = await this.mcpClient.callTool("matchPartner", {
        user1Chart,
        user2Chart,
        matchingType: "full",
        userId1: userId1,
        userId2: userId2
      });

      return result;
    } catch (error) {
      throw new Error(`Fehler beim Partner-Matching: ${error.message}`);
    }
  }

  /**
   * Ruft einen n8n Workflow auf
   */
  async triggerN8NWorkflow(webhookPath, data) {
    try {
      const result = await this.mcpClient.callTool("triggerN8NWebhook", {
        webhookPath,
        data
      });

      return result;
    } catch (error) {
      throw new Error(`Fehler beim Auslösen des n8n Workflows: ${error.message}`);
    }
  }

  /**
   * Löscht eine Session
   */
  clearSession(userId) {
    this.memory.clearSession(userId);
  }

  /**
   * Gibt Session-Informationen zurück
   */
  getSessionInfo(userId) {
    const session = this.memory.getSession(userId);
    return {
      userId,
      messageCount: session.messages?.length || 0,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    };
  }
}


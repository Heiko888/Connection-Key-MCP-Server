/**
 * MCP Client - Kommuniziert mit dem MCP Server
 * 
 * Dieser Client ruft Tools auf dem MCP Server auf
 */
export class MCPClient {
  constructor(mcpServerUrl) {
    this.baseUrl = mcpServerUrl;
  }

  /**
   * Ruft ein Tool auf dem MCP Server auf
   * @param {string} toolName - Name des Tools
   * @param {object} params - Tool-Parameter
   * @returns {Promise<object>} Tool-Ergebnis
   */
  async callTool(toolName, params = {}) {
    try {
      // Da MCP über stdio läuft, müssen wir hier eine HTTP-API simulieren
      // In Produktion würde der MCP Server eine HTTP-API haben
      // Für jetzt: Direkter Aufruf über fetch (wenn MCP HTTP-Server läuft)
      // Oder: Lokale Tool-Implementierung

      // Fallback: Wenn MCP Server HTTP-API hat
      if (this.baseUrl.startsWith("http")) {
        const response = await fetch(`${this.baseUrl}/tool/${toolName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error(`MCP Tool-Aufruf fehlgeschlagen: ${response.statusText}`);
        }

        return await response.json();
      }

      // Alternative: Direkte Tool-Aufrufe (wenn MCP als Library eingebunden)
      // Für jetzt: Mock-Response für Entwicklung
      console.warn(`MCP Tool-Aufruf: ${toolName} - HTTP-API nicht verfügbar, verwende Fallback`);
      
      // Fallback: Simuliere Tool-Aufruf
      return this.fallbackToolCall(toolName, params);

    } catch (error) {
      console.error(`Fehler beim MCP Tool-Aufruf ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Fallback für Tool-Aufrufe (wenn MCP HTTP-API nicht verfügbar)
   */
  async fallbackToolCall(toolName, params) {
    // Diese Funktion würde normalerweise direkt mit dem MCP Server kommunizieren
    // Für die Entwicklung: Mock-Response
    return {
      success: true,
      message: `Tool ${toolName} wurde aufgerufen (Fallback-Modus)`,
      data: params
    };
  }

  /**
   * Prüft, ob der MCP Server erreichbar ist
   */
  async healthCheck() {
    try {
      if (this.baseUrl.startsWith("http")) {
        const response = await fetch(`${this.baseUrl}/health`);
        return response.ok;
      }
      return false;
    } catch {
      return false;
    }
  }
}


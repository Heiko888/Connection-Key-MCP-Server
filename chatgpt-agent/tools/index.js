import { HumanDesignTools } from "./human-design.js";
import { N8NTools } from "./n8n.js";
import { UserTools } from "./user.js";

/**
 * Tool Registry - Verwaltet alle verfügbaren Tools für den Agent
 */
export class ToolRegistry {
  constructor(agent) {
    this.agent = agent;
    this.tools = {};

    // Tools registrieren
    this.registerTools();
  }

  /**
   * Registriert alle verfügbaren Tools
   */
  registerTools() {
    // Human Design Tools
    const hdTools = new HumanDesignTools(this.agent);
    Object.assign(this.tools, hdTools.getTools());

    // n8n Tools
    const n8nTools = new N8NTools(this.agent);
    Object.assign(this.tools, n8nTools.getTools());

    // User Tools
    const userTools = new UserTools(this.agent);
    Object.assign(this.tools, userTools.getTools());
  }

  /**
   * Gibt Tools im OpenAI-Format zurück
   */
  getOpenAITools() {
    return Object.values(this.tools).map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  /**
   * Führt ein Tool aus
   * @param {string} toolName - Name des Tools
   * @param {object} params - Tool-Parameter
   * @returns {Promise<any>} Tool-Ergebnis
   */
  async executeTool(toolName, params) {
    const tool = this.tools[toolName];

    if (!tool) {
      throw new Error(`Tool '${toolName}' nicht gefunden`);
    }

    try {
      return await tool.execute(params);
    } catch (error) {
      console.error(`Fehler beim Ausführen von Tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Gibt alle registrierten Tools zurück
   */
  getAllTools() {
    return Object.keys(this.tools);
  }
}


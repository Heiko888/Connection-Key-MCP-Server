/**
 * User Tools für den ChatGPT-Agent
 */
export class UserTools {
  constructor(agent) {
    this.agent = agent;
  }

  getTools() {
    return {
      saveUserData: {
        name: "saveUserData",
        description: "Speichert User-Daten über n8n. Nutze dieses Tool, um Nutzerinformationen zu speichern.",
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User-ID"
            },
            data: {
              type: "object",
              description: "Zu speichernde Daten"
            },
            dataType: {
              type: "string",
              enum: ["profile", "chart", "reading", "preferences", "custom"],
              description: "Art der Daten (Standard: custom)"
            }
          },
          required: ["userId", "data"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("saveUserData", {
            userId: params.userId,
            data: params.data,
            dataType: params.dataType || "custom"
          });

          return {
            success: result.structuredContent?.success || false,
            recordId: result.structuredContent?.recordId,
            message: result.structuredContent?.message || "Daten wurden gespeichert"
          };
        }
      }
    };
  }
}


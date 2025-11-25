/**
 * n8n Tools für den ChatGPT-Agent
 */
export class N8NTools {
  constructor(agent) {
    this.agent = agent;
  }

  getTools() {
    return {
      callN8NWorkflow: {
        name: "callN8NWorkflow",
        description: "Ruft einen n8n Workflow über Webhook auf. Nutze dieses Tool, um Automatisierungen zu starten.",
        parameters: {
          type: "object",
          properties: {
            webhookPath: {
              type: "string",
              description: "Webhook-Pfad (z.B. 'reading', 'matching', 'chart-analysis', 'user-data')"
            },
            data: {
              type: "object",
              description: "Daten, die an den Webhook gesendet werden sollen"
            }
          },
          required: ["webhookPath", "data"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("triggerN8NWebhook", {
            webhookPath: params.webhookPath,
            data: params.data
          });

          return {
            success: result.structuredContent?.success || false,
            executionId: result.structuredContent?.executionId,
            message: result.structuredContent?.message || result.content?.[0]?.text
          };
        }
      },

      createN8NWorkflow: {
        name: "createN8NWorkflow",
        description: "Erstellt einen neuen n8n Workflow. Nutze dieses Tool, um neue Automatisierungen zu erstellen.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name des Workflows"
            },
            nodes: {
              type: "array",
              description: "Array von Workflow-Nodes"
            },
            active: {
              type: "boolean",
              description: "Workflow aktivieren (Standard: false)"
            }
          },
          required: ["name", "nodes"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("createN8NWorkflow", {
            name: params.name,
            nodes: params.nodes,
            active: params.active || false
          });

          return {
            success: true,
            workflowId: result.structuredContent?.workflowId,
            message: result.structuredContent?.message || "Workflow wurde erstellt"
          };
        }
      }
    };
  }
}


// Konfiguration für MCP Server
// Diese Datei enthält alle externen Service-URLs und API-Konfigurationen

export const config = {
  // n8n Konfiguration
  n8n: {
    // URL zu deinem n8n Server (z.B. https://n8n.deinedomain.tld oder http://localhost:5678)
    baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
    // API Key für n8n (falls benötigt)
    apiKey: process.env.N8N_API_KEY || "",
    // Webhook-Pfade
    webhooks: {
      reading: "/webhook/reading",
      matching: "/webhook/matching",
      chartAnalysis: "/webhook/chart-analysis",
      userData: "/webhook/user-data"
    },
    // API-Pfade
    api: {
      workflows: "/api/v1/workflows",
      executions: "/api/v1/executions"
    }
  },
  
  // Connection-Key Server Konfiguration (falls MCP direkt mit Connection-Key kommuniziert)
  connectionKey: {
    baseUrl: process.env.CONNECTION_KEY_URL || "http://localhost:3000",
    apiKey: process.env.CONNECTION_KEY_API_KEY || ""
  },
  
  // OpenAI Konfiguration (falls direkt verwendet)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ""
  }
};


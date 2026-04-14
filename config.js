// Konfiguration für MCP Server
// Diese Datei enthält alle externen Service-URLs und API-Konfigurationen

export const config = {
  // Authentication
  auth: {
    enabled: process.env.AUTH_ENABLED !== 'false',
    apiKey: process.env.API_KEY || ''
  },
  
  // CORS
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map(s => s.trim())
      : [
          "https://the-connection-key.de",
          "https://www.the-connection-key.de",
          "https://coach.the-connection-key.de",
          "https://agent.the-connection-key.de",
          "http://localhost:3000",
          "http://localhost:3002",
          "http://localhost:5173"
        ]
  },
  
  // Server
  port: parseInt(process.env.PORT) || 3000,
  
  // Reading Agent
  readingAgent: {
    url: process.env.READING_AGENT_URL || 'http://localhost:4000'
  },
  
  // n8n Konfiguration
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || '',
    webhooks: {
      reading: '/webhook/reading',
      matching: '/webhook/matching',
      chartAnalysis: '/webhook/chart-analysis',
      userData: '/webhook/user-data'
    },
    api: {
      workflows: '/api/v1/workflows',
      executions: '/api/v1/executions'
    }
  },
  
  // Connection-Key Server Konfiguration
  connectionKey: {
    baseUrl: process.env.CONNECTION_KEY_URL || 'http://localhost:3000',
    apiKey: process.env.CONNECTION_KEY_API_KEY || ''
  },
  
  // OpenAI Konfiguration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  
  // Supabase Konfiguration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }
};

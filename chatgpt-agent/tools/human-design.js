/**
 * Human Design Tools für den ChatGPT-Agent
 */
export class HumanDesignTools {
  constructor(agent) {
    this.agent = agent;
  }

  getTools() {
    return {
      generateReading: {
        name: "generateReading",
        description: "Generiert ein Human Design Reading basierend auf Geburtsdaten. Nutze dieses Tool, wenn der Nutzer ein Reading möchte.",
        parameters: {
          type: "object",
          properties: {
            birthDate: {
              type: "string",
              description: "Geburtsdatum im Format YYYY-MM-DD"
            },
            birthTime: {
              type: "string",
              description: "Geburtszeit im Format HH:MM"
            },
            birthPlace: {
              type: "string",
              description: "Geburtsort"
            },
            readingType: {
              type: "string",
              enum: ["basic", "detailed", "business", "relationship"],
              description: "Art des Readings (Standard: detailed)"
            }
          },
          required: ["birthDate", "birthTime", "birthPlace"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("generateReading", {
            birthDate: params.birthDate,
            birthTime: params.birthTime,
            birthPlace: params.birthPlace,
            userId: params.userId,
            readingType: params.readingType || "detailed"
          });

          return {
            success: true,
            reading: result.structuredContent?.reading || result.content?.[0]?.text || "Reading wurde generiert",
            readingId: result.structuredContent?.readingId,
            chartData: result.structuredContent?.chartData
          };
        }
      },

      analyzeChart: {
        name: "analyzeChart",
        description: "Analysiert Human Design Chart-Daten. Nutze dieses Tool für detaillierte Chart-Analysen.",
        parameters: {
          type: "object",
          properties: {
            chartData: {
              type: "object",
              description: "Chart-Daten (Typ, Zentren, Channels, Gates, etc.)"
            },
            analysisType: {
              type: "string",
              enum: ["type", "centers", "channels", "gates", "profile", "full"],
              description: "Art der Analyse (Standard: full)"
            }
          },
          required: ["chartData"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("analyzeChart", {
            chartData: params.chartData,
            analysisType: params.analysisType || "full"
          });

          return {
            success: true,
            analysis: result.structuredContent?.analysis || result.content?.[0]?.text,
            summary: result.structuredContent?.summary || "Analyse abgeschlossen"
          };
        }
      },

      matchPartner: {
        name: "matchPartner",
        description: "Führt Partner-Matching zwischen zwei Personen durch. Nutze dieses Tool für Kompatibilitäts-Analysen.",
        parameters: {
          type: "object",
          properties: {
            user1Chart: {
              type: "object",
              description: "Chart-Daten der ersten Person"
            },
            user2Chart: {
              type: "object",
              description: "Chart-Daten der zweiten Person"
            },
            matchingType: {
              type: "string",
              enum: ["compatibility", "relationship", "business", "full"],
              description: "Art des Matchings (Standard: full)"
            }
          },
          required: ["user1Chart", "user2Chart"]
        },
        execute: async (params) => {
          const result = await this.agent.mcpClient.callTool("matchPartner", {
            user1Chart: params.user1Chart,
            user2Chart: params.user2Chart,
            matchingType: params.matchingType || "full",
            userId1: params.userId1,
            userId2: params.userId2
          });

          return {
            success: true,
            compatibilityScore: result.structuredContent?.compatibilityScore || 0,
            analysis: result.structuredContent?.analysis || {},
            recommendations: result.structuredContent?.recommendations || [],
            matchId: result.structuredContent?.matchId
          };
        }
      }
    };
  }
}


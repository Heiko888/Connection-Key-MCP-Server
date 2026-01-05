/**
 * Agent Client
 * Verbindung zu Agent-Services für Reading-Generierung
 * 
 * MIGRATION ZU MCP-SERVER:
 * - Primär: MCP-Server (Port 7000) - /agents/reading
 * - Fallback: CK-Agent (Port 4000) - /run (Legacy)
 * 
 * Ziel: Alles über MCP-Server steuern
 */

export interface AgentConfig {
  readingDepth?: 'basic' | 'detailed' | 'premium';
  tone?: 'professional' | 'warm' | 'casual' | 'poetic';
  focus?: 'business' | 'relationship' | 'personal' | 'general';
  length?: 'short' | 'medium' | 'long';
  includeExamples?: boolean;
  includeRecommendations?: boolean;
}

export interface AgentTask {
  task: string;
  data: {
    readingType: string;
    clientName: string;
    readingData: any;
    connectionKeys?: any;
    charts?: any;
    pentaAnalysis?: any;
    agentConfig?: AgentConfig;
    template?: string; // Template-Name (z.B. 'grosses-reading', 'erweitertes-reading')
  };
}

export interface AgentResponse {
  ok: boolean;
  result?: string;
  error?: string;
}

/**
 * Zentrale Funktion zur Ermittlung der MCP-Server-URL
 * 
 * MIGRATION: MCP-Server ist jetzt primär für Readings
 */
export function getMcpServerUrl(): string {
  const mcpUrl = process.env.MCP_SERVER_URL 
    || process.env.NEXT_PUBLIC_MCP_SERVER_URL 
    || 'http://138.199.237.34:7000';
  
  console.log('🔍 DEBUG getMcpServerUrl:');
  console.log('  - MCP_SERVER_URL:', process.env.MCP_SERVER_URL || 'undefined');
  console.log('  - NEXT_PUBLIC_MCP_SERVER_URL:', process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'undefined');
  console.log('  - Verwendete URL:', mcpUrl);
  
  return mcpUrl;
}

/**
 * Zentrale Funktion zur Ermittlung der CK-Agent-URL (Fallback)
 * 
 * LEGACY: CK-Agent wird nur noch als Fallback verwendet
 */
export function getAgentUrl(): string {
  const agentUrl = process.env.CK_AGENT_URL 
    || process.env.NEXT_PUBLIC_CK_AGENT_URL 
    || 'http://ck-agent:4000';
  
  console.log('🔍 DEBUG getAgentUrl (Fallback):');
  console.log('  - CK_AGENT_URL:', process.env.CK_AGENT_URL || 'undefined');
  console.log('  - NEXT_PUBLIC_CK_AGENT_URL:', process.env.NEXT_PUBLIC_CK_AGENT_URL || 'undefined');
  console.log('  - Verwendete URL:', agentUrl);
  
  return agentUrl;
}

/**
 * Prüft ob der CK-Agent erreichbar ist
 */
export async function checkAgentAvailability(): Promise<boolean> {
  try {
    const agentUrl = getAgentUrl();
    // Der Agent hat keinen /health Endpoint, sondern nur / (Root)
    const healthEndpoint = `${agentUrl}/`;
    
    console.log('🔍 DEBUG checkAgentAvailability: Health Endpoint =', healthEndpoint);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 Sekunden Timeout
    });
    
    console.log('🔍 DEBUG checkAgentAvailability: Response Status =', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Agent Health-Check fehlgeschlagen:', error);
    console.warn('⚠️ Error Details:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Ruft den CK-Agent auf, um einen Reading-Text zu generieren
 * 
 * WICHTIG: CK-Agent ist der einzige Service für Reading-Generierung!
 * MCP-Server wird NICHT für Readings verwendet!
 */
export async function callCKAgent(taskData: AgentTask): Promise<AgentResponse> {
  try {
    // Agent-URL aus zentraler Funktion (konsistente Logik)
    const agentUrl = getAgentUrl();
    // Beide (MCP-Server und CK-Agent) verwenden den /run Endpoint
    const endpoint = `${agentUrl}/run`;

    console.log('🤖 Rufe CK-Agent auf:', endpoint);
    console.log('📋 Task:', taskData.task);
    console.log('📦 Daten:', {
      readingType: taskData.data.readingType,
      clientName: taskData.data.clientName,
      hasConnectionKeys: !!taskData.data.connectionKeys,
      hasCharts: !!taskData.data.charts,
      hasPentaAnalysis: !!taskData.data.pentaAnalysis,
      hasAgentConfig: !!taskData.data.agentConfig,
    });

    // Timeout für Agent-Requests (kann bei großen Readings länger dauern)
    const timeoutMs = 120000; // 2 Minuten
    
    // AbortController für Node.js (kann polyfill benötigen)
    let controller: AbortController;
    try {
      controller = new AbortController();
    } catch (e) {
      // Fallback für ältere Node.js Versionen
      const { AbortController: AbortControllerPolyfill } = require('node-abort-controller');
      controller = new AbortControllerPolyfill();
    }
    
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Agent-Request-Timeout nach', timeoutMs, 'ms');
      controller.abort();
    }, timeoutMs);

    try {
      // Header vorbereiten
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // AGENT_SECRET als x-agent-key Header hinzufügen, falls gesetzt
      const agentSecret = process.env.CK_AGENT_SECRET || process.env.AGENT_SECRET;
      if (agentSecret) {
        headers['x-agent-key'] = agentSecret;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

    if (!response.ok) {
      const { safeResponseText } = await import('@/lib/utils/safeJson');
      const errorText = await safeResponseText(response, 'Unknown error');
      console.error('❌ CK-Agent Fehler:', response.status, errorText);
      return {
        ok: false,
        error: `Agent-Fehler: ${response.status} - ${errorText}`,
      };
    }

    const { safeResponseParse } = await import('@/lib/utils/safeJson');
    const parsed = await safeResponseParse<AgentResponse>(response, null);
    
    if ('error' in parsed) {
      console.error('❌ CK-Agent Response Parse Fehler:', parsed.error);
      return {
        ok: false,
        error: `Ungültige Response: ${parsed.error}`,
      };
    }

    const result = parsed as AgentResponse;
    console.log('📥 CK-Agent Response erhalten:', {
      status: response.status,
      statusText: response.statusText,
      ok: result.ok,
      hasResult: !!result.result,
    });

    if (!result.ok) {
      console.error('❌ CK-Agent Response Fehler:', result.error);
      return result;
    }

    console.log('✅ CK-Agent Response erhalten:', {
      ok: result.ok,
      resultLength: result.result?.length || 0,
      hasResult: !!result.result,
      preview: result.result?.substring(0, 100) + '...',
    });

    if (!result.result || result.result.length === 0) {
      console.warn('⚠️ CK-Agent hat leeren Text zurückgegeben!');
      return {
        ok: false,
        error: 'Agent hat keinen Text generiert (leere Response)',
      };
    }

      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Fehler beim Aufruf des CK-Agents:', error);
    
    if (error instanceof Error) {
      // Timeout-Fehler
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
        return {
          ok: false,
          error: 'Agent-Timeout: Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.',
        };
      }
      
      // Netzwerk-Fehler
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND') || error.message.includes('Failed to fetch') || error.message.includes('network')) {
        const agentUrl = getAgentUrl();
        const isLocalhost = agentUrl.includes('localhost') || agentUrl.includes('127.0.0.1');
        const isDockerService = agentUrl.includes('ck-agent:4000');
        
        let errorMessage = `Der CK-Agent konnte den Reading-Text nicht generieren. Bitte prüfe, ob der Agent-Service läuft.\n\n`;
        errorMessage += `Der Agent-Service ist möglicherweise nicht erreichbar. Prüfe die Umgebungsvariable CK_AGENT_URL (Standard: ${agentUrl}).`;
        
        if (isLocalhost) {
          errorMessage += `\n\nLokale Entwicklung:\n- Stelle sicher, dass der Agent auf ${agentUrl} läuft\n- Starte den Agent mit: cd ck-agent && node server.js\n- Oder mit Docker: docker compose up ck-agent`;
        } else if (isDockerService) {
          errorMessage += `\n\nDocker-Umgebung:\n- Stelle sicher, dass der ck-agent Container läuft\n- Prüfe mit: docker compose ps ck-agent\n- Starte mit: docker compose up -d ck-agent`;
        } else {
          errorMessage += `\n\nProduktionsumgebung:\n- Prüfe ob der Agent-Service auf ${agentUrl} erreichbar ist\n- Standard: https://agent.the-connection-key.de\n- Prüfe die Netzwerkverbindung und Firewall-Einstellungen`;
        }
        
        return {
          ok: false,
          error: errorMessage,
        };
      }
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Aufruf des Agents',
    };
  }
}

/**
 * Generiert einen Reading-Text für ein Connection-Reading
 * 
 * MIGRATION: Versucht zuerst MCP-Server, dann CK-Agent als Fallback
 */
export async function generateConnectionReadingText(
  clientName: string,
  readingData: any,
  connectionKeys: any,
  charts: any,
  agentConfig?: AgentConfig
): Promise<string | null> {
  // 1. Versuche MCP-Server (PRIMÄR)
  console.log('🔄 Versuche Connection-Reading über MCP-Server...');
  const mcpResponse = await callMcpServerForReading(
    'connection',
    clientName,
    {
      ...readingData,
      connectionKeys,
      charts,
    },
    agentConfig
  );
  
  if (mcpResponse.ok && mcpResponse.result) {
    console.log('✅ Connection-Reading über MCP-Server generiert');
    return mcpResponse.result;
  }
  
  // 2. Fallback zu CK-Agent (LEGACY)
  console.warn('⚠️ MCP-Server nicht verfügbar, verwende CK-Agent als Fallback');
  const task: AgentTask = {
    task: 'generate_connection_reading',
    data: {
      readingType: 'connection',
      clientName,
      readingData,
      connectionKeys,
      charts,
      agentConfig,
    },
  };

  const ckResponse = await callCKAgent(task);
  
  if (ckResponse.ok && ckResponse.result) {
    console.log('✅ Connection-Reading über CK-Agent generiert (Fallback)');
    return ckResponse.result;
  }

  console.warn('⚠️ Connection-Reading-Text konnte nicht generiert werden:', ckResponse.error);
  return null;
}

/**
 * Generiert einen Reading-Text für ein Penta-Reading
 * 
 * MIGRATION: Versucht zuerst MCP-Server, dann CK-Agent als Fallback
 */
export async function generatePentaReadingText(
  clientName: string,
  readingData: any,
  pentaAnalysis: any,
  charts: any[],
  agentConfig?: AgentConfig
): Promise<string | null> {
  // 1. Versuche MCP-Server (PRIMÄR)
  console.log('🔄 Versuche Penta-Reading über MCP-Server...');
  const mcpResponse = await callMcpServerForReading(
    'penta',
    clientName,
    {
      ...readingData,
      pentaAnalysis,
      charts,
    },
    agentConfig
  );
  
  if (mcpResponse.ok && mcpResponse.result) {
    console.log('✅ Penta-Reading über MCP-Server generiert');
    return mcpResponse.result;
  }
  
  // 2. Fallback zu CK-Agent (LEGACY)
  console.warn('⚠️ MCP-Server nicht verfügbar, verwende CK-Agent als Fallback');
  const task: AgentTask = {
    task: 'generate_penta_reading',
    data: {
      readingType: 'penta',
      clientName,
      readingData,
      pentaAnalysis,
      charts,
      agentConfig,
    },
  };

  const ckResponse = await callCKAgent(task);
  
  if (ckResponse.ok && ckResponse.result) {
    console.log('✅ Penta-Reading über CK-Agent generiert (Fallback)');
    return ckResponse.result;
  }

  console.warn('⚠️ Penta-Reading-Text konnte nicht generiert werden:', ckResponse.error);
  return null;
}

/**
 * Generiert einen Reading-Text für ein Standard-Reading
 * 
 * MIGRATION: Versucht zuerst MCP-Server, dann CK-Agent als Fallback
 * Templates werden weiterhin über CK-Agent generiert (spezifisch)
 */
export async function generateStandardReadingText(
  readingType: string,
  clientName: string,
  readingData: any,
  agentConfig?: AgentConfig,
  template?: string
): Promise<string | null> {
  // Template-basierte Readings nutzen weiterhin CK-Agent (spezifisch)
  if (template) {
    console.log('📄 Template-basiertes Reading - verwende CK-Agent');
    const task: AgentTask = {
      task: 'generate_template_reading',
      data: {
        readingType,
        clientName,
        readingData,
        agentConfig,
        template,
      },
    };

    const ckResponse = await callCKAgent(task);
    
    if (ckResponse.ok && ckResponse.result) {
      return ckResponse.result;
    }

    console.warn('⚠️ Template-Reading konnte nicht generiert werden:', ckResponse.error);
    return null;
  }
  
  // Standard-Readings: Versuche zuerst MCP-Server (PRIMÄR)
  console.log('🔄 Versuche Standard-Reading über MCP-Server...');
  
  // Bestimme Reading-Typ basierend auf agentConfig
  let mcpReadingType: 'single' | 'connection' | 'penta' | 'basic' | 'detailed' | 'business' | 'relationship' = 'detailed'; // Standard
  if (agentConfig?.focus === 'business') {
    mcpReadingType = 'business';
  } else if (agentConfig?.focus === 'relationship') {
    mcpReadingType = 'relationship';
  } else if (agentConfig?.readingDepth === 'basic') {
    mcpReadingType = 'basic';
  } else if (readingType === 'single') {
    mcpReadingType = 'single';
  } else if (readingType === 'connection') {
    mcpReadingType = 'connection';
  } else if (readingType === 'penta') {
    mcpReadingType = 'penta';
  }
  
  const mcpResponse = await callMcpServerForReading(
    mcpReadingType,
    clientName,
    readingData,
    agentConfig
  );
  
  if (mcpResponse.ok && mcpResponse.result) {
    console.log('✅ Standard-Reading über MCP-Server generiert');
    return mcpResponse.result;
  }
  
  // Fallback zu CK-Agent (LEGACY)
  console.warn('⚠️ MCP-Server nicht verfügbar, verwende CK-Agent als Fallback');
  const task: AgentTask = {
    task: 'generate_reading',
    data: {
      readingType,
      clientName,
      readingData,
      agentConfig,
    },
  };

  const ckResponse = await callCKAgent(task);
  
  if (ckResponse.ok && ckResponse.result) {
    console.log('✅ Standard-Reading über CK-Agent generiert (Fallback)');
    return ckResponse.result;
  }

  console.warn('⚠️ Standard-Reading-Text konnte nicht generiert werden:', ckResponse.error);
  return null;
}

/**
 * Ruft den MCP-Server für Reading-Generierung auf
 * 
 * PRIMÄR: MCP-Server ist jetzt primär für Readings
 * Endpoint: /agents/reading
 * 
 * WICHTIG: Diese Funktion muss existieren, damit die Migration funktioniert!
 */
export async function callMcpServerForReading(
  readingType: 'single' | 'connection' | 'penta' | 'basic' | 'detailed' | 'business' | 'relationship',
  clientName: string,
  readingData: any,
  agentConfig?: AgentConfig
): Promise<AgentResponse> {
  try {
    const mcpUrl = getMcpServerUrl();
    const endpoint = `${mcpUrl}/agents/reading`;
    
    console.log('🔄 Rufe MCP-Server für Reading auf:', endpoint);
    console.log('📋 Reading-Typ:', readingType);
    console.log('👤 Client:', clientName);
    console.log('⚙️ Agent-Config:', agentConfig);
    console.log('📦 Reading-Data Keys:', Object.keys(readingData || {}));
    
    // Timeout für MCP-Requests (kann bei großen Readings länger dauern)
    const timeoutMs = 120000; // 2 Minuten
    
    let controller: AbortController;
    try {
      controller = new AbortController();
    } catch (e) {
      // Fallback für ältere Node.js Versionen
      const { AbortController: AbortControllerPolyfill } = require('node-abort-controller');
      controller = new AbortControllerPolyfill();
    }
    
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ MCP-Server Request-Timeout nach', timeoutMs, 'ms');
      controller.abort();
    }, timeoutMs);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          readingType,
          clientName,
          readingData,
          agentConfig,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ MCP-Server Fehler:', response.status, errorText);
        return {
          ok: false,
          error: `MCP-Server Fehler: ${response.status} - ${errorText}`,
        };
      }
      
      const data = await response.json();
      
      // MCP-Server kann verschiedene Response-Formate haben
      // Prüfe auf verschiedene mögliche Formate
      let result: string | null = null;
      
      if (data.text) {
        result = data.text;
      } else if (data.response) {
        result = data.response;
      } else if (data.result) {
        result = data.result;
      } else if (typeof data === 'string') {
        result = data;
      }
      
      if (!result || result.length === 0) {
        console.warn('⚠️ MCP-Server hat leeren Text zurückgegeben!');
        return {
          ok: false,
          error: 'MCP-Server hat keinen Text generiert (leere Response)',
        };
      }
      
      console.log('✅ MCP-Server Response erhalten:', {
        ok: true,
        resultLength: result.length,
        preview: result.substring(0, 100) + '...',
      });
      
      return {
        ok: true,
        result,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Fehler beim Aufruf des MCP-Servers:', error);
    
    if (error instanceof Error) {
      // Timeout-Fehler
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
        return {
          ok: false,
          error: 'MCP-Server Timeout: Die Anfrage hat zu lange gedauert.',
        };
      }
      
      // Netzwerk-Fehler
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND') || error.message.includes('Failed to fetch') || error.message.includes('network')) {
        const mcpUrl = getMcpServerUrl();
        console.warn('⚠️ MCP-Server ist nicht erreichbar:', mcpUrl);
        return {
          ok: false,
          error: `MCP-Server ist nicht erreichbar (${mcpUrl}/agents/reading). Prüfe MCP_SERVER_URL.`,
        };
      }
    }
    
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Aufruf des MCP-Servers',
    };
  }
}


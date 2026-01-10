import express from "express";
import axios from "axios";
import { config } from "../config.js";

const router = express.Router();

// Supabase Client (falls verfügbar)
let supabase = null;
try {
  const supabaseModule = await import("../config-with-supabase.js");
  supabase = supabaseModule.supabase;
} catch (error) {
  console.warn("⚠️  Supabase nicht verfügbar - readings-v3 läuft ohne Persistierung");
}

/**
 * Readings V3 Route - Orchestrator Integration
 * 
 * Diese Route ist die Brücke zwischen Frontend und dem
 * Orchestrator-System mit spezialisierten Agents.
 */

/**
 * POST /api/readings-v3/create
 * Erstellt ein neues Reading via Orchestrator
 * 
 * Body:
 * {
 *   userId: string,
 *   agentId: 'business' | 'relationship' | 'crisis' | 'personality',
 *   birthDate: '1990-01-15',
 *   birthTime: '14:30',
 *   birthPlace: { name, latitude, longitude, timezone } | string,
 *   context: string (optional, default = agentId),
 *   depth: 'basic' | 'advanced' | 'professional' (optional, default = 'advanced'),
 *   style: 'klar' | 'einfühlsam' | 'direkt' (optional, default = 'klar')
 * }
 */
router.post("/create", async (req, res, next) => {
  try {
    const {
      userId,
      agentId,
      birthDate,
      birthTime,
      birthPlace,
      context,
      depth,
      style,
      clientName
    } = req.body;

    // Validierung
    if (!userId || !agentId || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: "Fehlende Pflichtfelder: userId, agentId, birthDate, birthTime, birthPlace"
      });
    }

    // Validiere agentId
    const validAgents = ['business', 'relationship', 'crisis', 'personality'];
    if (!validAgents.includes(agentId)) {
      return res.status(400).json({
        success: false,
        error: `Ungültige Agent-ID. Erlaubt: ${validAgents.join(', ')}`
      });
    }

    console.log(`[readings-v3] Creating reading: agent=${agentId}, user=${userId}`);

    // 1. Reading Record in Supabase erstellen (falls verfügbar)
    let readingId = null;
    let readingRecord = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('coach_readings')
          .insert({
            user_id: userId,
            reading_type: context || agentId,
            client_name: clientName || 'Unbekannt',
            status: 'pending',
            metadata: {
              agentId,
              birthDate,
              birthTime,
              birthPlace: typeof birthPlace === 'string' ? { name: birthPlace } : birthPlace,
              depth: depth || 'advanced',
              style: style || 'klar',
              version: 'v3'
            }
          })
          .select()
          .single();

        if (error) {
          console.warn('[readings-v3] Supabase Insert Error:', error);
        } else {
          readingId = data.id;
          readingRecord = data;
          console.log(`[readings-v3] ✅ Reading record created: ${readingId}`);
        }
      } catch (supabaseError) {
        console.warn('[readings-v3] Supabase nicht verfügbar:', supabaseError.message);
      }
    }

    // Falls keine Supabase-ID, generiere UUID
    if (!readingId) {
      readingId = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 2. Orchestrator aufrufen (falls auf dem Server läuft)
    // Lokal: simulieren, Server: tatsächlich aufrufen
    let orchestratorResponse = null;
    const orchestratorUrl = process.env.ORCHESTRATOR_URL || "http://localhost:3000/api/orchestrator/execute";

    try {
      orchestratorResponse = await axios.post(
        orchestratorUrl,
        {
          readingId,
          userId,
          agentId,
          birthDate,
          birthTime,
          birthPlace,
          context: context || agentId,
          depth: depth || 'advanced',
          style: style || 'klar'
        },
        {
          timeout: 5000, // 5 Sekunden Timeout
          validateStatus: () => true // Alle Status akzeptieren
        }
      );

      console.log(`[readings-v3] Orchestrator Response: ${orchestratorResponse.status}`);
    } catch (orchestratorError) {
      console.warn('[readings-v3] Orchestrator nicht erreichbar (lokal normal):', orchestratorError.message);
      // Lokal ist das OK - Orchestrator läuft nur auf dem Server
    }

    // 3. Response zurückgeben
    res.json({
      success: true,
      readingId: readingId,
      status: 'pending',
      pollUrl: `/api/readings-v3/status/${readingId}`,
      message: 'Reading wird generiert',
      metadata: {
        agentId,
        agent: getAgentInfo(agentId),
        depth: depth || 'advanced',
        style: style || 'klar',
        estimatedTime: 15, // Sekunden
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[readings-v3/create] Error:', error);
    next(error);
  }
});

/**
 * GET /api/readings-v3/status/:readingId
 * Prüft den Status eines Readings
 */
router.get("/status/:readingId", async (req, res, next) => {
  try {
    const { readingId } = req.params;

    console.log(`[readings-v3] Status check: ${readingId}`);

    // 1. Aus Supabase laden (falls verfügbar)
    if (supabase) {
      try {
        const { data: reading, error } = await supabase
          .from('coach_readings')
          .select('*')
          .eq('id', readingId)
          .single();

        if (!error && reading) {
          return res.json({
            success: true,
            reading: {
              id: reading.id,
              status: reading.status,
              clientName: reading.client_name,
              readingType: reading.reading_type,
              metadata: reading.metadata,
              content: reading.content,
              createdAt: reading.created_at,
              updatedAt: reading.updated_at
            }
          });
        }
      } catch (supabaseError) {
        console.warn('[readings-v3/status] Supabase Error:', supabaseError.message);
      }
    }

    // 2. Fallback: "pending" Status
    res.json({
      success: true,
      reading: {
        id: readingId,
        status: 'pending',
        message: 'Reading wird verarbeitet. Supabase-Datenbank nicht verfügbar.'
      }
    });

  } catch (error) {
    console.error('[readings-v3/status] Error:', error);
    next(error);
  }
});

/**
 * GET /api/readings-v3/reading/:readingId
 * Holt das fertige Reading
 */
router.get("/reading/:readingId", async (req, res, next) => {
  try {
    const { readingId } = req.params;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase nicht verfügbar'
      });
    }

    const { data: reading, error } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', readingId)
      .single();

    if (error || !reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading nicht gefunden'
      });
    }

    res.json({
      success: true,
      reading: {
        id: reading.id,
        status: reading.status,
        clientName: reading.client_name,
        readingType: reading.reading_type,
        content: reading.content,
        metadata: reading.metadata,
        createdAt: reading.created_at,
        updatedAt: reading.updated_at
      }
    });

  } catch (error) {
    console.error('[readings-v3/reading] Error:', error);
    next(error);
  }
});

/**
 * GET /api/readings-v3/agents
 * Listet alle verfügbaren Agents
 */
router.get("/agents", (req, res) => {
  res.json({
    success: true,
    agents: [
      getAgentInfo('business'),
      getAgentInfo('relationship'),
      getAgentInfo('crisis'),
      getAgentInfo('personality')
    ]
  });
});

/**
 * GET /api/readings-v3
 * Info über die V3 API
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    version: 'v3',
    description: 'Readings V3 API - Orchestrator Integration mit spezialisierten Agents',
    endpoints: {
      create: 'POST /api/readings-v3/create',
      status: 'GET /api/readings-v3/status/:readingId',
      reading: 'GET /api/readings-v3/reading/:readingId',
      agents: 'GET /api/readings-v3/agents'
    },
    requiredEnv: {
      ORCHESTRATOR_URL: process.env.ORCHESTRATOR_URL || 'nicht gesetzt',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'gesetzt ✅' : 'nicht gesetzt ❌',
      SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'gesetzt ✅' : 'nicht gesetzt ❌'
    }
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function getAgentInfo(agentId) {
  const agents = {
    business: {
      id: 'business',
      name: 'Business Reading Agent',
      description: 'Fokus auf Entscheidungen, Energieeinsatz, Zusammenarbeit',
      context: 'business',
      supportedDepth: ['basic', 'advanced', 'professional'],
      defaultStyle: 'klar'
    },
    relationship: {
      id: 'relationship',
      name: 'Relationship Reading Agent',
      description: 'Fokus auf Nähe/Distanz, Bindung, Kommunikation',
      context: 'relationship',
      supportedDepth: ['basic', 'advanced', 'professional'],
      defaultStyle: 'einfühlsam'
    },
    crisis: {
      id: 'crisis',
      name: 'Crisis Reading Agent',
      description: 'Fokus auf Regulation, Stabilisierung, Orientierung',
      context: 'crisis',
      supportedDepth: ['basic', 'advanced', 'professional'],
      defaultStyle: 'ruhig'
    },
    personality: {
      id: 'personality',
      name: 'Personality Reading Agent',
      description: 'Fokus auf Selbstbild, Muster, Entwicklung',
      context: 'personality',
      supportedDepth: ['basic', 'advanced', 'professional'],
      defaultStyle: 'direkt'
    }
  };

  return agents[agentId] || null;
}

export { router as readingsV3Router };

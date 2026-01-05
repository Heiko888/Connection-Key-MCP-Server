import { NextRequest, NextResponse } from 'next/server';
import { readingsStore } from './store'; // Fallback
import { checkCoachAuth } from '@/lib/coach-auth';
import {
  getCoachReadings,
  createCoachReading,
  getCoachReadingStats,
} from '@/lib/db/coach-readings';
import { analyzeConnectionKeys, type ChartInput } from '@/lib/human-design/connection-key-engine';
import { calculateHumanDesignChart, type ChartCalculationInput } from '@/lib/astro/chartCalculation';
import { generateConnectionReadingText, generateStandardReadingText, getAgentUrl } from '@/lib/agent/ck-agent';
import { calculateCenters, type CenterStatus } from '@/lib/human-design/centers';
import { CHANNELS } from '@/lib/human-design/channels';

export const runtime = 'nodejs';

/**
 * Berechnet die Penta-Analyse für eine Gruppe von 3-5 Personen
 */
function calculatePentaAnalysis(charts: any[], people: any[]) {
  const groupSize = charts.length;
  const minThreshold = Math.ceil(groupSize * 0.6); // Mindestens 60% müssen das Zentrum/Gate/Channel haben (bei 5 Personen = 3)
  
  // 1. Kollektive definierte Zentren berechnen
  const centerCounts: { [key: string]: number } = {
    'Head': 0,
    'Ajna': 0,
    'Throat': 0,
    'G-Center': 0,
    'Heart/Ego': 0,
    'Sacral': 0,
    'Spleen': 0,
    'Solar Plexus': 0,
    'Root': 0
  };
  
  // Zähle wie oft jedes Zentrum definiert ist
  charts.forEach(chart => {
    const definedCenters = chart.definedCenters || [];
    definedCenters.forEach((center: string) => {
      if (centerCounts.hasOwnProperty(center)) {
        centerCounts[center]++;
      }
    });
  });
  
  // Kollektive definierte Zentren (mindestens minThreshold Personen)
  const collectiveDefinedCenters = Object.entries(centerCounts)
    .filter(([_, count]) => count >= minThreshold)
    .map(([center, _]) => center);
  
  // Kollektive offene Zentren (in weniger als minThreshold Personen definiert)
  const collectiveOpenCenters = Object.entries(centerCounts)
    .filter(([_, count]) => count < minThreshold)
    .map(([center, _]) => center);
  
  // 2. Penta-Gates berechnen (Gates, die in mindestens minThreshold Personen aktiv sind)
  const gateCounts: { [gate: number]: number } = {};
  charts.forEach(chart => {
    const gates = chart.gates || chart.activeGates || [];
    gates.forEach((gate: number) => {
      gateCounts[gate] = (gateCounts[gate] || 0) + 1;
    });
  });
  
  const pentaGates = Object.entries(gateCounts)
    .filter(([_, count]) => count >= minThreshold)
    .map(([gate, _]) => parseInt(gate))
    .sort((a, b) => a - b);
  
  // 3. Penta-Channels berechnen (Channels, die in mindestens minThreshold Personen aktiv sind)
  const channelCounts: { [channelKey: string]: number } = {};
  charts.forEach(chart => {
    const channels = chart.channels || [];
    channels.forEach((channel: number[]) => {
      if (Array.isArray(channel) && channel.length === 2) {
        const channelKey = `${Math.min(channel[0], channel[1])}-${Math.max(channel[0], channel[1])}`;
        channelCounts[channelKey] = (channelCounts[channelKey] || 0) + 1;
      }
    });
  });
  
  const pentaChannels = Object.entries(channelCounts)
    .filter(([_, count]) => count >= minThreshold)
    .map(([channelKey, _]) => {
      const [gate1, gate2] = channelKey.split('-').map(Number);
      return { gates: [gate1, gate2] as [number, number], key: channelKey };
    });
  
  // 4. Rollenverteilung (Initiator, Stabilisator, Transformer)
  const roles = people.map((person: any, index: number) => {
    const chart = charts[index];
    const definedCenters = chart.definedCenters || [];
    const channels = chart.channels || [];
    
    let role = 'Mitglied';
    let roleScore = 0;
    
    // Initiator: Head oder Root definiert, oder bestimmte Channels
    const hasHead = definedCenters.includes('Head');
    const hasRoot = definedCenters.includes('Root');
    const hasInitiatorChannels = channels.some((ch: number[]) => {
      const channel = CHANNELS.find(c => 
        (c.gates[0] === ch[0] && c.gates[1] === ch[1]) ||
        (c.gates[0] === ch[1] && c.gates[0] === ch[0])
      );
      return channel && (channel.circuit === 'Individual' || channel.number === 3 || channel.number === 4);
    });
    
    if (hasHead || hasRoot || hasInitiatorChannels) {
      role = 'Initiator';
      roleScore = (hasHead ? 2 : 0) + (hasRoot ? 2 : 0) + (hasInitiatorChannels ? 1 : 0);
    }
    
    // Stabilisator: Sacral oder G-Center definiert
    const hasSacral = definedCenters.includes('Sacral');
    const hasGCenter = definedCenters.includes('G-Center');
    const hasStabilizerChannels = channels.some((ch: number[]) => {
      const channel = CHANNELS.find(c => 
        (c.gates[0] === ch[0] && c.gates[1] === ch[1]) ||
        (c.gates[0] === ch[1] && c.gates[0] === ch[0])
      );
      return channel && channel.circuit === 'Collective';
    });
    
    if ((hasSacral || hasGCenter || hasStabilizerChannels) && roleScore < 3) {
      role = 'Stabilisator';
      roleScore = (hasSacral ? 2 : 0) + (hasGCenter ? 2 : 0) + (hasStabilizerChannels ? 1 : 0);
    }
    
    // Transformer: Solar Plexus definiert, oder bestimmte Channels
    const hasSolarPlexus = definedCenters.includes('Solar Plexus');
    const hasTransformerChannels = channels.some((ch: number[]) => {
      const channel = CHANNELS.find(c => 
        (c.gates[0] === ch[0] && c.gates[1] === ch[1]) ||
        (c.gates[0] === ch[1] && c.gates[0] === ch[0])
      );
      return channel && (channel.circuit === 'Integration' || channel.number === 4 || channel.number === 24);
    });
    
    if ((hasSolarPlexus || hasTransformerChannels) && roleScore < 2) {
      role = 'Transformer';
      roleScore = (hasSolarPlexus ? 2 : 0) + (hasTransformerChannels ? 1 : 0);
    }
    
    return {
      personIndex: index,
      personName: person.name || `Person ${index + 1}`,
      role,
      roleScore,
      definedCenters,
      type: chart.type,
      profile: chart.profile
    };
  });
  
  // 5. Gruppenenergie analysieren (konstruktiv/destruktiv)
  const hasSacral = collectiveDefinedCenters.includes('Sacral');
  const hasGCenter = collectiveDefinedCenters.includes('G-Center');
  const hasThroat = collectiveDefinedCenters.includes('Throat');
  const hasSolarPlexus = collectiveDefinedCenters.includes('Solar Plexus');
  
  let groupEnergy = 'neutral';
  let energyScore = 0;
  
  // Konstruktive Faktoren
  if (hasSacral) energyScore += 2; // Produktivität
  if (hasGCenter) energyScore += 2; // Identität & Richtung
  if (hasThroat) energyScore += 1; // Kommunikation
  if (pentaChannels.length >= 3) energyScore += 1; // Viele aktive Channels
  
  // Destruktive Faktoren
  if (collectiveOpenCenters.length > 5) energyScore -= 2; // Viele offene Zentren = Konditionierung
  if (pentaChannels.length < 2) energyScore -= 1; // Wenige Channels = wenig Energiefluss
  
  if (energyScore >= 4) {
    groupEnergy = 'konstruktiv';
  } else if (energyScore <= 1) {
    groupEnergy = 'destruktiv';
  } else {
    groupEnergy = 'neutral';
  }
  
  // 6. Fehlende Energien identifizieren
  const allPossibleCenters = ['Head', 'Ajna', 'Throat', 'G-Center', 'Heart/Ego', 'Sacral', 'Spleen', 'Solar Plexus', 'Root'];
  const missingCenters = allPossibleCenters.filter(center => 
    !collectiveDefinedCenters.includes(center)
  );
  
  // Fehlende wichtige Channels (alle 36 Channels prüfen)
  const allChannels = CHANNELS.map(c => `${Math.min(c.gates[0], c.gates[1])}-${Math.max(c.gates[0], c.gates[1])}`);
  const missingChannels = allChannels.filter(channelKey => 
    !pentaChannels.some(pc => pc.key === channelKey)
  );
  
  // 7. Spannungspunkte identifizieren
  const tensionPoints: string[] = [];
  
  // Offene Zentren, die in der Gruppe konditioniert werden
  collectiveOpenCenters.forEach(center => {
    const count = centerCounts[center] || 0;
    if (count > 0 && count < minThreshold) {
      tensionPoints.push(`${center} ist nur in ${count} von ${groupSize} Personen definiert - kann zu Konditionierung führen`);
    }
  });
  
  // Fehlende wichtige Zentren
  if (!hasSacral) {
    tensionPoints.push('Sacral fehlt - Gruppe hat möglicherweise Schwierigkeiten mit Produktivität und Energiefluss');
  }
  if (!hasGCenter) {
    tensionPoints.push('G-Center fehlt - Gruppe hat möglicherweise Schwierigkeiten mit Identität und Richtung');
  }
  if (!hasThroat) {
    tensionPoints.push('Throat fehlt - Gruppe hat möglicherweise Schwierigkeiten mit Kommunikation');
  }
  
  return {
    collectiveDefinedCenters,
    collectiveOpenCenters,
    pentaGates,
    pentaChannels: pentaChannels.map(pc => pc.gates),
    roles,
    groupEnergy,
    energyScore,
    missingCenters,
    missingChannels: missingChannels.slice(0, 10), // Nur erste 10, um nicht zu überladen
    tensionPoints
  };
}

// GET /api/coach/readings - Alle Readings für Coach-Dashboard
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung und Coach-Rechte prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    try {
      // ⚡ Versuche aus Supabase zu laden
      const readings = await getCoachReadings(user.id, {
        status: status || undefined,
        sortBy: sortBy === 'createdAt' ? 'created_at' : sortBy,
        order,
      });

      const stats = await getCoachReadingStats(user.id);

      // Konvertiere für Kompatibilität (created_at -> createdAt)
      const readingsWithAliases = readings.map(r => ({
        ...r,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return NextResponse.json(
        { 
          readings: readingsWithAliases,
          stats 
        },
        { status: 200 }
      );
    } catch (dbError) {
      // ⚠️ Fallback auf In-Memory Store
      console.warn('⚠️ Supabase-Fehler, verwende In-Memory Store als Fallback:', dbError);
      
      const { searchParams: fallbackParams } = new URL(request.url);
      const fallbackStatus = fallbackParams.get('status');
      const fallbackSortBy = fallbackParams.get('sortBy') || 'createdAt';
      const fallbackOrder = fallbackParams.get('order') || 'desc';

      let filteredReadings = fallbackStatus 
        ? readingsStore.filter(r => r.status === fallbackStatus)
        : readingsStore;

      filteredReadings.sort((a, b) => {
        const aValue = a[fallbackSortBy as keyof typeof a];
        const bValue = b[fallbackSortBy as keyof typeof b];
        
        if (fallbackOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      const stats = {
        total: readingsStore.length,
        pending: readingsStore.filter(r => r.status === 'pending').length,
        zoomScheduled: readingsStore.filter(r => r.status === 'zoom-scheduled').length,
        completed: readingsStore.filter(r => r.status === 'completed').length,
        approved: readingsStore.filter(r => r.status === 'approved').length
      };

      return NextResponse.json(
        { 
          readings: filteredReadings,
          stats,
          _fallback: true // Flag für Debugging
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Coach-Readings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/coach/readings - Neues Reading erstellen
export async function POST(request: NextRequest) {
  try {
    // Authentifizierung und Coach-Rechte prüfen
    const { user, isCoach } = await checkCoachAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (!isCoach) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für den Coach-Bereich' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reading_type, client_name, reading_data } = body;

    // Validierung
    if (!reading_type || !client_name || !reading_data) {
      return NextResponse.json(
        { error: 'Bitte fülle alle Pflichtfelder aus' },
        { status: 400 }
      );
    }

    // Für Standard-Readings: Berechne Chart automatisch
    let enrichedReadingData = { ...reading_data };
    
    if (reading_type === 'single' && reading_data.person) {
      try {
        console.log('🔄 Berechne Chart für Standard Reading...');
        
        const prepareChartInput = (person: any): ChartCalculationInput => {
          let birthPlaceData;
          if (typeof person.geburtsort === 'string') {
            birthPlaceData = {
              latitude: 52.52, // Default Berlin
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person.geburtsort
            };
          } else if (person.geburtsort) {
            birthPlaceData = person.geburtsort;
          } else {
            birthPlaceData = {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: 'Berlin'
            };
          }

          return {
            birthDate: person.geburtsdatum,
            birthTime: person.geburtszeit,
            birthPlace: birthPlaceData
          };
        };

        const chartInput = prepareChartInput(reading_data.person);
        const chart = await calculateHumanDesignChart(chartInput);

        console.log('✅ Chart berechnet für Standard Reading:', {
          type: chart.type,
          profile: chart.profile,
          authority: chart.authority
        });

        // Berechne CenterStatus aus Gates
        const centers: CenterStatus = calculateCenters(chart.gates || []);

        // Füge Chart zum reading_data hinzu (Array-Format für Kompatibilität mit Agent)
        enrichedReadingData = {
          ...reading_data,
          charts: [chart], // Array-Format für Agent-Kompatibilität
          person: {
            ...reading_data.person,
            chart: chart // Auch als direkte Property für Agent-Kompatibilität
          }
        };

        console.log('✅ Reading-Daten mit Chart angereichert');
      } catch (error) {
        console.error('⚠️ Fehler bei Chart-Berechnung für Standard Reading:', error);
        console.warn('Reading wird ohne Chart erstellt');
        // Fehler nicht fatal - Reading wird trotzdem erstellt
      }
    }
    
    // Für Connection-Readings: Berechne Charts und Connection Keys automatisch
    if (reading_type === 'connection' && reading_data.personA && reading_data.personB) {
      try {
        console.log('🔄 Berechne Charts für Connection Reading...');
        
        // Bereite Chart-Inputs vor
        const prepareChartInput = (person: any): ChartCalculationInput => {
          // Parse birthPlace - kann String oder Objekt sein
          let birthPlaceData;
          if (typeof person.geburtsort === 'string') {
            birthPlaceData = {
              latitude: 52.52, // Default Berlin
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person.geburtsort
            };
          } else if (person.geburtsort) {
            birthPlaceData = person.geburtsort;
          } else {
            birthPlaceData = {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: 'Berlin'
            };
          }

          return {
            birthDate: person.geburtsdatum,
            birthTime: person.geburtszeit,
            birthPlace: birthPlaceData
          };
        };

        // Berechne Chart für Person A
        const chartAInput = prepareChartInput(reading_data.personA);
        const chartA = await calculateHumanDesignChart(chartAInput);
        
        // Berechne Chart für Person B
        const chartBInput = prepareChartInput(reading_data.personB);
        const chartB = await calculateHumanDesignChart(chartBInput);

        console.log('✅ Charts berechnet:', {
          personA: { type: chartA.type, profile: chartA.profile },
          personB: { type: chartB.type, profile: chartB.profile }
        });

        // Bereite Chart-Inputs für Connection Key Engine vor
        // Konvertiere channels von number[][] zu string[] (z.B. "25-51")
        const convertChannels = (channels: number[][]): string[] => {
          return channels.map(ch => `${ch[0]}-${ch[1]}`);
        };

        // Berechne CenterStatus aus Gates
        const centersA: CenterStatus = calculateCenters(chartA.gates || []);
        const centersB: CenterStatus = calculateCenters(chartB.gates || []);

        const chartAForAnalysis: ChartInput = {
          gates: chartA.gates || [],
          channels: convertChannels(chartA.channels || []),
          type: chartA.type as any,
          profile: chartA.profile,
          authority: chartA.authority as any,
          strategy: chartA.strategy as any,
          centers: centersA
        };

        const chartBForAnalysis: ChartInput = {
          gates: chartB.gates || [],
          channels: convertChannels(chartB.channels || []),
          type: chartB.type as any,
          profile: chartB.profile,
          authority: chartB.authority as any,
          strategy: chartB.strategy as any,
          centers: centersB
        };

        // Analysiere Connection Keys
        const connectionKeyAnalysis = analyzeConnectionKeys(
          chartAForAnalysis,
          chartBForAnalysis,
          reading_data.personA.name || 'Person A',
          reading_data.personB.name || 'Person B'
        );

        console.log('✅ Connection Keys analysiert:', {
          profileType: connectionKeyAnalysis.profileType,
          scores: connectionKeyAnalysis.scores,
          hasSexuality: !!connectionKeyAnalysis.sexuality
        });

        // Füge Charts und Connection Keys zum reading_data hinzu
        enrichedReadingData = {
          ...reading_data,
          // Vollständige Charts für detaillierte Analyse
          charts: {
            personA: chartA,
            personB: chartB
          },
          // Connection Key Analyse für Agent (inkl. Ultra-Version: Sexuality/Chemistry)
          connectionKeys: {
            analysis: connectionKeyAnalysis,
            // Kurze Zusammenfassung für schnellen Überblick
            summary: {
              profileType: connectionKeyAnalysis.profileType,
              scores: connectionKeyAnalysis.scores,
              keyCounts: {
                electromagnetic: connectionKeyAnalysis.connectionKeys.electromagnetic.length,
                compromise: connectionKeyAnalysis.connectionKeys.compromise.length,
                dominance: connectionKeyAnalysis.connectionKeys.dominance.length,
                companionship: connectionKeyAnalysis.connectionKeys.companionship.length
              },
              // Ultra-Version: Sexuality/Chemistry Summary
              sexuality: connectionKeyAnalysis.sexuality ? {
                attractionType: connectionKeyAnalysis.sexuality.attractionType,
                chemistryScores: {
                  physical: connectionKeyAnalysis.sexuality.physicalChemistry,
                  emotional: connectionKeyAnalysis.sexuality.emotionalChemistry,
                  spiritual: connectionKeyAnalysis.sexuality.spiritualChemistry,
                  sensual: connectionKeyAnalysis.sexuality.sensualChemistry
                },
                sexualChannels: connectionKeyAnalysis.sexuality.sexualChannels,
                tensionZonesCount: connectionKeyAnalysis.sexuality.tensionZones.length
              } : undefined
            }
          }
        };

        console.log('✅ Reading-Daten mit Connection Keys angereichert');
      } catch (error) {
        console.error('⚠️ Fehler bei Connection Key Analyse:', error);
        // Fehler nicht fatal - Reading wird trotzdem erstellt, nur ohne Connection Keys
        console.warn('Reading wird ohne Connection Keys erstellt');
      }
    }

    // Für Penta-Readings: Berechne Charts für alle Gruppenmitglieder
    if (reading_type === 'penta' && reading_data.people && Array.isArray(reading_data.people)) {
      try {
        console.log('🔄 Berechne Charts für Penta Reading...');
        
        const prepareChartInput = (person: any): ChartCalculationInput => {
          let birthPlaceData;
          if (typeof person.geburtsort === 'string') {
            birthPlaceData = {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person.geburtsort
            };
          } else if (person.geburtsort) {
            birthPlaceData = person.geburtsort;
          } else {
            birthPlaceData = {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: 'Berlin'
            };
          }

          return {
            birthDate: person.geburtsdatum,
            birthTime: person.geburtszeit,
            birthPlace: birthPlaceData
          };
        };

        // Berechne Charts für alle Personen in der Gruppe
        const charts = await Promise.all(
          reading_data.people.map((person: any) => 
            calculateHumanDesignChart(prepareChartInput(person))
          )
        );

        console.log('✅ Penta Charts berechnet:', {
          groupSize: charts.length,
          types: charts.map(c => c.type),
          profiles: charts.map(c => c.profile)
        });

        // Bereite Penta-Analyse vor - VOLLSTÄNDIGE IMPLEMENTIERUNG
        const pentaAnalysis = calculatePentaAnalysis(charts, reading_data.people);
        
        enrichedReadingData = {
          ...reading_data,
          charts: charts,
          pentaAnalysis: {
            groupSize: reading_data.people.length,
            groupName: reading_data.groupName || 'Gruppe',
            context: reading_data.context || 'general',
            focus: reading_data.focus || 'harmony',
            ...pentaAnalysis
          }
        };

        console.log('✅ Reading-Daten mit Penta-Analyse angereichert');
      } catch (error) {
        console.error('⚠️ Fehler bei Penta-Analyse:', error);
        console.warn('Reading wird ohne Penta-Analyse erstellt');
      }
    }

    // Generiere Reading-Text mit CK-Agent
    let generatedText: string | null = null;
    try {
      console.log('🤖 Rufe CK-Agent für Reading-Generierung auf...');
      
      // Prüfe ob Agent erreichbar ist (optional, nicht blockierend)
      try {
        const { checkAgentAvailability } = await import('@/lib/agent/ck-agent');
        const agentAvailable = await checkAgentAvailability();
        console.log('🔍 Agent-Erreichbarkeit:', agentAvailable ? '✅ Erreichbar' : '❌ Nicht erreichbar');
        if (!agentAvailable) {
          console.warn('⚠️ Agent ist nicht erreichbar - Reading wird ohne generierten Text erstellt');
        }
      } catch (checkError) {
        console.warn('⚠️ Agent-Erreichbarkeits-Prüfung fehlgeschlagen:', checkError);
        // Nicht kritisch - versuche trotzdem die Generierung
      }
      
      // Extrahiere Agent-Konfiguration und Template aus reading_data
      const agentConfig = enrichedReadingData.agentConfig || undefined;
      const template = enrichedReadingData.template || undefined;
      console.log('⚙️ Agent-Konfiguration:', agentConfig);
      console.log('📄 Template:', template);

      if (reading_type === 'connection' && enrichedReadingData.connectionKeys) {
        // Connection-Reading mit Connection Keys
        generatedText = await generateConnectionReadingText(
          client_name,
          enrichedReadingData,
          enrichedReadingData.connectionKeys.analysis,
          enrichedReadingData.charts,
          agentConfig
        );
      } else if (reading_type === 'penta' && enrichedReadingData.pentaAnalysis && enrichedReadingData.charts) {
        // Penta-Reading mit Penta-Analyse
        const { generatePentaReadingText } = await import('@/lib/agent/ck-agent');
        generatedText = await generatePentaReadingText(
          client_name,
          enrichedReadingData,
          enrichedReadingData.pentaAnalysis,
          enrichedReadingData.charts,
          agentConfig
        );
      } else {
        // Standard-Reading (kann Template verwenden)
        generatedText = await generateStandardReadingText(
          reading_type,
          client_name,
          enrichedReadingData,
          agentConfig,
          template
        );
      }

      if (generatedText) {
        console.log('✅ Reading-Text erfolgreich generiert:', {
          length: generatedText.length,
          preview: generatedText.substring(0, 100) + '...',
          firstChars: generatedText.substring(0, 50),
        });
        // Füge generierten Text zum reading_data hinzu
        enrichedReadingData.generatedText = generatedText;
        enrichedReadingData.agentStatus = 'success';
        console.log('📝 generatedText zu enrichedReadingData hinzugefügt:', {
          hasGeneratedText: !!enrichedReadingData.generatedText,
          generatedTextLength: enrichedReadingData.generatedText?.length || 0,
        });
      } else {
        console.warn('⚠️ Reading-Text konnte nicht generiert werden - Reading wird ohne Text erstellt');
        console.warn('⚠️ Mögliche Ursachen:');
        const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
        const agentUrl = getAgentUrl();
        
        console.warn('  1. MCP-Server ist nicht erreichbar (prüfe MCP_SERVER_URL)');
        console.warn('  2. MCP-Server /agents/reading Endpoint existiert möglicherweise nicht');
        console.warn('  3. CK-Agent Fallback ist nicht erreichbar (prüfe CK_AGENT_URL)');
        console.warn('  4. Beide Agenten haben einen Fehler zurückgegeben (prüfe Logs)');
        
        enrichedReadingData.agentStatus = 'failed';
        enrichedReadingData.agentError = 'Der MCP-Server oder CK-Agent konnte den Reading-Text nicht generieren. Das Reading wurde trotzdem erstellt und kann manuell bearbeitet werden.';
        
        const isLocalhost = agentUrl.includes('localhost') || agentUrl.includes('127.0.0.1');
        const isDockerService = agentUrl.includes('ck-agent:4000');
        
        let errorDetails: string;
        errorDetails = `Weder MCP-Server noch CK-Agent konnten den Reading-Text generieren.\n\n`;
        errorDetails += `MCP-Server (primär): ${mcpServerUrl}/agents/reading\n`;
        errorDetails += `CK-Agent (Fallback): ${agentUrl}/run\n\n`;
        errorDetails += `Prüfe:\n`;
        errorDetails += `1. MCP_SERVER_URL ist gesetzt (Standard: ${mcpServerUrl})\n`;
        errorDetails += `2. MCP-Server läuft und /agents/reading Endpoint ist verfügbar\n`;
        errorDetails += `3. CK_AGENT_URL ist gesetzt (Standard: ${agentUrl})`;
        
        if (isLocalhost) {
          errorDetails += `\n\nLokale Entwicklung:\n- Stelle sicher, dass MCP-Server auf ${mcpServerUrl} läuft\n- Oder CK-Agent auf ${agentUrl} läuft\n- Starte CK-Agent mit: cd ck-agent && node server.js`;
        } else if (isDockerService) {
          errorDetails += `\n\nDocker-Umgebung:\n- Prüfe MCP-Server: curl ${mcpServerUrl}/agents/reading\n- Prüfe CK-Agent: docker compose ps ck-agent\n- Starte CK-Agent: docker compose up -d ck-agent`;
        } else {
          errorDetails += `\n\nProduktionsumgebung:\n- Prüfe ob MCP-Server auf ${mcpServerUrl} erreichbar ist\n- Prüfe ob CK-Agent auf ${agentUrl} erreichbar ist`;
        }
        
        enrichedReadingData.agentErrorDetails = errorDetails;
      }
    } catch (error) {
      console.error('⚠️ Fehler bei Reading-Text-Generierung:', error);
      console.error('⚠️ Fehler-Details:', {
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      // Fehler nicht fatal - Reading wird trotzdem erstellt, nur ohne generierten Text
      console.warn('Reading wird ohne generierten Text erstellt');
      enrichedReadingData.agentStatus = 'error';
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      enrichedReadingData.agentError = `Agent-Fehler: ${errorMessage}. Das Reading wurde trotzdem erstellt.`;
      enrichedReadingData.agentErrorDetails = error instanceof Error 
        ? `Fehlertyp: ${error.name}. Bitte prüfe die Server-Logs für Details.`
        : 'Unbekannter Fehler beim Aufruf des KI-Agenten.';
    }

    // Debug: Prüfe ob generatedText im reading_data vorhanden ist
    console.log('📝 Reading wird gespeichert:', {
      hasGeneratedText: !!enrichedReadingData.generatedText,
      generatedTextLength: enrichedReadingData.generatedText?.length || 0,
      readingDataKeys: Object.keys(enrichedReadingData),
      agentStatus: enrichedReadingData.agentStatus,
      generatedTextPreview: enrichedReadingData.generatedText?.substring(0, 100) || 'KEIN TEXT',
    });
    
    // Serialisiere für Debugging
    const serializedData = JSON.stringify(enrichedReadingData);
    console.log('📦 Serialisiertes reading_data (erste 500 Zeichen):', serializedData.substring(0, 500));

    try {
      // ⚡ Versuche in Supabase zu speichern
      const newReading = await createCoachReading(user.id, {
        reading_type,
        client_name,
        reading_data: enrichedReadingData,
        status: generatedText ? 'completed' : 'pending',
      });

      // Konvertiere für Kompatibilität (created_at -> createdAt)
      const readingWithAliases = {
        ...newReading,
        createdAt: newReading.created_at,
        updatedAt: newReading.updated_at,
      };

      console.log('💾 Reading in Supabase gespeichert. ID:', newReading.id);
      console.log('🔍 Geladenes Reading aus Supabase:', {
        id: newReading.id,
        hasReadingData: !!newReading.reading_data,
        hasGeneratedText: !!newReading.reading_data?.generatedText,
        generatedTextLength: newReading.reading_data?.generatedText?.length || 0,
        readingDataKeys: newReading.reading_data ? Object.keys(newReading.reading_data) : [],
        generatedTextPreview: newReading.reading_data?.generatedText?.substring(0, 100) || 'KEIN TEXT',
      });

      return NextResponse.json(
        { 
          success: true,
          reading: readingWithAliases,
          message: 'Reading erfolgreich erstellt',
          hasGeneratedText: !!enrichedReadingData.generatedText,
          agentStatus: enrichedReadingData.agentStatus,
          agentError: enrichedReadingData.agentError,
        },
        { status: 201 }
      );
    } catch (dbError) {
      // ⚠️ Fallback auf In-Memory Store
      console.warn('⚠️ Supabase-Fehler, verwende In-Memory Store als Fallback:', dbError);
      
      const newReading = {
        id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reading_type,
        client_name,
        reading_data: enrichedReadingData,
        status: generatedText ? 'completed' : 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      readingsStore.push(newReading);
      console.log('💾 Reading im In-Memory Store gespeichert (Fallback). Store-Größe:', readingsStore.length);

      return NextResponse.json(
        { 
          success: true,
          reading: newReading,
          message: 'Reading erfolgreich erstellt (Fallback)',
          hasGeneratedText: !!enrichedReadingData.generatedText,
          _fallback: true, // Flag für Debugging
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Readings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


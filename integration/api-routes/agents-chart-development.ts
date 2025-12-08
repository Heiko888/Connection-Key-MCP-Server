/**
 * API Route für Chart Development Agent
 * Route: /api/agents/chart-development
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'chart-development';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, chartType, chartData, birthDate, birthTime, birthPlace, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    // Chart-Daten berechnen (falls Geburtsdaten vorhanden)
    let calculatedChartData = chartData || {};
    if (birthDate && birthTime && birthPlace) {
      try {
        // Nutze Reading Agent für Chart-Berechnung
        const readingAgentUrl = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';
        const chartResponse = await fetch(`${readingAgentUrl}/reading/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            birthDate,
            birthTime,
            birthPlace,
            readingType: 'detailed'
          }),
        });

        if (chartResponse.ok) {
          const chartResult = await chartResponse.json();
          calculatedChartData = chartResult.chartData || calculatedChartData;
        }
      } catch (error) {
        console.warn('Chart-Berechnung fehlgeschlagen, verwende bereitgestellte Daten:', error);
      }
    }

    // Chart Development Agent aufrufen
    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        chartType: chartType || 'bodygraph',
        chartData: calculatedChartData,
        birthDate,
        birthTime,
        birthPlace,
        context: context || {}
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chart Development Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message,
      response: data.response,
      chartCode: data.chartCode,
      chartConfig: data.chartConfig,
      chartData: calculatedChartData, // Berechnete Chart-Daten mit zurückgeben
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chart Development Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}


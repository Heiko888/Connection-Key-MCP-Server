/**
 * API Route für Reading Agent
 * Route: /api/readings/generate
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://localhost:4000';

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
    const { 
      userId, 
      birthDate, 
      birthTime, 
      birthPlace, 
      readingType = 'detailed' 
    } = req.body;

    // Validierung
    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: 'birthDate, birthTime und birthPlace sind erforderlich'
      });
    }

    // Reading Agent aufrufen
    const response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId || 'anonymous',
        birthDate,
        birthTime,
        birthPlace,
        readingType
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reading Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Erfolgreiche Antwort
    return res.status(200).json({
      success: true,
      readingId: data.readingId,
      reading: data.reading,
      readingType: data.readingType || readingType,
      birthDate,
      birthTime,
      birthPlace,
      tokens: data.tokens,
      timestamp: data.timestamp || new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Reading Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}


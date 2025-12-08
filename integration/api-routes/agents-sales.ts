/**
 * API Route für Sales Agent
 * Route: /api/agents/sales
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'sales';

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
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Sales Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}


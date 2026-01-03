/**
 * Mailchimp Subscriber API Route
 * Route: /api/new-subscriber
 * 
 * Empfängt Subscriber-Daten von n8n (nach Mailchimp Double-Opt-In)
 * Speichert in Supabase subscribers Tabelle
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../lib/supabase-clients';

// System-Client: Diese Route wird von n8n aufgerufen (Webhook)
// Service Role Key notwendig für System-Operationen
const supabase = getSystemSupabaseClient();

export async function POST(request: NextRequest) {
  try {
    // API-Key Authentifizierung
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized - Invalid or missing API Key' 
        },
        { status: 401 }
      );
    }

    // Request Body parsen
    const body = await request.json();
    const { email, firstname, lastname, source } = body;

    // Validierung
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing or invalid email' 
        },
        { status: 400 }
      );
    }

    // In Supabase speichern
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{
        email: email.toLowerCase().trim(),
        firstname: firstname || null,
        lastname: lastname || null,
        source: source || 'mailchimp',
      }])
      .select()
      .single();

    if (error) {
      // Duplicate check (Email bereits vorhanden)
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: true,
            status: 'already_exists', 
            message: 'Subscriber already exists',
            email: email.toLowerCase().trim()
          },
          { status: 200 }
        );
      }
      
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database insert failed',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      status: 'saved',
      message: 'Subscriber saved successfully',
      data: {
        id: data.id,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        source: data.source,
        created_at: data.created_at
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('New Subscriber API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Mailchimp Subscriber API',
    endpoint: '/api/new-subscriber',
    method: 'POST',
    authentication: 'Bearer Token (N8N_API_KEY)',
    requiredFields: ['email'],
    optionalFields: ['firstname', 'lastname', 'source']
  });
}


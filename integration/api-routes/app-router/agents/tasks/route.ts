/**
 * Agent Tasks API Route (App Router)
 * Route: /api/agents/tasks
 * 
 * Abrufen von Agent-Tasks und Ergebnissen
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../../../lib/supabase-clients';

// System-Client: Agent Tasks werden von System/Agenten verwaltet
// Service Role Key notwendig für System-Operationen
const supabase = getSystemSupabaseClient();

// GET: Tasks abrufen
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query aufbauen
    // Gezielte Spaltenauswahl für Task-Liste: alle Felder die für Task-Liste benötigt werden
    let query = supabase
      .from('v_agent_tasks')
      .select('id, user_id, agent_id, agent_name, task_message, task_type, status, response, response_data, metadata, error_message, error_details, created_at, updated_at, started_at, completed_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter anwenden
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tasks'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      pagination: {
        limit,
        offset,
        total: tasks?.length || 0
      }
    });

  } catch (error: any) {
    console.error('Agent Tasks API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Task-Statistiken abrufen
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, agentId } = body;

    // Statistiken abrufen
    const { data: stats, error } = await supabase
      .rpc('get_agent_task_statistics', {
        p_user_id: userId || null,
        p_agent_id: agentId || null
      });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch statistics'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      statistics: stats?.[0] || {}
    });

  } catch (error: any) {
    console.error('Agent Tasks Statistics Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}




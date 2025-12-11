/**
 * System Agent Tasks API Route (App Router)
 * Route: /api/system/agents/tasks
 * 
 * System-Infrastruktur für Agent-Tasks
 * - Keine User-Authentifizierung
 * - Nur System-Token-Auth
 * - Für MCP, n8n, Worker, Agenten
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSystemAuth, SystemAuthError } from '@/lib/system-auth';

// Supabase Client mit Service Role Key (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Tasks abrufen
export async function GET(request: NextRequest) {
  try {
    // System-Auth (kein User-Auth!)
    requireSystemAuth(request, { ip: false, hmac: false });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Query aufbauen
    let query = supabase
      .from('agent_tasks')
      .select('*')
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
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch tasks',
          details: error.message
        },
        meta: {
          source: 'system',
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasks || [],
        pagination: {
          limit,
          offset,
          total: tasks?.length || 0
        }
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof SystemAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        },
        { status: error.status }
      );
    }

    console.error('System Agent Tasks API Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SYSTEM_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// POST: Task-Statistiken abrufen
export async function POST(request: NextRequest) {
  try {
    // System-Auth (kein User-Auth!)
    requireSystemAuth(request, { ip: false, hmac: false });

    const body = await request.json();
    const { userId, agentId } = body;

    // Statistiken abrufen
    const { data: stats, error } = await supabase
      .rpc('get_agent_task_statistics', {
        p_user_id: userId || null,
        p_agent_id: agentId || null
      });

    if (error) {
      console.error('Supabase RPC Error:', error);
      
      // Fallback: Manuelle Statistiken berechnen
      let statsQuery = supabase
        .from('agent_tasks')
        .select('status, agent_id', { count: 'exact' });
      
      if (userId) {
        statsQuery = statsQuery.eq('user_id', userId);
      }
      if (agentId) {
        statsQuery = statsQuery.eq('agent_id', agentId);
      }
      
      const { data: tasks, error: queryError } = await statsQuery;
      
      if (queryError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch statistics',
            details: queryError.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        }, { status: 500 });
      }
      
      // Manuelle Statistiken berechnen
      const statistics = {
        total: tasks?.length || 0,
        pending: tasks?.filter((t: any) => t.status === 'pending').length || 0,
        processing: tasks?.filter((t: any) => t.status === 'processing').length || 0,
        completed: tasks?.filter((t: any) => t.status === 'completed').length || 0,
        failed: tasks?.filter((t: any) => t.status === 'failed').length || 0
      };
      
      return NextResponse.json({
        success: true,
        data: { statistics },
        meta: {
          source: 'system',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats?.[0] || {}
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof SystemAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message
          },
          meta: {
            source: 'system',
            timestamp: new Date().toISOString()
          }
        },
        { status: error.status }
      );
    }

    console.error('System Agent Tasks Statistics Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SYSTEM_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      meta: {
        source: 'system',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

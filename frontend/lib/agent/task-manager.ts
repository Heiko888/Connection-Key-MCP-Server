/**
 * Agent Task Manager
 * 
 * Zentrale Verwaltung für Agent-Tasks mit Supabase-Integration
 * Ersetzt in-memory Store durch persistente Supabase-Speicherung
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Client (Client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
export interface AgentTask {
  id: string;
  user_id?: string;
  agent_id: string;
  agent_name: string;
  task_message: string;
  task_type: 'chat' | 'generation' | 'analysis' | 'other';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  response?: string;
  response_data?: any;
  metadata?: {
    tokens?: number;
    model?: string;
    duration_ms?: number;
    [key: string]: any;
  };
  error_message?: string;
  error_details?: any;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled?: number;
  avg_duration_ms?: number;
}

export interface TaskFilters {
  userId?: string;
  agentId?: string;
  status?: AgentTask['status'];
  limit?: number;
  offset?: number;
}

/**
 * Task Manager Class
 * 
 * Verwaltet Agent-Tasks mit Supabase als persistenter Speicher
 */
export class TaskManager {
  /**
   * Erstellt einen neuen Task
   */
  static async createTask(
    agentId: string,
    agentName: string,
    taskMessage: string,
    taskType: AgentTask['task_type'] = 'chat',
    userId?: string
  ): Promise<AgentTask> {
    const { data, error } = await supabase
      .from('agent_tasks')
      .insert({
        agent_id: agentId,
        agent_name: agentName,
        task_message: taskMessage,
        task_type: taskType,
        status: 'pending',
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('TaskManager: Create Task Error', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data as AgentTask;
  }

  /**
   * Aktualisiert Task-Status
   */
  static async updateTaskStatus(
    taskId: string,
    status: AgentTask['status'],
    updates?: {
      response?: string;
      response_data?: any;
      error_message?: string;
      error_details?: any;
      metadata?: any;
    }
  ): Promise<AgentTask> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Status-spezifische Timestamps
    if (status === 'processing' && !updates?.metadata?.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    // Zusätzliche Updates
    if (updates) {
      if (updates.response) updateData.response = updates.response;
      if (updates.response_data) updateData.response_data = updates.response_data;
      if (updates.error_message) updateData.error_message = updates.error_message;
      if (updates.error_details) updateData.error_details = updates.error_details;
      if (updates.metadata) {
        updateData.metadata = {
          ...updateData.metadata,
          ...updates.metadata,
        };
      }
    }

    const { data, error } = await supabase
      .from('agent_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('TaskManager: Update Task Error', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data as AgentTask;
  }

  /**
   * Ruft Tasks ab (mit Filtern)
   */
  static async getTasks(filters: TaskFilters = {}): Promise<{
    tasks: AgentTask[];
    total: number;
  }> {
    let query = supabase
      .from('agent_tasks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter anwenden
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('TaskManager: Get Tasks Error', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return {
      tasks: (data || []) as AgentTask[],
      total: count || 0,
    };
  }

  /**
   * Ruft einen einzelnen Task ab
   */
  static async getTask(taskId: string): Promise<AgentTask | null> {
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('TaskManager: Get Task Error', error);
      throw new Error(`Failed to fetch task: ${error.message}`);
    }

    return data as AgentTask;
  }

  /**
   * Ruft Statistiken ab
   */
  static async getStatistics(filters?: {
    userId?: string;
    agentId?: string;
  }): Promise<TaskStatistics> {
    // Versuche RPC-Funktion zu verwenden
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_agent_task_statistics', {
        p_user_id: filters?.userId || null,
        p_agent_id: filters?.agentId || null,
      });

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData[0] as TaskStatistics;
    }

    // Fallback: Manuelle Berechnung
    let query = supabase
      .from('agent_tasks')
      .select('status, metadata');

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('TaskManager: Get Statistics Error', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    const tasks = data || [];
    const statistics: TaskStatistics = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      processing: tasks.filter((t) => t.status === 'processing').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
    };

    // Berechne durchschnittliche Dauer
    const completedTasks = tasks.filter(
      (t) => t.status === 'completed' && t.metadata?.duration_ms
    );
    if (completedTasks.length > 0) {
      const totalDuration = completedTasks.reduce(
        (sum, t) => sum + (t.metadata?.duration_ms || 0),
        0
      );
      statistics.avg_duration_ms = Math.round(totalDuration / completedTasks.length);
    }

    return statistics;
  }

  /**
   * Löscht einen Task (optional, für Cleanup)
   */
  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('agent_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('TaskManager: Delete Task Error', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Abonniert Task-Updates (Real-time)
   */
  static subscribeToTasks(
    callback: (task: AgentTask) => void,
    filters?: {
      userId?: string;
      agentId?: string;
    }
  ) {
    let channel = supabase
      .channel('agent_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_tasks',
        },
        (payload) => {
          callback(payload.new as AgentTask);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Export default instance (für einfache Verwendung)
export default TaskManager;

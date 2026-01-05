/**
 * Task Manager für Agent Tasks
 * Hilfsfunktionen zum Erstellen und Verwalten von Agent Tasks
 */

export interface AgentTask {
  id: string;
  user_id?: string;
  agent_id: string;
  agent_name: string;
  task_message: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  response?: string;
  response_data?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

// In-Memory Store (wird von /api/agents/tasks/route.ts verwendet)
// Wird später durch Supabase ersetzt
export const tasksStore: AgentTask[] = [];

/**
 * Erstellt einen neuen Task
 */
export function createTask(params: {
  user_id?: string;
  agent_id: string;
  agent_name: string;
  task_message: string;
  task_type?: string;
  metadata?: any;
}): AgentTask {
  const task: AgentTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: params.user_id,
    agent_id: params.agent_id,
    agent_name: params.agent_name,
    task_message: params.task_message,
    task_type: params.task_type || 'general',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: params.metadata || {}
  };

  tasksStore.push(task);
  return task;
}

/**
 * Aktualisiert einen Task
 */
export function updateTask(
  taskId: string,
  updates: Partial<AgentTask>
): AgentTask | null {
  const taskIndex = tasksStore.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  const task = tasksStore[taskIndex];
  const updatedTask: AgentTask = {
    ...task,
    ...updates,
    updated_at: new Date().toISOString()
  };

  tasksStore[taskIndex] = updatedTask;
  return updatedTask;
}

/**
 * Markiert einen Task als "processing"
 */
export function startTask(taskId: string): AgentTask | null {
  return updateTask(taskId, {
    status: 'processing',
    started_at: new Date().toISOString()
  });
}

/**
 * Markiert einen Task als "completed" mit Response
 */
export function completeTask(
  taskId: string,
  response: string,
  response_data?: any
): AgentTask | null {
  return updateTask(taskId, {
    status: 'completed',
    response,
    response_data,
    completed_at: new Date().toISOString()
  });
}

/**
 * Markiert einen Task als "failed" mit Fehlermeldung
 */
export function failTask(
  taskId: string,
  error_message: string
): AgentTask | null {
  return updateTask(taskId, {
    status: 'failed',
    error_message,
    completed_at: new Date().toISOString()
  });
}

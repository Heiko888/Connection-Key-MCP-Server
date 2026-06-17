#!/bin/bash

# Deploys COMPLETE Frontend (Dashboard Komponente + Alle Seiten)
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🚀 Deploy COMPLETE Frontend (Dashboard + Seiten)"
echo "================================================"
echo ""

# ============================================
# TEIL 1: Dashboard Komponente
# ============================================
echo "========================================="
echo "TEIL 1: Dashboard Komponente"
echo "========================================="
echo ""

mkdir -p frontend/components
mkdir -p frontend/app/coach/agents/tasks

echo "📝 Erstelle AgentTasksDashboard Komponente..."
cat > frontend/components/AgentTasksDashboard.tsx << 'DASHBOARD_EOF'
/**
 * AgentTasksDashboard Component
 * Dashboard für Agent-Tasks mit Filter, Statistiken und Task-Liste
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface AgentTask {
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

interface TaskStatistics {
  total_tasks: number;
  pending_tasks: number;
  processing_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  avg_duration_ms?: number;
}

interface TasksResponse {
  success: boolean;
  tasks: AgentTask[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function AgentTasksDashboard() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  
  // Modal
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Tasks abrufen
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
      });

      if (selectedAgent) params.append('agentId', selectedAgent);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/agents/tasks?${params.toString()}`);
      const data: TasksResponse = await res.json();

      if (!data.success) {
        throw new Error('Fehler beim Abrufen der Tasks');
      }

      // Filter nach Suchbegriff (client-side)
      let filteredTasks = data.tasks;
      if (searchQuery) {
        filteredTasks = data.tasks.filter(task =>
          task.task_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.response && task.response.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setTasks(filteredTasks);
    } catch (err: any) {
      console.error('Fetch Tasks Error:', err);
      setError(err.message || 'Fehler beim Abrufen der Tasks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedAgent, selectedStatus, searchQuery, limit]);

  // Statistiken abrufen
  const fetchStatistics = useCallback(async () => {
    try {
      const body: any = {};
      if (selectedAgent) body.agentId = selectedAgent;

      const res = await fetch('/api/agents/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success && data.statistics) {
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.error('Fetch Statistics Error:', err);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, [fetchTasks, fetchStatistics]);

  // Task-Details öffnen
  const openTaskDetails = (task: AgentTask) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  // Status-Badge Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format Datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Agent Tasks Dashboard</h1>
          <p className="text-gray-600">
            Übersicht aller Agent-Aufgaben, Statistiken und Ergebnisse
          </p>
        </div>

        {/* Statistiken */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Gesamt</div>
              <div className="text-3xl font-bold">{statistics.total_tasks}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{statistics.pending_tasks}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Processing</div>
              <div className="text-3xl font-bold text-blue-600">{statistics.processing_tasks}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{statistics.completed_tasks}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-3xl font-bold text-red-600">{statistics.failed_tasks}</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Agenten</option>
                <option value="marketing">Marketing</option>
                <option value="automation">Automation</option>
                <option value="sales">Sales</option>
                <option value="social-youtube">Social-YouTube</option>
                <option value="chart-development">Chart Development</option>
                <option value="website-ux-agent">Website/UX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suche
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nachricht, Agent, Response..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedAgent('');
                  setSelectedStatus('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Liste */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Lade Tasks...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Erneut versuchen
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>Keine Tasks gefunden</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nachricht
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {task.agent_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.agent_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">
                            {task.task_message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(task.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openTaskDetails(task)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Seite {currentPage}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={tasks.length < limit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task-Details Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Task Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Agent</label>
                  <p className="text-gray-900">{selectedTask.agent_name} ({selectedTask.agent_id})</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Nachricht</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedTask.task_message}</p>
                </div>

                {selectedTask.response && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Response</label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {selectedTask.response}
                    </div>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div>
                    <label className="text-sm font-medium text-red-700">Fehler</label>
                    <p className="text-red-900 bg-red-50 p-3 rounded">{selectedTask.error_message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Erstellt</label>
                    <p className="text-gray-900">{formatDate(selectedTask.created_at)}</p>
                  </div>
                  {selectedTask.started_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gestartet</label>
                      <p className="text-gray-900">{formatDate(selectedTask.started_at)}</p>
                    </div>
                  )}
                  {selectedTask.completed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Abgeschlossen</label>
                      <p className="text-gray-900">{formatDate(selectedTask.completed_at)}</p>
                    </div>
                  )}
                </div>

                {selectedTask.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Metadata</label>
                    <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTask.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
DASHBOARD_EOF
echo "   ✅ Dashboard Komponente erstellt"
echo ""

# ============================================
# TEIL 1.5: AgentChat Komponente
# ============================================
echo "========================================="
echo "TEIL 1.5: AgentChat Komponente"
echo "========================================="
echo ""

echo "📝 Erstelle AgentChat Komponente..."
cat > frontend/components/AgentChat.tsx << 'AGENTCHAT_EOF'
/**
 * AgentChat Component
 * Generische Chat-Komponente für alle Agenten (Marketing, Automation, Sales, Social-YouTube, Chart)
 * 
 * Basierend auf ReadingGenerator.tsx Struktur
 */

'use client';

import { useState } from 'react';

export type AgentId = 'marketing' | 'automation' | 'sales' | 'social-youtube' | 'chart';

interface AgentChatProps {
  agentId: AgentId;
  agentName: string;
  userId?: string;
}

interface AgentResponse {
  success: boolean;
  agent: string;
  message: string;
  response: string;
  tokens?: number;
  model?: string;
  timestamp: string;
  error?: string;
}

export function AgentChat({ agentId, agentName, userId }: AgentChatProps) {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'agent'; content: string; timestamp: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Bitte geben Sie eine Nachricht ein');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    // User-Nachricht zur Conversation hinzufügen
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage(''); // Input leeren

    try {
      // Progress: Validierung
      setProgress(10);

      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          userId: userId || undefined
        }),
      });

      // Progress: Request gesendet
      setProgress(30);

      const data: AgentResponse = await res.json();

      // Progress: Response erhalten
      setProgress(70);

      if (!data.success) {
        const errorMessage = data.error || 'Fehler beim Senden der Nachricht';
        throw new Error(errorMessage);
      }

      // Progress: Verarbeitung
      setProgress(90);

      // Agent-Antwort zur Conversation hinzufügen
      const agentMessage = {
        role: 'agent' as const,
        content: data.response || 'Keine Antwort erhalten',
        timestamp: data.timestamp || new Date().toISOString()
      };
      setConversation(prev => [...prev, agentMessage]);

      // Progress: Fertig
      setProgress(100);

      // Progress nach kurzer Zeit zurücksetzen
      setTimeout(() => setProgress(0), 1000);

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
      console.error(`${agentName} Agent Error:`, err);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setConversation([]);
    setError(null);
  };

  return (
    <div className="agent-chat-container">
      <div className="agent-chat-header">
        <h2>{agentName} Agent</h2>
        <button 
          onClick={handleClear}
          className="clear-button"
          disabled={conversation.length === 0}
        >
          Clear
        </button>
      </div>

      {/* Conversation */}
      <div className="agent-chat-messages">
        {conversation.length === 0 ? (
          <div className="empty-state">
            <p>Stelle eine Frage oder bitte um Hilfe zu {agentName}-Themen.</p>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-header">
                <span className="message-role">{msg.role === 'user' ? 'Du' : agentName}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {loading && progress > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="agent-chat-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Frage an ${agentName} Agent...`}
          rows={3}
          disabled={loading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={loading || !message.trim()}
          className="send-button"
        >
          {loading ? 'Sende...' : 'Senden'}
        </button>
      </form>

      <style jsx>{`
        .agent-chat-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .agent-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .agent-chat-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .clear-button {
          padding: 0.5rem 1rem;
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .agent-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: #fafafa;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
        }

        .message {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
        }

        .message.user {
          background: #e3f2fd;
          margin-left: 2rem;
        }

        .message.agent {
          background: #f1f8e9;
          margin-right: 2rem;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #666;
        }

        .message-role {
          font-weight: 600;
        }

        .message-content {
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .progress-bar-container {
          height: 4px;
          background: #e0e0e0;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }

        .error-message {
          padding: 0.75rem;
          background: #ffebee;
          color: #c62828;
          border-top: 1px solid #e0e0e0;
        }

        .agent-chat-form {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          resize: none;
          font-family: inherit;
        }

        .message-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .send-button {
          padding: 0.75rem 1.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
AGENTCHAT_EOF
echo "   ✅ AgentChat Komponente erstellt"
echo ""

# ============================================
# TEIL 2: Tasks Seite
# ============================================
echo "========================================="
echo "TEIL 2: Tasks Seite"
echo "========================================="
echo ""

echo "📝 Erstelle Tasks Seite..."
cat > frontend/app/coach/agents/tasks/page.tsx << 'TASKS_PAGE_EOF'
/**
 * Agent Tasks Dashboard Page
 * Seite für das Agent Tasks Dashboard
 */

import { AgentTasksDashboard } from '../../../../components/AgentTasksDashboard';

export default function AgentTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentTasksDashboard />
    </div>
  );
}
TASKS_PAGE_EOF
echo "   ✅ Tasks Seite erstellt"
echo ""

# ============================================
# TEIL 3: Agent-Seiten
# ============================================
echo "========================================="
echo "TEIL 3: Agent-Seiten"
echo "========================================="
echo ""

# Marketing
echo "📝 Erstelle Marketing Agent Seite..."
mkdir -p frontend/app/coach/agents/marketing
cat > frontend/app/coach/agents/marketing/page.tsx << 'MARKETING_PAGE_EOF'
/**
 * Marketing Agent Page (App Router)
 * Route: /coach/agents/marketing
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function MarketingAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Marketing Agent</h1>
        <p className="text-gray-600">
          Marketingstrategien, Reels, Newsletter, Funnels, Social Media Content
        </p>
      </div>
      <AgentChat agentId="marketing" agentName="Marketing" />
    </div>
  );
}
MARKETING_PAGE_EOF
echo "   ✅ Marketing Seite erstellt"

# Automation
echo "📝 Erstelle Automation Agent Seite..."
mkdir -p frontend/app/coach/agents/automation
cat > frontend/app/coach/agents/automation/page.tsx << 'AUTOMATION_PAGE_EOF'
/**
 * Automation Agent Page (App Router)
 * Route: /coach/agents/automation
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function AutomationAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">⚙️ Automation Agent</h1>
        <p className="text-gray-600">
          n8n Workflows, APIs, Webhooks, Serverkonfiguration, CI/CD
        </p>
      </div>
      <AgentChat agentId="automation" agentName="Automation" />
    </div>
  );
}
AUTOMATION_PAGE_EOF
echo "   ✅ Automation Seite erstellt"

# Sales
echo "📝 Erstelle Sales Agent Seite..."
mkdir -p frontend/app/coach/agents/sales
cat > frontend/app/coach/agents/sales/page.tsx << 'SALES_PAGE_EOF'
/**
 * Sales Agent Page (App Router)
 * Route: /coach/agents/sales
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function SalesAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💰 Sales Agent</h1>
        <p className="text-gray-600">
          Verkaufstexte, Funnels, Buyer Journey, Closing, Verkaufspsychologie
        </p>
      </div>
      <AgentChat agentId="sales" agentName="Sales" />
    </div>
  );
}
SALES_PAGE_EOF
echo "   ✅ Sales Seite erstellt"

# Social-YouTube
echo "📝 Erstelle Social-YouTube Agent Seite..."
mkdir -p frontend/app/coach/agents/social-youtube
cat > frontend/app/coach/agents/social-youtube/page.tsx << 'SOCIAL_PAGE_EOF'
/**
 * Social-YouTube Agent Page (App Router)
 * Route: /coach/agents/social-youtube
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function SocialYouTubeAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📱 Social-YouTube Agent</h1>
        <p className="text-gray-600">
          YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen, Social-Media-Content
        </p>
      </div>
      <AgentChat agentId="social-youtube" agentName="Social-YouTube" />
    </div>
  );
}
SOCIAL_PAGE_EOF
echo "   ✅ Social-YouTube Seite erstellt"

# Chart
echo "📝 Erstelle Chart Agent Seite..."
mkdir -p frontend/app/coach/agents/chart
cat > frontend/app/coach/agents/chart/page.tsx << 'CHART_PAGE_EOF'
/**
 * Chart Agent Page (App Router)
 * Route: /coach/agents/chart
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function ChartAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Chart Development Agent</h1>
        <p className="text-gray-600">
          Chart-Analysen, Human Design Interpretationen, Chart-Berechnungen
        </p>
      </div>
      <AgentChat agentId="chart" agentName="Chart Development" />
    </div>
  );
}
CHART_PAGE_EOF
echo "   ✅ Chart Seite erstellt"
echo ""

# ============================================
# TEIL 4: Container neu bauen
# ============================================
echo "========================================="
echo "TEIL 4: Container neu bauen"
echo "========================================="
echo ""

echo "🔄 Baue Container neu..."
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose build --no-cache frontend
echo ""

# ============================================
# TEIL 5: Container starten
# ============================================
echo "========================================="
echo "TEIL 5: Container starten"
echo "========================================="
echo ""

echo "🚀 Starte Container..."
docker compose up -d frontend
echo ""

# ============================================
# TEIL 6: Warten und testen
# ============================================
echo "========================================="
echo "TEIL 6: Warten und testen"
echo "========================================="
echo ""

echo "⏳ Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

echo "🧪 Teste Frontend-Seiten..."
echo "--------------------------"

PAGES=(
  "/coach/agents/tasks"
  "/coach/agents/marketing"
  "/coach/agents/automation"
  "/coach/agents/sales"
  "/coach/agents/social-youtube"
  "/coach/agents/chart"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for page in "${PAGES[@]}"; do
  echo ""
  echo "   Teste $page..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${page}" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ $page funktioniert! (HTTP $HTTP_CODE)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  $page gibt 404 zurück"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "   ⚠️  $page antwortet mit HTTP $HTTP_CODE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""

# ============================================
# TEIL 7: Zusammenfassung
# ============================================
echo "========================================="
echo "TEIL 7: Zusammenfassung"
echo "========================================="
echo ""

echo "   Erfolgreich: $SUCCESS_COUNT / ${#PAGES[@]}"
echo "   Fehler: $FAIL_COUNT / ${#PAGES[@]}"
echo ""

if [ $SUCCESS_COUNT -eq ${#PAGES[@]} ]; then
  echo "✅ ALLE Frontend-Seiten erfolgreich deployt!"
else
  echo "⚠️  Einige Seiten haben noch Probleme"
  echo ""
  echo "🔍 Debugging:"
  echo "1. Prüfe Container-Logs: docker compose logs frontend | tail -50"
  echo "2. Prüfe ob Dashboard-Komponente vorhanden: ls -la frontend/components/AgentTasksDashboard.tsx"
  echo "3. Prüfe ob AgentChat vorhanden: ls -la frontend/components/AgentChat.tsx"
fi
echo ""

echo "📋 Nächste Schritte:"
echo "1. Öffne Dashboard: http://167.235.224.149:3000/coach/agents/tasks"
echo "2. Teste Agent-Seiten:"
for page in "${PAGES[@]}"; do
  echo "   http://167.235.224.149:3000${page}"
done
echo ""
echo "✅ Agent-Routen sind bereits deployt!"
echo ""

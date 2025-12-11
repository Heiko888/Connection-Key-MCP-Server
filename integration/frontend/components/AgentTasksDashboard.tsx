/**
 * AgentTasksDashboard Component
 * Dashboard für Agent-Tasks mit Filter, Statistiken und Task-Liste
 */

'use client';

import { useState, useEffect } from 'react';

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
  };

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
  };

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

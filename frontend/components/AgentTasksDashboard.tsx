/**
 * AgentTasksDashboard Component
 * Dashboard für Agent-Tasks mit Filter, Statistiken und Task-Liste
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

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

      // Hole Access Token von Supabase
      const supabase = createClient();
      
      // Versuche zuerst getSession()
      let session = null;
      let token: string | undefined = undefined;
      
      try {
        const sessionResult = await supabase.auth.getSession();
        session = sessionResult.data?.session;
        token = session?.access_token;
        
        console.log('🔍 fetchTasks - getSession Ergebnis:', {
          hasSession: !!session,
          hasToken: !!token,
          tokenLength: token?.length
        });
        
        // Fallback 1: Wenn keine Session, versuche getUser()
        if (!session || !token) {
          console.log('⚠️ fetchTasks - Keine Session, versuche getUser()...');
          const userResult = await supabase.auth.getUser();
          console.log('🔍 fetchTasks - getUser Ergebnis:', {
            hasUser: !!userResult.data?.user,
            error: userResult.error?.message
          });
        }
        
        // Fallback 2: Versuche Token aus localStorage zu holen
        if (!token && typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            token = storedToken;
            console.log('✅ fetchTasks - Token aus localStorage geladen');
          } else {
            console.warn('⚠️ fetchTasks - Kein Token in localStorage');
          }
        }
      } catch (sessionError) {
        console.error('❌ fetchTasks - Session-Fehler:', sessionError);
      }

      console.log('🔍 fetchTasks - Final Token Status:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'kein Token'
      });

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
      });

      if (selectedAgent) params.append('agentId', selectedAgent);
      if (selectedStatus) params.append('status', selectedStatus);

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 fetchTasks - Authorization Header gesetzt');
      } else {
        console.warn('⚠️ fetchTasks - Kein Token verfügbar!');
      }

      const res = await fetch(`/api/agents/tasks?${params.toString()}`, {
        headers,
      });
      
      console.log('🔍 fetchTasks - Response Status:', res.status);
      
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
      // Hole Access Token von Supabase
      const supabase = createClient();
      
      // Versuche zuerst getSession()
      let session = null;
      let token: string | undefined = undefined;
      
      try {
        const sessionResult = await supabase.auth.getSession();
        session = sessionResult.data?.session;
        token = session?.access_token;
        
        console.log('🔍 fetchStatistics - getSession Ergebnis:', {
          hasSession: !!session,
          hasToken: !!token,
          tokenLength: token?.length
        });
        
        // Fallback 1: Wenn keine Session, versuche getUser()
        if (!session || !token) {
          console.log('⚠️ fetchStatistics - Keine Session, versuche getUser()...');
          const userResult = await supabase.auth.getUser();
          console.log('🔍 fetchStatistics - getUser Ergebnis:', {
            hasUser: !!userResult.data?.user,
            error: userResult.error?.message
          });
        }
        
        // Fallback 2: Versuche Token aus localStorage zu holen
        if (!token && typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            token = storedToken;
            console.log('✅ fetchStatistics - Token aus localStorage geladen');
          } else {
            console.warn('⚠️ fetchStatistics - Kein Token in localStorage');
          }
        }
      } catch (sessionError) {
        console.error('❌ fetchStatistics - Session-Fehler:', sessionError);
      }

      console.log('🔍 fetchStatistics - Final Token Status:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'kein Token'
      });

      const body: any = {};
      if (selectedAgent) body.agentId = selectedAgent;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 fetchStatistics - Authorization Header gesetzt');
      } else {
        console.warn('⚠️ fetchStatistics - Kein Token verfügbar!');
      }

      const res = await fetch('/api/agents/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      
      console.log('🔍 fetchStatistics - Response Status:', res.status);

      if (!res.ok) {
        console.error('Statistics fetch failed:', res.status, res.statusText);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type for statistics');
        return;
      }

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

  // Retry Handler (für Error Boundaries)
  const handleRetryAgent = () => {
    setError(null);
    fetchTasks();
    fetchStatistics();
  };

  // Status-Badge Farbe
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { background: 'rgba(76, 175, 80, 0.3)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.5)' };
      case 'processing':
        return { background: 'rgba(242, 159, 5, 0.3)', color: '#F29F05', border: '1px solid rgba(242, 159, 5, 0.5)' };
      case 'pending':
        return { background: 'rgba(242, 159, 5, 0.2)', color: '#F29F05', border: '1px solid rgba(242, 159, 5, 0.4)' };
      case 'failed':
        return { background: 'rgba(255, 107, 107, 0.3)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.5)' };
      case 'cancelled':
        return { background: 'rgba(128, 128, 128, 0.3)', color: '#808080', border: '1px solid rgba(128, 128, 128, 0.5)' };
      default:
        return { background: 'rgba(128, 128, 128, 0.3)', color: '#808080', border: '1px solid rgba(128, 128, 128, 0.5)' };
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
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#F29F05' }}>📊 Agent Tasks Dashboard</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Übersicht aller Agent-Aufgaben, Statistiken und Ergebnisse
          </p>
        </div>

        {/* Statistiken */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Gesamt</div>
              <div className="text-3xl font-bold" style={{ color: '#F29F05' }}>{statistics.total_tasks}</div>
            </div>
            <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Pending</div>
              <div className="text-3xl font-bold" style={{ color: '#F29F05' }}>{statistics.pending_tasks}</div>
            </div>
            <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Processing</div>
              <div className="text-3xl font-bold" style={{ color: '#F29F05' }}>{statistics.processing_tasks}</div>
            </div>
            <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Completed</div>
              <div className="text-3xl font-bold" style={{ color: '#4caf50' }}>{statistics.completed_tasks}</div>
            </div>
            <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Failed</div>
              <div className="text-3xl font-bold" style={{ color: '#ff6b6b' }}>{statistics.failed_tasks}</div>
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
                <option value="ui-ux">UI/UX</option>
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
        <div className="rounded-lg shadow" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F29F05' }}></div>
              <p className="mt-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Lade Tasks...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center" style={{ color: '#ff6b6b' }}>
              <p>{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-4 px-4 py-2 rounded-md"
                style={{ background: 'rgba(242, 159, 5, 0.3)', color: '#F29F05', border: '1px solid rgba(242, 159, 5, 0.5)' }}
              >
                Erneut versuchen
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>Keine Tasks gefunden</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: 'rgba(242, 159, 5, 0.1)' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#F29F05' }}>
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#F29F05' }}>
                        Nachricht
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#F29F05' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#F29F05' }}>
                        Erstellt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#F29F05' }}>
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr 
                        key={task.id} 
                        style={{ 
                          borderTop: index > 0 ? '1px solid rgba(242, 159, 5, 0.2)' : 'none',
                          background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(242, 159, 5, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0, 0, 0, 0.1)' : 'transparent'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: '#ffffff' }}>
                            {task.agent_name}
                          </div>
                          <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {task.agent_id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm max-w-md truncate" style={{ color: '#ffffff' }}>
                            {task.task_message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={getStatusColor(task.status)}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {formatDate(task.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openTaskDetails(task)}
                            style={{ color: '#F29F05' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#8C1D04'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#F29F05'}
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(11, 10, 15, 0.95)', border: '2px solid rgba(242, 159, 5, 0.3)' }}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold" style={{ color: '#F29F05' }}>Task Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Agent</label>
                  <p style={{ color: '#ffffff' }}>{selectedTask.agent_name} ({selectedTask.agent_id})</p>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Status</label>
                  <p>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full" style={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Nachricht</label>
                  <p className="p-3 rounded" style={{ color: '#ffffff', background: 'rgba(0, 0, 0, 0.3)' }}>{selectedTask.task_message}</p>
                </div>

                {selectedTask.response && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Response</label>
                    <div className="p-3 rounded whitespace-pre-wrap" style={{ color: '#ffffff', background: 'rgba(0, 0, 0, 0.3)' }}>
                      {selectedTask.response}
                    </div>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#ff6b6b' }}>Fehler</label>
                    <p className="p-3 rounded" style={{ color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.2)' }}>{selectedTask.error_message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Erstellt</label>
                    <p style={{ color: '#ffffff' }}>{formatDate(selectedTask.created_at)}</p>
                  </div>
                  {selectedTask.started_at && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Gestartet</label>
                      <p style={{ color: '#ffffff' }}>{formatDate(selectedTask.started_at)}</p>
                    </div>
                  )}
                  {selectedTask.completed_at && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Abgeschlossen</label>
                      <p style={{ color: '#ffffff' }}>{formatDate(selectedTask.completed_at)}</p>
                    </div>
                  )}
                </div>

                {selectedTask.metadata && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#F29F05' }}>Metadata</label>
                    <pre className="text-xs p-3 rounded overflow-auto" style={{ color: '#ffffff', background: 'rgba(0, 0, 0, 0.3)' }}>
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

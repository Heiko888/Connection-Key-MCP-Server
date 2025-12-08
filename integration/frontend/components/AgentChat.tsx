/**
 * AgentChat Component
 * Universelle Chat-Komponente für alle Agenten
 */

'use client';

import { useState } from 'react';

interface AgentChatProps {
  agentId: 'marketing' | 'automation' | 'sales' | 'social-youtube';
  agentName: string;
  userId?: string;
}

export function AgentChat({ agentId, agentName, userId }: AgentChatProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ message: string; response: string; timestamp: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: userId || 'anonymous'
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Aufruf des Agenten');
      }

      setResponse(data.response);
      setHistory(prev => [...prev, {
        message,
        response: data.response,
        timestamp: new Date().toISOString()
      }]);
      setMessage('');

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
      console.error('Agent Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-chat-container">
      <div className="agent-header">
        <h2>{agentName} Agent</h2>
        <span className="agent-id">ID: {agentId}</span>
      </div>

      {/* Chat History */}
      <div className="chat-history">
        {history.map((item, index) => (
          <div key={index} className="chat-item">
            <div className="user-message">
              <strong>Sie:</strong> {item.message}
            </div>
            <div className="agent-response">
              <strong>{agentName}:</strong>
              <div className="response-content">{item.response}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Aktuelle Antwort */}
      {response && (
        <div className="current-response">
          <h3>Antwort:</h3>
          <div className="response-content">{response}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Fragen Sie den ${agentName} Agenten...`}
          rows={3}
          disabled={loading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={loading || !message.trim()}
          className="submit-button"
        >
          {loading ? 'Wird verarbeitet...' : 'Senden'}
        </button>
      </form>
    </div>
  );
}


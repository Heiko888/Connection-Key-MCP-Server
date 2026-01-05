/**
 * AgentChat Component
 * Generische Chat-Komponente für alle Agenten (Marketing, Automation, Sales, Social-YouTube, Chart)
 *
 * Basierend auf ReadingGenerator.tsx Struktur
 */

'use client';

import { useState } from 'react';

export type AgentId = 'marketing' | 'automation' | 'sales' | 'social-youtube' | 'chart' | 'ui-ux';

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

      // Prüfe ob Response OK ist
      if (!res.ok) {
        const { safeResponseText } = await import('@/lib/utils/safeJson');
        const errorText = await safeResponseText(res, 'Unbekannter Fehler');
        throw new Error(`HTTP ${res.status}: ${errorText || 'Server-Fehler'}`);
      }

      // Parse Response sicher
      const { safeResponseParse } = await import('@/lib/utils/safeJson');
      const parsed = await safeResponseParse<AgentResponse>(res, null);
      
      if ('error' in parsed) {
        throw new Error(`Ungültige Antwort vom Server: ${parsed.error.substring(0, 200)}`);
      }

      const data = parsed as AgentResponse;

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
          border: 1px solid rgba(242, 159, 5, 0.3);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.3);
        }

        .agent-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(242, 159, 5, 0.1);
          border-bottom: 1px solid rgba(242, 159, 5, 0.3);
        }

        .agent-chat-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #F29F05;
          font-weight: 700;
        }

        .clear-button {
          padding: 0.5rem 1rem;
          background: rgba(140, 29, 4, 0.8);
          color: white;
          border: 1px solid rgba(140, 29, 4, 0.5);
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .clear-button:hover:not(:disabled) {
          background: rgba(140, 29, 4, 1);
          border-color: rgba(140, 29, 4, 1);
        }

        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .agent-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
        }

        .agent-chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .agent-chat-messages::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        .agent-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(242, 159, 5, 0.5);
          border-radius: 4px;
        }

        .agent-chat-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(242, 159, 5, 0.7);
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
        }

        .message {
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }

        .message.user {
          background: rgba(242, 159, 5, 0.15);
          margin-left: 2rem;
          border-left: 3px solid rgba(242, 159, 5, 0.5);
        }

        .message.agent {
          background: rgba(140, 29, 4, 0.15);
          margin-right: 2rem;
          border-left: 3px solid rgba(140, 29, 4, 0.5);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .message.user .message-header {
          color: rgba(242, 159, 5, 0.9);
        }

        .message.agent .message-header {
          color: rgba(255, 255, 255, 0.8);
        }

        .message-role {
          font-weight: 700;
        }

        .message-time {
          opacity: 0.7;
        }

        .message-content {
          white-space: pre-wrap;
          line-height: 1.6;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .progress-bar-container {
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #F29F05, #8C1D04);
          transition: width 0.3s ease;
        }

        .error-message {
          padding: 0.75rem;
          background: rgba(140, 29, 4, 0.3);
          color: #ff6b6b;
          border-top: 1px solid rgba(140, 29, 4, 0.5);
        }

        .error-message p {
          margin: 0;
          font-weight: 600;
        }

        .agent-chat-form {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(242, 159, 5, 0.3);
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(242, 159, 5, 0.3);
          border-radius: 4px;
          resize: none;
          font-family: inherit;
          background: rgba(0, 0, 0, 0.4);
          color: #ffffff;
          font-size: 0.95rem;
        }

        .message-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .message-input:focus {
          outline: none;
          border-color: rgba(242, 159, 5, 0.7);
          background: rgba(0, 0, 0, 0.5);
        }

        .message-input:disabled {
          background: rgba(0, 0, 0, 0.2);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .send-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #F29F05 0%, #8C1D04 100%);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .send-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #8C1D04 0%, #F29F05 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(242, 159, 5, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}

/**
 * Agents Dashboard Page
 * Übersichtsseite für alle 5 Agenten
 */

import { AgentChat } from '../components/AgentChat';
import { ReadingGenerator } from '../components/ReadingGenerator';

export default function AgentsDashboard() {
  return (
    <div className="agents-dashboard">
      <h1>🤖 Agenten Dashboard</h1>
      <p className="subtitle">Wählen Sie einen Agenten aus, um mit ihm zu interagieren</p>

      <div className="agents-grid">
        {/* Marketing Agent */}
        <div className="agent-card">
          <h2>🎯 Marketing Agent</h2>
          <p>Marketingstrategien, Reels, Newsletter, Funnels</p>
          <AgentChat 
            agentId="marketing" 
            agentName="Marketing"
          />
        </div>

        {/* Automation Agent */}
        <div className="agent-card">
          <h2>⚙️ Automation Agent</h2>
          <p>n8n, APIs, Webhooks, Serverkonfiguration</p>
          <AgentChat 
            agentId="automation" 
            agentName="Automation"
          />
        </div>

        {/* Sales Agent */}
        <div className="agent-card">
          <h2>💰 Sales Agent</h2>
          <p>Verkaufstexte, Funnels, Closing-Techniken</p>
          <AgentChat 
            agentId="sales" 
            agentName="Sales"
          />
        </div>

        {/* Social-YouTube Agent */}
        <div className="agent-card">
          <h2>🎬 Social-YouTube Agent</h2>
          <p>Video-Skripte, Posts, Thumbnails, SEO</p>
          <AgentChat 
            agentId="social-youtube" 
            agentName="Social-YouTube"
          />
        </div>

        {/* Reading Agent (5. Agent) */}
        <div className="agent-card reading-agent-card">
          <h2>🔮 Reading Agent</h2>
          <p>Human Design Readings, Chart-Analysen, Persönlichkeitsanalysen</p>
          <ReadingGenerator />
        </div>
      </div>
    </div>
  );
}


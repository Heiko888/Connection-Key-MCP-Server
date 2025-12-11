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


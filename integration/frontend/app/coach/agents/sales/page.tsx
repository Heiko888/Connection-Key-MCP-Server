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
          Verkaufstexte, Funnels, Closing-Techniken, Pitch Decks
        </p>
      </div>
      <AgentChat agentId="sales" agentName="Sales" />
    </div>
  );
}


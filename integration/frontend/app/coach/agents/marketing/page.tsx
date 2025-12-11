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


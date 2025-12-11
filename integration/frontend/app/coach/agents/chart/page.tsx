/**
 * Chart Agent Page (App Router)
 * Route: /coach/agents/chart
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function ChartAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Chart Agent</h1>
        <p className="text-gray-600">
          Chart-Analysen, Human Design Interpretationen, Chart-Berechnungen
        </p>
      </div>
      <AgentChat agentId="chart" agentName="Chart" />
    </div>
  );
}


/**
 * Social-YouTube Agent Page (App Router)
 * Route: /coach/agents/social-youtube
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function SocialYouTubeAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎬 Social-YouTube Agent</h1>
        <p className="text-gray-600">
          Video-Skripte, Posts, Thumbnails, SEO, Social Media Content
        </p>
      </div>
      <AgentChat agentId="social-youtube" agentName="Social-YouTube" />
    </div>
  );
}


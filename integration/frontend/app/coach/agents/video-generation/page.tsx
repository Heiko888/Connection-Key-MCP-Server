/**
 * Video Generation Agent Page (App Router)
 * Route: /coach/agents/video-generation
 *
 * Deployment-Ziel: Server .167, frontend-coach
 *   app/coach/agents/video-generation/page.tsx
 */

import { Box } from '@mui/material';
import VideoGenerationPanel from '../../../../components/VideoGenerationPanel';

export default function VideoGenerationAgentPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <VideoGenerationPanel />
    </Box>
  );
}

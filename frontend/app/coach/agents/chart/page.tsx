/**
 * Chart Agent Page (App Router)
 * Route: /coach/agents/chart
 */

'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import CoachAuth from '@/components/CoachAuth';
import GlobalNavigation, { MenuItem } from '@/app/components/GlobalNavigation';
import { AgentChat } from '../../../../components/AgentChat';

const ChartAgentPageContent = () => {
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    setMounted(true);
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStarPositions(stars);
  }, []);

  // Coach Navigation Menu Items
  const coachMenuItems: MenuItem[] = [
    { href: '/coach', label: 'Home' },
    { href: '/coach/dashboard', label: 'Dashboard' },
    { href: '/coach/readings-v2', label: 'Readings' },
    { href: '/coach/agents', label: 'Agents' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        pt: 4,
        pb: 8,
      }}
    >
      {/* Animierte Sterne im Hintergrund */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 4 }}>
        <GlobalNavigation 
          menuItems={coachMenuItems} 
          showAuthButtons={false}
          showLogo={false}
        />
      </Container>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, pt: 2 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box sx={{ 
            position: 'relative', 
            width: { xs: '100%', md: 600 }, 
            maxWidth: 600, 
            height: { xs: 120, md: 180 }, 
            mx: 'auto' 
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Box>
        </Box>

        {/* Erläuterung */}
        <Box
          sx={{
            background: 'rgba(242, 159, 5, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#F29F05',
              fontWeight: 600,
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            📊 Chart Development Agent
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.875rem', md: '1rem' },
              lineHeight: { xs: 1.6, md: 1.8 },
              px: { xs: 1, md: 0 },
            }}
          >
            Analysiere Human Design Charts, erstelle detaillierte Interpretationen und führe 
            Chart-Berechnungen durch. Dieser Agent unterstützt dich bei der Entwicklung von 
            Chart-Analysen, der Interpretation von Human Design-Elementen und der Berechnung 
            komplexer Chart-Konfigurationen für deine Coach-Arbeit.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              lineHeight: { xs: 1.5, md: 1.6 },
              fontStyle: 'italic',
            }}
          >
            Stelle dem Agenten Fragen zu Chart-Analysen, Human Design-Interpretationen oder 
            lass dir komplexe Chart-Berechnungen durchführen.
          </Typography>
        </Box>

        {/* Agent Chat Container */}
        <Paper
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: { xs: 2, md: 4 }
          }}
        >
          <AgentChat agentId="chart" agentName="Chart Development" />
        </Paper>
      </Container>
    </Box>
  );
};

export default function ChartAgentPage() {
  return (
    <CoachAuth>
      <ChartAgentPageContent />
    </CoachAuth>
  );
}

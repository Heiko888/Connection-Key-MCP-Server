'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  SmartToy,
  Campaign,
  Settings,
  AttachMoney,
  VideoLibrary,
  BarChart,
  Palette,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CoachAuth from '@/components/CoachAuth';
import GlobalNavigation, { MenuItem } from '@/app/components/GlobalNavigation';
import Image from 'next/image';

function AgentsPageContent() {
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random positions only on client
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

  const agents = [
    {
      id: 'tasks',
      title: 'Agent Tasks',
      description: 'Übersicht aller Agent-Aufgaben, Statistiken und Ergebnisse',
      icon: SmartToy,
      path: '/coach/agents/tasks',
      color: '#F29F05',
    },
    {
      id: 'marketing',
      title: 'Marketing Agent',
      description: 'Marketingstrategien, Reels, Newsletter, Funnels, Social Media Content',
      icon: Campaign,
      path: '/coach/agents/marketing',
      color: '#4fc3f7',
    },
    {
      id: 'automation',
      title: 'Automation Agent',
      description: 'n8n Workflows, APIs, Webhooks, Serverkonfiguration, CI/CD',
      icon: Settings,
      path: '/coach/agents/automation',
      color: '#4caf50',
    },
    {
      id: 'sales',
      title: 'Sales Agent',
      description: 'Verkaufstexte, Funnels, Buyer Journey, Closing, Verkaufspsychologie',
      icon: AttachMoney,
      path: '/coach/agents/sales',
      color: '#e8b86d',
    },
    {
      id: 'social-youtube',
      title: 'Social-YouTube Agent',
      description: 'YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen',
      icon: VideoLibrary,
      path: '/coach/agents/social-youtube',
      color: '#ff6b6b',
    },
    {
      id: 'chart',
      title: 'Chart Development Agent',
      description: 'Chart-Analysen, Human Design Interpretationen, Chart-Berechnungen',
      icon: BarChart,
      path: '/coach/agents/chart',
      color: '#9c27b0',
    },
    {
      id: 'ui-ux',
      title: 'UI/UX Agent',
      description: 'User Interface & User Experience Design, Design Systems, Responsive Design',
      icon: Palette,
      path: '/coach/agents/ui-ux',
      color: '#00bcd4',
    },
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
        pt: 0,
        pb: 8,
      }}
    >
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
      </Container>

      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
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

      {/* Animierte Planeten-Orbits - nur nach Mount */}
      {mounted && Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${20 + i * 20}%`,
            top: `${10 + i * 15}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsierende Planeten - nur nach Mount */}
      {mounted && Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${20 + i * 10}px`,
            height: `${20 + i * 10}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
            zIndex: 0,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, pt: 2 }}>
        {/* Überschrift */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h2"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: '1.8rem', md: '2.8rem' },
              lineHeight: 1.2,
            }}
          >
            🤖 AI Agenten Verwaltung
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.2rem' },
              lineHeight: 1.7,
              px: { xs: 1, md: 0 },
            }}
          >
            Verwalte und nutze alle verfügbaren AI-Agenten für deine Coach-Arbeit
          </Typography>
        </Box>

        {/* Agent Cards - Überarbeitetes Design */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {agents.map((agent, index) => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  component="a"
                  href={agent.path}
                  sx={{
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `2px solid rgba(255, 255, 255, 0.15)`,
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${agent.color}, ${agent.color}dd, ${agent.color})`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${agent.color}40`,
                      borderColor: agent.color,
                      '&::before': {
                        opacity: 1,
                      },
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      mb: 2.5,
                      gap: 2,
                    }}>
                      <Box sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}10)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1px solid ${agent.color}30`,
                      }}>
                        <agent.icon sx={{ 
                          color: agent.color, 
                          fontSize: { xs: 28, md: 32 },
                        }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: '#ffffff', 
                            fontWeight: 700, 
                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                            mb: 0.5,
                            lineHeight: 1.2,
                          }}
                        >
                          {agent.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.85)', 
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        lineHeight: 1.7,
                      }}
                    >
                      {agent.description}
                    </Typography>
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: agent.color,
                          fontWeight: 600,
                          fontSize: { xs: '0.8125rem', md: '0.875rem' },
                        }}
                      >
                        Agent öffnen →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default function AgentsPage() {
  return (
    <CoachAuth>
      <AgentsPageContent />
    </CoachAuth>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CoachAuth from '@/components/CoachAuth';
import GlobalNavigation, { MenuItem } from '@/app/components/GlobalNavigation';

function CoachHomeContent() {
  const router = useRouter();
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

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Übersicht über deine Aktivitäten und Statistiken',
      icon: DashboardIcon,
      path: '/coach/dashboard',
      color: '#e8b86d',
    },
    {
      title: 'Readings verwalten',
      description: 'Alle erstellten Readings anzeigen, bearbeiten und exportieren',
      icon: BookIcon,
      path: '/coach/readings-v2',
      color: '#4fc3f7',
    },
    {
      title: 'Neues Reading erstellen',
      description: 'Human Design oder Connection Key Reading für Klienten erstellen',
      icon: AddIcon,
      path: '/coach/readings-v2/create',
      color: '#4caf50',
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 4 }}>
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

        {/* Willkommenstext */}
        <Box sx={{ mb: { xs: 3, md: 6 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
              lineHeight: { xs: 1.2, md: 1.3 },
            }}
          >
            Willkommen im Coach-Bereich
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 300,
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
              lineHeight: { xs: 1.5, md: 1.8 },
              px: { xs: 1, md: 0 },
            }}
          >
            Erstelle professionelle Human Design Readings und verwalte deine Klienten
          </Typography>
        </Box>

        {/* Navigations-Karten */}
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: { xs: 'none', md: 'translateY(-8px)' },
                    boxShadow: { xs: 'none', md: `0 12px 40px ${item.color}40` },
                    borderColor: item.color,
                  },
                }}
                onClick={() => router.push(item.path)}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: { xs: 2, md: 4 },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      mb: { xs: 1.5, md: 3 },
                      p: { xs: 1.5, md: 3 },
                      borderRadius: '50%',
                      background: `${item.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: { xs: 60, sm: 80, md: 120 },
                      minHeight: { xs: 60, sm: 80, md: 120 },
                    }}
                  >
                    {mounted && <item.icon sx={{ fontSize: { xs: 30, sm: 40, md: 60 }, color: item.color }} />}
                  </Box>

                  {/* Titel */}
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      mb: { xs: 1, md: 2 },
                      fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                      lineHeight: { xs: 1.3, md: 1.4 },
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* Beschreibung */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: { xs: 2, md: 3 },
                      flexGrow: 1,
                      fontSize: { xs: '0.8125rem', md: '0.875rem' },
                      lineHeight: { xs: 1.5, md: 1.6 },
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)`,
                      color: '#000',
                      fontWeight: 600,
                      py: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.8125rem', md: '1rem' },
                      '&:hover': {
                        background: `linear-gradient(135deg, ${item.color}cc 0%, ${item.color} 100%)`,
                      },
                    }}
                  >
                    Öffnen
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Hilfebereich */}
        <Box
          sx={{
            mt: { xs: 4, md: 8 },
            p: { xs: 2, md: 4 },
            background: 'rgba(232, 184, 109, 0.1)',
            borderRadius: { xs: 2, md: 3 },
            border: '1px solid rgba(232, 184, 109, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#e8b86d',
              fontWeight: 600,
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            💡 Schnellstart
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.875rem', md: '1rem' },
              lineHeight: { xs: 1.5, md: 1.6 },
              px: { xs: 1, md: 0 },
            }}
          >
            <strong>Neu hier?</strong> Starte mit einem neuen Reading! Gebe die Geburtsdaten ein, 
            nutze den Gate Calculator für präzise Berechnungen und exportiere dein professionelles PDF.
          </Typography>
          <Button
            variant="outlined"
            size={mounted ? "large" : "medium"}
            startIcon={mounted ? <AddIcon /> : undefined}
            onClick={() => router.push('/coach/readings-v2/create')}
            sx={{
              borderColor: '#e8b86d',
              color: '#e8b86d',
              fontWeight: 600,
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: '0.8125rem', md: '1rem' },
              '&:hover': {
                borderColor: '#ffd89b',
                background: 'rgba(232, 184, 109, 0.1)',
              },
            }}
          >
            Erstes Reading erstellen
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default function CoachHome() {
  return (
    <CoachAuth>
      <CoachHomeContent />
    </CoachAuth>
  );
}


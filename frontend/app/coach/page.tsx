'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoachAuth from '@/components/CoachAuth';
import CoachNavigation from '@/components/CoachNavigation';
import Image from 'next/image';
import { 
  Box, 
  Container,
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  Book as BookIcon,
  SmartToy as AgentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Coach Homepage
 * Zentrale Übersichtsseite für alle Coach-Features
 */
function CoachHomeContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random star positions only on client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStarPositions(stars);
  }, []);

  const features = [
    {
      title: 'Readings',
      description: 'Erstelle automatisierte Human Design Readings für deine Klienten. Wähle zwischen V3, Connection (Beziehungen), Penta (Gruppen) und Multi-Agent Readings. Alle Readings werden über Queue-Worker generiert.',
      icon: BookIcon,
      route: '/coach/readings',
      color: '#F29F05',
    },
    {
      title: 'Dashboard',
      description: 'Zentrale Übersicht aller Readings. Verwalte, durchsuche und exportiere Analysen für deine Klienten. Mit Filter- und Sortierfunktionen findest du schnell, was du brauchst.',
      icon: DashboardIcon,
      route: '/coach/dashboard',
      color: '#F29F05',
    },
    {
      title: 'AI Agents',
      description: 'Spezialisierte AI-Agenten für verschiedene Coaching-Bereiche: Business, Beziehungen, Krisen und mehr. Jeder Agent liefert tiefgehende Insights und strukturierte Berichte.',
      icon: AgentIcon,
      route: '/coach/agents',
      color: '#F29F05',
    },
    {
      title: 'V6 Features',
      description: 'Von der Analyse zur Transformation: AI-Coaching-Sessions, personalisierte Learning-Pfade (4-9 Wochen), Evolution-Tracker und praktische Übungen für nachhaltige Veränderung.',
      icon: SettingsIcon,
      route: '/coach/v6',
      color: '#F29F05',
      isNew: true,
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)
        `,
        backgroundAttachment: 'fixed',
        overflowX: 'hidden',
        pt: 0,
        pb: 8,
      }}
    >
      {/* Animierte Sterne im Hintergrund */}
      {mounted && starPositions.map((star, i) => (
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

      <Box sx={{ position: 'relative', zIndex: 100, pt: 0, mt: 0 }}>
        <CoachNavigation />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 2 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box sx={{ position: 'relative', width: { xs: '100%', md: 600 }, maxWidth: 600, height: { xs: 120, md: 180 }, mx: 'auto' }}>
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              🎯 Coach Dashboard
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Deine professionelle Human Design Coaching-Plattform: Automatisierte Readings, 
              spezialisierte AI-Agenten und V6 Transformations-Begleitung. 
              Alles integriert, alles automatisiert.
            </Typography>
          </Box>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(242, 159, 5, 0.1)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#F29F05',
              },
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              <strong>✨ NEU:</strong> V6 Features jetzt verfügbar! AI-Coaching-Sessions, Learning-Pfade 
              und Evolution-Tracking für nachhaltige Transformation deiner Klienten.
            </Typography>
          </Alert>
        </motion.div>

        {/* Features Grid */}
        <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 280,
                      position: 'relative',
                      cursor: 'pointer',
                      border: feature.isNew ? 2 : 1,
                      borderColor: feature.isNew ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(20, 20, 30, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: feature.isNew ? '0 8px 32px rgba(102, 126, 234, 0.3)' : '0 8px 32px rgba(242, 159, 5, 0.3)',
                        borderColor: feature.isNew ? '#667eea' : '#F29F05',
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            background: `${feature.color}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <feature.icon sx={{ fontSize: 32, color: feature.color }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              color: 'white',
                              fontWeight: 700,
                              mb: 0.5,
                            }}
                          >
                            {feature.title}
                          </Typography>
                          {feature.isNew && (
                            <Chip
                              label="NEU"
                              size="small"
                              sx={{
                                background: '#F29F05',
                                color: '#000',
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.6,
                          flexGrow: 1,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => router.push(feature.route)}
                        sx={{
                          mt: 'auto',
                          backgroundColor: '#F29F05',
                          color: '#0b0a0f',
                          fontWeight: 700,
                          '&:hover': {
                            backgroundColor: '#E08E04',
                          },
                        }}
                      >
                        Auswählen →
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card 
              sx={{ 
                mt: 4,
                backgroundColor: 'rgba(20, 20, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ffffff' }}>
                  🧬 The Connection Key - Coach Edition
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
                  <strong>Vollständig integrierte AI-Reading-Plattform:</strong>
                </Typography>
                
                <Box sx={{ pl: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'rgba(255, 255, 255, 0.8)' }}>
                    ✓ Automatische Reading-Generierung über Queue-Worker
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'rgba(255, 255, 255, 0.8)' }}>
                    ✓ BullMQ + Redis für zuverlässige Hintergrundverarbeitung
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'rgba(255, 255, 255, 0.8)' }}>
                    ✓ Multi-Agent System mit bis zu 7 parallelen AI-Agenten
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'rgba(255, 255, 255, 0.8)' }}>
                    ✓ V6 AI Coaching & Learning Paths für nachhaltige Transformation
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
  );
}

export default function CoachHomePage() {
  return (
    <CoachAuth requireCoach>
      <CoachHomeContent />
    </CoachAuth>
  );
}

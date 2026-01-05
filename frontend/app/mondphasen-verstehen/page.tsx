"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Tab,
  Tabs,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Moon, Star, Sparkles, TrendingUp, TrendingDown, Circle, ChevronRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const moonPhases = [
  {
    id: 'neumond',
    label: '🌑 Neumond',
    icon: Circle,
    color: '#F29F05',
    title: 'Neumond',
    subtitle: 'Neubeginn & Intention',
    description: 'Neubeginn, Intentionen setzen, frische Energie.',
    tips: [
      'Nutze den Neumond für Journaling',
      'Visualisiere deine Ziele',
      'Setze klare Intentionen',
      'Starte neue Projekte'
    ],
    ritual: 'Schreibe deine Wünsche und Ziele auf und bewahre sie an einem besonderen Ort auf.',
    keywords: ['Neuanfang', 'Klarheit', 'Vision', 'Planung']
  },
  {
    id: 'zunehmend',
    label: '🌒 Zunehmend',
    icon: TrendingUp,
    color: '#F29F05',
    title: 'Zunehmender Mond',
    subtitle: 'Wachstum & Aufbau',
    description: 'Wachstum, Projekte voranbringen, Motivation.',
    tips: [
      'Starte neue Projekte',
      'Pflege bestehende Routinen',
      'Bleibe aktiv und motiviert',
      'Baue Gewohnheiten auf'
    ],
    ritual: 'Mache täglich kleine Schritte zu deinen Zielen und dokumentiere deine Fortschritte.',
    keywords: ['Wachstum', 'Aufbau', 'Motivation', 'Aktion']
  },
  {
    id: 'vollmond',
    label: '🌕 Vollmond',
    icon: Moon,
    color: '#FFD700',
    title: 'Vollmond',
    subtitle: 'Höhepunkt & Manifestation',
    description: 'Höhepunkt, Klarheit, Manifestation, starke Emotionen.',
    tips: [
      'Feiere deine Erfolge',
      'Reflektiere über deinen Weg',
      'Meditiere und manifestiere',
      'Lasse Emotionen zu'
    ],
    ritual: 'Führe eine Vollmond-Meditation durch und schreibe auf, wofür du dankbar bist.',
    keywords: ['Höhepunkt', 'Klarheit', 'Emotion', 'Manifestation'],
    astroNote: 'Der Vollmond steht oft für starke Gefühle und kann zu Schlaflosigkeit führen.'
  },
  {
    id: 'abnehmend',
    label: '🌘 Abnehmend',
    icon: TrendingDown,
    color: '#8C1D04',
    title: 'Abnehmender Mond',
    subtitle: 'Loslassen & Reinigung',
    description: 'Loslassen, Reflexion, Reinigung, Abschluss.',
    tips: [
      'Entrümple physisch und mental',
      'Beende offene Themen',
      'Gönn dir Ruhe und Erholung',
      'Reflektiere und lerne'
    ],
    ritual: 'Verbrenne Zettel mit Dingen, die du loslassen möchtest, als Symbol der Transformation.',
    keywords: ['Loslassen', 'Reinigung', 'Reflexion', 'Abschluss']
  }
];

export default function MondphasenVerstehenPage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentPhase = moonPhases[activeTab];
  const Icon = currentPhase.icon;

  return (
    <Box sx={{
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
      width: '100%'
    }}>
      {/* Floating Stars Animation */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: 'rgba(242, 159, 5, 0.6)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
              '@keyframes twinkle': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' }
              }
            }}
          />
        ))}
      </Box>

      <PageLayout showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={8}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                🌙 Mondphasen verstehen
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 2,
                  maxWidth: { xs: '100%', md: 900 },
                  mx: 'auto',
                  px: { xs: 2, md: 0 },
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
                  fontWeight: 600,
                }}
              >
                Nutze die Kraft der Mondzyklen für deine persönliche Entwicklung
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  maxWidth: { xs: '100%', md: 800 },
                  mx: 'auto',
                  px: { xs: 2, md: 0 },
                  lineHeight: 1.7,
                  fontSize: { xs: '0.95rem', md: '1.2rem' },
                  fontWeight: 400,
                }}
              >
                Lebe im Einklang mit den natürlichen Rhythmen
              </Typography>
            </Box>
          </motion.div>

          {/* Tabs für Mondphasen */}
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            mb: 6,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
              border: '1px solid rgba(242, 159, 5, 0.4)'
            }
          }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 64,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  minHeight: 64,
                  px: { xs: 2, md: 3 },
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)'
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {moonPhases.map((phase) => (
                <Tab key={phase.id} label={phase.label} />
              ))}
            </Tabs>
          </Paper>

          {/* Phase Details Card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              mb: 6,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(242, 159, 5, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 25px 70px rgba(242, 159, 5, 0.3)',
                border: '1px solid rgba(242, 159, 5, 0.4)'
              }
            }}>
              <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentPhase.color}, rgba(242, 159, 5, 0.3))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 32px ${currentPhase.color}40`
                  }}>
                    <Icon size={40} color="white" />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{
                      color: 'white',
                      fontWeight: 900,
                      mb: 0.5,
                      fontSize: { xs: '1.75rem', md: '2.5rem' },
                      lineHeight: 1.2
                    }}>
                      {currentPhase.title}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: currentPhase.color,
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', md: '1.2rem' },
                      lineHeight: 1.7
                    }}>
                      {currentPhase.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  mb: 3, 
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', md: '1.1rem' }
                }}>
                  {currentPhase.description}
                </Typography>

                {/* Keywords */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {currentPhase.keywords.map((keyword) => (
                      <Chip
                        key={keyword}
                        label={keyword}
                        icon={<Sparkles size={16} />}
                        sx={{
                          background: 'rgba(242, 159, 5, 0.15)',
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#F29F05' }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Tips */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontWeight: 600, 
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
                    lineHeight: 1.6
                  }}>
                    💡 Praktische Tipps
                  </Typography>
                  <Grid container spacing={2}>
                    {currentPhase.tips.map((tip, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          borderRadius: 2,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.1)',
                            transform: 'translateY(-2px)',
                            border: '1px solid rgba(242, 159, 5, 0.4)'
                          }
                        }}>
                          <Star size={20} color="#F29F05" fill="#F29F05" />
                          <Typography variant="body1" sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            lineHeight: 1.6
                          }}>
                            {tip}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Ritual */}
                <Paper sx={{
                  background: 'rgba(242, 159, 5, 0.1)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 3,
                  p: 3,
                  mb: currentPhase.astroNote ? 3 : 0
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#F29F05', 
                    fontWeight: 600, 
                    mb: 1,
                    fontSize: { xs: '0.95rem', md: '1.2rem' },
                    lineHeight: 1.7
                  }}>
                    🔮 Ritual-Idee
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9rem', md: '1.1rem' }
                  }}>
                    {currentPhase.ritual}
                  </Typography>
                </Paper>

                {/* Astro Note (nur beim Vollmond) */}
                {currentPhase.astroNote && (
                  <Paper sx={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: 3,
                    p: 3
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#FFD700', 
                      fontWeight: 600, 
                      mb: 1,
                      fontSize: { xs: '0.95rem', md: '1.2rem' },
                      lineHeight: 1.7
                    }}>
                      ✨ Astro-Hinweis
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9rem', md: '1.1rem' }
                    }}>
                      {currentPhase.astroNote}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Allgemeine Hinweise */}
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            mb: 6,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(242, 159, 5, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 25px 70px rgba(242, 159, 5, 0.3)',
              border: '1px solid rgba(242, 159, 5, 0.4)'
            }
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 900, 
                mb: 3,
                fontSize: { xs: '1.5rem', md: '2rem' },
                lineHeight: 1.2
              }}>
                🌟 Die Kraft der Mondzyklen
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255, 255, 255, 0.75)', 
                mb: 3, 
                lineHeight: 1.8, 
                fontSize: { xs: '0.9rem', md: '1.1rem' }
              }}>
                Die Mondphasen sind ein natürlicher Rhythmus, der dich unterstützen kann, bewusster zu leben. 
                Viele Menschen nutzen sie für Rituale, Meditation und persönliche Entwicklung.
              </Typography>
              <Paper sx={{
                background: 'rgba(140, 29, 4, 0.15)',
                border: '1px solid rgba(140, 29, 4, 0.3)',
                borderRadius: 3,
                p: 3
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#8C1D04', 
                  fontWeight: 600, 
                  mb: 1,
                  fontSize: { xs: '0.95rem', md: '1.2rem' },
                  lineHeight: 1.7
                }}>
                  💫 Ritual-Tipp für den kompletten Zyklus
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', md: '1.1rem' }
                }}>
                  Schreibe zum <strong>Neumond</strong> deine Wünsche und Ziele auf. 
                  Arbeite während des <strong>zunehmenden Mondes</strong> aktiv daran. 
                  Feiere zum <strong>Vollmond</strong> deine Erfolge und reflektiere. 
                  Beim <strong>abnehmenden Mond</strong> verbrenne symbolisch, was du loslassen möchtest.
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(242, 159, 5, 0.2)',
            mb: 8,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 25px 70px rgba(242, 159, 5, 0.3)',
              border: '1px solid rgba(242, 159, 5, 0.4)'
            }
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 900, 
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' },
                lineHeight: 1.2
              }}>
                Entdecke deinen Mondkalender
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                mb: 4, 
                maxWidth: { xs: '100%', md: 800 },
                mx: 'auto',
                px: { xs: 2, md: 0 },
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.2rem' },
                fontWeight: 400
              }}>
                Sieh die aktuelle Mondphase und erhalte personalisierte Empfehlungen für jeden Tag
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Link href="/mondkalender" passHref>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ChevronRight />}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: '0 10px 30px rgba(242, 159, 5, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FFD700, #F29F05)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 40px rgba(242, 159, 5, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Zum Mondkalender
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                        transform: 'translateY(-4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Jetzt registrieren
                  </Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </PageLayout>
    </Box>
  );
}


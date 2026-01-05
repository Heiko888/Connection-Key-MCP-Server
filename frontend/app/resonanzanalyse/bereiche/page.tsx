"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '../../components/PageLayout';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  HeartHandshake,
  Baby,
  UserCircle,
  Briefcase,
  GraduationCap,
  UsersRound,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Bereich {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number | string }>;
  description: string;
  examples: string[];
  insights: string[];
  color: string;
  isPenta?: boolean;
  recommended?: boolean;
}

const bereiche: Bereich[] = [
  {
    id: 'partnerschaft',
    title: 'Partnerschaft / Beziehung',
    subtitle: 'Romantische Beziehung, Ehe, Partner',
    icon: HeartHandshake,
    description: 'Entdecke die energetische Verbindung in deiner romantischen Beziehung. Verstehe, wie eure Human Design Typen zusammenwirken und wo die tiefste Resonanz entsteht.',
    examples: ['Romantische Beziehung', 'Ehe', 'Lebenspartner', 'Dating'],
    insights: [
      'Wie eure Typen sich ergänzen',
      'Gemeinsame Channels und Golden Threads',
      'Kompatibilität der Strategien',
      'Energetische Dynamik im Alltag'
    ],
    color: '#F29F05'
  },
  {
    id: 'familie',
    title: 'Familie',
    subtitle: 'Eltern, Geschwister, Kinder',
    icon: Baby,
    description: 'Verstehe die familiären Bindungen aus Human Design Perspektive. Erkenne, wie die energetischen Strukturen in deiner Familie wirken und wo Wachstum möglich ist.',
    examples: ['Eltern', 'Geschwister', 'Kinder', 'Großeltern'],
    insights: [
      'Familiäre Energie-Dynamik',
      'Ererbte Muster verstehen',
      'Wachstumsmöglichkeiten',
      'Unterstützung und Ergänzung'
    ],
    color: '#8C1D04'
  },
  {
    id: 'freundschaft',
    title: 'Freundschaft',
    subtitle: 'Freunde, beste Freunde',
    icon: UserCircle,
    description: 'Erforsche die Resonanz in deinen Freundschaften. Lerne, warum manche Freundschaften natürlich fließen und andere mehr Aufmerksamkeit brauchen.',
    examples: ['Beste Freunde', 'Freundeskreis', 'Weggefährten', 'Seelenfreunde'],
    insights: [
      'Natürliche Verbindungen',
      'Gegenseitige Unterstützung',
      'Wachstum durch Freundschaft',
      'Energetische Kompatibilität'
    ],
    color: '#F29F05'
  },
  {
    id: 'business',
    title: 'Business / Kollegen',
    subtitle: 'Geschäftspartner, Kollegen, Team',
    icon: Briefcase,
    description: 'Optimiere deine beruflichen Beziehungen. Verstehe die energetische Dynamik in deinem Team und wie verschiedene Typen am besten zusammenarbeiten.',
    examples: ['Geschäftspartner', 'Kollegen', 'Team-Mitglieder', 'Vorgesetzte'],
    insights: [
      'Effektive Zusammenarbeit',
      'Komplementäre Stärken',
      'Team-Dynamik verstehen',
      'Berufliche Synergien'
    ],
    color: '#8C1D04'
  },
  {
    id: 'mentoring',
    title: 'Mentoring / Coaching',
    subtitle: 'Mentor, Coach, Lehrer',
    icon: GraduationCap,
    description: 'Erkenne die Lern- und Wachstumsdynamik in Mentoring-Beziehungen. Verstehe, wie Wissen und Weisheit optimal übertragen werden.',
    examples: ['Mentor', 'Coach', 'Lehrer', 'Ausbilder'],
    insights: [
      'Lern-Dynamik verstehen',
      'Wissensübertragung optimieren',
      'Wachstumsfelder identifizieren',
      'Mentoring-Erfolg steigern'
    ],
    color: '#F29F05'
  },
  {
    id: 'team',
    title: 'Penta / Team-Analyse',
    subtitle: 'Gruppenresonanzanalyse für 3-5 Personen',
    icon: UsersRound,
    description: 'Entdecke die energetische Dynamik innerhalb eurer Gruppe. Perfekt für Teams, Familiengruppen, Freundeskreise oder jedes Feld ab 3 Personen. Du erhältst: Klare Analyse der Gruppenenergie (Penta), Aufdeckung von Spannungen & fehlenden Energien, Rollenverteilung & Gruppenpotenzial, Empfehlungen für Harmonie, Flow & Zusammenarbeit.',
    examples: ['Teams', 'Familiengruppen', 'Arbeitsgruppen', 'Freundeskreise'],
    insights: [
      'Penta-Gruppenenergie verstehen',
      'Rollenverteilung & Gruppenpotenzial',
      'Spannungen & fehlende Energien aufdecken',
      'Harmonie, Flow & Zusammenarbeit fördern'
    ],
    color: '#F29F05',
    isPenta: true,
    recommended: true
  }
];

export default function ResonanzanalyseBereichePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(242, 159, 5, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(140, 29, 4, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(242, 159, 5, 0.08) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #1a1820 50%, #0b0a0f 100%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Planetarischer Hintergrund - Sterne */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(242, 159, 5, 0.8)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Planetarischer Hintergrund - Orbit-Kreise */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${400 + i * 300}px`,
            height: `${400 + i * 300}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${30 + i * 20}%`,
            top: `${20 + i * 15}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Planetarischer Hintergrund - Pulsierende Planeten */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.3 - i * 0.05}), rgba(140, 29, 4, ${0.2 - i * 0.03}))`,
            left: `${15 + i * 15}%`,
            top: `${10 + i * 18}%`,
            pointerEvents: 'none',
            zIndex: 0,
            boxShadow: `0 0 ${20 + i * 10}px rgba(242, 159, 5, 0.4)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i * 1.5,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <PageLayout showLogo={true} maxWidth="lg">
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              Wähle den Bereich für deine Resonanzanalyse
            </Typography>
            <Typography variant="h6" sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}>
              Jeder Bereich hat seine eigene energetische Dynamik. Entdecke, wie Human Design dir hilft, 
              die Verbindungen in verschiedenen Lebensbereichen zu verstehen.
            </Typography>
          </Box>
        </motion.div>

        {/* Grundlegende Erklärung */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 6,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)'
              }}>
                <Sparkles size={40} color="white" />
              </Box>
              <Typography variant="h4" sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Was ist eine Resonanzanalyse?
              </Typography>
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🧬</Box>
                    Die energetische Verbindung
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Eine Resonanzanalyse zeigt dir, wie die energetischen Strukturen zweier Menschen 
                    zusammenwirken. Sie offenbart, wo natürliche Verbindungen entstehen, wo sich Energien 
                    ergänzen und wo Herausforderungen liegen können.
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🩵</Box>
                    Connection Keys & Golden Threads
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Die Analyse identifiziert <strong style={{ color: '#F29F05' }}>Connection Keys</strong> – 
                    Kanäle, die durch eure Verbindung aktiviert werden – und <strong style={{ color: '#F29F05' }}>Golden Threads</strong> – 
                    vollständige Kanäle, die nur durch eure Begegnung entstehen.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}>
                    <Box sx={{ fontSize: '1.5rem' }}>⚡</Box>
                    Warum der Bereich wichtig ist
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Jeder Lebensbereich – Partnerschaft, Familie, Freundschaft, Business – hat seine eigene 
                    energetische Dynamik. Die Resonanzanalyse passt sich an den Kontext an und zeigt dir 
                    spezifische Erkenntnisse für deine Situation.
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}>
                    <Box sx={{ fontSize: '1.5rem' }}>🎯</Box>
                    Was du daraus gewinnst
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}>
                    Verstehe die tiefere Ebene eurer Beziehung, erkenne Wachstumsmöglichkeiten, 
                    optimiere eure Kommunikation und nutze eure gemeinsamen Stärken bewusster. 
                    Die Analyse gibt dir Klarheit und praktische Handlungsempfehlungen.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{
              mt: 4,
              p: 3,
              background: 'rgba(242, 159, 5, 0.1)',
              borderRadius: 3,
              border: '1px solid rgba(242, 159, 5, 0.3)'
            }}>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.8,
                textAlign: 'center',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontStyle: 'italic'
              }}>
                <strong style={{ color: '#F29F05' }}>Tipp:</strong> Die Resonanzanalyse funktioniert am besten, 
                wenn du die genauen Geburtsdaten (Datum, Uhrzeit, Ort) beider Personen hast. 
                Je präziser die Daten, desto detaillierter die Analyse.
              </Typography>
            </Box>
          </Card>
        </motion.div>

        {/* Bereiche Überschrift */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Box sx={{
                width: 4,
                height: 40,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                borderRadius: 2
              }} />
              Die 6 Bereiche im Überblick
              <Box sx={{
                width: 4,
                height: 40,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                borderRadius: 2
              }} />
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              Wähle den Bereich, der für dich am relevantesten ist
            </Typography>
          </Box>
        </motion.div>

        {/* Bereiche Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {bereiche.map((bereich, index) => (
            <Grid item xs={12} sm={6} md={4} key={bereich.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: bereich.isPenta 
                      ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(140, 29, 4, 0.15) 100%)'
                      : 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: bereich.isPenta 
                      ? '2px solid rgba(242, 159, 5, 0.6)'
                      : '1px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    height: '100%',
                    boxShadow: bereich.isPenta 
                      ? '0 8px 32px rgba(242, 159, 5, 0.4), 0 0 20px rgba(242, 159, 5, 0.2)'
                      : '0 4px 20px rgba(242, 159, 5, 0.1)',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: bereich.isPenta
                        ? '0 12px 48px rgba(242, 159, 5, 0.5), 0 0 30px rgba(242, 159, 5, 0.3)'
                        : '0 10px 40px rgba(242,159,5,0.3)',
                      borderColor: '#F29F05'
                    },
                    '&::before': bereich.isPenta ? {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      borderRadius: 4,
                      zIndex: -1,
                      opacity: 0.3,
                      filter: 'blur(8px)',
                    } : {}
                  }}
                >
                  {bereich.recommended && (
                    <Chip
                      label="⭐ Empfohlen"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        zIndex: 1,
                        boxShadow: '0 4px 12px rgba(242, 159, 5, 0.4)'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3, textAlign: bereich.isPenta ? 'left' : 'center' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mb: 2,
                      color: bereich.isPenta ? '#F29F05' : 'rgba(255,255,255,0.7)'
                    }}>
                      {React.createElement(bereich.icon, { size: 48 })}
                    </Box>
                    <Typography variant="h6" sx={{ 
                      color: 'white', 
                      fontWeight: bereich.isPenta ? 700 : 600, 
                      mb: 1,
                      fontSize: bereich.isPenta ? '1.25rem' : '1.1rem',
                      textAlign: bereich.isPenta ? 'left' : 'center'
                    }}>
                      {bereich.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: bereich.isPenta ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)', 
                      mb: 2,
                      fontWeight: bereich.isPenta ? 600 : 400,
                      textAlign: bereich.isPenta ? 'left' : 'center'
                    }}>
                      {bereich.subtitle}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.85)', 
                      lineHeight: 1.6,
                      fontSize: '0.9rem',
                      textAlign: bereich.isPenta ? 'left' : 'center'
                    }}>
                      {bereich.description}
                    </Typography>
                    {bereich.isPenta && (
                      <Box sx={{
                        mt: 2,
                        p: 2,
                        background: 'rgba(242, 159, 5, 0.15)',
                        borderRadius: 2,
                        border: '1px solid rgba(242, 159, 5, 0.3)'
                      }}>
                        <Typography variant="caption" sx={{
                          color: '#F29F05',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          display: 'block',
                          mb: 0.5
                        }}>
                          💡 Ideal für:
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.85rem'
                        }}>
                          Teams, Familiengruppen, Arbeitsgruppen, Freundeskreise
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
          }}>
            <Box sx={{ fontSize: '3rem', mb: 2 }}>✨</Box>
            <Typography variant="h5" sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2
            }}>
              Bereit für deine Resonanzanalyse?
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 3,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.8
            }}>
              Wähle einen Bereich aus und starte deine persönliche Connection Key Analyse. 
              Entdecke die energetische Verbindung zwischen dir und anderen.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Sparkles size={20} />}
              onClick={() => router.push('/connection-key/booking')}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zur Connection Key Analyse
            </Button>
          </Card>
        </motion.div>
        </Container>
      </PageLayout>
    </Box>
  );
}


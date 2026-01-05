"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Container,
  Divider
} from '@mui/material';
import { 
  Heart, 
  Users, 
  Star, 
  Zap,
  BookOpen,
  Sparkles,
  Target,
  TrendingUp,
  Pentagon,
  Key,
  ArrowRight
} from 'lucide-react';
import { Button } from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicHeader from '../components/PublicHeader';
import Logo from '../components/Logo';

export default function RelationshipsPage() {
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, width: number, height: number, opacity: number, duration: number, delay: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generiere Sterne-Positionen nur auf dem Client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStarPositions(stars);
  }, []);

  const sections = [
    {
      icon: <Zap size={32} />,
      title: "Energetische Resonanzanalyse",
      color: "#F29F05",
      description: "Die Resonanzanalyse zeigt, wie die Energiezentren zweier Menschen miteinander interagieren. Sie offenbart, wo echte Verbindung entsteht und wo Herausforderungen liegen.",
      details: [
        "Vergleich der definierten und undefinierten Zentren beider Personen",
        "Analyse der energetischen Anziehung und Abstoßung",
        "Identifikation von Komplementarität und Spannung",
        "Verständnis der emotionalen und mentalen Dynamiken",
        "Erkennung von Wachstums-Potenzialen in der Beziehung"
      ],
      examples: [
        "Definierte Zentren aktivieren undefinierte Zentren des Partners",
        "Gleiche Definitionen schaffen Verständnis und Harmonie",
        "Verschiedene Definitionen können zu Spannung führen",
        "Undefinierte Zentren lernen durch definierte Zentren"
      ]
    },
    {
      icon: <Key size={32} />,
      title: "Connection Key Analyse",
      color: "#F29F05",
      description: "Der Connection Key zeigt die tiefere energetische Verbindung zwischen Menschen. Er offenbart, ob eine Beziehung auf echter Resonanz oder auf Konditionierung basiert.",
      details: [
        "Identifikation der energetischen Signatur der Beziehung",
        "Unterscheidung zwischen echter Resonanz und Trauma-Anziehung",
        "Erkennung der natürlichen Dynamik und Rollen",
        "Verständnis der gemeinsamen Wachstums-Themen",
        "Analyse der Kommunikations- und Interaktionsmuster"
      ],
      examples: [
        "Echte Resonanz: Natürliche Anziehung ohne Drama",
        "Trauma-Anziehung: Intensive, aber ungesunde Verbindungen",
        "Komplementäre Energien: Gegenseitige Ergänzung",
        "Spiegelung: Wachstums-Chancen durch den Partner"
      ]
    },
    {
      icon: <Pentagon size={32} />,
      title: "Penta-Analyse - Gruppenenergie",
      color: "#F29F05",
      description: "Die Penta-Analyse zeigt, wie kleine Gruppen (3-5 Personen) eine eigene energetische Identität entwickeln. Sie erklärt, warum manche Teams harmonisch funktionieren und andere nicht.",
      details: [
        "Berechnung der Penta-Struktur aus allen Gruppenmitgliedern",
        "Identifikation der Gruppen-Identität und -Rollen",
        "Erkennung von energetischen Mustern in der Gruppe",
        "Verständnis der Gruppen-Dynamiken und -Themen",
        "Empfehlungen für harmonische Zusammenarbeit"
      ],
      examples: [
        "Familien-Penta: Dynamiken zwischen Familienmitgliedern",
        "Team-Penta: Arbeitsgruppen und ihre Energie",
        "Freundeskreis-Penta: Soziale Gruppen und ihre Muster",
        "Romantische Penta: Paare in ihrem sozialen Umfeld"
      ]
    },
    {
      icon: <Users size={32} />,
      title: "Typ-Kompatibilität & Strategien",
      color: "#F29F05",
      description: "Jeder Human Design Typ hat eine spezifische Strategie und Autorität. Die Analyse zeigt, wie verschiedene Typen optimal miteinander interagieren können.",
      details: [
        "Kompatibilität zwischen Generatoren, Manifestierenden Generatoren, Manifestoren, Projektoren und Reflektoren",
        "Verständnis der unterschiedlichen Strategien und Autoritäten",
        "Erkennung von natürlichen Rollen in der Beziehung",
        "Respekt für verschiedene Energie-Typen",
        "Empfehlungen für authentische Interaktion"
      ],
      examples: [
        "Generator + Projektor: Natürliche Ergänzung",
        "Manifestor + Generator: Dynamische Verbindung",
        "Reflektor: Spiegel für die Gruppe",
        "Jeder Typ bringt einzigartige Qualitäten ein"
      ]
    }
  ];

  const benefits = [
    {
      title: "Echte Resonanz erkennen",
      description: "Verstehe den Unterschied zwischen echter energetischer Resonanz und konditionierter Anziehung. Erkenne, welche Beziehungen wirklich zu dir passen."
    },
    {
      title: "Authentische Kommunikation",
      description: "Lerne, wie du mit verschiedenen Human Design Typen optimal kommunizierst und interagierst, basierend auf ihren natürlichen Strategien."
    },
    {
      title: "Beziehungen bewusst gestalten",
      description: "Nutze die Erkenntnisse aus deiner Beziehungs-Analyse, um Beziehungen bewusst zu gestalten und Herausforderungen konstruktiv anzugehen."
    },
    {
      title: "Wachstum durch Beziehungen",
      description: "Verstehe, welche Lektionen und Wachstums-Chancen in deinen Beziehungen liegen und wie du sie optimal nutzen kannst."
    }
  ];

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
      pt: { xs: 4, md: 6 },
      pb: 8,
    }}>
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.width}px`,
            height: `${star.height}px`,
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
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
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

      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>

        {/* Hero-Bereich */}
        <Box sx={{ 
          mb: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          py: { xs: 4, md: 6 }
        }}>
          {/* Animierte Gold-Verläufe im Hintergrund */}
          {mounted && Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`glow-${i}`}
              style={{
                position: 'absolute',
                width: `${400 + i * 200}px`,
                height: `${400 + i * 200}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(242, 159, 5, ${0.15 - i * 0.04}), transparent)`,
                left: `${30 + i * 20}%`,
                top: `${-20 + i * 10}%`,
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i * 1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mini-Illustration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              <Box sx={{
                width: { xs: 80, md: 100 },
                height: { xs: 80, md: 100 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                border: '3px solid rgba(242, 159, 5, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(242, 159, 5, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.1))',
                  filter: 'blur(12px)',
                  zIndex: -1,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.1)' }
                  }
                }
              }}>
                <Heart size={48} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
              </Box>
            </motion.div>

            <Typography variant="h1" sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '0.02em',
              lineHeight: 1.2
            }}>
              Beziehungs-Analyse
            </Typography>
            
            {/* Zweizeilige Subline */}
            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              <Typography variant="h5" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                mb: 1,
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.4rem' }
              }}>
                Entdecke die energetischen Verbindungen zwischen Menschen.
              </Typography>
              <Typography variant="h5" sx={{ 
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.3rem' },
                fontStyle: 'italic'
              }}>
                Human Design, Connection Key & Penta-Analyse.
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Was ist eine Beziehungs-Analyse? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(242, 159, 5, 0.4)',
            borderRadius: 4,
            mb: 6,
            p: { xs: 3, md: 4 },
            boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(242, 159, 5, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(242, 159, 5, 0.4)',
                mr: 2
              }}>
                <BookOpen size={26} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              </Box>
              <Typography variant="h4" sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}>
                Was ist eine Beziehungs-Analyse?
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.8, mb: 3, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Eine Beziehungs-Analyse im Human Design zeigt, wie die energetischen Muster zweier oder mehrerer Menschen zusammenwirken. 
              Sie geht über oberflächliche Kompatibilität hinaus und offenbart die tiefere energetische Verbindung – oder das Fehlen davon.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.8, mb: 3, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Durch die Analyse der Human Design Charts aller beteiligten Personen können wir verstehen, wie ihre Energiezentren, Typen und Strategien interagieren. 
              Der <strong style={{ color: '#F29F05' }}>Connection Key</strong> zeigt dabei, ob eine Beziehung auf echter Resonanz oder auf konditionierter Anziehung basiert.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Die <strong style={{ color: '#F29F05' }}>Penta-Analyse</strong> erweitert dies auf Gruppen und zeigt, wie kleine Gruppen (3-5 Personen) eine eigene energetische Identität entwickeln, 
              die jeden einzelnen in der Gruppe beeinflusst.
            </Typography>
          </Card>
        </motion.div>

        {/* Methoden der Beziehungs-Analyse */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 4, md: 6 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Key size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography variant="h3" sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.4rem' }
              }}>
                Methoden der Beziehungs-Analyse
              </Typography>
              <Key size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Grid container spacing={4}>
            {sections.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                    backdropFilter: 'blur(25px)',
                    borderRadius: 4,
                    border: '2px solid rgba(242, 159, 5, 0.4)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #F29F05, #8C1D04, #F29F05)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s ease-in-out infinite',
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '200% 0' },
                        '100%': { backgroundPosition: '-200% 0' }
                      }
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 50px rgba(242, 159, 5, 0.35)',
                      borderColor: 'rgba(242, 159, 5, 0.6)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'rgba(242, 159, 5, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 20px rgba(242, 159, 5, 0.3)',
                          mr: 2
                        }}>
                          <Box sx={{ color: section.color }}>
                            {section.icon}
                          </Box>
                        </Box>
                        <Typography variant="h5" sx={{ 
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 800,
                          fontSize: { xs: '1.4rem', md: '1.7rem' }
                        }}>
                          {section.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', mb: 3, lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.05rem' } }}>
                        {section.description}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: 'rgba(242, 159, 5, 0.3)' }} />

                      <Typography variant="h6" sx={{ 
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2, 
                        fontWeight: 700, 
                        fontSize: '1.1rem' 
                      }}>
                        Was beinhaltet diese Methode?
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                        {section.details.map((detail, detailIndex) => (
                          <Typography 
                            key={detailIndex}
                            component="li" 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.85)', 
                              mb: 1,
                              lineHeight: 1.7,
                              fontSize: '0.95rem'
                            }}
                          >
                            {detail}
                          </Typography>
                        ))}
                      </Box>

                      <Typography variant="h6" sx={{ 
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2, 
                        fontWeight: 700, 
                        fontSize: '1.1rem' 
                      }}>
                        Beispiele:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        {section.examples.map((example, exampleIndex) => (
                          <Typography 
                            key={exampleIndex}
                            component="li" 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.75)', 
                              mb: 1,
                              lineHeight: 1.7,
                              fontSize: '0.9rem',
                              fontStyle: 'italic'
                            }}
                          >
                            {example}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Vorteile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(242, 159, 5, 0.4)',
            borderRadius: 4,
            mb: 6,
            p: { xs: 3, md: 4 },
            boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(242, 159, 5, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(242, 159, 5, 0.4)',
                mr: 2
              }}>
                <Sparkles size={26} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              </Box>
              <Typography variant="h4" sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}>
                Was bringt dir eine Beziehungs-Analyse?
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(242, 159, 5, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(242, 159, 5, 0.3)',
                      mr: 2,
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      <Target size={20} color="#F29F05" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1, 
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </motion.div>

        {/* Abschluss */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(242, 159, 5, 0.4)',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)'
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(242, 159, 5, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(242, 159, 5, 0.4)',
              mx: 'auto',
              mb: 3
            }}>
              <TrendingUp size={32} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
            </Box>
            <Typography variant="h5" sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2, 
              fontWeight: 800,
              fontSize: { xs: '1.5rem', md: '1.8rem' }
            }}>
              Beginne deine Beziehungs-Reise
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.8, maxWidth: '600px', mx: 'auto', mb: 4, fontSize: { xs: '1rem', md: '1.05rem' } }}>
              Eine Beziehungs-Analyse im Human Design kann dir helfen, deine Beziehungen auf einer tiefen energetischen Ebene zu verstehen. 
              Ob romantische Partnerschaften, Freundschaften, Familienbeziehungen oder Teams – der <strong style={{ color: '#F29F05' }}>Connection Key</strong> und die <strong style={{ color: '#F29F05' }}>Penta-Analyse</strong> bieten wertvolle Einblicke in die energetischen Verbindungen zwischen Menschen.
            </Typography>
            <Button
              component={Link}
              href="/resonanzanalyse"
              variant="contained"
              endIcon={<ArrowRight size={20} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: { xs: 4, md: 6 },
                py: { xs: 1.5, md: 2 },
                borderRadius: 3,
                fontSize: { xs: '1rem', md: '1.1rem' },
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.3s ease'
              }}
            >
              Jetzt Analyse buchen
            </Button>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

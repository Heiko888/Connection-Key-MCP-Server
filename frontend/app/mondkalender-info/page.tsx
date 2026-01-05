"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack
} from '@mui/material';
import { 
  Moon, 
  Calendar,
  Zap,
  Heart,
  Brain,
  Shield,
  Target,
  Sparkles,
  Activity,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

export default function MondkalenderInfo() {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <Moon size={32} />,
      title: "Mondphasen-Tracking",
      description: "Verfolge alle 8 Mondphasen in Echtzeit mit präzisen Zeitangaben",
      details: [
        "Neumond - Neubeginn und Intentionen setzen",
        "Zunehmender Mond - Wachstum und Manifestation",
        "Vollmond - Höhepunkt und Vollendung",
        "Abnehmender Mond - Loslassen und Reflektion"
      ],
      image: "🌙",
      color: "#F29F05"
    },
    {
      icon: <Calendar size={32} />,
      title: "Persönlicher Mondkalender",
      description: "Individueller Kalender basierend auf deinem Geburtsort und -zeit",
      details: [
        "Lokale Mondzeiten für deinen Standort",
        "Persönliche Mondzyklen und Rhythmen",
        "Optimale Zeiten für verschiedene Aktivitäten",
        "Mondkalender-Export für andere Apps"
      ],
      image: "📅",
      color: "#FFD700"
    },
    {
      icon: <Brain size={32} />,
      title: "Mond-Energie-Analyse",
      description: "Verstehe, wie der Mond deine Energie und Stimmung beeinflusst",
      details: [
        "Energetische Auswirkungen auf deinen Typ",
        "Optimale Zeiten für Entscheidungen",
        "Mond-basierte Stimmungsvorhersagen",
        "Persönliche Energie-Rhythmen"
      ],
      image: "🧠",
      color: "#F29F05"
    },
    {
      icon: <Heart size={32} />,
      title: "Beziehungs-Harmonie",
      description: "Verstehe, wie Mondphasen deine Beziehungen beeinflussen",
      details: [
        "Kompatible Mondphasen für Dates",
        "Optimale Zeiten für wichtige Gespräche",
        "Mond-basierte Beziehungsberatung",
        "Harmonie zwischen Partnern"
      ],
      image: "💕",
      color: "#8C1D04"
    },
    {
      icon: <Zap size={32} />,
      title: "Manifestations-Unterstützung",
      description: "Nutze die Kraft des Mondes für deine Ziele und Wünsche",
      details: [
        "Neumond-Rituale für neue Projekte",
        "Vollmond-Energie für Durchbrüche",
        "Mond-basierte Affirmationen",
        "Manifestations-Tracking"
      ],
      image: "⚡",
      color: "#FFD700"
    },
    {
      icon: <Activity size={32} />,
      title: "Gesundheit & Wellness",
      description: "Optimiere deine Gesundheit mit dem Mondrhythmus",
      details: [
        "Beste Zeiten für Fasten und Entgiftung",
        "Mond-basierte Ernährungsempfehlungen",
        "Optimale Trainingszeiten",
        "Schlafqualität und Mondphasen"
      ],
      image: "💪",
      color: "#F29F05"
    }
  ];

  const moonPhases = [
    {
      name: "Neumond",
      emoji: "🌑",
      description: "Zeit für Neubeginn und Intentionen",
      activities: ["Ziele setzen", "Meditation", "Planung", "Reflektion"],
      color: "#F29F05"
    },
    {
      name: "Zunehmender Sichelmond",
      emoji: "🌒",
      description: "Energie sammeln und erste Schritte",
      activities: ["Lernen", "Forschung", "Vorbereitung", "Netzwerken"],
      color: "#F29F05"
    },
    {
      name: "Erstes Viertel",
      emoji: "🌓",
      description: "Aktion und Entscheidungen treffen",
      activities: ["Handeln", "Entscheiden", "Probleme lösen", "Durchsetzen"],
      color: "#F29F05"
    },
    {
      name: "Zunehmender Gibbous",
      emoji: "🌔",
      description: "Anpassungen und Verfeinerungen",
      activities: ["Anpassen", "Verfeinern", "Korrigieren", "Optimieren"],
      color: "#FFD700"
    },
    {
      name: "Vollmond",
      emoji: "🌕",
      description: "Höhepunkt und Vollendung",
      activities: ["Feiern", "Ernten", "Vollenden", "Manifestieren"],
      color: "#FFD700"
    },
    {
      name: "Abnehmender Gibbous",
      emoji: "🌖",
      description: "Dankbarkeit und Teilen",
      activities: ["Danken", "Teilen", "Lehren", "Geben"],
      color: "#8C1D04"
    },
    {
      name: "Letztes Viertel",
      emoji: "🌗",
      description: "Loslassen und Vergebung",
      activities: ["Loslassen", "Vergeben", "Aufräumen", "Entgiften"],
      color: "#8C1D04"
    },
    {
      name: "Abnehmender Sichelmond",
      emoji: "🌘",
      description: "Ruhe und Regeneration",
      activities: ["Ruhen", "Regenerieren", "Reflektieren", "Vorbereiten"],
      color: "#8C1D04"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp size={24} />,
      title: "Bessere Entscheidungen",
      description: "Treffe wichtige Entscheidungen zur optimalen Mondzeit"
    },
    {
      icon: <Shield size={24} />,
      title: "Natürlicher Rhythmus",
      description: "Lebe im Einklang mit den natürlichen Zyklen"
    },
    {
      icon: <Target size={24} />,
      title: "Erfolgreichere Ziele",
      description: "Nutze die Mondenergie für deine Manifestationen"
    },
    {
      icon: <Heart size={24} />,
      title: "Harmonische Beziehungen",
      description: "Verstehe die Mond-Einflüsse auf deine Beziehungen"
    }
  ];

  const useCases = [
    {
      category: "Business & Karriere",
      icon: <TrendingUp size={20} />,
      examples: [
        "Neumond: Neue Projekte starten",
        "Zunehmender Mond: Verhandlungen führen",
        "Vollmond: Präsentationen halten",
        "Abnehmender Mond: Alte Projekte abschließen"
      ]
    },
    {
      category: "Gesundheit & Wellness",
      icon: <Activity size={20} />,
      examples: [
        "Neumond: Entgiftungsprogramme beginnen",
        "Zunehmender Mond: Muskelaufbau-Training",
        "Vollmond: Intensives Cardio-Training",
        "Abnehmender Mond: Entspannung und Regeneration"
      ]
    },
    {
      category: "Beziehungen & Liebe",
      icon: <Heart size={20} />,
      examples: [
        "Neumond: Neue Beziehungen beginnen",
        "Zunehmender Mond: Vertiefung bestehender Beziehungen",
        "Vollmond: Romantische Dates und Intimität",
        "Abnehmender Mond: Konflikte lösen und vergeben"
      ]
    },
    {
      category: "Spiritualität & Wachstum",
      icon: <Sparkles size={20} />,
      examples: [
        "Neumond: Meditation und Intentionen setzen",
        "Zunehmender Mond: Lernen und Studieren",
        "Vollmond: Rituale und Manifestationen",
        "Abnehmender Mond: Loslassen und Reflektion"
      ]
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <Moon size={48} color="#F29F05" />
                <Typography variant="h2" sx={{ 
                  fontWeight: 800, 
                  ml: 2,
                  background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(242, 159, 5, 0.3)',
                  fontSize: { xs: '2rem', md: '3.5rem' }
                }}>
                  Mondkalender
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                🌙 Dein persönlicher Begleiter durch die Mondzyklen
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 800, mx: 'auto', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Entdecke die Kraft des Mondes für dein Leben. Nutze die natürlichen Rhythmen für bessere Entscheidungen, 
                harmonische Beziehungen und erfolgreiche Manifestationen.
              </Typography>
            </Box>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography variant="h3" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700 }}>
              ✨ Alle Funktionen im Überblick
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid rgba(242, 159, 5, 0.3)`,
                      borderRadius: 4,
                      height: '100%',
                      transition: 'all 0.4s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 60px rgba(242, 159, 5, 0.3)`,
                        border: `1px solid rgba(242, 159, 5, 0.5)`
                      }
                    }}>
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
                        {/* Großes Emoji-Bild oben */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <motion.div
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: index * 0.3
                            }}
                          >
                            <Typography variant="h1" sx={{ 
                              fontSize: '4rem',
                              filter: 'drop-shadow(0 0 15px rgba(242, 159, 5, 0.3))',
                              mb: 1
                            }}>
                              {feature.image}
                            </Typography>
                          </motion.div>
                        </Box>
                        
                        {/* Icon und Titel */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            background: `rgba(242, 159, 5, 0.1)`,
                            border: `1px solid rgba(242, 159, 5, 0.3)`,
                            mr: 3,
                            backdropFilter: 'blur(5px)'
                          }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="h5" sx={{ 
                            color: 'white', 
                            fontWeight: 700
                          }}>
                            {feature.title}
                          </Typography>
                        </Box>
                        
                        <Typography sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          mb: 3, 
                          lineHeight: 1.6,
                          fontSize: '1rem'
                        }}>
                          {feature.description}
                        </Typography>
                        
                        <List dense>
                          {feature.details.map((detail, detailIndex) => (
                            <ListItem key={detailIndex} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle size={16} color="#F29F05" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={detail}
                                sx={{ 
                                  '& .MuiListItemText-primary': { 
                                    color: 'rgba(255,255,255,0.95)',
                                    fontSize: '0.9rem'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Moon Phases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Typography variant="h3" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700 }}>
              🌙 Die 8 Mondphasen verstehen
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 8 }}>
              {moonPhases.map((phase, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid rgba(242, 159, 5, 0.3)`,
                      borderRadius: 4,
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      transition: 'all 0.4s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 60px rgba(242, 159, 5, 0.3)`,
                        border: `1px solid rgba(242, 159, 5, 0.5)`
                      }
                    }}>
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 6, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        <Typography variant="h2" sx={{ 
                          mb: 2, 
                          fontSize: '3.5rem',
                          filter: 'drop-shadow(0 0 10px rgba(242, 159, 5, 0.3))'
                        }}>
                          {phase.emoji}
                        </Typography>
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        color: phase.color, 
                        fontWeight: 700, 
                        mb: 2
                      }}>
                        {phase.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.9)', 
                        mb: 3, 
                        lineHeight: 1.6
                      }}>
                        {phase.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {phase.activities.map((activity, activityIndex) => (
                          <Chip
                            key={activityIndex}
                            label={activity}
                            size="small"
                            sx={{
                              background: `rgba(242, 159, 5, 0.15)`,
                              color: '#F29F05',
                              border: `1px solid rgba(242, 159, 5, 0.3)`,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backdropFilter: 'blur(5px)',
                              '&:hover': {
                                background: `rgba(242, 159, 5, 0.25)`,
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Typography variant="h3" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700 }}>
              🎯 Deine Vorteile
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Paper sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 4,
                      p: 4,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        border: '1px solid rgba(242, 159, 5, 0.5)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.2)'
                      }
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: 'rgba(242, 159, 5, 0.1)',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        mr: 3
                      }}>
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                          {benefit.title}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Typography variant="h3" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700 }}>
              💡 Praktische Anwendungen
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {useCases.map((useCase, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 4,
                      height: '100%',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.2)',
                        border: '1px solid rgba(242, 159, 5, 0.5)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            background: 'rgba(242, 159, 5, 0.1)',
                            border: '1px solid rgba(242, 159, 5, 0.3)',
                            mr: 2
                          }}>
                            {useCase.icon}
                          </Box>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                            {useCase.category}
                          </Typography>
                        </Box>
                        
                        <List dense>
                          {useCase.examples.map((example, exampleIndex) => (
                            <ListItem key={exampleIndex} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <ArrowRight size={16} color="#F29F05" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={example}
                                sx={{ 
                                  '& .MuiListItemText-primary': { 
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: '0.9rem'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(242, 159, 5, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 25px 70px rgba(242, 159, 5, 0.3)',
                border: '1px solid rgba(242, 159, 5, 0.5)'
              }
            }}>
              <Typography variant="h3" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                🌙 Starte deine Mondreise
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                Entdecke die Kraft des Mondes für dein Leben. Nutze die natürlichen Rhythmen 
                für bessere Entscheidungen und ein harmonischeres Leben.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  component={Link}
                  href="/mondkalender"
                  variant="contained"
                  size="large"
                  endIcon={<ChevronRight />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                    color: 'white',
                    fontWeight: 700,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.1rem',
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
                  <Moon size={24} style={{ marginRight: 8 }} />
                  Zum Mondkalender
                </Button>
                
                <Button
                  component={Link}
                  href="/memberships"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    fontWeight: 700,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.1rem',
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
              </Stack>
            </Card>
          </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

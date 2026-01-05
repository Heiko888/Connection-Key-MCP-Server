"use client";

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Moon, Users, MessageCircle, BookOpen, 
  Zap, Brain, Star, Settings, ArrowRight, 
  Target, TrendingUp 
} from 'lucide-react';

const appFunctions = [
  {
    title: "Dashboard",
    description: "Dein persönlicher Überblick über alle Human Design Aspekte",
    icon: <Target size={44} />,
    features: ["Persönliche Metriken", "Tägliche Insights", "Energie-Tracking", "Fortschrittsanalyse"],
    path: "/dashboard",
    color: "#FFD700"
  },
  {
    title: "Mondkalender",
    description: "Verfolge lunare Zyklen und ihre Auswirkungen auf dein Design",
    icon: <Moon size={44} />,
    features: ["Lunare Transite", "Energie-Zyklen", "Optimale Zeiten", "Astrologische Einflüsse"],
    path: "/mondkalender",
    color: "#9F7AEA"
  },
  {
    title: "Human Design Chart",
    description: "Dein einzigartiger energetischer Fingerabdruck",
    icon: <Star size={44} />,
    features: ["Typ-Analyse", "Zentren-Profile", "Autorität", "Strategie"],
    path: "/chart",
    color: "#F56565"
  },
  {
    title: "Friends & Community",
    description: "Verbinde dich mit Gleichgesinnten",
    icon: <Users size={44} />,
    features: ["Community", "Events", "Gruppen", "Networking"],
    path: "/friends",
    color: "#38B2AC"
  },
  {
    title: "Chat & Kommunikation",
    description: "Austausch und Unterstützung in Echtzeit",
    icon: <MessageCircle size={44} />,
    features: ["Live-Chat", "Gruppen-Diskussionen", "Mentoring", "Wissensaustausch"],
    path: "/chat",
    color: "#4299E1"
  },
  {
    title: "Reading-Baukasten",
    description: "Professionelle Readings erstellen und verwalten",
    icon: <BookOpen size={44} />,
    features: ["Reading-Templates", "Kundenverwaltung", "Sektionen-Baukasten", "Export-Funktionen"],
    path: "/reading",
    color: "#ED8936"
  },
  {
    title: "Swipe & Matching",
    description: "Finde energetisch kompatible Menschen",
    icon: <Heart size={44} />,
    features: ["Energetische Analyse", "Kompatibilitäts-Check", "Profilsuche", "Matching-Algorithmus"],
    path: "/swipe",
    color: "#F687B3"
  },
  {
    title: "Knowledge Base",
    description: "Umfassende Human Design Bibliothek",
    icon: <Brain size={44} />,
    features: ["Artikel", "Tutorials", "Videos", "Ressourcen"],
    path: "/knowledge",
    color: "#68D391"
  },
  {
    title: "Settings & Profil",
    description: "Personalisiere deine App-Erfahrung",
    icon: <Settings size={44} />,
    features: ["Profil-Einstellungen", "Benachrichtigungen", "Datenschutz", "Backup"],
    path: "/settings",
    color: "#A0AEC0"
  },
  {
    title: "Dating & Beziehungen",
    description: "Entdecke energetische Verbindungen",
    icon: <Heart size={44} />,
    features: ["Swipe & Match", "Energetisches Matching", "Dating-Generator", "Freunde & Events"],
    path: "/dating",
    color: "#FC8181"
  },
  {
    title: "Tools & Features",
    description: "Erweiterte Funktionen und Algorithmen",
    icon: <Zap size={44} />,
    features: ["Energetische Algorithmen", "Sales-Bereiche", "Analytics", "Integrationen"],
    path: "/dashboard",
    color: "#F6E05E"
  },
  {
    title: "Persönliche Entwicklung",
    description: "Wachse mit deinem Human Design",
    icon: <TrendingUp size={44} />,
    features: ["Coaching", "Workshops", "Fortschritts-Tracking", "Ziel-Management"],
    path: "/reading",
    color: "#81C784"
  }
];

const AppFunctionsSection = () => {
  return (
    <Box sx={{ py: 8 }}>
      <motion.div
        
        whileInView={{ opacity: 1, y: 0 }}
        
        
      >
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            mb: 6,
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '3rem' },
            textAlign: 'center',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            background: 'linear-gradient(45deg, #fff, #e0e7ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          🌟 Alle App-Funktionen in KOSMISCHE VERBINDUNGEN
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {appFunctions.map((func, index) => (
            <Grid item xs={12} sm={6} lg={4} key={func.title}>
              <motion.div
                
                whileInView={{ opacity: 1, y: 0 }}
                
                
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 6,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, ${func.color}, #fbbf24, ${func.color})`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&::before': {
                      opacity: 1
                    }
                  }
                }}>
                  <CardContent sx={{ p: 5, textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <Box sx={{
                      width: 90,
                      height: 90,
                      borderRadius: '24px',
                      background: `linear-gradient(135deg, ${func.color}, #fbbf24, #FFA500)`,
                      color: '#23233a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 28px',
                      boxShadow: `0 12px 32px ${func.color}50, inset 0 2px 0 rgba(255,255,255,0.3)`,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: '26px',
                        background: `linear-gradient(135deg, ${func.color}, #fbbf24, #FFA500)`,
                        zIndex: -1,
                        opacity: 0.3,
                        filter: 'blur(8px)'
                      }
                    }}>
                      {func.icon}
                    </Box>
                    
                    <Typography variant="h5" sx={{ 
                      color: 'white', 
                      fontWeight: 800, 
                      mb: 2,
                      fontSize: '1.3rem',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      background: 'linear-gradient(45deg, #fff, #fbbf24)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {func.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 3,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      minHeight: '2.7rem'
                    }}>
                      {func.description}
                    </Typography>
                    
                    <Box sx={{ 
                      textAlign: 'left', 
                      mb: 4,
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 3,
                      p: 2.5,
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      {func.features.map((feature, idx) => (
                        <Typography key={idx} variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          mb: 1.5, 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: 'white',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <ArrowRight size={16} style={{ marginRight: 8, color: func.color }} />
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Button
                      component={Link}
                      href={func.path}
                      variant="contained"
                      fullWidth
                      sx={{
                        background: `linear-gradient(45deg, ${func.color}, #fbbf24)`,
                        color: '#23233a',
                        fontWeight: 800,
                        py: 2,
                        borderRadius: 4,
                        boxShadow: `0 8px 24px ${func.color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: -100,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s ease'
                        },
                        '&:hover': {
                          background: `linear-gradient(45deg, #fbbf24, ${func.color})`,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 32px ${func.color}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
                          '&::before': {
                            left: 100
                          }
                        }
                      }}
                    >
                      Mehr erfahren <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </Button>
                  </CardContent>
                </Card>
                
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default AppFunctionsSection;

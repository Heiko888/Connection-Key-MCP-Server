"use client";
import React from 'react';
import { Container, Typography, Card, CardContent, Box, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Zap, 
  Crown, 
  Star,
  ArrowRight,
  BookOpen,
  Brain,
  Heart,
  Eye,
  Activity,
  Home,
  BarChart3,
  Grid as GridIcon
} from 'lucide-react';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

export default function GrundlagenHDPage() {
  const hdBasics = [
    {
      title: "Autorität",
      description: "Deine innere Autorität und Entscheidungsfindung",
      icon: <Shield size={24} />,
      color: "#10b981",
      path: "/authority",
      details: "Lerne deine natürliche Entscheidungsmethode kennen - von der emotionalen Autorität bis zur sakralen Antwort."
    },
    {
      title: "Zentren",
      description: "Die 9 Energiezentren - deine energetische Anatomie",
      icon: <Target size={24} />,
      color: "#8b5cf6",
      path: "/centers",
      details: "Verstehe die 9 Energiezentren und wie sie deine Persönlichkeit und Energie beeinflussen."
    },
    {
      title: "Kanäle",
      description: "Die 36 Kanäle - deine Verbindungen",
      icon: <Zap size={24} />,
      color: "#f59e0b",
      path: "/channels",
      details: "Entdecke die 36 Kanäle, die deine Energiezentren verbinden und deine Talente definieren."
    },
    {
      title: "Tore",
      description: "Die 64 Tore - deine individuellen Eigenschaften",
      icon: <Crown size={24} />,
      color: "#ef4444",
      path: "/gates",
      details: "Erkunde die 64 Tore des I Ging und ihre Bedeutung für dein Human Design."
    },
    {
      title: "Linien",
      description: "Die 6 Linien - Entwicklungsstufen der Tore",
      icon: <GridIcon size={24} />,
      color: "#06b6d4",
      path: "/lines",
      details: "Verstehe die 6 Linien, die verschiedene Aspekte und Entwicklungsstufen jedes Tores darstellen."
    },
    {
      title: "Profile",
      description: "Die 12 Profile - deine Lebensrolle",
      icon: <Star size={24} />,
      color: "#8C1D04",
      path: "/profiles",
      details: "Verstehe dein Profil und deine einzigartige Lebensrolle in diesem Leben."
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageLayout activePage="bodygraph" maxWidth="xl">
      {/* Animierte Sterne im Hintergrund */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.8 + 0.2,
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
      {/* Animierte Planeten-Orbits */}
      {Array.from({ length: 3 }).map((_, i) => (
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
      {/* Pulsierende Planeten */}
      {Array.from({ length: 5 }).map((_, i) => (
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
      
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 8 }, pb: 6, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Brain size={48} color="#F29F05" style={{ flexShrink: 0 }} />
              <Typography variant="h1" sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 2,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                Human Design Grundlagen
              </Typography>
              <Brain size={48} color="#F29F05" style={{ flexShrink: 0 }} />
            </Box>
            
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.7,
              mb: 4,
              fontWeight: 300
            }}>
              Entdecke die fundamentalen Bausteine des Human Design Systems
            </Typography>
          </Box>
        </motion.div>

        {/* Human Design Grundlagen Cards */}
        <Grid container spacing={3}>
          {hdBasics.map((basic, index) => (
            <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.25)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                    borderColor: 'rgba(242, 159, 5, 0.40)',
                    background: 'rgba(255, 255, 255, 0.12)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${basic.color}40, ${basic.color}20)`,
                        border: `2px solid ${basic.color}60`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        color: basic.color,
                        boxShadow: `0 4px 15px ${basic.color}30`
                      }}>
                        {basic.icon}
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                      }}>
                        {basic.title}
                      </Typography>
                    </Box>
                    <Typography sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6,
                      mb: 2,
                      fontWeight: 500
                    }}>
                      {basic.description}
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      lineHeight: 1.6,
                      mb: 3
                    }}>
                      {basic.details}
                    </Typography>
                    <Link href={basic.path} passHref>
                      <Button
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowRight size={18} />}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          fontWeight: 700,
                          py: { xs: 1.5, md: 1.25 },
                          borderRadius: 2,
                          fontSize: { xs: '0.95rem', md: '0.9rem' },
                          minHeight: { xs: 48, md: 44 },
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#F29F05',
                            backgroundColor: 'rgba(242, 159, 5, 0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)'
                          }
                        }}
                      >
                        Erkunden
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.30)',
            mt: 8,
            mb: 4,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(242, 159, 5, 0.40)',
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)'
            }
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <BookOpen size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                <Typography variant="h3" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800, 
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}>
                  Human Design System
                </Typography>
                <Typography sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.8,
                  maxWidth: 900,
                  mx: 'auto',
                  mb: 4
                }}>
                  Das Human Design System ist eine revolutionäre Wissenschaft, die Astrologie, I Ging, Chakren-System und Quantenphysik vereint. 
                  Es zeigt dir deine einzigartige energetische Blaupause und wie du authentisch leben kannst.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                  <Link href="/energetische-signatur" passHref>
                    <Button
                      variant="outlined"
                      startIcon={<Eye size={20} />}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        fontWeight: 700,
                        px: { xs: 3, md: 4 },
                        py: { xs: 1.5, md: 2 },
                        borderRadius: 3,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        minHeight: { xs: 48, md: 'auto' },
                        '&:hover': {
                          borderColor: '#F29F05',
                          backgroundColor: 'rgba(242, 159, 5, 0.15)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Mehr über Human Design
                    </Button>
                  </Link>
                  
                  <Link href="/human-design-chart" passHref>
                    <Button
                      variant="contained"
                      startIcon={<Activity size={20} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        px: { xs: 3, md: 4 },
                        py: { xs: 1.5, md: 2 },
                        borderRadius: 3,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        minHeight: { xs: 48, md: 'auto' },
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(242, 159, 5, 0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Dein Chart anzeigen
                    </Button>
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
      </PageLayout>
    </Box>
  );
}

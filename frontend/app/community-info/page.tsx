"use client";

import React from "react";
import Link from "next/link";
import PageLayout from "../components/PageLayout";
import { 
  Box, 
  Typography, 
  Button,
  Container,
  Grid,
  Card,
  Paper,
  Chip,
  Stack
} from "@mui/material";
import { 
  Heart, 
  Users,
  Moon,
  ArrowRight,
  Star, 
  Check,
  Sparkles,
  MessageCircle,
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Target,
  BookOpen,
  UserPlus,
  Share2,
  Key,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";

// Sparkle-Positionen für animierte Hintergrund-Funken
const sparklePositions = [
  { left: 15, top: 20 }, { left: 75, top: 35 }, { left: 45, top: 60 },
  { left: 85, top: 15 }, { left: 25, top: 80 }, { left: 65, top: 45 },
  { left: 10, top: 55 }, { left: 90, top: 70 }, { left: 35, top: 25 },
  { left: 55, top: 85 }, { left: 70, top: 10 }, { left: 30, top: 90 },
  { left: 50, top: 40 }, { left: 20, top: 65 }, { left: 80, top: 50 }
];

const sparkleAnimations = [
  { duration: 2.5, delay: 0.3 }, { duration: 3.2, delay: 1.1 }, { duration: 2.8, delay: 0.7 },
  { duration: 3.5, delay: 1.5 }, { duration: 2.3, delay: 0.5 }, { duration: 3.8, delay: 1.8 },
  { duration: 2.6, delay: 0.9 }, { duration: 3.0, delay: 1.2 }, { duration: 2.9, delay: 0.4 },
  { duration: 3.3, delay: 1.6 }, { duration: 2.7, delay: 0.8 }, { duration: 3.6, delay: 1.4 },
  { duration: 2.4, delay: 0.6 }, { duration: 3.1, delay: 1.3 }, { duration: 2.5, delay: 0.9 }
];

// Community & Connection Key Features
const communityFeatures = [
  {
    icon: <Users size={32} />,
    title: "Community Hub",
    description: "Ein Ort für bewusste Menschen, die Human Design, Energiearbeit und Resonanzanalyse nicht nur kennen – sondern wirklich erleben wollen.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "2.500+ Mitglieder"
  },
  {
    icon: <Key size={32} />,
    title: "Connection Key Sharing",
    description: "Teile deine Connection Key Erkenntnisse, verstehe energetische Dynamiken zwischen dir und anderen und tausche dich dazu mit anderen aus.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "1.000+ Keys geteilt"
  },
  {
    icon: <MessageCircle size={32} />,
    title: "Austausch & Support",
    description: "Fragen, Erkenntnisse, Erfahrungen – hier bekommst du ehrlichen Austausch ohne Bewertung.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "10.000+ Posts"
  },
  {
    icon: <Calendar size={32} />,
    title: "Events & Meetups",
    description: "Regelmäßige Workshops, Live-Sessions und gemeinsame Austauschformate – online oder gelegentlich offline.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "25+ Events/Monat"
  },
  {
    icon: <Heart size={32} />,
    title: "Resonanz Matching",
    description: "Erkenne anhand deiner Connection Key Analysen, welche energetischen Verbindungen harmonisch, herausfordernd oder transformierend sind.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "500+ Matches"
  },
  {
    icon: <BookOpen size={32} />,
    title: "Wissens-Bibliothek",
    description: "Guides, Ressourcen und Deep-Dives zu Human Design, Energiearbeit und Resonanzlehre – an einem Ort gesammelt.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "100+ Artikel"
  }
];

// Community Benefits
const benefits = [
  {
    icon: <Shield size={24} />,
    title: "Sichere Umgebung",
    description: "Ein geschützter Raum für offenen, bewussten und authentischen Austausch."
  },
  {
    icon: <Sparkles size={24} />,
    title: "Exklusive Inhalte",
    description: "Zugang zu Workshops, Material, Impulsen und Community-Only Ressourcen."
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Persönliches Wachstum",
    description: "Verstehe dich selbst auf einer energetischen, emotionalen und mentalen Ebene tiefer."
  },
  {
    icon: <Target size={24} />,
    title: "Gleichgesinnte finden",
    description: "Verbinde dich mit Menschen, die ähnlich fühlen, denken und wachsen wollen."
  }
];

// Success Stories (Mock data)
const successStories = [
  {
    name: "Sarah M.",
    type: "Generator",
    story: "Durch die Community habe ich nicht nur meinen Partner gefunden, sondern auch eine ganze Gruppe von Freunden, die mich verstehen.",
    rating: 5
  },
  {
    name: "Marcus K.",
    type: "Projector",
    story: "Die Workshops und Meetups haben mir geholfen, mein Human Design wirklich zu verstehen und anzuwenden.",
    rating: 5
  },
  {
    name: "Emma L.",
    type: "Manifestor",
    story: "Ich liebe den Austausch in der Community. Endlich Menschen, die ähnlich denken und fühlen!",
    rating: 5
  }
];

export default function CommunityInfoPage() {

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      background: 'radial-gradient(ellipse at top, rgba(242, 159, 5, 0.15) 0%, rgba(0, 0, 0, 1) 50%), radial-gradient(ellipse at bottom, rgba(140, 29, 4, 0.1) 0%, rgba(0, 0, 0, 1) 70%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dynamischer animierter Hintergrund */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Animierter Gradient Hintergrund */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.1) 0%, transparent 50%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(140, 29, 4, 0.08) 0%, transparent 50%)',
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        
        {/* Mehr Funken mit unterschiedlichen Größen */}
        {sparklePositions.map((pos, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              height: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              background: i % 2 === 0 ? '#F29F05' : '#FFD700',
              borderRadius: '50%',
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              boxShadow: `0 0 ${i % 3 === 0 ? '15px' : '10px'} ${i % 2 === 0 ? 'rgba(242,159,5,0.9)' : 'rgba(255,215,0,0.8)'}, 0 0 ${i % 3 === 0 ? '25px' : '20px'} ${i % 2 === 0 ? 'rgba(140,29,4,0.6)' : 'rgba(242,159,5,0.5)'}`
            }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0.3, 1.5, 0.8, 1.3, 0.3],
              y: [0, -50, -20, -40, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0]
            }}
            transition={{
              duration: sparkleAnimations[i].duration * 1.5,
              repeat: Infinity,
              delay: sparkleAnimations[i].delay,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Zusätzliche Partikel-Effekte */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: '#F29F05',
              borderRadius: '50%',
              left: `${(i * 12.5) % 100}%`,
              top: `${(i * 15) % 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </Box>
      <PageLayout activePage="community" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h1" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 0 32px rgba(242, 159, 5, 0.30)'
            }}>
              👥 Community & Connection Key
            </Typography>
            
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.85)',
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}>
              Willkommen in einem Raum für echte Verbindung, Bewusstsein und Human Design.
            </Typography>
            
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.15rem' }
            }}>
              Teile deine Connection Key Resonanzen, entdecke energetische Muster zwischen dir und anderen Menschen und lerne gemeinsam mit Gleichgesinnten, die denselben Weg gehen wie du.
            </Typography>
            
            <Typography variant="body1" sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontStyle: 'italic'
            }}>
              👉 Ein Ort für Wachstum, Klarheit und bewusste Beziehungen.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.30)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.40)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <UserPlus size={22} style={{ marginRight: 10 }} />
                Kostenlos beitreten
              </Button>
              
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.10)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <LogIn size={22} style={{ marginRight: 10 }} />
                Login
              </Button>
            </Stack>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 8 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.10)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(242, 159, 5, 0.30)',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(242, 159, 5, 0.25)'
                  }
                }}>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 1 }}>
                    2.500+
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Mitglieder
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{
                  background: 'rgba(140, 29, 4, 0.10)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(140, 29, 4, 0.30)',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(140, 29, 4, 0.25)'
                  }
                }}>
                  <Typography variant="h3" sx={{ color: '#8C1D04', fontWeight: 800, mb: 1 }}>
                    1.000+
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Connection Keys
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{
                  background: 'rgba(89, 10, 3, 0.10)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(89, 10, 3, 0.30)',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(89, 10, 3, 0.25)'
                  }
                }}>
                  <Typography variant="h3" sx={{ color: '#590A03', fontWeight: 800, mb: 1 }}>
                    500+
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Geteilte Resonanzen
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.10)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(242, 159, 5, 0.30)',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(242, 159, 5, 0.25)'
                  }
                }}>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 1 }}>
                    98%
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Zufriedenheit
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Community & Connection Key Features */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h2" sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            ✨ Community & Connection Key Features
          </Typography>
          <Typography variant="h6" sx={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)',
            mb: 6,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Verbinde dich, teile deine Resonanzen und entdecke die energetischen Verbindungen zwischen euch
          </Typography>

          <Grid container spacing={3}>
            {communityFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    p: 4,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      background: 'rgba(255, 255, 255, 0.12)',
                      boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    }
                  }}>
                    <Box 
                      className="feature-icon"
                      sx={{ 
                        display: 'inline-flex',
                        p: 2.5,
                        borderRadius: 3,
                        background: feature.color,
                        color: 'white',
                        mb: 3,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255,255,255,0.75)',
                      lineHeight: 1.7,
                      mb: 3
                    }}>
                      {feature.description}
                    </Typography>
                    <Chip
                      label={feature.stats}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h2" sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 6,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            🌟 Deine Vorteile
          </Typography>

          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)'
                  }
                }}>
                  <Box sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    mb: 2
                  }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 1
                  }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6
                  }}>
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Success Stories */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h2" sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            💬 Was unsere Community sagt
          </Typography>
          <Typography variant="h6" sx={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)',
            mb: 6,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Echte Erfahrungen von echten Menschen
          </Typography>

          <Grid container spacing={3}>
            {successStories.map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  p: 4,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)'
                  }
                }}>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} size={20} fill="#F29F05" color="#F29F05" />
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.7,
                    mb: 3,
                    fontStyle: 'italic'
                  }}>
                    "{story.story}"
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      {story.name}
                    </Typography>
                    <Chip
                      label={story.type}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'center',
            p: { xs: 4, md: 8 },
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.10), rgba(140, 29, 4, 0.10))',
              zIndex: 0
            }
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ mb: 3 }}>
                <Sparkles size={48} color="#F29F05" style={{ marginBottom: 16 }} />
              </Box>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontWeight: 800, 
                mb: 3,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🚀 Bereit, Teil der Community & des Connection Keys zu werden?
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.85)', 
                mb: 3,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.2rem' }
              }}>
                Werde Teil eines Bewusstseinsraums, in dem es um echte Verbindung, tiefe Erkenntnisse und energetische Klarheit geht.
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 5,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}>
                Teile deine Connection Keys, entdecke neue Perspektiven und erforsche die energetischen Beziehungen zwischen dir und anderen.
              </Typography>
              
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  px: 6,
                  py: 2.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: '300px' },
                  boxShadow: '0 10px 30px rgba(242, 159, 5, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 40px rgba(242, 159, 5, 0.45)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <UserPlus size={22} style={{ marginRight: 10 }} />
                👉 Jetzt kostenlos beitreten
              </Button>

              <Typography sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                mt: 3,
                fontSize: '0.9rem'
              }}>
                100% kostenlos · Jederzeit kündbar · Für Einsteiger & Fortgeschrittene geeignet
              </Typography>
            </Box>
          </Card>
        </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

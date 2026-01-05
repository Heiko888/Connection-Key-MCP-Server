'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Key, 
  Heart, 
  ArrowRight, 
  Star, 
  Users, 
  Shield, 
  Clock,
  CheckCircle,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Gift,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Hero Features Data
const heroFeatures = [
  {
    icon: <Key size={24} />,
    title: "Human Design",
    description: "Entschlüssele dein einzigartiges energetisches Profil"
  },
  {
    icon: <Heart size={24} />,
    title: "Kompatibilität",
    description: "Finde die perfekten Verbindungen für dein Leben"
  },
  {
    icon: <Sparkles size={24} />,
    title: "Transformation",
    description: "Erlebe tiefgreifende persönliche Entwicklung"
  }
];

// How it Works Data
const howItWorks = [
  {
    step: "01",
    title: "Profil erstellen",
    description: "Erstelle dein kostenloses Profil mit deinen Geburtsdaten",
    icon: <Users size={32} />
  },
  {
    step: "02", 
    title: "Design entschlüsseln",
    description: "Erhalte deine detaillierte Human Design Analyse",
    icon: <Key size={32} />
  },
  {
    step: "03",
    title: "Verbindungen finden",
    description: "Entdecke kompatible Menschen und tiefe Beziehungen",
    icon: <Heart size={32} />
  }
];

// Success Stories Data
const successStories: any[] = [];

// Benefits Data
const benefits = [
  {
    icon: <Target size={32} />,
    title: "Präzise Analysen",
    description: "Wissenschaftlich fundierte Human Design Berechnungen"
  },
  {
    icon: <Shield size={32} />,
    title: "100% Privatsphäre",
    description: "Deine Daten sind sicher und werden niemals geteilt"
  },
  {
    icon: <Clock size={32} />,
    title: "Sofortige Ergebnisse",
    description: "Erhalte deine Analyse in wenigen Minuten"
  },
  {
    icon: <TrendingUp size={32} />,
    title: "Kontinuierliches Wachstum",
    description: "Ein Werkzeug für kontinuierliches Wachstum und Selbsterkenntnis"
  }
];

// Vordefinierte Zufallswerte für konsistentes Server/Client Rendering
const sparklePositions = [
  { left: 15, top: 20 }, { left: 75, top: 35 }, { left: 45, top: 60 },
  { left: 85, top: 15 }, { left: 25, top: 80 }, { left: 65, top: 45 },
  { left: 10, top: 55 }, { left: 90, top: 70 }, { left: 35, top: 25 },
  { left: 55, top: 85 }, { left: 70, top: 10 }, { left: 30, top: 90 }
];

const sparkleAnimations = [
  { duration: 2.5, delay: 0.3 }, { duration: 3.2, delay: 1.1 }, { duration: 2.8, delay: 0.7 },
  { duration: 3.5, delay: 1.5 }, { duration: 2.3, delay: 0.5 }, { duration: 3.8, delay: 1.8 },
  { duration: 2.6, delay: 0.9 }, { duration: 3.0, delay: 1.2 }, { duration: 2.9, delay: 0.4 },
  { duration: 3.3, delay: 1.6 }, { duration: 2.7, delay: 0.8 }, { duration: 3.6, delay: 1.4 }
];

const flamePositions = [
  { left: 20, top: 40 }, { left: 60, top: 25 }, { left: 80, top: 65 },
  { left: 40, top: 50 }, { left: 50, top: 15 }, { left: 15, top: 75 },
  { left: 70, top: 30 }, { left: 35, top: 85 }
];

const flameAnimations = [
  { duration: 4.2, delay: 0.6, x: 10 }, { duration: 5.0, delay: 2.1, x: -8 },
  { duration: 4.5, delay: 1.2, x: 12 }, { duration: 4.8, delay: 2.7, x: -5 },
  { duration: 3.8, delay: 0.9, x: 7 }, { duration: 5.2, delay: 2.4, x: -10 },
  { duration: 4.3, delay: 1.5, x: 9 }, { duration: 4.7, delay: 1.8, x: -7 }
];

export default function LandingPage() {
  const [bannerVisible, setBannerVisible] = React.useState(true);
  const [logoSrc, setLogoSrc] = React.useState('/images/connection-key-optimized.png');
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);

  // Kombiniere alle Testimonials
  const allTestimonials = [
    {
      text: "„Ich dachte, ich kenne meinen Partner – bis ich sah, was zwischen uns wirklich passiert.",
      author: "Sarah",
      age: 35,
      profil: "Generator",
      grundtyp: "Manifestor",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
    },
    {
      text: "„Es ist, als würde jemand Licht auf das Unsichtbare werfen.\nIch verstehe endlich, warum mich manche Menschen so stark triggern – und was das mit mir zu tun hat.",
      author: "Luca",
      age: 29,
      profil: "Manifestor",
      grundtyp: "Manifestor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      text: "„Diese App hat nichts mit Dating zu tun.\nSie zeigt, wie Energie wirklich wirkt – und warum Verbindung Bewusstsein braucht.",
      author: "Alina",
      age: 41,
      profil: "Projector",
      grundtyp: "Projector",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
    },
    ...successStories.map(story => ({
      text: `"${story.story}"`,
      author: story.name,
      age: story.age,
      location: story.location,
      rating: story.rating,
      type: story.type,
      profil: story.profil || "Generator",
      grundtyp: story.grundtyp || "Generator"
    }))
  ];

  const handleNext = () => {
    setTestimonialIndex((prev) => (prev + 1 >= allTestimonials.length ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setTestimonialIndex((prev) => (prev - 1 < 0 ? allTestimonials.length - 1 : prev - 1));
  };

  // Auto-Play für den Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1 >= allTestimonials.length ? 0 : prev + 1));
    }, 5000); // Wechsle alle 5 Sekunden

    return () => clearInterval(interval);
  }, [testimonialIndex, allTestimonials.length]);

  const visibleTestimonials = [
    allTestimonials[testimonialIndex]
  ].filter(Boolean);

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
      
      {/* Promotion Banner */}
      {bannerVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Box sx={{ 
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
            borderBottom: '1px solid rgba(242, 159, 5, 0.45)',
            boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
            py: 2,
            px: 3
          }}>
            <Container maxWidth="lg">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                position: 'relative'
              }}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Gift size={28} color="#ffffff" />
                </motion.div>
                
                <Typography sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', md: '1.2rem' },
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}>
                  🎉 Limitiertes Angebot: Jetzt kostenlos anmelden und lebenslangen Premium-Zugang sichern! 🎉
                </Typography>

                <Box
                  component="button"
                  onClick={() => setBannerVisible(false)}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.1)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <X size={20} color="#ffffff" />
                </Box>
              </Box>
            </Container>
          </Box>
        </motion.div>
      )}

      {/* Logo am Anfang der Seite */}
      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        pt: { xs: 6, md: 8 },
        pb: 0,
        mb: 0,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ 
          position: 'relative',
          height: { xs: 120, md: 240 },
          width: { xs: '100%', md: 900 },
          maxWidth: 900,
          px: { xs: 2, md: 0 }
        }}>
          <Image
            src={logoSrc}
            alt="The Connection Key"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 70vw, 900px"
            priority
            unoptimized={true}
            onError={() => {
              // Fallback-Kette: optimiertes PNG -> Original PNG -> Legacy
              if (logoSrc.includes('optimized')) {
                setLogoSrc('/images/connection-key-logo.png');
              } else {
                setLogoSrc('/images/Design ohne Titel(15).png');
              }
            }}
          />
        </Box>
      </Box>

      {/* Hero Section - Zentral positioniert */}
      <Container maxWidth="lg" sx={{ 
        pt: 0, 
        pb: 0, 
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start',
          textAlign: 'center',
          maxWidth: '1200px',
          mx: 'auto',
          padding: { xs: '4px 16px', md: '0px 24px' },
          pt: { xs: 0, md: 0 },
          pb: { xs: 1, md: 1 }
        }}>
            {/* Hero Content ohne Logo - Logo ist jetzt Hintergrund */}
            
            
            {/* Haupttitel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
            <Typography variant="h2" sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04, #FFD700)',
                backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
                mb: 3,
                mt: 0,
              maxWidth: 900,
              mx: 'auto',
              lineHeight: 1.2,
                fontSize: { xs: '2rem', md: '3.2rem' },
              fontWeight: 800,
              fontFamily: '"Playfair Display", serif',
                textAlign: 'center',
                position: 'relative',
                animation: 'gradientShift 3s ease infinite',
                '@keyframes gradientShift': {
                  '0%, 100%': {
                    backgroundPosition: '0% 50%'
                  },
                  '50%': {
                    backgroundPosition: '100% 50%'
                  }
                },
                filter: 'drop-shadow(0 0 15px rgba(242, 159, 5, 0.4))'
              }}>
                Begegnung ist kein Zufall.
            </Typography>
            </motion.div>
            
            {/* Subline */}
            <Typography variant="h5" sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 3,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              fontWeight: 400,
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.9)',
              fontFamily: '"Crimson Text", serif',
              textAlign: 'center'
            }}>
              The Connection Key zeigt dir, was zwischen euch lebt.
              <br />
              Kein Match. Kein Algorithmus. Nur Wahrheit – in Energie übersetzt.
            </Typography>
            
            {/* CTA Button */}
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="medium"
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                px: { xs: 4, sm: 5, md: 6 },
                py: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: { xs: 2, md: 3 },
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                textTransform: 'none',
                fontFamily: '"Playfair Display", serif',
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: 360, sm: 'none' },
                mb: 0,
                boxShadow: { xs: '0 6px 18px rgba(242, 159, 5, 0.35)', md: '0 8px 25px rgba(242, 159, 5, 0.40)' },
                border: '1px solid rgba(242, 159, 5, 0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: { xs: 'none', md: 'translateY(-4px) scale(1.05)' },
                  boxShadow: { xs: '0 8px 22px rgba(242, 159, 5, 0.45)', md: '0 0 50px rgba(242, 159, 5, 0.7), 0 15px 40px rgba(140, 29, 4, 0.5)' },
                  border: '1px solid rgba(242, 159, 5, 0.6)'
                },
                transition: 'all 0.5s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  transition: 'left 0.8s ease'
                },
                '&:hover::before': {
                  left: '100%'
                }
              }}
            >
              🔮 Jetzt entdecken
            </Button>
          </Box>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Die Idee hinter The Connection Key */}
      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
            textAlign: 'center',
              mb: 4,
            color: 'white',
              fontWeight: 800,
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
          }}>
              💫 Die Idee hinter The Connection Key
          </Typography>
          
            <Typography variant="h5" sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              fontWeight: 400,
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Manche Menschen berühren dich sofort.
            </Typography>

            <Typography variant="h5" sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 4,
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              fontWeight: 400,
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Andere lassen dich nicht los – selbst, wenn sie längst gegangen sind.
            </Typography>

            {/* Text-Bereich - Neu strukturiert mit besserer visueller Hierarchie */}
            <Box sx={{
              maxWidth: '850px',
              mx: 'auto',
              mb: 4
            }}>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 3,
                lineHeight: 1.9,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                In einer Welt, in der wir Menschen nach Sekunden bewerten,<br />
                haben wir verlernt, was Verbindung wirklich bedeutet.
              </Typography>

              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 4,
                lineHeight: 1.9,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                Wir kennen unsere Sternzeichen, unsere Typen –<br />
                aber nicht die energetische Sprache, die zwischen uns spricht.
              </Typography>

              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.9,
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                fontFamily: '"Crimson Text", serif',
                mb: 2,
                textAlign: 'center'
              }}>
                Hier geht es nicht darum, <span style={{ fontStyle: 'italic', color: '#F29F05', fontWeight: 600 }}>wer du bist</span>,
              </Typography>
              <Typography variant="h6" sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.9,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                textAlign: 'center'
              }}>
                sondern <span style={{ fontStyle: 'italic', color: '#F29F05' }}>was zwischen euch entsteht.</span>
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Was The Connection Key sichtbar macht */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
              mb: 4,
              color: 'white',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🔍 Was The Connection Key sichtbar macht
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 4,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Auf Basis des <strong>Human Design Systems</strong> entschlüsselt The Connection Key,
              <br />
              was zwischen zwei Menschen unsichtbar wirkt:
            </Typography>

            <Box sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto'
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}>
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
                    backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
              p: { xs: 3, md: 3.5 },
              textAlign: 'left',
                    transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(242, 159, 5, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
                    '&:hover': {
                transform: 'translateX(5px)',
                border: '1px solid rgba(242, 159, 5, 0.5)',
                boxShadow: '0 15px 35px rgba(242, 159, 5, 0.25)',
                '&::after': {
                  opacity: 1
                }
              }
            }}>
                  <Box sx={{
                    flexShrink: 0,
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(242, 159, 5, 0.4)'
                  }}>
                    <Key size={28} color="#F29F05" />
                  </Box>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    mb: 1.5,
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    fontFamily: '"Playfair Display", serif',
                    flex: 1
                  }}>
                    Welche <strong>Tore</strong> sich gegenseitig aktivieren, wenn ihr euch begegnet.
                  </Typography>
                </Box>

            <Box sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
              backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              p: { xs: 3, md: 3.5 },
              textAlign: 'left',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(242, 159, 5, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                transform: 'translateX(5px)',
                border: '1px solid rgba(242, 159, 5, 0.5)',
                boxShadow: '0 15px 35px rgba(242, 159, 5, 0.25)',
                '&::after': {
                  opacity: 1
                }
                    }
                  }}>
                    <Box sx={{
                    flexShrink: 0,
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(242, 159, 5, 0.4)'
                  }}>
                    <Target size={28} color="#F29F05" />
                  </Box>
                  <Typography variant="h6" sx={{
                      color: '#F29F05',
                    mb: 1.5,
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    fontFamily: '"Playfair Display", serif',
                    flex: 1
                  }}>
                    Welche <strong>Zentren</strong> lebendig werden, wenn eure Energien fließen.
                  </Typography>
                </Box>

            <Box sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              p: { xs: 3, md: 3.5 },
              textAlign: 'left',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
                      display: 'flex',
              alignItems: 'center',
              gap: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(242, 159, 5, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                transform: 'translateX(5px)',
                border: '1px solid rgba(242, 159, 5, 0.5)',
                boxShadow: '0 15px 35px rgba(242, 159, 5, 0.25)',
                '&::after': {
                  opacity: 1
                }
              }
            }}>
                  <Box sx={{
                    flexShrink: 0,
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(242, 159, 5, 0.4)'
                  }}>
                    <Zap size={28} color="#F29F05" />
                    </Box>
                  <Typography variant="h6" sx={{
                    color: '#F29F05',
                    mb: 1.5,
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    fontFamily: '"Playfair Display", serif',
                    flex: 1
                  }}>
                    Welche <strong>Goldadern</strong> euch verbinden – die unsichtbaren Linien der Resonanz.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
                      mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
                    }}>
              Wenn du dein Chart mit dem eines anderen verbindest,
                    </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              entsteht ein Feld aus Energie, Bewusstsein und Möglichkeit.
                    </Typography>

            <Typography variant="h6" sx={{
              color: '#F29F05',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif'
            }}>
              The Connection Key zeigt dir dieses Feld.
            </Typography>

            <Typography variant="h6" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic'
            }}>
              Klar. Spürbar. Echt.
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Warum du The Connection Key erleben willst */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
                      mb: 3,
              color: 'white',
                      fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🌗 Warum du The Connection Key erleben willst
            </Typography>

            <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 4, mb: 4 }}>
              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center'
              }}>
                💠 Selbstverständnis
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 3,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                Du erkennst, warum du fühlst, was du fühlst – und was dich zu bestimmten Menschen zieht.
              </Typography>

              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center'
              }}>
                💠 Klarheit
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 3,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                Du verstehst, was zwischen euch wirkt, ohne dich in Interpretationen zu verlieren.
              </Typography>

              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center'
              }}>
                💠 Ruhe
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 3,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                Du hörst auf, gegen deine Energie zu kämpfen – und beginnst, in Resonanz zu leben.
              </Typography>

              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Playfair Display", serif',
                textAlign: 'center'
              }}>
                💠 Verbindung
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 0,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontFamily: '"Crimson Text", serif',
                textAlign: 'center'
              }}>
                Du lernst, Menschen nicht nur zu sehen, sondern wirklich zu spüren.
              </Typography>
                    </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                  px: { xs: 4, sm: 6, md: 8 },
                  py: { xs: 1.5, sm: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                  textTransform: 'none',
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.35)',
                  border: '1px solid rgba(242, 159, 5, 0.45)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.45)',
                    border: '1px solid rgba(242, 159, 5, 0.6)'
                  },
                  transition: 'all 0.5s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    transition: 'left 0.8s ease'
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                ✨ Erstelle dein Resonanzprofil
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
                    <Box sx={{
                      display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
                    </Box>

      {/* Was The Connection Key anders macht */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
              mb: 4,
                      color: 'white',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              ⚡ Was The Connection Key anders macht
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Andere Plattformen suchen Übereinstimmungen.
            </Typography>

            <Typography variant="h5" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif'
            }}>
              Wir zeigen Resonanz.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
                      mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Es geht nicht darum, ob ihr <em>passt</em> –
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 4,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif',
                      fontWeight: 600
                    }}>
              sondern was entsteht, wenn ihr euch begegnet.
                    </Typography>

            <Box sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              borderRadius: 4,
              p: { xs: 3, md: 3.5 },
              mb: 4,
              textAlign: 'center'
            }}>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 2,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontFamily: '"Crimson Text", serif'
              }}>
                Human Design ist die Landkarte.
              </Typography>

              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 0,
                fontWeight: 700,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic'
              }}>
                <strong>The Connection Key ist der Raum dazwischen.</strong>
              </Typography>
            </Box>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Wir beleuchten die unsichtbare Architektur eurer Beziehung:
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              die Goldadern zwischen euren Charts.
            </Typography>

            <Typography variant="h6" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.8,
              fontSize: { xs: '1.4rem', md: '1.8rem' },
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic'
            }}>
              Dort, wo Verbindung zu Bewusstsein wird.
                    </Typography>
                  </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Die Resonanzanalyse - Energetischer Kompass */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
              mb: 4,
              color: 'white',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🧭 Die Resonanzanalyse
            </Typography>

            <Typography variant="h5" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif'
            }}>
              Der energetische Kompass des Systems
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 4,
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Sie zeigt, wie stark die Verbindung zwischen Bewusstsein, Energie und System (Server, Daten, Mensch) schwingt – also wie „sauber" der energetische Fluss ist.
            </Typography>

            <Box sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              mb: 4
            }}>
              <Typography variant="h6" sx={{
                color: '#F29F05',
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                textAlign: 'center',
                fontFamily: '"Playfair Display", serif'
              }}>
                Sie dient als diagnostischer Teil des „Connecting Keys":
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ 
                    color: '#F29F05', 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    lineHeight: 1
                  }}>
                    →
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontFamily: '"Crimson Text", serif',
                    flex: 1
                  }}>
                    <strong>Wo besteht Resonanz</strong> (Harmonie, Synchronität)?
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography sx={{ 
                    color: '#F29F05', 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    lineHeight: 1
                  }}>
                    →
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontFamily: '"Crimson Text", serif',
                    flex: 1
                  }}>
                    <strong>Wo Dissonanz</strong> (Blockaden, Fehlkommunikation, Energieverlust)?
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Die Sprache der Energie */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
            textAlign: 'center',
              mb: 4,
            color: 'white',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🌿 Die Sprache der Energie
          </Typography>
          
            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Wenn sich zwei Designs berühren,
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              aktiviert sich etwas, das größer ist als beide.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Ein definiertes Tor findet sein Gegenüber.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Ein Zentrum beginnt zu pulsieren.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 4,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Ein Raum öffnet sich.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Das ist Resonanz – der Moment,
            </Typography>

            <Typography variant="h6" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.8,
              fontSize: { xs: '1.4rem', md: '1.8rem' },
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic'
            }}>
              in dem Begegnung dich verändert.
            </Typography>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Stimmen aus der Community */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                      <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
              mb: 4,
              color: 'white',
              fontWeight: 800,
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              💬 Stimmen aus der Community
            </Typography>

            <Box sx={{ position: 'relative', mb: 4 }}>
              {/* Navigation Buttons */}
              <Button
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: { xs: -40, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                  border: '1px solid rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.5), rgba(140, 29, 4, 0.3))',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: { xs: -40, md: -60 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                  border: '1px solid rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.5), rgba(140, 29, 4, 0.3))',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                <ChevronRight size={24} />
              </Button>

              {/* Slider Container */}
              <Box sx={{
                        display: 'flex',
                gap: 3,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%' }}
                >
                  {visibleTestimonials.map((testimonial, idx) => {
                    const hasImage = (testimonial as any).image;
                    const initials = testimonial.author.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                    <Box
                      key={testimonialIndex + idx}
                      sx={{
                        width: '100%',
                        maxWidth: '100%',
                        textAlign: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        {hasImage ? (
                          <Box
                            sx={{
                              width: { xs: 80, md: 100 },
                              height: { xs: 80, md: 100 },
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '3px solid rgba(242, 159, 5, 0.5)',
                              boxShadow: '0 8px 24px rgba(242, 159, 5, 0.3)',
                              position: 'relative'
                            }}
                          >
                            <Image
                              src={(testimonial as any).image}
                              alt={testimonial.author}
                              width={100}
                              height={100}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              unoptimized
                            />
                          </Box>
                        ) : (
                          <Avatar
                            alt={testimonial.author}
                            sx={{
                              width: { xs: 80, md: 100 },
                              height: { xs: 80, md: 100 },
                              border: '3px solid rgba(242, 159, 5, 0.5)',
                              boxShadow: '0 8px 24px rgba(242, 159, 5, 0.3)',
                              bgcolor: '#F29F05',
                              fontSize: { xs: '1.5rem', md: '2rem' },
                              fontWeight: 700,
                              fontFamily: '"Playfair Display", serif'
                            }}
                          >
                            {initials}
                          </Avatar>
                        )}
                      </Box>
                      <Typography variant="body1" sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        mb: 2,
                        lineHeight: 1.8,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        fontFamily: '"Crimson Text", serif',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-line'
                      }}>
                        {testimonial.text}
                        </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{
                          color: '#F29F05',
                          fontSize: { xs: '0.9rem', md: '1rem' },
                          fontWeight: 600,
                          fontFamily: '"Playfair Display", serif'
                        }}>
                          – {testimonial.author}{testimonial.age ? `, ${testimonial.age}` : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          {(testimonial as any).profil && (
                            <Chip
                              label={`Profil: ${(testimonial as any).profil}`}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.25)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.4)',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', md: '0.85rem' }
                              }}
                            />
                          )}
                          {(testimonial as any).grundtyp && (
                            <Chip
                              label={`Grundtyp: ${(testimonial as any).grundtyp}`}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.25)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.4)',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', md: '0.85rem' }
                              }}
                            />
                          )}
                          {(testimonial as any).rating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'flex', gap: 0.3 }}>
                                {[...Array((testimonial as any).rating)].map((_, i) => (
                                  <Star key={i} size={16} fill="#F29F05" color="#F29F05" />
                                ))}
                      </Box>
                              {(testimonial as any).type ? (
                                <Chip
                                  label={(testimonial as any).type}
                                  size="small"
                                  sx={{
                                    background: 'rgba(242, 159, 5, 0.25)',
                                    color: '#F29F05',
                                    border: '1px solid rgba(242, 159, 5, 0.4)',
                                    fontWeight: 600,
                                    fontSize: '0.8rem'
                                  }}
                                />
                              ) : null}
                            </Box>
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                    );
                  })}
                </motion.div>
                    </Box>
                    
              {/* Mobile Navigation */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                justifyContent: 'center', 
                gap: 2, 
                mt: 3 
              }}>
                <Button
                  onClick={handlePrevious}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                    border: '1px solid rgba(242, 159, 5, 0.5)',
                    color: '#F29F05'
                  }}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  onClick={handleNext}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                    border: '1px solid rgba(242, 159, 5, 0.5)',
                    color: '#F29F05'
                  }}
                >
                  <ChevronRight size={20} />
                </Button>
              </Box>
            </Box>

            {/* Button: Erfahre mehr über unsere Community */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 5 }, mb: 2 }}>
              <Button
                component={Link}
                href="/community-info"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#F29F05',
                  color: '#F29F05',
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#8C1D04',
                    backgroundColor: 'rgba(242, 159, 5, 0.10)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 30px rgba(242, 159, 5, 0.30)',
                    color: '#F29F05'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Erfahre mehr über unsere Community
                <ArrowRight size={20} style={{ marginLeft: 8 }} />
              </Button>
            </Box>

            {/* Erfolgsgeschichten */}
            <Box sx={{ 
              mt: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
                    p: { xs: 3, md: 3.5 },
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    '&::before': {
                      content: '"\\201C"',
                      position: 'absolute',
                      top: { xs: 16, md: 20 },
                      left: { xs: 16, md: 20 },
                      fontSize: { xs: '3rem', md: '4rem' },
                      color: '#F29F05',
                      opacity: 0.4,
                      fontFamily: '"Playfair Display", serif',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 0 10px rgba(242, 159, 5, 0.5))'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(242, 159, 5, 0.15) 0%, transparent 70%)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.02)',
                      border: '1px solid rgba(242, 159, 5, 0.5)',
                      boxShadow: '0 20px 40px rgba(242, 159, 5, 0.3), 0 0 30px rgba(242, 159, 5, 0.2)',
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.15))',
                      '&::after': {
                        opacity: 1
                      }
                    }
                  }}>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      lineHeight: 1.8,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      fontFamily: '"Crimson Text", serif',
                      fontStyle: 'italic',
                      pl: { xs: 2, md: 3 }
                    }}>
                      "{story.story}"
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography sx={{
                        color: '#F29F05',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 600,
                        fontFamily: '"Playfair Display", serif'
                      }}>
                        – {story.name}, {story.age}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="#F29F05" color="#F29F05" />
                        ))}
                      </Box>
                      <Chip
                        label={story.type}
                        size="small"
                        sx={{
                            background: 'rgba(242, 159, 5, 0.25)',
                          color: '#F29F05',
                            border: '1px solid rgba(242, 159, 5, 0.4)',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                        }}
                      />
                    </Box>
                    </Box>
                  </Box>
                </motion.div>
            ))}
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>

      {/* Das Manifest */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            maxWidth: '900px',
            mx: 'auto',
            px: { xs: 2, md: 4 }
          }}>
            <Typography variant="h2" sx={{
            textAlign: 'center',
              mb: 4,
            color: 'white',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🪞 Das Manifest
          </Typography>
          
            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
                    }}>
              <strong>The Connection Key</strong> ist mehr als Technologie.
                    </Typography>
                    
            <Typography variant="h5" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '1.8rem' },
              textAlign: 'center',
              fontFamily: '"Playfair Display", serif'
            }}>
              Es ist Erinnerung.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Erinnerung daran, dass Liebe, Freundschaft und Nähe
              <br />
              kein Zufall sind – sondern Resonanz.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 2,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif'
            }}>
              Jede Begegnung ist eine Einladung, bewusster zu werden.
            </Typography>

            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              mb: 3,
              lineHeight: 1.8,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              textAlign: 'center',
              fontFamily: '"Crimson Text", serif',
              fontWeight: 600
            }}>
              Jede Resonanz ein Schlüssel zu dir selbst.
            </Typography>

            <Box sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              borderRadius: 4,
              p: { xs: 3, md: 3.5 },
              mb: 0,
              textAlign: 'left',
              position: 'relative',
              '&::before': {
                content: '"\\201C"',
                position: 'absolute',
                top: { xs: 16, md: 20 },
                left: { xs: 16, md: 20 },
                fontSize: { xs: '3rem', md: '4rem' },
                color: '#F29F05',
                opacity: 0.3,
                fontFamily: '"Playfair Display", serif',
                lineHeight: 1
              }
            }}>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 1.5,
                lineHeight: 1.8,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Crimson Text", serif',
                fontStyle: 'italic',
                pl: { xs: 2, md: 3 }
              }}>
                Weil Energie nicht lügt.
              </Typography>

              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 1.5,
                lineHeight: 1.8,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Crimson Text", serif',
                fontStyle: 'italic',
                pl: { xs: 2, md: 3 }
              }}>
                Weil Nähe Bewusstsein braucht.
              </Typography>

              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 0,
                lineHeight: 1.8,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                fontFamily: '"Crimson Text", serif',
                fontStyle: 'italic',
                pl: { xs: 2, md: 3 }
              }}>
                Weil Begegnung dich verändert – wenn du bereit bist, hinzuschauen.
              </Typography>
                      </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Visueller Divider */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        py: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        <Box sx={{
          width: '60%',
          maxWidth: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)'
          }
        }} />
      </Box>


      {/* How it Works */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" sx={{
            textAlign: 'center',
            mb: 4,
            color: 'white',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            So funktioniert's
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem'
                    }}>
                      {step.step}
                    </Box>
                    <Box sx={{
                      color: '#F29F05',
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {step.icon}
                    </Box>
                    <Typography variant="h5" sx={{
                      color: 'white',
                      mb: 2,
                      fontWeight: 600
                    }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.6
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.10))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.35)',
            borderRadius: 8,
            p: { xs: 5, md: 6 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(242, 159, 5, 0.2) inset',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(90deg, transparent, #F29F05, #FFD700, #F29F05, transparent)',
              opacity: 0.8
            }
          }}>
            <Typography variant="h3" sx={{
              color: 'white',
              mb: 3,
              fontWeight: 800,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              Bereit, zu sehen, was zwischen euch lebt?
            </Typography>
            
            <Typography variant="h6" sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              fontWeight: 400
            }}>
              Starte noch heute deine Reise zu mehr Selbsterkenntnis und tiefen Verbindungen.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 3 }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.45)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Key size={24} style={{ marginRight: 12 }} />
                Finde eure Resonanz – jetzt starten
              </Button>
              
            </Stack>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <CheckCircle size={20} color="#F29F05" />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                100% kostenlos • Keine Kreditkarte erforderlich • Sofortige Ergebnisse
              </Typography>
            </Box>
          </Card>
        </motion.div>

      </Container>

    </Box>
  );
}
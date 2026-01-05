'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function PlanetsContent() {
  const router = useRouter();
  

  const planets = [
    {
      id: 'sun',
      name: 'Sonne',
      mythology: 'Das Zentrum des Bewusstseins',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
      icon: '☉',
      description: 'Die Sonne repräsentiert unser wahres Selbst, unsere Essenz und unser Bewusstsein. Sie zeigt, wer wir wirklich sind und was uns antreibt.',
      path: '/planets/sun',
      energy: 'Lebenskraft',
      element: 'Feuer',
      influence: 'Bewusstsein & Identität'
    },
    {
      id: 'moon',
      name: 'Mond',
      mythology: 'Das Unterbewusstsein und die Emotionen',
      color: '#C0C0C0',
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #E6E6FA 50%, #F0F8FF 100%)',
      icon: '☽',
      description: 'Der Mond repräsentiert unser Unterbewusstsein, unsere Emotionen und unsere instinktiven Reaktionen. Er zeigt, wie wir emotional reagieren.',
      path: '/planets/moon',
      energy: 'Emotionen',
      element: 'Wasser',
      influence: 'Unterbewusstsein & Intuition'
    },
    {
      id: 'mercury',
      name: 'Merkur',
      mythology: 'Der Bote der Götter',
      color: '#87CEEB',
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%)',
      icon: '☿',
      description: 'Merkur regiert Kommunikation, Denken und Lernen. Er zeigt, wie wir Informationen verarbeiten und uns ausdrücken.',
      path: '/planets/mercury',
      energy: 'Kommunikation',
      element: 'Luft',
      influence: 'Denken & Ausdruck'
    },
    {
      id: 'venus',
      name: 'Venus',
      mythology: 'Die Göttin der Liebe',
      color: '#FFB6C1',
      gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%)',
      icon: '♀',
      description: 'Venus steht für Liebe, Schönheit und Harmonie. Sie zeigt, was wir wertschätzen und wie wir Beziehungen gestalten.',
      path: '/planets/venus',
      energy: 'Liebe',
      element: 'Erde',
      influence: 'Beziehungen & Werte'
    },
    {
      id: 'mars',
      name: 'Mars',
      mythology: 'Der Gott des Krieges',
      color: '#FF4500',
      gradient: 'linear-gradient(135deg, #FF4500 0%, #FF6347 50%, #FF7F50 100%)',
      icon: '♂',
      description: 'Mars repräsentiert Energie, Aktion und Durchsetzungskraft. Er zeigt, wie wir unsere Ziele verfolgen und Konflikte lösen.',
      path: '/planets/mars',
      energy: 'Aktion',
      element: 'Feuer',
      influence: 'Energie & Durchsetzung'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      mythology: 'Der König der Götter',
      color: '#DAA520',
      gradient: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #FFF8DC 100%)',
      icon: '♃',
      description: 'Jupiter steht für Expansion, Weisheit und Optimismus. Er zeigt, wo wir wachsen und uns entwickeln können.',
      path: '/planets/jupiter',
      energy: 'Expansion',
      element: 'Feuer',
      influence: 'Wachstum & Weisheit'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      mythology: 'Der Lehrer und Disziplin',
      color: '#708090',
      gradient: 'linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #D3D3D3 100%)',
      icon: '♄',
      description: 'Saturn repräsentiert Struktur, Verantwortung und Grenzen. Er zeigt, wo wir lernen und reifen müssen.',
      path: '/planets/saturn',
      energy: 'Struktur',
      element: 'Erde',
      influence: 'Disziplin & Reife'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      mythology: 'Der Revolutionär',
      color: '#4B0082',
      gradient: 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 50%, #DDA0DD 100%)',
      icon: '♅',
      description: 'Uranus steht für Innovation, Freiheit und Veränderung. Er zeigt, wo wir uns von Konventionen befreien können.',
      path: '/planets/uranus',
      energy: 'Revolution',
      element: 'Luft',
      influence: 'Innovation & Freiheit'
    },
    {
      id: 'neptune',
      name: 'Neptun',
      mythology: 'Der Mystiker',
      color: '#4169E1',
      gradient: 'linear-gradient(135deg, #4169E1 0%, #6495ED 50%, #B0C4DE 100%)',
      icon: '♆',
      description: 'Neptun repräsentiert Spiritualität, Intuition und Illusion. Er zeigt, wo wir uns mit dem Göttlichen verbinden.',
      path: '/planets/neptune',
      energy: 'Spiritualität',
      element: 'Wasser',
      influence: 'Intuition & Mystik'
    },
    {
      id: 'pluto',
      name: 'Pluto',
      mythology: 'Der Transformator',
      color: '#8B0000',
      gradient: 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF6347 100%)',
      icon: '♇',
      description: 'Pluto steht für Transformation, Macht und Regeneration. Er zeigt, wo wir uns tiefgreifend verändern müssen.',
      path: '/planets/pluto',
      energy: 'Transformation',
      element: 'Wasser',
      influence: 'Macht & Regeneration'
    },
    {
      id: 'chiron',
      name: 'Chiron',
      mythology: 'Der verwundete Heiler',
      color: '#9370DB',
      gradient: 'linear-gradient(135deg, #9370DB 0%, #BA55D3 50%, #DDA0DD 100%)',
      icon: '⚷',
      description: 'Chiron repräsentiert Heilung, Weisheit und Wunden. Er zeigt, wo wir andere heilen können, weil wir selbst verwundet wurden.',
      path: '/planets/chiron',
      energy: 'Heilung',
      element: 'Feuer',
      influence: 'Weisheit & Wunden'
    },
    {
      id: 'incarnation-cross',
      name: 'Inkarnationskreuz',
      mythology: 'Der Lebenszweck',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
      icon: '✚',
      description: 'Das Inkarnationskreuz zeigt deinen Lebenszweck und deine Bestimmung. Es ist der rote Faden durch dein Leben.',
      path: '/planets/incarnation-cross',
      energy: 'Bestimmung',
      element: 'Alle',
      influence: 'Lebenszweck & Bestimmung'
    }
  ];

  // Alle Planeten anzeigen
  const filteredPlanets = planets;

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
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
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
      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6} sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 2,
                color: 'white',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                letterSpacing: '-0.02em',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              🪐 Die Planeten im Human Design
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontWeight: 400,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}
            >
              Entdecke die kosmischen Kräfte, die dein Leben prägen
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                mt: 2,
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '0.95rem', md: '1.05rem' }
              }}
            >
              Jeder Planet im Human Design System repräsentiert eine spezifische Energie und Funktion in unserem Leben. Von der Sonne als Zentrum unseres Bewusstseins bis zu Chiron als dem verwundeten Heiler - lerne die tiefe Bedeutung und Wirkung jedes Planeten kennen.
            </Typography>
          </motion.div>
        </Box>

      {/* Planets Grid - Ultra-Stylische 3D Planeten mit großzügigem Abstand */}
      <Grid container spacing={10} sx={{ justifyContent: 'center', position: 'relative', zIndex: 2, py: 8, px: { xs: 3, sm: 5, md: 8 } }}>
        {filteredPlanets.map((planet, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={planet.id} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15, 
                type: 'spring', 
                stiffness: 80,
                damping: 12
              }}
              whileHover={{ 
                scale: 1.2, 
                rotateY: 15,
                rotateX: 10,
                z: 50
              }}
              style={{ 
                perspective: '1000px',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                transformStyle: 'preserve-3d',
              }}
            >
              <Box
                component={Link}
                href={planet.path}
                sx={{
                  position: 'relative',
                  width: { xs: 200, sm: 220, md: 260, lg: 280, xl: 300 },
                  height: { xs: 200, sm: 220, md: 260, lg: 280, xl: 300 },
                  borderRadius: '50%',
                  background: planet.gradient,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d',
                  boxShadow: `
                    0 0 60px ${planet.color}50,
                    0 0 120px ${planet.color}30,
                    0 0 180px ${planet.color}15,
                    inset -30px -30px 100px rgba(0, 0, 0, 0.5),
                    inset 30px 30px 100px rgba(255, 255, 255, 0.1),
                    0 20px 60px rgba(0, 0, 0, 0.4)
                  `,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `
                      0 0 100px ${planet.color}70,
                      0 0 200px ${planet.color}50,
                      0 0 300px ${planet.color}30,
                      inset -40px -40px 120px rgba(0, 0, 0, 0.6),
                      inset 40px 40px 120px rgba(255, 255, 255, 0.15),
                      0 30px 80px rgba(0, 0, 0, 0.6)
                    `,
                    '& .planet-details': {
                      opacity: 1,
                      transform: 'translateY(0) scale(1)',
                    },
                    '& .planet-icon': {
                      transform: 'scale(1.1) rotate(360deg)',
                    },
                    '& .planet-ring': {
                      opacity: 1,
                      transform: 'rotate(360deg) scale(1.1)',
                    },
                  },
                  // 3D Textur-Effekt
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '8%',
                    left: '15%',
                    width: '35%',
                    height: '35%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                    filter: 'blur(15px)',
                    opacity: 0.8,
                    zIndex: 1,
                    animation: 'pulse 3s ease-in-out infinite',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '45%',
                    right: '12%',
                    width: '25%',
                    height: '25%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                    filter: 'blur(12px)',
                    opacity: 0.5,
                    zIndex: 1,
                    animation: 'pulse 4s ease-in-out infinite 1s',
                  },
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 0.5,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 0.9,
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                {/* Rotierender Ring um den Planeten */}
                <Box
                  className="planet-ring"
                  sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    right: '-10%',
                    bottom: '-10%',
                    borderRadius: '50%',
                    border: `2px solid ${planet.color}40`,
                    borderTopColor: planet.color,
                    borderRightColor: planet.color,
                    opacity: 0.3,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                
                {/* Planet Icon mit Rotation */}
                <motion.div
                  className="planet-icon"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 30, 
                    repeat: Infinity, 
                    ease: 'linear' 
                  }}
                  style={{ zIndex: 2, position: 'relative' }}
                >
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: { xs: '4rem', sm: '5rem', md: '6rem', lg: '7rem' },
                      mb: 0.5,
                      filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.4))',
                      zIndex: 2,
                      position: 'relative',
                      lineHeight: 1,
                      transition: 'all 0.5s ease',
                    }}
                  >
                    {planet.icon}
                  </Typography>
                </motion.div>
                
                {/* Planet Name mit Glow */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 900,
                    textShadow: `
                      0 0 10px ${planet.color},
                      0 0 20px ${planet.color}80,
                      0 2px 10px rgba(0, 0, 0, 0.9),
                      0 4px 20px rgba(0, 0, 0, 0.7)
                    `,
                    zIndex: 2,
                    position: 'relative',
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.3rem', lg: '1.5rem' },
                    mb: 0.5,
                    textAlign: 'center',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {planet.name}
                </Typography>
                
                {/* Element Chip mit Glow */}
                <Chip 
                  label={planet.element} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: planet.color,
                    border: `2px solid ${planet.color}60`,
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    fontWeight: 700,
                    backdropFilter: 'blur(15px)',
                    zIndex: 2,
                    position: 'relative',
                    height: { xs: 24, sm: 26, md: 28 },
                    boxShadow: `0 0 15px ${planet.color}40`,
                    '& .MuiChip-label': {
                      px: { xs: 1.5, sm: 2 },
                    },
                    '&:hover': {
                      boxShadow: `0 0 25px ${planet.color}60`,
                    },
                  }} 
                />
                
                {/* Hover Details Overlay mit Animation */}
                <Box
                  className="planet-details"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 50%, transparent 100%)',
                    p: 2.5,
                    opacity: 0,
                    transform: 'translateY(30px) scale(0.9)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 3,
                    borderRadius: '0 0 50% 50%',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: planet.color,
                      display: 'block',
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                      fontWeight: 700,
                      mb: 0.5,
                      textAlign: 'center',
                      textShadow: `0 0 10px ${planet.color}60`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {planet.energy}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      display: 'block',
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    {planet.influence}
                  </Typography>
                </Box>
                
                {/* Mehrschichtige Glow-Effekte */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 1,
                    animation: 'glow 3s ease-in-out infinite',
                    '@keyframes glow': {
                      '0%, 100%': { opacity: 0.6 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
                
                {/* Partikel-Effekt */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: planet.color,
                      top: `${20 + (i * 10)}%`,
                      left: `${15 + (i * 8)}%`,
                      boxShadow: `0 0 10px ${planet.color}, 0 0 20px ${planet.color}60`,
                      opacity: 0.6,
                      animation: `twinkle ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
                      zIndex: 1,
                      '@keyframes twinkle': {
                        '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                        '50%': { opacity: 1, transform: 'scale(1.2)' },
                      },
                    }}
                  />
                ))}
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      </PageLayout>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function PlanetsPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <PlanetsContent />
    </ProtectedRoute>
  );
}

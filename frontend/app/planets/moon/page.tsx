'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Target, 
  Crown,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlanetData } from '../../../hooks/usePlanetData';
import RotatingPlanetSymbol from '../../../components/RotatingPlanetSymbol';

export default function MoonPage() {
  const router = useRouter();

  // Lade Moon-Daten aus der Datenbank
  const { planetInfo, planetGates, planetCenters, loading, error } = usePlanetData('Moon');

  // Loading und Error States
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(192, 192, 192, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(230, 230, 250, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(240, 248, 255, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            style={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: '#C0C0C0',
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', zIndex: 1 }}
        >
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#C0C0C0',
              mb: 3,
              filter: 'drop-shadow(0 0 10px rgba(192, 192, 192, 0.5))'
            }} 
          />
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white',
              fontWeight: 600,
              textShadow: '0 0 20px rgba(192, 192, 192, 0.5)'
            }}
          >
            Lade Moon-Daten...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(192, 192, 192, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(230, 230, 250, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(240, 248, 255, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            style={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: '#C0C0C0',
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
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#ff6b6b',
              fontWeight: 600,
              textShadow: '0 0 20px rgba(255, 107, 107, 0.5)'
            }}
          >
            Fehler: {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Fallback-Daten falls Datenbank nicht verfügbar
  const fallbackMoonInfo = {
    planet_name: "Mond",
    symbol: "☽",
    orbital_period: "27.3 Tage",
    discovery: "Seit Anbeginn der Zeit",
    mythology: "Das Unterbewusstsein und die Emotionen",
    color: "#C0C0C0",
    description: "Der Mond repräsentiert unser Unterbewusstsein, unsere Emotionen und unsere instinktiven Reaktionen. Er zeigt, wie wir emotional reagieren und was uns antreibt."
  };




  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B0D12 0%, #1A1F2B 50%, #2D3748 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Stars */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, #C0C0C0, transparent),
          radial-gradient(2px 2px at 40px 70px, #C0C0C0, transparent),
          radial-gradient(1px 1px at 90px 40px, #C0C0C0, transparent),
          radial-gradient(1px 1px at 130px 80px, #C0C0C0, transparent),
          radial-gradient(2px 2px at 160px 30px, #C0C0C0, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Moon */}
      <motion.div
        
        animate={{ 
          opacity: 0.6, 
          scale: [1, 1.05, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 40, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '8%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, #F5F5F5, #E0E0E0, #C0C0C0),
            radial-gradient(circle at 70% 70%, #E0E0E0, #C0C0C0, #A0A0A0),
            radial-gradient(circle at 50% 50%, #FFFFFF, #F5F5F5),
            radial-gradient(circle at 20% 80%, #D3D3D3, #B0B0B0),
            radial-gradient(circle at 80% 20%, #F8F8FF, #E6E6FA)
          `,
          boxShadow: `
            0 0 30px rgba(245, 245, 245, 0.7),
            0 0 60px rgba(224, 224, 224, 0.5),
            0 0 90px rgba(192, 192, 192, 0.3),
            inset -10px -10px 20px rgba(160, 160, 160, 0.2)
          `,
          zIndex: 0
        }}
      >
        {/* Moon Surface Details - Craters */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '25%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'rgba(160, 160, 160, 0.8)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '55%',
          left: '60%',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'rgba(176, 176, 176, 0.7)',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '10%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          background: 'rgba(160, 160, 160, 0.6)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '70%',
          left: '30%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(192, 192, 192, 0.9)',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '35%',
          left: '75%',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(176, 176, 176, 0.8)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: 'rgba(160, 160, 160, 0.7)',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.4)'
        }} />
      </motion.div>

      {/* Moon Phases Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '0%',
          right: '3%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle, transparent 30%, rgba(245, 245, 245, 0.1) 50%, rgba(224, 224, 224, 0.2) 70%, transparent 100%)
          `,
          zIndex: -1
        }}
      />

      {/* Moonlight Rays */}
      <motion.div
        animate={{ 
          scale: [0, 1.2, 0],
          opacity: [0, 0.4, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeOut"
        }}
        style={{
          position: 'absolute',
          top: '18%',
          right: '20%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: '#F5F5F5',
          boxShadow: '0 0 8px rgba(245, 245, 245, 0.6)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.0, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          top: '28%',
          right: '30%',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          background: '#E0E0E0',
          boxShadow: '0 0 6px rgba(224, 224, 224, 0.5)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.4, 0],
          opacity: [0, 0.3, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '38%',
          right: '12%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
          zIndex: 0
        }}
      />

      {/* Moon Dust Particles */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '25%',
          right: '35%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#C0C0C0',
          boxShadow: '0 0 3px rgba(192, 192, 192, 0.5)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        style={{
          position: 'absolute',
          top: '45%',
          right: '45%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: '#E0E0E0',
          boxShadow: '0 0 2px rgba(224, 224, 224, 0.4)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          opacity: [0.1, 0.7, 0.1]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        style={{
          position: 'absolute',
          top: '65%',
          right: '25%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#F5F5F5',
          boxShadow: '0 0 4px rgba(245, 245, 245, 0.3)',
          zIndex: 0
        }}
      />

      {/* Earth Shadow (Lunar Eclipse Effect) */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '8%',
          right: '12%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, transparent 30%, rgba(139, 69, 19, 0.2) 50%, rgba(160, 82, 45, 0.3) 70%, transparent 100%)
          `,
          zIndex: 1
        }}
      />


      <Container maxWidth="lg" sx={{ padding: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/planets')}
            sx={{
              color: '#C0C0C0',
              borderColor: '#C0C0C0',
              '&:hover': {
                borderColor: '#C0C0C0',
                backgroundColor: 'rgba(192, 192, 192, 0.1)',
                boxShadow: '0 0 20px rgba(192, 192, 192, 0.3)'
              },
              marginRight: 2
            }}
          >
            <ArrowLeft size={20} style={{ marginRight: 8 }} />
            Zurück zu den Planeten
          </Button>
        </Box>

        {/* Title mit rotierendem Planetensymbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            {/* Großes rotierendes Mond-Symbol */}
            <Box sx={{ mb: 3 }}>
              <RotatingPlanetSymbol
                symbol={planetInfo?.symbol || fallbackMoonInfo.symbol}
                color={planetInfo?.color || fallbackMoonInfo.color}
                gradient="linear-gradient(135deg, #C0C0C0 0%, #E6E6FA 50%, #F0F8FF 100%)"
                size="large"
              />
            </Box>
            
            {/* Planet Name */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                color: '#ffffff',
                textShadow: `
                  0 0 10px ${planetInfo?.color || fallbackMoonInfo.color},
                  0 0 20px ${planetInfo?.color || fallbackMoonInfo.color}80,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {planetInfo?.planet_name || fallbackMoonInfo.planet_name}
            </Typography>
            
            <Typography variant="h5" style={{ color: planetInfo?.color || fallbackMoonInfo.color, fontStyle: 'italic', fontWeight: 600, mb: 2 }}>
              {planetInfo?.mythology || fallbackMoonInfo.mythology}
            </Typography>
            
            <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2, maxWidth: '700px', margin: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {planetInfo?.description || fallbackMoonInfo.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Overview Widget */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #C0C0C0',
            boxShadow: '0 8px 32px rgba(192, 192, 192, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Box sx={{ marginRight: 2 }}>
                <RotatingPlanetSymbol
                  symbol={planetInfo?.symbol || fallbackMoonInfo.symbol}
                  color={planetInfo?.color || fallbackMoonInfo.color}
                  gradient="linear-gradient(135deg, #C0C0C0 0%, #E6E6FA 50%, #F0F8FF 100%)"
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="h5" style={{ color: 'white', fontWeight: 600 }}>
                  {planetInfo?.planet_name || fallbackMoonInfo.planet_name} - Übersicht
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Grundlegende Informationen über {planetInfo?.planet_name || fallbackMoonInfo.planet_name}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                    Umlaufzeit
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {planetInfo?.orbital_period || fallbackMoonInfo.orbital_period}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                    Entdeckung
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {planetInfo?.discovery || fallbackMoonInfo.discovery}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                    Mythologie
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {planetInfo?.mythology || fallbackMoonInfo.mythology}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                    Farbe
                  </Typography>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    backgroundColor: planetInfo?.color || fallbackMoonInfo.color,
                    margin: 'auto',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Moon in Gates */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #C0C0C0',
            boxShadow: '0 8px 32px rgba(192, 192, 192, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Target size={24} color="#C0C0C0" />
                <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                  Mond in den Gates
                </Typography>
              </Box>
              <Chip 
                label="Gates 1-8 von 64" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(192,192,192,0.2)',
                  color: '#C0C0C0',
                  fontSize: '10px'
                }} 
              />
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Hier sind alle 64 Gates mit Mond-Informationen. Der Mond zeigt unsere emotionalen Reaktionen und unser Unterbewusstsein in jedem Gate.
            </Typography>
            <List>
              {planetGates?.map((gate, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color="#C0C0C0" />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #C0C0C0, #A0A0A0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                          {gate.gate_number}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {gate.name || `Gate ${gate.gate_number}`}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {gate.description || 'Mond Emotionen'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="Unterbewusstsein" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(192,192,192,0.2)',
                        color: '#C0C0C0',
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>
                        {gate.description || 'Mond Emotionen und Unterbewusstsein'}
                      </Typography>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 2, fontWeight: 500 }}>
                        {gate.description || 'Mond Emotionen und Unterbewusstsein in diesem Gate'}
                      </Typography>
                      
                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#FF6B6B', marginBottom: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {gate.shadow_aspects ? (typeof gate.shadow_aspects === 'string' ? JSON.parse(gate.shadow_aspects) : gate.shadow_aspects).map((aspect: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={aspect} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          )) : (
                            <Chip 
                              label="Emotionale Blockaden" 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#4CAF50', marginBottom: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {gate.gifts ? (typeof gate.gifts === 'string' ? JSON.parse(gate.gifts) : gate.gifts).map((gift: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={gift} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          )) : (
                            <Chip 
                              label="Emotionale Geschenke" 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(192,192,192,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(192,192,192,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                          Emotionale Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.affirmation || 'Ich fühle meine Emotionen bewusst und nutze sie als Quelle der Weisheit. Meine Emotionalität ist ein Geschenk.'}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Moon in Centers */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #C0C0C0',
            boxShadow: '0 8px 32px rgba(192, 192, 192, 0.2)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Crown size={24} color="#C0C0C0" />
              <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                Mond in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Der Mond in den 9 Centers zeigt, wo unsere emotionalen Reaktionen und unser Unterbewusstsein am stärksten wirken.
            </Typography>
            <List>
              {planetCenters?.map((center, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color="#C0C0C0" />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #C0C0C0, #A0A0A0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Crown size={20} color="#000" />
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {center.center_name}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {center.description || 'Mond Emotionen'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="Unterbewusstsein" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(192,192,192,0.2)',
                        color: '#C0C0C0',
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>
                        {center.description || 'Mond Emotionen in diesem Center'}
                      </Typography>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 2, fontWeight: 500 }}>
                        {center.description || 'Mond Emotionen und Unterbewusstsein in diesem Center'}
                      </Typography>
                      
                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#FF6B6B', marginBottom: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {center.shadow_aspects ? (typeof center.shadow_aspects === 'string' ? JSON.parse(center.shadow_aspects) : center.shadow_aspects).map((aspect: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={aspect} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          )) : (
                            <Chip 
                              label="Emotionale Blockaden" 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#4CAF50', marginBottom: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {center.gifts ? (typeof center.gifts === 'string' ? JSON.parse(center.gifts) : center.gifts).map((gift: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={gift} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          )) : (
                            <Chip 
                              label="Emotionale Geschenke" 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(192,192,192,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(192,192,192,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#C0C0C0', fontWeight: 600, marginBottom: 1 }}>
                          Emotionale Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.affirmation || 'Ich fühle meine Emotionen bewusst in diesem Center und nutze sie als Quelle der Weisheit. Meine Emotionalität ist ein Geschenk.'}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

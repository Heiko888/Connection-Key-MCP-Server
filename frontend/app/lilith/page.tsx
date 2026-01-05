'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Star, 
  Crown,
  ArrowLeft,
  ChevronDown,
  Moon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { allLilithGates } from './gatesData';
import ProtectedRoute from '@/components/ProtectedRoute';

// Funktion zum Laden aller Lilith Gates mit echten Daten
async function loadAllLilithGates() {
  return allLilithGates;
}

interface LilithInfo {
  id: string;
  name: string;
  symbol: string;
  orbital_period: string;
  discovery: string;
  mythology: string;
  color: string;
  description: string;
}

interface LilithCenter {
  id: string;
  center_name: string;
  essence: string;
  consciousness: string;
  description: string;
  deep_meaning: string;
  shadow_aspects: string[];
  gifts: string[];
  affirmation: string;
  gates: number[];
}

interface LilithGate {
  gate: number;
  name: string;
  description: string;
  deep_meaning: string;
  shadow_aspects: string;
  gifts: string;
  affirmation: string;
  unconscious_description?: string;
  unconscious_deep_meaning?: string;
  unconscious_shadow_aspects?: string;
  unconscious_gifts?: string;
  unconscious_affirmation?: string;
}

function LilithContent() {
  const router = useRouter();
  const [lilithInfo, setLilithInfo] = useState<LilithInfo | null>(null);
  const [lilithCenters, setLilithCenters] = useState<LilithCenter[]>([]);
  const [lilithGates, setLilithGates] = useState<LilithGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLilithData = async () => {
      try {
        setLoading(true);
        
        // Fallback Lilith Info
        const fallbackInfo: LilithInfo = {
          id: '1',
          name: 'Lilith',
          symbol: '⚸',
          orbital_period: '4.1 Jahre',
          discovery: '1884',
          mythology: 'Die Wilde Frau',
          color: '#8B5CF6',
          description: 'Lilith repräsentiert unsere wilde, unabhängige Seite und zeigt, wo wir uns von gesellschaftlichen Erwartungen befreien müssen.'
        };
        setLilithInfo(fallbackInfo);

        // Fallback Lilith Centers
        const fallbackCenters: LilithCenter[] = [
          { id: '1', center_name: 'Kopf', essence: 'Inspiration & Druck', consciousness: 'Bewusst', description: 'Lilith im Kopf zeigt deine wilde Kreativität.', deep_meaning: 'Deine unkonventionellen Gedanken sind deine Stärke.', shadow_aspects: ['Rebellion', 'Chaos'], gifts: ['Kreativität', 'Innovation'], affirmation: 'Ich denke wild und frei.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '2', center_name: 'Ajna', essence: 'Konzeptualisierung & Druck', consciousness: 'Bewusst', description: 'Lilith in der Ajna zeigt deine wilde Intuition.', deep_meaning: 'Deine unkonventionelle Wahrnehmung ist dein Geschenk.', shadow_aspects: ['Verwirrung', 'Chaos'], gifts: ['Intuition', 'Weisheit'], affirmation: 'Ich sehe die Wahrheit jenseits der Illusion.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '3', center_name: 'Kehle', essence: 'Kommunikation & Manifestation', consciousness: 'Bewusst', description: 'Lilith in der Kehle zeigt deine wilde Stimme.', deep_meaning: 'Deine unkonventionelle Kommunikation ist deine Kraft.', shadow_aspects: ['Aggression', 'Chaos'], gifts: ['Kommunikation', 'Manifestation'], affirmation: 'Ich spreche meine Wahrheit ohne Filter.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '4', center_name: 'G', essence: 'Identität & Richtung', consciousness: 'Bewusst', description: 'Lilith im G zeigt deine wilde Identität.', deep_meaning: 'Deine unkonventionelle Identität ist dein Geschenk.', shadow_aspects: ['Verwirrung', 'Chaos'], gifts: ['Identität', 'Richtung'], affirmation: 'Ich bin wer ich bin, ohne Kompromisse.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '5', center_name: 'Herz', essence: 'Ego & Willenskraft', consciousness: 'Bewusst', description: 'Lilith im Herz zeigt deine wilde Willenskraft.', deep_meaning: 'Deine unkonventionelle Willenskraft ist deine Stärke.', shadow_aspects: ['Aggression', 'Chaos'], gifts: ['Willenskraft', 'Ego'], affirmation: 'Ich will was ich will, ohne Entschuldigung.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '6', center_name: 'Sakral', essence: 'Lebenskraft & Antwort', consciousness: 'Bewusst', description: 'Lilith im Sakral zeigt deine wilde Lebenskraft.', deep_meaning: 'Deine unkonventionelle Lebenskraft ist dein Geschenk.', shadow_aspects: ['Überstimulation', 'Chaos'], gifts: ['Lebenskraft', 'Kreativität'], affirmation: 'Ich lebe mit wilder Lebenskraft.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '7', center_name: 'Milz', essence: 'Intuition & Sicherheit', consciousness: 'Bewusst', description: 'Lilith in der Milz zeigt deine wilde Intuition.', deep_meaning: 'Deine unkonventionelle Intuition ist deine Stärke.', shadow_aspects: ['Angst', 'Chaos'], gifts: ['Intuition', 'Sicherheit'], affirmation: 'Ich vertraue meiner wilden Intuition.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '8', center_name: 'Solarplexus', essence: 'Emotionen & Spiritualität', consciousness: 'Bewusst', description: 'Lilith im Solarplexus zeigt deine wilden Emotionen.', deep_meaning: 'Deine unkonventionellen Emotionen sind dein Geschenk.', shadow_aspects: ['Emotionale Turbulenzen', 'Chaos'], gifts: ['Emotionen', 'Spiritualität'], affirmation: 'Ich fühle meine wilden Emotionen vollständig.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] },
          { id: '9', center_name: 'Wurzel', essence: 'Adrenalin & Druck', consciousness: 'Bewusst', description: 'Lilith in der Wurzel zeigt deine wilde Kraft.', deep_meaning: 'Deine unkonventionelle Kraft ist deine Stärke.', shadow_aspects: ['Stress', 'Chaos'], gifts: ['Kraft', 'Durchhaltevermögen'], affirmation: 'Ich stehe mit wilder Kraft für mich ein.', gates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64] }
        ];
        setLilithCenters(fallbackCenters);

        // Lilith Gates - alle 64 Gates direkt laden
        const gatesData = await loadAllLilithGates();
        setLilithGates(gatesData);

      } catch (err) {
        console.error('Fehler beim Laden der Lilith-Daten:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    };

    fetchLilithData();
  }, []);

  // Loading und Error States
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B0D12 0%, #1A1F2B 50%, #2D3748 100%)',
        color: 'white'
      }}>
        <Typography variant="h4">Lade Lilith-Daten...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B0D12 0%, #1A1F2B 50%, #2D3748 100%)',
        color: 'white'
      }}>
        <Typography variant="h4">Fehler beim Laden der Daten: {error}</Typography>
      </Box>
    );
  }

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
          radial-gradient(2px 2px at 20px 30px, #8B5CF6, transparent),
          radial-gradient(2px 2px at 40px 70px, #8B5CF6, transparent),
          radial-gradient(1px 1px at 90px 40px, #8B5CF6, transparent),
          radial-gradient(1px 1px at 130px 80px, #8B5CF6, transparent),
          radial-gradient(2px 2px at 160px 30px, #8B5CF6, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Lilith */}
      <motion.div
        
        animate={{ 
          opacity: 0.4, 
          scale: [1, 1.08, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%)',
          filter: 'blur(1px)',
          zIndex: 1
        }}
      />

      {/* Energy Waves */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '8%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          zIndex: 0
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '8%',
          right: '6%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {/* Header */}
        <motion.div
          
          
          
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
            <Button
              startIcon={<ArrowLeft />}
              onClick={() => router.back()}
              sx={{ 
                mr: 3, 
                color: '#8B5CF6',
                borderColor: '#8B5CF6',
                '&:hover': {
                  borderColor: '#A78BFA',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
              variant="outlined"
            >
              Zurück
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1
              }}>
                <Moon size={60} />
                {lilithInfo?.name || 'Lilith'}
              </Typography>
              <Typography variant="h5" sx={{ color: '#A78BFA', fontWeight: 300 }}>
                {lilithInfo?.mythology || 'Die Wilde Frau'}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Lilith Info */}
        {lilithInfo && (
          <motion.div
            
            
            
          >
            <Card sx={{ 
              mb: 6, 
              background: 'rgba(139, 92, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <Typography variant="h1" sx={{ 
                          color: '#8B5CF6',
                          fontSize: '8rem',
                          lineHeight: 1,
                          filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))'
                        }}>
                          {lilithInfo.symbol}
                        </Typography>
                      </motion.div>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: '#8B5CF6',
                        mt: 2
                      }}>
                        {lilithInfo.name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ 
                      color: '#A78BFA', 
                      mb: 2,
                      fontWeight: 300
                    }}>
                      {lilithInfo.mythology}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 3, 
                      lineHeight: 1.8,
                      fontSize: '1.1rem'
                    }}>
                      {lilithInfo.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Chip 
                          icon={<Star />} 
                          label={`Umlaufzeit: ${lilithInfo.orbital_period}`} 
                          sx={{ 
                            bgcolor: 'rgba(139, 92, 246, 0.2)', 
                            color: '#A78BFA',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Chip 
                          icon={<Globe />} 
                          label={`Entdeckung: ${lilithInfo.discovery}`} 
                          sx={{ 
                            bgcolor: 'rgba(139, 92, 246, 0.2)', 
                            color: '#A78BFA',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }} 
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lilith in Centers */}
        <motion.div
          
          
          
        >
          <Typography variant="h3" sx={{ 
            fontWeight: 'bold', 
            color: '#8B5CF6', 
            mb: 4,
            textAlign: 'center'
          }}>
            Lilith in den Zentren
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {lilithCenters.map((center, index) => (
              <Grid item xs={12} md={6} key={center.id}>
                <motion.div
                  
                  
                  
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(139, 92, 246, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: '50%', 
                          bgcolor: '#8B5CF6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mr: 2,
                          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                        }}>
                          <Crown size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                            {center.center_name}
                          </Typography>
                          <Chip 
                            label={center.essence} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(139, 92, 246, 0.2)', 
                              color: '#A78BFA',
                              border: '1px solid rgba(139, 92, 246, 0.3)'
                            }} 
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {center.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Lilith in Gates */}
        <motion.div
          
          
          
        >
          <Typography variant="h3" sx={{ 
            fontWeight: 'bold', 
            color: '#8B5CF6', 
            mb: 4,
            textAlign: 'center'
          }}>
            Lilith in den Toren
          </Typography>
          
          <Card sx={{ 
            background: 'rgba(139, 92, 246, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {lilithGates.map((gate, index) => (
                  <Accordion key={index} sx={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: 2,
                    mb: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0 0 8px 0' },
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.4)'
                    }
                  }}>
                    <AccordionSummary
                      expandIcon={<ChevronDown style={{ color: '#8B5CF6' }} />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: '#8B5CF6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)'
                        }}>
                          {gate.gate}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                            {gate.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#A78BFA' }}>
                            Tor {gate.gate}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {gate.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#8B5CF6', mb: 1 }}>
                            Tiefe Bedeutung:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.deep_meaning}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#8B5CF6', mb: 1 }}>
                            Schatten-Aspekte:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.shadow_aspects}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#8B5CF6', mb: 1 }}>
                            Geschenke:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.gifts}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(139, 92, 246, 0.2)', 
                          borderRadius: 2,
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#8B5CF6', mb: 1 }}>
                            Affirmation:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
                            {gate.affirmation}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function LilithPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <LilithContent />
    </ProtectedRoute>
  );
}

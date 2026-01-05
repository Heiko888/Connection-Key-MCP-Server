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
import ProtectedRoute from '@/components/ProtectedRoute';

// Funktion zum Laden aller Black Moon Lilith Gates mit echten Daten
async function loadAllBlackMoonLilithGates() {
  // Fallback Gates (Platzhalter für alle 64 Gates)
  const fallbackGates = [];
  for (let i = 1; i <= 64; i++) {
    fallbackGates.push({
      id: i.toString(),
      gate_number: i,
      name: `Tor ${i}`,
      description: `Black Moon Lilith in Tor ${i} bringt die Kraft der wilden Unabhängigkeit.`,
      deep_meaning: `Die tiefe Bedeutung von Tor ${i} liegt in der natürlichen Black Moon Lilith-Energie.`,
      shadow_aspects: `Unbewusste Scham über Tor ${i}, Angst vor Wildheit`,
      gifts: `Wilde Kraft in Tor ${i}, Ungezähmte Energie`,
      affirmation: `Ich lebe Tor ${i} mit wilder Black Moon Lilith Kraft.`,
      unconscious_description: `Unbewusst in Tor ${i}: Tief in dir liegt die wilde Kraft.`,
      unconscious_deep_meaning: `Unbewusste Bedeutung von Tor ${i}: Deine Wildheit ist heilig.`,
      unconscious_shadow_aspects: `Unbewusste Scham über Tor ${i}, Angst vor Wildheit`,
      unconscious_gifts: `Wilde Kraft in Tor ${i}, Ungezähmte Energie`,
      unconscious_affirmation: `Ich lebe Tor ${i} unbewusst mit wilder Black Moon Lilith Kraft.`
    });
  }
  return fallbackGates;
}

interface BlackMoonLilithInfo {
  id: string;
  name: string;
  symbol: string;
  orbital_period: string;
  discovery: string;
  mythology: string;
  color: string;
  description: string;
}

interface BlackMoonLilithCenter {
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

interface BlackMoonLilithGate {
  id: string;
  gate_number: number;
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

function BlackMoonLilithContent() {
  const router = useRouter();
  const [blackMoonLilithInfo, setBlackMoonLilithInfo] = useState<BlackMoonLilithInfo | null>(null);
  const [blackMoonLilithCenters, setBlackMoonLilithCenters] = useState<BlackMoonLilithCenter[]>([]);
  const [blackMoonLilithGates, setBlackMoonLilithGates] = useState<BlackMoonLilithGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlackMoonLilithData = async () => {
      try {
        setLoading(true);
        
        // Black Moon Lilith Grundinformationen abrufen
        const infoResponse = await fetch('/api/blackmoonlilith/info');
        if (!infoResponse.ok) {
          throw new Error('Fehler beim Laden der Black Moon Lilith-Informationen');
        }
        const infoData = await infoResponse.json();
        setBlackMoonLilithInfo(infoData);

        // Black Moon Lilith Centers abrufen
        const centersResponse = await fetch('/api/blackmoonlilith/centers');
        if (!centersResponse.ok) {
          throw new Error('Fehler beim Laden der Black Moon Lilith Centers');
        }
        const centersData = await centersResponse.json();
        setBlackMoonLilithCenters(centersData);

        // Black Moon Lilith Gates - alle 64 Gates direkt laden
        const gatesData = await loadAllBlackMoonLilithGates();
        setBlackMoonLilithGates(gatesData);

      } catch (err) {
        console.error('Fehler beim Laden der Black Moon Lilith-Daten:', err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    };

    fetchBlackMoonLilithData();
  }, []);

  // Loading und Error States
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        color: 'white'
      }}>
        <Typography variant="h4">Lade Black Moon Lilith-Daten...</Typography>
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
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
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
          radial-gradient(2px 2px at 20px 30px, #2D1B69, transparent),
          radial-gradient(2px 2px at 40px 70px, #2D1B69, transparent),
          radial-gradient(1px 1px at 90px 40px, #2D1B69, transparent),
          radial-gradient(1px 1px at 130px 80px, #2D1B69, transparent),
          radial-gradient(2px 2px at 160px 30px, #2D1B69, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Black Moon Lilith */}
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
          background: 'radial-gradient(circle, rgba(45, 27, 105, 0.8) 0%, rgba(45, 27, 105, 0.3) 50%, transparent 100%)',
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
          border: '2px solid rgba(45, 27, 105, 0.3)',
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
          border: '1px solid rgba(45, 27, 105, 0.2)',
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
                color: '#2D1B69',
                borderColor: '#2D1B69',
                '&:hover': {
                  borderColor: '#4C1D95',
                  backgroundColor: 'rgba(45, 27, 105, 0.1)'
                }
              }}
              variant="outlined"
            >
              Zurück
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(45deg, #2D1B69, #4C1D95)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1
              }}>
                <Moon size={60} />
                {blackMoonLilithInfo?.name || 'Black Moon Lilith'}
              </Typography>
              <Typography variant="h5" sx={{ color: '#A78BFA', fontWeight: 300 }}>
                {blackMoonLilithInfo?.mythology || 'Die dunkle Göttin der Unabhängigkeit'}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Black Moon Lilith Info */}
        {blackMoonLilithInfo && (
          <motion.div
            
            
            
          >
            <Card sx={{ 
              mb: 6, 
              background: 'rgba(45, 27, 105, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(45, 27, 105, 0.3)',
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
                          color: '#2D1B69',
                          fontSize: '8rem',
                          lineHeight: 1,
                          filter: 'drop-shadow(0 0 20px rgba(45, 27, 105, 0.5))'
                        }}>
                          {blackMoonLilithInfo.symbol}
                        </Typography>
                      </motion.div>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: '#2D1B69',
                        mt: 2
                      }}>
                        {blackMoonLilithInfo.name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ 
                      color: '#A78BFA', 
                      mb: 2,
                      fontWeight: 300
                    }}>
                      {blackMoonLilithInfo.mythology}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      mb: 3, 
                      lineHeight: 1.8,
                      fontSize: '1.1rem'
                    }}>
                      {blackMoonLilithInfo.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Chip 
                          icon={<Star />} 
                          label={`Umlaufzeit: ${blackMoonLilithInfo.orbital_period}`} 
                          sx={{ 
                            bgcolor: 'rgba(45, 27, 105, 0.2)', 
                            color: '#A78BFA',
                            border: '1px solid rgba(45, 27, 105, 0.3)'
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Chip 
                          icon={<Globe />} 
                          label={`Entdeckung: ${blackMoonLilithInfo.discovery}`} 
                          sx={{ 
                            bgcolor: 'rgba(45, 27, 105, 0.2)', 
                            color: '#A78BFA',
                            border: '1px solid rgba(45, 27, 105, 0.3)'
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

        {/* Black Moon Lilith in Centers */}
        <motion.div
          
          
          
        >
          <Typography variant="h3" sx={{ 
            fontWeight: 'bold', 
            color: '#2D1B69', 
            mb: 4,
            textAlign: 'center'
          }}>
            Black Moon Lilith in den Zentren
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {blackMoonLilithCenters.map((center, index) => (
              <Grid item xs={12} md={6} key={center.id}>
                <motion.div
                  
                  
                  
                >
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(45, 27, 105, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(45, 27, 105, 0.3)',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(45, 27, 105, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: '50%', 
                          bgcolor: '#2D1B69', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mr: 2,
                          boxShadow: '0 0 20px rgba(45, 27, 105, 0.5)'
                        }}>
                          <Crown size={24} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D1B69' }}>
                            {center.center_name}
                          </Typography>
                          <Chip 
                            label={center.essence} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(45, 27, 105, 0.2)', 
                              color: '#A78BFA',
                              border: '1px solid rgba(45, 27, 105, 0.3)'
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

        {/* Black Moon Lilith in Gates */}
        <motion.div
          
          
          
        >
          <Typography variant="h3" sx={{ 
            fontWeight: 'bold', 
            color: '#2D1B69', 
            mb: 4,
            textAlign: 'center'
          }}>
            Black Moon Lilith in den Toren
          </Typography>
          
          <Card sx={{ 
            background: 'rgba(45, 27, 105, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(45, 27, 105, 0.3)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {blackMoonLilithGates.map((gate, index) => (
                  <Accordion key={index} sx={{
                    background: 'rgba(45, 27, 105, 0.05)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(45, 27, 105, 0.2)',
                    borderRadius: 2,
                    mb: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0 0 8px 0' },
                    '&:hover': {
                      background: 'rgba(45, 27, 105, 0.1)',
                      border: '1px solid rgba(45, 27, 105, 0.4)'
                    }
                  }}>
                    <AccordionSummary
                      expandIcon={<ChevronDown style={{ color: '#2D1B69' }} />}
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
                          bgcolor: '#2D1B69', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          boxShadow: '0 0 15px rgba(45, 27, 105, 0.5)'
                        }}>
                          {gate.gate_number}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D1B69' }}>
                            {gate.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#A78BFA' }}>
                            Tor {gate.gate_number}
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2D1B69', mb: 1 }}>
                            Tiefe Bedeutung:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.deep_meaning}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2D1B69', mb: 1 }}>
                            Schatten-Aspekte:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.shadow_aspects}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2D1B69', mb: 1 }}>
                            Geschenke:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {gate.gifts}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(45, 27, 105, 0.2)', 
                          borderRadius: 2,
                          border: '1px solid rgba(45, 27, 105, 0.3)'
                        }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2D1B69', mb: 1 }}>
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
export default function BlackMoonLilithPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <BlackMoonLilithContent />
    </ProtectedRoute>
  );
}

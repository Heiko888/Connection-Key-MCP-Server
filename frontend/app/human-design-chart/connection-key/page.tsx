'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Heart,
  Key,
  Sparkles,
  Users,
  Target,
  Zap,
  Link as LinkIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConnectionKeyAnalyzer from '@/components/ConnectionKeyAnalyzer';
import PageLayout from '@/app/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ConnectionKeyFormProps {
  onSubmit: (birthDate: string, birthTime: string, birthPlace: string, name: string) => void;
  loading: boolean;
  error: string | null;
}

function ConnectionKeyFormComponent({ onSubmit, loading, error }: ConnectionKeyFormProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate && birthTime && birthPlace) {
      onSubmit(birthDate, birthTime, birthPlace, name);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert severity="error" sx={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Name der Person"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtsdatum"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtszeit"
        type="time"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtsort"
        value={birthPlace}
        onChange={(e) => setBirthPlace(e.target.value)}
        required
        fullWidth
        placeholder="z.B. Berlin, Deutschland"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={loading || !name || !birthDate || !birthTime || !birthPlace}
        sx={{
          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
          color: 'white',
          fontWeight: 600,
          py: 1.5,
          '&:hover': {
            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
          },
          '&:disabled': {
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)'
          },
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'Berechne Chart...' : '🩵 Resonanzanalyse starten'}
      </Button>
    </Box>
  );
}

function ConnectionKeyContent() {
  const router = useRouter();
  const [showConnectionKeyModal, setShowConnectionKeyModal] = useState(false);
  const [person2Data, setPerson2Data] = useState<any>(null);
  const [loadingPerson2, setLoadingPerson2] = useState(false);
  const [person2Error, setPerson2Error] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Lade User-Daten
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const data = JSON.parse(userData);
          setUserName(data.firstName || data.first_name || 'Du');
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage for userData:', e);
    }

    // Lade Chart-Daten
    try {
      const userChart = localStorage.getItem('userChart');
      if (userChart) {
        try {
          const chart = JSON.parse(userChart);
          setChartData(chart);
        } catch (e) {
          console.error('Error parsing userChart:', e);
        }
      } else {
        console.warn('Keine Chart-Daten im localStorage gefunden. Bitte erstelle zuerst dein Human Design Chart.');
      }
    } catch (e) {
      console.error('Error accessing localStorage for userChart:', e);
    }
  }, []);

  // Blockiere Body-Scroll wenn Modal geöffnet ist
  useEffect(() => {
    if (showConnectionKeyModal) {
      // Speichere die aktuelle Scroll-Position
      const scrollY = window.scrollY;
      // Blockiere Body-Scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Stelle Body-Scroll wieder her
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showConnectionKeyModal]);

  const calculatePerson2Chart = async (birthDate: string, birthTime: string, birthPlace: string, name: string) => {
    setLoadingPerson2(true);
    setPerson2Error(null);

    try {
      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace: typeof birthPlace === 'string' ? {
            latitude: 52.52,
            longitude: 13.405,
            timezone: 'Europe/Berlin',
            name: birthPlace
          } : birthPlace
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Berechnen des Charts');
      }

      const result = await response.json();
      
      const convertCenters = (definedCenters: string[]) => ({
        krone: definedCenters?.includes('Head') || definedCenters?.includes('HEAD') ? 'definiert' : 'undefiniert',
        ajna: definedCenters?.includes('Ajna') || definedCenters?.includes('AJNA') ? 'definiert' : 'undefiniert',
        kehle: definedCenters?.includes('Throat') || definedCenters?.includes('THROAT') ? 'definiert' : 'undefiniert',
        gZentrum: definedCenters?.includes('G') || definedCenters?.includes('G_CENTER') ? 'definiert' : 'undefiniert',
        herzEgo: definedCenters?.includes('Heart') || definedCenters?.includes('HEART') ? 'definiert' : 'undefiniert',
        sakral: definedCenters?.includes('Sacral') || definedCenters?.includes('SACRAL') ? 'definiert' : 'undefiniert',
        solarplexus: definedCenters?.includes('Solar') || definedCenters?.includes('SOLAR') ? 'definiert' : 'undefiniert',
        milz: definedCenters?.includes('Spleen') || definedCenters?.includes('SPLEEN') ? 'definiert' : 'undefiniert',
        wurzel: definedCenters?.includes('Root') || definedCenters?.includes('ROOT') ? 'definiert' : 'undefiniert',
      });

      setPerson2Data({
        name,
        gates: result.chart?.gates || result.chart?.activeGates || [],
        centers: convertCenters(result.chart?.definedCenters || []),
        type: result.chart?.type,
        profile: result.chart?.profile,
        authority: result.chart?.authority,
        strategy: result.chart?.strategy,
      });

      setShowConnectionKeyModal(true);
    } catch (err: any) {
      console.error('Fehler beim Berechnen des Charts:', err);
      setPerson2Error(err.message || 'Fehler beim Berechnen des Charts');
    } finally {
      setLoadingPerson2(false);
    }
  };

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
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2, flexWrap: 'wrap', gap: 2 }}>
              <Heart size={48} color="#F29F05" />
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
                letterSpacing: '-0.02em',
                textShadow: '0 0 30px rgba(242, 159, 5, 0.3)'
              }}>
                🩵 Connection Key Resonanzanalyse
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}>
              Die energetische Verbindung zwischen zwei Menschen
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              marginTop: 2, 
              maxWidth: '700px', 
              margin: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '0.95rem', md: '1.05rem' }
            }}>
              Analysiere die energetische Verbindung zwischen dir und einer anderen Person. 
              Entdecke Goldadern, komplementäre Tore und die Resonanz, die euch verbindet.
            </Typography>
          </Box>
        </motion.div>

        {/* Connection Key Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: 4,
            marginBottom: 4
          }}>
            <CardContent>
              {!chartData && (
                <Alert severity="warning" sx={{ mb: 3, background: 'rgba(242, 159, 5, 0.1)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
                  <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                    ⚠️ Keine Chart-Daten gefunden
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Um die Connection Key Resonanzanalyse zu nutzen, benötigst du zuerst dein Human Design Chart. 
                    Bitte erstelle dein Chart auf der{' '}
                    <Link href="/human-design-chart" style={{ color: '#F29F05', textDecoration: 'underline' }}>
                      Human Design Chart Seite
                    </Link>.
                  </Typography>
                </Alert>
              )}
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <ConnectionKeyFormComponent 
                  onSubmit={calculatePerson2Chart}
                  loading={loadingPerson2}
                  error={person2Error}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.06)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(242, 159, 5, 0.3)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Sparkles size={28} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                    Goldadern
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Entdecke die unsichtbaren Linien der Verbindung, die zwischen euch existieren.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.06)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(242, 159, 5, 0.3)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <LinkIcon size={28} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                    Komplementäre Tore
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Sieh, welche Tore sich ergänzen und neue Kanäle bilden.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.06)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(242, 159, 5, 0.3)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Zap size={28} color="white" />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                    Resonanz
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Verstehe die energetische Resonanz, die euch verbindet.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </PageLayout>

      {/* Connection Key Analyse Modal */}
      <Dialog
        open={showConnectionKeyModal}
        onClose={() => setShowConnectionKeyModal(false)}
        maxWidth="xl"
        fullWidth
        disableScrollLock={false}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
          }
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
            borderRadius: 3,
            maxHeight: '95vh',
            height: { xs: '95vh', md: '90vh' },
            border: '1px solid rgba(242, 159, 5, 0.2)',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
          borderBottom: '2px solid rgba(242, 159, 5, 0.3)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2,
          px: 3,
          flexShrink: 0,
        }}>
          <Box sx={{ fontSize: 32 }}>🩵</Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              Connection Key Resonanzanalyse
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
              {userName || 'Du'} & {person2Data?.name || 'Person 2'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: 'auto',
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(242, 159, 5, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(242, 159, 5, 0.5)',
            },
          },
        }}>
          {person2Data && chartData ? (
            <Box>
              <ConnectionKeyAnalyzer
                person1Gates={(() => {
                  try {
                    let gates: number[] = [];
                    if (Array.isArray(chartData.gates) && chartData.gates.length > 0) {
                      gates = chartData.gates;
                    } else if (Array.isArray(chartData.hdChart?.gates) && chartData.hdChart.gates.length > 0) {
                      gates = chartData.hdChart.gates;
                    } else if (Array.isArray(chartData.hdChart?.activeGates) && chartData.hdChart.activeGates.length > 0) {
                      gates = chartData.hdChart.activeGates;
                    }
                    gates = gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g)).filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
                    return gates;
                  } catch (e) {
                    console.error('Error extracting person1Gates:', e);
                    return [];
                  }
                })()}
                person2Gates={(() => {
                  try {
                    let gates: number[] = [];
                    if (Array.isArray(person2Data.gates) && person2Data.gates.length > 0) {
                      gates = person2Data.gates;
                    }
                    gates = gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g)).filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
                    return gates;
                  } catch (e) {
                    console.error('Error extracting person2Gates:', e);
                    return [];
                  }
                })()}
                person1Centers={(() => {
                  try {
                    const centersArray = Array.isArray(chartData.centers) ? chartData.centers : [];
                    return {
                      krone: centersArray.includes('Head') || centersArray.includes('HEAD') ? 'definiert' : 'undefiniert',
                      ajna: centersArray.includes('Ajna') || centersArray.includes('AJNA') ? 'definiert' : 'undefiniert',
                      kehle: centersArray.includes('Throat') || centersArray.includes('THROAT') ? 'definiert' : 'undefiniert',
                      gZentrum: centersArray.includes('G') || centersArray.includes('G_CENTER') ? 'definiert' : 'undefiniert',
                      herzEgo: centersArray.includes('Heart') || centersArray.includes('HEART') ? 'definiert' : 'undefiniert',
                      sakral: centersArray.includes('Sacral') || centersArray.includes('SACRAL') ? 'definiert' : 'undefiniert',
                      solarplexus: centersArray.includes('Solar') || centersArray.includes('SOLAR') ? 'definiert' : 'undefiniert',
                      milz: centersArray.includes('Spleen') || centersArray.includes('SPLEEN') ? 'definiert' : 'undefiniert',
                      wurzel: centersArray.includes('Root') || centersArray.includes('ROOT') ? 'definiert' : 'undefiniert',
                    };
                  } catch (e) {
                    console.error('Error extracting person1Centers:', e);
                    return {
                      krone: 'undefiniert',
                      ajna: 'undefiniert',
                      kehle: 'undefiniert',
                      gZentrum: 'undefiniert',
                      herzEgo: 'undefiniert',
                      sakral: 'undefiniert',
                      solarplexus: 'undefiniert',
                      milz: 'undefiniert',
                      wurzel: 'undefiniert',
                    };
                  }
                })()}
                person2Centers={person2Data.centers || {
                  krone: 'undefiniert',
                  ajna: 'undefiniert',
                  kehle: 'undefiniert',
                  gZentrum: 'undefiniert',
                  herzEgo: 'undefiniert',
                  sakral: 'undefiniert',
                  solarplexus: 'undefiniert',
                  milz: 'undefiniert',
                  wurzel: 'undefiniert',
                }}
                person1Type={chartData.hdChart?.type as any}
                person2Type={person2Data.type as any}
                person1Profile={chartData.hdChart?.profile}
                person2Profile={person2Data.profile}
                person1Authority={chartData.hdChart?.authority as any}
                person2Authority={person2Data.authority as any}
                person1Strategy={chartData.hdChart?.strategy as any}
                person2Strategy={person2Data.strategy as any}
                person1Name={userName || 'Du'}
                person2Name={person2Data.name}
              />
            </Box>
          ) : !chartData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <Alert severity="warning" sx={{ mb: 2, background: 'rgba(242, 159, 5, 0.1)', border: '1px solid rgba(242, 159, 5, 0.3)', maxWidth: 600 }}>
                <Typography variant="body1" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                  ⚠️ Keine Chart-Daten gefunden
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Um die Connection Key Resonanzanalyse zu nutzen, benötigst du zuerst dein Human Design Chart. 
                  Bitte erstelle dein Chart auf der{' '}
                  <Link href="/human-design-chart" style={{ color: '#F29F05', textDecoration: 'underline' }}>
                    Human Design Chart Seite
                  </Link>.
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2, color: '#F29F05' }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Lade Chart-Daten...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{
          p: { xs: 2, sm: 3 },
          borderTop: '1px solid rgba(242, 159, 5, 0.3)',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}>
          <Link href="/connection-key/booking" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                  color: '#FFD700',
                },
                transition: 'all 0.3s ease',
              }}
            >
              🔍 Vollständige Analyse
            </Button>
          </Link>
          <Button
            onClick={() => setShowConnectionKeyModal(false)}
            sx={{
              color: '#F29F05',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                background: 'rgba(242, 159, 5, 0.1)',
                color: '#FFD700',
              }
            }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Export mit ProtectedRoute
export default function ConnectionKeyPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <ConnectionKeyContent />
    </ProtectedRoute>
  );
}

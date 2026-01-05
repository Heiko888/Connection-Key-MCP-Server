'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Eye,
  Settings,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import Bodygraph from '@/components/Bodygraph';
import { DefinedState, CenterId } from '@/lib/hd-bodygraph/types';
import { getDefaultTheme } from '@/lib/hd-bodygraph/themes';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function BodygraphContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [definedState, setDefinedState] = useState<DefinedState | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [bodygraphSize, setBodygraphSize] = useState({ width: 600, height: 800 });
  const [showLabels, setShowLabels] = useState(true);
  const [showGateNumbers, setShowGateNumbers] = useState(true);
  const [showChannels, setShowChannels] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Versuche zuerst aus localStorage zu laden
      const { safeLocalStorageParse } = await import('@/lib/utils/safeJson');
      const chart = safeLocalStorageParse<any>('userChart', null);
      if (chart) {
        setChartData(chart);
        convertChartToDefinedState(chart);
        setLoading(false);
        return;
      }

      // Falls nicht in localStorage, versuche API
      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Verwende Daten aus dem Profil oder localStorage
          birthDate: localStorage.getItem('birthDate') || '',
          birthTime: localStorage.getItem('birthTime') || '',
          birthPlace: localStorage.getItem('birthPlace') || '',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.chart) {
          setChartData(result.chart);
          convertChartToDefinedState(result.chart);
        }
      }
    } catch (err) {
      console.error('Fehler beim Laden der Chart-Daten:', err);
      setError('Fehler beim Laden der Chart-Daten. Bitte erstelle zuerst ein Human Design Chart.');
    } finally {
      setLoading(false);
    }
  };

  const convertChartToDefinedState = (chart: any) => {
    const defined: DefinedState = {
      centers: {},
      channels: {},
      gates: {},
    };

    // Mapping von API Center-Namen zu CenterId
    const centerNameToId: Record<string, CenterId> = {
      'Head': 'HEAD',
      'Ajna': 'AJNA',
      'Throat': 'THROAT',
      'G': 'G',
      'G-Center': 'G',
      'Heart': 'HEART',
      'Heart/Ego': 'HEART',
      'Sacral': 'SACRAL',
      'Spleen': 'SPLEEN',
      'Solar': 'SOLAR',
      'Solar Plexus': 'SOLAR',
      'Root': 'ROOT',
    };

    // Zentren
    if (chart.definedCenters && Array.isArray(chart.definedCenters)) {
      chart.definedCenters.forEach((centerName: string) => {
        const centerId = centerNameToId[centerName];
        if (centerId) {
          defined.centers![centerId] = true;
        }
      });
    } else if (chart.centers) {
      Object.entries(chart.centers).forEach(([centerName, centerData]: [string, any]) => {
        const centerId = centerNameToId[centerName];
        if (centerId && centerData?.defined) {
          defined.centers![centerId] = true;
        }
      });
    }

    // Gates
    if (chart.gates || chart.activeGates) {
      const gates = chart.gates || chart.activeGates || [];
      if (Array.isArray(gates)) {
        gates.forEach((gate: number | { id: number; gate: number; active?: boolean }) => {
          const gateId = typeof gate === 'number' ? gate : (gate.id || gate.gate);
          const isActive = typeof gate === 'number' ? true : (gate.active !== false);
          if (gateId && gateId >= 1 && gateId <= 64 && isActive) {
            defined.gates![gateId] = true;
          }
        });
      }
    }

    // Kanäle: Berechne aus definierten Gates
    if (defined.gates) {
      const activeGates = Object.keys(defined.gates).map(Number);
      const CHANNELS = [
        [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
        [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48],
        [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43],
        [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41],
        [32, 54], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
      ];
      
      CHANNELS.forEach(([gate1, gate2]) => {
        if (activeGates.includes(gate1) && activeGates.includes(gate2)) {
          const channelId = `${gate1}-${gate2}`;
          defined.channels![channelId] = true;
        }
      });
    }

    setDefinedState(defined);
  };

  const handleZoomIn = () => {
    setBodygraphSize(prev => ({
      width: Math.min(prev.width + 100, 1200),
      height: Math.min(prev.height + 150, 1600)
    }));
  };

  const handleZoomOut = () => {
    setBodygraphSize(prev => ({
      width: Math.max(prev.width - 100, 400),
      height: Math.max(prev.height - 150, 600)
    }));
  };

  const handleDownload = () => {
    // TODO: Implementiere Download-Funktionalität
    alert('Download-Funktion wird noch implementiert');
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="basic">
        <PageLayout activePage="bodygraph" showLogo={true} maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#F29F05' }} />
          </Box>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (error || !definedState) {
    return (
      <ProtectedRoute requiredRole="basic">
        <PageLayout activePage="bodygraph" showLogo={true} maxWidth="lg">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Keine Chart-Daten gefunden. Bitte erstelle zuerst ein Human Design Chart.'}
          </Alert>
          <Button
            variant="contained"
            component={Link}
            href="/human-design-chart"
            startIcon={<ArrowLeft size={20} />}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              }
            }}
          >
            Zum Chart erstellen
          </Button>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="basic">
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
      }}>
        {/* Animierte Sterne */}
        {Array.from({ length: 50 }).map((_, i) => (
          <Box
            key={`star-${i}`}
            sx={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: '#F29F05',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              pointerEvents: 'none',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              '@keyframes twinkle': {
                '0%': { opacity: 0.2, transform: 'scale(1)' },
                '100%': { opacity: 1, transform: 'scale(1.5)' }
              }
            }}
          />
        ))}

        <PageLayout activePage="bodygraph" showLogo={true} maxWidth="lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}>
                  Dein Bodygraph
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {chartData?.type} • Profil {chartData?.profile || 'Unbekannt'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                component={Link}
                href="/human-design-chart"
                startIcon={<ArrowLeft size={20} />}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  '&:hover': {
                    borderColor: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)',
                  }
                }}
              >
                Zurück zum Chart
              </Button>
            </Box>
          </motion.div>

          {/* Bodygraph Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.18) 0%, rgba(140, 29, 4, 0.12) 100%)',
              backdropFilter: 'blur(25px)',
              border: '2px solid rgba(242, 159, 5, 0.40)',
              borderRadius: 4,
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.25)',
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Toolbar */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title="Vergrößern">
                      <IconButton
                        onClick={handleZoomIn}
                        sx={{
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(242, 159, 5, 0.1)',
                          }
                        }}
                      >
                        <ZoomIn size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verkleinern">
                      <IconButton
                        onClick={handleZoomOut}
                        sx={{
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(242, 159, 5, 0.1)',
                          }
                        }}
                      >
                        <ZoomOut size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Labels ein/aus">
                      <IconButton
                        onClick={() => setShowLabels(!showLabels)}
                        sx={{
                          color: showLabels ? '#F29F05' : 'rgba(255,255,255,0.5)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(242, 159, 5, 0.1)',
                          }
                        }}
                      >
                        <Eye size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download size={18} />}
                      onClick={handleDownload}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        '&:hover': {
                          borderColor: '#F29F05',
                          backgroundColor: 'rgba(242, 159, 5, 0.1)',
                        }
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share2 size={18} />}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        '&:hover': {
                          borderColor: '#F29F05',
                          backgroundColor: 'rgba(242, 159, 5, 0.1)',
                        }
                      }}
                    >
                      Teilen
                    </Button>
                  </Box>
                </Box>

                {/* Bodygraph */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: bodygraphSize.height,
                  p: 2,
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 3,
                  overflow: 'auto'
                }}>
                  {definedState && (
                    <Bodygraph
                      defined={definedState}
                      width={bodygraphSize.width}
                      height={bodygraphSize.height}
                      showLabels={showLabels}
                      showGateNumbers={showGateNumbers}
                      showChannels={showChannels}
                      theme={getDefaultTheme()}
                    />
                  )}
                </Box>

                {/* Chart Info */}
                {chartData && (
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(242, 159, 5, 0.2)' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                          p: 2,
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Typ
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                            {chartData.type || 'Unbekannt'}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                          p: 2,
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Profil
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                            {chartData.profile || 'Unbekannt'}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                          p: 2,
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Autorität
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                            {chartData.authority || 'Unbekannt'}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{
                          p: 2,
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Strategie
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                            {chartData.strategy || 'Unbekannt'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </PageLayout>
      </Box>
    </ProtectedRoute>
  );
}

export default function BodygraphPage() {
  return <BodygraphContent />;
}


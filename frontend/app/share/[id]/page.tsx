"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Share2, Eye, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface SharedChartData {
  type: string;
  profile: string;
  authority: string;
  centers: any;
  gates: any[];
  channels: any[];
  isAnonymous: boolean;
  createdAt: string;
  expiresAt: string;
  views: number;
}

export default function SharedChartPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<SharedChartData | null>(null);

  useEffect(() => {
    if (shareId) {
      loadSharedChart();
    }
  }, [shareId]);

  const loadSharedChart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/share/${shareId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Dieser geteilte Chart wurde nicht gefunden oder ist abgelaufen.');
        } else if (response.status === 410) {
          setError('Dieser geteilte Chart ist abgelaufen.');
        } else {
          setError('Fehler beim Laden des Charts.');
        }
        return;
      }

      const data = await response.json();
      setChartData(data);

    } catch (err) {
      console.error('Error loading shared chart:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
              zIndex: 0,
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
              zIndex: 0,
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
              zIndex: 0,
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
        <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
          <CircularProgress sx={{ color: '#F29F05' }} size={60} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Lade geteilten Chart...
          </Typography>
        </Stack>
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
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        p: 3
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
              zIndex: 0,
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
              zIndex: 0,
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
              zIndex: 0,
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
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card sx={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
            }}>
              <CardContent>
                <Stack spacing={3} alignItems="center">
                  <AlertTriangle size={48} color="#F29F05" />
                  <Typography variant="h5" sx={{ color: 'white', textAlign: 'center', fontWeight: 600 }}>
                    {error}
                  </Typography>
                  <Button
                    component={Link}
                    href="/"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Zur Startseite
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

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
      pt: { xs: 4, md: 8 },
      pb: 8,
      overflow: 'hidden'
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
            zIndex: 0,
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
            zIndex: 0,
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
            zIndex: 0,
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <Stack spacing={2} mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Share2 size={32} color="#F29F05" />
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                Geteilter Human Design Chart
              </Typography>
            </Box>

            {/* Metadata */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {chartData?.isAnonymous && (
                <Chip
                  icon={<Eye size={16} />}
                  label="Anonymisiert"
                  sx={{
                    background: 'rgba(242, 159, 5, 0.2)',
                    color: '#F29F05',
                    border: '1px solid rgba(242, 159, 5, 0.4)',
                    fontWeight: 600
                  }}
                />
              )}
              <Chip
                icon={<Eye size={16} />}
                label={`${chartData?.views || 0} Aufrufe`}
                sx={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<Clock size={16} />}
                label={`Geteilt am ${new Date(chartData?.createdAt || '').toLocaleDateString('de-DE')}`}
                sx={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: 600
                }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.3)', my: 4 }} />

          {/* Chart Content */}
          <Card sx={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
          }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={4}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="h5" sx={{ color: '#F29F05', mb: 2, fontWeight: 700 }}>
                    Human Design Typ
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 800 }}>
                    {chartData?.type}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.3)' }} />

                {/* Profile & Authority */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                      Profil
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      {chartData?.profile}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                      Autorität
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      {chartData?.authority}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.3)' }} />

                {/* CTA */}
                <Box sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.1) 100%)',
                  border: '2px solid rgba(242, 159, 5, 0.4)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
                    Möchtest du dein eigenes Human Design Chart erstellen?
                  </Typography>
                  <Button
                    component={Link}
                    href="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 700,
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Jetzt kostenlos starten
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}


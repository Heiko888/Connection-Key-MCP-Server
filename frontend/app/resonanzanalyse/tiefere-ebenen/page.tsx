'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';
import { Key } from 'lucide-react';

export default function TiefereEbenenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('analysisId');
  
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState<boolean | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    const validateAndLoad = async () => {
      if (!analysisId) {
        setValid(false);
        setLoading(false);
        return;
      }

      try {
        // Validiere analysisId server-seitig
        const validateResponse = await fetch(`/api/resonanzanalyse/validate?analysisId=${analysisId}`);
        const validateData = await validateResponse.json();

        if (!validateData.valid) {
          setValid(false);
          setLoading(false);
          return;
        }

        // Lade Analyse-Daten
        const dataResponse = await fetch(`/api/resonanzanalyse/${analysisId}`);
        if (!dataResponse.ok) {
          setValid(false);
          setLoading(false);
          return;
        }

        const data = await dataResponse.json();
        setAnalysisData(data.analysis);
        setValid(true);
      } catch (error) {
        console.error('Fehler beim Laden:', error);
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateAndLoad();
  }, [analysisId]);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 }, textAlign: 'center' }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: 6,
                textAlign: 'center',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              <CircularProgress sx={{ color: '#F29F05', mb: 3 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Lade Analyse...
              </Typography>
            </Card>
          </Box>
        </PageLayout>
      </Box>
    );
  }

  if (!valid) {
    // Fallback-Screen bei ungültiger Analyse
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 3, md: 6 },
                textAlign: 'center',
                maxWidth: '700px',
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(242, 159, 5, 0.1)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  mb: 3,
                }}
              >
                <Key size={32} color="#F29F05" />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                }}
              >
                Diese Verbindung ist nicht verfügbar.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}
              >
                Die angeforderte Analyse konnte nicht gefunden werden oder ist nicht mehr verfügbar.
              </Typography>

              <Button
                variant="contained"
                onClick={() => router.push('/resonanzanalyse/sofort')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  },
                }}
              >
                Neue Analyse beginnen
              </Button>
            </Card>
          </Box>
        </PageLayout>
      </Box>
    );
  }

  // Step 4 Content für gültige Analyse
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Tiefere Ebenen der Resonanzanalyse
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  lineHeight: 1.8,
                }}
              >
                Dieser Bereich ist Teil des inneren Raums von The Connection Key. 
                Hier findest du erweiterte Analysen und tiefere Einblicke in eure energetische Verbindung.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/resonanzanalyse/sofort')}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                  }}
                >
                  Zurück zur Analyse
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

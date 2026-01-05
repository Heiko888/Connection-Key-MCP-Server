'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Image from 'next/image';

interface ReadingData {
  id: string;
  readingType: string;
  clientName: string;
  generatedText: string | null;
  createdAt: string;
  promptVersion?: string;
  promptLabel?: string;
}

function PublicReadingPageContent() {
  const params = useParams();
  const readingId = params.id as string;
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!readingId) return;

    const loadReading = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token aus URL-Parameter (falls vorhanden)
        const token = searchParams.get('token');
        const url = token
          ? `/api/readings/${readingId}?token=${token}`
          : `/api/readings/${readingId}`;

        const response = await fetch(url);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.reading) {
          throw new Error('Ungültige Antwort vom Server');
        }

        setReading(data.reading);
      } catch (err: any) {
        console.error('Fehler beim Laden des Readings:', err);
        setError(err.message || 'Fehler beim Laden des Readings');
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, [readingId, searchParams]);

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPDF = () => {
    const token = searchParams.get('token');
    const url = token
      ? `/api/readings/${readingId}/pdf?token=${token}`
      : `/api/readings/${readingId}/pdf`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0a0f' }}>
        <CircularProgress sx={{ color: '#e8b86d' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, background: '#0b0a0f', minHeight: '100vh' }}>
        <Container>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!reading) {
    return (
      <Box sx={{ p: 4, background: '#0b0a0f', minHeight: '100vh' }}>
        <Container>
          <Alert severity="info">Reading nicht gefunden.</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#0b0a0f', minHeight: '100vh' }}>
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', md: 600 },
              maxWidth: 600,
              height: { xs: 120, md: 180 },
              mx: 'auto',
            }}
          >
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Human Design Reading
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 0.5,
                }}
              >
                {reading.clientName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Erstellt: {formatDate(reading.createdAt)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
              sx={{
                borderColor: '#e8b86d',
                color: '#e8b86d',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#ffd89b',
                  background: 'rgba(232, 184, 109, 0.1)',
                },
              }}
            >
              PDF herunterladen
            </Button>
          </Box>

          {/* Reading-Text */}
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 4,
              mb: 4,
            }}
          >
            {reading.generatedText ? (
              <Typography
                sx={{
                  color: '#ffffff',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.8,
                }}
              >
                {reading.generatedText}
              </Typography>
            ) : (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic',
                }}
              >
                Noch kein Text verfügbar
              </Typography>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              The Connection Key
            </Typography>
            {reading.promptVersion && (
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.75rem',
                  mt: 1,
                }}
              >
                Prompt-Version: {reading.promptLabel || reading.promptVersion}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function PublicReadingPage() {
  return <PublicReadingPageContent />;
}


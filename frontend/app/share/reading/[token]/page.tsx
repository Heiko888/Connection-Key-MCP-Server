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
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Image from 'next/image';

interface SharedReadingData {
  id: string;
  readingType: string;
  clientName: string;
  generatedText: string | null;
  createdAt: string;
}

interface ShareInfo {
  accessLevel: string;
  views: number;
  maxViews: number | null;
  expiresAt: string | null;
}

function SharedReadingPageContent() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<SharedReadingData | null>(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadSharedReading = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/share/reading/${token}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Fehler beim Laden des Readings');
        }

        setReading(data.reading);
        setShareInfo(data.share);
      } catch (err: any) {
        console.error('Fehler beim Laden des geteilten Readings:', err);
        setError(err.message || 'Fehler beim Laden des Readings');
      } finally {
        setLoading(false);
      }
    };

    loadSharedReading();
  }, [token]);

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
    const url = `/api/share/reading/${token}/pdf`;
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

          {/* Share-Info */}
          {shareInfo && (
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`Geteilt von The Connection Key`}
                sx={{
                  background: 'rgba(232, 184, 109, 0.2)',
                  color: '#e8b86d',
                  fontWeight: 600,
                }}
              />
              {shareInfo.maxViews && (
                <Chip
                  label={`${shareInfo.views} / ${shareInfo.maxViews} Aufrufe`}
                  sx={{
                    ml: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                />
              )}
            </Box>
          )}

          {/* Reading-Text */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 4,
            }}
          >
            <CardContent>
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
            </CardContent>
          </Card>

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
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.75rem',
                mt: 1,
              }}
            >
              Dieses Reading wurde mit Ihnen geteilt
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function SharedReadingPage() {
  return <SharedReadingPageContent />;
}


"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Calendar,
  Mail,
  Download,
  Home
} from 'lucide-react';

export default function ConnectionCodeSuccessPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Lade Buchungsdaten
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      (async () => {
        try {
          const { safeJsonParse, safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
          const data = safeJsonParse<any>(pendingBooking, null);
          if (data) {
            setBookingData(data);
            
            // Speichere in userBookings
            const existingBookings = safeLocalStorageParse<any[]>('userBookings', []);
            if (existingBookings) {
              existingBookings.push({
                ...data,
                status: 'confirmed',
                bookingId: `CC-${Date.now()}`,
                type: 'connection-code'
              });
              safeLocalStorageSet('userBookings', existingBookings);
            }
          }
        } catch (e) {
          console.error('Error loading booking data:', e);
        }
      })();
    }
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
      `,
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="md">
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CheckCircle 
            size={100} 
            style={{ 
              color: '#10b981', 
              marginBottom: 16 
            }} 
          />
          <Typography
            variant="h2"
            sx={{
              background: 'linear-gradient(135deg, #10b981, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2
            }}
          >
            Zahlung erfolgreich! 🎉
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Deine Connection Key Session ist gebucht
          </Typography>
        </Box>

        {/* Booking Details */}
        {bookingData && (
          <Card sx={{ 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            mb: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
                📅 Deine Buchungsdetails
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Paket:
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {bookingData.package?.name} - {bookingData.package?.sessions} Session(s)
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Erster Termin:
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {new Date(bookingData.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Uhrzeit: {bookingData.time} Uhr
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Partner 1:
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {bookingData.partner1Name} - {new Date(bookingData.partner1BirthDate).toLocaleDateString('de-DE')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Partner 2:
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {bookingData.partner2Name} - {new Date(bookingData.partner2BirthDate).toLocaleDateString('de-DE')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card sx={{ 
          background: 'rgba(78, 205, 196, 0.1)', 
          border: '1px solid rgba(78, 205, 196, 0.3)',
          borderRadius: 3,
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 700 }}>
              📋 Nächste Schritte
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Mail size={24} style={{ color: '#4ecdc4', flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  1. Bestätigungs-E-Mail
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Du erhältst in wenigen Minuten eine Bestätigungsmail mit allen Details an {bookingData?.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Calendar size={24} style={{ color: '#4ecdc4', flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  2. Zoom-Link
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  24 Stunden vor deiner Session senden wir dir den Zoom-Link zu
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Download size={24} style={{ color: '#4ecdc4', flexShrink: 0 }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  3. PDF-Analyse
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Nach der Session erhältst du eine detaillierte PDF-Analyse eurer Connection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home size={20} />}
            onClick={() => router.push('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #ff6b9d, #4ecdc4)',
              color: 'white',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #ff5a8a, #3dbdb3)'
              }
            }}
          >
            Zum Dashboard
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push('/resonanzanalyse')}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Zur Resonanzanalyse
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


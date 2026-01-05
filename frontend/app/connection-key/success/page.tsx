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
  Home,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ConnectionKeySuccessPage() {
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
                bookingId: `CK-${Date.now()}`,
                type: 'connection-key'
              });
              safeLocalStorageSet('userBookings', existingBookings);
            }
            
            // Lösche pending booking
            localStorage.removeItem('pendingBooking');
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
        radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(242, 159, 5, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 8 }
    }}>
      {/* Animated Gradient Circles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${600 + i * 200}px`,
            height: `${600 + i * 200}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.08 - i * 0.02}), transparent)`,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, Math.sin(i) * 50, 0],
            y: [0, Math.cos(i) * 50, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Sparkles */}
      {[
        { left: 15, top: 20, duration: 2.5, delay: 0.3 },
        { left: 75, top: 35, duration: 3.2, delay: 1.1 },
        { left: 45, top: 60, duration: 2.8, delay: 0.7 },
        { left: 85, top: 15, duration: 3.5, delay: 1.5 },
        { left: 25, top: 80, duration: 2.3, delay: 0.5 },
        { left: 65, top: 45, duration: 3.8, delay: 1.8 },
      ].map((sparkle, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: '4px',
            height: '4px',
            background: '#F29F05',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(242, 159, 5, 0.8)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle 
              size={100} 
              style={{ 
                color: '#F29F05', 
                marginBottom: 16,
                filter: 'drop-shadow(0 0 20px rgba(242, 159, 5, 0.5))'
              }} 
            />
          </motion.div>
          <Typography
            variant="h2"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
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
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                📅 Deine Buchungsdetails
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Paket:
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {bookingData.package?.name} - {bookingData.package?.sessions} Session(s)
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                  €{bookingData.package?.price}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(242, 159, 5, 0.2)' }} />

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

              <Divider sx={{ my: 3, borderColor: 'rgba(242, 159, 5, 0.2)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Partner 1:
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {bookingData.partner1Name} - {bookingData.partner1BirthDate && new Date(bookingData.partner1BirthDate).toLocaleDateString('de-DE')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Partner 2:
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {bookingData.partner2Name} - {bookingData.partner2BirthDate && new Date(bookingData.partner2BirthDate).toLocaleDateString('de-DE')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card sx={{ 
          background: 'rgba(242, 159, 5, 0.08)', 
          border: '1px solid rgba(242, 159, 5, 0.3)',
          borderRadius: 3,
          mb: 4,
          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
              📋 Nächste Schritte
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Mail size={24} style={{ color: '#F29F05', flexShrink: 0, marginTop: 4 }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  1. Bestätigungs-E-Mail
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Du erhältst in wenigen Minuten eine Bestätigungsmail mit allen Details an {bookingData?.email || 'deine E-Mail-Adresse'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Calendar size={24} style={{ color: '#F29F05', flexShrink: 0, marginTop: 4 }} />
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
              <Download size={24} style={{ color: '#F29F05', flexShrink: 0, marginTop: 4 }} />
              <Box>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                  3. PDF-Analyse
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Nach der Session erhältst du eine detaillierte PDF-Analyse eurer Resonanz
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
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Zum Dashboard
          </Button>

          <Button
            variant="outlined"
            endIcon={<ArrowRight size={20} />}
            onClick={() => router.push('/resonanzanalyse')}
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                borderColor: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Zur Resonanzanalyse
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


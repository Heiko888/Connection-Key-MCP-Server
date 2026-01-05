"use client";

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Box,
  Button,
  Container
} from '@mui/material';
import {
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '../../../components/PageLayout';

export default function VipDankeseitePage() {
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

      <PageLayout activePage="dashboard" showLogo={true}>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle size={80} style={{ color: '#F29F05', marginBottom: '24px' }} />
              </motion.div>
              <Typography variant="h2" sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'white',
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
              }}>
                Vielen Dank für deine Buchung!
              </Typography>
              <Typography variant="h5" sx={{
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 300,
                mb: 4,
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}>
                VIP Paket
              </Typography>
            </Box>

            <Box sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(242, 159, 5, 0.2)',
              p: 4,
              mb: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Sparkles size={24} style={{ color: '#F29F05' }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  Was passiert jetzt?
                </Typography>
              </Box>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 2,
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}>
                Deine VIP-Buchung wurde erfolgreich entgegengenommen. Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen wichtigen Informationen zu deinem VIP Paket.
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8,
                fontSize: '1.1rem'
              }}>
                Als VIP-Mitglied erhältst du Zugang zu allen Premium-Features, exklusiven Inhalten und persönlicher Betreuung. Willkommen in der VIP-Community!
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                component={Link}
                href="/dashboard"
                variant="outlined"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  color: 'rgba(242, 159, 5, 0.9)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  backgroundColor: 'rgba(242, 159, 5, 0.05)',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(242, 159, 5, 0.8)',
                    backgroundColor: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    transform: 'translateX(4px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Zum Dashboard
              </Button>
            </Box>
          </motion.div>
        </Container>
      </PageLayout>
    </Box>
  );
}


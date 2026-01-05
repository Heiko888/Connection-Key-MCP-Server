'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';

export default function SchwellePage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnter = () => {
    setIsTransitioning(true);
    // Markiere, dass Nutzer durch Schwelle gegangen ist
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasPassedThreshold', 'true');
    }
    // Sanfter Fade-out (400ms) + kurze Stille (300ms) = 700ms total
    setTimeout(() => {
      router.push('/human-design-chart?from=schwelle');
    }, 700);
  };

  return (
    <AnimatePresence mode="wait">
      {!isTransitioning ? (
        <motion.div
          key="schwelle-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              background: `
                radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
                radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
                radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
                linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
              `,
              backgroundAttachment: 'fixed',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
                <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
              </Box>
            </motion.div>

            {/* Überschrift */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 300,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  textAlign: 'center',
                  mb: { xs: 4, md: 5 },
                  maxWidth: 800,
                  mx: 'auto',
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                }}
              >
                Du stehst an der Schwelle.
              </Typography>
            </motion.div>

            {/* Haupttext */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box
                sx={{
                  maxWidth: 700,
                  mx: 'auto',
                  mb: { xs: 4, md: 5 },
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    lineHeight: 1.8,
                    mb: 2.5,
                    fontWeight: 300,
                  }}
                >
                  Was du gleich siehst,
                  <br />
                  ist keine Information über dich.
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    lineHeight: 1.8,
                    mb: 2.5,
                    fontWeight: 300,
                  }}
                >
                  Es ist ein Spiegel deiner energetischen Signatur.
                  <br />
                  Er zeigt nichts Neues –
                  <br />
                  aber er nimmt dir die Möglichkeit, dich weiter zu belügen.
                </Typography>
              </Box>
            </motion.div>

            {/* Hinweis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Box
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  mb: { xs: 4, md: 5 },
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: { xs: '0.85rem', md: '0.9rem' },
                    lineHeight: 1.8,
                    fontWeight: 300,
                    fontStyle: 'italic',
                  }}
                >
                  Wenn du weitergehst,
                  <br />
                  betrittst du einen Raum,
                  <br />
                  in dem Vergleiche, Bewertungen
                  <br />
                  und Erklärungen keinen Platz haben.
                </Typography>
              </Box>
            </motion.div>

            {/* Entscheidungsformulierung */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Box
                sx={{
                  maxWidth: 500,
                  mx: 'auto',
                  mb: { xs: 4, md: 5 },
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.8,
                    fontWeight: 300,
                    mb: 3,
                  }}
                >
                  Du kannst jetzt umkehren.
                  <br />
                  Oder du trittst ein.
                </Typography>
              </Box>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <Button
                onClick={handleEnter}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  px: { xs: 6, md: 8 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  fontWeight: 400,
                  textTransform: 'none',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  minWidth: { xs: 200, md: 240 },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(242, 159, 5, 0.4)',
                  },
                }}
              >
                Ich trete ein
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      ) : (
        <motion.div
          key="transition"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            sx={{
              minHeight: '100vh',
              background: `
                radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
                radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
                radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
                linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
              `,
              backgroundAttachment: 'fixed',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


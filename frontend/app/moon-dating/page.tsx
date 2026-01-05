"use client";
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import MoonDatingGuide from '@/components/MoonDatingGuide';
import PageLayout from '../components/PageLayout';
import { Moon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MoonDatingPage() {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
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
      
      <PageLayout activePage="dating" showLogo={true} maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Moon size={48} color="#F29F05" style={{ flexShrink: 0 }} />
              <Typography
                variant="h1"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '4rem' }
                }}
              >
                Mondkalender-Dating
              </Typography>
              <Moon size={48} color="#F29F05" style={{ flexShrink: 0 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 300,
                lineHeight: 1.7
              }}
            >
              Plane deine Dates nach den Mondzyklen für optimale Verbindungen
            </Typography>
          </Box>
        </motion.div>

        {/* Moon Dating Guide Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MoonDatingGuide />
        </motion.div>

        {/* Zurück zum Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={20} />}
              onClick={() => router.push('/dashboard')}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zum Dashboard
            </Button>
          </Box>
        </motion.div>
      </PageLayout>
    </Box>
  );
}

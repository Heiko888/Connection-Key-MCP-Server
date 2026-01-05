'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import GamificationSystem from '@/components/GamificationSystem';
import PageLayout from '../components/PageLayout';

export default function GamificationPage() {
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
      {/* Animated Gold Stars Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: `${10 + i * 2}px`,
              height: `${10 + i * 2}px`,
              background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.05}), transparent 70%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#FFFFFF',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}
            >
              🏆 Gamification
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.9rem', md: '1rem' },
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Sammle Punkte, verdiene Badges und erreiche neue Level in deiner Human Design Reise
            </Typography>
          </Box>

          {/* Gamification System Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                p: { xs: 3, md: 4 }
              }}
            >
              <GamificationSystem />
            </Paper>
          </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

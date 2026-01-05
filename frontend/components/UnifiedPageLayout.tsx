"use client";

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Logo from '@/app/components/Logo';

interface UnifiedPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStars?: boolean;
}

const UnifiedPageLayout: React.FC<UnifiedPageLayoutProps> = ({
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  showStars = false
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #0F1220 0%, #1A0E08 100%)',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(90% 70% at 50% 28%, rgba(242, 159, 5, 0.36), transparent 78%), radial-gradient(60% 50% at 82% 82%, rgba(140, 29, 4, 0.24), transparent 78%)'
        }
      }}
    >
      <Container maxWidth={maxWidth}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden'
            }}
          >
            <Box textAlign="center" mb={3}>
              <Logo mb={2} height={{ xs: 80, md: 120 }} />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', md: '2.25rem' }
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    maxWidth: 600,
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {children}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default UnifiedPageLayout;
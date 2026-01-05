'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface RotatingPlanetSymbolProps {
  symbol: string;
  color: string;
  gradient: string;
  size?: 'small' | 'medium' | 'large';
}

export default function RotatingPlanetSymbol({ 
  symbol, 
  color, 
  gradient,
  size = 'large' 
}: RotatingPlanetSymbolProps) {
  const sizes = {
    small: { xs: 120, sm: 150, md: 180 },
    medium: { xs: 150, sm: 180, md: 200 },
    large: { xs: 200, sm: 250, md: 300 }
  };

  const iconSizes = {
    small: { xs: '4rem', sm: '5rem', md: '6rem' },
    medium: { xs: '5rem', sm: '6rem', md: '7rem' },
    large: { xs: '6rem', sm: '8rem', md: '10rem' }
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      style={{ display: 'inline-block' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: sizes[size],
          height: sizes[size],
          margin: '0 auto',
          borderRadius: '50%',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 60px ${color}50,
            0 0 120px ${color}30,
            0 0 180px ${color}15,
            inset -30px -30px 100px rgba(0, 0, 0, 0.5),
            inset 30px 30px 100px rgba(255, 255, 255, 0.1),
            0 20px 60px rgba(0, 0, 0, 0.4)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '8%',
            left: '15%',
            width: '35%',
            height: '35%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
            filter: 'blur(15px)',
            opacity: 0.8,
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
              '50%': { opacity: 0.9, transform: 'scale(1.1)' },
            },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '45%',
            right: '12%',
            width: '25%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
            filter: 'blur(12px)',
            opacity: 0.5,
            animation: 'pulse 4s ease-in-out infinite 1s',
          },
        }}
      >
        {/* Rotierender Ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            right: '-10%',
            bottom: '-10%',
            borderRadius: '50%',
            border: `2px solid ${color}40`,
            borderTopColor: color,
            borderRightColor: color,
            opacity: 0.3,
            animation: 'rotate 20s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
        
        {/* Planet Symbol */}
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: iconSizes[size],
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.4))',
            zIndex: 2,
            position: 'relative',
            lineHeight: 1,
          }}
        >
          {symbol}
        </Typography>
        
        {/* Glow Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
            animation: 'glow 3s ease-in-out infinite',
            '@keyframes glow': {
              '0%, 100%': { opacity: 0.6 },
              '50%': { opacity: 1 },
            },
          }}
        />
      </Box>
    </motion.div>
  );
}

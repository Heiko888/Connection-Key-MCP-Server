"use client";

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedMoonProps {
  size?: number;
  phase?: number; // 0-1, 0 = new moon, 1 = full moon
}

const AnimatedMoon: React.FC<AnimatedMoonProps> = ({
  size = 100,
  phase = 0.8
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <motion.div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at ${phase * 100}% 50%, #f8f9fa 0%, #e9ecef 100%)`,
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </Box>
  );
};

export default AnimatedMoon;
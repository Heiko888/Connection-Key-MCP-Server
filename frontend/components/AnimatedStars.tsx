"use client";

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedStarsProps {
  count?: number;
  size?: number;
  duration?: number;
}

const AnimatedStars: React.FC<AnimatedStarsProps> = ({
  count = 50,
  size = 2,
  duration = 3
}) => {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * duration
  }));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: 'white',
            borderRadius: '50%',
            opacity: 0.8
          }}
          animate={{
            opacity: [0.8, 0.2, 0.8],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: star.delay
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedStars;
"use client";

import { Box } from '@mui/material';

interface LightweightMoonProps {
  size?: number;
}

const LightweightMoon = ({ size = 120 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%),
          radial-gradient(circle at 70% 20%, rgba(255,255,255,0.2), transparent 40%),
          radial-gradient(circle at 20% 70%, rgba(255,255,255,0.1), transparent 30%),
          linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)
        `,
        boxShadow: `
          inset -20px -20px 50px rgba(0,0,0,0.1),
          inset 20px 20px 50px rgba(255,255,255,0.2),
          0 0 20px rgba(255,255,255,0.1)
        `,
        animation: 'moonGlow 6s ease-in-out infinite alternate',
        '@keyframes moonGlow': {
          '0%': { 
            boxShadow: `
              inset -20px -20px 50px rgba(0,0,0,0.1),
              inset 20px 20px 50px rgba(255,255,255,0.2),
              0 0 20px rgba(255,255,255,0.1)
            `
          },
          '100%': { 
            boxShadow: `
              inset -20px -20px 50px rgba(0,0,0,0.1),
              inset 20px 20px 50px rgba(255,255,255,0.3),
              0 0 30px rgba(255,255,255,0.2)
            `
          }
        }
      }}
    />
  );
};

export default LightweightMoon;

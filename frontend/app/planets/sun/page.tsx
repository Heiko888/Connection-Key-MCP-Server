'use client';

import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import PlanetPageTemplate from '../../../components/PlanetPageTemplate';

export default function SunPage() {
  const fallbackInfo = {
    planet_name: "Sonne",
    symbol: "☉",
    orbital_period: "365.25 Tage",
    discovery: "Seit Anbeginn der Zeit",
    mythology: "Das Zentrum des Bewusstseins",
    color: "#FFD700",
    description: "Die Sonne repräsentiert unser wahres Selbst, unsere Essenz und unser Bewusstsein. Sie zeigt, wer wir wirklich sind und was uns antreibt."
  };

  const animatedSun = (
    <>
      {/* Animated Stars */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, #FFD700, transparent),
          radial-gradient(2px 2px at 40px 70px, #FFD700, transparent),
          radial-gradient(1px 1px at 90px 40px, #FFD700, transparent),
          radial-gradient(1px 1px at 130px 80px, #FFD700, transparent),
          radial-gradient(2px 2px at 160px 30px, #FFD700, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Sun */}
      <motion.div
        
        animate={{ 
          opacity: 0.4, 
          scale: [1, 1.08, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 25, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '1%',
          right: '8%',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, #FFD700, #FFA500, #FF8C00),
            radial-gradient(circle at 70% 70%, #FFA500, #FF8C00, #FF4500),
            radial-gradient(circle at 50% 50%, #FFD700, #FFA500)
          `,
          boxShadow: `
            0 0 40px rgba(255, 215, 0, 0.5),
            0 0 80px rgba(255, 165, 0, 0.4),
            0 0 120px rgba(255, 140, 0, 0.3),
            inset -15px -15px 30px rgba(255, 69, 0, 0.3)
          `,
          zIndex: 0
        }}
      >
        {/* Sun Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '25px',
          height: '15px',
          borderRadius: '50%',
          background: 'rgba(255, 165, 0, 0.6)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '65%',
          width: '20px',
          height: '12px',
          borderRadius: '50%',
          background: 'rgba(255, 215, 0, 0.7)',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '45%',
          left: '10%',
          width: '30px',
          height: '18px',
          borderRadius: '50%',
          background: 'rgba(255, 140, 0, 0.5)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '70%',
          left: '30%',
          width: '18px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(255, 165, 0, 0.8)',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '35%',
          left: '75%',
          width: '22px',
          height: '14px',
          borderRadius: '50%',
          background: 'rgba(255, 215, 0, 0.6)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3)'
        }} />
      </motion.div>

      {/* Solar Corona Effect */}
      <motion.div
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 0.4, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeOut"
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#FFD700',
          boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.2, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.5
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: '#FFA500',
          boxShadow: '0 0 10px rgba(255, 165, 0, 0.5)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.8, 0],
          opacity: [0, 0.3, 0]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeOut",
          delay: 3
        }}
        style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#FF8C00',
          boxShadow: '0 0 15px rgba(255, 140, 0, 0.4)',
          zIndex: 0
        }}
      />
    </>
  );

  return (
    <PlanetPageTemplate
      planetName="Sonne"
      planetColor="#FFD700"
      planetSymbol="☉"
      planetGradient="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)"
      fallbackInfo={fallbackInfo}
      backgroundGradient="radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)"
      animatedPlanet={animatedSun}
    />
  );
}

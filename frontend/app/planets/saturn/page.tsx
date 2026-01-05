'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  Button,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Crown, 
  Target, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SaturnPage() {
  const router = useRouter();

  const saturnInfo = {
    name: "Saturn",
    symbol: "♄",
    orbitalPeriod: "29.4 Jahre",
    discovery: "Seit Anbeginn der Zeit",
    mythology: "Der Lehrer und Disziplinierer",
    color: "#708090",
    gradient: "linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #D3D3D3 100%)",
    description: "Saturn repräsentiert Struktur, Disziplin und Verantwortung. Er zeigt, wo wir lernen, uns entwickeln und Verantwortung übernehmen."
  };

  const saturnInGates = [
    {
      gate: 1,
      name: "Kreativität",
      structure: "Kreative Struktur",
      discipline: "Schöpferische Disziplin",
      description: "Saturn hier zeigt, wie wir kreative Struktur und schöpferische Disziplin entwickeln.",
      deepMeaning: "Die Struktur der Kreativität - wie du deine Kreativität strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Kreative Blockaden", "Perfektionismus", "Strukturlosigkeit", "Disziplinlosigkeit"],
      gifts: ["Kreative Struktur", "Schöpferische Disziplin", "Künstlerische Begabung", "Inspiration"],
      structureAffirmation: "Ich strukturiere meine Kreativität und entwickle schöpferische Disziplin. Meine Kreativität ist geordnet."
    },
    {
      gate: 2,
      name: "Empfänglichkeit",
      structure: "Empfangende Struktur",
      discipline: "Empfangende Disziplin",
      description: "Saturn hier zeigt, wie wir empfängliche Struktur und empfängliche Disziplin entwickeln.",
      deepMeaning: "Die Struktur der Empfänglichkeit - wie du deine Empfänglichkeit strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Bindungsangst", "Strukturlosigkeit", "Emotionale Distanz", "Disziplinlosigkeit"],
      gifts: ["Empfangende Struktur", "Empathische Disziplin", "Tiefe Verbindung", "Heilende Präsenz"],
      structureAffirmation: "Ich strukturiere meine Empfänglichkeit und entwickle empathische Disziplin. Meine Verbindungsfähigkeit ist geordnet."
    },
    {
      gate: 3,
      name: "Beginn",
      structure: "Anfängliche Struktur",
      discipline: "Anfängliche Disziplin",
      description: "Saturn hier zeigt, wie wir anfängliche Struktur und anfängliche Disziplin entwickeln.",
      deepMeaning: "Die Struktur des Anfangs - wie du neue Anfänge strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Angst vor Struktur", "Perfektionismus", "Strukturlosigkeit", "Disziplinlosigkeit"],
      gifts: ["Anfängliche Struktur", "Pioniergeist", "Innovation", "Mut zum Neuanfang"],
      structureAffirmation: "Ich strukturiere neue Anfänge und entwickle pionierhafte Disziplin. Mein Pioniergeist ist geordnet."
    },
    {
      gate: 4,
      name: "Jugendliche Torheit",
      structure: "Wissende Struktur",
      discipline: "Wissende Disziplin",
      description: "Saturn hier zeigt, wie wir wissende Struktur und wissende Disziplin entwickeln.",
      deepMeaning: "Die Struktur des Wissens - wie du dein Wissen strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Wissensangst", "Strukturlosigkeit", "Intellektuelle Arroganz", "Disziplinlosigkeit"],
      gifts: ["Wissende Struktur", "Weisheit", "Lehrfähigkeit", "Mentoring"],
      structureAffirmation: "Ich strukturiere mein Wissen und entwickle weise Disziplin. Mein Wissen ist geordnet."
    },
    {
      gate: 5,
      name: "Warten",
      structure: "Wartende Struktur",
      discipline: "Wartende Disziplin",
      description: "Saturn hier zeigt, wie wir wartende Struktur und wartende Disziplin entwickeln.",
      deepMeaning: "Die Struktur des Wartens - wie du deine Geduld strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Ungeduld", "Strukturlosigkeit", "Zeitdruck", "Disziplinlosigkeit"],
      gifts: ["Wartende Struktur", "Geduld", "Timing", "Vertrauen"],
      structureAffirmation: "Ich strukturiere meine Geduld und entwickle zeitliche Disziplin. Meine Geduld ist geordnet."
    },
    {
      gate: 6,
      name: "Konflikt",
      structure: "Konfliktlösende Struktur",
      discipline: "Konfliktlösende Disziplin",
      description: "Saturn hier zeigt, wie wir konfliktlösende Struktur und konfliktlösende Disziplin entwickeln.",
      deepMeaning: "Die Struktur der Konfliktlösung - wie du Konflikte strukturierst und diszipliniert löst.",
      shadowAspects: ["Konfliktvermeidung", "Strukturlosigkeit", "Harmoniezwang", "Disziplinlosigkeit"],
      gifts: ["Konfliktlösende Struktur", "Mediation", "Wachstum", "Stärke"],
      structureAffirmation: "Ich strukturiere Konfliktlösung und entwickle mediative Disziplin. Meine Konfliktlösung ist geordnet."
    },
    {
      gate: 7,
      name: "Die Rolle des Selbst",
      structure: "Rollenbewusste Struktur",
      discipline: "Rollenbewusste Disziplin",
      description: "Saturn hier zeigt, wie wir rollenbewusste Struktur und rollenbewusste Disziplin entwickeln.",
      deepMeaning: "Die Struktur der Rolle - wie du deine Rolle strukturierst und diszipliniert ausübst.",
      shadowAspects: ["Identitätskrise", "Strukturlosigkeit", "Rollenverwirrung", "Disziplinlosigkeit"],
      gifts: ["Rollenbewusste Struktur", "Führung", "Authentizität", "Inspiration"],
      structureAffirmation: "Ich strukturiere meine Rolle und entwickle führungsdisziplin. Meine Rolle ist geordnet."
    },
    {
      gate: 8,
      name: "Haltung",
      structure: "Wertbewusste Struktur",
      discipline: "Wertbewusste Disziplin",
      description: "Saturn hier zeigt, wie wir wertbewusste Struktur und wertbewusste Disziplin entwickeln.",
      deepMeaning: "Die Struktur des Wertes - wie du deinen Selbstwert strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Strukturlosigkeit", "Selbstkritik", "Disziplinlosigkeit"],
      gifts: ["Wertbewusste Struktur", "Selbstwert", "Würde", "Stolz"],
      structureAffirmation: "Ich strukturiere meinen Wert und entwickle würdevolle Disziplin. Mein Selbstwert ist geordnet."
    }
  ];

  const saturnInCenters = [
    {
      center: "Head Center",
      structure: "Inspirationsstruktur",
      discipline: "Inspirationsdisziplin",
      description: "Saturn hier zeigt, wie wir Inspirationsstruktur und Inspirationsdisziplin entwickeln.",
      deepMeaning: "Die Struktur der Inspiration - wie du deine Inspiration strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Inspirationsblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Inspirationsstruktur", "Kreative Ideen", "Neue Konzepte", "Führung"],
      structureAffirmation: "Ich strukturiere meine Inspiration und entwickle kreative Disziplin. Meine Inspiration ist geordnet."
    },
    {
      center: "Ajna Center",
      structure: "Verstandesstruktur",
      discipline: "Verstandesdisziplin",
      description: "Saturn hier zeigt, wie wir Verstandesstruktur und Verstandesdisziplin entwickeln.",
      deepMeaning: "Die Struktur des Verstandes - wie du dein Denken strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Verstandesblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Verstandesstruktur", "Konzeptualisierung", "Analyse", "Verstehen"],
      structureAffirmation: "Ich strukturiere meinen Verstand und entwickle analytische Disziplin. Mein Verstand ist geordnet."
    },
    {
      center: "Throat Center",
      structure: "Ausdrucksstruktur",
      discipline: "Ausdrucksdisziplin",
      description: "Saturn hier zeigt, wie wir Ausdrucksstruktur und Ausdrucksdisziplin entwickeln.",
      deepMeaning: "Die Struktur des Ausdrucks - wie du deinen Ausdruck strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Ausdrucksblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Ausdrucksstruktur", "Manifestation", "Kommunikation", "Kreativität"],
      structureAffirmation: "Ich strukturiere meinen Ausdruck und entwickle kommunikative Disziplin. Mein Ausdruck ist geordnet."
    },
    {
      center: "G Center",
      structure: "Identitätsstruktur",
      discipline: "Identitätsdisziplin",
      description: "Saturn hier zeigt, wie wir Identitätsstruktur und Identitätsdisziplin entwickeln.",
      deepMeaning: "Die Struktur der Identität - wie du deine Identität strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Identitätskrise", "Strukturlosigkeit", "Orientierungslosigkeit", "Disziplinlosigkeit"],
      gifts: ["Identitätsstruktur", "Orientierung", "Führung", "Authentizität"],
      structureAffirmation: "Ich strukturiere meine Identität und entwickle orientierungsdisziplin. Meine Identität ist geordnet."
    },
    {
      center: "Heart Center",
      structure: "Wertstruktur",
      discipline: "Wertdisziplin",
      description: "Saturn hier zeigt, wie wir Wertstruktur und Wertdisziplin entwickeln.",
      deepMeaning: "Die Struktur des Wertes - wie du deinen Wert strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Strukturlosigkeit", "Selbstkritik", "Disziplinlosigkeit"],
      gifts: ["Wertstruktur", "Selbstbehauptung", "Führung", "Würde"],
      structureAffirmation: "Ich strukturiere meinen Wert und entwickle würdevolle Disziplin. Mein Wert ist geordnet."
    },
    {
      center: "Solar Plexus Center",
      structure: "Emotionsstruktur",
      discipline: "Emotionsdisziplin",
      description: "Saturn hier zeigt, wie wir Emotionsstruktur und Emotionsdisziplin entwickeln.",
      deepMeaning: "Die Struktur der Emotionen - wie du deine Emotionen strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Emotionsblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Emotionsstruktur", "Empathie", "Verstehen", "Heilung"],
      structureAffirmation: "Ich strukturiere meine Emotionen und entwickle empathische Disziplin. Meine Emotionalität ist geordnet."
    },
    {
      center: "Sacral Center",
      structure: "Lebenskraftstruktur",
      discipline: "Lebenskraftdisziplin",
      description: "Saturn hier zeigt, wie wir Lebenskraftstruktur und Lebenskraftdisziplin entwickeln.",
      deepMeaning: "Die Struktur der Lebenskraft - wie du deine Lebenskraft strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Lebenskraftblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Lebenskraftstruktur", "Arbeit", "Produktivität", "Kreativität"],
      structureAffirmation: "Ich strukturiere meine Lebenskraft und entwickle produktive Disziplin. Meine Lebenskraft ist geordnet."
    },
    {
      center: "Spleen Center",
      structure: "Instinktstruktur",
      discipline: "Instinktdisziplin",
      description: "Saturn hier zeigt, wie wir Instinktstruktur und Instinktdisziplin entwickeln.",
      deepMeaning: "Die Struktur der Instinkte - wie du deine Instinkte strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Instinktblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Instinktstruktur", "Intuition", "Gesundheit", "Schutz"],
      structureAffirmation: "Ich strukturiere meine Instinkte und entwickle intuitive Disziplin. Meine Instinkte sind geordnet."
    },
    {
      center: "Root Center",
      structure: "Druckstruktur",
      discipline: "Druckdisziplin",
      description: "Saturn hier zeigt, wie wir Druckstruktur und Druckdisziplin entwickeln.",
      deepMeaning: "Die Struktur des Drucks - wie du deinen Druck strukturierst und diszipliniert entwickelst.",
      shadowAspects: ["Druckblockaden", "Strukturlosigkeit", "Perfektionismus", "Disziplinlosigkeit"],
      gifts: ["Druckstruktur", "Stressbewältigung", "Antrieb", "Transformation"],
      structureAffirmation: "Ich strukturiere meinen Druck und entwickle transformative Disziplin. Mein Druck ist geordnet."
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B0D12 0%, #1A1F2B 50%, #2D3748 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Stars */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, #708090, transparent),
          radial-gradient(2px 2px at 40px 70px, #708090, transparent),
          radial-gradient(1px 1px at 90px 40px, #708090, transparent),
          radial-gradient(1px 1px at 130px 80px, #708090, transparent),
          radial-gradient(2px 2px at 160px 30px, #708090, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Saturn */}
      <motion.div
        
        animate={{ 
          opacity: 0.5, 
          scale: [1, 1.08, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 16, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 32, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '8%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, #F4A460, #DEB887, #CD853F),
            radial-gradient(circle at 70% 70%, #DEB887, #CD853F, #A0522D),
            radial-gradient(circle at 50% 50%, #FFE4B5, #F4A460),
            radial-gradient(circle at 20% 80%, #D2B48C, #BC8F8F),
            radial-gradient(circle at 80% 20%, #F5DEB3, #DDA0DD)
          `,
          boxShadow: `
            0 0 40px rgba(244, 164, 96, 0.6),
            0 0 80px rgba(222, 184, 135, 0.5),
            0 0 120px rgba(205, 133, 63, 0.4),
            inset -15px -15px 30px rgba(160, 82, 45, 0.3)
          `,
          zIndex: 0
        }}
      >
        {/* Saturn Surface Details - Cloud Bands */}
        <Box sx={{
          position: 'absolute',
          top: '25%',
          left: '0%',
          right: '0%',
          height: '6px',
          background: 'rgba(205, 133, 63, 0.7)',
          borderRadius: '3px',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '0%',
          right: '0%',
          height: '5px',
          background: 'rgba(222, 184, 135, 0.8)',
          borderRadius: '2.5px',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '55%',
          left: '0%',
          right: '0%',
          height: '7px',
          background: 'rgba(160, 82, 45, 0.6)',
          borderRadius: '3.5px',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '70%',
          left: '0%',
          right: '0%',
          height: '4px',
          background: 'rgba(210, 180, 140, 0.7)',
          borderRadius: '2px',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
      </motion.div>

      {/* Saturn's Rings - Outer Ring A */}
      <motion.div
        animate={{ 
          scale: [1, 1.02, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '1%',
          right: '4%',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: `
            conic-gradient(from 0deg, 
              transparent 0deg, 
              rgba(255, 255, 255, 0.1) 30deg,
              rgba(244, 164, 96, 0.3) 60deg,
              rgba(255, 255, 255, 0.15) 90deg,
              rgba(222, 184, 135, 0.25) 120deg,
              rgba(255, 255, 255, 0.1) 150deg,
              transparent 180deg,
              transparent 360deg
            )
          `,
          zIndex: -1
        }}
      />

      {/* Saturn's Rings - Cassini Division */}
      <motion.div
        animate={{ 
          scale: [1, 1.01, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '0%',
          right: '3%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle, 
              transparent 45%, 
              rgba(0, 0, 0, 0.4) 48%, 
              rgba(0, 0, 0, 0.6) 50%, 
              rgba(0, 0, 0, 0.4) 52%, 
              transparent 55%
            )
          `,
          zIndex: -1
        }}
      />

      {/* Saturn's Rings - Inner Ring B */}
      <motion.div
        animate={{ 
          scale: [1, 1.03, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ 
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        style={{
          position: 'absolute',
          top: '-1%',
          right: '2%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: `
            conic-gradient(from 45deg, 
              transparent 0deg, 
              rgba(255, 255, 255, 0.2) 45deg,
              rgba(205, 133, 63, 0.4) 90deg,
              rgba(255, 255, 255, 0.25) 135deg,
              rgba(160, 82, 45, 0.3) 180deg,
              rgba(255, 255, 255, 0.15) 225deg,
              transparent 270deg,
              transparent 360deg
            )
          `,
          zIndex: -1
        }}
      />

      {/* Saturn's Rings - Inner Ring C (Crepe Ring) */}
      <motion.div
        animate={{ 
          scale: [1, 1.04, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }}
        style={{
          position: 'absolute',
          top: '-2%',
          right: '1%',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: `
            conic-gradient(from 90deg, 
              transparent 0deg, 
              rgba(255, 255, 255, 0.1) 60deg,
              rgba(139, 69, 19, 0.3) 120deg,
              rgba(255, 255, 255, 0.15) 180deg,
              rgba(160, 82, 45, 0.25) 240deg,
              rgba(255, 255, 255, 0.1) 300deg,
              transparent 360deg
            )
          `,
          zIndex: -1
        }}
      />

      {/* Saturn's Rings - Ring Shadows */}
      <motion.div
        animate={{ 
          scale: [1, 1.01, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8
        }}
        style={{
          position: 'absolute',
          top: '3%',
          right: '6%',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at center, 
              transparent 40%, 
              rgba(0, 0, 0, 0.2) 45%, 
              rgba(0, 0, 0, 0.3) 50%, 
              rgba(0, 0, 0, 0.2) 55%, 
              transparent 60%
            )
          `,
          zIndex: -2
        }}
      />

      {/* Saturn Energy Waves */}
      <motion.div
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeOut"
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '18%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#F4A460',
          boxShadow: '0 0 12px rgba(244, 164, 96, 0.7)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.2, 0],
          opacity: [0, 0.6, 0]
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
          right: '28%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: '#DEB887',
          boxShadow: '0 0 10px rgba(222, 184, 135, 0.6)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.7, 0],
          opacity: [0, 0.4, 0]
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
          right: '12%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#FFE4B5',
          boxShadow: '0 0 15px rgba(255, 228, 181, 0.5)',
          zIndex: 0
        }}
      />

      {/* Saturn's Moon Titan */}
      <motion.div
        
        animate={{ 
          opacity: 0.6,
          scale: 1,
          x: [0, 60, 0],
          y: [0, -40, 0]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '8%',
          right: '15%',
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, #F4A460, #DEB887, #CD853F),
            radial-gradient(circle at 60% 60%, #DEB887, #CD853F, #A0522D)
          `,
          boxShadow: `
            0 0 12px rgba(244, 164, 96, 0.5),
            inset -3px -3px 8px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 1
        }}
      >
        {/* Titan Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(205, 133, 63, 0.7)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '55%',
          left: '60%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'rgba(160, 82, 45, 0.8)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '40%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'rgba(222, 184, 135, 0.9)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
      </motion.div>

      {/* Saturn's Moon Enceladus */}
      <motion.div
        
        animate={{ 
          opacity: 0.5,
          scale: 1,
          x: [0, -45, 0],
          y: [0, -35, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8
        }}
        style={{
          position: 'absolute',
          top: '12%',
          right: '30%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, #F5F5DC, #F0E68C, #DDD8C7),
            radial-gradient(circle at 60% 60%, #F0E68C, #DDD8C7, #D3D3D3)
          `,
          boxShadow: `
            0 0 8px rgba(245, 245, 220, 0.4),
            inset -2px -2px 6px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 1
        }}
      >
        {/* Enceladus Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '35%',
          left: '30%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(240, 230, 140, 0.8)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          background: 'rgba(221, 216, 199, 0.9)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
      </motion.div>

      {/* Saturn's Moon Rhea */}
      <motion.div
        
        animate={{ 
          opacity: 0.4,
          scale: 1,
          x: [0, 50, 0],
          y: [0, -45, 0]
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 15
        }}
        style={{
          position: 'absolute',
          top: '18%',
          right: '10%',
          width: '25px',
          height: '25px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, #C0C0C0, #A0A0A0, #808080),
            radial-gradient(circle at 60% 60%, #A0A0A0, #808080, #696969)
          `,
          boxShadow: `
            0 0 10px rgba(192, 192, 192, 0.4),
            inset -2px -2px 6px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 1
        }}
      >
        {/* Rhea Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'rgba(128, 128, 128, 0.7)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '65%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(105, 105, 105, 0.8)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.3)'
        }} />
      </motion.div>

      <Container maxWidth="lg" sx={{ padding: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/planets')}
            sx={{
              color: '#708090',
              borderColor: '#708090',
              '&:hover': {
                borderColor: '#708090',
                backgroundColor: 'rgba(112, 128, 144, 0.1)',
                boxShadow: '0 0 20px rgba(112, 128, 144, 0.3)'
              },
              marginRight: 2
            }}
          >
            <ArrowLeft size={20} style={{ marginRight: 8 }} />
            Zurück zu den Planeten
          </Button>
        </Box>

        {/* Title mit großem rotierendem Saturn-Symbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            {/* Großes rotierendes Saturn-Symbol */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 200, sm: 250, md: 300 },
                  height: { xs: 200, sm: 250, md: 300 },
                  margin: '0 auto 2rem',
                  borderRadius: '50%',
                  background: saturnInfo.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `
                    0 0 60px ${saturnInfo.color}50,
                    0 0 120px ${saturnInfo.color}30,
                    0 0 180px ${saturnInfo.color}15,
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
                    border: `2px solid ${saturnInfo.color}40`,
                    borderTopColor: saturnInfo.color,
                    borderRightColor: saturnInfo.color,
                    opacity: 0.3,
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                
                {/* Saturn Symbol */}
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                    filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.4))',
                    zIndex: 2,
                    position: 'relative',
                    lineHeight: 1,
                  }}
                >
                  {saturnInfo.symbol}
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
            
            {/* Planet Name */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                color: '#ffffff',
                textShadow: `
                  0 0 10px ${saturnInfo.color},
                  0 0 20px ${saturnInfo.color}80,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {saturnInfo.name}
            </Typography>
            
            <Typography variant="h5" style={{ color: saturnInfo.color, fontStyle: 'italic', fontWeight: 600, mb: 2 }}>
              {saturnInfo.mythology}
            </Typography>
            
            <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2, maxWidth: '700px', margin: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {saturnInfo.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Overview Widget */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #708090',
            boxShadow: '0 8px 32px rgba(112, 128, 144, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #708090, #556B2F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 2
              }}>
                <Typography variant="h4" style={{ color: '#000', fontWeight: 'bold' }}>
                  {saturnInfo.symbol}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" style={{ color: 'white', fontWeight: 600 }}>
                  {saturnInfo.name} - Übersicht
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Grundlegende Informationen über {saturnInfo.name}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                    Umlaufzeit
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {saturnInfo.orbitalPeriod}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                    Entdeckung
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {saturnInfo.discovery}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                    Mythologie
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {saturnInfo.mythology}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                    Farbe
                  </Typography>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    backgroundColor: saturnInfo.color,
                    margin: 'auto',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Saturn in Gates */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #708090',
            boxShadow: '0 8px 32px rgba(112, 128, 144, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Target size={24} color="#708090" />
                <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                  Saturn in den Gates
                </Typography>
              </Box>
              <Chip 
                label="Gates 1-8 von 64" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(112,128,144,0.2)',
                  color: '#708090',
                  fontSize: '10px'
                }} 
              />
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Hier sind die ersten 8 Gates mit Saturn-Informationen. Saturn zeigt unsere Struktur und Disziplin in jedem Gate.
            </Typography>
            <List>
              {saturnInGates.map((gate, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color="#708090" />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #708090, #556B2F)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                          {gate.gate}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {gate.name}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {gate.structure}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={gate.discipline} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(112,128,144,0.2)',
                        color: '#708090',
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>
                        {gate.description}
                      </Typography>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 2, fontWeight: 500 }}>
                        {gate.deepMeaning}
                      </Typography>
                      
                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#FF6B6B', marginBottom: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {gate.shadowAspects.map((aspect, idx) => (
                            <Chip 
                              key={idx} 
                              label={aspect} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#4CAF50', marginBottom: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {gate.gifts.map((gift, idx) => (
                            <Chip 
                              key={idx} 
                              label={gift} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(112,128,144,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(112,128,144,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                          Struktur-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.structureAffirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Saturn in Centers */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #708090',
            boxShadow: '0 8px 32px rgba(112, 128, 144, 0.2)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Crown size={24} color="#708090" />
              <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                Saturn in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Saturn in den 9 Centers zeigt, wo unsere Struktur und Disziplin am stärksten wirken.
            </Typography>
            <List>
              {saturnInCenters.map((center, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color="#708090" />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #708090, #556B2F)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Crown size={20} color="#000" />
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {center.center}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {center.structure}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={center.discipline} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(112,128,144,0.2)',
                        color: '#708090',
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>
                        {center.description}
                      </Typography>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 2, fontWeight: 500 }}>
                        {center.deepMeaning}
                      </Typography>
                      
                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#FF6B6B', marginBottom: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {center.shadowAspects.map((aspect, idx) => (
                            <Chip 
                              key={idx} 
                              label={aspect} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(255,107,107,0.2)',
                                color: '#FF6B6B',
                                fontSize: '10px'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body2" style={{ color: '#4CAF50', marginBottom: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {center.gifts.map((gift, idx) => (
                            <Chip 
                              key={idx} 
                              label={gift} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                color: '#4CAF50',
                                fontSize: '10px'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(112,128,144,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(112,128,144,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#708090', fontWeight: 600, marginBottom: 1 }}>
                          Struktur-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.structureAffirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Star, 
  Zap, 
  Heart, 
  Brain, 
  Shield, 
  Target, 
  Crown,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NeptunePage() {
  const router = useRouter();
  const [expandedGate, setExpandedGate] = useState<number | false>(false);

  const neptuneInfo = {
    name: "Neptun",
    symbol: "♆",
    orbitalPeriod: "164.8 Jahre",
    discovery: "1846",
    mythology: "Der Mystiker",
    color: "#4169E1",
    description: "Neptun repräsentiert Spiritualität, Illusion und Verbindung. Er zeigt, wo wir spirituell wachsen, uns verbinden und mystische Erfahrungen machen."
  };

  const neptuneInGates = [
    {
      gate: 1,
      name: "Kreativität",
      spirituality: "Kreative Spiritualität",
      connection: "Schöpferische Verbindung",
      description: "Neptun hier zeigt, wie wir kreative Spiritualität und schöpferische Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Kreativität - wie du kreative Spiritualität entwickelst und schöpferische Verbindung erlebst.",
      shadowAspects: ["Kreative Blockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Kreative Spiritualität", "Schöpferische Verbindung", "Künstlerische Begabung", "Inspiration"],
      spiritualityAffirmation: "Ich entwickle kreative Spiritualität und erlebe schöpferische Verbindung. Meine Kreativität ist spirituell."
    },
    {
      gate: 2,
      name: "Empfänglichkeit",
      spirituality: "Empfangende Spiritualität",
      connection: "Empfangende Verbindung",
      description: "Neptun hier zeigt, wie wir empfängliche Spiritualität und empfängliche Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Empfänglichkeit - wie du empfängliche Spiritualität entwickelst und empfängliche Verbindung erlebst.",
      shadowAspects: ["Bindungsangst", "Spirituelle Illusionen", "Emotionale Distanz", "Trennung"],
      gifts: ["Empfangende Spiritualität", "Empathische Verbindung", "Tiefe Verbindung", "Heilende Präsenz"],
      spiritualityAffirmation: "Ich entwickle empfängliche Spiritualität und erlebe empathische Verbindung. Meine Verbindungsfähigkeit ist spirituell."
    },
    {
      gate: 3,
      name: "Beginn",
      spirituality: "Anfängliche Spiritualität",
      connection: "Anfängliche Verbindung",
      description: "Neptun hier zeigt, wie wir anfängliche Spiritualität und anfängliche Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Anfangs - wie du anfängliche Spiritualität entwickelst und anfängliche Verbindung erlebst.",
      shadowAspects: ["Angst vor Spiritualität", "Perfektionismus", "Angst vor dem Scheitern", "Trennung"],
      gifts: ["Anfängliche Spiritualität", "Pioniergeist", "Innovation", "Mut zum Neuanfang"],
      spiritualityAffirmation: "Ich entwickle anfängliche Spiritualität und erlebe pionierhafte Verbindung. Mein Pioniergeist ist spirituell."
    },
    {
      gate: 4,
      name: "Jugendliche Torheit",
      spirituality: "Wissende Spiritualität",
      connection: "Wissende Verbindung",
      description: "Neptun hier zeigt, wie wir wissende Spiritualität und wissende Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Wissens - wie du wissende Spiritualität entwickelst und wissende Verbindung erlebst.",
      shadowAspects: ["Wissensangst", "Spirituelle Illusionen", "Intellektuelle Arroganz", "Trennung"],
      gifts: ["Wissende Spiritualität", "Weisheit", "Lehrfähigkeit", "Mentoring"],
      spiritualityAffirmation: "Ich entwickle wissende Spiritualität und erlebe weise Verbindung. Mein Wissen ist spirituell."
    },
    {
      gate: 5,
      name: "Warten",
      spirituality: "Wartende Spiritualität",
      connection: "Wartende Verbindung",
      description: "Neptun hier zeigt, wie wir wartende Spiritualität und wartende Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Wartens - wie du wartende Spiritualität entwickelst und wartende Verbindung erlebst.",
      shadowAspects: ["Ungeduld", "Spirituelle Illusionen", "Zeitdruck", "Trennung"],
      gifts: ["Wartende Spiritualität", "Geduld", "Timing", "Vertrauen"],
      spiritualityAffirmation: "Ich entwickle wartende Spiritualität und erlebe zeitliche Verbindung. Meine Geduld ist spirituell."
    },
    {
      gate: 6,
      name: "Konflikt",
      spirituality: "Konfliktlösende Spiritualität",
      connection: "Konfliktlösende Verbindung",
      description: "Neptun hier zeigt, wie wir konfliktlösende Spiritualität und konfliktlösende Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Konfliktlösung - wie du konfliktlösende Spiritualität entwickelst und konfliktlösende Verbindung erlebst.",
      shadowAspects: ["Konfliktvermeidung", "Spirituelle Illusionen", "Harmoniezwang", "Trennung"],
      gifts: ["Konfliktlösende Spiritualität", "Mediation", "Wachstum", "Stärke"],
      spiritualityAffirmation: "Ich entwickle konfliktlösende Spiritualität und erlebe mediative Verbindung. Meine Konfliktlösung ist spirituell."
    },
    {
      gate: 7,
      name: "Die Rolle des Selbst",
      spirituality: "Rollenbewusste Spiritualität",
      connection: "Rollenbewusste Verbindung",
      description: "Neptun hier zeigt, wie wir rollenbewusste Spiritualität und rollenbewusste Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Rolle - wie du rollenbewusste Spiritualität entwickelst und rollenbewusste Verbindung erlebst.",
      shadowAspects: ["Identitätskrise", "Spirituelle Illusionen", "Rollenverwirrung", "Trennung"],
      gifts: ["Rollenbewusste Spiritualität", "Führung", "Authentizität", "Inspiration"],
      spiritualityAffirmation: "Ich entwickle rollenbewusste Spiritualität und erlebe führungsverbindung. Meine Rolle ist spirituell."
    },
    {
      gate: 8,
      name: "Haltung",
      spirituality: "Wertbewusste Spiritualität",
      connection: "Wertbewusste Verbindung",
      description: "Neptun hier zeigt, wie wir wertbewusste Spiritualität und wertbewusste Verbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Wertes - wie du wertbewusste Spiritualität entwickelst und wertbewusste Verbindung erlebst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Spirituelle Illusionen", "Selbstkritik", "Trennung"],
      gifts: ["Wertbewusste Spiritualität", "Selbstwert", "Würde", "Stolz"],
      spiritualityAffirmation: "Ich entwickle wertbewusste Spiritualität und erlebe würdevolle Verbindung. Mein Selbstwert ist spirituell."
    }
  ];

  const neptuneInCenters = [
    {
      center: "Head Center",
      spirituality: "Inspirationsspiritualität",
      connection: "Inspirationsverbindung",
      description: "Neptun hier zeigt, wie wir Inspirationsspiritualität und Inspirationsverbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Inspiration - wie du Inspirationsspiritualität entwickelst und Inspirationsverbindung erlebst.",
      shadowAspects: ["Inspirationsblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Inspirationsspiritualität", "Kreative Ideen", "Neue Konzepte", "Führung"],
      spiritualityAffirmation: "Ich entwickle Inspirationsspiritualität und erlebe kreative Verbindung. Meine Inspiration ist spirituell."
    },
    {
      center: "Ajna Center",
      spirituality: "Verstandesspiritualität",
      connection: "Verstandesverbindung",
      description: "Neptun hier zeigt, wie wir Verstandesspiritualität und Verstandesverbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Verstandes - wie du Verstandesspiritualität entwickelst und Verstandesverbindung erlebst.",
      shadowAspects: ["Verstandesblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Verstandesspiritualität", "Konzeptualisierung", "Analyse", "Verstehen"],
      spiritualityAffirmation: "Ich entwickle Verstandesspiritualität und erlebe analytische Verbindung. Mein Verstand ist spirituell."
    },
    {
      center: "Throat Center",
      spirituality: "Ausdrucksspiritualität",
      connection: "Ausdrucksverbindung",
      description: "Neptun hier zeigt, wie wir Ausdrucksspiritualität und Ausdrucksverbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Ausdrucks - wie du Ausdrucksspiritualität entwickelst und Ausdrucksverbindung erlebst.",
      shadowAspects: ["Ausdrucksblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Ausdrucksspiritualität", "Manifestation", "Kommunikation", "Kreativität"],
      spiritualityAffirmation: "Ich entwickle Ausdrucksspiritualität und erlebe kommunikative Verbindung. Mein Ausdruck ist spirituell."
    },
    {
      center: "G Center",
      spirituality: "Identitätsspiritualität",
      connection: "Identitätsverbindung",
      description: "Neptun hier zeigt, wie wir Identitätsspiritualität und Identitätsverbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Identität - wie du Identitätsspiritualität entwickelst und Identitätsverbindung erlebst.",
      shadowAspects: ["Identitätskrise", "Spirituelle Illusionen", "Orientierungslosigkeit", "Trennung"],
      gifts: ["Identitätsspiritualität", "Orientierung", "Führung", "Authentizität"],
      spiritualityAffirmation: "Ich entwickle Identitätsspiritualität und erlebe orientierungsverbindung. Meine Identität ist spirituell."
    },
    {
      center: "Heart Center",
      spirituality: "Wertspiritualität",
      connection: "Wertverbindung",
      description: "Neptun hier zeigt, wie wir Wertspiritualität und Wertverbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Wertes - wie du Wertspiritualität entwickelst und Wertverbindung erlebst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Spirituelle Illusionen", "Selbstkritik", "Trennung"],
      gifts: ["Wertspiritualität", "Selbstbehauptung", "Führung", "Würde"],
      spiritualityAffirmation: "Ich entwickle Wertspiritualität und erlebe würdevolle Verbindung. Mein Wert ist spirituell."
    },
    {
      center: "Solar Plexus Center",
      spirituality: "Emotionsspiritualität",
      connection: "Emotionsverbindung",
      description: "Neptun hier zeigt, wie wir Emotionsspiritualität und Emotionsverbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Emotionen - wie du Emotionsspiritualität entwickelst und Emotionsverbindung erlebst.",
      shadowAspects: ["Emotionsblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Emotionsspiritualität", "Empathie", "Verstehen", "Heilung"],
      spiritualityAffirmation: "Ich entwickle Emotionsspiritualität und erlebe empathische Verbindung. Meine Emotionalität ist spirituell."
    },
    {
      center: "Sacral Center",
      spirituality: "Lebenskraftspiritualität",
      connection: "Lebenskraftverbindung",
      description: "Neptun hier zeigt, wie wir Lebenskraftspiritualität und Lebenskraftverbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Lebenskraft - wie du Lebenskraftspiritualität entwickelst und Lebenskraftverbindung erlebst.",
      shadowAspects: ["Lebenskraftblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Lebenskraftspiritualität", "Arbeit", "Produktivität", "Kreativität"],
      spiritualityAffirmation: "Ich entwickle Lebenskraftspiritualität und erlebe produktive Verbindung. Meine Lebenskraft ist spirituell."
    },
    {
      center: "Spleen Center",
      spirituality: "Instinktspiritualität",
      connection: "Instinktverbindung",
      description: "Neptun hier zeigt, wie wir Instinktspiritualität und Instinktverbindung entwickeln.",
      deepMeaning: "Die Spiritualität der Instinkte - wie du Instinktspiritualität entwickelst und Instinktverbindung erlebst.",
      shadowAspects: ["Instinktblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Instinktspiritualität", "Intuition", "Gesundheit", "Schutz"],
      spiritualityAffirmation: "Ich entwickle Instinktspiritualität und erlebe intuitive Verbindung. Meine Instinkte sind spirituell."
    },
    {
      center: "Root Center",
      spirituality: "Druckspiritualität",
      connection: "Druckverbindung",
      description: "Neptun hier zeigt, wie wir Druckspiritualität und Druckverbindung entwickeln.",
      deepMeaning: "Die Spiritualität des Drucks - wie du Druckspiritualität entwickelst und Druckverbindung erlebst.",
      shadowAspects: ["Druckblockaden", "Spirituelle Illusionen", "Perfektionismus", "Trennung"],
      gifts: ["Druckspiritualität", "Stressbewältigung", "Antrieb", "Transformation"],
      spiritualityAffirmation: "Ich entwickle Druckspiritualität und erlebe transformative Verbindung. Mein Druck ist spirituell."
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 4, md: 6 },
      pb: 8,
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

      <Container maxWidth="lg" sx={{ padding: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{
            position: 'relative',
            height: { xs: 60, md: 80 },
            width: { xs: 200, md: 300 },
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key Logo"
              fill
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/Design%20ohne%20Titel(15).png';
              }}
              priority
            />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/planets')}
            sx={{
              color: '#F29F05',
              borderColor: 'rgba(242, 159, 5, 0.5)',
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: 'rgba(242, 159, 5, 0.1)',
                boxShadow: '0 0 20px rgba(242, 159, 5, 0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowLeft size={20} style={{ marginRight: 8 }} />
            Zurück zu den Planeten
          </Button>
        </Box>

        {/* Title mit großem Neptun-Symbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            {/* Großes rotierendes Neptun-Symbol */}
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
                  background: 'linear-gradient(135deg, #4169E1 0%, #6495ED 50%, #B0C4DE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `
                    0 0 60px #4169E150,
                    0 0 120px #4169E130,
                    0 0 180px #4169E115,
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
                    border: '2px solid #4169E140',
                    borderTopColor: '#4169E1',
                    borderRightColor: '#4169E1',
                    opacity: 0.3,
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                
                {/* Neptun Symbol */}
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
                  {neptuneInfo.symbol}
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
                  0 0 10px #4169E1,
                  0 0 20px #4169E180,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {neptuneInfo.name}
            </Typography>
            
            <Typography variant="h5" style={{ color: '#4169E1', fontStyle: 'italic', fontWeight: 600, mb: 2 }}>
              {neptuneInfo.mythology}
            </Typography>
            
            <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2, maxWidth: '700px', margin: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {neptuneInfo.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Neptune Overview */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: 4,
            marginBottom: 4
          }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Neptun Symbol in Card */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: { xs: 150, sm: 180, md: 200 },
                        height: { xs: 150, sm: 180, md: 200 },
                        margin: '0 auto 2rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4169E1 0%, #6495ED 50%, #B0C4DE 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `
                          0 0 40px #4169E150,
                          0 0 80px #4169E130,
                          inset -20px -20px 60px rgba(0, 0, 0, 0.4),
                          inset 20px 20px 60px rgba(255, 255, 255, 0.1)
                        `,
                      }}
                    >
                      <Typography variant="h1" sx={{ 
                        fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                        filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))',
                      }}>
                        {neptuneInfo.symbol}
                      </Typography>
                    </Box>
                  </motion.div>
                  <Typography variant="h4" sx={{ 
                    color: '#4169E1', 
                    fontWeight: 700, 
                    marginBottom: 2 
                  }}>
                    {neptuneInfo.name}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#F29F05', 
                    marginBottom: 3 
                  }}>
                    {neptuneInfo.mythology}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 3, lineHeight: 1.6 }}>
                    {neptuneInfo.description}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Orbitalperiode
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#F29F05' }}>
                          {neptuneInfo.orbitalPeriod}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Entdeckung
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#F29F05' }}>
                          {neptuneInfo.discovery}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Neptune in Gates */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Target size={24} color="#F29F05" />
                <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                  Neptun in den Gates
                </Typography>
              </Box>
              <Chip 
                label="Gates 1-8 von 64" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  fontSize: '10px',
                  border: '1px solid rgba(242, 159, 5, 0.3)'
                }} 
              />
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Hier sind die ersten 8 Gates mit Neptun-Informationen. Neptun zeigt unsere Spiritualität und Verbindung in jedem Gate.
            </Typography>
            <List>
              {neptuneInGates.map((gate, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown style={{ color: '#F29F05' }} />}
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
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                          {gate.gate}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {gate.name}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {gate.spirituality}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={gate.connection} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(242, 159, 5, 0.2)',
                        color: '#F29F05',
                        fontSize: '10px',
                        border: '1px solid rgba(242, 159, 5, 0.3)'
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
                        background: 'rgba(242, 159, 5, 0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(242, 159, 5, 0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#F29F05', fontWeight: 600, marginBottom: 1 }}>
                          Spiritualitäts-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.spiritualityAffirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Neptune in Centers */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Crown size={24} color="#F29F05" />
              <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                Neptun in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Neptun in den 9 Centers zeigt, wo unsere Spiritualität und Verbindung am stärksten wirken.
            </Typography>
            <List>
              {neptuneInCenters.map((center, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown style={{ color: '#F29F05' }} />}
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
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2
                      }}>
                        <Crown size={20} color="#fff" />
                      </Box>
                      <Box>
                        <Typography variant="h6" style={{ color: 'white', fontWeight: 600 }}>
                          {center.center}
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {center.spirituality}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={center.connection} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(242, 159, 5, 0.2)',
                        color: '#F29F05',
                        fontSize: '10px',
                        border: '1px solid rgba(242, 159, 5, 0.3)'
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
                        background: 'rgba(242, 159, 5, 0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(242, 159, 5, 0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#F29F05', fontWeight: 600, marginBottom: 1 }}>
                          Spiritualitäts-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.spiritualityAffirmation}
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

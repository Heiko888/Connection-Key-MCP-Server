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
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Zap, 
  Heart, 
  Brain, 
  Shield, 
  Target, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../components/Logo';
import RotatingPlanetSymbol from '../../../components/RotatingPlanetSymbol';

export default function JupiterPage() {
  const router = useRouter();
  const [expandedGate, setExpandedGate] = useState<number | false>(false);

  const jupiterInfo = {
    name: "Jupiter",
    symbol: "♃",
    mythology: "Der König der Götter",
    color: "#DAA520",
    gradient: "linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #FFF8DC 100%)",
    description: "Jupiter repräsentiert Expansion, Weisheit und Wachstum. Er zeigt, wo wir wachsen, uns ausdehnen und Weisheit erlangen."
  };

  const jupiterInGates = [
    {
      gate: 1,
      name: "Kreativität",
      expansion: "Kreative Expansion",
      wisdom: "Schöpferische Weisheit",
      description: "Jupiter hier zeigt, wie wir kreativ expandieren und schöpferische Weisheit erlangen.",
      deepMeaning: "Die Expansion der Kreativität - wie du deine kreativen Fähigkeiten erweiterst und schöpferische Weisheit entwickelst.",
      shadowAspects: ["Kreative Blockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Kreative Expansion", "Schöpferische Weisheit", "Künstlerische Begabung", "Inspiration"],
      expansionAffirmation: "Ich expandiere kreativ und entwickle schöpferische Weisheit. Meine Kreativität wächst unendlich."
    },
    {
      gate: 2,
      name: "Empfänglichkeit",
      expansion: "Empfangende Expansion",
      wisdom: "Empfangende Weisheit",
      description: "Jupiter hier zeigt, wie wir empfänglich expandieren und empfängliche Weisheit erlangen.",
      deepMeaning: "Die Expansion der Empfänglichkeit - wie du deine Empfänglichkeit erweiterst und empfängliche Weisheit entwickelst.",
      shadowAspects: ["Bindungsangst", "Angst vor Expansion", "Emotionale Distanz", "Begrenzung"],
      gifts: ["Empfangende Expansion", "Empathische Weisheit", "Tiefe Verbindung", "Heilende Präsenz"],
      expansionAffirmation: "Ich expandiere empfänglich und entwickle empathische Weisheit. Meine Verbindungsfähigkeit wächst unendlich."
    },
    {
      gate: 3,
      name: "Beginn",
      expansion: "Anfängliche Expansion",
      wisdom: "Anfängliche Weisheit",
      description: "Jupiter hier zeigt, wie wir neue Anfänge expandieren und anfängliche Weisheit erlangen.",
      deepMeaning: "Die Expansion des Anfangs - wie du neue Anfänge erweiterst und anfängliche Weisheit entwickelst.",
      shadowAspects: ["Angst vor Expansion", "Perfektionismus", "Angst vor dem Scheitern", "Begrenzung"],
      gifts: ["Anfängliche Expansion", "Pioniergeist", "Innovation", "Mut zum Neuanfang"],
      expansionAffirmation: "Ich expandiere mutig und entwickle pionierhafte Weisheit. Mein Pioniergeist wächst unendlich."
    },
    {
      gate: 4,
      name: "Jugendliche Torheit",
      expansion: "Wissende Expansion",
      wisdom: "Wissende Weisheit",
      description: "Jupiter hier zeigt, wie wir Wissen expandieren und wissende Weisheit erlangen.",
      deepMeaning: "Die Expansion des Wissens - wie du dein Wissen erweiterst und wissende Weisheit entwickelst.",
      shadowAspects: ["Wissensangst", "Angst vor Expansion", "Intellektuelle Arroganz", "Begrenzung"],
      gifts: ["Wissende Expansion", "Weisheit", "Lehrfähigkeit", "Mentoring"],
      expansionAffirmation: "Ich expandiere wissend und entwickle tiefe Weisheit. Mein Wissen wächst unendlich."
    },
    {
      gate: 5,
      name: "Warten",
      expansion: "Wartende Expansion",
      wisdom: "Wartende Weisheit",
      description: "Jupiter hier zeigt, wie wir Geduld expandieren und wartende Weisheit erlangen.",
      deepMeaning: "Die Expansion des Wartens - wie du deine Geduld erweiterst und wartende Weisheit entwickelst.",
      shadowAspects: ["Ungeduld", "Angst vor Expansion", "Zeitdruck", "Begrenzung"],
      gifts: ["Wartende Expansion", "Geduld", "Timing", "Vertrauen"],
      expansionAffirmation: "Ich expandiere geduldig und entwickle zeitliche Weisheit. Meine Geduld wächst unendlich."
    },
    {
      gate: 6,
      name: "Konflikt",
      expansion: "Konfliktlösende Expansion",
      wisdom: "Konfliktlösende Weisheit",
      description: "Jupiter hier zeigt, wie wir Konfliktlösung expandieren und konfliktlösende Weisheit erlangen.",
      deepMeaning: "Die Expansion der Konfliktlösung - wie du deine Konfliktlösungsfähigkeit erweiterst und konfliktlösende Weisheit entwickelst.",
      shadowAspects: ["Konfliktvermeidung", "Angst vor Expansion", "Harmoniezwang", "Begrenzung"],
      gifts: ["Konfliktlösende Expansion", "Mediation", "Wachstum", "Stärke"],
      expansionAffirmation: "Ich expandiere konfliktlösend und entwickle mediative Weisheit. Meine Konfliktlösung wächst unendlich."
    },
    {
      gate: 7,
      name: "Die Rolle des Selbst",
      expansion: "Rollenbewusste Expansion",
      wisdom: "Rollenbewusste Weisheit",
      description: "Jupiter hier zeigt, wie wir unsere Rolle expandieren und rollenbewusste Weisheit erlangen.",
      deepMeaning: "Die Expansion der Rolle - wie du deine Rolle erweiterst und rollenbewusste Weisheit entwickelst.",
      shadowAspects: ["Identitätskrise", "Angst vor Expansion", "Rollenverwirrung", "Begrenzung"],
      gifts: ["Rollenbewusste Expansion", "Führung", "Authentizität", "Inspiration"],
      expansionAffirmation: "Ich expandiere rollenbewusst und entwickle führungsweisheit. Meine Rolle wächst unendlich."
    },
    {
      gate: 8,
      name: "Haltung",
      expansion: "Wertbewusste Expansion",
      wisdom: "Wertbewusste Weisheit",
      description: "Jupiter hier zeigt, wie wir unseren Wert expandieren und wertbewusste Weisheit erlangen.",
      deepMeaning: "Die Expansion des Wertes - wie du deinen Selbstwert erweiterst und wertbewusste Weisheit entwickelst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Angst vor Expansion", "Selbstkritik", "Begrenzung"],
      gifts: ["Wertbewusste Expansion", "Selbstwert", "Würde", "Stolz"],
      expansionAffirmation: "Ich expandiere wertbewusst und entwickle würdeweisheit. Mein Selbstwert wächst unendlich."
    }
  ];

  const jupiterInCenters = [
    {
      center: "Head Center",
      expansion: "Inspirationsexpansion",
      wisdom: "Inspirationsweisheit",
      description: "Jupiter hier zeigt, wie wir Inspiration expandieren und inspirationsweisheit erlangen.",
      deepMeaning: "Die Expansion der Inspiration - wie du deine Inspirationsfähigkeit erweiterst und inspirationsweisheit entwickelst.",
      shadowAspects: ["Inspirationsblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Inspirationsexpansion", "Kreative Ideen", "Neue Konzepte", "Führung"],
      expansionAffirmation: "Ich expandiere inspirierend und entwickle kreative Weisheit. Meine Inspiration wächst unendlich."
    },
    {
      center: "Ajna Center",
      expansion: "Verstandesexpansion",
      wisdom: "Verstandesweisheit",
      description: "Jupiter hier zeigt, wie wir Denken expandieren und verstandesweisheit erlangen.",
      deepMeaning: "Die Expansion des Verstandes - wie du dein Denken erweiterst und verstandesweisheit entwickelst.",
      shadowAspects: ["Verstandesblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Verstandesexpansion", "Konzeptualisierung", "Analyse", "Verstehen"],
      expansionAffirmation: "Ich expandiere verstandesmäßig und entwickle analytische Weisheit. Mein Verstand wächst unendlich."
    },
    {
      center: "Throat Center",
      expansion: "Ausdruckserweiterung",
      wisdom: "Ausdrucksweisheit",
      description: "Jupiter hier zeigt, wie wir Ausdruck expandieren und ausdrucksweisheit erlangen.",
      deepMeaning: "Die Expansion des Ausdrucks - wie du deinen Ausdruck erweiterst und ausdrucksweisheit entwickelst.",
      shadowAspects: ["Ausdrucksblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Ausdruckserweiterung", "Manifestation", "Kommunikation", "Kreativität"],
      expansionAffirmation: "Ich expandiere ausdrucksvoll und entwickle kommunikative Weisheit. Mein Ausdruck wächst unendlich."
    },
    {
      center: "G Center",
      expansion: "Identitätsexpansion",
      wisdom: "Identitätsweisheit",
      description: "Jupiter hier zeigt, wie wir Identität expandieren und identitätsweisheit erlangen.",
      deepMeaning: "Die Expansion der Identität - wie du deine Identität erweiterst und identitätsweisheit entwickelst.",
      shadowAspects: ["Identitätskrise", "Angst vor Expansion", "Orientierungslosigkeit", "Begrenzung"],
      gifts: ["Identitätsexpansion", "Orientierung", "Führung", "Authentizität"],
      expansionAffirmation: "Ich expandiere identitätsbewusst und entwickle orientierungsweisheit. Meine Identität wächst unendlich."
    },
    {
      center: "Heart Center",
      expansion: "Wertweiterung",
      wisdom: "Wertweisheit",
      description: "Jupiter hier zeigt, wie wir Wert expandieren und wertweisheit erlangen.",
      deepMeaning: "Die Expansion des Wertes - wie du deinen Wert erweiterst und wertweisheit entwickelst.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Angst vor Expansion", "Selbstkritik", "Begrenzung"],
      gifts: ["Wertweiterung", "Selbstbehauptung", "Führung", "Würde"],
      expansionAffirmation: "Ich expandiere wertbewusst und entwickle würdeweisheit. Mein Wert wächst unendlich."
    },
    {
      center: "Solar Plexus Center",
      expansion: "Emotionserweiterung",
      wisdom: "Emotionsweisheit",
      description: "Jupiter hier zeigt, wie wir Emotionen expandieren und emotionsweisheit erlangen.",
      deepMeaning: "Die Expansion der Emotionen - wie du deine Emotionalität erweiterst und emotionsweisheit entwickelst.",
      shadowAspects: ["Emotionsblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Emotionserweiterung", "Empathie", "Verstehen", "Heilung"],
      expansionAffirmation: "Ich expandiere emotional und entwickle empathische Weisheit. Meine Emotionalität wächst unendlich."
    },
    {
      center: "Sacral Center",
      expansion: "Lebenskrafterweiterung",
      wisdom: "Lebenskraftweisheit",
      description: "Jupiter hier zeigt, wie wir Lebenskraft expandieren und lebenskraftweisheit erlangen.",
      deepMeaning: "Die Expansion der Lebenskraft - wie du deine Lebenskraft erweiterst und lebenskraftweisheit entwickelst.",
      shadowAspects: ["Lebenskraftblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Lebenskrafterweiterung", "Arbeit", "Produktivität", "Kreativität"],
      expansionAffirmation: "Ich expandiere lebenskräftig und entwickle produktive Weisheit. Meine Lebenskraft wächst unendlich."
    },
    {
      center: "Spleen Center",
      expansion: "Instinkterweiterung",
      wisdom: "Instinktweisheit",
      description: "Jupiter hier zeigt, wie wir Instinkte expandieren und instinktweisheit erlangen.",
      deepMeaning: "Die Expansion der Instinkte - wie du deine Instinkte erweiterst und instinktweisheit entwickelst.",
      shadowAspects: ["Instinktblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Instinkterweiterung", "Intuition", "Gesundheit", "Schutz"],
      expansionAffirmation: "Ich expandiere instinktiv und entwickle intuitive Weisheit. Meine Instinkte wachsen unendlich."
    },
    {
      center: "Root Center",
      expansion: "Druckerweiterung",
      wisdom: "Druckweisheit",
      description: "Jupiter hier zeigt, wie wir Druck expandieren und druckweisheit erlangen.",
      deepMeaning: "Die Expansion des Drucks - wie du deinen Druck erweiterst und druckweisheit entwickelst.",
      shadowAspects: ["Druckblockaden", "Angst vor Expansion", "Perfektionismus", "Begrenzung"],
      gifts: ["Druckerweiterung", "Stressbewältigung", "Antrieb", "Transformation"],
      expansionAffirmation: "Ich expandiere druckvoll und entwickle transformative Weisheit. Mein Druck wächst unendlich."
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
        <Logo />

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

        {/* Title mit großem rotierendem Jupiter-Symbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            {/* Großes rotierendes Jupiter-Symbol */}
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
                  background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #FFF8DC 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `
                    0 0 60px #DAA52050,
                    0 0 120px #DAA52030,
                    0 0 180px #DAA52015,
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
                    border: '2px solid #DAA52040',
                    borderTopColor: '#DAA520',
                    borderRightColor: '#DAA520',
                    opacity: 0.3,
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                
                {/* Jupiter Symbol */}
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
                  {jupiterInfo.symbol}
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
                  0 0 10px #DAA520,
                  0 0 20px #DAA52080,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {jupiterInfo.name}
            </Typography>
            
            <Typography variant="h5" sx={{ 
              color: '#DAA520', 
              fontStyle: 'italic', 
              fontWeight: 600,
              mb: 2
            }}>
              {jupiterInfo.mythology}
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              marginTop: 2, 
              maxWidth: '700px', 
              margin: 'auto',
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}>
              {jupiterInfo.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Jupiter in Gates */}
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
                  Jupiter in den Gates
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
              Hier sind die ersten 8 Gates mit Jupiter-Informationen. Jupiter zeigt unsere Expansion und Weisheit in jedem Gate.
            </Typography>
            <List>
              {jupiterInGates.map((gate, index) => (
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
                          {gate.expansion}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={gate.wisdom} 
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
                          Expansions-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.expansionAffirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Jupiter in Centers */}
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
                Jupiter in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Jupiter in den 9 Centers zeigt, wo unsere Expansion und Weisheit am stärksten wirken.
            </Typography>
            <List>
              {jupiterInCenters.map((center, index) => (
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
                          {center.expansion}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={center.wisdom} 
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
                          Expansions-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.expansionAffirmation}
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

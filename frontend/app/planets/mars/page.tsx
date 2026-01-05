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
  Zap, 
  Star, 
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
import RotatingPlanetSymbol from '../../../components/RotatingPlanetSymbol';

export default function MarsPage() {
  const router = useRouter();
  const [expandedGate, setExpandedGate] = useState<number | false>(false);

  const marsInfo = {
    name: "Mars",
    symbol: "♂",
    orbitalPeriod: "687 Tage",
    discovery: "Seit Anbeginn der Zeit",
    mythology: "Der Gott des Krieges",
    color: "#FF4500",
    description: "Mars repräsentiert Aktion, Aggression und Durchsetzung. Er zeigt, wie wir handeln, uns durchsetzen und unsere Ziele verfolgen."
  };

  const marsInGates = [
    {
      gate: 1,
      name: "Kreativität",
      action: "Kreative Aktion",
      aggression: "Schöpferische Durchsetzung",
      description: "Mars hier zeigt, wie wir kreativ handeln und schöpferisch durchsetzen.",
      deepMeaning: "Die Aktion der Kreativität - wie du kreative Ideen in die Tat umsetzt und durchsetzt.",
      shadowAspects: ["Kreative Blockaden", "Angst vor Aktion", "Perfektionismus", "Passivität"],
      gifts: ["Kreative Aktion", "Schöpferische Durchsetzung", "Innovative Lösungen", "Pioniergeist"],
      actionAffirmation: "Ich handle kreativ und setze meine Ideen durch. Meine Aktion ist schöpferisch."
    },
    {
      gate: 2,
      name: "Empfänglichkeit",
      action: "Empfangende Aktion",
      aggression: "Empfangende Durchsetzung",
      description: "Mars hier zeigt, wie wir empfänglich handeln und durchsetzen.",
      deepMeaning: "Die Aktion der Empfänglichkeit - wie du empfänglich für andere handelst und durchsetzt.",
      shadowAspects: ["Passivität", "Angst vor Aktion", "Unterdrückung", "Schwäche"],
      gifts: ["Empfangende Aktion", "Empathische Durchsetzung", "Verbindung", "Heilung"],
      actionAffirmation: "Ich handle empfänglich und setze Verbindung durch. Meine Aktion ist heilend."
    },
    {
      gate: 3,
      name: "Beginn",
      action: "Anfängliche Aktion",
      aggression: "Anfängliche Durchsetzung",
      description: "Mars hier zeigt, wie wir neue Anfänge in die Tat umsetzen.",
      deepMeaning: "Die Aktion des Anfangs - wie du neue Anfänge mutig in die Tat umsetzt.",
      shadowAspects: ["Angst vor Aktion", "Perfektionismus", "Zweifel", "Aufschub"],
      gifts: ["Anfängliche Aktion", "Pioniergeist", "Mut", "Innovation"],
      actionAffirmation: "Ich handle mutig und setze neue Anfänge durch. Meine Aktion ist pionierhaft."
    },
    {
      gate: 4,
      name: "Jugendliche Torheit",
      action: "Wissende Aktion",
      aggression: "Wissende Durchsetzung",
      description: "Mars hier zeigt, wie wir Wissen in die Tat umsetzen.",
      deepMeaning: "Die Aktion des Wissens - wie du dein Wissen in praktische Aktionen umsetzt.",
      shadowAspects: ["Wissensdurst ohne Praxis", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Wissende Aktion", "Praktische Anwendung", "Lehre", "Mentoring"],
      actionAffirmation: "Ich handle weise und setze mein Wissen durch. Meine Aktion ist lehrend."
    },
    {
      gate: 5,
      name: "Warten",
      action: "Wartende Aktion",
      aggression: "Wartende Durchsetzung",
      description: "Mars hier zeigt, wie wir geduldig handeln und das richtige Timing finden.",
      deepMeaning: "Die Aktion des Wartens - wie du geduldig handelst und das richtige Timing findest.",
      shadowAspects: ["Ungeduld", "Angst vor Aktion", "Zeitdruck", "Kontrollzwang"],
      gifts: ["Wartende Aktion", "Geduld", "Timing", "Vertrauen"],
      actionAffirmation: "Ich handle geduldig und zum richtigen Zeitpunkt. Mein Timing ist perfekt."
    },
    {
      gate: 6,
      name: "Konflikt",
      action: "Konfliktlösende Aktion",
      aggression: "Konfliktlösende Durchsetzung",
      description: "Mars hier zeigt, wie wir Konflikte durch Aktion lösen.",
      deepMeaning: "Die Aktion des Konflikts - wie du Konflikte durch entschlossene Aktion löst.",
      shadowAspects: ["Konfliktvermeidung", "Angst vor Aktion", "Passivität", "Schwäche"],
      gifts: ["Konfliktlösende Aktion", "Mediation", "Wachstum", "Stärke"],
      actionAffirmation: "Ich handle entschlossen und löse Konflikte. Meine Aktion schafft Frieden."
    },
    {
      gate: 7,
      name: "Die Rolle des Selbst",
      action: "Rollenbewusste Aktion",
      aggression: "Rollenbewusste Durchsetzung",
      description: "Mars hier zeigt, wie wir unsere Rolle durch Aktion ausüben.",
      deepMeaning: "Die Aktion der Rolle - wie du deine Rolle und Führung durch Aktion ausübst.",
      shadowAspects: ["Identitätskrise", "Angst vor Aktion", "Selbstzweifel", "Passivität"],
      gifts: ["Rollenbewusste Aktion", "Führung", "Authentizität", "Inspiration"],
      actionAffirmation: "Ich handle authentisch und führe durch Aktion. Meine Führung ist inspirierend."
    },
    {
      gate: 8,
      name: "Haltung",
      action: "Wertbewusste Aktion",
      aggression: "Wertbewusste Durchsetzung",
      description: "Mars hier zeigt, wie wir unseren Wert durch Aktion behaupten.",
      deepMeaning: "Die Aktion des Wertes - wie du deinen Wert und deine Würde durch Aktion behauptest.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Angst vor Aktion", "Selbstkritik", "Unterdrückung"],
      gifts: ["Wertbewusste Aktion", "Selbstbehauptung", "Würde", "Stolz"],
      actionAffirmation: "Ich handle würdevoll und behaupte meinen Wert. Meine Aktion ist wertvoll."
    }
  ];

  const marsInCenters = [
    {
      center: "Head Center",
      action: "Inspirationsaktion",
      aggression: "Inspirative Durchsetzung",
      description: "Mars hier zeigt, wie wir Inspiration durch Aktion umsetzen.",
      deepMeaning: "Die Aktion der Inspiration - wie du neue Ideen durch entschlossene Aktion umsetzt.",
      shadowAspects: ["Inspirationsblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Inspirationsaktion", "Kreative Ideen", "Neue Konzepte", "Führung"],
      actionAffirmation: "Ich handle inspirierend und setze neue Ideen durch. Meine Aktion begeistert."
    },
    {
      center: "Ajna Center",
      action: "Verstandesaktion",
      aggression: "Verstandesdurchsetzung",
      description: "Mars hier zeigt, wie wir Denken durch Aktion umsetzen.",
      deepMeaning: "Die Aktion des Verstandes - wie du komplexe Konzepte durch praktische Aktion umsetzt.",
      shadowAspects: ["Verstandesblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Verstandesaktion", "Konzeptualisierung", "Analyse", "Verstehen"],
      actionAffirmation: "Ich handle klar und setze mein Denken durch. Meine Aktion ist verständlich."
    },
    {
      center: "Throat Center",
      action: "Ausdrucksaktion",
      aggression: "Ausdrucksdurchsetzung",
      description: "Mars hier zeigt, wie wir Ausdruck durch Aktion umsetzen.",
      deepMeaning: "Die Aktion des Ausdrucks - wie du dich authentisch durch Aktion ausdrückst.",
      shadowAspects: ["Ausdrucksblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Ausdrucksaktion", "Manifestation", "Kommunikation", "Kreativität"],
      actionAffirmation: "Ich handle authentisch und drücke mich durch Aktion aus. Mein Ausdruck manifestiert sich."
    },
    {
      center: "G Center",
      action: "Identitätsaktion",
      aggression: "Identitätsdurchsetzung",
      description: "Mars hier zeigt, wie wir Identität durch Aktion umsetzen.",
      deepMeaning: "Die Aktion der Identität - wie du deine Identität und Orientierung durch Aktion umsetzt.",
      shadowAspects: ["Identitätskrise", "Angst vor Aktion", "Orientierungslosigkeit", "Selbstzweifel"],
      gifts: ["Identitätsaktion", "Orientierung", "Führung", "Authentizität"],
      actionAffirmation: "Ich handle authentisch und setze meine Identität durch. Meine Orientierung ist klar."
    },
    {
      center: "Heart Center",
      action: "Wertaktion",
      aggression: "Wertdurchsetzung",
      description: "Mars hier zeigt, wie wir Wert durch Aktion umsetzen.",
      deepMeaning: "Die Aktion des Wertes - wie du deinen Wert und deine Selbstbehauptung durch Aktion umsetzt.",
      shadowAspects: ["Wertlosigkeitsgefühl", "Angst vor Aktion", "Selbstkritik", "Unterdrückung"],
      gifts: ["Wertaktion", "Selbstbehauptung", "Führung", "Würde"],
      actionAffirmation: "Ich handle würdevoll und setze meinen Wert durch. Meine Selbstbehauptung ist stark."
    },
    {
      center: "Solar Plexus Center",
      action: "Emotionsaktion",
      aggression: "Emotionsdurchsetzung",
      description: "Mars hier zeigt, wie wir Emotionen durch Aktion umsetzen.",
      deepMeaning: "Die Aktion der Emotionen - wie du Emotionen durch entschlossene Aktion umsetzt.",
      shadowAspects: ["Emotionsblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Emotionsaktion", "Empathie", "Verstehen", "Heilung"],
      actionAffirmation: "Ich handle emotional und setze meine Gefühle durch. Meine Emotionalität ist heilend."
    },
    {
      center: "Sacral Center",
      action: "Lebenskraftaktion",
      aggression: "Lebenskraftdurchsetzung",
      description: "Mars hier zeigt, wie wir Lebenskraft durch Aktion umsetzen.",
      deepMeaning: "Die Aktion der Lebenskraft - wie du deine Lebenskraft und Arbeit durch entschlossene Aktion umsetzt.",
      shadowAspects: ["Lebenskraftblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Lebenskraftaktion", "Arbeit", "Produktivität", "Kreativität"],
      actionAffirmation: "Ich handle produktiv und setze meine Lebenskraft durch. Meine Arbeit ist erfüllend."
    },
    {
      center: "Spleen Center",
      action: "Instinktaktion",
      aggression: "Instinktdurchsetzung",
      description: "Mars hier zeigt, wie wir Instinkte durch Aktion umsetzen.",
      deepMeaning: "Die Aktion der Instinkte - wie du Instinkte und Intuition durch entschlossene Aktion umsetzt.",
      shadowAspects: ["Instinktblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Instinktaktion", "Intuition", "Gesundheit", "Schutz"],
      actionAffirmation: "Ich handle intuitiv und setze meine Instinkte durch. Meine Intuition schützt mich."
    },
    {
      center: "Root Center",
      action: "Druckaktion",
      aggression: "Druckdurchsetzung",
      description: "Mars hier zeigt, wie wir Druck durch Aktion umsetzen.",
      deepMeaning: "Die Aktion des Drucks - wie du Druck und Stress durch entschlossene Aktion umsetzt.",
      shadowAspects: ["Druckblockaden", "Angst vor Aktion", "Perfektionismus", "Zweifel"],
      gifts: ["Druckaktion", "Stressbewältigung", "Antrieb", "Transformation"],
      actionAffirmation: "Ich handle konstruktiv und setze meinen Druck durch. Mein Stress wird zu Antrieb."
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
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
          radial-gradient(2px 2px at 20px 30px, #FF4500, transparent),
          radial-gradient(2px 2px at 40px 70px, #FF4500, transparent),
          radial-gradient(1px 1px at 90px 40px, #FF4500, transparent),
          radial-gradient(1px 1px at 130px 80px, #FF4500, transparent),
          radial-gradient(2px 2px at 160px 30px, #FF4500, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'twinkle 4s ease-in-out infinite alternate'
      }} />

      {/* Animated Mars */}
      <motion.div
        
        animate={{ 
          opacity: 0.5, 
          scale: [1, 1.07, 1],
          rotate: 360
        }}
        transition={{ 
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 22, repeat: Infinity, ease: "linear" }
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '8%',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, #DC143C, #B22222, #8B0000),
            radial-gradient(circle at 70% 70%, #B22222, #8B0000, #654321),
            radial-gradient(circle at 50% 50%, #FF6347, #DC143C)
          `,
          boxShadow: `
            0 0 30px rgba(220, 20, 60, 0.6),
            0 0 60px rgba(178, 34, 34, 0.5),
            0 0 90px rgba(139, 0, 0, 0.4),
            inset -10px -10px 20px rgba(101, 67, 33, 0.3)
          `,
          zIndex: 0
        }}
      >
        {/* Mars Surface Details - Craters and Valleys */}
        <Box sx={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: 'rgba(139, 0, 0, 0.8)',
          boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '65%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          background: 'rgba(178, 34, 34, 0.7)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '45%',
          left: '10%',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'rgba(101, 67, 33, 0.6)',
          boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '70%',
          left: '30%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'rgba(139, 0, 0, 0.9)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '35%',
          left: '75%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(178, 34, 34, 0.8)',
          boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5)'
        }} />
      </motion.div>

      {/* Mars Dust Storm */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '-2%',
          right: '2%',
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle, transparent 30%, rgba(220, 20, 60, 0.1) 50%, rgba(178, 34, 34, 0.2) 70%, transparent 100%)
          `,
          zIndex: -1
        }}
      />

      {/* Mars Energy Bursts */}
      <motion.div
        animate={{ 
          scale: [0, 1.4, 0],
          opacity: [0, 0.6, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeOut"
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '20%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#DC143C',
          boxShadow: '0 0 12px rgba(220, 20, 60, 0.8)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.2, 0],
          opacity: [0, 0.7, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '30%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: '#B22222',
          boxShadow: '0 0 10px rgba(178, 34, 34, 0.7)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          scale: [0, 1.6, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#FF6347',
          boxShadow: '0 0 15px rgba(255, 99, 71, 0.6)',
          zIndex: 0
        }}
      />

      {/* Mars Dust Particles */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -15, 0],
          opacity: [0.2, 0.8, 0.2]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '40%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#8B0000',
          boxShadow: '0 0 4px rgba(139, 0, 0, 0.6)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          x: [0, -25, 0],
          y: [0, -20, 0],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        style={{
          position: 'absolute',
          top: '50%',
          right: '50%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#B22222',
          boxShadow: '0 0 3px rgba(178, 34, 34, 0.5)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ 
          x: [0, 35, 0],
          y: [0, -10, 0],
          opacity: [0.1, 0.9, 0.1]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        style={{
          position: 'absolute',
          top: '70%',
          right: '30%',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#DC143C',
          boxShadow: '0 0 6px rgba(220, 20, 60, 0.4)',
          zIndex: 0
        }}
      />

      {/* Mars Moons - Phobos and Deimos */}
      <motion.div
        
        animate={{ 
          opacity: 0.6,
          scale: 1,
          x: [0, 35, 0],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '15%',
          right: '25%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, #8B4513, #A0522D, #654321),
            radial-gradient(circle at 60% 60%, #A0522D, #654321, #3E2723)
          `,
          boxShadow: `
            0 0 8px rgba(139, 69, 19, 0.4),
            inset -2px -2px 6px rgba(0, 0, 0, 0.4)
          `,
          zIndex: 1
        }}
      >
        {/* Phobos Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'rgba(101, 67, 33, 0.7)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(160, 82, 45, 0.8)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4)'
        }} />
      </motion.div>

      <motion.div
        
        animate={{ 
          opacity: 0.5,
          scale: 1,
          x: [0, -30, 0],
          y: [0, -25, 0]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '20%',
          right: '35%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 40% 40%, #8B4513, #654321, #3E2723),
            radial-gradient(circle at 60% 60%, #654321, #3E2723, #1B1B1B)
          `,
          boxShadow: `
            0 0 6px rgba(139, 69, 19, 0.3),
            inset -1px -1px 4px rgba(0, 0, 0, 0.4)
          `,
          zIndex: 1
        }}
      >
        {/* Deimos Surface Details */}
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(101, 67, 33, 0.8)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4)'
        }} />
      </motion.div>

      <Container maxWidth="lg" sx={{ padding: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/planets')}
            sx={{
              color: '#FF4500',
              borderColor: '#FF4500',
              '&:hover': {
                borderColor: '#FF4500',
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
                boxShadow: '0 0 20px rgba(255, 69, 0, 0.3)'
              },
              marginRight: 2
            }}
          >
            <ArrowLeft size={20} style={{ marginRight: 8 }} />
            Zurück zu den Planeten
          </Button>
        </Box>

        {/* Title mit rotierendem Planetensymbol */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
            {/* Großes rotierendes Mars-Symbol */}
            <Box sx={{ mb: 3 }}>
              <RotatingPlanetSymbol
                symbol={marsInfo.symbol}
                color={marsInfo.color}
                gradient="linear-gradient(135deg, #FF4500 0%, #FF6347 50%, #FF7F50 100%)"
                size="large"
              />
            </Box>
            
            {/* Planet Name */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900,
                color: '#ffffff',
                textShadow: `
                  0 0 10px ${marsInfo.color},
                  0 0 20px ${marsInfo.color}80,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {marsInfo.name}
            </Typography>
            
            <Typography variant="h5" style={{ color: marsInfo.color, fontStyle: 'italic', fontWeight: 600, mb: 2 }}>
              {marsInfo.mythology}
            </Typography>
            
            <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2, maxWidth: '700px', margin: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {marsInfo.description}
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
            border: '1px solid #FF4500',
            boxShadow: '0 8px 32px rgba(255, 69, 0, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Box sx={{ marginRight: 2 }}>
                <RotatingPlanetSymbol
                  symbol={marsInfo.symbol}
                  color={marsInfo.color}
                  gradient="linear-gradient(135deg, #FF4500 0%, #FF6347 50%, #FF7F50 100%)"
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="h5" style={{ color: 'white', fontWeight: 600 }}>
                  {marsInfo.name} - Übersicht
                </Typography>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Grundlegende Informationen über {marsInfo.name}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                    Umlaufzeit
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {marsInfo.orbitalPeriod}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                    Entdeckung
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {marsInfo.discovery}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                    Mythologie
                  </Typography>
                  <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {marsInfo.mythology}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                    Farbe
                  </Typography>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    backgroundColor: marsInfo.color,
                    margin: 'auto',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Mars in Gates */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #FF4500',
            boxShadow: '0 8px 32px rgba(255, 69, 0, 0.2)',
            p: 3,
            marginBottom: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Target size={24} color="#FF4500" />
                <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                  Mars in den Gates
                </Typography>
              </Box>
              <Chip 
                label="Gates 1-8 von 64" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,69,0,0.2)',
                  color: '#FF4500',
                  fontSize: '10px'
                }} 
              />
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Hier sind die ersten 8 Gates mit Mars-Informationen. Mars zeigt unsere Aktion und Durchsetzung in jedem Gate.
            </Typography>
            <List>
              {marsInGates.map((gate, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown style={{ color: '#FF4500' }} />}
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
                        background: 'linear-gradient(45deg, #FF4500, #FF6347)',
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
                          {gate.action}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={gate.aggression} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,69,0,0.2)',
                        color: '#FF4500',
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
                        background: 'rgba(255,69,0,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(255,69,0,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                          Aktions-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.actionAffirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Mars in Centers */}
        <motion.div
          
          
          
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid #FF4500',
            boxShadow: '0 8px 32px rgba(255, 69, 0, 0.2)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Crown size={24} color="#FF4500" />
              <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 600, color: 'white' }}>
                Mars in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontStyle: 'italic' }}>
              Mars in den 9 Centers zeigt, wo unsere Aktion und Durchsetzung am stärksten wirken.
            </Typography>
            <List>
              {marsInCenters.map((center, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  marginBottom: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown style={{ color: '#FF4500' }} />}
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
                        background: 'linear-gradient(45deg, #FF4500, #FF6347)',
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
                          {center.action}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={center.aggression} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,69,0,0.2)',
                        color: '#FF4500',
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
                        background: 'rgba(255,69,0,0.1)', 
                        borderRadius: 2, 
                        border: '1px solid rgba(255,69,0,0.3)'
                      }}>
                        <Typography variant="body2" style={{ color: '#FF4500', fontWeight: 600, marginBottom: 1 }}>
                          Aktions-Affirmation:
                        </Typography>
                        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.actionAffirmation}
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

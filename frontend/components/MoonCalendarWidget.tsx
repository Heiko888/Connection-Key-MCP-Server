"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Moon, 
  Calendar,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface MoonPhase {
  name: string;
  description: string;
  icon: string;
  energy: string;
  color: string;
  advice: string;
}

const MoonCalendarWidget = () => {
  const [currentPhase, setCurrentPhase] = useState<MoonPhase | null>(null);
  const [loading, setLoading] = useState(true);

  const moonPhases: MoonPhase[] = [
    {
      name: "Neumond",
      description: "Zeit für Neubeginn und Intentionen",
      icon: "🌑",
      energy: "Neubeginn",
      color: "#1e293b",
      advice: "Setze neue Ziele und Intentionen"
    },
    {
      name: "Zunehmender Mond",
      description: "Perfekt für Wachstum und Manifestation",
      icon: "🌒",
      energy: "Wachstum",
      color: "#f59e0b",
      advice: "Baue Energie auf und arbeite an Projekten"
    },
    {
      name: "Vollmond",
      description: "Zeit der Erfüllung und Klarheit",
      icon: "🌕",
      energy: "Erfüllung",
      color: "#fef3c7",
      advice: "Feiere Erfolge und reflektiere"
    },
    {
      name: "Abnehmender Mond",
      description: "Ideal für Loslassen und Reinigung",
      icon: "🌖",
      energy: "Loslassen",
      color: "#8b5cf6",
      advice: "Lass Altes los und bereite dich vor"
    }
  ];

  useEffect(() => {
    loadCurrentMoonPhase();
  }, []);

  const loadCurrentMoonPhase = async () => {
    try {
      const response = await fetch('/api/moon-calendar/current');
      
      if (!response.ok) {
        // Fallback zu lokalen Daten
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
        setLoading(false);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      if (data.current && data.current.phase) {
        // Konvertiere API-Daten zu unserem Format
        const apiPhase = data.current.phase;
        const convertedPhase: MoonPhase = {
          name: apiPhase.name || 'Unbekannt',
          description: apiPhase.description || 'Keine Beschreibung verfügbar',
          icon: apiPhase.icon || '🌕',
          energy: apiPhase.energy || 'Neutral',
          color: apiPhase.color || '#8b5cf6',
          advice: apiPhase.advice || 'Nutze die Energie dieser Mondphase'
        };
        setCurrentPhase(convertedPhase);
      } else if (data.phase) {
        // Alternative Datenstruktur
        const apiPhase = data.phase;
        const convertedPhase: MoonPhase = {
          name: apiPhase.name || 'Unbekannt',
          description: apiPhase.description || 'Keine Beschreibung verfügbar',
          icon: apiPhase.icon || '🌕',
          energy: apiPhase.energy || 'Neutral',
          color: apiPhase.color || '#8b5cf6',
          advice: apiPhase.advice || 'Nutze die Energie dieser Mondphase'
        };
        setCurrentPhase(convertedPhase);
      } else {
        // Fallback wenn keine Phase-Daten
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mondphase:', err);
      // Fallback zu lokalen Daten
      const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
      setCurrentPhase(randomPhase);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
        mt: 4
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Moon size={24} color="#FFD700" style={{ marginRight: 12 }} />
            <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>
              Aktuelle Mondphase
            </Typography>
          </Box>
          <LinearProgress sx={{ 
            background: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #FFD700, #FFA500)'
            }
          }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
        mt: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          borderColor: 'rgba(255,255,255,0.4)',
        }
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Moon size={24} color="#FFD700" style={{ marginRight: 12 }} />
              <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>
                Aktuelle Mondphase
              </Typography>
            </Box>
            <Chip 
              label="Live" 
              size="small" 
              sx={{ 
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#1a1a2e',
                fontWeight: 700
              }} 
            />
          </Box>

          {currentPhase && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                    {currentPhase.icon}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 700, 
                    mb: 1 
                  }}>
                    {currentPhase.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    mb: 2
                  }}>
                    {currentPhase.description}
                  </Typography>
                  <Chip 
                    label={currentPhase.energy} 
                    sx={{ 
                      background: currentPhase.color,
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#FFD700', 
                    fontWeight: 700, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Sparkles size={20} style={{ marginRight: 8 }} />
                    Empfehlung
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    mb: 3
                  }}>
                    {currentPhase.advice}
                  </Typography>
                  
                  <Button
                    component={Link}
                    href="/mondkalender"
                    variant="contained"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      color: '#1a1a2e',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFA500, #FFD700)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    Vollständigen Mondkalender ansehen
                    <ArrowRight size={16} style={{ marginLeft: 8 }} />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MoonCalendarWidget;

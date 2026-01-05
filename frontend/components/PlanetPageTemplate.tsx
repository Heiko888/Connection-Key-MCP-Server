'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Grid, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Target, 
  Crown,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlanetData } from '../hooks/usePlanetData';
import RotatingPlanetSymbol from './RotatingPlanetSymbol';

interface PlanetPageTemplateProps {
  planetName: string;
  planetColor: string;
  planetSymbol: string;
  fallbackInfo: {
    planet_name: string;
    symbol: string;
    orbital_period: string;
    discovery: string;
    mythology: string;
    color: string;
    description: string;
  };
  backgroundGradient: string;
  animatedPlanet: React.ReactNode;
}

export default function PlanetPageTemplate({
  planetName,
  planetColor,
  planetSymbol,
  planetGradient,
  fallbackInfo,
  backgroundGradient,
  animatedPlanet
}: PlanetPageTemplateProps) {
  const router = useRouter();
  const [expandedGate, setExpandedGate] = useState<number | false>(false);
  
  // Lade Planet-Daten aus der Datenbank
  const { planetInfo, planetGates, planetCenters, loading, error } = usePlanetData(planetName);

  // Verwende Datenbank-Daten oder Fallback
  const currentPlanetInfo = planetInfo || fallbackInfo;

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: backgroundGradient,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h4">Lade {planetName}-Daten...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: backgroundGradient,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h4" color="error">Fehler: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: backgroundGradient,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      {animatedPlanet}

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/planets')}
            sx={{
              color: planetColor,
              borderColor: planetColor,
              '&:hover': {
                borderColor: planetColor,
                backgroundColor: `${planetColor}20`,
                boxShadow: `0 0 20px ${planetColor}50`
              },
              mr: 2
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
          <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
            {/* Großes rotierendes Planetensymbol */}
            <Box sx={{ mb: 3 }}>
              <RotatingPlanetSymbol
                symbol={currentPlanetInfo.symbol}
                color={currentPlanetInfo.color}
                gradient={planetGradient || `linear-gradient(135deg, ${currentPlanetInfo.color} 0%, ${currentPlanetInfo.color}80 50%, ${currentPlanetInfo.color}60 100%)`}
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
                  0 0 10px ${currentPlanetInfo.color},
                  0 0 20px ${currentPlanetInfo.color}80,
                  0 2px 10px rgba(0, 0, 0, 0.9),
                  0 4px 20px rgba(0, 0, 0, 0.7)
                `,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {currentPlanetInfo.planet_name}
            </Typography>
            
            <Typography variant="h5" sx={{ color: currentPlanetInfo.color, fontStyle: 'italic', fontWeight: 600, mb: 2 }}>
              {currentPlanetInfo.mythology}
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2, maxWidth: '700px', mx: 'auto', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {currentPlanetInfo.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Overview Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${planetColor}`,
            boxShadow: `0 8px 32px ${planetColor}30`,
            p: 3,
            mb: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${planetColor}, ${planetColor}80)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <Typography variant="h4" sx={{ color: '#000', fontWeight: 'bold' }}>
                  {currentPlanetInfo.symbol}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  {currentPlanetInfo.planet_name} - Übersicht
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Grundlegende Informationen über {currentPlanetInfo.planet_name}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                    Umlaufzeit
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {currentPlanetInfo.orbital_period}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                    Entdeckung
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {currentPlanetInfo.discovery}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                    Mythologie
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {currentPlanetInfo.mythology}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                    Farbe
                  </Typography>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    backgroundColor: currentPlanetInfo.color,
                    mx: 'auto',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Planet in Gates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${planetColor}`,
            boxShadow: `0 8px 32px ${planetColor}30`,
            p: 3,
            mb: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Target size={24} color={planetColor} />
                <Typography variant="h5" sx={{ ml: 2, fontWeight: 600, color: 'white' }}>
                  {currentPlanetInfo.planet_name} in den Gates
                </Typography>
              </Box>
              <Chip 
                label={`${planetGates.length} Gates`} 
                size="small" 
                sx={{ 
                  backgroundColor: `${planetColor}30`,
                  color: planetColor,
                  fontSize: '10px'
                }} 
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, fontStyle: 'italic' }}>
              Alle {planetGates.length} Gates mit {currentPlanetInfo.planet_name}-Informationen.
            </Typography>
            <List>
              {planetGates.map((gate, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  mb: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color={planetColor} />}
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
                        background: `linear-gradient(45deg, ${planetColor}, ${planetColor}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                          {gate.gate_number}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {gate.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {gate.essence}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={gate.consciousness} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${planetColor}30`,
                        color: planetColor,
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                        {gate.description}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontWeight: 500 }}>
                        {gate.deep_meaning}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#FF6B6B', mb: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {JSON.parse(gate.shadow_aspects || '[]').map((aspect: string, idx: number) => (
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

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {JSON.parse(gate.gifts || '[]').map((gift: string, idx: number) => (
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
                        background: `${planetColor}20`, 
                        borderRadius: 2, 
                        border: `1px solid ${planetColor}50`
                      }}>
                        <Typography variant="body2" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                          Affirmation:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {gate.affirmation}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Planet in Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${planetColor}`,
            boxShadow: `0 8px 32px ${planetColor}30`,
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Crown size={24} color={planetColor} />
              <Typography variant="h5" sx={{ ml: 2, fontWeight: 600, color: 'white' }}>
                {currentPlanetInfo.planet_name} in den Centers
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, fontStyle: 'italic' }}>
              {currentPlanetInfo.planet_name} in den {planetCenters.length} Centers.
            </Typography>
            <List>
              {planetCenters.map((center, index) => (
                <Accordion key={index} sx={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  mb: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 8px 0' }
                }}>
                  <AccordionSummary
                    expandIcon={<ChevronDown color={planetColor} />}
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
                        background: `linear-gradient(45deg, ${planetColor}, ${planetColor}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Crown size={20} color="#000" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {center.center_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {center.essence}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={center.consciousness} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${planetColor}30`,
                        color: planetColor,
                        fontSize: '10px'
                      }} 
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 6 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                        {center.description}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontWeight: 500 }}>
                        {center.deep_meaning}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#FF6B6B', mb: 1, fontWeight: 600 }}>
                          Schatten-Aspekte:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {JSON.parse(center.shadow_aspects || '[]').map((aspect: string, idx: number) => (
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

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1, fontWeight: 600 }}>
                          Geschenke:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {JSON.parse(center.gifts || '[]').map((gift: string, idx: number) => (
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
                        background: `${planetColor}20`, 
                        borderRadius: 2, 
                        border: `1px solid ${planetColor}50`
                      }}>
                        <Typography variant="body2" sx={{ color: planetColor, fontWeight: 600, mb: 1 }}>
                          Affirmation:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                          {center.affirmation}
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

import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Grid, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Zap, Heart } from 'lucide-react';
import { MoonPhase } from '../moonApi';

interface CurrentPhaseTabProps {
  currentPhase: MoonPhase | null;
  onAddTracking: () => void;
}

export default function CurrentPhaseTab({ currentPhase, onAddTracking }: CurrentPhaseTabProps) {
  if (!currentPhase) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: 'rgba(254,243,199,0.8)' }}>
          Lade aktuelle Mondphase...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      
      
      
    >
      <Grid container spacing={5}>
        {/* Aktuelle Phase Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(254,243,199,0.1) 0%, rgba(254,243,199,0.05) 100%)',
            borderRadius: 4,
            border: '1px solid rgba(254,243,199,0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h1" sx={{ mb: 3, fontSize: '4rem' }}>
                {currentPhase.icon}
              </Typography>
              
              <Typography variant="h4" sx={{
                color: '#fef3c7',
                fontWeight: 700,
                mb: 2
              }}>
                {currentPhase.name}
              </Typography>
              
              <Typography sx={{
                color: 'rgba(254,243,199,0.8)',
                fontSize: '1.1rem',
                mb: 3,
                lineHeight: 1.6
              }}>
                {currentPhase.description}
              </Typography>
              
              <Chip
                label={currentPhase.energy}
                size="medium"
                sx={{
                  background: 'rgba(254,243,199,0.2)',
                  color: '#fef3c7',
                  border: '1px solid rgba(254,243,199,0.3)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 3
                }}
              />
              
              <Typography sx={{
                color: 'rgba(254,243,199,0.9)',
                fontSize: '1rem',
                lineHeight: 1.6,
                mb: 4
              }}>
                {currentPhase.advice}
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={onAddTracking}
                sx={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  color: '#1f2937',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #fde68a 0%, #fef3c7 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(254,243,199,0.3)'
                  }
                }}
              >
                Heute tracken
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Erweiterte Informationen */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* Human Design Connection */}
            <Grid item xs={12}>
              <Card sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(254,243,199,0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Heart size={20} color="#fef3c7" />
                    <Typography variant="h6" sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      ml: 1
                    }}>
                      Human Design Verbindung
                    </Typography>
                  </Box>
                  <Typography sx={{
                    color: 'rgba(254,243,199,0.8)',
                    lineHeight: 1.6
                  }}>
                    {currentPhase.humanDesignConnection}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Schnelle Rituale */}
            <Grid item xs={12}>
              <Card sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(254,243,199,0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Zap size={20} color="#fef3c7" />
                    <Typography variant="h6" sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      ml: 1
                    }}>
                      Schnelle Rituale
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{
                    color: 'rgba(254,243,199,0.8)',
                    pl: 2,
                    m: 0
                  }}>
                    {currentPhase.moonRituals.slice(0, 3).map((ritual, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {ritual}
                      </li>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Reflexionsübungen */}
            <Grid item xs={12}>
              <Card sx={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(254,243,199,0.2)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Calendar size={20} color="#fef3c7" />
                    <Typography variant="h6" sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      ml: 1
                    }}>
                      Reflexionsübungen
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{
                    color: 'rgba(254,243,199,0.8)',
                    pl: 2,
                    m: 0
                  }}>
                    {currentPhase.reflectionExercises.slice(0, 2).map((exercise, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {exercise}
                      </li>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
}

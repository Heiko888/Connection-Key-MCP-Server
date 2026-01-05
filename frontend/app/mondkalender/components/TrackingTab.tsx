import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, LinearProgress, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus, BarChart3, TrendingUp, Activity, Calendar } from 'lucide-react';
import { MoonTracking, TrackingStats, getMoodEmoji, getEnergyEmoji, formatDate } from '../moonApi';

interface TrackingTabProps {
  userTracking: MoonTracking[];
  trackingStats: TrackingStats | null;
  onAddTracking: () => void;
}

export default function TrackingTab({ userTracking, trackingStats, onAddTracking }: TrackingTabProps) {
  return (
    <motion.div
      
      
      
    >
      <Grid container spacing={4}>
        {/* Header mit Add Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#fef3c7', fontWeight: 700 }}>
              Mein Moon-Tracking
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
              Neues Tracking
            </Button>
          </Box>
        </Grid>

        {/* Statistiken */}
        {trackingStats && (
          <Grid item xs={12}>
            <Card sx={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(254,243,199,0.2)',
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BarChart3 size={24} color="#fef3c7" />
                  <Typography variant="h5" sx={{
                    color: '#fef3c7',
                    fontWeight: 700,
                    ml: 2
                  }}>
                    Deine Statistiken
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: '#fef3c7', fontWeight: 700 }}>
                        {trackingStats.total_entries}
                      </Typography>
                      <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                        Einträge
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: '#fef3c7', fontWeight: 700 }}>
                        {trackingStats.average_mood}
                      </Typography>
                      <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                        Durchschnittliche Stimmung
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: '#fef3c7', fontWeight: 700 }}>
                        {trackingStats.average_energy}
                      </Typography>
                      <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                        Durchschnittliche Energie
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: '#fef3c7', fontWeight: 700 }}>
                        {trackingStats.most_common_phase || 'N/A'}
                      </Typography>
                      <Typography sx={{ color: 'rgba(254,243,199,0.8)' }}>
                        Häufigste Phase
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Tracking Historie */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(254,243,199,0.2)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Calendar size={24} color="#fef3c7" />
                <Typography variant="h5" sx={{
                  color: '#fef3c7',
                  fontWeight: 700,
                  ml: 2
                }}>
                  Tracking Historie
                </Typography>
              </Box>
              
              {userTracking.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 2 }}>
                    Noch keine Tracking-Einträge vorhanden
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={onAddTracking}
                    sx={{
                      borderColor: 'rgba(254,243,199,0.3)',
                      color: '#fef3c7',
                      '&:hover': {
                        borderColor: '#fef3c7',
                        backgroundColor: 'rgba(254,243,199,0.1)'
                      }
                    }}
                  >
                    Ersten Eintrag erstellen
                  </Button>
                </Box>
              ) : (
                <List>
                  {userTracking.slice(0, 10).map((tracking, index) => (
                    <React.Fragment key={tracking.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 600 }}>
                                {formatDate(tracking.date)}
                              </Typography>
                              <Chip
                                label={tracking.moon_phase}
                                size="small"
                                sx={{
                                  ml: 2,
                                  background: 'rgba(254,243,199,0.2)',
                                  color: '#fef3c7',
                                  border: '1px solid rgba(254,243,199,0.3)'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box component="div">
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box component="span" sx={{ color: 'rgba(254,243,199,0.8)', mr: 2 }}>
                                  Stimmung: {getMoodEmoji(tracking.mood)} {tracking.mood}/10
                                </Box>
                                <Box component="span" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                  Energie: {getEnergyEmoji(tracking.energy)} {tracking.energy}/10
                                </Box>
                              </Box>
                              {tracking.notes && (
                                <Box component="span" sx={{ color: 'rgba(254,243,199,0.7)', fontSize: '0.9rem', display: 'block' }}>
                                  {tracking.notes}
                                </Box>
                              )}
                              {tracking.rituals_completed.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Box component="span" sx={{ color: 'rgba(254,243,199,0.7)', fontSize: '0.8rem', mb: 0.5, display: 'block' }}>
                                    Rituale:
                                  </Box>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {tracking.rituals_completed.map((ritual, ritualIndex) => (
                                      <Chip
                                        key={ritualIndex}
                                        label={ritual}
                                        size="small"
                                        sx={{
                                          background: 'rgba(254,243,199,0.1)',
                                          color: 'rgba(254,243,199,0.8)',
                                          border: '1px solid rgba(254,243,199,0.2)',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < userTracking.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
}

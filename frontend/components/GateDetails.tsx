import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { BookOpen, Star, Zap, Heart, Brain, Eye, Search, ChevronDown } from 'lucide-react';

interface GateDetailsProps {
  activeGates: string[];
  onGateClick?: (gate: string) => void;
}

// Alle 64 Tore mit detaillierten Beschreibungen
const allGates = {
  '1': {
    name: 'Self-Expression',
    description: 'Das Tor der Kreativität und des Selbstausdrucks',
    keywords: ['Kreativität', 'Selbstausdruck', 'Inspiration'],
    bodygraph: 'Kopf-Zentrum',
    lines: {
      1: 'Kreative Inspiration',
      2: 'Natürliche Führung',
      3: 'Künstlerischer Ausdruck',
      4: 'Intellektuelle Führung',
      5: 'Universelle Führung',
      6: 'Rolle des Mentors'
    }
  },
  '2': {
    name: 'Higher Knowing',
    description: 'Das Tor der höheren Weisheit und des Wissens',
    keywords: ['Weisheit', 'Wissen', 'Intuition'],
    bodygraph: 'Kopf-Zentrum',
    lines: {
      1: 'Natürliche Führung',
      2: 'Hermetische Führung',
      3: 'Mentoring',
      4: 'Führung durch Beispiel',
      5: 'Universelle Führung',
      6: 'Rolle des Mentors'
    }
  },
  '3': {
    name: 'Ordering',
    description: 'Das Tor der Strukturierung und Ordnung',
    keywords: ['Struktur', 'Ordnung', 'Organisation'],
    bodygraph: 'Sakral-Zentrum',
    lines: {
      1: 'Innovation',
      2: 'Anpassung',
      3: 'Mutation',
      4: 'Stabilität',
      5: 'Veränderung',
      6: 'Transformation'
    }
  },
  '4': {
    name: 'Formulization',
    description: 'Das Tor der Formulierung und Klarheit',
    keywords: ['Formulierung', 'Klarheit', 'Verständnis'],
    bodygraph: 'Kopf-Zentrum',
    lines: {
      1: 'Logische Formulierung',
      2: 'Intuitive Formulierung',
      3: 'Kreative Formulierung',
      4: 'Strukturierte Formulierung',
      5: 'Universelle Formulierung',
      6: 'Mentor der Formulierung'
    }
  },
  '5': {
    name: 'Fixed Rhythms',
    description: 'Das Tor der festen Rhythmen und Timing',
    keywords: ['Rhythmus', 'Timing', 'Warten'],
    bodygraph: 'Sakral-Zentrum',
    lines: {
      1: 'Natürlicher Rhythmus',
      2: 'Angepasster Rhythmus',
      3: 'Flexibler Rhythmus',
      4: 'Stabiler Rhythmus',
      5: 'Universeller Rhythmus',
      6: 'Mentor des Rhythmus'
    }
  },
  '6': {
    name: 'Friction',
    description: 'Das Tor der Reibung und des Wachstums',
    keywords: ['Reibung', 'Wachstum', 'Entwicklung'],
    bodygraph: 'Sakral-Zentrum',
    lines: {
      1: 'Natürliche Reibung',
      2: 'Konstruktive Reibung',
      3: 'Kreative Reibung',
      4: 'Stabile Reibung',
      5: 'Universelle Reibung',
      6: 'Mentor der Reibung'
    }
  },
  '7': {
    name: 'The Role of the Self',
    description: 'Das Tor der Rolle des Selbst und der Führung',
    keywords: ['Führung', 'Rolle', 'Selbst'],
    bodygraph: 'G-Zentrum',
    lines: {
      1: 'Natürliche Führung',
      2: 'Hermetische Führung',
      3: 'Mentoring',
      4: 'Führung durch Beispiel',
      5: 'Universelle Führung',
      6: 'Rolle des Mentors'
    }
  },
  '8': {
    name: 'Holding Together',
    description: 'Das Tor des Zusammenhalts und der Kontribution',
    keywords: ['Zusammenhalt', 'Kontribution', 'Einheit'],
    bodygraph: 'Kehle-Zentrum',
    lines: {
      1: 'Natürliche Kontribution',
      2: 'Hermetische Kontribution',
      3: 'Mentoring',
      4: 'Kontribution durch Beispiel',
      5: 'Universelle Kontribution',
      6: 'Mentor der Kontribution'
    }
  },
  '9': {
    name: 'The Power of the Small',
    description: 'Das Tor der Kraft des Kleinen und der Fokus',
    keywords: ['Fokus', 'Kraft', 'Kleines'],
    bodygraph: 'Sakral-Zentrum',
    lines: {
      1: 'Natürlicher Fokus',
      2: 'Hermetischer Fokus',
      3: 'Mentoring',
      4: 'Fokus durch Beispiel',
      5: 'Universeller Fokus',
      6: 'Mentor des Fokus'
    }
  },
  '10': {
    name: 'Treading',
    description: 'Das Tor des Tretens und der Selbstliebe',
    keywords: ['Selbstliebe', 'Treten', 'Verhalten'],
    bodygraph: 'G-Zentrum',
    lines: {
      1: 'Natürliches Verhalten',
      2: 'Hermetisches Verhalten',
      3: 'Mentoring',
      4: 'Verhalten durch Beispiel',
      5: 'Universelles Verhalten',
      6: 'Mentor des Verhaltens'
    }
  }
  // ... weitere Tore würden hier hinzugefügt
};

export default function GateDetails({ activeGates, onGateClick }: GateDetailsProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGates = Object.entries(allGates).filter(([gateNumber, gate]) => {
    const matchesSearch = gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gate.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const activeGatesData = activeGates.map(gateNumber => ({
    number: gateNumber,
    ...allGates[gateNumber as keyof typeof allGates]
  })).filter(gate => gate.name); // Nur Tore mit Daten

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 3
      }}>
        <Typography variant="h6" sx={{
          color: '#FFD700',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <BookOpen size={20} />
          Detaillierte Gate-Beschreibungen
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': { color: '#FFD700' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#FFD700' }
          }}
        >
          <Tab label={`Aktive Tore (${activeGatesData.length})`} />
          <Tab label="Alle 64 Tore" />
        </Tabs>

        {selectedTab === 0 && (
          <Box>
            {activeGatesData.length > 0 ? (
              <Grid container spacing={2}>
                {activeGatesData.map((gate) => (
                  <Grid item xs={12} md={6} key={gate.number}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => onGateClick?.(gate.number)}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                            borderColor: '#FFD700'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#FFD700', mr: 2 }}>
                              Tor {gate.number}
                            </Typography>
                            <Chip
                              label="Aktiv"
                              size="small"
                              sx={{
                                bgcolor: '#10b981',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                          
                          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                            {gate.name}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                            {gate.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {gate.keywords.map((keyword) => (
                              <Chip
                                key={keyword}
                                label={keyword}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.8)',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                          
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {gate.bodygraph}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Keine aktiven Tore gefunden
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {selectedTab === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Durchsuchen Sie alle 64 Tore des Human Design Systems
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {filteredGates.map(([gateNumber, gate]) => (
                <Grid item xs={12} sm={6} md={4} key={gateNumber}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => onGateClick?.(gateNumber)}
                      sx={{
                        bgcolor: activeGates.includes(gateNumber) 
                          ? 'rgba(255,215,0,0.1)' 
                          : 'rgba(255,255,255,0.05)',
                        border: activeGates.includes(gateNumber)
                          ? '2px solid #FFD700'
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderColor: '#FFD700'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#FFD700', mr: 2 }}>
                            {gateNumber}
                          </Typography>
                          {activeGates.includes(gateNumber) && (
                            <Star size={16} color="#FFD700" />
                          )}
                        </Box>
                        
                        <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                          {gate.name}
                        </Typography>
                        
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {gate.bodygraph}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

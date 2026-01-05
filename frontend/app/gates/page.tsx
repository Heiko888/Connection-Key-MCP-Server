"use client";
import React, { useState } from 'react';
import { Typography, Card, CardContent, Box, Button, Paper, Chip, Tabs, Tab, Grid, TextField, InputAdornment } from '@mui/material';
import { Search, Hexagon, Zap, Eye, Crown, Shield, Target, Star, Circle, ChevronDown, ArrowRight } from 'lucide-react';
import AnimatedStars from '@/components/AnimatedStars';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

interface Gate {
  id: number;
  name: string;
  germanName: string;
  description: string;
  center: string;
  keywords: string[];
  lines: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
    line6: string;
  };
  hexagram: string;
  iChing: string;
  color: string;
  icon: React.ReactNode;
}

export default function GatesPage() {
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const gates: Gate[] = [
    {
      id: 1,
      name: 'The Creative',
      germanName: 'Der Schöpferische',
      description: 'Das Tor der Kreativität und des schöpferischen Ausdrucks. Hier manifestiert sich die göttliche Inspiration.',
      center: 'G Center',
      keywords: ['Kreativität', 'Inspiration', 'Schöpfung', 'Ausdruck', 'Göttlichkeit'],
      lines: {
        line1: 'Die kreative Kraft manifestiert sich durch natürliche Führung.',
        line2: 'Die kreative Kraft wird durch andere erkannt und anerkannt.',
        line3: 'Die kreative Kraft entwickelt sich durch Erfahrung und Reife.',
        line4: 'Die kreative Kraft wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Die kreative Kraft wird universell anerkannt und gefeiert.',
        line6: 'Die kreative Kraft wird zum Vorbild für andere.'
      },
      hexagram: '☰',
      iChing: 'Das Schöpferische',
      color: '#10b981',
      icon: <Hexagon size={24} />
    },
    {
      id: 2,
      name: 'The Receptive',
      germanName: 'Das Empfangende',
      description: 'Das Tor der Empfänglichkeit und des Verstehens. Hier wird die göttliche Weisheit empfangen.',
      center: 'G Center',
      keywords: ['Empfänglichkeit', 'Verstehen', 'Weisheit', 'Intuition', 'Führung'],
      lines: {
        line1: 'Die Empfänglichkeit manifestiert sich durch natürliche Führung.',
        line2: 'Die Empfänglichkeit wird durch andere erkannt und anerkannt.',
        line3: 'Die Empfänglichkeit entwickelt sich durch Erfahrung und Reife.',
        line4: 'Die Empfänglichkeit wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Die Empfänglichkeit wird universell anerkannt und gefeiert.',
        line6: 'Die Empfänglichkeit wird zum Vorbild für andere.'
      },
      hexagram: '☷',
      iChing: 'Das Empfangende',
      color: '#3b82f6',
      icon: <Circle size={24} />
    },
    {
      id: 3,
      name: 'Ordering',
      germanName: 'Die Ordnung',
      description: 'Das Tor der Ordnung und des Chaos. Hier wird die Struktur durch Erfahrung entwickelt.',
      center: 'Sacral Center',
      keywords: ['Ordnung', 'Chaos', 'Struktur', 'Entwicklung', 'Erfahrung'],
      lines: {
        line1: 'Die Ordnung manifestiert sich durch natürliche Führung.',
        line2: 'Die Ordnung wird durch andere erkannt und anerkannt.',
        line3: 'Die Ordnung entwickelt sich durch Erfahrung und Reife.',
        line4: 'Die Ordnung wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Die Ordnung wird universell anerkannt und gefeiert.',
        line6: 'Die Ordnung wird zum Vorbild für andere.'
      },
      hexagram: '☳',
      iChing: 'Die Erregende',
      color: '#f59e0b',
      icon: <Zap size={24} />
    },
    {
      id: 4,
      name: 'Youthful Folly',
      germanName: 'Die jugendliche Torheit',
      description: 'Das Tor der jugendlichen Torheit und des Lernens. Hier wird Weisheit durch Versuch und Irrtum erworben.',
      center: 'Ajna Center',
      keywords: ['Jugend', 'Torheit', 'Lernen', 'Weisheit', 'Entwicklung'],
      lines: {
        line1: 'Die jugendliche Torheit manifestiert sich durch natürliche Führung.',
        line2: 'Die jugendliche Torheit wird durch andere erkannt und anerkannt.',
        line3: 'Die jugendliche Torheit entwickelt sich durch Erfahrung und Reife.',
        line4: 'Die jugendliche Torheit wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Die jugendliche Torheit wird universell anerkannt und gefeiert.',
        line6: 'Die jugendliche Torheit wird zum Vorbild für andere.'
      },
      hexagram: '☶',
      iChing: 'Das Stillehalten',
      color: '#8b5cf6',
      icon: <Eye size={24} />
    },
    {
      id: 5,
      name: 'Waiting',
      germanName: 'Das Warten',
      description: 'Das Tor des Wartens und der Geduld. Hier wird die richtige Zeit für Handlung erkannt.',
      center: 'Sacral Center',
      keywords: ['Warten', 'Geduld', 'Timing', 'Handlung', 'Intuition'],
      lines: {
        line1: 'Das Warten manifestiert sich durch natürliche Führung.',
        line2: 'Das Warten wird durch andere erkannt und anerkannt.',
        line3: 'Das Warten entwickelt sich durch Erfahrung und Reife.',
        line4: 'Das Warten wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Das Warten wird universell anerkannt und gefeiert.',
        line6: 'Das Warten wird zum Vorbild für andere.'
      },
      hexagram: '☵',
      iChing: 'Das Abgründige',
      color: '#06b6d4',
      icon: <Target size={24} />
    },
    {
      id: 6,
      name: 'Conflict',
      germanName: 'Der Konflikt',
      description: 'Das Tor des Konflikts und der Auseinandersetzung. Hier wird durch Herausforderungen Wachstum gefördert.',
      center: 'Sacral Center',
      keywords: ['Konflikt', 'Auseinandersetzung', 'Wachstum', 'Herausforderung', 'Stärke'],
      lines: {
        line1: 'Der Konflikt manifestiert sich durch natürliche Führung.',
        line2: 'Der Konflikt wird durch andere erkannt und anerkannt.',
        line3: 'Der Konflikt entwickelt sich durch Erfahrung und Reife.',
        line4: 'Der Konflikt wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Der Konflikt wird universell anerkannt und gefeiert.',
        line6: 'Der Konflikt wird zum Vorbild für andere.'
      },
      hexagram: '☰',
      iChing: 'Das Schöpferische',
      color: '#ef4444',
      icon: <Shield size={24} />
    },
    {
      id: 7,
      name: 'The Army',
      germanName: 'Die Armee',
      description: 'Das Tor der Armee und der Führung. Hier wird durch Disziplin und Organisation Erfolg erreicht.',
      center: 'G Center',
      keywords: ['Armee', 'Führung', 'Disziplin', 'Organisation', 'Erfolg'],
      lines: {
        line1: 'Die Armee manifestiert sich durch natürliche Führung.',
        line2: 'Die Armee wird durch andere erkannt und anerkannt.',
        line3: 'Die Armee entwickelt sich durch Erfahrung und Reife.',
        line4: 'Die Armee wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Die Armee wird universell anerkannt und gefeiert.',
        line6: 'Die Armee wird zum Vorbild für andere.'
      },
      hexagram: '☵',
      iChing: 'Das Abgründige',
      color: '#84cc16',
      icon: <Crown size={24} />
    },
    {
      id: 8,
      name: 'Holding Together',
      germanName: 'Das Zusammenhalten',
      description: 'Das Tor des Zusammenhalts und der Einheit. Hier wird durch Kooperation und Solidarität Stärke gefunden.',
      center: 'Throat Center',
      keywords: ['Zusammenhalten', 'Einheit', 'Kooperation', 'Solidarität', 'Stärke'],
      lines: {
        line1: 'Das Zusammenhalten manifestiert sich durch natürliche Führung.',
        line2: 'Das Zusammenhalten wird durch andere erkannt und anerkannt.',
        line3: 'Das Zusammenhalten entwickelt sich durch Erfahrung und Reife.',
        line4: 'Das Zusammenhalten wird durch Netzwerke und Beziehungen gestärkt.',
        line5: 'Das Zusammenhalten wird universell anerkannt und gefeiert.',
        line6: 'Das Zusammenhalten wird zum Vorbild für andere.'
      },
      hexagram: '☰',
      iChing: 'Das Schöpferische',
      color: '#f97316',
      icon: <Star size={24} />
    }
  ];

  // Füge weitere Gates hinzu (vereinfacht für Demo)
  for (let i = 9; i <= 64; i++) {
    gates.push({
      id: i,
      name: `Gate ${i}`,
      germanName: `Tor ${i}`,
      description: `Das Tor ${i} repräsentiert eine spezifische energetische Qualität im Human Design System.`,
      center: ['Head Center', 'Ajna Center', 'Throat Center', 'G Center', 'Heart Center', 'Sacral Center', 'Solar Plexus Center', 'Spleen Center', 'Root Center'][i % 9],
      keywords: ['Energie', 'Qualität', 'Manifestation', 'Ausdruck', 'Kraft'],
      lines: {
        line1: `Linie 1 von Tor ${i}: Grundlegende Qualität.`,
        line2: `Linie 2 von Tor ${i}: Projektion und Anerkennung.`,
        line3: `Linie 3 von Tor ${i}: Experiment und Erfahrung.`,
        line4: `Linie 4 von Tor ${i}: Netzwerk und Beziehungen.`,
        line5: `Linie 5 von Tor ${i}: Universelle Anerkennung.`,
        line6: `Linie 6 von Tor ${i}: Vorbild und Weisheit.`
      },
      hexagram: ['☰', '☷', '☳', '☶', '☵', '☴', '☲', '☱'][i % 8],
      iChing: `I-Ching ${i}`,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#ec4899', '#14b8a6'][i % 10],
      icon: <Hexagon size={24} />
    });
  }

  const filteredGates = gates.filter(gate =>
    gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gate.germanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gate.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGateSelect = (gate: Gate) => {
    setSelectedGate(gate);
    setActiveTab(0);
  };

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
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedStars />
      
      <PageLayout activePage="bodygraph" showLogo={true} maxWidth="lg">
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Link href="/grundlagen-hd" passHref>
            <Button
              variant="outlined"
              startIcon={<ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />}
              sx={{
                borderColor: '#FFD700',
                color: '#FFD700',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  transform: 'translateX(-4px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zu den HD-Grundlagen
            </Button>
          </Link>
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Hexagon size={32} color="#d8b35c" />
            <Typography variant="h2" sx={{
              color: '#f5f2ea',
              fontWeight: 800,
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              Die 64 Gates
            </Typography>
            <Hexagon size={32} color="#d8b35c" />
          </Box>
          <Typography variant="h6" sx={{
            color: 'rgba(245,242,234,0.8)',
            fontSize: { xs: '1.1rem', md: '1.3rem' }
          }}>
            Entdecke alle 64 Human Design Gates und ihre energetischen Qualitäten
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Suche nach Gates, Namen oder Schlüsselwörtern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(245,242,234,0.05)',
                border: '1px solid rgba(216,179,92,0.3)',
                borderRadius: 3,
                color: '#f5f2ea',
                '&:hover': {
                  borderColor: 'rgba(216,179,92,0.5)'
                },
                '&.Mui-focused': {
                  borderColor: '#d8b35c'
                }
              },
              '& .MuiInputBase-input': {
                color: '#f5f2ea',
                '&::placeholder': {
                  color: 'rgba(245,242,234,0.5)',
                  opacity: 1
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="#d8b35c" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Gates Grid */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filteredGates.map((gate) => (
                <Card
                  key={gate.id}
                  onClick={() => handleGateSelect(gate)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
                    borderRadius: 3,
                    border: selectedGate?.id === gate.id ? '2px solid #d8b35c' : '1px solid rgba(216,179,92,0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'rgba(216,179,92,0.4)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(216,179,92,0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${gate.color}, ${gate.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {gate.icon}
                    </Box>
                    
                    <Typography variant="h4" sx={{
                      color: gate.color,
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {gate.id}
                    </Typography>
                    
                    <Typography variant="h6" sx={{
                      color: '#f5f2ea',
                      fontWeight: 600,
                      mb: 1
                    }}>
                      {gate.germanName}
                    </Typography>
                    
                    <Typography variant="body2" sx={{
                      color: 'rgba(245,242,234,0.7)',
                      fontWeight: 600,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {gate.name}
                    </Typography>
                    
                    <Typography sx={{
                      color: 'rgba(245,242,234,0.8)',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      mb: 2
                    }}>
                      {gate.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {gate.keywords.slice(0, 2).map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          sx={{
                            background: 'rgba(245,242,234,0.1)',
                            color: 'rgba(245,242,234,0.7)',
                            border: '1px solid rgba(216,179,92,0.2)',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Gate Details */}
          <Grid item xs={12} md={4}>
            {selectedGate ? (
              <Card sx={{
                background: 'linear-gradient(135deg, rgba(11,13,18,0.95) 0%, rgba(26,31,43,0.98) 100%)',
                borderRadius: 4,
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                border: '1px solid rgba(216,179,92,0.2)',
                backdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 24
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${selectedGate.color}, ${selectedGate.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {selectedGate.icon}
                    </Box>
                    
                    <Typography variant="h2" sx={{
                      color: selectedGate.color,
                      fontWeight: 800,
                      mb: 1
                    }}>
                      {selectedGate.id}
                    </Typography>
                    
                    <Typography variant="h4" sx={{
                      color: '#f5f2ea',
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {selectedGate.germanName}
                    </Typography>
                    
                    <Typography variant="body1" sx={{
                      color: 'rgba(245,242,234,0.7)',
                      fontWeight: 600,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {selectedGate.name}
                    </Typography>
                  </Box>

                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                      '& .MuiTab-root': {
                        color: 'rgba(245,242,234,0.7)',
                        '&.Mui-selected': {
                          color: '#d8b35c'
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#d8b35c'
                      }
                    }}
                  >
                    <Tab label="Übersicht" />
                    <Tab label="Linien" />
                    <Tab label="I-Ching" />
                  </Tabs>

                  <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && (
                      <Box>
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.9)',
                          lineHeight: 1.6,
                          mb: 3
                        }}>
                          {selectedGate.description}
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Zentrum
                        </Typography>
                        <Chip
                          label={selectedGate.center}
                          sx={{
                            background: 'rgba(16,185,129,0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.3)',
                            mb: 3
                          }}
                        />
                        
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Schlüsselwörter
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedGate.keywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              sx={{
                                background: 'rgba(245,242,234,0.1)',
                                color: 'rgba(245,242,234,0.8)',
                                border: '1px solid rgba(216,179,92,0.2)',
                                m: 0.5
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {activeTab === 1 && (
                      <Box>
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Die 6 Linien
                        </Typography>
                        {Object.entries(selectedGate.lines).map(([lineKey, lineText], index) => (
                          <Box key={lineKey} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ color: selectedGate.color, fontWeight: 600, mb: 1 }}>
                              Linie {index + 1}
                            </Typography>
                            <Typography sx={{
                              color: 'rgba(245,242,234,0.8)',
                              lineHeight: 1.5,
                              fontSize: '0.9rem'
                            }}>
                              {lineText}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          I-Ching Verbindung
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h1" sx={{ color: selectedGate.color, mb: 2 }}>
                            {selectedGate.hexagram}
                          </Typography>
                          <Typography variant="h5" sx={{ color: '#f5f2ea', fontWeight: 600 }}>
                            {selectedGate.iChing}
                          </Typography>
                        </Box>
                        
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.8)',
                          lineHeight: 1.6
                        }}>
                          Das I-Ching Hexagramm {selectedGate.iChing} ist mit diesem Tor verbunden und repräsentiert die grundlegende energetische Qualität, die hier zum Ausdruck kommt.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Paper sx={{
                background: 'linear-gradient(135deg, rgba(11,13,18,0.8) 0%, rgba(26,31,43,0.9) 100%)',
                border: '1px solid rgba(216,179,92,0.2)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Hexagon size={48} color="rgba(216,179,92,0.5)" style={{ marginBottom: 16 }} />
                <Typography sx={{ color: 'rgba(245,242,234,0.7)', fontSize: '1.1rem' }}>
                  Wähle ein Tor aus, um mehr zu erfahren
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </PageLayout>
    </Box>
  );
}

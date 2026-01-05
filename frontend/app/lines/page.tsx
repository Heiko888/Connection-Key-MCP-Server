"use client";
import React, { useState } from 'react';
import { Typography, Card, CardContent, Box, Button, Paper, Chip, Tabs, Tab, Grid, TextField, InputAdornment } from '@mui/material';
import { Search, Grid as GridIcon, Zap, Eye, Crown, Shield, Target, Star, Circle, ChevronDown, ArrowRight } from 'lucide-react';
import AnimatedStars from '@/components/AnimatedStars';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

interface Line {
  id: number;
  number: number;
  name: string;
  description: string;
  theme: string;
  keywords: string[];
  color: string;
  icon: React.ReactNode;
}

export default function LinesPage() {
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const lines: Line[] = [
    {
      id: 1,
      number: 1,
      name: 'Die Forscherin',
      description: 'Die erste Linie ist die Linie der Forschung und des Fundamentes. Sie sucht nach Sicherheit durch Wissen und Verständnis.',
      theme: 'Forschung, Fundament, Sicherheit',
      keywords: ['Forschung', 'Fundament', 'Sicherheit', 'Wissen', 'Verständnis'],
      color: '#10b981',
      icon: <Search size={24} />
    },
    {
      id: 2,
      number: 2,
      name: 'Die Hermitin',
      description: 'Die zweite Linie ist die Linie der natürlichen Begabung. Sie hat Talente, die von anderen erkannt werden müssen.',
      theme: 'Begabung, Talent, Projektion',
      keywords: ['Begabung', 'Talent', 'Projektion', 'Natürlichkeit', 'Erkennung'],
      color: '#3b82f6',
      icon: <Star size={24} />
    },
    {
      id: 3,
      number: 3,
      name: 'Die Märtyrerin',
      description: 'Die dritte Linie ist die Linie der Erfahrung. Sie lernt durch Versuch und Irrtum und entwickelt sich durch Experimentieren.',
      theme: 'Erfahrung, Experiment, Entwicklung',
      keywords: ['Erfahrung', 'Experiment', 'Entwicklung', 'Versuch', 'Irrtum'],
      color: '#f59e0b',
      icon: <Zap size={24} />
    },
    {
      id: 4,
      number: 4,
      name: 'Die Opportunistin',
      description: 'Die vierte Linie ist die Linie der Freundschaft und des Netzwerks. Sie entwickelt sich durch Beziehungen und Verbindungen.',
      theme: 'Freundschaft, Netzwerk, Beziehungen',
      keywords: ['Freundschaft', 'Netzwerk', 'Beziehungen', 'Verbindungen', 'Opportunität'],
      color: '#ef4444',
      icon: <Circle size={24} />
    },
    {
      id: 5,
      number: 5,
      name: 'Die Häretikerin',
      description: 'Die fünfte Linie ist die Linie der universellen Lösung. Sie projiziert Lösungen und wird von anderen als Retter gesehen.',
      theme: 'Lösung, Projektion, Universalität',
      keywords: ['Lösung', 'Projektion', 'Universalität', 'Retter', 'Häresie'],
      color: '#8b5cf6',
      icon: <Crown size={24} />
    },
    {
      id: 6,
      number: 6,
      name: 'Die Rolle des Vorbilds',
      description: 'Die sechste Linie ist die Linie der Transzendenz und des Vorbilds. Sie steht über der Situation und wird zum Beispiel für andere.',
      theme: 'Transzendenz, Vorbild, Beispiel',
      keywords: ['Transzendenz', 'Vorbild', 'Beispiel', 'Überblick', 'Reife'],
      color: '#06b6d4',
      icon: <Target size={24} />
    }
  ];

  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    line.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageLayout activePage="bodygraph" maxWidth="xl">
      <AnimatedStars />
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <GridIcon size={48} color="#F29F05" />
            <Typography variant="h1" sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Die 6 Linien
            </Typography>
            <GridIcon size={48} color="#F29F05" />
          </Box>
          <Typography variant="h5" sx={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            maxWidth: 800,
            mx: 'auto',
            lineHeight: 1.7,
            mb: 4,
            fontWeight: 300
          }}>
            Jedes Tor im Human Design hat 6 Linien, die verschiedene Aspekte und Entwicklungsstufen darstellen
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Linien durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#F29F05" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(242, 159, 5, 0.25)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.4)',
                },
                '&.Mui-focused': {
                  borderColor: '#F29F05',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
            }}
          />
        </Box>

        {/* Lines Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredLines.map((line) => (
            <Grid item xs={12} sm={6} md={4} key={line.id}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.25)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${line.color}40`,
                    borderColor: line.color,
                    background: 'rgba(255, 255, 255, 0.12)'
                  }
                }}
                onClick={() => setSelectedLine(line)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${line.color}40, ${line.color}20)`,
                      border: `2px solid ${line.color}60`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: line.color,
                    }}>
                      {line.icon}
                    </Box>
                    <Box>
                      <Chip
                        label={`Linie ${line.number}`}
                        size="small"
                        sx={{
                          backgroundColor: `${line.color}20`,
                          color: line.color,
                          border: `1px solid ${line.color}40`,
                          fontWeight: 700,
                          mb: 0.5
                        }}
                      />
                      <Typography variant="h6" sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                      }}>
                        {line.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 2
                  }}>
                    {line.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {line.keywords.slice(0, 3).map((keyword, idx) => (
                      <Chip
                        key={idx}
                        label={keyword}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(242, 159, 5, 0.1)',
                          color: '#F29F05',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Selected Line Detail */}
        {selectedLine && (
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: `1px solid ${selectedLine.color}40`,
            p: 4,
            mb: 4
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${selectedLine.color}40, ${selectedLine.color}20)`,
                  border: `2px solid ${selectedLine.color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedLine.color,
                }}>
                  {selectedLine.icon}
                </Box>
                <Box>
                  <Chip
                    label={`Linie ${selectedLine.number}`}
                    size="medium"
                    sx={{
                      backgroundColor: `${selectedLine.color}20`,
                      color: selectedLine.color,
                      border: `1px solid ${selectedLine.color}40`,
                      fontWeight: 700,
                      mb: 1
                    }}
                  />
                  <Typography variant="h4" sx={{
                    color: 'white',
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {selectedLine.name}
                  </Typography>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1rem'
                  }}>
                    {selectedLine.theme}
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => setSelectedLine(null)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  minWidth: 'auto',
                  '&:hover': {
                    color: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)'
                  }
                }}
              >
                <ChevronDown size={24} />
              </Button>
            </Box>

            <Typography sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              mb: 3
            }}>
              {selectedLine.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{
                color: '#F29F05',
                fontWeight: 700,
                mb: 2
              }}>
                Schlüsselwörter
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedLine.keywords.map((keyword, idx) => (
                  <Chip
                    key={idx}
                    label={keyword}
                    sx={{
                      backgroundColor: `${selectedLine.color}20`,
                      color: selectedLine.color,
                      border: `1px solid ${selectedLine.color}40`,
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {/* Back to Grundlagen */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Link href="/grundlagen-hd" passHref>
            <Button
              variant="outlined"
              startIcon={<ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                '&:hover': {
                  borderColor: '#F29F05',
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zu Human Design Grundlagen
            </Button>
          </Link>
        </Box>
      </Box>
    </PageLayout>
  );
}


"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Tabs,
  Tab,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Moon, 
  Calendar,
  Star,
  Sparkles,
  ArrowRight,
  BookOpen,
  Heart,
  Leaf,
  Activity,
  TrendingUp,
  Clock,
  Target
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

interface MoonStory {
  id: string;
  title: string;
  culture: string;
  content: string;
  moon_phase: string;
  moral: string;
  tags: string[];
}

interface PlantRitual {
  id: string;
  name: string;
  moon_phase: string;
  plants: string[];
  instructions: string[];
  benefits: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`moon-tabpanel-${index}`}
      aria-labelledby={`moon-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MoonCalendarTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<MoonPhase | null>(null);
  const [moonStories, setMoonStories] = useState<MoonStory[]>([]);
  const [plantRituals, setPlantRituals] = useState<PlantRitual[]>([]);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Lade aktuelle Mondphase
      await loadCurrentMoonPhase();
      
      // Lade Mond-Geschichten
      await loadMoonStories();
      
      // Lade Pflanzen-Rituale
      await loadPlantRituals();
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMoonPhase = async () => {
    try {
      const response = await fetch('/api/moon-calendar/current');
      
      if (!response.ok) {
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
        return;
      }
      
      const data = await response.json();
      if (data.current && data.current.phase) {
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
      } else {
        const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
        setCurrentPhase(randomPhase);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mondphase:', err);
      const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
      setCurrentPhase(randomPhase);
    }
  };

  const loadMoonStories = async () => {
    try {
      const response = await fetch('/api/moon-calendar/stories');
      if (response.ok) {
        const data = await response.json();
        setMoonStories(data.stories || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mond-Geschichten:', error);
      // Fallback zu Mock-Daten
      setMoonStories([
        {
          id: '1',
          title: 'Die Mondgöttin Selene',
          culture: 'Griechisch',
          content: 'Selene, die griechische Mondgöttin, fährt jeden Abend mit ihrem silbernen Wagen über den Himmel. Sie verliebte sich in den schönen Hirten Endymion und bat Zeus, ihm ewigen Schlaf zu gewähren, damit er für immer jung und schön bliebe.',
          moon_phase: 'Vollmond',
          moral: 'Die Kraft der Liebe und des ewigen Begehrens',
          tags: ['Liebe', 'Ewigkeit', 'Schönheit', 'Träume']
        },
        {
          id: '2',
          title: 'Der Mondhase',
          culture: 'Chinesisch',
          content: 'In der chinesischen Mythologie lebt ein Hase auf dem Mond, der mit einem Mörser und Stößel Unsterblichkeitselixier herstellt. Diese Geschichte erklärt die Schatten auf dem Mond.',
          moon_phase: 'Vollmond',
          moral: 'Die Suche nach Unsterblichkeit und Weisheit',
          tags: ['Unsterblichkeit', 'Weisheit', 'Tiere', 'Alchemie']
        }
      ]);
    }
  };

  const loadPlantRituals = async () => {
    try {
      const response = await fetch('/api/moon-calendar/plant-rituals');
      if (response.ok) {
        const data = await response.json();
        setPlantRituals(data.rituals || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Pflanzen-Rituale:', error);
      // Fallback zu Mock-Daten
      setPlantRituals([
        {
          id: '1',
          name: 'Neumond-Saat',
          moon_phase: 'Neumond',
          plants: ['Wurzelgemüse', 'Kartoffeln', 'Karotten', 'Rüben'],
          instructions: [
            'Bereite den Boden vor und lockere ihn auf',
            'Säe die Samen in der Dunkelheit des Neumonds',
            'Visualisiere das Wachstum der Wurzeln',
            'Gieße mit Mondwasser (über Nacht stehen gelassen)'
          ],
          benefits: ['Stärkere Wurzelbildung', 'Bessere Nährstoffaufnahme', 'Robustere Pflanzen']
        },
        {
          id: '2',
          name: 'Vollmond-Ernte',
          moon_phase: 'Vollmond',
          plants: ['Kräuter', 'Blumen', 'Früchte'],
          instructions: [
            'Ernte bei Vollmond für maximale Potenz',
            'Schneide Kräuter vor Sonnenaufgang',
            'Trockne sie an einem dunklen, luftigen Ort',
            'Lagere sie in dunklen Gläsern'
          ],
          benefits: ['Höhere Potenz', 'Längere Haltbarkeit', 'Intensiverer Geschmack']
        }
      ]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
              Mondkalender-Features
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
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 0 }}>
            <Moon size={24} color="#FFD700" style={{ marginRight: 12 }} />
            <Typography variant="h6" sx={{ 
              color: '#FFD700', 
              fontWeight: 700,
              flexGrow: 1
            }}>
              Mondkalender-Features
            </Typography>
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

          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#FFD700',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FFD700',
                }
              }}
            >
              <Tab 
                icon={<Calendar size={20} />} 
                label="Mondphasen" 
                iconPosition="start"
              />
              <Tab 
                icon={<BookOpen size={20} />} 
                label="Geschichten" 
                iconPosition="start"
              />
              <Tab 
                icon={<Leaf size={20} />} 
                label="Pflanzen-Rituale" 
                iconPosition="start"
              />
              <Tab 
                icon={<Activity size={20} />} 
                label="Aktivitäten" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                    {currentPhase?.icon || '🌕'}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#ffffff', 
                    fontWeight: 700, 
                    mb: 1 
                  }}>
                    {currentPhase?.name || 'Unbekannt'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    mb: 2
                  }}>
                    {currentPhase?.description}
                  </Typography>
                  <Chip 
                    label={currentPhase?.energy} 
                    sx={{ 
                      background: currentPhase?.color || '#8b5cf6',
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
                    {currentPhase?.advice}
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
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box>
              <Typography variant="h6" sx={{ 
                color: '#FFD700', 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <BookOpen size={20} style={{ marginRight: 8 }} />
                Mond-Geschichten aus verschiedenen Kulturen
              </Typography>
              
              <List>
                {moonStories.map((story, index) => (
                  <ListItem key={story.id} sx={{ 
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    mb: 2,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <ListItemIcon>
                      <Star size={24} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {story.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                            {story.content}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={story.culture} size="small" color="primary" />
                            <Chip label={story.moon_phase} size="small" sx={{ background: '#8b5cf6', color: 'white' }} />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box>
              <Typography variant="h6" sx={{ 
                color: '#FFD700', 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Leaf size={20} style={{ marginRight: 8 }} />
                Pflanzen-Rituale nach Mondphasen
              </Typography>
              
              <Grid container spacing={3}>
                {plantRituals.map((ritual) => (
                  <Grid item xs={12} md={6} key={ritual.id}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ 
                          color: '#ffffff', 
                          fontWeight: 600, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Leaf size={20} style={{ marginRight: 8 }} />
                          {ritual.name}
                        </Typography>
                        
                        <Chip 
                          label={ritual.moon_phase} 
                          size="small" 
                          sx={{ 
                            background: '#8b5cf6', 
                            color: 'white', 
                            mb: 2 
                          }} 
                        />
                        
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          mb: 2 
                        }}>
                          <strong>Pflanzen:</strong> {ritual.plants.join(', ')}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          mb: 1 
                        }}>
                          <strong>Anleitung:</strong>
                        </Typography>
                        <List dense>
                          {ritual.instructions.map((instruction, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <ArrowRight size={16} color="#FFD700" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {instruction}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box>
              <Typography variant="h6" sx={{ 
                color: '#FFD700', 
                fontWeight: 700, 
                mb: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Activity size={20} style={{ marginRight: 8 }} />
                Empfohlene Aktivitäten nach Mondphasen
              </Typography>
              
              <Grid container spacing={3}>
                {moonPhases.map((phase) => (
                  <Grid item xs={12} sm={6} md={3} key={phase.name}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center'
                    }}>
                      <CardContent>
                        <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>
                          {phase.icon}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: '#ffffff', 
                          fontWeight: 600, 
                          mb: 1 
                        }}>
                          {phase.name}
                        </Typography>
                        <Chip 
                          label={phase.energy} 
                          size="small" 
                          sx={{ 
                            background: phase.color, 
                            color: 'white', 
                            mb: 2 
                          }} 
                        />
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.8rem'
                        }}>
                          {phase.advice}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MoonCalendarTabs;

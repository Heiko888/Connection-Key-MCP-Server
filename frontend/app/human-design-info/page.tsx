"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Brain, 
  Heart, 
  Users, 
  Star,
  Zap,
  Target,
  Shield,
  Eye,
  Crown,
  Globe,
  Moon,
  Sun,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Info,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Award,
  Activity,
  MessageCircle,
  Calendar,
  MapPin,
  User,
  Settings,
  ChevronDown,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

export default function HumanDesignInfo() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const types = [
    {
      name: "Generator",
      emoji: "⚡",
      percentage: "70%",
      description: "Die Energiegeladenen - Macher der Welt",
      strategy: "Auf innere Autorität warten und auf das reagieren, was zu dir kommt",
      notSelf: "Frustration",
      authority: "Sakrale Autorität",
      characteristics: [
        "Lebendige, nachhaltige Energie",
        "Geboren um zu arbeiten und zu erschaffen",
        "Reagiert auf das Leben",
        "Sakrale Antworten (Ah-Ah, Uh-Uh)",
        "Muss warten, bis etwas zu ihm kommt"
      ],
      color: "#10b981"
    },
    {
      name: "Projector",
      emoji: "🎯",
      percentage: "20%",
      description: "Die Führer und Berater",
      strategy: "Warten auf Einladung",
      notSelf: "Bitterkeit",
      authority: "Verschiedene Autoritäten",
      characteristics: [
        "Führung und Beratung",
        "Tiefes Verständnis für andere",
        "Muss eingeladen werden",
        "Energieeffizient",
        "Weise und strategisch"
      ],
      color: "#3b82f6"
    },
    {
      name: "Manifestor",
      emoji: "🚀",
      percentage: "8%",
      description: "Die Initiatoren und Pioniere",
      strategy: "Informieren, dann handeln",
      notSelf: "Wut",
      authority: "Verschiedene Autoritäten",
      characteristics: [
        "Initiative ergreifen",
        "Veränderungen bewirken",
        "Unabhängig und direkt",
        "Muss andere informieren",
        "Pioniergeist"
      ],
      color: "#f59e0b"
    },
    {
      name: "Reflector",
      emoji: "🌙",
      percentage: "1%",
      description: "Die Spiegel der Gemeinschaft",
      strategy: "Warten auf einen Mondzyklus (28 Tage)",
      notSelf: "Enttäuschung",
      authority: "Mondzyklus",
      characteristics: [
        "Spiegelt die Gemeinschaft",
        "Alle Zentren offen",
        "Sehr empfindlich",
        "Braucht Zeit für Entscheidungen",
        "Einzigartige Perspektive"
      ],
      color: "#8b5cf6"
    },
    {
      name: "Manifesting Generator",
      emoji: "⚡🚀",
      percentage: "1%",
      description: "Die Multi-Tasker",
      strategy: "Auf innere Autorität warten, dann informieren und handeln",
      notSelf: "Frustration und Wut",
      authority: "Sakrale Autorität",
      characteristics: [
        "Kombination aus Generator und Manifestor",
        "Kann mehrere Dinge gleichzeitig",
        "Schnell und effizient",
        "Muss informieren",
        "Flexibel und anpassungsfähig"
      ],
      color: "#ef4444"
    }
  ];

  const centers = [
    {
      name: "Kopf-Zentrum",
      emoji: "🧠",
      description: "Inspiration und mentale Aktivität",
      defined: "Du hast eine feste Art zu denken",
      open: "Du absorbierst die Gedanken anderer",
      color: "#8b5cf6"
    },
    {
      name: "Ajna-Zentrum",
      emoji: "👁️",
      description: "Konzeptualisierung und Analyse",
      defined: "Du hast eine feste Art zu verstehen",
      open: "Du absorbierst die Konzepte anderer",
      color: "#3b82f6"
    },
    {
      name: "Hals-Zentrum",
      emoji: "🗣️",
      description: "Kommunikation und Manifestation",
      defined: "Du hast eine feste Art zu kommunizieren",
      open: "Du absorbierst die Kommunikation anderer",
      color: "#06b6d4"
    },
    {
      name: "G-Zentrum",
      emoji: "💎",
      description: "Identität und Liebe",
      defined: "Du weißt, wer du bist",
      open: "Du suchst nach deiner Identität",
      color: "#f59e0b"
    },
    {
      name: "Herz-Zentrum",
      emoji: "❤️",
      description: "Willenskraft und Ego",
      defined: "Du hast eine feste Willenskraft",
      open: "Du absorbierst die Willenskraft anderer",
      color: "#ef4444"
    },
    {
      name: "Sakral-Zentrum",
      emoji: "⚡",
      description: "Lebenskraft und Sexualität",
      defined: "Du hast eine feste Lebensenergie",
      open: "Du absorbierst die Energie anderer",
      color: "#10b981"
    },
    {
      name: "Solar Plexus",
      emoji: "🌅",
      description: "Emotionen und Bewusstsein",
      defined: "Du hast eine feste Art zu fühlen",
      open: "Du absorbierst die Emotionen anderer",
      color: "#fbbf24"
    },
    {
      name: "Spleen-Zentrum",
      emoji: "🛡️",
      description: "Intuition und Überleben",
      defined: "Du hast eine feste Intuition",
      open: "Du absorbierst die Intuition anderer",
      color: "#84cc16"
    },
    {
      name: "Wurzel-Zentrum",
      emoji: "🌱",
      description: "Stress und Antrieb",
      defined: "Du hast eine feste Art mit Stress umzugehen",
      open: "Du absorbierst den Stress anderer",
      color: "#f97316"
    }
  ];

  const profiles = [
    { number: "1/3", name: "Der Forscher/Märtyrer", description: "Tiefe Forschung und Experimente" },
    { number: "1/4", name: "Der Forscher/Opportunist", description: "Forschung und Netzwerk" },
    { number: "2/4", name: "Der Hermit/Opportunist", description: "Natürliche Begabung und Netzwerk" },
    { number: "2/5", name: "Der Hermit/Ketzer", description: "Natürliche Begabung und Projektion" },
    { number: "3/5", name: "Der Märtyrer/Ketzer", description: "Experimente und Projektion" },
    { number: "3/6", name: "Der Märtyrer/Role Model", description: "Experimente und Vorbild" },
    { number: "4/6", name: "Der Opportunist/Role Model", description: "Netzwerk und Vorbild" },
    { number: "4/1", name: "Der Opportunist/Forscher", description: "Netzwerk und Forschung" },
    { number: "5/1", name: "Der Ketzer/Forscher", description: "Projektion und Forschung" },
    { number: "5/2", name: "Der Ketzer/Hermit", description: "Projektion und natürliche Begabung" },
    { number: "6/2", name: "Der Role Model/Hermit", description: "Vorbild und natürliche Begabung" },
    { number: "6/3", name: "Der Role Model/Märtyrer", description: "Vorbild und Experimente" }
  ];

  const authorities = [
    {
      name: "Sakrale Autorität",
      types: ["Generator", "Manifesting Generator"],
      description: "Deine sakrale Antwort (Ah-Ah, Uh-Uh) ist dein innerer Kompass",
      color: "#10b981"
    },
    {
      name: "Emotionale Autorität",
      types: ["Emotionaler Generator", "Emotionaler Projector", "Emotionaler Manifestor"],
      description: "Warte auf emotionale Klarheit, bevor du entscheidest",
      color: "#fbbf24"
    },
    {
      name: "Splenische Autorität",
      types: ["Splenischer Projector", "Splenischer Manifestor"],
      description: "Deine erste Intuition ist richtig - handle sofort",
      color: "#84cc16"
    },
    {
      name: "Ego-Autorität",
      types: ["Ego-Generator", "Ego-Projector", "Ego-Manifestor"],
      description: "Deine Willenskraft zeigt dir den richtigen Weg",
      color: "#ef4444"
    },
    {
      name: "G-Autorität",
      types: ["G-Projector", "G-Manifestor"],
      description: "Deine Identität und Liebe führen dich",
      color: "#f59e0b"
    },
    {
      name: "Mondzyklus-Autorität",
      types: ["Reflector"],
      description: "Warte auf einen vollen Mondzyklus (28 Tage) für wichtige Entscheidungen",
      color: "#8b5cf6"
    }
  ];

  const benefits = [
    {
      icon: <Brain size={24} />,
      title: "Selbsterkenntnis",
      description: "Verstehe deine wahre Natur und deine einzigartigen Gaben"
    },
    {
      icon: <Heart size={24} />,
      title: "Bessere Beziehungen",
      description: "Verstehe andere und verbessere deine zwischenmenschlichen Beziehungen"
    },
    {
      icon: <Target size={24} />,
      title: "Richtige Entscheidungen",
      description: "Entscheide aus deiner inneren Autorität heraus"
    },
    {
      icon: <Zap size={24} />,
      title: "Lebendige Energie",
      description: "Lebe in deiner natürlichen Energie und vermeide Burnout"
    },
    {
      icon: <Shield size={24} />,
      title: "Konditionierung verstehen",
      description: "Erkenne, wo du nicht du selbst bist"
    },
    {
      icon: <Star size={24} />,
      title: "Lebenszweck",
      description: "Entdecke deine wahre Lebensaufgabe und dein Potenzial"
    }
  ];

  if (!isClient) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(242, 159, 5, 0.15) 0%, rgba(0, 0, 0, 1) 50%), radial-gradient(ellipse at bottom, rgba(140, 29, 4, 0.1) 0%, rgba(0, 0, 0, 1) 70%)',
      backgroundAttachment: 'fixed',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  color: '#FFFFFF',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '0 0 32px rgba(242, 159, 5, 0.30)'
                }}
              >
                Deine energetische Signatur
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  fontWeight: 400,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.8,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}
              >
                Entdecke deine wahre Natur und lebe authentisch
              </Typography>
            </motion.div>
          </Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 800, mx: 'auto', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                Human Design ist ein System der Selbsterkenntnis, das dir hilft, deine einzigartige Natur zu verstehen 
                und authentisch zu leben. Entdecke deinen Typ, deine Autorität und dein wahres Potenzial.
              </Typography>
            </Box>
          </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card sx={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            mb: 4
          }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
                '& .Mui-selected': { color: '#F29F05' },
                '& .MuiTabs-indicator': { backgroundColor: '#F29F05' }
              }}
            >
              <Tab label="Grundlagen" icon={<BookOpen size={20} />} />
              <Tab label="Die 5 Typen" icon={<Users size={20} />} />
              <Tab label="Die 9 Zentren" icon={<Target size={20} />} />
              <Tab label="Profile" icon={<Star size={20} />} />
              <Tab label="Autorität" icon={<Shield size={20} />} />
              <Tab label="Vorteile" icon={<Award size={20} />} />
            </Tabs>
          </Card>
        </motion.div>

        {/* Grundlagen Tab */}
        {activeTab === 0 && (
          <motion.div
            
            
            
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(15, 15, 35, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(242, 159, 5, 0.5)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 600, mb: 3 }}>
                      🧬 Was ist Human Design?
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6 }}>
                      Human Design ist ein System der Selbsterkenntnis, das 1987 von Ra Uru Hu entwickelt wurde. 
                      Es kombiniert Elemente aus der Astrologie, dem I Ging, der Kabbala und der Chakrenlehre 
                      zu einem einzigartigen System der Persönlichkeitsanalyse.
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                      Das System hilft dir zu verstehen, wer du wirklich bist, wie du am besten entscheidest 
                      und wie du authentisch leben kannst.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(15, 15, 35, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid rgba(242, 159, 5, 0.5)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 600, mb: 3 }}>
                      🎯 Die Kernprinzipien
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Typ - Wer du bist"
                          secondary="Deine grundlegende Natur und Energie"
                          sx={{ 
                            '& .MuiListItemText-primary': { color: 'white', fontWeight: 600 },
                            '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Strategie - Wie du handelst"
                          secondary="Deine natürliche Art, durchs Leben zu gehen"
                          sx={{ 
                            '& .MuiListItemText-primary': { color: 'white', fontWeight: 600 },
                            '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Autorität - Wie du entscheidest"
                          secondary="Dein innerer Kompass für Entscheidungen"
                          sx={{ 
                            '& .MuiListItemText-primary': { color: 'white', fontWeight: 600 },
                            '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Die 5 Typen Tab */}
        {activeTab === 1 && (
          <motion.div
            
            
            
          >
            <Typography variant="h4" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              👥 Die 5 Human Design Typen
            </Typography>
            
            <Grid container spacing={4}>
              {types.map((type, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(15, 15, 35, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(242, 159, 5, 0.3)',
                        border: '1px solid rgba(242, 159, 5, 0.5)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h2" sx={{ mb: 2 }}>
                            {type.emoji}
                          </Typography>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                            {type.name}
                          </Typography>
                          <Chip
                            label={`${type.percentage} der Bevölkerung`}
                            size="small"
                            sx={{
                              backgroundColor: type.color,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, textAlign: 'center', fontStyle: 'italic' }}>
                          {type.description}
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                            Strategie:
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                            {type.strategy}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                            Nicht-Selbst:
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                            {type.notSelf}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 600, mb: 2 }}>
                            Charakteristika:
                          </Typography>
                          <List dense>
                            {type.characteristics.map((char, charIndex) => (
                              <ListItem key={charIndex} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <ArrowRight size={16} color={type.color} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={char}
                                  sx={{ 
                                    '& .MuiListItemText-primary': { 
                                      color: 'rgba(255,255,255,0.9)',
                                      fontSize: '0.85rem'
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Die 9 Zentren Tab */}
        {activeTab === 2 && (
          <motion.div
            
            
            
          >
            <Typography variant="h4" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              🎯 Die 9 Zentren
            </Typography>
            
            <Grid container spacing={3}>
              {centers.map((center, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(15, 15, 35, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(242, 159, 5, 0.3)',
                        border: '1px solid rgba(242, 159, 5, 0.5)'
                      }
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ mb: 2 }}>
                          {center.emoji}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                          {center.name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, fontSize: '0.9rem' }}>
                          {center.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600, mb: 1 }}>
                            Definiert:
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                            {center.defined}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, mb: 1 }}>
                            Offen:
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                            {center.open}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 3 && (
          <motion.div
            
            
            
          >
            <Typography variant="h4" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              ⭐ Die 12 Profile
            </Typography>
            
            <Grid container spacing={3}>
              {profiles.map((profile, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(15, 15, 35, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 30px rgba(242, 159, 5, 0.3)',
                        border: '1px solid rgba(242, 159, 5, 0.5)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                        {profile.number}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        {profile.name}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        {profile.description}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Autorität Tab */}
        {activeTab === 4 && (
          <motion.div
            
            
            
          >
            <Typography variant="h4" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              🧭 Innere Autorität
            </Typography>
            
            <Grid container spacing={4}>
              {authorities.map((authority, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(15, 15, 35, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '1px solid rgba(242, 159, 5, 0.5)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            background: `rgba(${authority.color.replace('#', '')}, 0.1)`,
                            border: `1px solid ${authority.color}`,
                            mr: 3
                          }}>
                            <Shield size={24} color={authority.color} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                              {authority.name}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                              {authority.types.join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                          {authority.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Vorteile Tab */}
        {activeTab === 5 && (
          <motion.div
            
            
            
          >
            <Typography variant="h4" sx={{ color: '#F29F05', textAlign: 'center', mb: 6, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              🎁 Die Vorteile von Human Design
            </Typography>
            
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Paper sx={{
                      background: 'rgba(15, 15, 35, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      p: 4,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        border: '1px solid rgba(242, 159, 5, 0.5)',
                        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
                      }
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        background: 'rgba(242, 159, 5, 0.1)',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        mr: 3,
                        color: '#F29F05'
                      }}>
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                          {benefit.title}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* CTA Section */}
            <motion.div
              
              
              
            >
              <Card sx={{
                background: 'rgba(15, 15, 35, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                textAlign: 'center'
              }}>
                <Typography variant="h3" sx={{ color: '#F29F05', mb: 3, fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                  🌟 Beginne deine Human Design Reise
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                  Entdecke dein einzigartiges Human Design Chart und verstehe, wer du wirklich bist. 
                  Starte deine Reise zu mehr Authentizität und Selbsterkenntnis.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
                    href="/human-design-chart"
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 700,
                      px: 6,
                      py: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(242, 159, 5, 0.4)'
                      }
                    }}
                  >
                    <Brain size={24} style={{ marginRight: 8 }} />
                    Chart erstellen
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/seitenanzeige"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 600,
                      px: 6,
                      py: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: '#F29F05',
                        backgroundColor: 'rgba(242, 159, 5, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Info size={24} style={{ marginRight: 8 }} />
                    Alle Funktionen
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </motion.div>
        )}
        </Box>
      </PageLayout>
    </Box>
  );
}

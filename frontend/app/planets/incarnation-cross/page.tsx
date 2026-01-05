'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cross, 
  Star, 
  Target, 
  Heart, 
  Brain, 
  Zap, 
  Crown, 
  Shield,
  ChevronDown,
  Calculator,
  Search,
  Info
} from 'lucide-react';

interface IncarnationCross {
  cross_name: string;
  cross_type: string;
  sun_gate: number;
  earth_gate: number;
  sun_line: number;
  earth_line: number;
  description: string;
  life_theme: string;
  purpose: string;
  challenges: string;
  gifts: string;
  affirmation: string;
}

// Erweiterte Inkarnationskreuze mit Kategorien
const knownCrosses: IncarnationCross[] = [
  // Führungskreuze
  {
    cross_name: "Rahmen des Bewusstseins",
    cross_type: "Führungskreuz",
    sun_gate: 1,
    earth_gate: 2,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz des Bewusstseins und der Führung",
    life_theme: "Führung durch Bewusstsein und Kreativität",
    purpose: "Andere durch authentischen Ausdruck und natürliche Führung zu inspirieren",
    challenges: "Sich selbst treu bleiben, ohne sich anzupassen",
    gifts: "Kreative Führung, authentischer Ausdruck, magnetische Präsenz",
    affirmation: "Ich führe durch mein authentisches Sein"
  },
  {
    cross_name: "Rahmen der Führung",
    cross_type: "Führungskreuz",
    sun_gate: 7,
    earth_gate: 13,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der natürlichen Führung und Zusammenarbeit",
    life_theme: "Führung durch Zusammenarbeit und Gemeinschaft",
    purpose: "Andere durch natürliche Führung und Zusammenarbeit zu inspirieren",
    challenges: "Geduld mit anderen zu haben",
    gifts: "Natürliche Führung, Zusammenarbeit, Gemeinschaftsgeist",
    affirmation: "Ich führe durch Zusammenarbeit und Gemeinschaft"
  },
  {
    cross_name: "Rahmen der Autorität",
    cross_type: "Führungskreuz",
    sun_gate: 10,
    earth_gate: 15,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der natürlichen Autorität und Individualität",
    life_theme: "Führung durch Individualität und natürliche Autorität",
    purpose: "Andere durch natürliche Autorität und Individualität zu inspirieren",
    challenges: "Sich selbst zu lieben und zu akzeptieren",
    gifts: "Natürliche Autorität, Individualität, Selbstliebe",
    affirmation: "Ich führe durch meine natürliche Autorität"
  },

  // Transformationskreuze
  {
    cross_name: "Rahmen der Transformation",
    cross_type: "Transformationskreuz",
    sun_gate: 3,
    earth_gate: 50,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Transformation und des Schutzes",
    life_theme: "Transformation durch Chaos und Schutz",
    purpose: "Andere durch Transformation und Schutz zu führen",
    challenges: "Chaos als natürlichen Prozess zu akzeptieren",
    gifts: "Transformative Kraft, Schutz, emotionale Tiefe",
    affirmation: "Ich transformiere durch mein Sein"
  },
  {
    cross_name: "Rahmen der Regeneration",
    cross_type: "Transformationskreuz",
    sun_gate: 4,
    earth_gate: 49,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Regeneration und des Schutzes",
    life_theme: "Transformation durch Regeneration und Schutz",
    purpose: "Andere durch Regeneration und Schutz zu führen",
    challenges: "Geduld mit dem Transformationsprozess zu haben",
    gifts: "Regenerative Kraft, Schutz, Geduld",
    affirmation: "Ich regeneriere und schütze durch mein Sein"
  },

  // Liebeskreuze
  {
    cross_name: "Rahmen der Liebe",
    cross_type: "Liebeskreuz",
    sun_gate: 25,
    earth_gate: 46,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der bedingungslosen Liebe und der Freude",
    life_theme: "Liebe und Freude durch Authentizität",
    purpose: "Andere durch bedingungslose Liebe und Freude zu inspirieren",
    challenges: "Liebe ohne Bedingungen zu geben",
    gifts: "Bedingungslose Liebe, Freude, Authentizität",
    affirmation: "Ich liebe bedingungslos und bringe Freude"
  },
  {
    cross_name: "Rahmen der Herzensliebe",
    cross_type: "Liebeskreuz",
    sun_gate: 26,
    earth_gate: 45,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Herzensliebe und des Wohlstands",
    life_theme: "Liebe durch Herzenskraft und Wohlstand",
    purpose: "Andere durch Herzensliebe und Wohlstand zu inspirieren",
    challenges: "Liebe und Wohlstand zu teilen",
    gifts: "Herzensliebe, Wohlstand, Großzügigkeit",
    affirmation: "Ich teile Liebe und Wohlstand bedingungslos"
  },

  // Weisheitskreuze
  {
    cross_name: "Rahmen der Weisheit",
    cross_type: "Weisheitskreuz",
    sun_gate: 17,
    earth_gate: 18,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Weisheit und der Korrektur",
    life_theme: "Weisheit durch Beobachtung und Korrektur",
    purpose: "Andere durch Weisheit und Korrektur zu führen",
    challenges: "Weisheit ohne Urteil zu teilen",
    gifts: "Weisheit, Korrektur, Klarheit",
    affirmation: "Ich teile Weisheit mit Klarheit und Mitgefühl"
  },
  {
    cross_name: "Rahmen der Erkenntnis",
    cross_type: "Weisheitskreuz",
    sun_gate: 20,
    earth_gate: 34,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Erkenntnis und der Kraft",
    life_theme: "Weisheit durch Erkenntnis und Kraft",
    purpose: "Andere durch Erkenntnis und Kraft zu führen",
    challenges: "Erkenntnis mit Demut zu teilen",
    gifts: "Erkenntnis, Kraft, Demut",
    affirmation: "Ich teile Erkenntnis mit Kraft und Demut"
  },

  // Kreativkreuze
  {
    cross_name: "Rahmen der Kreativität",
    cross_type: "Kreativkreuz",
    sun_gate: 5,
    earth_gate: 35,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Kreativität und des Wartens",
    life_theme: "Kreativität durch Warten und Rhythmus",
    purpose: "Andere durch Kreativität und Rhythmus zu inspirieren",
    challenges: "Geduld mit dem kreativen Prozess zu haben",
    gifts: "Kreativität, Rhythmus, Geduld",
    affirmation: "Ich erschaffe durch Geduld und Rhythmus"
  },
  {
    cross_name: "Rahmen der Inspiration",
    cross_type: "Kreativkreuz",
    sun_gate: 6,
    earth_gate: 36,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz der Inspiration und der Krise",
    life_theme: "Kreativität durch Inspiration und Krise",
    purpose: "Andere durch Inspiration und Krisenbewältigung zu führen",
    challenges: "Krisen als Wachstumschancen zu sehen",
    gifts: "Inspiration, Krisenbewältigung, Wachstum",
    affirmation: "Ich inspiriere durch Krisen und Wachstum"
  },

  // Mystische Kreuze
  {
    cross_name: "Rahmen des Mystikers",
    cross_type: "Mystisches Kreuz",
    sun_gate: 12,
    earth_gate: 11,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz des Mystikers und der Ruhe",
    life_theme: "Mystik durch Ruhe und Individualität",
    purpose: "Andere durch mystische Ruhe und Individualität zu inspirieren",
    challenges: "Ruhe in der Stille zu finden",
    gifts: "Mystische Ruhe, Individualität, Stille",
    affirmation: "Ich finde Ruhe in der mystischen Stille"
  },
  {
    cross_name: "Rahmen des Sehers",
    cross_type: "Mystisches Kreuz",
    sun_gate: 14,
    earth_gate: 8,
    sun_line: 1,
    earth_line: 1,
    description: "Das Inkarnationskreuz des Sehers und der Kraft",
    life_theme: "Mystik durch Sehen und Kraft",
    purpose: "Andere durch mystisches Sehen und Kraft zu führen",
    challenges: "Das Unsichtbare zu sehen",
    gifts: "Mystisches Sehen, Kraft, Vision",
    affirmation: "Ich sehe das Unsichtbare mit mystischer Kraft"
  }
];

// Farben für verschiedene Kreuz-Typen
const getCrossColor = (crossType: string): string => {
  switch (crossType) {
    case 'Führungskreuz':
      return '#F29F05';
    case 'Transformationskreuz':
      return '#8C1D04';
    case 'Liebeskreuz':
      return '#590A03';
    case 'Weisheitskreuz':
      return '#260A0A';
    case 'Kreativkreuz':
      return '#F29F05';
    case 'Mystisches Kreuz':
      return '#8C1D04';
    default:
      return '#6B7280'; // Grau
  }
};

export default function IncarnationCrossPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedCross, setCalculatedCross] = useState<IncarnationCross | null>(null);
  const [expandedCross, setExpandedCross] = useState<number | false>(false);
  
  // Filter und Suche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [sortBy, setSortBy] = useState('name');
  
  // Formular für Kreuz-Berechnung
  const [calculationForm, setCalculationForm] = useState({
    sunGate: '',
    earthGate: '',
    sunLine: '',
    earthLine: ''
  });

  // Kategorien für Filter
  const categories = ['Alle', 'Führungskreuz', 'Transformationskreuz', 'Liebeskreuz', 'Weisheitskreuz', 'Kreativkreuz', 'Mystisches Kreuz'];

  // Gefilterte und sortierte Kreuze
  const filteredCrosses = knownCrosses
    .filter(cross => {
      const matchesSearch = cross.cross_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cross.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cross.life_theme.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || cross.cross_type === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.cross_name.localeCompare(b.cross_name);
        case 'type':
          return a.cross_type.localeCompare(b.cross_type);
        case 'sun_gate':
          return a.sun_gate - b.sun_gate;
        default:
          return 0;
      }
    });

  const calculateIncarnationCross = () => {
    if (!calculationForm.sunGate || !calculationForm.earthGate || 
        !calculationForm.sunLine || !calculationForm.earthLine) {
      setError('Bitte fülle alle Felder aus');
      return;
    }

    setLoading(true);
    
    // Simuliere Berechnung
    setTimeout(() => {
      const sunGate = parseInt(calculationForm.sunGate);
      const earthGate = parseInt(calculationForm.earthGate);
      const sunLine = parseInt(calculationForm.sunLine);
      const earthLine = parseInt(calculationForm.earthLine);

      // Suche nach bekanntem Kreuz
      const knownCross = knownCrosses.find(cross => 
        cross.sun_gate === sunGate && 
        cross.earth_gate === earthGate && 
        cross.sun_line === sunLine && 
        cross.earth_line === earthLine
      );

      if (knownCross) {
        setCalculatedCross(knownCross);
      } else {
        // Erstelle generisches Kreuz
        setCalculatedCross({
          cross_name: `Kreuz ${sunGate}.${sunLine}/${earthGate}.${earthLine}`,
          cross_type: "Incarnation Cross",
          sun_gate: sunGate,
          earth_gate: earthGate,
          sun_line: sunLine,
          earth_line: earthLine,
          description: `Einzigartiges Inkarnationskreuz mit Sonne in Tor ${sunGate}, Linie ${sunLine} und Erde in Tor ${earthGate}, Linie ${earthLine}`,
          life_theme: "Individuelle Lebensaufgabe",
          purpose: "Deine einzigartige Lebensaufgabe zu erfüllen",
          challenges: "Deine wahre Natur zu leben",
          gifts: "Einzigartige Gaben und Talente",
          affirmation: "Ich lebe meine einzigartige Lebensaufgabe"
        });
      }
      
      setError(null);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setCalculationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 4, background: 'transparent' }}>
      {/* Header */}
      <motion.div
        
        
        
      >
        <Box sx={{ textAlign: 'center', marginBottom: 6, position: 'relative' }}>
          {/* Großes rotierendes Inkarnationskreuz-Symbol */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block' }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: 200, sm: 250, md: 300 },
                height: { xs: 200, sm: 250, md: 300 },
                margin: '0 auto 2rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `
                  0 0 60px #FFD70050,
                  0 0 120px #FFD70030,
                  0 0 180px #FFD70015,
                  inset -30px -30px 100px rgba(0, 0, 0, 0.5),
                  inset 30px 30px 100px rgba(255, 255, 255, 0.1),
                  0 20px 60px rgba(0, 0, 0, 0.4)
                `,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '8%',
                  left: '15%',
                  width: '35%',
                  height: '35%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                  filter: 'blur(15px)',
                  opacity: 0.8,
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                    '50%': { opacity: 0.9, transform: 'scale(1.1)' },
                  },
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '45%',
                  right: '12%',
                  width: '25%',
                  height: '25%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                  filter: 'blur(12px)',
                  opacity: 0.5,
                  animation: 'pulse 4s ease-in-out infinite 1s',
                },
              }}
            >
              {/* Rotierender Ring */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-10%',
                  left: '-10%',
                  right: '-10%',
                  bottom: '-10%',
                  borderRadius: '50%',
                  border: '2px solid #FFD70040',
                  borderTopColor: '#FFD700',
                  borderRightColor: '#FFD700',
                  opacity: 0.3,
                  animation: 'rotate 20s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              
              {/* Inkarnationskreuz Symbol */}
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.4))',
                  zIndex: 2,
                  position: 'relative',
                  lineHeight: 1,
                }}
              >
                ✚
              </Typography>
              
              {/* Glow Effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)`,
                  pointerEvents: 'none',
                  zIndex: 1,
                  animation: 'glow 3s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': { opacity: 0.6 },
                    '50%': { opacity: 1 },
                  },
                }}
              />
            </Box>
          </motion.div>
          
          {/* Title */}
          <Typography 
            variant="h2" 
            component="h1"
            sx={{ 
              fontWeight: 900,
              color: '#ffffff',
              textShadow: `
                0 0 10px #FFD700,
                0 0 20px #FFD70080,
                0 2px 10px rgba(0, 0, 0, 0.9),
                0 4px 20px rgba(0, 0, 0, 0.7)
              `,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 1,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Inkarnationskreuz
          </Typography>
          
          <Typography variant="h6" sx={{ 
            color: '#FFD700', 
            fontStyle: 'italic', 
            fontWeight: 600, 
            mb: 2,
            maxWidth: 700, 
            margin: 'auto' 
          }}>
            Entdecke dein einzigartiges Inkarnationskreuz - die vier Tore, die deine Lebensaufgabe und dein höchstes Potenzial definieren
          </Typography>
        </Box>
      </motion.div>

      {/* Fehler-Anzeige */}
      {error && (
        <motion.div
          
          
          
        >
          <Alert severity="error" sx={{ marginBottom: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Berechnungsformular */}
      <motion.div
        
        
        
      >
        <Card sx={{ marginBottom: 4, background: 'rgba(242, 159, 5, 0.06)', border: '1px solid rgba(242,159,5,0.15)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Calculator size={24} color="#F29F05" />
              <Typography variant="h5" sx={{ marginLeft: 2, color: '#F29F05', fontWeight: 'bold' }}>
                Inkarnationskreuz berechnen
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Sonne Tor"
                  type="number"
                  value={calculationForm.sunGate}
                  onChange={(e) => handleInputChange('sunGate', e.target.value)}
                  inputProps={{ min: 1, max: 64 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      '& fieldset': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover fieldset': { borderColor: 'rgba(242,159,5,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Erde Tor"
                  type="number"
                  value={calculationForm.earthGate}
                  onChange={(e) => handleInputChange('earthGate', e.target.value)}
                  inputProps={{ min: 1, max: 64 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      '& fieldset': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover fieldset': { borderColor: 'rgba(242,159,5,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Sonne Linie"
                  type="number"
                  value={calculationForm.sunLine}
                  onChange={(e) => handleInputChange('sunLine', e.target.value)}
                  inputProps={{ min: 1, max: 6 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      '& fieldset': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover fieldset': { borderColor: 'rgba(242,159,5,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Erde Linie"
                  type="number"
                  value={calculationForm.earthLine}
                  onChange={(e) => handleInputChange('earthLine', e.target.value)}
                  inputProps={{ min: 1, max: 6 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      '& fieldset': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover fieldset': { borderColor: 'rgba(242,159,5,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ marginTop: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={calculateIncarnationCross}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Calculator />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  },
                  padding: 16
                }}
              >
                {loading ? 'Berechne...' : 'Inkarnationskreuz berechnen'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Berechnetes Inkarnationskreuz */}
      {calculatedCross && (
        <motion.div
          
          
          
        >
          <Card sx={{ marginBottom: 4, border: '1px solid rgba(242,159,5,0.30)', background: 'rgba(242,159,5,0.06)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                <Star size={24} color="#F29F05" />
                <Typography variant="h5" sx={{ marginLeft: 2, fontWeight: 'bold', color: '#F29F05' }}>
                  Dein Inkarnationskreuz
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                {calculatedCross.cross_name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, marginBottom: 3, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Sonne: Tor ${calculatedCross.sun_gate}.${calculatedCross.sun_line}`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Erde: Tor ${calculatedCross.earth_gate}.${calculatedCross.earth_line}`} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body1" sx={{ marginBottom: 3, lineHeight: 1.8 }}>
                {calculatedCross.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(242,159,5,0.10)', borderRadius: 2, border: '1px solid rgba(242,159,5,0.25)' }}>
                    <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#F29F05' }}>
                      Lebensaufgabe
                    </Typography>
                    <Typography variant="body2">
                      {calculatedCross.life_theme}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(242,159,5,0.10)', borderRadius: 2, border: '1px solid rgba(242,159,5,0.25)' }}>
                    <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#F29F05' }}>
                      Zweck
                    </Typography>
                    <Typography variant="body2">
                      {calculatedCross.purpose}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(140,29,4,0.10)', borderRadius: 2, border: '1px solid rgba(140,29,4,0.25)' }}>
                    <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#8C1D04' }}>
                      Herausforderungen
                    </Typography>
                    <Typography variant="body2">
                      {calculatedCross.challenges}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(89,10,3,0.10)', borderRadius: 2, border: '1px solid rgba(89,10,3,0.25)' }}>
                    <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: '#590A03' }}>
                      Gaben
                    </Typography>
                    <Typography variant="body2">
                      {calculatedCross.gifts}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ marginTop: 3, p: 2, background: 'linear-gradient(135deg, #F29F05, #8C1D04)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 'bold', color: 'white' }}>
                  Affirmation
                </Typography>
                <Typography variant="body1" style={{ color: 'white', fontStyle: 'italic' }}>
                  "{calculatedCross.affirmation}"
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter und Suche */}
      <motion.div
        
        
        
      >
        <Card sx={{ marginBottom: 4, background: 'rgba(242,159,5,0.06)', border: '1px solid rgba(242,159,5,0.15)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
              <Search size={24} color="#F29F05" />
              <Typography variant="h5" sx={{ marginLeft: 2, color: '#F29F05', fontWeight: 'bold' }}>
                Kreuze durchsuchen & filtern
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Suche nach Namen oder Beschreibung"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      '& fieldset': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover fieldset': { borderColor: 'rgba(242,159,5,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel style={{ color: 'rgba(255,255,255,0.8)' }}>Kategorie</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242,159,5,0.45)' },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel style={{ color: 'rgba(255,255,255,0.8)' }}>Sortieren nach</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      backgroundColor: 'rgba(242,159,5,0.10)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242,159,5,0.30)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242,159,5,0.45)' },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      }
                    }}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="type">Kategorie</MenuItem>
                    <MenuItem value="sun_gate">Sonne Tor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`${filteredCrosses.length} Kreuze gefunden`} 
                color="primary" 
                variant="outlined"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
              {selectedCategory !== 'Alle' && (
                <Chip 
                  label={`Kategorie: ${selectedCategory}`} 
                  color="secondary" 
                  variant="outlined"
                  style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bekannte Inkarnationskreuze */}
      <motion.div
        
        
        
      >
        <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 'bold' }}>
          Bekannte Inkarnationskreuze ({filteredCrosses.length})
        </Typography>
        
        <Grid container spacing={3}>
          {filteredCrosses.map((cross, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                
                
                
                whileHover={{ y: -5 }}
              >
                <Card sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${getCrossColor(cross.cross_type)}15 0%, rgba(11,13,18,0.95) 50%, rgba(26,31,43,0.98) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `2px solid ${getCrossColor(cross.cross_type)}40`,
                  boxShadow: `0 8px 32px ${getCrossColor(cross.cross_type)}30, inset 0 1px 0 ${getCrossColor(cross.cross_type)}60`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: `0 20px 60px ${getCrossColor(cross.cross_type)}50, inset 0 1px 0 ${getCrossColor(cross.cross_type)}80`,
                    transform: 'translateY(-8px) scale(1.02)',
                    border: `2px solid ${getCrossColor(cross.cross_type)}80`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${getCrossColor(cross.cross_type)} 0%, ${getCrossColor(cross.cross_type)}80 100%)`,
                    opacity: 0.8
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${getCrossColor(cross.cross_type)}, ${getCrossColor(cross.cross_type)}80)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2,
                        color: '#000',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        ✚
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                          {cross.cross_name}
                        </Typography>
                        <Chip 
                          label={cross.cross_type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: `${getCrossColor(cross.cross_type)}20`,
                            color: getCrossColor(cross.cross_type),
                            border: `1px solid ${getCrossColor(cross.cross_type)}40`,
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, marginBottom: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`☉ ${cross.sun_gate}.${cross.sun_line}`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#FFD70020',
                          color: '#FFD700',
                          border: '1px solid #FFD70040'
                        }}
                      />
                      <Chip 
                        label={`🌍 ${cross.earth_gate}.${cross.earth_line}`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#32CD3220',
                          color: '#32CD32',
                          border: '1px solid #32CD3240'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ marginBottom: 2, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                      {cross.description}
                    </Typography>
                    
                    <Box sx={{ p: 2, backgroundColor: `${getCrossColor(cross.cross_type)}15`, borderRadius: 2, marginBottom: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: getCrossColor(cross.cross_type), marginBottom: 1 }}>
                        Lebensaufgabe:
                      </Typography>
                      <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {cross.life_theme}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Gaben" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#10B98120',
                          color: '#10B981',
                          border: '1px solid #10B98140'
                        }}
                      />
                      <Chip 
                        label="Herausforderungen" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#EF444420',
                          color: '#EF4444',
                          border: '1px solid #EF444440'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
}

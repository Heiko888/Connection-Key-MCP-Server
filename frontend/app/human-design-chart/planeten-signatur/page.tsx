'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Sparkles,
  Zap,
  Heart,
  Brain,
  Target,
  Flame,
  Star,
  Orbit,
} from 'lucide-react';
import { GATE_NAMES, GATE_TO_CENTER, CHANNEL_CENTERS, getCenterDescription, CHANNELS } from '@/lib/human-design';

interface PlanetPosition {
  gate: number;
  line: number;
  longitude: number;
}

interface PlanetData {
  id: string;
  name: string;
  symbol: string;
  color: string;
  description: string;
  keyTheme: string;
  archetype: string;
  personality?: PlanetPosition;
  design?: PlanetPosition;
  personalityCenter?: string;
  designCenter?: string;
  personalityChannels?: string[];
  designChannels?: string[];
}

const PLANET_INFO: Record<string, {
  name: string;
  symbol: string;
  color: string;
  description: string;
  keyTheme: string;
  archetype: string;
}> = {
  sun: {
    name: 'Sonne',
    symbol: '☉',
    color: '#F29F05',
    description: 'Lebensaufgabe, Kernenergie',
    keyTheme: 'Ca. 70% deiner Grundenergie',
    archetype: 'Du strahlst Lebensfreude aus, wenn du authentisch bist',
  },
  earth: {
    name: 'Erde',
    symbol: '🌍',
    color: '#8C1D04',
    description: 'Stabilität, Balance',
    keyTheme: 'Was dich erdet und wie du dein Gleichgewicht hältst',
    archetype: 'Du findest Stabilität durch deine Verbindung zur Erde',
  },
  moon: {
    name: 'Mond',
    symbol: '🌙',
    color: '#FFD700',
    description: 'Motivation, Antrieb',
    keyTheme: 'Was dich innerlich bewegt',
    archetype: 'Deine Emotionen führen dich zu deiner Bestimmung',
  },
  mercury: {
    name: 'Merkur',
    symbol: '☿',
    color: '#F29F05',
    description: 'Kommunikation, Ausdruck',
    keyTheme: 'Wofür du sprichst, welche Wahrheit du teilst',
    archetype: 'Deine Worte tragen die Kraft der Wahrheit',
  },
  venus: {
    name: 'Venus',
    symbol: '♀',
    color: '#FFD700',
    description: 'Werte, Beziehungen',
    keyTheme: 'Was du liebst, was dir Schönheit und Harmonie bedeutet',
    archetype: 'Du ziehst an, was deine Seele nährt',
  },
  mars: {
    name: 'Mars',
    symbol: '♂',
    color: '#F29F05',
    description: 'Handlung, Reife',
    keyTheme: 'Wo du impulsiv bist und durch Erfahrung reifst',
    archetype: 'Deine Handlungen formen deine Reife',
  },
  jupiter: {
    name: 'Jupiter',
    symbol: '♃',
    color: '#FFD700',
    description: 'Weisheit, Expansion',
    keyTheme: 'Dein innerer Lehrer, wo du wachsen und Fülle erfahren kannst',
    archetype: 'Du wächst durch deine Weisheit und Erfahrung',
  },
  saturn: {
    name: 'Saturn',
    symbol: '♄',
    color: '#8C1D04',
    description: 'Lektionen, Verantwortung',
    keyTheme: 'Der Lehrer des Lebens – wo du Disziplin und Reife lernen musst',
    archetype: 'Deine Herausforderungen formen deine Stärke',
  },
  uranus: {
    name: 'Uranus',
    symbol: '♅',
    color: '#F29F05',
    description: 'Einzigartigkeit, Revolution',
    keyTheme: 'Wo du anders bist, rebellierst und Freiheit suchst',
    archetype: 'Du bringst Veränderung durch deine Einzigartigkeit',
  },
  neptune: {
    name: 'Neptun',
    symbol: '♆',
    color: '#FFD700',
    description: 'Spiritualität, Illusion',
    keyTheme: 'Wo du träumst, idealisierst oder transzendierst',
    archetype: 'Deine Träume führen dich zur Transzendenz',
  },
  pluto: {
    name: 'Pluto',
    symbol: '♇',
    color: '#8C1D04',
    description: 'Transformation, Macht',
    keyTheme: 'Wo du stirbst und wiedergeboren wirst – tiefe Wandlungskraft',
    archetype: 'Du transformierst durch deine tiefste Kraft',
  },
  northNode: {
    name: 'Nordknoten',
    symbol: '☊',
    color: '#F29F05',
    description: 'Entwicklungsrichtung',
    keyTheme: 'Wo deine Lebensreise hingeht – Wachstum, Zukunft, Bestimmung',
    archetype: 'Du wächst in Richtung deiner Bestimmung',
  },
  southNode: {
    name: 'Südknoten',
    symbol: '☋',
    color: '#8C1D04',
    description: 'Herkunft, Gewohnheit',
    keyTheme: 'Wo du herkommst, alte Muster und vertraute Energien',
    archetype: 'Deine Vergangenheit gibt dir Stabilität',
  },
};

export default function PlanetenSignaturPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personality' | 'design'>('personality');

  useEffect(() => {
    loadPlanetData();
  }, []);

  const loadPlanetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lade Chart-Daten aus localStorage oder API
      const userChart = typeof window !== 'undefined' ? localStorage.getItem('userChart') : null;
      
      if (userChart) {
        try {
          const { safeJsonParse } = await import('@/lib/utils/safeJson');
          const chartData = safeJsonParse<any>(userChart, null);
          if (chartData) {
            console.log('📊 Chart-Daten aus localStorage:', chartData);
            console.log('📊 Personality:', chartData.personality);
            console.log('📊 Design:', chartData.design);
            processPlanetData(chartData);
          } else {
            // Fallback zu API
            await loadFromAPI();
          }
        } catch (parseError) {
          console.error('Fehler beim Parsen von userChart:', parseError);
          // Fallback zu API
          await loadFromAPI();
        }
      } else {
        await loadFromAPI();
      }
    } catch (err: any) {
      console.error('Fehler beim Laden der Planeten-Daten:', err);
      setError(err.message || 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const loadFromAPI = async () => {
    const birthData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (!birthData) {
      throw new Error('Keine Geburtsdaten gefunden. Bitte erstelle zuerst dein Human Design Chart.');
    }

    const { safeJsonParse } = await import('@/lib/utils/safeJson');
    const userData = safeJsonParse<any>(birthData, null);
    if (!userData) {
      throw new Error('Ungültige Geburtsdaten. Bitte erstelle zuerst dein Human Design Chart.');
    }
    console.log('📊 Lade Chart-Daten vom API für:', userData);
    
    const response = await fetch('/api/charts/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthDate: userData.birthDate || userData.birthdate,
        birthTime: userData.birthTime || userData.birthtime || '12:00',
        birthPlace: typeof userData.birthPlace === 'string' ? {
          latitude: 52.52,
          longitude: 13.405,
          timezone: 'Europe/Berlin',
          name: userData.birthPlace
        } : userData.birthPlace
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Fehler beim Laden der Chart-Daten');
    }

    const result = await response.json();
    console.log('📊 API Response:', result);
    console.log('📊 Chart aus API:', result.chart);
    console.log('📊 Personality:', result.chart?.personality);
    console.log('📊 Design:', result.chart?.design);
    
    const chartData = result.chart || result;
    processPlanetData(chartData);
    
    // Speichere auch im localStorage für zukünftige Verwendung
    if (typeof window !== 'undefined') {
      localStorage.setItem('userChart', JSON.stringify(chartData));
    }
  };

  const processPlanetData = (chartData: any) => {
    console.log('🪐 processPlanetData aufgerufen mit:', chartData);
    console.log('🪐 chartData.personality:', chartData.personality);
    console.log('🪐 chartData.design:', chartData.design);
    console.log('🪐 chartData.hdChart:', chartData.hdChart);
    
    // Unterstütze verschiedene Datenstrukturen
    const personalityData = chartData.personality || chartData.hdChart?.personality || chartData.personalityPositions;
    const designData = chartData.design || chartData.hdChart?.design || chartData.designPositions;
    
    console.log('🪐 Extrahierte personalityData:', personalityData);
    console.log('🪐 Extrahierte designData:', designData);
    
    if (!personalityData && !designData) {
      console.error('❌ Keine Personality oder Design Daten gefunden!');
      setError('Keine Planeten-Daten gefunden. Bitte erstelle zuerst dein Human Design Chart.');
      return;
    }
    
    const planetList: PlanetData[] = [];
    const planetKeys = ['earth', 'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'southNode'];

    // Sammle alle aktivierten Gates für Kanal-Berechnung
    const allActiveGates = new Set<number>();
    planetKeys.forEach((key) => {
      if (personalityData?.[key]?.gate) {
        allActiveGates.add(personalityData[key].gate);
      }
      if (designData?.[key]?.gate) {
        allActiveGates.add(designData[key].gate);
      }
    });

    console.log('🪐 Alle aktiven Gates:', Array.from(allActiveGates));

    planetKeys.forEach((key) => {
      const info = PLANET_INFO[key];
      if (!info) {
        console.log(`⚠️ Keine Info für Planet: ${key}`);
        return;
      }

      const personality = personalityData?.[key];
      const design = designData?.[key];

      console.log(`🪐 Planet ${key}:`, { personality, design });

      if (personality || design) {
        // Finde Zentrum für Personality Gate
        const personalityCenter = personality?.gate ? GATE_TO_CENTER[personality.gate] : undefined;
        const designCenter = design?.gate ? GATE_TO_CENTER[design.gate] : undefined;

        // Finde mögliche Kanäle für Personality Gate
        const personalityChannels: string[] = [];
        if (personality?.gate) {
          CHANNELS.forEach(channel => {
            const [gate1, gate2] = channel.gates;
            if ((gate1 === personality.gate && allActiveGates.has(gate2)) ||
                (gate2 === personality.gate && allActiveGates.has(gate1))) {
              personalityChannels.push(`${gate1}-${gate2}`);
            }
          });
        }

        // Finde mögliche Kanäle für Design Gate
        const designChannels: string[] = [];
        if (design?.gate) {
          CHANNELS.forEach(channel => {
            const [gate1, gate2] = channel.gates;
            if ((gate1 === design.gate && allActiveGates.has(gate2)) ||
                (gate2 === design.gate && allActiveGates.has(gate1))) {
              designChannels.push(`${gate1}-${gate2}`);
            }
          });
        }

        planetList.push({
          id: key,
          name: info.name,
          symbol: info.symbol,
          color: info.color,
          description: info.description,
          keyTheme: info.keyTheme,
          archetype: info.archetype,
          personality: personality ? {
            gate: personality.gate,
            line: personality.line,
            longitude: personality.longitude || 0,
          } : undefined,
          design: design ? {
            gate: design.gate,
            line: design.line,
            longitude: design.longitude || 0,
          } : undefined,
          personalityCenter: personalityCenter,
          designCenter: designCenter,
          personalityChannels: personalityChannels.length > 0 ? personalityChannels : undefined,
          designChannels: designChannels.length > 0 ? designChannels : undefined,
        });
      }
    });

    console.log('🪐 Verarbeitete Planeten:', planetList);
    console.log('🪐 Anzahl Planeten:', planetList.length);
    
    setPlanets(planetList);
    if (planetList.length > 0) {
      setSelectedPlanet(planetList[0].id);
    } else {
      console.error('❌ Keine Planeten gefunden! Chart-Daten-Struktur:', chartData);
      setError('Keine Planeten-Daten gefunden. Bitte überprüfe dein Human Design Chart.');
    }
  };

  const getSelectedPlanetData = () => {
    if (!selectedPlanet) return null;
    return planets.find(p => p.id === selectedPlanet);
  };

  const selectedData = getSelectedPlanetData();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#F29F05' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Fehler
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {error}
          </Typography>
          <Button
            onClick={() => router.push('/human-design-chart')}
            sx={{ mt: 2, color: '#F29F05' }}
          >
            Zum Human Design Chart →
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.2) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.12) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        pt: { xs: 4, md: 6 },
        pb: 8,
        overflow: 'hidden',
      }}
    >
      {/* Animierte Gradient-Kreise */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`gradient-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.1 - i * 0.02}) 0%, transparent 70%)`,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Sparkles Animation */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#F29F05',
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            zIndex: 0,
            boxShadow: '0 0 10px rgba(242, 159, 5, 0.8)',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        />
      ))}
      {/* Animiertes Sonnensystem */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {planets.slice(0, 8).map((planet, index) => {
          const angle = (index * 360) / 8;
          const radius = 120 + index * 20;
          return (
            <motion.div
              key={planet.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${10 + index * 2}px`,
                height: `${10 + index * 2}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${planet.color} 0%, transparent 70%)`,
                boxShadow: `0 0 ${20 + index * 5}px ${planet.color}`,
                transform: `translate(-50%, -50%)`,
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * radius,
                  Math.cos(((angle + 360) * Math.PI) / 180) * radius,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * radius,
                  Math.sin(((angle + 360) * Math.PI) / 180) * radius,
                ],
              }}
              transition={{
                duration: 20 + index * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 2, md: 4 } }}>
        {/* Logo - statisch wie auf anderen Seiten */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{
            position: 'relative',
            height: { xs: 60, md: 80 },
            width: { xs: 200, md: 300 },
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key Logo"
              fill
              style={{ objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/Design%20ohne%20Titel(15).png';
              }}
              priority
            />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
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
                fontSize: { xs: '2rem', md: '3rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Deine planetare Signatur
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 4,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 400,
              }}
            >
              Die Archetypen deiner Energie – wie die Planeten dein Human Design prägen
            </Typography>
          </motion.div>
        </Box>

        {/* Tabs für Bewusst/Unbewusst */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#F29F05',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#F29F05',
              },
            }}
          >
            <Tab label="Bewusst (Schwarz)" value="personality" />
            <Tab label="Unbewusst (Rot)" value="design" />
          </Tabs>
        </Box>

        {/* Planeten-Karten */}
        {planets.length === 0 && !loading && !error && (
          <Alert severity="info" sx={{ mb: 4, background: 'rgba(242, 159, 5, 0.1)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              Keine Planeten-Daten gefunden. Bitte erstelle zuerst dein Human Design Chart auf der{' '}
              <Link href="/human-design-chart" style={{ color: '#F29F05', textDecoration: 'underline' }}>
                Human Design Chart Seite
              </Link>.
            </Typography>
          </Alert>
        )}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {planets.map((planet) => {
            const position = activeTab === 'personality' ? planet.personality : planet.design;
            if (!position) return null;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={planet.id}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => setSelectedPlanet(planet.id)}
                    sx={{
                      background: selectedPlanet === planet.id
                        ? `linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.2))`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedPlanet === planet.id
                        ? '2px solid rgba(242, 159, 5, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        background: 'rgba(242, 159, 5, 0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            color: planet.color,
                            mr: 1,
                            fontSize: '2rem',
                          }}
                        >
                          {planet.symbol}
                        </Typography>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {planet.name}
                          </Typography>
                          <Chip
                            label={`Tor ${position.gate}.${position.line}`}
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${planet.color}, ${planet.color}dd)`,
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: '24px',
                              mt: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          mb: 1,
                        }}
                      >
                        {planet.description}
                      </Typography>
                      {position && GATE_TO_CENTER[position.gate] && (
                        <Chip
                          label={getCenterDescription(GATE_TO_CENTER[position.gate])}
                          size="small"
                          sx={{
                            background: 'rgba(242, 159, 5, 0.2)',
                            color: '#F29F05',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: '20px',
                            mt: 0.5,
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Detail-Ansicht */}
        {selectedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 4,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h2"
                  sx={{
                    color: selectedData.color,
                    mr: 2,
                    fontSize: '3rem',
                  }}
                >
                  {selectedData.symbol}
                </Typography>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#fff',
                      fontWeight: 800,
                      mb: 1,
                    }}
                  >
                    {selectedData.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {selectedData.description}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Personality */}
                {selectedData.personality && (
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#fff',
                          fontWeight: 700,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ width: 20, height: 20, background: '#000', borderRadius: '50%', border: '2px solid #fff' }} />
                        Bewusst (Personality)
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: selectedData.color,
                          fontWeight: 800,
                          mb: 1,
                        }}
                      >
                        Tor {selectedData.personality.gate}.{selectedData.personality.line}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          mb: 1,
                          fontWeight: 600,
                        }}
                      >
                        {GATE_NAMES[selectedData.personality.gate] || 'Unbekannt'}
                      </Typography>
                      {selectedData.personalityCenter && (
                        <Chip
                          label={getCenterDescription(selectedData.personalityCenter as any)}
                          size="small"
                          sx={{
                            background: 'rgba(242, 159, 5, 0.2)',
                            color: '#F29F05',
                            fontWeight: 600,
                            mb: 2,
                          }}
                        />
                      )}
                      {selectedData.personalityChannels && selectedData.personalityChannels.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            Aktivierte Kanäle:
                          </Typography>
                          {selectedData.personalityChannels.map((channel, idx) => {
                            const channelInfo = CHANNELS.find(ch => 
                              `${ch.gates[0]}-${ch.gates[1]}` === channel || 
                              `${ch.gates[1]}-${ch.gates[0]}` === channel
                            );
                            return (
                              <Chip
                                key={idx}
                                label={channelInfo ? `Kanal ${channel}: ${channelInfo.name}` : `Kanal ${channel}`}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  mr: 0.5,
                                  mb: 0.5,
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedData.keyTheme}
                      </Typography>
                    </Card>
                  </Grid>
                )}

                {/* Design */}
                {selectedData.design && (
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 0, 0, 0.3)',
                        borderRadius: 2,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#fff',
                          fontWeight: 700,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ width: 20, height: 20, background: '#f00', borderRadius: '50%', border: '2px solid #fff' }} />
                        Unbewusst (Design)
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: selectedData.color,
                          fontWeight: 800,
                          mb: 1,
                        }}
                      >
                        Tor {selectedData.design.gate}.{selectedData.design.line}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          mb: 1,
                          fontWeight: 600,
                        }}
                      >
                        {GATE_NAMES[selectedData.design.gate] || 'Unbekannt'}
                      </Typography>
                      {selectedData.designCenter && (
                        <Chip
                          label={getCenterDescription(selectedData.designCenter as any)}
                          size="small"
                          sx={{
                            background: 'rgba(255, 0, 0, 0.2)',
                            color: '#ff6b6b',
                            fontWeight: 600,
                            mb: 2,
                          }}
                        />
                      )}
                      {selectedData.designChannels && selectedData.designChannels.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            Aktivierte Kanäle:
                          </Typography>
                          {selectedData.designChannels.map((channel, idx) => {
                            const channelInfo = CHANNELS.find(ch => 
                              `${ch.gates[0]}-${ch.gates[1]}` === channel || 
                              `${ch.gates[1]}-${ch.gates[0]}` === channel
                            );
                            return (
                              <Chip
                                key={idx}
                                label={channelInfo ? `Kanal ${channel}: ${channelInfo.name}` : `Kanal ${channel}`}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 0, 0, 0.1)',
                                  color: '#ff6b6b',
                                  fontSize: '0.7rem',
                                  mr: 0.5,
                                  mb: 0.5,
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.7,
                        }}
                      >
                        {selectedData.keyTheme}
                      </Typography>
                    </Card>
                  </Grid>
                )}

                {/* Archetyp */}
                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1), rgba(140, 29, 4, 0.1))',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 2,
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#F29F05',
                        fontWeight: 700,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Star size={20} />
                      Archetyp & Schlüsselthema
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#fff',
                        fontStyle: 'italic',
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                      }}
                    >
                      "{selectedData.archetype}"
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* Zurück-Button */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            onClick={() => router.push('/human-design-chart')}
            variant="outlined"
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            ← Zurück zum Chart
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


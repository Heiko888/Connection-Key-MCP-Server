"use client";
import React, { useState } from 'react';
import { Typography, Card, CardContent, Box, Button, Paper, Chip, Tabs, Tab, Grid, TextField, InputAdornment } from '@mui/material';
import { Search, Zap, Eye, Crown, Shield, Target, Star, Circle, ChevronDown, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

interface Channel {
  id: string;
  name: string;
  germanName: string;
  description: string;
  fromGate: number;
  toGate: number;
  fromCenter: string;
  toCenter: string;
  keywords: string[];
  energy: string;
  manifestation: string;
  color: string;
  icon: React.ReactNode;
}

export default function ChannelsPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const channels: Channel[] = [
    {
      id: '1-8',
      name: 'Inspiration Channel',
      germanName: 'Inspirations-Kanal',
      description: 'Der Kanal der Inspiration verbindet das G-Zentrum mit dem Kehl-Zentrum und manifestiert kreative Führung.',
      fromGate: 1,
      toGate: 8,
      fromCenter: 'G Center',
      toCenter: 'Throat Center',
      keywords: ['Inspiration', 'Kreativität', 'Führung', 'Manifestation', 'Ausdruck'],
      energy: 'Kreative Führungsenergie, die durch natürliche Inspiration manifestiert wird.',
      manifestation: 'Natürliche Führung durch kreative Inspiration und authentischen Ausdruck.',
      color: '#10b981',
      icon: <Zap size={24} />
    },
    {
      id: '2-14',
      name: 'The Channel of the Beat',
      germanName: 'Kanal des Rhythmus',
      description: 'Der Kanal des Rhythmus verbindet das G-Zentrum mit dem Sakral-Zentrum und schafft natürliche Führung.',
      fromGate: 2,
      toGate: 14,
      fromCenter: 'G Center',
      toCenter: 'Sacral Center',
      keywords: ['Rhythmus', 'Führung', 'Energie', 'Timing', 'Natur'],
      energy: 'Rhythmische Führungsenergie, die durch natürliche Timing und Energie fließt.',
      manifestation: 'Natürliche Führung durch rhythmische Energie und perfektes Timing.',
      color: '#3b82f6',
      icon: <Target size={24} />
    },
    {
      id: '3-60',
      name: 'Mutation Channel',
      germanName: 'Mutations-Kanal',
      description: 'Der Mutations-Kanal verbindet das Sakral-Zentrum mit dem Wurzel-Zentrum und schafft evolutionäre Veränderung.',
      fromGate: 3,
      toGate: 60,
      fromCenter: 'Sacral Center',
      toCenter: 'Root Center',
      keywords: ['Mutation', 'Veränderung', 'Evolution', 'Innovation', 'Wachstum'],
      energy: 'Mutationsenergie, die evolutionäre Veränderung und Innovation antreibt.',
      manifestation: 'Evolutionäre Veränderung durch natürliche Mutation und Innovation.',
      color: '#f59e0b',
      icon: <Star size={24} />
    },
    {
      id: '4-63',
      name: 'Logic Channel',
      germanName: 'Logik-Kanal',
      description: 'Der Logik-Kanal verbindet das Ajna-Zentrum mit dem Kopf-Zentrum und schafft mentale Klarheit.',
      fromGate: 4,
      toGate: 63,
      fromCenter: 'Ajna Center',
      toCenter: 'Head Center',
      keywords: ['Logik', 'Klarheit', 'Mental', 'Verstehen', 'Weisheit'],
      energy: 'Logische Energie, die mentale Klarheit und Verstehen schafft.',
      manifestation: 'Mentale Klarheit durch logisches Denken und natürliches Verstehen.',
      color: '#8b5cf6',
      icon: <Eye size={24} />
    },
    {
      id: '5-15',
      name: 'Rhythm Channel',
      germanName: 'Rhythmus-Kanal',
      description: 'Der Rhythmus-Kanal verbindet das Sakral-Zentrum mit dem G-Zentrum und schafft natürliche Führung.',
      fromGate: 5,
      toGate: 15,
      fromCenter: 'Sacral Center',
      toCenter: 'G Center',
      keywords: ['Rhythmus', 'Führung', 'Natur', 'Timing', 'Energie'],
      energy: 'Rhythmische Führungsenergie, die durch natürliche Timing fließt.',
      manifestation: 'Natürliche Führung durch rhythmische Energie und perfektes Timing.',
      color: '#06b6d4',
      icon: <Circle size={24} />
    },
    {
      id: '6-59',
      name: 'Intimacy Channel',
      germanName: 'Intimacy-Kanal',
      description: 'Der Intimacy-Kanal verbindet das Sakral-Zentrum mit dem Solarplexus-Zentrum und schafft emotionale Verbindung.',
      fromGate: 6,
      toGate: 59,
      fromCenter: 'Sacral Center',
      toCenter: 'Solar Plexus Center',
      keywords: ['Intimität', 'Emotion', 'Verbindung', 'Beziehung', 'Empathie'],
      energy: 'Intimationsenergie, die emotionale Verbindung und Empathie schafft.',
      manifestation: 'Emotionale Verbindung durch natürliche Intimität und Empathie.',
      color: '#ef4444',
      icon: <Heart size={24} />
    },
    {
      id: '7-31',
      name: 'The Alpha Channel',
      germanName: 'Alpha-Kanal',
      description: 'Der Alpha-Kanal verbindet das G-Zentrum mit dem Kehl-Zentrum und schafft natürliche Führung.',
      fromGate: 7,
      toGate: 31,
      fromCenter: 'G Center',
      toCenter: 'Throat Center',
      keywords: ['Alpha', 'Führung', 'Manifestation', 'Ausdruck', 'Autorität'],
      energy: 'Alpha-Führungsenergie, die natürliche Autorität und Manifestation schafft.',
      manifestation: 'Natürliche Führung durch Alpha-Energie und authentische Autorität.',
      color: '#84cc16',
      icon: <Crown size={24} />
    },
    {
      id: '9-52',
      name: 'Concentration Channel',
      germanName: 'Konzentrations-Kanal',
      description: 'Der Konzentrations-Kanal verbindet das Sakral-Zentrum mit dem Milz-Zentrum und schafft fokussierte Energie.',
      fromGate: 9,
      toGate: 52,
      fromCenter: 'Sacral Center',
      toCenter: 'Spleen Center',
      keywords: ['Konzentration', 'Fokus', 'Energie', 'Intuition', 'Stärke'],
      energy: 'Konzentrationsenergie, die fokussierte Kraft und intuitive Stärke schafft.',
      manifestation: 'Fokussierte Energie durch natürliche Konzentration und intuitive Stärke.',
      color: '#f97316',
      icon: <Shield size={24} />
    }
  ];

  // Füge weitere Channels hinzu (vereinfacht für Demo)
  const channelNumbers = [
    '10-20', '11-56', '12-22', '13-33', '16-48', '17-62', '18-58', '19-49',
    '20-34', '21-45', '23-43', '24-61', '25-51', '26-44', '27-50', '28-38',
    '29-46', '30-41', '32-54', '35-36', '37-40', '39-55', '42-53', '47-64',
    '57-20', '58-18', '60-3', '61-24', '62-17', '63-4', '64-47'
  ];

  channelNumbers.forEach((channelId, index) => {
    const [fromGate, toGate] = channelId.split('-').map(Number);
    channels.push({
      id: channelId,
      name: `Channel ${channelId}`,
      germanName: `Kanal ${channelId}`,
      description: `Der Kanal ${channelId} verbindet Tor ${fromGate} mit Tor ${toGate} und schafft eine spezifische energetische Verbindung.`,
      fromGate,
      toGate,
      fromCenter: ['G Center', 'Sacral Center', 'Ajna Center', 'Head Center', 'Throat Center', 'Heart Center', 'Solar Plexus Center', 'Spleen Center', 'Root Center'][fromGate % 9],
      toCenter: ['G Center', 'Sacral Center', 'Ajna Center', 'Head Center', 'Throat Center', 'Heart Center', 'Solar Plexus Center', 'Spleen Center', 'Root Center'][toGate % 9],
      keywords: ['Energie', 'Verbindung', 'Manifestation', 'Ausdruck', 'Kraft'],
      energy: `Energetische Verbindung zwischen Tor ${fromGate} und Tor ${toGate}.`,
      manifestation: `Manifestation durch die energetische Verbindung von Tor ${fromGate} zu Tor ${toGate}.`,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#ec4899', '#14b8a6'][index % 10],
      icon: <Zap size={24} />
    });
  });

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.germanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
    channel.id.includes(searchTerm)
  );

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
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
      {/* Animierte Sterne im Hintergrund */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.8 + 0.2,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
      {/* Animierte Planeten-Orbits */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${20 + i * 20}%`,
            top: `${10 + i * 15}%`,
            pointerEvents: 'none',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {/* Pulsierende Planeten */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${20 + i * 10}px`,
            height: `${20 + i * 10}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
      
      <PageLayout activePage="bodygraph" showLogo={true} maxWidth="lg">

        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Link href="/grundlagen-hd" passHref>
            <Button
              variant="outlined"
              startIcon={<ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#F29F05',
                  backgroundColor: 'rgba(242, 159, 5, 0.1)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Zap size={32} color="#F29F05" fill="#F29F05" />
            <Typography variant="h2" sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              Die 36 Channels
            </Typography>
            <Zap size={32} color="#F29F05" fill="#F29F05" />
          </Box>
          <Typography variant="h6" sx={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            fontWeight: 300
          }}>
            Entdecke alle 36 Human Design Channels und ihre energetischen Verbindungen
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Suche nach Channels, Namen oder Schlüsselwörtern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  background: 'rgba(255, 255, 255, 0.12)'
                },
                '&.Mui-focused': {
                  borderColor: '#F29F05',
                  background: 'rgba(255, 255, 255, 0.12)'
                }
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: { xs: '0.95rem', md: '1rem' },
                py: { xs: 1.5, md: 1.25 },
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="#F29F05" size={20} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Channels Grid */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {filteredChannels.map((channel) => (
                <Card
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: selectedChannel?.id === channel.id 
                      ? '2px solid #F29F05' 
                      : '1px solid rgba(242, 159, 5, 0.25)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                      background: 'rgba(255, 255, 255, 0.12)'
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
                      background: `linear-gradient(135deg, ${channel.color}, ${channel.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {channel.icon}
                    </Box>
                    
                    <Typography variant="h4" sx={{
                      color: channel.color,
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {channel.id}
                    </Typography>
                    
                    <Typography variant="h6" sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}>
                      {channel.germanName}
                    </Typography>
                    
                    <Typography variant="body2" sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: { xs: '0.75rem', md: '0.8rem' }
                    }}>
                      {channel.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        label={`${channel.fromGate}`}
                        size="small"
                        sx={{
                          background: 'rgba(242, 159, 5, 0.15)',
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      />
                      <ArrowRight size={16} color="#F29F05" />
                      <Chip
                        label={`${channel.toGate}`}
                        size="small"
                        sx={{
                          background: 'rgba(140, 29, 4, 0.15)',
                          color: '#8C1D04',
                          border: '1px solid rgba(140, 29, 4, 0.3)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <Typography sx={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      lineHeight: 1.6,
                      mb: 2
                    }}>
                      {channel.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {channel.keywords.slice(0, 2).map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          sx={{
                            background: 'rgba(242, 159, 5, 0.12)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(242, 159, 5, 0.25)',
                            fontSize: '0.7rem',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Channel Details */}
          <Grid item xs={12} md={4}>
            {selectedChannel ? (
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                border: '1px solid rgba(242, 159, 5, 0.30)',
                position: 'sticky',
                top: 24,
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(242, 159, 5, 0.40)',
                  boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)'
                }
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
                      background: `linear-gradient(135deg, ${selectedChannel.color}, ${selectedChannel.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {selectedChannel.icon}
                    </Box>
                    
                    <Typography variant="h2" sx={{
                      background: `linear-gradient(135deg, ${selectedChannel.color}, ${selectedChannel.color}80)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}>
                      {selectedChannel.id}
                    </Typography>
                    
                    <Typography variant="h4" sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.5rem', md: '1.75rem' }
                    }}>
                      {selectedChannel.germanName}
                    </Typography>
                    
                    <Typography variant="body1" sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontWeight: 600,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: { xs: '0.85rem', md: '0.9rem' }
                    }}>
                      {selectedChannel.name}
                    </Typography>
                  </Box>

                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                      '& .MuiTab-root': {
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        '&.Mui-selected': {
                          color: '#F29F05'
                        },
                        '&:hover': {
                          color: 'rgba(255,255,255,0.9)'
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#F29F05',
                        height: 3
                      }
                    }}
                  >
                    <Tab label="Übersicht" />
                    <Tab label="Energie" />
                    <Tab label="Verbindung" />
                  </Tabs>

                  <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && (
                      <Box>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: 1.7,
                          mb: 3,
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}>
                          {selectedChannel.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Chip
                              label={`Tor ${selectedChannel.fromGate}`}
                              sx={{
                                background: 'rgba(242, 159, 5, 0.15)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.3)',
                                mb: 1,
                                fontWeight: 600
                              }}
                            />
                            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                              {selectedChannel.fromCenter}
                            </Typography>
                          </Box>
                          <ArrowRight size={24} color="#F29F05" />
                          <Box sx={{ textAlign: 'center' }}>
                            <Chip
                              label={`Tor ${selectedChannel.toGate}`}
                              sx={{
                                background: 'rgba(140, 29, 4, 0.15)',
                                color: '#8C1D04',
                                border: '1px solid rgba(140, 29, 4, 0.3)',
                                mb: 1,
                                fontWeight: 600
                              }}
                            />
                            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                              {selectedChannel.toCenter}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="h6" sx={{ 
                          color: '#F29F05', 
                          mb: 2,
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Schlüsselwörter
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedChannel.keywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              sx={{
                                background: 'rgba(242, 159, 5, 0.12)',
                                color: 'rgba(255,255,255,0.9)',
                                border: '1px solid rgba(242, 159, 5, 0.25)',
                                m: 0.5,
                                fontWeight: 500
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {activeTab === 1 && (
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: '#F29F05', 
                          mb: 2,
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Energetische Qualität
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: 1.7,
                          mb: 3,
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}>
                          {selectedChannel.energy}
                        </Typography>
                        
                        <Typography variant="h6" sx={{ 
                          color: '#F29F05', 
                          mb: 2,
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Manifestation
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}>
                          {selectedChannel.manifestation}
                        </Typography>
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: '#F29F05', 
                          mb: 2,
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Zentren-Verbindung
                        </Typography>
                        
                        <Box sx={{ mb: 3, p: 2, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 2, border: '1px solid rgba(242, 159, 5, 0.15)' }}>
                          <Typography variant="subtitle1" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                            Von: {selectedChannel.fromCenter}
                          </Typography>
                          <Typography sx={{
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: 1.6,
                            mb: 2,
                            fontSize: { xs: '0.9rem', md: '0.95rem' }
                          }}>
                            Tor {selectedChannel.fromGate} im {selectedChannel.fromCenter} initiiert die energetische Verbindung.
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3, p: 2, background: 'rgba(140, 29, 4, 0.08)', borderRadius: 2, border: '1px solid rgba(140, 29, 4, 0.15)' }}>
                          <Typography variant="subtitle1" sx={{ color: '#8C1D04', fontWeight: 700, mb: 1 }}>
                            Zu: {selectedChannel.toCenter}
                          </Typography>
                          <Typography sx={{
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: 1.6,
                            mb: 2,
                            fontSize: { xs: '0.9rem', md: '0.95rem' }
                          }}>
                            Tor {selectedChannel.toGate} im {selectedChannel.toCenter} empfängt und manifestiert die Energie.
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" sx={{ 
                          color: '#F29F05', 
                          mb: 2,
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Energetische Auswirkung
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.85)',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}>
                          Diese Verbindung schafft eine definierte energetische Qualität, die konstant und zuverlässig in der Persönlichkeit manifestiert wird.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Paper sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.25)',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)'
              }}>
                <Zap size={48} color="#F29F05" style={{ marginBottom: 16, opacity: 0.6 }} />
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 500
                }}>
                  Wähle einen Kanal aus, um mehr zu erfahren
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </PageLayout>
    </Box>
  );
}

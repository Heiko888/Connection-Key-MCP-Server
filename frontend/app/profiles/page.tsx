"use client";
import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, Box, Button, Paper, Chip, Tabs, Tab, Grid } from '@mui/material';
import { User, Star, Heart, Brain, Target, Users, Zap, Shield, Eye, Crown, ArrowRight } from 'lucide-react';
import AnimatedStars from '@/components/AnimatedStars';

interface Profile {
  id: string;
  name: string;
  number: string;
  description: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  lifePurpose: string;
  relationships: string;
  career: string;
  color: string;
  icon: React.ReactNode;
}

export default function ProfilesPage() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const profiles: Profile[] = [
    {
      id: '1/3',
      name: 'Der Forscher',
      number: '1/3',
      description: 'Ein tiefgründiger Forscher, der durch Versuch und Irrtum zu Weisheit gelangt.',
      keywords: ['Forschung', 'Entdeckung', 'Lernen', 'Experimentieren'],
      strengths: ['Tiefgründige Analyse', 'Praktische Erfahrung', 'Wissensvermittlung', 'Authentische Führung'],
      challenges: ['Perfektionismus', 'Angst vor Fehlern', 'Überanalyse', 'Vertrauensprobleme'],
      lifePurpose: 'Durch Forschung und Experimente fundamentales Wissen zu schaffen und es authentisch weiterzugeben.',
      relationships: 'Braucht Zeit, um Vertrauen aufzubauen. Sucht nach tiefen, bedeutungsvollen Verbindungen.',
      career: 'Forscher, Lehrer, Berater, Wissenschaftler, Pionier in neuen Bereichen',
      color: '#10b981',
      icon: <Brain size={24} />
    },
    {
      id: '1/4',
      name: 'Der Opportunist',
      number: '1/4',
      description: 'Ein weiser Opportunist, der durch Netzwerke und Beziehungen Erfolg findet.',
      keywords: ['Netzwerk', 'Opportunität', 'Beziehungen', 'Weisheit'],
      strengths: ['Netzwerkaufbau', 'Opportunitäten erkennen', 'Weisheit teilen', 'Vertrauenswürdigkeit'],
      challenges: ['Abhängigkeit von anderen', 'Angst vor Ablehnung', 'Überlastung', 'Identitätskrisen'],
      lifePurpose: 'Durch Netzwerke und Beziehungen Weisheit zu verbreiten und anderen zu helfen.',
      relationships: 'Baut tiefe, langfristige Beziehungen auf. Braucht ein starkes Unterstützungsnetzwerk.',
      career: 'Netzwerker, Berater, Mentor, Verkäufer, Beziehungsmanager',
      color: '#3b82f6',
      icon: <Users size={24} />
    },
    {
      id: '2/4',
      name: 'Der Hermit',
      number: '2/4',
      description: 'Ein natürlicher Hermit, der zwischen Einsamkeit und sozialer Verbindung balanciert.',
      keywords: ['Einsamkeit', 'Natürlichkeit', 'Netzwerk', 'Balance'],
      strengths: ['Natürliche Talente', 'Tiefe Einsicht', 'Netzwerkaufbau', 'Authentische Verbindung'],
      challenges: ['Soziale Angst', 'Identitätskrisen', 'Überlastung', 'Unverständnis'],
      lifePurpose: 'Natürliche Talente zu entwickeln und durch Netzwerke Weisheit zu teilen.',
      relationships: 'Braucht Zeit allein, aber auch tiefe Verbindungen. Wählt Beziehungen sorgfältig aus.',
      career: 'Künstler, Schriftsteller, Berater, Therapeut, Netzwerker',
      color: '#8b5cf6',
      icon: <Eye size={24} />
    },
    {
      id: '2/5',
      name: 'Der Mystiker',
      number: '2/5',
      description: 'Ein mystischer Führer, der durch natürliche Talente andere inspiriert.',
      keywords: ['Mystik', 'Führung', 'Inspiration', 'Natürlichkeit'],
      strengths: ['Natürliche Führung', 'Inspirierende Präsenz', 'Mystische Einsicht', 'Problemlösung'],
      challenges: ['Projektionen anderer', 'Angst vor Verantwortung', 'Identitätskrisen', 'Überlastung'],
      lifePurpose: 'Durch natürliche Talente andere zu inspirieren und zu führen.',
      relationships: 'Wird oft idealisiert. Braucht authentische Verbindungen ohne Projektionen.',
      career: 'Führungskraft, Lehrer, Coach, Berater, Inspirator',
      color: '#f59e0b',
      icon: <Crown size={24} />
    },
    {
      id: '3/5',
      name: 'Der Märtyrer',
      number: '3/5',
      description: 'Ein experimenteller Märtyrer, der durch Versuche und Irrtum andere führt.',
      keywords: ['Experiment', 'Märtyrertum', 'Führung', 'Lernen'],
      strengths: ['Experimentelle Führung', 'Problemlösung', 'Resilienz', 'Inspiration'],
      challenges: ['Angst vor Fehlern', 'Projektionen', 'Überlastung', 'Vertrauensprobleme'],
      lifePurpose: 'Durch Experimente und Versuche andere zu führen und zu inspirieren.',
      relationships: 'Wird oft idealisiert. Braucht Verständnis für experimentelle Natur.',
      career: 'Pionier, Innovator, Führungskraft, Problemlöser, Experimentator',
      color: '#ef4444',
      icon: <Target size={24} />
    },
    {
      id: '3/6',
      name: 'Der Role Model',
      number: '3/6',
      description: 'Ein experimentelles Role Model, das durch Erfahrung zur Weisheit gelangt.',
      keywords: ['Experiment', 'Vorbild', 'Weisheit', 'Erfahrung'],
      strengths: ['Experimentelle Weisheit', 'Vorbildfunktion', 'Tiefe Einsicht', 'Inspiration'],
      challenges: ['Angst vor Fehlern', 'Perfektionismus', 'Überlastung', 'Identitätskrisen'],
      lifePurpose: 'Durch Experimente und Erfahrung ein Vorbild für andere zu werden.',
      relationships: 'Wird als Vorbild gesehen. Braucht authentische Verbindungen.',
      career: 'Mentor, Lehrer, Berater, Vorbild, Weisheitsvermittler',
      color: '#06b6d4',
      icon: <Star size={24} />
    },
    {
      id: '4/6',
      name: 'Der Opportunist',
      number: '4/6',
      description: 'Ein weiser Opportunist, der durch Netzwerke und Beziehungen andere inspiriert.',
      keywords: ['Netzwerk', 'Opportunität', 'Vorbild', 'Weisheit'],
      strengths: ['Netzwerkaufbau', 'Opportunitäten erkennen', 'Vorbildfunktion', 'Weisheit teilen'],
      challenges: ['Abhängigkeit von anderen', 'Perfektionismus', 'Überlastung', 'Identitätskrisen'],
      lifePurpose: 'Durch Netzwerke und Beziehungen ein Vorbild zu sein und Weisheit zu teilen.',
      relationships: 'Baut tiefe, langfristige Beziehungen auf. Wird als Vorbild gesehen.',
      career: 'Netzwerker, Mentor, Berater, Vorbild, Beziehungsmanager',
      color: '#84cc16',
      icon: <Heart size={24} />
    },
    {
      id: '4/1',
      name: 'Der Opportunist',
      number: '4/1',
      description: 'Ein weiser Opportunist, der durch Netzwerke fundamentales Wissen schafft.',
      keywords: ['Netzwerk', 'Opportunität', 'Forschung', 'Weisheit'],
      strengths: ['Netzwerkaufbau', 'Opportunitäten erkennen', 'Fundamentales Wissen', 'Weisheit teilen'],
      challenges: ['Abhängigkeit von anderen', 'Angst vor Fehlern', 'Überlastung', 'Vertrauensprobleme'],
      lifePurpose: 'Durch Netzwerke fundamentales Wissen zu schaffen und zu teilen.',
      relationships: 'Baut tiefe, langfristige Beziehungen auf. Braucht ein starkes Unterstützungsnetzwerk.',
      career: 'Netzwerker, Forscher, Berater, Mentor, Wissensvermittler',
      color: '#f97316',
      icon: <Zap size={24} />
    },
    {
      id: '5/1',
      name: 'Der General',
      number: '5/1',
      description: 'Ein universeller General, der durch Führung fundamentales Wissen schafft.',
      keywords: ['Führung', 'Universell', 'Forschung', 'Problemlösung'],
      strengths: ['Universelle Führung', 'Problemlösung', 'Fundamentales Wissen', 'Inspiration'],
      challenges: ['Projektionen anderer', 'Angst vor Fehlern', 'Überlastung', 'Vertrauensprobleme'],
      lifePurpose: 'Durch universelle Führung fundamentales Wissen zu schaffen.',
      relationships: 'Wird oft idealisiert. Braucht Verständnis für universelle Natur.',
      career: 'Führungskraft, General, Problemlöser, Forscher, Inspirator',
      color: '#ec4899',
      icon: <Shield size={24} />
    },
    {
      id: '5/2',
      name: 'Der General',
      number: '5/2',
      description: 'Ein universeller General, der durch Führung natürliche Talente entwickelt.',
      keywords: ['Führung', 'Universell', 'Natürlichkeit', 'Problemlösung'],
      strengths: ['Universelle Führung', 'Problemlösung', 'Natürliche Talente', 'Inspiration'],
      challenges: ['Projektionen anderer', 'Identitätskrisen', 'Überlastung', 'Soziale Angst'],
      lifePurpose: 'Durch universelle Führung natürliche Talente zu entwickeln.',
      relationships: 'Wird oft idealisiert. Braucht Zeit allein und Verständnis.',
      career: 'Führungskraft, General, Problemlöser, Künstler, Inspirator',
      color: '#a855f7',
      icon: <User size={24} />
    },
    {
      id: '6/2',
      name: 'Das Role Model',
      number: '6/2',
      description: 'Ein weises Role Model, das durch Erfahrung natürliche Talente entwickelt.',
      keywords: ['Vorbild', 'Weisheit', 'Natürlichkeit', 'Erfahrung'],
      strengths: ['Weise Führung', 'Vorbildfunktion', 'Natürliche Talente', 'Inspiration'],
      challenges: ['Perfektionismus', 'Identitätskrisen', 'Überlastung', 'Soziale Angst'],
      lifePurpose: 'Durch Weisheit und Erfahrung natürliche Talente zu entwickeln.',
      relationships: 'Wird als Vorbild gesehen. Braucht Zeit allein und authentische Verbindungen.',
      career: 'Mentor, Vorbild, Lehrer, Künstler, Weisheitsvermittler',
      color: '#14b8a6',
      icon: <Star size={24} />
    },
    {
      id: '6/3',
      name: 'Das Role Model',
      number: '6/3',
      description: 'Ein weises Role Model, das durch Erfahrung und Experimente andere führt.',
      keywords: ['Vorbild', 'Weisheit', 'Experiment', 'Führung'],
      strengths: ['Weise Führung', 'Vorbildfunktion', 'Experimentelle Weisheit', 'Inspiration'],
      challenges: ['Perfektionismus', 'Angst vor Fehlern', 'Überlastung', 'Vertrauensprobleme'],
      lifePurpose: 'Durch Weisheit und Erfahrung andere zu führen und zu inspirieren.',
      relationships: 'Wird als Vorbild gesehen. Braucht Verständnis für experimentelle Natur.',
      career: 'Mentor, Vorbild, Lehrer, Führungskraft, Weisheitsvermittler',
      color: '#f43f5e',
      icon: <ArrowRight size={24} />
    }
  ];

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveTab(0);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0d12 0%, #1a1f2b 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatedStars />
      
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <User size={32} color="#d8b35c" />
            <Typography variant="h2" sx={{
              color: '#f5f2ea',
              fontWeight: 800,
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}>
              Die 12 Profile
            </Typography>
            <User size={32} color="#d8b35c" />
          </Box>
          <Typography variant="h6" sx={{
            color: 'rgba(245,242,234,0.8)',
            fontSize: { xs: '1.1rem', md: '1.3rem' }
          }}>
            Entdecke die 12 Human Design Profile und ihre einzigartigen Eigenschaften
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Grid */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(11,13,18,0.9) 0%, rgba(26,31,43,0.95) 100%)',
                    borderRadius: 3,
                    border: selectedProfile?.id === profile.id ? '2px solid #d8b35c' : '1px solid rgba(216,179,92,0.2)',
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
                      background: `linear-gradient(135deg, ${profile.color}, ${profile.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {profile.icon}
                    </Box>
                    
                    <Typography variant="h6" sx={{
                      color: '#f5f2ea',
                      fontWeight: 600,
                      mb: 1
                    }}>
                      {profile.name}
                    </Typography>
                    
                    <Typography variant="h4" sx={{
                      color: profile.color,
                      fontWeight: 700,
                      mb: 2
                    }}>
                      {profile.number}
                    </Typography>
                    
                    <Typography sx={{
                      color: 'rgba(245,242,234,0.8)',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      mb: 2
                    }}>
                      {profile.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {profile.keywords.slice(0, 2).map((keyword, index) => (
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

          {/* Profile Details */}
          <Grid item xs={12} md={4}>
            {selectedProfile ? (
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
                      background: `linear-gradient(135deg, ${selectedProfile.color}, ${selectedProfile.color}80)`,
                      margin: '0 auto 16px',
                      color: '#fff'
                    }}>
                      {selectedProfile.icon}
                    </Box>
                    
                    <Typography variant="h4" sx={{
                      color: '#f5f2ea',
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {selectedProfile.name}
                    </Typography>
                    
                    <Typography variant="h2" sx={{
                      color: selectedProfile.color,
                      fontWeight: 800,
                      mb: 2
                    }}>
                      {selectedProfile.number}
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
                    <Tab label="Details" />
                    <Tab label="Karriere" />
                  </Tabs>

                  <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && (
                      <Box>
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.9)',
                          lineHeight: 1.6,
                          mb: 3
                        }}>
                          {selectedProfile.description}
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Stärken
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          {selectedProfile.strengths.map((strength, index) => (
                            <Chip
                              key={index}
                              label={strength}
                              sx={{
                                background: 'rgba(16,185,129,0.1)',
                                color: '#10b981',
                                border: '1px solid rgba(16,185,129,0.3)',
                                m: 0.5
                              }}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Herausforderungen
                        </Typography>
                        <Box>
                          {selectedProfile.challenges.map((challenge, index) => (
                            <Chip
                              key={index}
                              label={challenge}
                              sx={{
                                background: 'rgba(239,68,68,0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239,68,68,0.3)',
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
                          Lebenszweck
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.9)',
                          lineHeight: 1.6,
                          mb: 3
                        }}>
                          {selectedProfile.lifePurpose}
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Beziehungen
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.9)',
                          lineHeight: 1.6,
                          mb: 3
                        }}>
                          {selectedProfile.relationships}
                        </Typography>
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ color: '#d8b35c', mb: 2 }}>
                          Karriere-Empfehlungen
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(245,242,234,0.9)',
                          lineHeight: 1.6
                        }}>
                          {selectedProfile.career}
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
                <User size={48} color="rgba(216,179,92,0.5)" style={{ marginBottom: 16 }} />
                <Typography sx={{ color: 'rgba(245,242,234,0.7)', fontSize: '1.1rem' }}>
                  Wähle ein Profil aus, um mehr zu erfahren
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

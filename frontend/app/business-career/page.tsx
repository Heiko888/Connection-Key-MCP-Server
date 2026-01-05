"use client";

import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Avatar,
  Button
} from '@mui/material';
import { 
  Briefcase, 
  Users, 
  Crown, 
  Rocket,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Zap,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CareerGuidance {
  idealRoles: string[];
  workStyle: string;
  environment: string;
  challenges: string[];
  opportunities: string[];
  salaryRange: string;
  growthPath: string[];
}

interface TeamDynamics {
  role: string;
  strengths: string[];
  contributions: string[];
  communicationStyle: string;
  conflictResolution: string;
  leadershipStyle: string;
}

interface LeadershipStyle {
  type: string;
  description: string;
  strengths: string[];
  challenges: string[];
  development: string[];
  examples: string[];
}

interface Entrepreneurship {
  potential: number;
  strengths: string[];
  challenges: string[];
  businessTypes: string[];
  timing: string;
  advice: string[];
}

function BusinessCareerContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [career, setCareer] = useState<CareerGuidance | null>(null);
  const [team, setTeam] = useState<TeamDynamics | null>(null);
  const [leadership, setLeadership] = useState<LeadershipStyle | null>(null);
  const [entrepreneurship, setEntrepreneurship] = useState<Entrepreneurship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Mock-Daten für Demo
      const mockCareer: CareerGuidance = {
        idealRoles: [
          'Projektmanager',
          'Berater',
          'Coach',
          'Unternehmer',
          'Führungskraft'
        ],
        workStyle: 'Strategisch und visionär - Du arbeitest am besten in einer Umgebung, die dir Autonomie und kreative Freiheit gibt.',
        environment: 'Flexible Arbeitszeiten, kreative Freiheit, direkter Einfluss auf Entscheidungen',
        challenges: [
          'Geduld mit langsameren Prozessen',
          'Kompromisse eingehen',
          'Detailarbeit delegieren'
        ],
        opportunities: [
          'Führungspositionen',
          'Eigene Projekte starten',
          'Mentoring und Coaching',
          'Strategische Beratung'
        ],
        salaryRange: '€60.000 - €120.000+',
        growthPath: [
          'Junior Position → Senior Position',
          'Team Lead → Abteilungsleiter',
          'Unternehmer → CEO',
          'Berater → Partner'
        ]
      };

      const mockTeam: TeamDynamics = {
        role: 'Visionärer Leader',
        strengths: [
          'Strategisches Denken',
          'Menschen motivieren',
          'Große Visionen entwickeln',
          'Innovation vorantreiben'
        ],
        contributions: [
          'Langfristige Strategien entwickeln',
          'Team motivieren und inspirieren',
          'Neue Ideen und Konzepte einbringen',
          'Externe Beziehungen aufbauen'
        ],
        communicationStyle: 'Direkt und inspirierend - Du kommunizierst am besten durch Visionen und große Ideen.',
        conflictResolution: 'Proaktiv und lösungsorientiert - Du gehst Konflikte direkt an und suchst nach konstruktiven Lösungen.',
        leadershipStyle: 'Transformational - Du führst durch Inspiration und Vision, nicht durch Kontrolle.'
      };

      const mockLeadership: LeadershipStyle = {
        type: 'Transformational Leader',
        description: 'Du führst durch Inspiration, Vision und persönliche Transformation. Du motivierst andere, über sich hinauszuwachsen.',
        strengths: [
          'Visionäre Führung',
          'Menschen entwickeln',
          'Innovation fördern',
          'Kulturen transformieren'
        ],
        challenges: [
          'Operative Details',
          'Mikromanagement',
          'Geduld mit langsamen Prozessen',
          'Kompromisse eingehen'
        ],
        development: [
          'Delegationsfähigkeiten verbessern',
          'Operative Prozesse verstehen',
          'Geduld kultivieren',
          'Kommunikationsfähigkeiten verfeinern'
        ],
        examples: [
          'Steve Jobs - Apple',
          'Elon Musk - Tesla/SpaceX',
          'Oprah Winfrey - Media Empire',
          'Richard Branson - Virgin Group'
        ]
      };

      const mockEntrepreneurship: Entrepreneurship = {
        potential: 85,
        strengths: [
          'Visionäre Führung',
          'Risikobereitschaft',
          'Innovation',
          'Netzwerkaufbau',
          'Strategisches Denken'
        ],
        challenges: [
          'Operative Details',
          'Finanzmanagement',
          'Geduld mit langsamen Wachstum',
          'Mikromanagement vermeiden'
        ],
        businessTypes: [
          'Beratungsunternehmen',
          'Tech-Startups',
          'Coaching/Personal Development',
          'Innovative Produkte',
          'Service-orientierte Unternehmen'
        ],
        timing: 'Jetzt ist ein guter Zeitpunkt, um neue Projekte zu starten. Die kosmischen Transite unterstützen Innovation und Wachstum.',
        advice: [
          'Beginne mit einem MVP (Minimum Viable Product)',
          'Baue ein starkes Team auf',
          'Fokussiere dich auf deine Stärken',
          'Delegiere operative Aufgaben',
          'Investiere in deine persönliche Entwicklung'
        ]
      };

      setCareer(mockCareer);
      setTeam(mockTeam);
      setLeadership(mockLeadership);
      setEntrepreneurship(mockEntrepreneurship);
    } catch (err) {
      setError('Fehler beim Laden der Business-Daten');
      console.error('Error loading business data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: { xs: 4, md: 6 }
          }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(135deg, #ff6b9d, #c44569, #4ecdc4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                textShadow: '0 0 30px rgba(255, 107, 157, 0.3)'
              }}
            >
              💼 Business & Karriere
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 3,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Entdecke dein berufliches Potential basierend auf deinem Human Design - Karriere-Guidance, Team-Dynamiken und Entrepreneurship.
            </Typography>
          </Box>
        </motion.div>

        {/* Tabs */}
        <Card sx={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          mb: 4
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#FFD700'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700'
              }
            }}
          >
            <Tab label="Karriere-Guidance" icon={<Briefcase size={20} />} />
            <Tab label="Team-Dynamiken" icon={<Users size={20} />} />
            <Tab label="Führungsstil" icon={<Crown size={20} />} />
            <Tab label="Entrepreneurship" icon={<Rocket size={20} />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && career && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700, mb: 3 }}>
                Karriere-Guidance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Ideale Rollen
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {career.idealRoles.map((role, index) => (
                      <Chip 
                        key={index}
                        label={role}
                        sx={{ 
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Arbeitsstil
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                    {career.workStyle}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Ideale Umgebung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {career.environment}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Gehaltsspanne
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700, mb: 3 }}>
                    {career.salaryRange}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Wachstumspfad
                  </Typography>
                  <List>
                    {career.growthPath.map((step, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <TrendingUp size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={step}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Herausforderungen
                  </Typography>
                  <List>
                    {career.challenges.map((challenge, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={challenge}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Chancen
                  </Typography>
                  <List>
                    {career.opportunities.map((opportunity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={opportunity}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {activeTab === 1 && team && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 700, mb: 3 }}>
                Team-Dynamiken
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  mr: 2,
                  width: 60,
                  height: 60
                }}>
                  <Crown size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {team.role}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Deine Rolle im Team
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Stärken
                  </Typography>
                  <List>
                    {team.strengths.map((strength, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#8b5cf6" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={strength}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Beiträge
                  </Typography>
                  <List>
                    {team.contributions.map((contribution, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Target size={20} color="#8b5cf6" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={contribution}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Kommunikation
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {team.communicationStyle}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Konfliktlösung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {team.conflictResolution}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Führungsstil
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {team.leadershipStyle}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {activeTab === 2 && leadership && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700, mb: 3 }}>
                Führungsstil: {leadership.type}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}>
                {leadership.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Stärken
                  </Typography>
                  <List>
                    {leadership.strengths.map((strength, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={strength}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Herausforderungen
                  </Typography>
                  <List>
                    {leadership.challenges.map((challenge, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={challenge}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Entwicklung
                  </Typography>
                  <List>
                    {leadership.development.map((dev, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <TrendingUp size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={dev}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Beispiele
                  </Typography>
                  <List>
                    {leadership.examples.map((example, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={example}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {activeTab === 3 && entrepreneurship && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700, mb: 3 }}>
                Entrepreneurship Potential
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700, mr: 2 }}>
                  {entrepreneurship.potential}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={entrepreneurship.potential} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)'
                    }
                  }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}>
                {entrepreneurship.timing}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Stärken
                  </Typography>
                  <List>
                    {entrepreneurship.strengths.map((strength, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={strength}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Herausforderungen
                  </Typography>
                  <List>
                    {entrepreneurship.challenges.map((challenge, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={challenge}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                Geschäftstypen
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {entrepreneurship.businessTypes.map((type, index) => (
                  <Chip 
                    key={index}
                    label={type}
                    sx={{ 
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
              
              <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                Empfehlungen
              </Typography>
              <List>
                {entrepreneurship.advice.map((advice, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Lightbulb size={20} color="#ef4444" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={advice}
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </motion.div>
        )}
      </Box>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function BusinessCareerPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <BusinessCareerContent />
    </ProtectedRoute>
  );
}

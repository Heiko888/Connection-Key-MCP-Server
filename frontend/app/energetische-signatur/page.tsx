"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccessControl from '../../components/AccessControl';
import { Container, Typography, Card, CardContent, Box, Button, Paper, Chip, Grid, Tabs, Tab, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Eye, 
  Heart, 
  Crown,
  Target,
  Moon,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import Logo from '../components/Logo';
import ProtectedRoute from '@/components/ProtectedRoute';

function EnergetischeSignaturContent() {
  const router = useRouter();
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          console.log('🔒 Keine Authentifizierung - leite zur Login-Seite weiter');
          router.push('/login');
          return;
        }
        
        setIsAuthenticated(true);
        await loadUserSubscription(userId);
      } catch (error) {
        console.error('Fehler bei der Authentifizierung:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const loadUserSubscription = async (userId: string) => {
    try {
      // Temporärer Fix - SubscriptionService entfernt
      // const subscription = await SubscriptionService.getUserSubscription(userId);
      const subscription = null;
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Fehler beim Laden der Subscription:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `
      }}>
        <CircularProgress size={60} sx={{ color: '#F29F05' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const chartFeatures = [
    {
      icon: <Zap size={24} />,
      title: "Energie-Typen",
      description: "Entdecke deinen einzigartigen Energie-Typ: Generator, Manifestor, Manifestierender Generator, Projektor oder Reflektor",
      color: "#f59e0b",
      details: "Jeder Typ hat eine spezifische Art, Energie zu verwenden und zu manifestieren."
    },
    {
      icon: <Eye size={24} />,
      title: "Autorität",
      description: "Lerne deine natürliche Entscheidungsmethode kennen",
      color: "#10b981",
      details: "Deine innere Autorität zeigt dir, wie du authentische Entscheidungen triffst."
    },
    {
      icon: <Heart size={24} />,
      title: "Strategie",
      description: "Finde deine optimale Lebensstrategie",
      color: "#ef4444",
      details: "Die richtige Strategie hilft dir, im Einklang mit deiner Natur zu leben."
    },
    {
      icon: <Crown size={24} />,
      title: "Profil",
      description: "Verstehe deine Lebensrolle und dein Potenzial",
      color: "#F29F05",
      details: "Dein Profil zeigt deine einzigartige Lebensrolle und dein Potenzial."
    }
  ];

  const humanDesignTypes = [
    {
      name: "Generator",
      percentage: "37%",
      description: "Die Lebenskraft des Planeten",
      strategy: "Warten auf die Antwort",
      authority: "Sakral-Autorität",
      color: "#10b981",
      icon: <Activity size={24} />
    },
    {
      name: "Manifestor",
      percentage: "8%",
      description: "Die Initiatoren",
      strategy: "Informieren",
      authority: "Emotionale oder andere Autorität",
      color: "#ef4444",
      icon: <Zap size={24} />
    },
    {
      name: "Manifestierender Generator",
      percentage: "33%",
      description: "Die dynamischen Macher",
      strategy: "Warten auf die Antwort, dann informieren",
      authority: "Sakral-Autorität",
      color: "#f59e0b",
      icon: <Zap size={24} />
    },
    {
      name: "Projektor",
      percentage: "20%",
      description: "Die natürlichen Führer",
      strategy: "Warten auf die Einladung",
      authority: "Emotionale oder andere Autorität",
      color: "#F29F05",
      icon: <Target size={24} />
    },
    {
      name: "Reflektor",
      percentage: "2%",
      description: "Die Spiegel der Gemeinschaft",
      strategy: "Warten auf den Mondzyklus",
      authority: "Mond-Autorität",
      color: "#06b6d4",
      icon: <Moon size={24} />
    }
  ];

  const centers = [
    { name: "Kopf", color: "#fbbf24", description: "Inspiration und mentaler Druck" },
    { name: "Ajna", color: "#F29F05", description: "Konzeptualisierung und Bewusstsein" },
    { name: "Kehle", color: "#06b6d4", description: "Manifestation und Kommunikation" },
    { name: "G-Zentrum", color: "#10b981", description: "Identität und Richtung" },
    { name: "Herz", color: "#ef4444", description: "Willen und Kraft" },
    { name: "Sakral", color: "#ec4899", description: "Lebenskraft und Sexualität" },
    { name: "Solarplexus", color: "#f97316", description: "Emotionen und Bewusstsein" },
    { name: "Milz", color: "#f59e0b", description: "Intuition und Überleben" },
    { name: "Wurzel", color: "#dc2626", description: "Druck und Adrenalin" }
  ];

  const chartBenefits = [
    "Entdecke deine authentische Persönlichkeit",
    "Verstehe deine Energie und wie du sie optimal nutzt",
    "Finde erfüllende Beziehungen und Verbindungen",
    "Entscheide aus deiner inneren Weisheit heraus",
    "Lebe im Einklang mit natürlichen Zyklen",
    "Wachse durch bewusste Selbsterkenntnis"
  ];

  return (
    <AccessControl 
      path="/energetische-signatur" 
      userSubscription={userSubscription} 
      onUpgrade={() => router.push('/pricing')}
    >
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 6, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <Logo />

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h1" sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              textShadow: '0 0 30px rgba(242, 159, 5, 0.3)',
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Verstehe deine energetische Signatur
            </Typography>
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4
            }}>
              Zentren, Kanäle, Tore und Profile im Detail
            </Typography>
          </Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Navigation Tabs */}
            <Paper sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
              maxWidth: 800,
              mx: 'auto',
              mb: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#F29F05'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    height: 3
                  }
                }}
              >
                <Tab label="Übersicht" />
                <Tab label="Typen" />
                <Tab label="Zentren" />
                <Tab label="Grundlagen" />
              </Tabs>
            </Paper>
          </motion.div>

        {/* Tab Content */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Was ist Human Design */}
          <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
            borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
            mb: 6,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: 6 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Sparkles size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                  Was ist Human Design?
                </Typography>
                <Typography sx={{
                    color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.2rem',
                  lineHeight: 1.8,
                  maxWidth: 900,
                  mx: 'auto'
                }}>
                  Human Design ist eine revolutionäre Wissenschaft, die Astrologie, I Ging, Chakren-System und Quantenphysik vereint. 
                  Es zeigt dir deine einzigartige energetische Blaupause und wie du authentisch leben kannst.
                </Typography>
              </Box>
            </CardContent>
          </Card>

        {/* Chart Features */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {chartFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.15)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.3)',
                        borderColor: '#F29F05'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.2))',
                            border: '2px solid rgba(242, 159, 5, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            color: '#F29F05'
                          }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {feature.title}
                          </Typography>
                        </Box>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          mb: 2
                        }}>
                          {feature.description}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}>
                          {feature.details}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 1 && (
        <motion.div
          
          
            
        >
          <Typography variant="h3" sx={{ 
              color: 'white', 
            textAlign: 'center', 
            fontWeight: 700, 
            mb: 6 
          }}>
              Die 4 Human Design Typen
          </Typography>
          
            <Grid container spacing={3}>
              {humanDesignTypes.map((type, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  
                  
                    
                >
                  <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.15)',
                      p: 3,
                      height: '100%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.3)',
                        borderColor: '#F29F05'
                    }
                  }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{
                          width: 20,
                          height: 20,
                        borderRadius: '50%',
                          background: type.color,
                          marginRight: 2
                        }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {type.name}
                        </Typography>
                        <Chip 
                          label={type.percentage} 
                          size="small"
                          sx={{ 
                            background: type.color,
                            color: 'white',
                            fontWeight: 600,
                            ml: 'auto'
                          }} 
                        />
                      </Box>
                      
                      <Typography sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        mb: 2
                      }}>
                        {type.description}
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
                          Strategie:
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          {type.strategy}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
                          Autorität:
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          {type.authority}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            
            
            
          >
            <Typography variant="h3" sx={{ 
              color: 'white', 
              textAlign: 'center', 
              fontWeight: 700, 
              mb: 6 
            }}>
              Die 9 Energiezentren
            </Typography>
            
            <Grid container spacing={3}>
              {centers.map((center, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    
                    
                    
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.15)',
                      p: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.3)',
                        borderColor: '#F29F05'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: center.color,
                          marginRight: 2
                        }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {center.name}
                      </Typography>
                      </Box>
                      <Typography sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}>
                        {center.description}
                      </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
        )}

        {activeTab === 3 && (
        <motion.div
          
          
            
        >
          <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
            borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
            mb: 6,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h3" sx={{ 
                  color: 'white', 
                textAlign: 'center', 
                fontWeight: 700, 
                mb: 4 
              }}>
                Warum Human Design?
              </Typography>
              <Grid container spacing={3}>
                {chartBenefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      
                      
                        
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <CheckCircle size={24} color="#F29F05" />
                        <Typography sx={{
                            color: 'rgba(255,255,255,0.9)',
                          fontSize: '1.1rem'
                        }}>
                          {benefit}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          
          
          
        >
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 4 
            }}>
              Bereit für deine Reise?
            </Typography>
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 6,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Erstelle jetzt dein kostenloses Human Design Chart und entdecke deine wahre Natur
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                         <Button
               component={Link}
               href="/register"
               variant="contained"
               size="large"
               sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                 fontWeight: 700,
                 px: 6,
                 py: 2,
                 borderRadius: 3,
                 fontSize: '1.2rem',
                 boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                 '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                   transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(242, 159, 5, 0.5)'
                 }
               }}
             >
               Chart erstellen <ArrowRight size={24} style={{ marginLeft: 8 }} />
             </Button>
              
              <Button
                component={Link}
                href="/human-design-chart"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.2rem',
                  '&:hover': {
                    borderColor: '#F29F05',
                    color: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)'
                  }
                }}
              >
                Chart anzeigen
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function ChartInfoPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <EnergetischeSignaturContent />
    </ProtectedRoute>
  );
}


"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Crown,
  Star,
  Zap,
  Check,
  Users,
  Settings,
  MessageCircle,
  Sparkles,
  Target
} from 'lucide-react';
import { createCheckoutSession, PACKAGE_TO_PRICE_ID, handleStripeError } from '@/lib/stripe/client';
import PageLayout from '../components/PageLayout';

const packageData = [
  {
    id: 'basic',
    name: 'Basis',
    price: 9.99,
    period: 'pro Monat',
    icon: <Star size={32} />,
    color: '#F29F05',
    features: [
      'Human Design Chart',
      'Grundlegende Analysen',
      'Mondkalender',
      'Community-Zugang',
      'Mobile App'
    ],
    popular: true,
    description: 'Perfekt für den Einstieg'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    period: 'pro Monat',
    icon: <Crown size={32} />,
    color: '#8C1D04',
    features: [
      'Alle Basic Features',
      'Erweiterte Chart-Analysen',
      'Dating-System',
      'Persönliche Insights',
      'Priority Support',
      'Exklusive Inhalte'
    ],
    popular: false,
    description: 'Connection Key + tiefe Verbindungsauswertungen'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 49.99,
    period: 'pro Monat',
    icon: <Zap size={32} />,
    color: '#F29F05',
    features: [
      'Alle Premium Features',
      '1:1 Coaching Sessions',
      'VIP Community',
      'Persönlicher Coach',
      'Exklusive Events',
      'Lifetime Updates',
      'White Glove Service'
    ],
    popular: false,
    description: 'Komplettes Human Design + Connection Key + persönliches Wachstumstool'
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Mock-Daten für Demo
      const mockSubscription: any = {
        id: 'sub-1',
        user_id: 'user-1',
        package: 'basic',
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      setUserSubscription(mockSubscription);
      setSelectedPackage(mockSubscription.package);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (packageId: string) => {
    // ✅ Kein "free" Paket mehr - nur basic, premium, vip, admin
    if (!['basic', 'premium', 'vip', 'admin'].includes(packageId)) {
      return;
    }

    try {
      // Stripe Checkout Session erstellen
      const priceId = PACKAGE_TO_PRICE_ID[packageId];
      if (!priceId) {
        alert('Preis-ID für dieses Paket nicht gefunden');
        return;
      }

      const result = await createCheckoutSession({
        packageId,
        priceId
      });

      if (result.success && result.data) {
        // Zur Stripe Checkout-Seite weiterleiten
        window.location.href = result.data.url;
      } else {
        const errorMessage = result.error?.message || 'Fehler beim Erstellen der Checkout-Session';
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorMessage = handleStripeError(error);
      alert(`Fehler beim Upgrade: ${errorMessage}`);
    }
  };

  const getCurrentPackageData = () => {
    return packageData.find(p => p.id === userSubscription?.package) || packageData[0];
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Abonnement wird geladen...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  const currentPackage = getCurrentPackageData();

  return (
    <PageLayout>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Abonnement verwalten
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Verwalte dein Abonnement und entdecke erweiterte Features
        </Typography>

        {/* Aktuelles Abonnement */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, background: `linear-gradient(135deg, ${currentPackage.color}20, ${currentPackage.color}10)` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ color: currentPackage.color, mr: 2 }}>
              {currentPackage.icon}
            </Box>
            <Typography variant="h5" component="h2">
              Aktuelles Abonnement: {currentPackage.name}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {`€${currentPackage.price}/${currentPackage.period}`}
          </Typography>

          <Chip 
            label={userSubscription?.status === 'active' ? 'Aktiv' : 'Inaktiv'} 
            color={userSubscription?.status === 'active' ? 'success' : 'default'}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Läuft ab: {new Date(userSubscription?.expires_at || '').toLocaleDateString('de-DE')}
          </Typography>
        </Paper>
      </Box>

      {/* Warum Community? */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
          Warum Community?
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: '800px', mx: 'auto' }}>
          Werde Teil unserer wachsenden Community von über 2.500+ Menschen auf ihrer Human Design Journey. 
          Teile deine Erfahrungen, entdecke energetische Verbindungen und wachse gemeinsam mit Gleichgesinnten.
        </Typography>
        
        <Grid container spacing={3} sx={{ maxWidth: '900px', mx: 'auto', mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem', mb: 1 }}>👥</Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Austausch mit &gt;2.500 Menschen
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem', mb: 1 }}>💬</Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Monatliche Community-Calls
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem', mb: 1 }}>💫</Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Energetische Partner-Matches
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem', mb: 1 }}>📚</Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Exklusives Wissen & Insights
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Verfügbare Pakete */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Verfügbare Pakete
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {packageData.map((pkg) => {
          const isCurrentPackage = pkg.id === userSubscription?.package;
          // Upgrade-Funktion wird später implementiert
          // const canUpgradeTo = userSubscription ? canUpgrade(userSubscription.package, pkg.id as UserPackage) : true;
          const canUpgradeTo = true;
          const isSelected = selectedPackage === pkg.id;

          return (
            <Grid item xs={12} md={6} lg={4} key={pkg.id}>
              <Card 
                component="div"
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  background: isCurrentPackage 
                    ? `linear-gradient(135deg, ${pkg.color}15, ${pkg.color}08)`
                    : pkg.popular
                    ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.10), rgba(140, 29, 4, 0.08))'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: isCurrentPackage 
                    ? `2px solid ${pkg.color}` 
                    : pkg.popular 
                    ? `2px solid ${pkg.color}80`
                    : '1px solid rgba(242, 159, 5, 0.2)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: pkg.popular 
                    ? `0 8px 30px ${pkg.color}40`
                    : isCurrentPackage
                    ? `0 4px 20px ${pkg.color}30`
                    : 'none',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: pkg.popular 
                      ? `0 12px 40px ${pkg.color}50`
                      : `0 8px 30px ${pkg.color}30`,
                    borderColor: pkg.color,
                  }
                }}
              >
                {pkg.popular && (
                  <Box
                    sx={{ 
                      position: 'absolute', 
                      top: -1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}dd)`,
                      color: 'white',
                      px: 3,
                      py: 0.75,
                      borderRadius: '0 0 12px 12px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      zIndex: 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔥 Beliebt
                  </Box>
                )}

                <CardContent sx={{ 
                  p: { xs: 3, md: 4 }, 
                  pt: pkg.popular ? { xs: 4.5, md: 5.5 } : { xs: 3, md: 4 },
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ 
                      color: pkg.color, 
                      mb: 2.5,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      {pkg.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.4rem', md: '1.6rem' },
                        color: 'white',
                        mb: 1.5
                      }}
                    >
                      {pkg.name}
                    </Typography>
                    {pkg.description && (
                      <Typography 
                        variant="body2" 
                        component="p"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.75)', 
                          mb: 3,
                          fontSize: { xs: '0.9rem', md: '1rem' },
                          minHeight: { xs: '2.5rem', md: '3rem' },
                          lineHeight: 1.6
                        }}
                      >
                        {pkg.description}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="h3" 
                        component="div" 
                        sx={{ 
                          color: pkg.color, 
                          fontWeight: 800,
                          fontSize: { xs: '2.5rem', md: '3rem' },
                          lineHeight: 1.1,
                          mb: 0.5
                        }}
                      >
                        {`€${pkg.price}`}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {pkg.period}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flexGrow: 1, mb: 3 }}>
                    {pkg.features.map((feature, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start',
                          mb: 1.75,
                          px: 0.5,
                          py: 0.5
                        }}
                      >
                        <Box sx={{ 
                          color: pkg.color, 
                          mr: 1.5, 
                          mt: 0.25,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Check size={16} />
                        </Box>
                        <Typography 
                          variant="body2"
                          component="span"
                          sx={{
                            fontSize: { xs: '0.875rem', md: '0.95rem' },
                            color: 'rgba(255, 255, 255, 0.85)',
                            lineHeight: 1.7,
                            flex: 1
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(242, 159, 5, 0.2)' }} />

                  <Button
                    variant={isCurrentPackage ? 'outlined' : 'contained'}
                    fullWidth
                    size="large"
                    disabled={isCurrentPackage || (!canUpgradeTo && !isCurrentPackage)}
                    onClick={() => {
                      setSelectedPackage(pkg.id as string);
                      if (!isCurrentPackage && canUpgradeTo) {
                        handleUpgrade(pkg.id as string);
                      }
                    }}
                    sx={{
                      background: isCurrentPackage 
                        ? 'transparent' 
                        : `linear-gradient(135deg, ${pkg.color}, ${pkg.color}dd)`,
                      color: isCurrentPackage ? pkg.color : 'white',
                      borderColor: pkg.color,
                      fontWeight: 700,
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                      '&:hover': {
                        background: isCurrentPackage 
                          ? `${pkg.color}15` 
                          : `linear-gradient(135deg, ${pkg.color}dd, ${pkg.color})`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${pkg.color}50`,
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    {isCurrentPackage ? 'Aktuelles Paket' : 
                     !canUpgradeTo ? 'Nicht verfügbar' : 
                     'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Zusätzliche Informationen */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Häufig gestellte Fragen
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kann ich jederzeit upgraden?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ja, du kannst jederzeit auf ein höheres Paket upgraden. 
                Der Preis wird anteilig berechnet.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kann ich mein Abonnement kündigen?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ja, du kannst dein Abonnement jederzeit kündigen. 
                Du behältst Zugriff bis zum Ende der Laufzeit.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Support */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Benötigst du Hilfe? Kontaktiere unseren Support.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Settings size={16} />}
          sx={{ mt: 2 }}
          onClick={() => router.push('/settings')}
        >
          Zu den Einstellungen
        </Button>
      </Box>
    </PageLayout>
  );
}

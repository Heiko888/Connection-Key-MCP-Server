"use client";
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Grid, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Crown, Zap, Star, Check, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/app/components/PublicHeader';
import Logo from '@/app/components/Logo';

export default function UpgradePage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lade aktuellen Plan aus localStorage
    const userData = localStorage.getItem('userData');
    const userSubscription = localStorage.getItem('userSubscription');
    
    (async () => {
      const { safeJsonParse } = await import('@/lib/utils/safeJson');
      if (userData) {
        const user = safeJsonParse<any>(userData, null);
        if (user && user.subscriptionPlan) {
          setCurrentPlan(user.subscriptionPlan);
        }
      } else if (userSubscription) {
        const subscription = safeJsonParse<any>(userSubscription, null);
        if (subscription && subscription.plan) {
          setCurrentPlan(subscription.plan);
        }
      }
    })();
  }, []);

  const plans = {
    basic: {
      name: "Basic",
      price: "0",
      period: "monatlich",
      description: "Perfekt zum Einstieg",
      icon: <Star size={24} />,
      color: "linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.3))",
      features: [
        "Human Design Chart",
        "Vollständiger Mondkalender",
        "Community Zugang",
        "Basis-Matching",
        "Bis zu 3 Profilbilder"
      ],
      limitations: [
        "Begrenzte Matches pro Tag",
        "Keine erweiterten Analysen"
      ],
      popular: false,
      cta: "Aktueller Plan",
      disabled: true
    },
    premium: {
      name: "Premium",
      price: "19",
      period: "monatlich",
      description: "Für ernsthafte Suchende",
      icon: <Crown size={24} />,
      color: "linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(255, 215, 0, 0.4))",
    features: [
      "Alle Basic Features",
      "Unbegrenzte Matches",
      "Erweiterte Kompatibilitäts-Analyse",
      "Persönliche Readings",
      "Bis zu 10 Profilbilder",
      "Prioritäts-Support",
      "Chart-Vergleichs-Tool"
    ],
      limitations: [],
      popular: true,
      cta: currentPlan === 'premium' ? "Aktueller Plan" : "Zu Premium upgraden",
      disabled: currentPlan === 'premium'
    },
    vip: {
      name: "VIP",
      price: "49",
      period: "monatlich",
      description: "Das komplette Erlebnis",
      icon: <Zap size={24} />,
      color: "linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.4))",
      features: [
        "Alle Premium Features",
        "1:1 Coaching Sessions",
        "Reiki & Energiearbeit",
        "Unbegrenzte Profilbilder",
        "VIP Community Zugang",
        "Persönlicher Concierge",
        "Früher Zugang zu neuen Features",
        "Exklusive Retreats"
      ],
      limitations: [],
      popular: false,
      cta: currentPlan === 'vip' ? "Aktueller Plan" : "Zu VIP upgraden",
      disabled: currentPlan === 'vip'
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (planName === currentPlan) return;
    
    setLoading(true);
    
    try {
      // Simuliere Upgrade-Prozess
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aktualisiere localStorage
      const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
      const userData = safeLocalStorageParse<{ subscriptionPlan?: string; userId?: string }>('userData', {});
      if (userData) {
        userData.subscriptionPlan = planName;
        safeLocalStorageSet('userData', userData);
      }
      
      // Erstelle vollständige Subscription-Daten
      const subscriptionData = {
        id: `sub_${Date.now()}`,
        userId: userData?.userId || 'user_123',
        packageId: planName,
        plan: plans[planName as keyof typeof plans].name,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Tage
        billingCycle: 'monthly',
        autoRenew: true,
        paymentMethod: 'credit_card',
        features: plans[planName as keyof typeof plans].features
      };
      
      localStorage.setItem('userSubscription', JSON.stringify(subscriptionData));
      
      // Trigger storage event für andere Tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user-subscription',
        newValue: JSON.stringify(subscriptionData)
      }));
      
      setCurrentPlan(planName);
      
      // Weiterleitung zum Dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Upgrade-Fehler:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Floating Stars Animation */}
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
            zIndex: 1,
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
      
      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />
        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
              <Star size={48} color="#F29F05" />
              <Typography variant="h1" sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(242, 159, 5, 0.3)'
              }}>
                Upgrade dein Erlebnis
              </Typography>
              <Star size={48} color="#F29F05" />
            </Box>
            
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Entdecke alle Premium-Features und finde die Verbindung, die wirklich zu dir passt
            </Typography>
            
            {currentPlan !== 'basic' && (
              <Alert severity="info" sx={{
                bgcolor: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                color: '#F29F05',
                maxWidth: 400,
                mx: 'auto',
                mb: 4
              }}>
                Aktueller Plan: <strong>{plans[currentPlan as keyof typeof plans].name}</strong>
              </Alert>
            )}
          </Box>
        </motion.div>

        {/* Pricing Cards */}
        <Grid container spacing={4} justifyContent="center">
          {Object.entries(plans).map(([planKey, plan], index) => (
            <Grid item xs={12} md={4} key={planKey}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{
                  background: plan.popular 
                    ? 'rgba(242, 159, 5, 0.1)' 
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: plan.popular 
                    ? '2px solid #F29F05' 
                    : '1px solid rgba(242, 159, 5, 0.2)',
                  borderRadius: 4,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: plan.popular 
                      ? '0 20px 40px rgba(242, 159, 5, 0.3)' 
                      : '0 20px 40px rgba(242, 159, 5, 0.2)',
                    border: plan.popular 
                      ? '2px solid #FFD700' 
                      : '1px solid rgba(242, 159, 5, 0.4)'
                  }
                }}>
                  {/* Popular Badge */}
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute',
                      top: -1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                      color: '#000',
                      px: 3,
                      py: 1,
                      borderRadius: '0 0 12px 12px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      zIndex: 2
                    }}>
                      <Shield size={16} style={{ marginRight: 8, display: 'inline' }} />
                      🔥 Beliebt
                    </Box>
                  )}
                  
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Plan Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: plan.color,
                        mb: 2,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                      }}>
                        {plan.icon}
                      </Box>
                      
                      <Typography variant="h4" sx={{ 
                        color: plan.popular ? '#F29F05' : 'white', 
                        fontWeight: 700,
                        mb: 1,
                        background: plan.popular ? 'linear-gradient(135deg, #F29F05, #FFD700)' : 'none',
                        backgroundClip: plan.popular ? 'text' : 'none',
                        WebkitBackgroundClip: plan.popular ? 'text' : 'none',
                        WebkitTextFillColor: plan.popular ? 'transparent' : 'white'
                      }}>
                        {plan.name}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        mb: 2
                      }}>
                        {plan.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                        <Typography variant="h2" sx={{ 
                          color: plan.popular ? '#F29F05' : 'white',
                          fontWeight: 800,
                          mr: 1,
                          background: plan.popular ? 'linear-gradient(135deg, #F29F05, #FFD700)' : 'none',
                          backgroundClip: plan.popular ? 'text' : 'none',
                          WebkitBackgroundClip: plan.popular ? 'text' : 'none',
                          WebkitTextFillColor: plan.popular ? 'transparent' : 'white'
                        }}>
                          €{plan.price}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          /{plan.period}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Features */}
                    <Box sx={{ flexGrow: 1, mb: 4 }}>
                      <Box sx={{ mb: 2 }}>
                        {plan.features.map((feature, featureIndex) => (
                          <Box key={featureIndex} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1.5,
                            py: 0.5
                          }}>
                            <Check size={16} style={{ 
                              color: '#F29F05', 
                              marginRight: 12,
                              flexShrink: 0
                            }} />
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.9)',
                              lineHeight: 1.4
                            }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      {plan.limitations.length > 0 && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          {plan.limitations.map((limitation, limitIndex) => (
                            <Box key={limitIndex} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1,
                              py: 0.5
                            }}>
                              <Box sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.3)',
                                marginRight: 12,
                                flexShrink: 0
                              }} />
                              <Typography variant="body2" sx={{ 
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.4
                              }}>
                                {limitation}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    {/* CTA Button */}
                    <Button
                      onClick={() => handleUpgrade(planKey)}
                      variant="contained"
                      fullWidth
                      disabled={plan.disabled || loading}
                      endIcon={!plan.disabled && !loading ? <ArrowRight size={20} /> : null}
                      sx={{
                        background: plan.disabled 
                          ? 'rgba(255,255,255,0.1)' 
                          : plan.popular 
                            ? 'linear-gradient(135deg, #F29F05, #FFD700)' 
                            : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: plan.disabled 
                          ? 'rgba(255,255,255,0.5)' 
                          : 'white',
                        fontWeight: 700,
                        py: 2.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        boxShadow: plan.disabled 
                          ? 'none' 
                          : plan.popular 
                            ? '0 8px 20px rgba(242, 159, 5, 0.4)' 
                            : '0 8px 20px rgba(242, 159, 5, 0.3)',
                        '&:hover': {
                          background: plan.disabled 
                            ? 'rgba(255,255,255,0.1)' 
                            : plan.popular 
                              ? 'linear-gradient(135deg, #FFD700, #F29F05)' 
                              : 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: plan.disabled ? 'none' : 'translateY(-2px)',
                          boxShadow: plan.disabled 
                            ? 'none' 
                            : plan.popular 
                              ? '0 12px 30px rgba(242, 159, 5, 0.5)' 
                              : '0 12px 30px rgba(242, 159, 5, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Wird verarbeitet...' : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        
        {/* Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}>
              Alle Pläne beinhalten eine 14-tägige Geld-zurück-Garantie. 
              Keine versteckten Kosten, jederzeit kündbar.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

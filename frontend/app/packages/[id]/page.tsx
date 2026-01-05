"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider
} from '@mui/material';
import { 
  Star, 
  Diamond, 
  Crown, 
  Check, 
  ArrowLeft,
  Users,
  Heart,
  Calendar,
  MessageCircle,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Gift,
  Award,
  BookOpen,
  Video,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '../../components/Logo';

interface PackageFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  included: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

const packagesData = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'Perfekt für den Einstieg in deine Human Design Reise',
    icon: <Star size={48} />,
    color: '#F29F05',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    popular: false,
    description: 'Das Basic-Paket bietet dir alle grundlegenden Tools, um dein Human Design zu verstehen und im Alltag anzuwenden.',
    features: [
      {
        icon: <Target size={24} />,
        title: 'Human Design Chart',
        description: 'Erhalte dein persönliches Human Design Chart mit allen wichtigen Informationen zu deinem Typ, Profil und Autorität.',
        included: true
      },
      {
        icon: <BookOpen size={24} />,
        title: 'Grundlegende Analysen',
        description: 'Verstehe die Basics: Dein Typ, deine Strategie und deine innere Autorität - die Grundlage für dein Design.',
        included: true
      },
      {
        icon: <Calendar size={24} />,
        title: 'Mondkalender',
        description: 'Nutze den Mondkalender um deine Energie optimal zu nutzen und wichtige Entscheidungen zu treffen.',
        included: true
      },
      {
        icon: <Users size={24} />,
        title: 'Community-Zugang',
        description: 'Tausche dich mit Gleichgesinnten aus und lerne von den Erfahrungen anderer.',
        included: true
      },
      {
        icon: <Shield size={24} />,
        title: 'Mobile App',
        description: 'Greife von überall auf dein Chart zu - ob unterwegs oder zuhause.',
        included: true
      },
      {
        icon: <Heart size={24} />,
        title: 'Dating-System',
        description: 'Finde kompatible Partner basierend auf Human Design.',
        included: false
      }
    ],
    useCases: [
      'Du möchtest Human Design kennenlernen',
      'Du brauchst die Grundlagen für den Alltag',
      'Du willst dich mit anderen austauschen',
      'Du suchst einen günstigen Einstieg'
    ],
    faqs: [
      {
        question: 'Für wen ist das Basic-Paket geeignet?',
        answer: 'Das Basic-Paket ist perfekt für Einsteiger, die Human Design kennenlernen möchten. Es bietet alle wichtigen Grundlagen ohne Schnickschnack.'
      },
      {
        question: 'Kann ich später upgraden?',
        answer: 'Ja! Du kannst jederzeit auf Premium oder VIP upgraden. Die Differenz wird anteilig verrechnet.'
      },
      {
        question: 'Gibt es eine Kündigungsfrist?',
        answer: 'Nein, du kannst monatlich kündigen. Bei jährlicher Zahlung endet das Abo automatisch nach 12 Monaten.'
      }
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Für ernsthafte Human Design Enthusiasten',
    icon: <Diamond size={48} />,
    color: '#8C1D04',
    priceMonthly: 39.00,
    priceYearly: 390.00,
    popular: true,
    description: 'Das Premium-Paket bietet dir tiefgehende Analysen, erweiterte Features und Zugang zum Dating-System.',
    features: [
      {
        icon: <Check size={24} />,
        title: 'Alle Basic Features',
        description: 'Du erhältst alle Funktionen aus dem Basic-Paket inklusive.',
        included: true
      },
      {
        icon: <TrendingUp size={24} />,
        title: 'Erweiterte Chart-Analysen',
        description: 'Tiefgehende Analysen zu deinen Toren, Kanälen, Zentren und Variablen - verstehe dein Design auf einem neuen Level.',
        included: true
      },
      {
        icon: <Heart size={24} />,
        title: 'Dating-System',
        description: 'Finde kompatible Partner basierend auf Human Design. Sehe Kompatibilitäts-Scores und detaillierte Beziehungs-Analysen.',
        included: true
      },
      {
        icon: <Zap size={24} />,
        title: 'Persönliche Insights',
        description: 'Erhalte wöchentliche personalisierte Insights basierend auf deinem Chart und den aktuellen Transiten.',
        included: true
      },
      {
        icon: <Shield size={24} />,
        title: 'Priority Support',
        description: 'Deine Fragen werden bevorzugt beantwortet - innerhalb von 24 Stunden.',
        included: true
      },
      {
        icon: <Gift size={24} />,
        title: 'Exklusive Inhalte',
        description: 'Zugang zu Premium-Artikeln, Webinaren und Masterclasses von Human Design Experten.',
        included: true
      },
      {
        icon: <Video size={24} />,
        title: '1:1 Coaching',
        description: 'Persönliche Coaching-Sessions mit zertifizierten Coaches.',
        included: false
      }
    ],
    useCases: [
      'Du möchtest Human Design tiefer verstehen',
      'Du suchst einen kompatiblen Partner',
      'Du willst personalisierte Insights',
      'Du brauchst schnellen Support',
      'Du investierst in deine Persönlichkeitsentwicklung'
    ],
    faqs: [
      {
        question: 'Was unterscheidet Premium von Basic?',
        answer: 'Premium bietet erweiterte Analysen, das Dating-System, persönliche Insights und Priority Support. Perfekt für alle, die tiefer eintauchen wollen.'
      },
      {
        question: 'Wie funktioniert das Dating-System?',
        answer: 'Das Dating-System analysiert die Kompatibilität zwischen zwei Human Design Charts und zeigt dir potenzielle Partner mit hoher Übereinstimmung.'
      },
      {
        question: 'Wie oft bekomme ich Insights?',
        answer: 'Du erhältst wöchentlich personalisierte Insights basierend auf deinem Chart und den aktuellen planetarischen Transiten.'
      }
    ]
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    tagline: 'Das ultimative Human Design Erlebnis',
    icon: <Crown size={48} />,
    color: '#590A03',
    priceMonthly: 99.00,
    priceYearly: 990.00,
    popular: false,
    description: 'Das VIP-Paket bietet dir die komplette Human Design Erfahrung mit persönlichem Coaching, exklusiven Events und White Glove Service.',
    features: [
      {
        icon: <Check size={24} />,
        title: 'Alle Premium Features',
        description: 'Du erhältst alle Funktionen aus dem Premium-Paket inklusive.',
        included: true
      },
      {
        icon: <Video size={24} />,
        title: '1:1 Coaching Sessions',
        description: 'Monatliche 60-minütige Sessions mit zertifizierten Human Design Coaches für persönliche Begleitung.',
        included: true
      },
      {
        icon: <Users size={24} />,
        title: 'VIP Community',
        description: 'Exklusiver Zugang zur VIP-Community mit Networking-Events und Mastermind-Gruppen.',
        included: true
      },
      {
        icon: <Award size={24} />,
        title: 'Persönlicher Coach',
        description: 'Dein dedizierter Coach ist jederzeit für dich da und begleitet deine Human Design Reise.',
        included: true
      },
      {
        icon: <Gift size={24} />,
        title: 'Exklusive Events',
        description: 'VIP-Tickets für Live-Events, Retreats und Workshops mit renommierten Human Design Experten.',
        included: true
      },
      {
        icon: <TrendingUp size={24} />,
        title: 'Lifetime Updates',
        description: 'Erhalte lebenslangen Zugang zu allen zukünftigen Features und Updates - ohne Aufpreis.',
        included: true
      },
      {
        icon: <Shield size={24} />,
        title: 'White Glove Service',
        description: '24/7 Priority Support mit persönlichem Ansprechpartner für alle deine Anliegen.',
        included: true
      }
    ],
    useCases: [
      'Du möchtest maximale Unterstützung',
      'Du willst persönliches Coaching',
      'Du suchst Zugang zu Experten',
      'Du investierst ernsthaft in deine Transformation',
      'Du möchtest Teil einer exklusiven Community sein'
    ],
    faqs: [
      {
        question: 'Was macht das VIP-Paket so besonders?',
        answer: 'VIP bietet dir persönliche Begleitung durch zertifizierte Coaches, exklusive Events und einen 24/7 White Glove Service. Es ist die ultimative Human Design Erfahrung.'
      },
      {
        question: 'Wie oft finden Coaching-Sessions statt?',
        answer: 'Du erhältst eine 60-minütige 1:1 Session pro Monat. Zusätzliche Sessions können individuell gebucht werden.'
      },
      {
        question: 'Was sind die VIP-Events?',
        answer: 'VIP-Mitglieder erhalten Zugang zu exklusiven Retreats, Live-Workshops und Networking-Events mit Human Design Experten und anderen VIP-Mitgliedern.'
      }
    ]
  }
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const packageId = params.id as string;
  const packageData = packagesData[packageId as keyof typeof packagesData];

  useEffect(() => {
    setMounted(true);
    const loadUserSubscription = async () => {
      try {
        // Prüfe beide möglichen Keys
        let subscriptionData = localStorage.getItem('userSubscription');
        if (!subscriptionData) {
          subscriptionData = localStorage.getItem('user-subscription');
        }
        
        if (subscriptionData) {
          const subscription = JSON.parse(subscriptionData);
          setUserSubscription(subscription);
        }
      } catch (error) {
        // Fehler beim Laden des Abonnements
      }
    };
    loadUserSubscription();
  }, [packageData.id]);

  // Verhindere Hydration-Error: Zeige nur nach Client-Mount
  const isCurrentPackage = mounted && userSubscription?.packageId === packageData.id;

  const handlePackageChange = async () => {
    try {
      // Prüfe ob User eingeloggt ist (mehrere mögliche Keys)
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      let userData = localStorage.getItem('userData');
      
      // Wenn bereits eine Subscription existiert, ist User definitiv eingeloggt
      if (!userSubscription && !token && !userId && !userData) {
        // Kein Login gefunden
        alert('⚠️ Bitte melde dich zuerst an!');
        router.push('/login');
        return;
      }

      // Hole User ID
      let userIdValue = userId;
      if (!userIdValue && userData) {
        try {
          const user = JSON.parse(userData);
          userIdValue = user.id;
        } catch (e) {
          // Fehler beim Parsen von userData
        }
      }
      if (!userIdValue && userSubscription) {
        userIdValue = userSubscription.userId;
      }
      if (!userIdValue) {
        userIdValue = 'user-' + Date.now(); // Fallback mit Timestamp
      }
      
      // Erstelle neue Subscription
      const newSubscription = {
        userId: userIdValue,
        packageId: packageData.id,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: 'credit_card',
        billingCycle: billingCycle
      };
      
      // Speichere in beiden Keys (für Kompatibilität)
      localStorage.setItem('userSubscription', JSON.stringify(newSubscription));
      localStorage.setItem('user-subscription', JSON.stringify(newSubscription));
      
      setUserSubscription(newSubscription);
      
      // Erfolgsmeldung
      const action = isUpgrade() ? 'Upgrade' : 'Downgrade';
      alert(`✅ ${action} zu ${packageData.name} erfolgreich!`);
      
      router.push('/dashboard');
      
    } catch (error) {
      alert('Fehler beim Paketwechsel. Bitte versuchen Sie es erneut.');
    }
  };

  // Prüfe ob es ein Upgrade oder Downgrade ist
  const isUpgrade = () => {
    if (!userSubscription) return true;
    const packageOrder = { 'basic': 1, 'premium': 2, 'vip': 3 };
    const currentLevel = packageOrder[userSubscription.packageId as keyof typeof packageOrder] || 0;
    const targetLevel = packageOrder[packageData.id as keyof typeof packageOrder] || 0;
    return targetLevel > currentLevel;
  };

  // Button Text bestimmen
  const getButtonText = () => {
    if (isCurrentPackage) {
      return `✓ Du hast bereits ${packageData.name}`;
    }
    return isUpgrade() ? `Auf ${packageData.name} upgraden` : `Zu ${packageData.name} wechseln`;
  };

  if (!packageData) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Paket nicht gefunden</Typography>
      </Box>
    );
  }

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getPrice = () => {
    const price = billingCycle === 'yearly' ? packageData.priceYearly : packageData.priceMonthly;
    const cycle = billingCycle === 'yearly' ? '/Jahr' : '/Monat';
    return `${price.toFixed(2)}€${cycle}`;
  };

  const getSavings = () => {
    if (billingCycle === 'monthly') return null;
    const monthlyTotal = packageData.priceMonthly * 12;
    const savings = monthlyTotal - packageData.priceYearly;
    return savings.toFixed(2);
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
      overflow: 'hidden',
      py: 6
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
            zIndex: 0,
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
            zIndex: 0,
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
            zIndex: 0,
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <Logo />

        {/* Back Button */}
        <Button
          component={Link}
          href="/pricing"
          startIcon={<ArrowLeft size={20} />}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 4,
            '&:hover': { 
              background: 'rgba(255,255,255,0.1)',
              color: '#F29F05'
            }
          }}
        >
          Zurück zur Übersicht
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ 
              display: 'inline-flex', 
              mb: 3,
              color: packageData.color,
              filter: 'drop-shadow(0 0 20px currentColor)'
            }}>
              {packageData.icon}
            </Box>
          </motion.div>

          <Typography variant="h2" sx={{ 
            fontWeight: 'bold', 
            color: 'white',
            mb: 2
          }}>
            {packageData.name}
          </Typography>

          {packageData.popular && (
            <Chip 
              label="🔥 BELIEBTESTE WAHL" 
              sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 'bold',
                mb: 2
              }} 
            />
          )}

          <Typography variant="h5" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            mb: 3,
            fontWeight: 300
          }}>
            {packageData.tagline}
          </Typography>

          <Typography variant="body1" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '700px',
            mx: 'auto',
            lineHeight: 1.8
          }}>
            {packageData.description}
          </Typography>
        </Box>

        {/* Pricing Card */}
        <Card sx={{ 
          background: `linear-gradient(135deg, ${packageData.color}22 0%, ${packageData.color}18 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${packageData.color}55`,
          borderRadius: 4,
          mb: 6,
          maxWidth: '600px',
          mx: 'auto'
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Billing Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button
                variant={billingCycle === 'monthly' ? 'contained' : 'outlined'}
                onClick={() => setBillingCycle('monthly')}
                sx={{
                  borderColor: packageData.color,
                  color: billingCycle === 'monthly' ? 'white' : packageData.color,
                  background: billingCycle === 'monthly' ? packageData.color : 'transparent',
                  '&:hover': {
                    background: billingCycle === 'monthly' ? packageData.color : 'rgba(242,159,5,0.10)'
                  }
                }}
              >
                Monatlich
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'contained' : 'outlined'}
                onClick={() => setBillingCycle('yearly')}
                sx={{
                  borderColor: packageData.color,
                  color: billingCycle === 'yearly' ? 'white' : packageData.color,
                  background: billingCycle === 'yearly' ? packageData.color : 'transparent',
                  '&:hover': {
                    background: billingCycle === 'yearly' ? packageData.color : 'rgba(242,159,5,0.10)'
                  }
                }}
              >
                Jährlich
              </Button>
            </Box>

            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              textAlign: 'center',
              mb: 1
            }}>
              {getPrice()}
            </Typography>

            {getSavings() && (
              <Typography sx={{ 
                color: '#F29F05',
                textAlign: 'center',
                fontWeight: 'bold',
                mb: 3
              }}>
                💰 Sie sparen {getSavings()}€ pro Jahr
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isCurrentPackage}
              sx={{
                background: isCurrentPackage
                  ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                  : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  background: isCurrentPackage
                    ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                    : 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: isCurrentPackage ? 'none' : 'scale(1.02)'
                }
              }}
              onClick={handlePackageChange}
            >
              {mounted ? getButtonText() : `${packageData.name} wählen`}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 4,
            textAlign: 'center'
          }}>
            ✨ Features im Detail
          </Typography>

          <Grid container spacing={3}>
            {packageData.features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    background: feature.included 
                      ? 'rgba(242,159,5,0.08)'
                      : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: feature.included 
                      ? '1px solid rgba(242,159,5,0.30)'
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    height: '100%',
                    opacity: feature.included ? 1 : 0.5
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          color: feature.included ? packageData.color : 'rgba(255,255,255,0.5)',
                          flexShrink: 0
                        }}>
                          {feature.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 1
                          }}>
                            {feature.title}
                            {!feature.included && ' (Nicht enthalten)'}
                          </Typography>
                          <Typography sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.6
                          }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Use Cases */}
        <Card sx={{ 
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          mb: 6
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center'
            }}>
              🎯 Perfekt für dich wenn...
            </Typography>
            <Grid container spacing={2}>
              {packageData.useCases.map((useCase, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Check size={20} color="#F29F05" />
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {useCase}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Box>
          <Typography variant="h4" sx={{ 
            color: 'white',
            fontWeight: 'bold',
            mb: 4,
            textAlign: 'center'
          }}>
            ❓ Häufige Fragen
          </Typography>

          {packageData.faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
              sx={{
                background: 'rgba(242,159,5,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242,159,5,0.15)',
                borderRadius: 2,
                mb: 2,
                '&:before': { display: 'none' },
                color: 'white'
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown color="white" />}>
                <Typography sx={{ fontWeight: 'bold' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="contained"
            size="large"
            disabled={isCurrentPackage}
            sx={{
              background: isCurrentPackage
                ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                : `linear-gradient(135deg, ${packageData.color}, ${packageData.color}dd)`,
              color: 'white',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                background: isCurrentPackage
                  ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                  : `linear-gradient(135deg, ${packageData.color}dd, ${packageData.color})`,
                transform: isCurrentPackage ? 'none' : 'scale(1.05)'
              }
            }}
            onClick={handlePackageChange}
          >
            {mounted ? getButtonText() : `${packageData.name} wählen`}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}


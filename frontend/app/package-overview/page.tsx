"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert
} from '@mui/material';
import { Check, X, Star, Diamond, Crown, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/PageLayout';

// Subscription-Pakete Definition
const subscriptionPackages = [
  {
    id: 'basic',
    name: 'Basis',
    color: '#3b82f6',
    priceMonthly: 9.99,
    // Basis Features
    hasHumanDesignChart: true,
    hasBasicAnalysis: true,
    hasDatingCommunity: true,
    hasFriendsCommunity: true,
    hasBasicMatching: true,
    hasPushNotifications: true,
    // KEIN Connection Key
    hasConnectionKey: false,
    hasResonanceAxes: false,
    hasGoldVeins: false,
    hasDeepReadings: false,
    hasConnectionAnalysis: false,
    // Premium Features
    hasAdvancedAnalytics: false,
    hasUnlimitedConnections: false,
    hasExtendedProfile: false,
    hasPersonalLearnings: false,
    hasEnergeticMatching: false,
    hasFilterOptions: false,
    // VIP Features
    hasDeepHumanDesign: false,
    hasPlanetAnalysis: false,
    hasChironLilithNodes: false,
    hasSexualityAnalysis: false,
    hasBusinessAnalysis: false,
    hasRelationshipSignature: false,
    hasDeepResonanceReports: false,
    hasTimeDynamics: false,
    hasConflictAnalysis: false,
    hasSolutionStrategies: false,
    hasWeeklyForecast: false,
    hasAskYourChart: false,
    hasJournaling: false,
    hasPrioritizedMatches: false,
    hasFreeReading: false,
    maxCoachingSessions: 0,
    hasVIPCommunity: false,
    hasPersonalCoach: false
  },
  {
    id: 'premium',
    name: 'Premium',
    color: '#8b5cf6',
    priceMonthly: 39.00, // Mittelwert zwischen 29-49€
    // Basis Features (alle)
    hasHumanDesignChart: true,
    hasBasicAnalysis: true,
    hasDatingCommunity: true,
    hasFriendsCommunity: true,
    hasBasicMatching: true,
    hasPushNotifications: true,
    // Connection Key Features
    hasConnectionKey: true,
    hasResonanceAxes: true,
    hasGoldVeins: true,
    hasComplementaryGates: true,
    hasInvisibleKeys: true,
    hasEnergeticConnectionAnalysis: true,
    hasMentalResonance: true,
    hasEmotionalResonance: true,
    hasPhysicalResonance: true,
    hasCenterComparison: true,
    hasConnectionAnalysis: true,
    // Premium Features
    hasAdvancedAnalytics: true,
    hasUnlimitedConnections: true,
    hasExtendedProfile: true,
    hasPersonalLearnings: true,
    hasEnergeticMatching: true,
    hasFilterOptions: true,
    // VIP Features
    hasDeepHumanDesign: false,
    hasPlanetAnalysis: false,
    hasChironLilithNodes: false,
    hasSexualityAnalysis: false,
    hasBusinessAnalysis: false,
    hasRelationshipSignature: false,
    hasDeepResonanceReports: false,
    hasTimeDynamics: false,
    hasConflictAnalysis: false,
    hasSolutionStrategies: false,
    hasWeeklyForecast: false,
    hasAskYourChart: false,
    hasJournaling: false,
    hasPrioritizedMatches: false,
    hasFreeReading: false,
    maxCoachingSessions: 0,
    hasVIPCommunity: false,
    hasPersonalCoach: false
  },
  {
    id: 'vip',
    name: 'VIP',
    color: '#f59e0b',
    priceMonthly: 99.00, // Mittelwert zwischen 79-129€
    // Basis Features (alle)
    hasHumanDesignChart: true,
    hasBasicAnalysis: true,
    hasDatingCommunity: true,
    hasFriendsCommunity: true,
    hasBasicMatching: true,
    hasPushNotifications: true,
    // Connection Key Features (alle)
    hasConnectionKey: true,
    hasResonanceAxes: true,
    hasGoldVeins: true,
    hasComplementaryGates: true,
    hasInvisibleKeys: true,
    hasEnergeticConnectionAnalysis: true,
    hasMentalResonance: true,
    hasEmotionalResonance: true,
    hasPhysicalResonance: true,
    hasCenterComparison: true,
    hasConnectionAnalysis: true,
    // Premium Features (alle)
    hasAdvancedAnalytics: true,
    hasUnlimitedConnections: true,
    hasExtendedProfile: true,
    hasPersonalLearnings: true,
    hasEnergeticMatching: true,
    hasFilterOptions: true,
    // VIP Features
    hasDeepHumanDesign: true,
    hasPlanetAnalysis: true,
    hasChironLilithNodes: true,
    hasSexualityAnalysis: true,
    hasBusinessAnalysis: true,
    hasRelationshipSignature: true,
    hasDeepResonanceReports: true,
    hasTimeDynamics: true,
    hasConflictAnalysis: true,
    hasSolutionStrategies: true,
    hasWeeklyForecast: true,
    hasAskYourChart: true,
    hasJournaling: true,
    hasPrioritizedMatches: true,
    hasFreeReading: true, // Ein Reading kostenlos
    maxCoachingSessions: -1,
    hasVIPCommunity: true,
    hasPersonalCoach: true
  }
];
import { safeJsonParse } from '@/lib/supabase/client';

// Simple wrapper that renders same HTML on server and client
function MotionDivWrapper({ children, ...props }: any) {
  // Always render a div - same on server and client to avoid hydration errors
  return <div {...props}>{children}</div>;
}

// Client-only animation component - only renders after hydration
function BackgroundAnimations() {
  const [mounted, setMounted] = useState(false);
  const [MotionDiv, setMotionDiv] = useState<any>(null);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    // Only run on client after hydration
    setMounted(true);
    
    // Generate random positions only on client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStarPositions(stars);
    
    import('framer-motion').then((mod) => {
      setMotionDiv(() => mod.motion.div);
    });
  }, []);

  // Return empty fragment on server and before hydration to avoid mismatch
  if (!mounted || !MotionDiv || starPositions.length === 0) {
    return <></>;
  }

  return (
    <>
      {/* Animierte Sterne im Hintergrund */}
      {starPositions.map((star, i) => (
        <MotionDiv
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
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
        <MotionDiv
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
        <MotionDiv
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
    </>
  );
}

export default function PackageOverviewPage() {
  const router = useRouter();
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = safeJsonParse(userData, {});
        // Subscription-Service wird später implementiert
        const subscription = null;
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Abonnements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'basic': return <Star size={20} />;
      case 'premium': return <Diamond size={20} />;
      case 'vip': return <Crown size={20} />;
      default: return <Lock size={20} />;
    }
  };

  // Package-Farben
  const getPackageColor = (packageId: string) => {
    const colors: { [key: string]: string } = {
      'basic': '#3b82f6',
      'premium': '#8b5cf6',
      'vip': '#f59e0b'
    };
    return colors[packageId] || '#3b82f6';
  };

  // Zugängliche Seiten für Paket
  const getAccessiblePages = (packageId: string) => {
    return []; // Alle Seiten sind zugänglich
  };

  // Gruppierte Seiten
  const groupedPages = {
    'Grundfunktionen': [
      { name: 'Dashboard', path: '/dashboard', requiredPackage: 'basic' },
      { name: 'Profil', path: '/profil', requiredPackage: 'basic' },
      { name: 'Community', path: '/community', requiredPackage: 'basic' }
    ],
    'Erweiterte Funktionen': [
      { name: 'Analytics', path: '/analytics', requiredPackage: 'premium' },
      { name: 'API Access', path: '/api-access', requiredPackage: 'premium' },
      { name: 'Dating', path: '/dating', requiredPackage: 'premium' }
    ],
    'VIP Funktionen': [
      { name: 'VIP Community', path: '/vip-community', requiredPackage: 'vip' },
      { name: 'Dashboard VIP', path: '/dashboard-vip', requiredPackage: 'vip' }
    ]
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
    }}>
      <Box suppressHydrationWarning>
        <BackgroundAnimations />
      </Box>
      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        {/* Header */}
        <MotionDivWrapper
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Paket-Übersicht & Zugriffskontrolle
            </Typography>
            
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.7)',
              mb: 4,
              maxWidth: 800,
              mx: 'auto'
            }}>
              Übersicht über alle verfügbaren Pakete und deren Zugriffsebenen
            </Typography>

            {userSubscription && (
              <Alert severity="info" sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                color: '#F29F05'
              }}>
                <Typography variant="body1" sx={{ color: '#F29F05' }}>
                  <strong>Ihr aktuelles Paket:</strong> {userSubscription.packageId.toUpperCase()} 
                  {userSubscription.status === 'active' ? ' (Aktiv)' : ` (${userSubscription.status})`}
                </Typography>
              </Alert>
            )}
          </Box>
        </MotionDivWrapper>

        {/* Package Comparison */}
        <MotionDivWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            mb: 6
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
                Paket-Vergleich
              </Typography>
              
              <TableContainer component={Paper} sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.1)'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#F29F05', fontWeight: 'bold', borderColor: 'rgba(242, 159, 5, 0.2)' }}>Feature</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          textAlign: 'center',
                          background: pkg.id === 'vip' ? 'rgba(242, 159, 5, 0.15)' : pkg.id === 'premium' ? 'rgba(242, 159, 5, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(242, 159, 5, 0.2)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {getPackageIcon(pkg.id)}
                            {pkg.name}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Preis</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ color: 'white', textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {`${pkg.priceMonthly}€/Monat`}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Human Design Chart</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          <Check color="#F29F05" size={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Basis-Persönlichkeitsanalyse</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          <Check color="#F29F05" size={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Dating- & Friends-Community</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          <Check color="#F29F05" size={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Connection Key</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasConnectionKey ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Resonanzachsen & Goldadern</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasResonanceAxes ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Unbegrenzte Verbindungsanalysen</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasUnlimitedConnections ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Deep Human Design</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasDeepHumanDesign ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Planetenauswertungen (Chiron, Lilith, Nodes)</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasPlanetAnalysis ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Wöchentliche Energievorhersage</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasWeeklyForecast ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Journaling & Notizen</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasJournaling ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Persönlicher Coach</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasPersonalCoach ? <Check color="#F29F05" size={20} /> : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: 'rgba(242, 159, 5, 0.1)' }}>Reading inklusive</TableCell>
                      {subscriptionPackages.map((pkg: any) => (
                        <TableCell key={pkg.id} sx={{ textAlign: 'center', borderColor: 'rgba(242, 159, 5, 0.1)' }}>
                          {pkg.hasFreeReading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Check color="#F29F05" size={20} />
                              <Typography variant="caption" sx={{ color: '#F29F05', fontSize: '0.7rem' }}>
                                (149€ Wert)
                              </Typography>
                            </Box>
                          ) : <X color="#8C1D04" size={20} />}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </MotionDivWrapper>

        {/* Page Access by Category */}
        <MotionDivWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography variant="h4" sx={{ 
            color: 'white', 
            mb: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Seiten-Zugriff nach Kategorien
          </Typography>
          
          <Grid container spacing={4}>
            {Object.entries(groupedPages).map(([category, pages], categoryIndex) => (
              <Grid item xs={12} md={6} lg={4} key={category}>
                <MotionDivWrapper
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + categoryIndex * 0.1 }}
                >
                  <Card sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.15)',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(242, 159, 5, 0.25)',
                      borderColor: 'rgba(242, 159, 5, 0.3)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#F29F05', 
                        mb: 3,
                        fontWeight: 'bold'
                      }}>
                        {category}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {pages.map((page, pageIndex) => (
                          <Box key={pageIndex} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(242, 159, 5, 0.15)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(242, 159, 5, 0.1)',
                              borderColor: 'rgba(242, 159, 5, 0.3)'
                            }
                          }}>
                            <Box>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {page.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {page.path}
                              </Typography>
                            </Box>
                            <Chip
                              label={page.requiredPackage}
                              size="small"
                              sx={{
                                background: page.requiredPackage === 'vip' 
                                  ? 'rgba(242, 159, 5, 0.2)' 
                                  : page.requiredPackage === 'premium'
                                  ? 'rgba(242, 159, 5, 0.15)'
                                  : 'rgba(255, 255, 255, 0.1)',
                                color: page.requiredPackage === 'vip' || page.requiredPackage === 'premium'
                                  ? '#F29F05'
                                  : 'rgba(255, 255, 255, 0.8)',
                                border: `1px solid ${page.requiredPackage === 'vip' || page.requiredPackage === 'premium' ? 'rgba(242, 159, 5, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </MotionDivWrapper>
              </Grid>
            ))}
          </Grid>
        </MotionDivWrapper>

        {/* Action Buttons */}
        <MotionDivWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 6, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              href="/subscription"
              sx={{
                background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(242, 159, 5, 0.35)'
                }
              }}
            >
              Pakete vergleichen
              <ArrowRight size={20} style={{ marginLeft: 8 }} />
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              href="/dashboard"
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Zum Dashboard
            </Button>
          </Box>
        </MotionDivWrapper>

        {/* Individuelle Readings - Separater Bereich */}
        <MotionDivWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            mb: 6
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ 
                color: 'white', 
                mb: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}>
                ✨ Individuelle Readings
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                mb: 4, 
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto'
              }}>
                Exklusive, personalisierte Chart-Analysen – unabhängig vom Paket buchbar
              </Typography>

              <Alert severity="info" sx={{ 
                mb: 4,
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                color: '#F29F05'
              }}>
                <Typography variant="body2" sx={{ color: '#F29F05' }}>
                  <strong>Hinweis:</strong> Für personalisierte Readings sind mindestens Premium-Funktionen empfohlen.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: '#F29F05', 
                      mb: 2,
                      fontWeight: 'bold'
                    }}>
                      Human Design Reading
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: 'white', 
                      mb: 3,
                      fontWeight: 'bold'
                    }}>
                      149 €
                    </Typography>
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Persönliche Chart-Analyse
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Tore, Kanäle, Zentren
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Inkarnationskreuz
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Wunden & Wachstum
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        • Persönliche Fragen inkludiert
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(242, 159, 5, 0.35)'
                        }
                      }}
                    >
                      Jetzt buchen
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: '#F29F05', 
                      mb: 2,
                      fontWeight: 'bold'
                    }}>
                      Deep Blueprint Reading
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: 'white', 
                      mb: 3,
                      fontWeight: 'bold'
                    }}>
                      299 €
                    </Typography>
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Alles aus Human Design Reading +
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Planetenauswertungen
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Ferne Planeten
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Sexualität & Verbindung
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Business-Analyse
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        • Dein individueller Entwicklungsweg
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(242, 159, 5, 0.35)'
                        }
                      }}
                    >
                      Jetzt buchen
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.2)'
                    }
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: '#F29F05', 
                      mb: 2,
                      fontWeight: 'bold'
                    }}>
                      Connection Key Reading
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: 'white', 
                      mb: 3,
                      fontWeight: 'bold'
                    }}>
                      199 €
                    </Typography>
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Nur für 2 Personen
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Resonanzachsen
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Goldadern
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Emotionale, mentale, körperliche Dynamik
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        • Aktivierungseffekte
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        • Zukunftspotenziale der Verbindung
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(242, 159, 5, 0.35)'
                        }
                      }}
                    >
                      Jetzt buchen
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </MotionDivWrapper>
      </PageLayout>
    </Box>
  );
}


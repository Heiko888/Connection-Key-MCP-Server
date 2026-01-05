"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import { Star, Diamond, Crown, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface ImprovedAccessControlProps {
  path: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
  showUpgradePrompt?: boolean;
}

export default function ImprovedAccessControl({
  path,
  children,
  onUpgrade,
  showUpgradePrompt = true
}: ImprovedAccessControlProps) {
  const router = useRouter();
  // Subscription-Hook wird später implementiert
  const subscription = null;
  const hasPackage = (pkg: string) => true; // Alle Pakete erlaubt
  const isVIP = false;
  const isPremium = false;
  const isBasic = false;
  const [access, setAccess] = useState({
    canAccess: true,
    requiredPackage: 'free',
    currentPackage: 'free',
    upgradeRequired: false,
    message: 'Zugang gewährt'
  });

  useEffect(() => {
    checkAccess();
  }, [path, subscription]);

  const checkAccess = () => {
    // Bestimme erforderliches Paket basierend auf dem Pfad
    let requiredPackage = 'free';
    
    if (path.includes('/vip-community') || path.includes('/dashboard-vip')) {
      requiredPackage = 'vip';
    } else if (path.includes('/analytics') || path.includes('/api-access') || path.includes('/dating')) {
      requiredPackage = 'premium';
    } else if (path.includes('/dashboard') || path.includes('/community') || path.includes('/mondkalender')) {
      requiredPackage = 'basic';
    }

    const canAccess = hasPackage(requiredPackage);
    const currentPackage = 'free';

    setAccess({
      canAccess,
      requiredPackage,
      currentPackage,
      upgradeRequired: !canAccess && requiredPackage !== 'free',
      message: canAccess ? 'Zugang gewährt' : `Upgrade auf ${requiredPackage} erforderlich`
    });
  };

  // Wenn Zugang gewährt, zeige Inhalt
  if (access.canAccess) {
    return <>{children}</>;
  }

  // Upgrade-Prompt anzeigen
  if (showUpgradePrompt) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
        color: 'white',
        textAlign: 'center',
        p: 4
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper elevation={10} sx={{
            p: { xs: 4, md: 8 },
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '600px',
            mx: 'auto',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}>
            {/* Icon */}
            <Box sx={{ mb: 4 }}>
              {getPackageIcon(access.requiredPackage)}
            </Box>

            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 700, 
              color: 'white',
              mb: 2
            }}>
              {access.requiredPackage === 'vip' ? '👑 VIP-Bereich' : 
               access.requiredPackage === 'premium' ? '💎 Premium-Bereich' : 
               '⭐ Upgrade erforderlich'}
            </Typography>

            {/* Message */}
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mb: 4,
              lineHeight: 1.6
            }}>
              {access.requiredPackage === 'vip' 
                ? 'Dieser exklusive VIP-Bereich ist nur für Premium-Mitglieder verfügbar.'
                : access.requiredPackage === 'premium'
                ? 'Diese Premium-Funktionen sind nur für Premium-Mitglieder verfügbar.'
                : 'Diese Funktionen sind nur für Basic-Mitglieder verfügbar.'
              }
            </Typography>

            {/* Current vs Required Package */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={`Aktuell: ${getPackageName(access.currentPackage)}`} 
                  sx={{ 
                    bgcolor: getPackageColor(access.currentPackage), 
                    color: 'white', 
                    fontWeight: 700 
                  }} 
                />
                <ArrowRight size={20} />
                <Chip 
                  label={`Erforderlich: ${getPackageName(access.requiredPackage)}`} 
                  sx={{ 
                    bgcolor: getPackageColor(access.requiredPackage), 
                    color: 'white', 
                    fontWeight: 700 
                  }} 
                />
              </Box>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontWeight: 600 }}>
                🎯 Was du mit {getPackageName(access.requiredPackage)} erhältst:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {getPackageFeatures(access.requiredPackage).map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/pricing')}
                sx={{
                  background: `linear-gradient(45deg, ${getPackageColor(access.requiredPackage)}, ${getPackageColor(access.requiredPackage)}CC)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${getPackageColor(access.requiredPackage)}DD, ${getPackageColor(access.requiredPackage)}EE)`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                  },
                  borderRadius: '12px',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5
                }}
              >
                Jetzt upgraden
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/dashboard')}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)'
                  },
                  borderRadius: '12px',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5
                }}
              >
                Zum Dashboard
              </Button>
            </Box>

            {/* Test Mode (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                  🧪 Development Mode - Test-Subscriptions:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['free', 'basic', 'premium', 'vip'].map((pkg) => (
                    <Button
                      key={pkg}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        // subscriptionManager.setTestSubscription(pkg as any); // Entfernt - nicht mehr verfügbar
                        window.location.reload();
                      }}
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        fontSize: '0.7rem'
                      }}
                    >
                      {pkg}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Box>
    );
  }

  // Fallback: Zeige Inhalt trotzdem (für öffentliche App)
  return <>{children}</>;
}

// Helper Functions
function getPackageIcon(packageId: string) {
  const iconProps = { size: 48, style: { color: getPackageColor(packageId) } };
  
  switch (packageId) {
    case 'basic': return <Star {...iconProps} />;
    case 'premium': return <Diamond {...iconProps} />;
    case 'vip': return <Crown {...iconProps} />;
    case 'admin': return <Lock {...iconProps} />;
    default: return <Star {...iconProps} />;
  }
}

function getPackageColor(packageId: string): string {
  // Package-Farben
  const colors: { [key: string]: string } = {
    'free': '#6b7280',
    'basic': '#3b82f6',
    'premium': '#8b5cf6',
    'vip': '#f59e0b'
  };
  return colors[packageId] || '#6b7280';
}

function getPackageName(packageId: string): string {
  // Package-Namen
  const names: { [key: string]: string } = {
    'free': 'Free',
    'basic': 'Basic',
    'premium': 'Premium',
    'vip': 'VIP'
  };
  return names[packageId] || 'Free';
}

function getPackageFeatures(packageId: string): string[] {
  // Package-Features
  const features: { [key: string]: string[] } = {
    'free': ['Grundfunktionen'],
    'basic': ['Erweiterte Funktionen'],
    'premium': ['Premium-Funktionen'],
    'vip': ['VIP-Funktionen']
  };
  return features[packageId] || ['Grundfunktionen'];
}

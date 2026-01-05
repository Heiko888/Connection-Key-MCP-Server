'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import InstantResonanceAnalysis from '../../../components/InstantResonanceAnalysis';
import AccessControl from '../../../components/AccessControl';
import PublicHeader from '@/app/components/PublicHeader';
import Logo from '@/app/components/Logo';
import { safeJsonParse } from '@/lib/supabase/client';

export default function SofortAnalysePage() {
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData && userData.trim() !== '') {
        try {
          const user: any = safeJsonParse(userData, {});
          const subscription = {
            userId: user.id || 'unknown',
            packageId: (user.subscriptionPlan === 'premium' ? 'premium' : user.subscriptionPlan) || 'basic',
            plan: (user.subscriptionPlan === 'premium' ? 'premium' : user.subscriptionPlan) || 'basic',
            status: user.subscriptionStatus || 'active',
            startDate: user.subscriptionStartDate || new Date().toISOString(),
            endDate: user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: user.autoRenew || false,
            paymentMethod: user.paymentMethod || 'none',
            billingCycle: user.billingCycle || 'monthly'
          };
          setUserSubscription(subscription);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  return (
    <AccessControl
      path="/resonanzanalyse/sofort"
      userSubscription={userSubscription}
      onUpgrade={() => window.location.href = '/pricing'}
    >
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 4, md: 6 },
        pb: 8,
      }}>
        {/* Seitenhintergrundbild */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.3,
          }}
        >
          <Image
            src="/images/resonanz-hero-bg.png"
            alt="Resonanz Hintergrund"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </Box>
        
        {/* Overlay für bessere Lesbarkeit */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(11, 10, 15, 0.85) 0%, rgba(11, 10, 15, 0.7) 100%)',
            zIndex: 1,
          }}
        />
        
        {/* Animated Gold Stars Background */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 1 }}>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
              style={{
                position: 'absolute',
                width: `${10 + i * 2}px`,
                height: `${10 + i * 2}px`,
                background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.05}), transparent 70%)`,
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <PublicHeader />
          
          {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, md: 3 } }}>
            <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
          </Box>
          
          <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
            <InstantResonanceAnalysis />
          </Box>
        </Container>
      </Box>
    </AccessControl>
  );
}


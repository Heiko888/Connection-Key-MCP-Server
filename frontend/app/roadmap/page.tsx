"use client";
import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Target, Sparkles, Crown } from 'lucide-react';
import PersonalRoadmap from '@/components/PersonalRoadmap';
import AccessControl from '../../components/AccessControl';
import PageLayout from '../components/PageLayout';
import { safeJsonParse } from '@/lib/supabase/client';

export default function RoadmapPage() {
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = () => {
    if (typeof window !== 'undefined') {
      // Lade User-Daten aus localStorage
      const userData = localStorage.getItem('userData');
      if (userData && userData.trim() !== '') {
        try {
          const user: any = safeJsonParse(userData, {});
          
          // Erstelle UserSubscription-Objekt - korrigiere packageId für Premium
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

  // Roadmap ist für alle User zugänglich
  return (
    <AccessControl
      path="/roadmap"
      userSubscription={userSubscription}
      onUpgrade={() => window.location.href = '/pricing'}
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
        {/* Animated Gold Stars Background */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
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

        <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 2,
                    color: '#FFFFFF',
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                    lineHeight: 1.2
                  }}
                >
                  🗺️ Dein persönlicher Entwicklungsweg – geführt von Human Design
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontWeight: 300,
                    maxWidth: { xs: '100%', md: '700px' },
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    px: { xs: 2, md: 0 }
                  }}
                >
                  Ein roadmap-basiertes System, das dich Schritt für Schritt zu deiner authentischen Energie führt.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                  <Chip 
                    icon={<Sparkles size={14} />} 
                    label="Personalisiert" 
                    size="small"
                    sx={{ 
                      background: 'rgba(242, 159, 5, 0.2)',
                      color: '#F29F05',
                      fontWeight: 600,
                      border: '1px solid rgba(242, 159, 5, 0.3)'
                    }} 
                  />
                </Box>
              </Box>
            </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper elevation={0} sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              mb: { xs: 3, md: 4 },
              color: 'white',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Sparkles size={24} color="#F29F05" />
                <Typography variant="h5" sx={{ ml: 2, fontWeight: 700, color: '#F29F05', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Features</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 3 }, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 3, border: '1px solid rgba(242, 159, 5, 0.2)' }}>
                  <Target size={32} color="#F29F05" />
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1, color: 'white', fontSize: { xs: '1rem', md: '1.25rem' } }}>Personalisierte Schritte</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>Basierend auf deinem Human Design Profil</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    Deine Schritte werden dynamisch aus deinem Chart berechnet.
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 3 }, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 3, border: '1px solid rgba(242, 159, 5, 0.2)' }}>
                  <Sparkles size={32} color="#F29F05" />
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1, color: 'white', fontSize: { xs: '1rem', md: '1.25rem' } }}>Journal-Analyse</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>Erkenntnisse aus deinen Einträgen</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    Muster in deinen Einträgen werden erkannt und zeigen Wachstumspunkte.
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 3 }, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 3, border: '1px solid rgba(242, 159, 5, 0.2)' }}>
                  <Crown size={32} color="#F29F05" />
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 1, color: 'white', fontSize: { xs: '1rem', md: '1.25rem' } }}>Dating-Tipps</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5, fontSize: { xs: '0.875rem', md: '1rem' } }}>Orte & Aktivitäten basierend auf Hobbies</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    Vorschläge, die zu deiner Energie passen – nicht zu deinen Vorlieben.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Personal Roadmap Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <PersonalRoadmap />
            </Box>
          </motion.div>
          </Box>
        </PageLayout>
      </Box>
    </AccessControl>
  );
}

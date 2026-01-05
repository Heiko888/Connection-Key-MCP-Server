"use client";

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SSRSafeStars from '@/components/SSRSafeStars';
import UnifiedPageLayout from '@/components/UnifiedPageLayout';
import AIChatInterface from '../../components/AIChatInterface';
import { Bot, Sparkles, BookOpen, Users } from 'lucide-react';

export default function AIChatPage() {
  const [userChart, setUserChart] = useState(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuliere das Laden von Benutzerdaten
    const loadUserData = async () => {
      try {
        const savedChart = localStorage.getItem('userChart');
        const savedUserId = localStorage.getItem('userId');
        
        if (savedChart) {
          setUserChart(JSON.parse(savedChart));
        }
        
        if (savedUserId) {
          setUserId(savedUserId);
        } else {
          const tempUserId = `temp_${Date.now()}`;
          setUserId(tempUserId);
          localStorage.setItem('userId', tempUserId);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 48,
            height: 48,
            border: '3px solid rgba(255, 107, 157, 0.3)',
            borderTop: '3px solid #ff6b9d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            mx: 'auto',
            mb: 2
          }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Lade AI-Chat...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <UnifiedPageLayout
      title="🤖 AI Human Design Chat"
      subtitle="Erhalte personalisierte Einblicke in dein Human Design mit unserer KI-gestützten Analyse"
    >
      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              p: 3,
              textAlign: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255, 107, 157, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} color="#ff6b9d" />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                KI-gestützte Beratung
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Personalisierte Einblicke basierend auf deinem Human Design
              </Typography>
            </Box>

            <Box sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              p: 3,
              textAlign: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  background: 'rgba(78, 205, 196, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#4ecdc4" />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Tiefe Analysen
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Detaillierte Erklärungen zu deinen Energien und Mustern
              </Typography>
            </Box>

            <Box sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              p: 3,
              textAlign: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#667eea" />
                </Box>
              </Box>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Community-Integration
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Verbinde dich mit anderen und teile deine Erkenntnisse
              </Typography>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <AIChatInterface 
          userChart={userChart} 
          userId={userId || undefined} 
        />
      </motion.div>
    </UnifiedPageLayout>
  );
}
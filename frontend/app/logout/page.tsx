"use client";
import React, { useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Logout-Logik
    const performLogout = async () => {
      try {
        // Supabase-Logout (wichtig für Server-seitige Session)
        const { getSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseClient();
        
        try {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.warn('Supabase-Logout-Warnung:', signOutError);
            // Weiter mit localStorage-Cleanup auch bei Fehler
          }
        } catch (supabaseError) {
          console.warn('Supabase-Logout-Fehler:', supabaseError);
          // Weiter mit localStorage-Cleanup auch bei Fehler
        }
        
        // Entferne alle gespeicherten Daten
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPackage');
        localStorage.removeItem('userData');
        localStorage.removeItem('profileData');
        localStorage.removeItem('chartData');
        localStorage.removeItem('moonTrackingEntries');
        localStorage.removeItem('journalEntries');
        // ✅ DEAKTIVIERT: profileSetupCompleted wird nicht mehr verwendet
        
        console.log('✅ Logout erfolgreich');
        
        // Nach 2 Sekunden zur Startseite weiterleiten
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Logout-Fehler:', error);
        // Auch bei Fehlern localStorage leeren und zur Startseite weiterleiten
        localStorage.clear();
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    performLogout();
  }, [router]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <motion.div
          
          
          
        >
          <Box sx={{ 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 6,
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }}>
            {/* Logout-Icon */}
            <motion.div
              
              
              
            >
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                mb: 3
              }}>
                <LogOut size={40} color="#1a1a2e" />
              </Box>
            </motion.div>

            {/* Titel */}
            <Typography variant="h4" sx={{ 
              color: '#1a1a2e', 
              fontWeight: 'bold', 
              mb: 2 
            }}>
              Abmeldung
            </Typography>

            {/* Status */}
            <motion.div
              
              
              
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                <CircularProgress size={24} sx={{ color: '#FFD700' }} />
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Sie werden abgemeldet...
                </Typography>
              </Box>
            </motion.div>

            {/* Erfolgsmeldung */}
            <motion.div
              
              
              
            >
              <Alert 
                severity="success" 
                icon={<CheckCircle size={20} />}
                sx={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#065f46'
                }}
              >
                Abmeldung erfolgreich! Sie werden zur Startseite weitergeleitet.
              </Alert>
            </motion.div>

            {/* Zusätzliche Informationen */}
            <motion.div
              
              
              
            >
              <Typography variant="body2" sx={{ 
                color: '#888', 
                mt: 3,
                fontStyle: 'italic'
              }}>
                Alle Ihre Daten wurden sicher aus dem lokalen Speicher entfernt.
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

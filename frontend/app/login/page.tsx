"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress, 
  Container, 
  Paper,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { safeJsonParse, supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

interface LoginData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const authResult = useAuth();
  const { login, user, loading, isAuthenticated } = authResult;
  
  // Debug: Prüfe ob login verfügbar ist
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAuth Result:', {
        hasLogin: !!login,
        loginType: typeof login,
        allKeys: Object.keys(authResult),
      });
    }
  }, [login, authResult]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // Prüfe, ob User bereits eingeloggt ist
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // User ist bereits eingeloggt → weiterleiten zu Dashboard
      console.log('✅ User bereits eingeloggt, weiterleiten zu Dashboard', {
        userId: user.id,
        package: user.package
      });
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  // Keine automatische Weiterleitung - Benutzer kann sich jederzeit einloggen
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Fehler und Erfolg beim Eingeben zurücksetzen
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.email || !formData.password) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }
    
    // Prüfe, ob login-Funktion verfügbar ist (vor setIsLoading)
    if (!login || typeof login !== 'function') {
      console.error('Login-Funktion nicht verfügbar:', { login, type: typeof login });
      setError('Login-Funktion nicht verfügbar. Bitte Seite neu laden.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verwende useAuth Hook für Login
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || 'Anmeldung fehlgeschlagen');
        setIsLoading(false);
      } else {
        // Erfolgsmeldung anzeigen
        setError('');
        setSuccess('✅ Login erfolgreich! Weiterleitung...');

        // ⚡ Auf Mobile: Länger warten, damit Auth-State gesetzt werden kann
        // Dann direkt zum Dashboard weiterleiten
        const redirectDelay = window.innerWidth < 768 ? 1500 : 500;
        setTimeout(() => {
          router.push('/dashboard');
        }, redirectDelay);
      }

    } catch (err) {
      console.error('Login-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
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
      
      {/* Globaler Header kommt aus AppHeader */}

      <Container maxWidth="sm" sx={{ pt: { xs: 14, md: 16 }, pb: 8, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%' } as React.CSSProperties}
        >
          <Paper 
            elevation={0} 
            sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 0 30px rgba(242, 159, 5, 0.25)'
              }}
            >
              Anmeldung
            </Typography>
          
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ mb: 5, color: 'text.secondary', lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Melde dich in deinem Konto an
            </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            name="email"
            label="E-Mail-Adresse"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="inherit" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            required
            fullWidth
            name="password"
            label="Passwort"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="inherit" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    color="inherit"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 4 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mb: 4, px: 6, py: 2.5, textTransform: 'none', borderRadius: 3 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : '🔐 Anmelden'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Noch kein Konto?{' '}
              <Button 
                component={Link}
                href="/register"
                variant="text" 
                disabled={isLoading}
                sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
              >
                Jetzt registrieren
              </Button>
            </Typography>

            <Button 
              component={Link}
              href="/"
              variant="text" 
              disabled={isLoading}
              sx={{ textTransform: 'none', fontSize: '0.9rem' }}
            >
              ← Zurück zur Startseite
            </Button>
          </Box>
        </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;

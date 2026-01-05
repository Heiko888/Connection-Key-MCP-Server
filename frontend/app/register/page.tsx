"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress, 
  Container, 
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  LocationOn, 
  Person, 
  Email, 
  Lock,
  Visibility,
  VisibilityOff,
  Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import UserDataService from '@/lib/services/userDataService';

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  subscription: 'free' | 'basic' | 'premium' | 'vip';
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    subscription: 'free'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Formatierung für Geburtsdatum dd/mm/yyyy
  const formatBirthDate = (value: string) => {
    // Entferne alle Nicht-Zahlen
    const numbers = value.replace(/\D/g, '');
    
    // Formatierung: dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBirthDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      birthDate: formattedValue
    }));
  };

  // Konvertierung von dd/mm/yyyy zu yyyy-mm-dd für API
  const convertBirthDateForAPI = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      return 'Bitte füllen Sie alle Pflichtfelder aus.';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Die Passwörter stimmen nicht überein.';
    }
    
    if (formData.password.length < 6) {
      return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      // Echte API-Registrierung
      // Supabase Registrierung
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (error) {
        // Fehler bei der Registrierung
        setError(error.message || 'Registrierung fehlgeschlagen');
      } else {
        // Registrierung erfolgreich
        setSuccess(true);
        // Profildaten lokal speichern mit UserDataService
        try {
          if (typeof window !== 'undefined') {
            // Verwende UserDataService für konsistente Datenstruktur
            UserDataService.updateUserData({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              package: formData.subscription,
              createdAt: new Date().toISOString()
            });

            // Setze userId und Token, falls Supabase sie sofort liefert
            if (data?.user?.id) {
              UserDataService.setUserId(data.user.id);
            }
            if (data?.session?.access_token) {
              UserDataService.setToken(data.session.access_token);
            }
          }
        } catch (error) {
          console.error('Fehler beim Speichern der Profildaten:', error);
        }
        
        // ✅ DEAKTIVIERT: Profil-Einrichtung
        // Nach 2 Sekunden direkt zum Dashboard weiterleiten
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }

    } catch (err) {
      console.error('Registrierungsfehler:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: 2 }}>
              ✅ Registrierung erfolgreich!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Willkommen bei The Connection Key! Sie werden in Kürze zum Dashboard weitergeleitet.
            </Typography>
            <CircularProgress sx={{ color: '#F29F05' }} />
          </Paper>
        </Container>
      </Box>
    );
  }

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
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h2" sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 0 30px rgba(242, 159, 5, 0.25)'
              }}>
                Registrierung
        </Typography>
              <Typography variant="h6" sx={{ 
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
          Erstelle dein Konto und entdecke dein Human Design
        </Typography>
            </Box>

        {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Persönliche Daten */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: '#F29F05' }} />
                    Persönliche Daten
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="firstName"
              label="Vorname"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(242, 159, 5, 0.10)',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="lastName"
              label="Nachname"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(242, 159, 5, 0.10)',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                {/* Kontakt */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1, color: '#F29F05' }} />
                    Kontakt
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
          <TextField
            required
            fullWidth
            name="email"
            label="E-Mail-Adresse"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(242, 159, 5, 0.10)',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                {/* Passwort */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Lock sx={{ mr: 1, color: '#8C1D04' }} />
                    Passwort
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="password"
            label="Passwort"
                    type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
            helperText="Mindestens 6 Zeichen"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(242, 159, 5, 0.10)',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputBase-input': { color: 'white' },
                      '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="confirmPassword"
            label="Passwort bestätigen"
                    type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(242, 159, 5, 0.10)',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                {/* Geburtsdaten entfernt */}

                {/* Subscription */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: '#F29F05' }} />
                    Abonnement wählen
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Abonnement</InputLabel>
                    <Select
                      value={formData.subscription}
                      onChange={(e) => setFormData(prev => ({ ...prev, subscription: e.target.value as any }))}
                      disabled={loading}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.10)',
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242, 159, 5, 0.30)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242, 159, 5, 0.45)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F29F05' }
                      }}
                    >
                      <MenuItem value="free">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Kostenlos" size="small" color="default" />
                            <Typography>Basis-Features</Typography>
                          </Box>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            0€
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="basic">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Basic" size="small" color="primary" />
                            <Typography>Erweiterte Features</Typography>
                          </Box>
                          <Typography sx={{ color: '#F29F05', fontWeight: 700 }}>
                            9,99€/Monat
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="premium">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Premium" size="small" color="secondary" />
                            <Typography>Alle Features</Typography>
                          </Box>
                          <Typography sx={{ color: '#8C1D04', fontWeight: 700 }}>
                            19,99€/Monat
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="vip">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="VIP" size="small" sx={{ background: 'linear-gradient(45deg, #F29F05, #8C1D04)', color: 'white' }} />
                            <Typography>Premium + Coaching</Typography>
                          </Box>
                          <Typography sx={{ color: '#590A03', fontWeight: 700 }}>
                            49,99€/Monat
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
                    px: 6,
                    py: 2.5,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: '300px' },
              boxShadow: '0 10px 30px rgba(242, 159, 5, 0.35)',
              '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 15px 40px rgba(242, 159, 5, 0.45)'
              },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)'
                    },
                    transition: 'all 0.3s ease'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '✨ Konto erstellen'}
          </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Bereits ein Konto?{' '}
              <Button 
                    component={Link}
                    href="/login"
                variant="text" 
                disabled={loading}
                    sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
              >
                Jetzt anmelden
              </Button>
            </Typography>

            <Button 
                  component={Link}
                  href="/"
              variant="text" 
              disabled={loading}
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

export default RegisterPage;


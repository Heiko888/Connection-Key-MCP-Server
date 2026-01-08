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
  IconButton
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

interface LoginData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { signIn, user, loading, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // Bereits eingeloggt → Dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (!signIn) {
      setError('Login-Funktion nicht verfügbar.');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ signIn hat KEINE Parameter
      await signIn();

      setSuccess('✅ Login erfolgreich! Weiterleitung...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ein unbekannter Fehler ist aufgetreten.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#0b0a0f' }}>
      <Container
        maxWidth="sm"
        sx={{
          pt: { xs: 14, md: 16 },
          pb: 8,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '100%' }}
        >
          <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 2, fontWeight: 800 }}
            >
              Anmeldung
            </Typography>

            <Typography align="center" sx={{ mb: 4, color: 'text.secondary' }}>
              Melde dich in deinem Konto an
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                name="email"
                label="E-Mail-Adresse"
                value={formData.email}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                required
                name="password"
                label="Passwort"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : '🔐 Anmelden'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography sx={{ mb: 2 }}>
                  Noch kein Konto?{' '}
                  <Button component={Link} href="/register" variant="text">
                    Jetzt registrieren
                  </Button>
                </Typography>

                <Button component={Link} href="/" variant="text">
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

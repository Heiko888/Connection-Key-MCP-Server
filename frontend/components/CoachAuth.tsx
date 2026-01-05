"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { Shield, LogIn, ArrowLeft } from 'lucide-react';

interface CoachAuthProps {
  children: React.ReactNode;
}

export default function CoachAuth({ children }: CoachAuthProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Verhindere mehrfache gleichzeitige Aufrufe
    if (isCheckingRef.current) {
      console.log('⚠️ CoachAuth - checkAuth bereits in Ausführung, überspringe...');
      return;
    }

    isCheckingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      // Prüfe ob User eingeloggt ist
      const supabase = createClient();
      
      // Versuche zuerst getSession() (funktioniert besser client-side)
      let user = null;
      let authError = null;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 CoachAuth - getSession Ergebnis:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: sessionError?.message
        });
        
        if (session?.user) {
          user = session.user;
        } else if (sessionError) {
          authError = sessionError;
        } else {
          // Fallback: getUser() wenn keine Session
          const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
          user = userData || null;
          authError = userError || null;
          
          console.log('🔍 CoachAuth - getUser Fallback:', {
            hasUser: !!user,
            error: authError?.message
          });
        }
      } catch (err) {
        console.error('❌ CoachAuth - Session-Fehler:', err);
        authError = err as any;
      }

      if (authError || !user) {
        console.warn('⚠️ CoachAuth - User nicht authentifiziert:', {
          error: authError?.message,
          hasUser: !!user
        });
        setIsAuthenticated(false);
        setIsCoach(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Prüfe ob User Coach-Rolle hat
      // Option 1: Über User-Metadaten
      const userRole = user.user_metadata?.role || user.user_metadata?.user_role;
      
      // Option 2: Über Profile-Tabelle (falls vorhanden)
      let coachRole = false;
      if (userRole === 'coach' || userRole === 'admin') {
        coachRole = true;
      } else {
        // Prüfe in profiles Tabelle
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_coach')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // PGRST116 Trace
        if (profileError?.code === 'PGRST116') {
          console.error('[PGRST116 TRACE] CoachAuth.tsx:104', {
            file: 'CoachAuth.tsx',
            fn: 'useEffect',
            line: 104,
            queryContext: {
              table: 'profiles',
              filter: { user_id: user.id },
              method: 'single()',
            },
            error: profileError,
          });
          console.error(new Error('PGRST116 STACK').stack);
        }

        const profile = profiles?.[0];

        if (!profileError && profile) {
          coachRole = profile.role === 'coach' || profile.role === 'admin' || profile.is_coach === true;
        }
      }

      // Option 3: Falls noch nicht gefunden, prüfe über API-Route
      if (!coachRole) {
        try {
          const response = await fetch(`/api/admin/users/coach?userId=${user.id}`);
          const data = await response.json();
          if (data.success && data.user?.isCoach) {
            coachRole = true;
          }
        } catch (apiError) {
          console.warn('API-Prüfung fehlgeschlagen, verwende lokale Prüfung:', apiError);
        }
      }

      setIsCoach(coachRole);
      setLoading(false);

      if (!coachRole) {
        setError('Du hast keine Berechtigung für den Coach-Bereich. Bitte kontaktiere den Administrator oder verwende das Admin-Panel, um die Coach-Rolle zu vergeben.');
      }
    } catch (err) {
      console.error('Fehler bei Authentifizierungsprüfung:', err);
      setError('Fehler bei der Authentifizierungsprüfung');
      setLoading(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Nur einmal beim Mount ausführen

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
        }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
          }}
        >
          <CircularProgress sx={{ color: '#F29F05', mb: 2 }} />
          <Typography variant="body1" sx={{ color: 'white' }}>
            Authentifizierung wird geprüft...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Shield size={48} color="#F29F05" style={{ marginBottom: 16 }} />
            <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              🔒 Authentifizierung erforderlich
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              Du musst dich anmelden, um auf den Coach-Bereich zuzugreifen.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<LogIn size={20} />}
                onClick={() => router.push('/login')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  },
                }}
              >
                Anmelden
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                onClick={() => router.push('/')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                }}
              >
                Zur Startseite
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!isCoach) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Shield size={48} color="#F29F05" style={{ marginBottom: 16 }} />
            <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              🔒 Zugriff verweigert
            </Typography>
            {error && (
              <Alert severity="warning" sx={{ mb: 3, background: 'rgba(242, 159, 5, 0.1)', border: '1px solid rgba(242, 159, 5, 0.3)' }}>
                {error}
              </Alert>
            )}
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              Du hast keine Berechtigung für den Coach-Bereich. Nur autorisierte Coaches können auf diesen Bereich zugreifen.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={20} />}
              onClick={() => router.push('/')}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                },
              }}
            >
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // User ist authentifiziert und hat Coach-Rolle
  return <>{children}</>;
}


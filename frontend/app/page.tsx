'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PublicHeader from './components/PublicHeader';
import Logo from './components/Logo';

import {
  Key,
  Heart,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Target,
  Calendar,
} from 'lucide-react';

/* ---------------------------
   Motion Wrapper (unverändert)
---------------------------- */
function MotionWrapper({ children, ...props }: any) {
  const [mounted, setMounted] = useState(false);
  const [MotionDiv, setMotionDiv] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('framer-motion').then((mod) => {
      setMotionDiv(() => mod.motion.div);
    });
  }, []);

  if (!mounted || !MotionDiv) {
    return <div {...props}>{children}</div>;
  }

  return <MotionDiv {...props}>{children}</MotionDiv>;
}

/* ---------------------------
   STARTSEITE
---------------------------- */
export default function HomePage() {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)
        `,
      }}
    >
      {/* 🔹 Header Wrapper – konsistent mit allen Public Pages */}
      <Box
        sx={{
          pt: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
        }}
      >
        <Container maxWidth="lg">
          <PublicHeader />
        </Container>
      </Box>

      {/* 🔹 Seiteninhalt */}
      <Container maxWidth="lg" sx={{ pt: 0, pb: 10 }}>
        {/* LOGO */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: { xs: 4, md: 6 } }}>
          <Logo height={180} width={600} />
        </Box>

        {/* HERO */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{ color: 'white', fontWeight: 800, mb: 3 }}
          >
            Begegnungen sind kein Zufall –<br />sie sind Resonanz.
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Der Connection Key zeigt dir, warum bestimmte Menschen
            in deinem Leben auftauchen – und was energetisch zwischen euch wirkt.
          </Typography>

          <Box sx={{ mt: 6 }}>
            <Button
              component={Link}
              href="/resonanzanalyse/sofort"
              variant="contained"
              size="large"
              startIcon={<Key />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
            >
              Jetzt Resonanzanalyse starten
            </Button>
          </Box>
        </Box>

        {/* FEATURES */}
        <Grid container spacing={4} sx={{ mb: 12 }}>
          {[
            {
              icon: <Heart size={32} />,
              title: 'Resonanz',
              text: 'Warum ihr euch anzieht oder triggert.',
            },
            {
              icon: <Sparkles size={32} />,
              title: 'Goldadern',
              text: 'Eure gemeinsamen energetischen Potenziale.',
            },
            {
              icon: <Target size={32} />,
              title: 'Bewusstsein',
              text: 'Verstehen statt raten.',
            },
            {
              icon: <Zap size={32} />,
              title: 'Transformation',
              text: 'Beziehungen auf eine neue Ebene bringen.',
            },
          ].map((f, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card
                sx={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(242,159,5,0.3)',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: '#F29F05', mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {f.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ color: 'white', fontWeight: 700, mb: 3 }}
          >
            Bereit, die Wahrheit zwischen euch zu sehen?
          </Typography>

          <Button
            component={Link}
            href="/connection-key/booking"
            variant="outlined"
            size="large"
            startIcon={<Calendar />}
            sx={{
              borderColor: '#F29F05',
              color: '#F29F05',
              px: 5,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Session buchen
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

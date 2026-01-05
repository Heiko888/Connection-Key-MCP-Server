'use client';

// Verhindere statisches Prerendering (wegen useRouter und framer-motion)
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
  Stack,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Logo from '@/app/components/Logo';
import PublicHeader from '@/app/components/PublicHeader';
import { 
  Key, 
  Heart, 
  ArrowRight, 
  Star, 
  Sparkles,
  Users,
  UsersRound,
  Zap,
  Target,
  CheckCircle,
  Check,
  Calendar,
  Video,
  FileText,
  User,
  Mail,
  LogIn,
  UserPlus,
  Award,
  Activity,
  Globe2,
} from 'lucide-react';

// Sparkle-Positionen für animierte Hintergrund-Funken
const sparklePositions = [
  { left: 15, top: 20 }, { left: 75, top: 35 }, { left: 45, top: 60 },
  { left: 85, top: 15 }, { left: 25, top: 80 }, { left: 65, top: 45 },
  { left: 10, top: 55 }, { left: 90, top: 70 }, { left: 35, top: 25 },
  { left: 55, top: 85 }, { left: 70, top: 10 }, { left: 30, top: 90 },
  { left: 50, top: 40 }, { left: 20, top: 65 }, { left: 80, top: 50 }
];

const sparkleAnimations = [
  { duration: 2.5, delay: 0.3 }, { duration: 3.2, delay: 1.1 }, { duration: 2.8, delay: 0.7 },
  { duration: 3.5, delay: 1.5 }, { duration: 2.3, delay: 0.5 }, { duration: 3.8, delay: 1.8 },
  { duration: 2.6, delay: 0.9 }, { duration: 3.0, delay: 1.2 }, { duration: 2.9, delay: 0.4 },
  { duration: 3.3, delay: 1.6 }, { duration: 2.7, delay: 0.8 }, { duration: 3.6, delay: 1.4 },
  { duration: 2.4, delay: 0.6 }, { duration: 3.1, delay: 1.3 }, { duration: 2.5, delay: 0.9 }
];

const features = [
  {
    icon: <Heart size={32} />,
    title: 'Resonanz',
    description: 'Erkenne, warum ihr harmoniert – und wo Spannung entsteht. Die energetische Verbindung wird sichtbar und nachvollziehbar.',
  },
  {
    icon: <Sparkles size={32} />,
    title: 'Goldadern',
    description: 'Sieh die unsichtbaren Linien der Verbindung. Erkenne, wo eure Energien harmonisch fließen und wo sie sich blockieren.',
  },
  {
    icon: <Target size={32} />,
    title: 'Bewusstsein',
    description: 'Verstehe eure energetischen Muster auf den ersten Blick. Erkenne die Dynamiken hinter eurer Beziehung und löse sie bewusst auf.',
  },
  {
    icon: <Zap size={32} />,
    title: 'Transformation',
    description: 'Lerne, wie ihr eure Verbindung bewusst verbessern könnt. Löse energetische Blockaden, die eure Beziehung ausbremsen – und hebe sie auf eine neue Ebene.',
  },
];

// Client-only animation component - only renders after hydration
function BackgroundAnimations() {
  const [mounted, setMounted] = useState(false);
  const [MotionDiv, setMotionDiv] = useState<any>(null);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    // Only run on client after hydration
    setMounted(true);
    
    // Generate random positions only on client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
    }));
    setStarPositions(stars);
    
    import('framer-motion').then((mod) => {
      setMotionDiv(() => mod.motion.div);
    });
  }, []);

  // Return empty fragment on server and before hydration to avoid mismatch
  if (!mounted || !MotionDiv || starPositions.length === 0) {
    return <></>;
  }

  return (
    <>
      {/* Animierte Sterne im Hintergrund */}
      {starPositions.map((star, i) => (
        <MotionDiv
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      {/* Animierte Planeten-Orbits */}
      {Array.from({ length: 3 }).map((_, i) => (
        <MotionDiv
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
        <MotionDiv
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

      {/* Sparkles */}
      {sparklePositions.map((pos, i) => (
        <MotionDiv
          key={`sparkle-${i}`}
          style={{
            position: 'absolute',
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            width: '4px',
            height: '4px',
            background: '#F29F05',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(242, 159, 5, 0.8)',
            pointerEvents: 'none',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: sparkleAnimations[i].duration,
            delay: sparkleAnimations[i].delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

// Client-only motion wrapper for interactive elements
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

export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  // ✅ Auto-Redirect: Wenn eingeloggt → Dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // ⚡ FIX für Mobile: Zeige die Seite auch während des Ladens
  // Verhindert Dauerladeschleife wenn useAuth hängt
  // ✅ Wenn eingeloggt, zeige nichts (Redirect läuft)
  if (isAuthenticated) {
    return null;
  }
  
  // ⚡ Zeige die Seite auch während loading (für Mobile-Fallback)
  // Die Seite wird trotzdem gerendert, auch wenn Auth noch lädt

  // ✅ Nur für nicht-eingeloggte User: Landingpage anzeigen

  const handleImageError = (coachName: string) => {
    setImageErrors((prev) => ({ ...prev, [coachName]: true }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        pt: { xs: 4, md: 6 },
        pb: 8,
        overflow: 'hidden',
      }}
    >
      <BackgroundAnimations />

      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />

        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>

          {/* Headline - Mobile optimiert */}
          <Typography
            variant="h2"
            component="div"
            sx={{
              color: 'white',
              mb: { xs: 1.5, md: 3 },
              maxWidth: 900,
              mx: 'auto',
              px: { xs: 2, md: 0 },
              lineHeight: { xs: 1.3, md: 1.3 },
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
              '& br': {
                display: { xs: 'block', md: 'none' }
              }
            }}
          >
            Begegnungen sind kein Zufall –<br />
            sie sind Resonanz.
          </Typography>
          
          {/* Subheadline - Mobile kompakter */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: { xs: 2, md: 3 },
              maxWidth: 800,
              mx: 'auto',
              px: { xs: 2, md: 0 },
              lineHeight: { xs: 1.5, md: 1.6 },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.4rem' },
              fontWeight: 500,
              '& br': {
                display: { xs: 'none', md: 'block' }
              }
            }}
          >
            Der Connection Key zeigt dir, <strong style={{ color: '#F29F05' }}>WARUM</strong> bestimmte Menschen in deinem Leben auftauchen –<br />
            und welche tiefere energetische Wahrheit dahintersteht.
          </Typography>

          {/* Mini-Story - Mobile kürzer */}
          <Box sx={{ 
            maxWidth: 700, 
            mx: 'auto', 
            mb: { xs: 3, md: 5 },
            px: { xs: 2, md: 0 }
          }}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: { xs: 1.6, md: 1.8 },
                fontSize: { xs: '0.85rem', md: '1.1rem' },
                fontStyle: 'italic',
                textAlign: 'center',
                '& br': {
                  display: { xs: 'none', md: 'block' }
                }
              }}
            >
              Die meisten Menschen glauben an Zufall.
              <br />
              Doch wenn du verstehst, wie Energie Menschen zueinander führt,
              <br />
              erkennst du plötzlich die Muster hinter deinen Verbindungen.
            </Typography>
          </Box>

          {/* Haupt-CTA - Mobile optimiert */}
          <Box sx={{ mb: { xs: 4, md: 6 }, px: { xs: 2, md: 0 } }}>
            <Link href="/resonanzanalyse/sofort" style={{ textDecoration: 'none' }}>
              <MotionWrapper
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  fullWidth={true}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: { xs: 3, md: 10 },
                    py: { xs: 1.5, md: 2.5 },
                    fontSize: { xs: '0.95rem', md: '1.3rem' },
                    borderRadius: 4,
                    boxShadow: '0 8px 30px rgba(242, 159, 5, 0.5)',
                    width: { xs: '100%', sm: 'auto' },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.6)',
                      '&::before': {
                        left: '100%',
                      },
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Key size={20} style={{ marginRight: 8 }} />
                  Jetzt Resonanzanalyse starten
                </Button>
              </MotionWrapper>
            </Link>
          </Box>
        </Box>

        {/* Problem-Nutzen-Lösung Sektion */}
        <Box sx={{ mb: { xs: 6, md: 10 }, pt: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12), rgba(140, 29, 4, 0.08))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 3, md: 6 },
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 2, md: 3 },
                  textAlign: 'center',
                  px: { xs: 1, md: 0 },
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.25rem' },
                }}
              >
                Warum brauchst du den Connection Key?
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: { xs: 3, md: 4 },
                  textAlign: 'center',
                  px: { xs: 2, md: 0 },
                  lineHeight: { xs: 1.6, md: 1.8 },
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 500,
                }}
              >
                Die Qualität deiner Beziehungen bestimmt die Qualität in deinem Leben: Egal mit wem. Lebenspartner, Eltern, Kindern, Arbeitskollegen und Geschäftspartnern
              </Typography>
              
              <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 1, md: 2 } }}>
                {[
                  {
                    icon: <Heart size={28} />,
                    title: 'Klarheit über eure Verbindung',
                    text: 'Du willst wissen, warum die Verbindung zwischen Dir und deinen Beziehungen leicht oder schwer ist - ohne Rätselraten. Erkenne endlich, was wirklich passiert.',
                  },
                  {
                    icon: <Target size={28} />,
                    title: 'Missverständnisse vermeiden',
                    text: 'Erkenne, warum bestimmte Konflikte zwischen Dir und deinen Beziehungen immer wieder entstehen - und wie du sie auflösen kannst. Keine endlosen Diskussionen über die selben Themen die dich frustrieren.',
                  },
                  {
                    icon: <Zap size={28} />,
                    title: 'Energetische Harmonie',
                    text: 'Du willst erkennen wo du mit deinen Beziehungen energetisch harmonierst und wo die Reibungspunkte liegen. Erkenne, wann Beziehungen sich gegenseitig aufladen und wann sie sich auslaugen.',
                  },
                  {
                    icon: <Sparkles size={28} />,
                    title: 'Bewusste Verbindung',
                    text: 'Du willst deine Beziehungen auf eine neue Ebene heben - mit Klarheit statt Intuition allein. Baue tiefere und bewusstere Verbindungen auf.',
                  },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: { xs: 1.5, md: 2 },
                        p: { xs: 1.5, md: 2 },
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.08)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ color: '#F29F05', flexShrink: 0, mt: 0.5 }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: 'white', 
                          fontWeight: 700, 
                          mb: { xs: 0.5, md: 1 }, 
                          fontSize: { xs: '1rem', md: '1.1rem' } 
                        }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          lineHeight: { xs: 1.6, md: 1.7 },
                          fontSize: { xs: '0.875rem', md: '0.95rem' }
                        }}>
                          {item.text}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </MotionWrapper>
        </Box>

        {/* Story hinter dem Connection Key */}
        <Box sx={{ mb: { xs: 6, md: 10 }, px: { xs: 1, md: 0 } }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.12))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 3, md: 4 },
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Der Connection Key entstand aus einem Moment, der alles verändert hat.
              </Typography>
              
              <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: { xs: 1.8, md: 2 },
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    textAlign: 'center',
                    mb: 3,
                  }}
                >
                  Ich habe lange geglaubt, Begegnungen passieren einfach.
                  <br />
                  <br />
                  Doch es gab einen Moment in meinem Leben, der mir gezeigt hat,
                  <br />
                  dass Verbindungen viel tiefer gehen – und dass wir energetisch
                  <br />
                  jeden Menschen anziehen oder abstoßen.
                  <br />
                  <br />
                  <strong style={{ color: '#F29F05' }}>Diese Erkenntnis hat alles verändert.</strong>
                  <br />
                  <br />
                  Plötzlich verstand ich, warum manche Menschen wie Schicksal wirken.
                  <br />
                  Warum bestimmte Begegnungen Türen öffnen – und andere schließen.
                  <br />
                  Warum manche Verbindungen heilen – und andere triggern.
                  <br />
                  <br />
                  Der Connection Key ist das Tool, das mir fehlte.
                  <br />
                  <strong style={{ color: '#F29F05' }}>Und jetzt ist es da – für dich.</strong>
                </Typography>
                
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    component={Link}
                    href="#connection-key-explained"
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 600,
                      px: { xs: 3, md: 5 },
                      py: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Wie funktioniert der Connection Key?
                  </Button>
                </Box>
              </Box>
            </Card>
          </MotionWrapper>
        </Box>

        {/* Features */}
        <Box sx={{ mb: { xs: 6, md: 10 }, px: { xs: 1, md: 0 } }}>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 3,
                    p: { xs: 2.5, md: 3 },
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: '#F29F05',
                      boxShadow: '0 10px 40px rgba(242,159,5,0.3)',
                    },
                  }}
                >
                  <Box sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    mb: { xs: 1.5, md: 2 }, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    transition: 'color 0.3s', 
                    '&:hover': { color: '#F29F05' },
                    '& svg': {
                      width: { xs: 28, md: 32 },
                      height: { xs: 28, md: 32 }
                    }
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: '#fff', 
                    mb: { xs: 0.75, md: 1 }, 
                    fontWeight: 700,
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    lineHeight: { xs: 1.5, md: 1.6 }
                  }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Was ist The Connection Key? - Neue emotionale Version */}
        <Box id="connection-key-explained" sx={{ mb: { xs: 6, md: 10 }, px: { xs: 1, md: 0 }, scrollMarginTop: '80px' }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 3, md: 6 },
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.1)',
              }}
            >
              {/* Desktop Version */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontSize: { md: '2.25rem' },
                  }}
                >
                  ⭐ Was ist The Connection Key?
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)', 
                    mb: 4, 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontSize: '1.2rem',
                    fontWeight: 300,
                  }}
                >
                  Die energetische Geschichte zwischen zwei Menschen
                </Typography>

                {/* Story Block */}
                <Box sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
                  <Typography 
                    component="div"
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.95)', 
                      mb: 3, 
                      lineHeight: 1.9, 
                      fontSize: '1.1rem',
                      textAlign: 'center',
                    }}
                  >
                    Manchmal begegnet dir ein Mensch – und ohne dass ein Wort fällt, passiert etwas.
                    <br />
                    <strong style={{ color: '#F29F05' }}>Ein Funke. Eine Spannung. Ein Gefühl, das du nicht einordnen kannst.</strong>
                    <br />
                    <br />
                    Als würde ein unsichtbarer Raum zwischen euch aufgehen.
                    <br />
                    <br />
                    Genau <strong style={{ color: '#F29F05' }}>dieser Raum</strong> ist der <strong style={{ color: '#F29F05' }}>Connection Key</strong>.
                    <br />
                    <br />
                    Er ist euer gemeinsamer energetischer Fingerabdruck:
                    <br />
                    Die Resonanz, die immer da ist – schon lange bevor ihr sie versteht.
                    <br />
                    Die Wahrheit zwischen zwei Designs.
                    <br />
                    Das Feld, das erklärt, warum ihr euch begegnet seid.
                  </Typography>
                </Box>

                {/* Was der Connection Key wirklich zeigt */}
                <Box sx={{ mb: 5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#F29F05',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    🔶 Was der Connection Key wirklich zeigt
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      mb: 3, 
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      maxWidth: 700,
                      mx: 'auto',
                    }}
                  >
                    Während andere Tools nur die individuellen Profile betrachten, geht der Connection Key tiefer:
                  </Typography>

                  <Grid container spacing={3} sx={{ maxWidth: 900, mx: 'auto', mt: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.08)',
                        borderRadius: 3,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1.5, fontSize: '1.1rem' }}>
                          🔸 Resonanz
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7 }}>
                          Welche Energien zwischen euch schwingen – und warum ihr euch so stark fühlt.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.08)',
                        borderRadius: 3,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1.5, fontSize: '1.1rem' }}>
                          🔸 Goldadern
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7 }}>
                          Eure verborgenen Potenziale, die nur durch die Verbindung aktiviert werden.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.08)',
                        borderRadius: 3,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1.5, fontSize: '1.1rem' }}>
                          🔸 Bewusstseinslinien
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7 }}>
                          Welche Themen zwischen euch wirken, bewusst oder unbewusst.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.08)',
                        borderRadius: 3,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1.5, fontSize: '1.1rem' }}>
                          🔸 Transformation
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7 }}>
                          Wie diese Verbindung euch beide verändert – sogar dann, wenn ihr euch dagegen wehrt.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      mt: 3, 
                      textAlign: 'center',
                      fontStyle: 'italic',
                      fontSize: '1rem',
                    }}
                  >
                    Denn jede Begegnung folgt einem Code. Der Connection Key macht diesen Code sichtbar.
                  </Typography>
                </Box>

                {/* Warum das wichtig ist */}
                <Box sx={{ mb: 5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#F29F05',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    ✨ Warum das wichtig ist
                  </Typography>
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)', 
                        mb: 3, 
                        lineHeight: 1.9, 
                        fontSize: '1.05rem',
                        textAlign: 'center',
                      }}
                    >
                      Wenn zwei Human Design Charts aufeinandertreffen, entsteht ein energetischer Raum, der größer ist als beide Menschen einzeln.
                      <br />
                      <br />
                      <strong style={{ color: '#F29F05' }}>Dieser Raum heilt. Dieser Raum triggert. Dieser Raum zeigt Wahrheit.</strong>
                      <br />
                      <br />
                      Mit dem Connection Key erkennst du:
                    </Typography>
                    <Box sx={{ 
                      background: 'rgba(242, 159, 5, 0.08)',
                      borderRadius: 3,
                      p: 3,
                      border: '1px solid rgba(242, 159, 5, 0.2)',
                    }}>
                      <Typography 
                        component="div"
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          lineHeight: 2,
                          fontSize: '1rem',
                        }}
                      >
                        • warum ihr euch angezogen habt<br />
                        • warum manche Themen immer wieder auftreten<br />
                        • welche Energien euch stärken<br />
                        • wie eure Verbindung sich weiterentwickeln möchte<br />
                        • welches Potenzial wirklich zwischen euch lebt
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.95)', 
                        mt: 3, 
                        textAlign: 'center',
                        fontStyle: 'italic',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                      }}
                    >
                      Es geht nicht darum, <em>ob</em> ihr zusammenpasst.
                      <br />
                      Sondern <strong style={{ color: '#F29F05' }}>wie eure Resonanz euch beide formt</strong>.
                    </Typography>
                  </Box>
                </Box>

                {/* CTA Buttons */}
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#FFFFFF',
                      fontSize: '1.5rem',
                    }}
                  >
                    🔥 Bist du bereit, die Wahrheit zwischen euch zu sehen?
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    justifyContent="center"
                    sx={{ maxWidth: 700, mx: 'auto' }}
                  >
                    <Button
                      component={Link}
                      href="/resonanzanalyse/sofort"
                      variant="contained"
                      size="large"
                      startIcon={<Key size={20} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        px: 5,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(242, 159, 5, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                        width: { xs: '100%', sm: 'auto' },
                      }}
                    >
                      Jetzt eure Resonanzanalyse starten
                    </Button>
                    <Button
                      component="a"
                      href="http://localhost:3005/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="large"
                      startIcon={<Key size={20} />}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        fontWeight: 600,
                        px: 5,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#F29F05',
                          background: 'rgba(242, 159, 5, 0.1)',
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        width: { xs: '100%', sm: 'auto' },
                      }}
                    >
                      Connection Key Session buchen
                    </Button>
                  </Stack>
                </Box>
              </Box>

              {/* Mobile Version */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  ⭐ Was ist The Connection Key?
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)', 
                    mb: 3, 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    fontWeight: 300,
                  }}
                >
                  Die Wahrheit zwischen zwei Menschen.
                </Typography>

                <Box sx={{ maxWidth: '100%', mx: 'auto', mb: 4 }}>
                  <Typography 
                    component="div"
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.95)', 
                      mb: 3, 
                      lineHeight: 1.8, 
                      fontSize: '0.95rem',
                      textAlign: 'center',
                    }}
                  >
                    Manchmal triffst du jemanden – und etwas in dir reagiert.
                    <br />
                    <strong style={{ color: '#F29F05' }}>Ein Gefühl. Ein Funke. Ein Ziehen.</strong>
                    <br />
                    <br />
                    Genau das ist euer <strong style={{ color: '#F29F05' }}>Connection Key</strong>:
                    <br />
                    die energetische Resonanz zwischen zwei Menschen.
                    <br />
                    <br />
                    Der Raum, der sich nur zwischen euch öffnet.
                    <br />
                    Die Verbindung, die erklärt, warum alles so intensiv, vertraut oder herausfordernd ist.
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#F29F05',
                      textAlign: 'center',
                      fontSize: '1.1rem',
                    }}
                  >
                    🔶 Was er sichtbar macht
                  </Typography>
                  <Box sx={{ 
                    background: 'rgba(242, 159, 5, 0.08)',
                    borderRadius: 3,
                    p: 2.5,
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    mb: 2.5,
                  }}>
                    <Typography 
                      component="div"
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        lineHeight: 1.9,
                        fontSize: '0.9rem',
                      }}
                    >
                      • <strong style={{ color: '#F29F05' }}>Resonanz:</strong> Was zwischen euch schwingt.<br />
                      • <strong style={{ color: '#F29F05' }}>Goldadern:</strong> Eure gemeinsamen Potenziale.<br />
                      • <strong style={{ color: '#F29F05' }}>Bewusstseinslinien:</strong> Was euch verbindet oder triggert.<br />
                      • <strong style={{ color: '#F29F05' }}>Transformation:</strong> Was euch beide verändert.
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      textAlign: 'center',
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                    }}
                  >
                    Der Connection Key zeigt nicht, ob ihr „passt" –<br />
                    sondern <strong style={{ color: '#F29F05' }}>was zwischen euch lebt</strong>.
                  </Typography>
                </Box>

                {/* Mobile CTA Buttons */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      color: '#FFFFFF',
                      fontSize: '1.1rem',
                    }}
                  >
                    🚀 Willst du wissen, was eure Verbindung bedeutet?
                  </Typography>
                  <Stack 
                    direction="column" 
                    spacing={2}
                    sx={{ maxWidth: '100%', mx: 'auto' }}
                  >
                    <Button
                      component={Link}
                      href="/resonanzanalyse/sofort"
                      variant="contained"
                      size="large"
                      startIcon={<Key size={18} />}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(242, 159, 5, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Resonanzanalyse starten
                    </Button>
                    <Button
                      component="a"
                      href="http://localhost:3005/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="large"
                      startIcon={<Key size={18} />}
                      fullWidth
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        fontWeight: 600,
                        py: 1.5,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#F29F05',
                          background: 'rgba(242, 159, 5, 0.1)',
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Connection Key Session buchen
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Card>
          </MotionWrapper>
        </Box>

        {/* Resonanzanalyse - Der Höhepunkt */}
        <Box sx={{ mb: { xs: 8, md: 12 }, px: { xs: 1, md: 0 } }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.15))',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.4)',
                borderRadius: 4,
                p: { xs: 4, md: 8 },
                boxShadow: '0 12px 50px rgba(242, 159, 5, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 0%, rgba(242, 159, 5, 0.1), transparent 70%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: { xs: 2, md: 3 },
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                  }}
                >
                  Es gibt diesen einen Moment…
                </Typography>
                
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    mb: { xs: 3, md: 4 },
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '1.2rem', md: '1.6rem' },
                    fontStyle: 'italic',
                  }}
                >
                  in dem du erkennst, warum deine Beziehungen so laufen wie sie laufen.
                </Typography>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: { xs: 4, md: 5 },
                    textAlign: 'center',
                    color: '#F29F05',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Genau dafür ist die Resonanzanalyse da.
                </Typography>
                
                <Box sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: { xs: 1.8, md: 2 },
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      textAlign: 'center',
                      mb: 3,
                    }}
                  >
                    Sie zeigt dir, welche Energie du im zwischenmenschlichen Feld ausstrahlst,
                    <br />
                    warum bestimmte Menschen dich sofort fühlen – und andere gar nicht.
                    <br />
                    <br />
                    <strong style={{ color: '#F29F05' }}>Die Resonanzanalyse ist dein Schlüssel zur Wahrheit.</strong>
                    <br />
                    <br />
                    Sie zeigt dir nicht nur, ob ihr zusammenpasst –
                    <br />
                    sondern <strong style={{ color: '#F29F05' }}>wie eure Resonanz euch beide formt</strong>.
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                  <Link href="/resonanzanalyse/sofort" style={{ textDecoration: 'none' }}>
                    <MotionWrapper
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Key size={24} />}
                        endIcon={<ArrowRight size={24} />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          fontWeight: 700,
                          px: { xs: 5, md: 8 },
                          py: { xs: 2, md: 2.5 },
                          fontSize: { xs: '1.1rem', md: '1.4rem' },
                          borderRadius: 4,
                          boxShadow: '0 10px 40px rgba(242, 159, 5, 0.6)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            transition: 'left 0.6s',
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 15px 50px rgba(242, 159, 5, 0.7)',
                            '&::before': {
                              left: '100%',
                            },
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Jetzt Resonanzanalyse starten (kostenlos)
                      </Button>
                    </MotionWrapper>
                  </Link>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mt: 2,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      fontStyle: 'italic',
                    }}
                  >
                    Die Wahrheit über deine energetischen Verbindungen entdecken.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </MotionWrapper>
        </Box>

        {/* Ablauf / Process Section */}
        <Box sx={{ mb: { xs: 6, md: 8 }, pt: { xs: 2, md: 3 }, overflow: 'visible', px: { xs: 1, md: 0 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: { xs: 4, md: 6 },
                textAlign: 'center',
                px: { xs: 2, md: 0 },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              🔄 So funktioniert's
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, md: 4 },
              justifyContent: 'center',
              alignItems: 'stretch',
              overflow: 'visible',
              maxWidth: 1000,
              mx: 'auto'
            }}>
              {[
                {
                  step: 1,
                  icon: <Target size={40} />,
                  title: 'Analyse starten',
                  description: 'Gib die Geburtsdaten ein und wähle den Beziehungsbereich.',
                  color: '#F29F05',
                },
                {
                  step: 2,
                  icon: <Zap size={40} />,
                  title: 'Energie entschlüsseln lassen',
                  description: 'Unser System analysiert eure energetische Verbindung.',
                  color: '#F29F05',
                },
                {
                  step: 3,
                  icon: <Heart size={40} />,
                  title: 'Connection verstehen',
                  description: 'Erhalte deine Resonanzanalyse mit klaren Erkenntnissen.',
                  color: '#8C1D04',
                },
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  overflow: 'visible', 
                  pt: 2,
                  flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 22px)' },
                  minWidth: { xs: '100%', md: 'calc(33.333% - 22px)' },
                  maxWidth: { xs: '100%', md: 'calc(33.333% - 22px)' }
                }}>
                  <Card
                      sx={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: { xs: 2.5, md: 3 },
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'visible',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: '#F29F05',
                          boxShadow: '0 10px 40px rgba(242,159,5,0.3)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -15,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: { xs: 36, md: 40 },
                          height: { xs: 36, md: 40 },
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${item.color}, ${item.color === '#F29F05' ? '#8C1D04' : '#F29F05'})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: { xs: '1rem', md: '1.2rem' },
                          boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)',
                          zIndex: 1,
                        }}
                      >
                        {item.step}
                      </Box>
                      <Box sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        mb: { xs: 1.5, md: 2 }, 
                        mt: { xs: 2.5, md: 3 }, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        transition: 'color 0.3s', 
                        '&:hover': { color: '#F29F05' },
                        '& svg': {
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 }
                        }
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: '#fff', 
                        mb: { xs: 1, md: 1.5 }, 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        lineHeight: { xs: 1.6, md: 1.7 },
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        flexGrow: 1,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto'
                      }}>
                        {item.description}
                      </Typography>
                      </Card>
                </Box>
              ))}
            </Box>

            {/* Bereiche Card - Detaillierte Übersicht */}
            <Box sx={{ mt: 8, mb: 6 }}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 4,
                  p: { xs: 3, md: 5 },
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                  }
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '2rem' }
                  }}>
                    Verfügbare Bereiche im Detail
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.95rem', md: '1.1rem' }
                  }}>
                    Connection Keys können für verschiedene Beziehungsbereiche erstellt werden
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {[
                    {
                      category: 'Partnerschaft / Beziehung',
                      items: ['Romantische Beziehung', 'Ehe', 'Partner'],
                      example: 'Warum ihr euch anzieht – und manchmal abstoßt.',
                      icon: <Heart size={24} />,
                      color: '#F29F05'
                    },
                    {
                      category: 'Familie',
                      items: ['Eltern', 'Geschwister', 'Kinder'],
                      example: 'Verstehe die energetischen Muster in deiner Familie.',
                      icon: <Users size={24} />,
                      color: '#F29F05'
                    },
                    {
                      category: 'Freundschaft',
                      items: ['Freunde', 'beste Freunde'],
                      example: 'Erkenne, warum manche Freundschaften so leicht sind.',
                      icon: <Star size={24} />,
                      color: '#F29F05'
                    },
                    {
                      category: 'Business / Kollegen',
                      items: ['Geschäftspartner', 'Kollegen', 'Team'],
                      example: 'Optimiere eure Zusammenarbeit auf energetischer Ebene.',
                      icon: <Activity size={24} />,
                      color: '#8C1D04'
                    },
                    {
                      category: 'Mentoring / Coaching',
                      items: ['Mentor', 'Coach', 'Lehrer'],
                      example: 'Warum du mit manchen Klienten sofort in Resonanz gehst.',
                      icon: <Award size={24} />,
                      color: '#8C1D04'
                    },
                    {
                      category: 'Team / Gruppe',
                      items: ['Team-Dynamik', 'Arbeitsgruppe'],
                      example: 'Erkenne die energetischen Kräfte in deinem Team.',
                      icon: <Users size={24} />,
                      color: '#8C1D04'
                    }
                  ].map((area, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          borderRadius: 3,
                          p: 3,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderColor: area.color,
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${area.color}30`
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{
                            color: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'color 0.3s',
                            '&:hover': { color: '#F29F05' },
                            '& svg': {
                              width: { xs: 32, md: 40 },
                              height: { xs: 32, md: 40 }
                            }
                          }}>
                            {area.icon}
                          </Box>
                          <Typography variant="h6" sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '1rem', md: '1.1rem' }
                          }}>
                            {area.category}
                          </Typography>
                        </Box>
                        <Box sx={{ pl: 6 }}>
                          {area.items.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: area.color,
                                mr: 1.5,
                                flexShrink: 0
                              }} />
                              <Typography variant="body2" sx={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: { xs: '0.875rem', md: '0.95rem' }
                              }}>
                                {item}
                              </Typography>
                            </Box>
                          ))}
                          {area.example && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(242, 159, 5, 0.2)' }}>
                              <Typography variant="body2" sx={{
                                color: area.color,
                                fontStyle: 'italic',
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                lineHeight: 1.5
                              }}>
                                "{area.example}"
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={24} />}
                onClick={() => router.push('/connection-key/booking')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Calendar size={20} style={{ marginRight: 8 }} />
                Jetzt Session buchen
              </Button>
            </Box>
        </Box>

        {/* Coaches Section */}
        <Box sx={{ mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Deine Experten für Resonanzanalyse
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                mb: 5,
                maxWidth: 700,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.7,
              }}
            >
              Unsere zertifizierten Human Design Experten führen dich durch deine Connection Key Analyse und zeigen dir, wie die energetische Resonanz zwischen euch wirkt – auf mentaler, emotionaler und seelischer Ebene.
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  name: 'Heiko',
                  title: 'Human Design Experte & Life Coach',
                  avatar: '/images/heiko.jpg',
                  rating: 4.9,
                  reviews: 127,
                  experience: '8+ Jahre',
                  specializations: ['Human Design', 'Life Coaching', 'Beziehungen'],
                  focus: 'Partnerschafts-Analysen & emotionale Dynamiken',
                  description: 'Heiko ist ein zertifizierter Human Design Experte mit über 8 Jahren Erfahrung. Er hilft dir dabei, eure Resonanz zu verstehen und im Alltag zu leben.',
                  bookingLink: '/connection-key/booking',
                },
                {
                  name: 'Janine',
                  title: 'Human Design Beraterin & Therapeutin',
                  avatar: '/images/janine.jpg',
                  rating: 4.8,
                  reviews: 89,
                  experience: '6+ Jahre',
                  specializations: ['Human Design', 'Psychologie', 'Beziehungen'],
                  focus: 'Familien-Dynamiken & tiefe Resonanzanalyse',
                  description: 'Janine ist eine erfahrene Human Design Beraterin mit psychologischem Hintergrund. Sie spezialisiert sich auf Beziehungs- und Resonanzdynamiken.',
                  bookingLink: '/connection-key/booking',
                },
                {
                  name: 'Elisabeth',
                  title: 'Human Design Master & Business Coach',
                  avatar: '/images/elisabeth.jpg',
                  rating: 4.7,
                  reviews: 98,
                  experience: '7+ Jahre',
                  specializations: ['Human Design', 'Business', 'Team-Dynamik'],
                  focus: 'Business-Resonanzen & Team-Optimierung',
                  description: 'Elisabeth hilft dir dabei, eure Resonanz zu verstehen und diese im beruflichen und privaten Kontext zu nutzen.',
                  bookingLink: '/connection-key/booking',
                },
              ].map((coach, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                      sx={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: 3,
                        height: '100%',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: '#F29F05',
                          boxShadow: '0 10px 40px rgba(242,159,5,0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'white',
                            mr: 2,
                            flexShrink: 0,
                            position: 'relative',
                            overflow: 'hidden',
                            border: '2px solid rgba(242, 159, 5, 0.3)',
                            boxShadow: '0 4px 15px rgba(242, 159, 5, 0.2)',
                          }}
                        >
                          {coach.avatar && !imageErrors[coach.name] ? (
                            <Image
                              src={coach.avatar}
                              alt={coach.name}
                              fill
                              sizes="80px"
                              style={{
                                objectFit: 'cover',
                              }}
                              onError={() => handleImageError(coach.name)}
                            />
                          ) : (
                            coach.name.charAt(0)
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                            {coach.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                            {coach.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star size={16} fill="#F29F05" color="#F29F05" />
                            <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600 }}>
                              {coach.rating}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              ({coach.reviews} Bewertungen)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {coach.focus && (
                        <Box sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          borderRadius: 2, 
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)'
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: '#F29F05', 
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Heart size={14} fill="#F29F05" color="#F29F05" />
                            {coach.focus}
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2, lineHeight: 1.7 }}>
                        {coach.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {coach.specializations.slice(0, 3).map((spec, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              background: 'rgba(242, 159, 5, 0.15)',
                              border: '1px solid rgba(242, 159, 5, 0.3)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: '#F29F05', fontWeight: 600 }}>
                              {spec}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => router.push('/resonanzanalyse/bereiche')}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: 'white',
                            fontWeight: 700,
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Session buchen
                        </Button>
                        <Button
                          component={Link}
                          href="/preise"
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(242, 159, 5, 0.5)',
                            color: '#F29F05',
                            fontWeight: 600,
                            py: 1.5,
                            px: 2,
                            borderRadius: 2,
                            minWidth: 'auto',
                            '&:hover': {
                              borderColor: '#F29F05',
                              background: 'rgba(242, 159, 5, 0.1)',
                            },
                          }}
                        >
                          <User size={18} />
                        </Button>
                      </Box>
                    </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                component={Link}
                href="/preise"
                variant="outlined"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    borderWidth: 2,
                  },
                }}
              >
                Alle Coaches ansehen
              </Button>
            </Box>
        </Box>

        {/* Google Bewertungen */}
        <Box sx={{ mb: 10 }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                }}
              >
                Was unsere Nutzer sagen
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={28} fill="#F29F05" color="#F29F05" />
                  ))}
                </Box>
                <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700 }}>
                  4.9
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                  von 127+ Bewertungen
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                Basierend auf Google Bewertungen
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  name: 'Sarah M.',
                  rating: 5,
                  text: 'Die Connection Key Analyse hat mir geholfen, die energetische Verbindung zu meinem Partner wirklich zu verstehen.',
                  textRest: 'Endlich kann ich nachvollziehen, warum wir so harmonieren – und wo wir uns gegenseitig triggern. Das hat unsere Beziehung komplett verändert.',
                  date: 'vor 2 Wochen',
                },
                {
                  name: 'Michael K.',
                  rating: 5,
                  text: 'Unglaublich tiefgreifend! Die Resonanzanalyse zeigt Dinge auf, die ich vorher nur intuitiv gespürt habe.',
                  textRest: 'Jetzt habe ich Klarheit über unsere Dynamik und kann bewusst daran arbeiten. Die Session war ein Game-Changer.',
                  date: 'vor 1 Monat',
                },
                {
                  name: 'Lisa P.',
                  rating: 5,
                  text: 'Die Visualisierung der Goldadern und komplementären Tore macht die Verbindung zwischen Menschen sichtbar.',
                  textRest: 'Ich verstehe jetzt endlich, warum ich mich zu bestimmten Menschen hingezogen fühle – und warum andere Beziehungen so anstrengend sind.',
                  date: 'vor 3 Wochen',
                },
              ].map((review, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(242, 159, 5, 0.5)',
                      borderRadius: 3,
                      p: { xs: 3, md: 4 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      boxShadow: '0 6px 25px rgba(242, 159, 5, 0.2)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 12px 45px rgba(242,159,5,0.5)',
                        background: 'rgba(255, 255, 255, 0.18)',
                      },
                    }}
                  >
                    {/* Quote Icon oben */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16,
                      fontSize: '3rem',
                      color: 'rgba(242, 159, 5, 0.3)',
                      lineHeight: 1
                    }}>
                      "
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: { xs: 64, md: 72 },
                          height: { xs: 64, md: 72 },
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '1.6rem', md: '1.8rem' },
                          boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                          flexShrink: 0,
                        }}
                      >
                        {review.name.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.75, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
                          {review.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={20} fill="#F29F05" color="#F29F05" />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <Typography
                      component="div"
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.98)',
                        lineHeight: 1.8,
                        mb: 3,
                        flexGrow: 1,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 500,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>
                        {review.text}
                      </Box>
                      {review.textRest && (
                        <>
                          {' '}
                          <Box component="span">{review.textRest}</Box>
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {review.date}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                component="a"
                href="https://www.google.com/search?q=The+Connection+Key+reviews"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    borderWidth: 2,
                  },
                }}
              >
                Alle Google Bewertungen ansehen
              </Button>
            </Box>
          </MotionWrapper>
        </Box>

        {/* Community Section */}
        <Box sx={{ mb: 10 }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              }}
            >
              <Box sx={{ mb: 5 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                  }}
                >
                  <UsersRound size={40} color="white" />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Warum Community?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    maxWidth: '700px',
                    mx: 'auto',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 400,
                  }}
                >
                  Werde Teil unserer wachsenden Community von über 2.500+ Menschen auf ihrer Human Design Journey. 
                  Teile deine Connection Key Resonanzen, entdecke energetische Verbindungen und wachse gemeinsam mit Gleichgesinnten.
                </Typography>

                {/* Konkrete Benefits */}
                <Grid container spacing={2} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                  {[
                    { icon: '👥', text: 'Austausch mit >2.000 Menschen' },
                    { icon: '📞', text: 'Monatliche Community-Calls' },
                    { icon: '💫', text: 'Energetische Partner-Matches' },
                    { icon: '📚', text: 'Exklusives Wissen & Insights' },
                  ].map((benefit, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.12)',
                          borderColor: 'rgba(242, 159, 5, 0.4)',
                          transform: 'translateY(-2px)',
                        }
                      }}>
                        <Box sx={{ fontSize: '2rem', mb: 1 }}>{benefit.icon}</Box>
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: { xs: '0.8rem', md: '0.9rem' },
                          fontWeight: 500
                        }}>
                          {benefit.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: { xs: 3, md: 4 },
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                }}
              >
                Wähle deine Mitgliedschaft
              </Typography>

              {/* Mobile: Horizontaler Scroll für Pricing-Karten */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                mb: 4,
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(242, 159, 5, 0.5)',
                  borderRadius: 3,
                },
              }}>
                {[
                  {
                    id: 'free',
                    name: 'Kostenlos',
                    icon: '👤',
                    color: '#6b7280',
                    description: 'Grundlegender Community-Zugang',
                    features: ['Community-Zugang', 'Grundlegende Features', 'Registrierung'],
                  },
                  {
                    id: 'basic',
                    name: 'Basis',
                    icon: '⭐',
                    color: '#F29F05',
                    description: 'Erweiterte Community-Features',
                    features: ['Alle Free Features', 'Erweiterte Analysen', 'Chat-System'],
                  },
                  {
                    id: 'premium',
                    name: 'Premium',
                    icon: '💎',
                    color: '#8C1D04',
                    description: 'Vollständiger Community-Zugang',
                    features: ['Alle Basic Features', 'Coaching-Sessions', 'Exklusive Inhalte'],
                  },
                  {
                    id: 'vip',
                    name: 'VIP',
                    icon: '👑',
                    color: '#590A03',
                    description: 'Exklusive VIP Community',
                    features: ['Alle Premium Features', 'Persönlicher Coach', 'VIP Community'],
                  },
                ].map((pkg) => (
                  <Card
                    key={pkg.id}
                    sx={{
                      minWidth: 280,
                      maxWidth: 280,
                      background: pkg.id === 'premium' 
                        ? 'rgba(140, 29, 4, 0.2)' 
                        : pkg.id === 'vip'
                        ? 'rgba(89, 10, 3, 0.2)'
                        : 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: pkg.id === 'premium' || pkg.id === 'vip'
                        ? `2px solid ${pkg.color}`
                        : '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: pkg.id === 'premium'
                        ? `0 8px 35px ${pkg.color}50, 0 0 20px ${pkg.color}30`
                        : pkg.id === 'vip'
                        ? `0 8px 30px ${pkg.color}40`
                        : 'none',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: pkg.id === 'premium' || pkg.id === 'vip' ? pkg.color : '#F29F05',
                        boxShadow: pkg.id === 'premium'
                          ? `0 15px 60px ${pkg.color}70, 0 0 40px ${pkg.color}50`
                          : pkg.id === 'vip'
                          ? `0 12px 50px ${pkg.color}60`
                          : '0 10px 40px rgba(242,159,5,0.3)',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center', mb: 2, position: 'relative' }}>
                      {(pkg as any).badge && (
                        <Box sx={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                          background: pkg.id === 'premium' 
                            ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                            : 'linear-gradient(135deg, #590A03, #8C1D04)',
                          color: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)',
                          zIndex: 1,
                        }}>
                          {(pkg as any).badge}
                        </Box>
                      )}
                      <Box sx={{ fontSize: '2.5rem', mb: 1 }}>{pkg.icon}</Box>
                      <Typography variant="h6" sx={{ color: pkg.color, fontWeight: 700, mb: 0.5 }}>
                        {pkg.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                        {pkg.description}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, mb: 2 }}>
                      {pkg.features.map((feature, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Check size={14} color={pkg.color} style={{ marginRight: 8, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      component={Link}
                      href={
                        pkg.id === 'basic' ? '/packages/basic' :
                        pkg.id === 'premium' ? '/packages/premium' :
                        pkg.id === 'vip' ? '/packages/vip' :
                        '/pricing'
                      }
                      variant={pkg.id === 'basic' || pkg.id === 'premium' ? 'contained' : 'outlined'}
                      fullWidth
                      sx={{
                        background: pkg.id === 'basic' || pkg.id === 'premium' 
                          ? `linear-gradient(135deg, ${pkg.color}, ${pkg.id === 'basic' ? '#8C1D04' : '#590A03'})`
                          : 'transparent',
                        borderColor: pkg.color,
                        color: pkg.id === 'basic' || pkg.id === 'premium' ? 'white' : pkg.color,
                        fontWeight: 700,
                        py: 1.25,
                        fontSize: '0.85rem',
                        '&:hover': {
                          background: pkg.id === 'basic' || pkg.id === 'premium'
                            ? `linear-gradient(135deg, ${pkg.id === 'basic' ? '#8C1D04' : '#590A03'}, ${pkg.color})`
                            : `rgba(${pkg.id === 'basic' ? '242, 159, 5' : pkg.id === 'premium' ? '140, 29, 4' : '89, 10, 3'}, 0.2)`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Mehr erfahren
                    </Button>
                  </Card>
                ))}
              </Box>

              {/* Desktop: Grid Layout */}
              <Grid container spacing={3} sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}>
                {[
                  {
                    id: 'basic',
                    name: 'Basis',
                    icon: '⭐',
                    color: '#F29F05',
                    description: 'Erweiterte Community-Features',
                    features: ['Community-Zugang', 'Erweiterte Analysen', 'Chat-System'],
                  },
                  {
                    id: 'premium',
                    name: 'Premium',
                    icon: '💎',
                    color: '#8C1D04',
                    description: 'Vollständiger Community-Zugang',
                    features: ['Alle Basic Features', 'Coaching-Sessions', 'Exklusive Inhalte'],
                    badge: 'Meistgewählt',
                  },
                  {
                    id: 'vip',
                    name: 'VIP',
                    icon: '👑',
                    color: '#590A03',
                    description: 'Exklusive VIP Community',
                    features: ['Alle Premium Features', 'Persönlicher Coach', 'VIP Community'],
                    badge: 'Exklusiv',
                  },
                ].map((pkg) => (
                  <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                    <Card
                      sx={{
                        background: pkg.id === 'premium' 
                          ? 'rgba(140, 29, 4, 0.2)' 
                          : pkg.id === 'vip'
                          ? 'rgba(89, 10, 3, 0.2)'
                          : 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: pkg.id === 'premium' || pkg.id === 'vip'
                          ? `2px solid ${pkg.color}`
                          : '1px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: pkg.id === 'premium'
                          ? `0 8px 35px ${pkg.color}50, 0 0 20px ${pkg.color}30`
                          : pkg.id === 'vip'
                          ? `0 8px 30px ${pkg.color}40`
                          : 'none',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: pkg.id === 'premium' || pkg.id === 'vip' ? pkg.color : '#F29F05',
                          boxShadow: pkg.id === 'premium'
                            ? `0 15px 60px ${pkg.color}70, 0 0 40px ${pkg.color}50`
                            : pkg.id === 'vip'
                            ? `0 12px 50px ${pkg.color}60`
                            : '0 10px 40px rgba(242,159,5,0.3)',
                        },
                      }}
                    >
                      <Box sx={{ textAlign: 'center', mb: 2, position: 'relative' }}>
                        {(pkg as any).badge && (
                          <Box sx={{
                            position: 'absolute',
                            top: -12,
                            right: -12,
                            background: pkg.id === 'premium' 
                              ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                              : 'linear-gradient(135deg, #590A03, #8C1D04)',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)',
                            zIndex: 1,
                          }}>
                            {(pkg as any).badge}
                          </Box>
                        )}
                        <Box sx={{ fontSize: '3rem', mb: 1 }}>{pkg.icon}</Box>
                        <Typography variant="h5" sx={{ color: pkg.color, fontWeight: 700, mb: 0.5 }}>
                          {pkg.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                          {pkg.description}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, mb: 2 }}>
                        {pkg.features.map((feature, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Check size={16} color={pkg.color} style={{ marginRight: 8, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Button
                        component={Link}
                        href={
                          pkg.id === 'free' ? '/register' :
                          pkg.id === 'basic' ? '/packages/basic' :
                          pkg.id === 'premium' ? '/packages/premium' :
                          pkg.id === 'vip' ? '/packages/vip' :
                          '/pricing'
                        }
                        variant={pkg.id === 'basic' || pkg.id === 'premium' ? 'contained' : 'outlined'}
                        fullWidth
                        sx={{
                          background: pkg.id === 'basic' || pkg.id === 'premium' 
                            ? `linear-gradient(135deg, ${pkg.color}, ${pkg.id === 'basic' ? '#8C1D04' : '#590A03'})`
                            : 'transparent',
                          borderColor: pkg.color,
                          color: pkg.id === 'basic' || pkg.id === 'premium' ? 'white' : pkg.color,
                          fontWeight: 700,
                          py: 1.5,
                          '&:hover': {
                            background: pkg.id === 'basic' || pkg.id === 'premium'
                              ? `linear-gradient(135deg, ${pkg.id === 'basic' ? '#8C1D04' : '#590A03'}, ${pkg.color})`
                              : `rgba(${pkg.id === 'free' ? '107, 114, 128' : pkg.id === 'basic' ? '242, 159, 5' : pkg.id === 'premium' ? '140, 29, 4' : '89, 10, 3'}, 0.2)`,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {pkg.id === 'free' ? 'Jetzt beitreten' : 'Mehr erfahren'}
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  size="large"
                  startIcon={<UserPlus size={22} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.1rem',
                    borderRadius: 4,
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Jetzt Mitglied werden
                </Button>
                <Button
                  component={Link}
                  href="/community-info"
                  variant="outlined"
                  size="large"
                  startIcon={<Globe2 size={20} />}
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    fontWeight: 700,
                    px: 5,
                    py: 2.5,
                    fontSize: '1.1rem',
                    borderRadius: 4,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)',
                      borderWidth: 2,
                    },
                  }}
                >
                  Community entdecken
                </Button>
              </Stack>
            </Card>
          </MotionWrapper>
        </Box>

        {/* Finale CTA - EXTREM wichtig */}
        <Box sx={{ mb: { xs: 6, md: 10 }, px: { xs: 1, md: 0 } }}>
          <MotionWrapper
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.2))',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.5)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                boxShadow: '0 15px 60px rgba(242, 159, 5, 0.4)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(242, 159, 5, 0.15), transparent 70%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: { xs: 2, md: 3 },
                    color: '#FFFFFF',
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                  }}
                >
                  Bereit zu sehen, was zwischen euch wirklich lebt?
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    mb: { xs: 4, md: 5 },
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    maxWidth: 700,
                    mx: 'auto',
                    lineHeight: { xs: 1.6, md: 1.7 },
                  }}
                >
                  Starte jetzt deine Resonanzanalyse –
                  <br />
                  und erkenne deinen energetischen Einfluss auf Begegnungen.
                </Typography>
                
                <Link href="/resonanzanalyse/sofort" style={{ textDecoration: 'none' }}>
                  <MotionWrapper
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Key size={26} />}
                      endIcon={<ArrowRight size={26} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        px: { xs: 6, md: 10 },
                        py: { xs: 2.5, md: 3 },
                        fontSize: { xs: '1.2rem', md: '1.5rem' },
                        borderRadius: 4,
                        boxShadow: '0 12px 50px rgba(242, 159, 5, 0.7)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          transition: 'left 0.7s',
                        },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-5px)',
                          boxShadow: '0 20px 70px rgba(242, 159, 5, 0.8)',
                          '&::before': {
                            left: '100%',
                          },
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Jetzt Resonanzanalyse starten
                    </Button>
                  </MotionWrapper>
                </Link>
              </Box>
            </Card>
          </MotionWrapper>
        </Box>
        </Box>
      </Container>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '../../components/PublicHeader';
import Logo from '../../components/Logo';
import { 
  ArrowRight, 
  ArrowLeft,
  Users,
  Pentagon,
  Sparkles,
  Target,
  Heart,
  Zap,
  Shield,
  CheckCircle,
  Calendar,
  FileText,
  Video,
} from 'lucide-react';

export default function PentaPage() {
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, width: number, height: number, opacity: number, duration: number, delay: number}>>([]);

  // Nur client-seitig rendern, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setMounted(true);
    // Generiere Sterne-Positionen nur auf dem Client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStarPositions(stars);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
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
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.width}px`,
            height: `${star.height}px`,
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

      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />
        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Zurück-Button */}
          <Button
            component={Link}
            href="/connection-key"
            startIcon={<ArrowLeft size={20} />}
            sx={{
              color: '#F29F05',
              mb: 4,
              '&:hover': {
                background: 'rgba(242, 159, 5, 0.1)',
              },
            }}
          >
            Zurück zu Connection Key
          </Button>

        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: { xs: 120, md: 150 },
                  height: { xs: 120, md: 150 },
                  position: 'relative',
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 200 200"
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                  }}
                >
                  <polygon
                    points="100,20 180,70 180,130 100,180 20,130 20,70"
                    fill="none"
                    stroke="#F29F05"
                    strokeWidth="3"
                    opacity="0.8"
                  />
                  {/* Verbindungslinien */}
                  <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  <line x1="100" y1="100" x2="180" y2="70" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  <line x1="100" y1="100" x2="180" y2="130" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  <line x1="100" y1="100" x2="20" y2="130" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  <line x1="100" y1="100" x2="20" y2="70" stroke="rgba(242, 159, 5, 0.5)" strokeWidth="2" />
                  {/* Punkte */}
                  {[
                    { x: 100, y: 20 },
                    { x: 180, y: 70 },
                    { x: 180, y: 130 },
                    { x: 100, y: 180 },
                    { x: 20, y: 130 },
                    { x: 20, y: 70 },
                  ].map((point, i) => (
                    <motion.circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      fill="#F29F05"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                  {/* Zentrum */}
                  <circle cx="100" cy="100" r="15" fill="#F29F05" opacity="0.9" />
                </Box>
              </Box>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem' },
                color: 'white',
                lineHeight: 1.2,
              }}
            >
              Penta-Analyse
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                für Familien & Teams
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                fontWeight: 600,
              }}
            >
              Die energetische Landkarte deiner Gruppe – sichtbar gemacht
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              Manche Verbindungen sind komplexer als „nur" zwei Menschen. Mit der <strong>Penta-Analyse</strong> machen wir die Resonanz in <strong>Familien, Teams und Gruppen</strong> sichtbar.
            </Typography>
          </motion.div>
        </Box>

        {/* Was ist Penta? */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Was ist eine Penta-Analyse?
            </Typography>

            <Card
              sx={{
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                mb: 6,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  mb: 3,
                  lineHeight: 1.9,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                }}
              >
                Die <strong style={{ color: '#F29F05' }}>Penta</strong> ist eine spezielle Form der Human Design Analyse, die sich auf <strong>Gruppen von 5 Personen</strong> fokussiert. Sie zeigt dir, wie eure individuellen Energien zusammenwirken und ein gemeinsames Feld bilden.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 3,
                  lineHeight: 1.9,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                }}
              >
                Während der Connection Key die Resonanz zwischen zwei Menschen sichtbar macht, zeigt die Penta-Analyse, <strong>wie ihr als Gruppe funktioniert</strong> – welche Rollen natürlich entstehen, wo Spannungen entstehen und wie ihr euer gemeinsames Potenzial optimal nutzen könnt.
              </Typography>

              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  background: 'rgba(242, 159, 5, 0.1)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 2,
                  borderLeft: '4px solid #F29F05',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                  }}
                >
                  <strong style={{ color: '#F29F05' }}>💡 Vertiefe dein Verständnis:</strong> In unserem ausführlichen Blogartikel{' '}
                  <Link
                    href="/blogartikel/penta-analyse-gruppenenergie"
                    style={{
                      color: '#F29F05',
                      textDecoration: 'none',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(242, 159, 5, 0.5)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderBottomColor = '#F29F05';
                      e.currentTarget.style.color = '#FFB84D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderBottomColor = 'rgba(242, 159, 5, 0.5)';
                      e.currentTarget.style.color = '#F29F05';
                    }}
                  >
                    "Penta-Analyse: Gruppenenergie verstehen"
                  </Link>
                  {' '}erfährst du noch mehr über die faszinierende Welt der Gruppenenergie, wie Penta-Felder entstehen und welche praktischen Anwendungen es gibt.
                </Typography>
              </Box>
            </Card>
          </motion.div>
        </Box>

        {/* Was zeigt die Penta-Analyse? */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Was zeigt die Penta-Analyse?
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <Users size={40} />,
                title: 'Wer bringt welche Energie mit?',
                description: 'Du erkennst, welche Rolle jede Person im Feld natürlich einnimmt – wer bringt Struktur, wer bringt Kreativität, wer bringt Stabilität?',
              },
              {
                icon: <Target size={40} />,
                title: 'Wo entstehen Spannungen?',
                description: 'Die Penta zeigt dir, wo energetische Konflikte entstehen können und warum bestimmte Dynamiken immer wieder auftauchen.',
              },
              {
                icon: <Sparkles size={40} />,
                title: 'Wer übernimmt welche Rolle im Feld?',
                description: 'Jede Person hat eine natürliche Funktion im Gruppenfeld. Die Penta macht diese Rollen sichtbar und hilft dir, sie wertzuschätzen.',
              },
              {
                icon: <Heart size={40} />,
                title: 'Wie funktioniert ihr als Feld?',
                description: 'Die Penta zeigt dir das große Bild: Wie wirkt eure gemeinsame Energie? Wo liegt euer größtes Potenzial als Gruppe?',
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      background: 'rgba(242, 159, 5, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 3,
                      p: 4,
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                        background: 'rgba(242, 159, 5, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#F29F05', mb: 3, display: 'flex', justifyContent: 'center' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Für wen ist Penta? */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Für wen ist die Penta-Analyse?
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  title: 'Patchwork-Familien',
                  description: 'Verstehe die Dynamiken in deiner Patchwork-Familie. Warum gibt es immer wieder Spannungen? Wie können alle ihre Rolle finden?',
                  icon: <Heart size={32} />,
                },
                {
                  title: 'Business-Teams',
                  description: 'Optimiere die Zusammenarbeit in deinem Team. Wer bringt welche Stärken mit? Wie könnt ihr eure Energie optimal bündeln?',
                  icon: <Target size={32} />,
                },
                {
                  title: 'Seelen-Cliquen',
                  description: 'Erkenne, warum ihr euch so verbunden fühlt. Was macht eure Freundschaftsgruppe so besonders? Wie könnt ihr gemeinsam wachsen?',
                  icon: <Sparkles size={32} />,
                },
                {
                  title: 'Wohngemeinschaften',
                  description: 'Verstehe die Dynamiken in deiner WG. Warum gibt es immer wieder Konflikte? Wie könnt ihr harmonischer zusammenleben?',
                  icon: <Users size={32} />,
                },
              ].map((useCase, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      background: 'rgba(242, 159, 5, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 3,
                      p: 4,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: '#F29F05', mr: 2 }}>
                        {useCase.icon}
                      </Box>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                        {useCase.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7 }}>
                      {useCase.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* So funktioniert's */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            So funktioniert's
          </Typography>

          <Grid container spacing={4} sx={{ overflow: 'visible', position: 'relative' }}>
            {[
              {
                step: 1,
                icon: <Users size={40} />,
                title: 'Gruppendaten eingeben',
                description: 'Du gibst die Geburtsdaten aller 5 Personen ein. Das ist die Basis für eure Penta-Analyse.',
              },
              {
                step: 2,
                icon: <Calendar size={40} />,
                title: 'Session buchen',
                description: 'Wähle dein Paket und buche deine Penta-Analyse Session mit einem unserer zertifizierten Coaches.',
              },
              {
                step: 3,
                icon: <Video size={40} />,
                title: 'Live-Analyse',
                description: 'In einer 90–120-minütigen Session geht dein Coach eure Gruppendynamik im Detail durch – verständlich, nahbar, auf euch angewendet.',
              },
              {
                step: 4,
                icon: <FileText size={40} />,
                title: 'Ergebnis erhalten',
                description: 'Du erhältst eine ausführliche PDF-Analyse mit allen Rollen, Dynamiken und Potenzialen eurer Gruppe – zum Nachlesen und Vertiefen.',
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ overflow: 'visible' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  style={{ overflow: 'visible' }}
                >
                  <Card
                    sx={{
                      background: 'rgba(242, 159, 5, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 3,
                      p: 4,
                      minHeight: '100%',
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -25,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        boxShadow: '0 6px 20px rgba(242, 159, 5, 0.6)',
                        border: '3px solid rgba(11, 10, 15, 0.8)',
                        zIndex: 10,
                      }}
                    >
                      {item.step}
                    </Box>
                    <Box sx={{ color: '#F29F05', mb: 3, mt: 3, display: 'flex', justifyContent: 'center' }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Bereit, eure Gruppendynamik zu verstehen?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 5,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              Die Penta-Analyse zeigt dir, wie eure Gruppe wirklich funktioniert – und wie ihr euer gemeinsames Potenzial optimal nutzen könnt.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                component={Link}
                href="/preise-penta"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={24} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
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
                Penta-Analyse buchen
              </Button>
              <Button
                component={Link}
                href="/connection-key"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 700,
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
                  borderRadius: 4,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    borderWidth: 2,
                  },
                }}
              >
                Zurück zu Connection Key
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                mt: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Shield size={16} />
              Deine Daten sind sicher. Wir arbeiten vertraulich und wertschätzend mit jeder Gruppe.
            </Typography>
          </motion.div>
        </Box>
      </Box>
      </Container>
    </Box>
  );
}


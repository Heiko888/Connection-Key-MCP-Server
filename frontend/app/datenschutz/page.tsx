'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function DatenschutzPage() {

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
        overflow: 'hidden',
        pt: { xs: 10, md: 14 },
        pb: 8,
      }}
    >
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

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <Logo />

        {/* Back Button */}
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowLeft size={20} />}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 4,
            '&:hover': { 
              background: 'rgba(255,255,255,0.1)',
              color: '#F29F05'
            }
          }}
        >
          Zurück zur Startseite
        </Button>

        <Paper
            sx={{
              p: { xs: 3, md: 5 },
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 4,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Datenschutzerklärung
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                1. Datenschutz auf einen Blick
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.8 }}>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                2. Verantwortliche Stelle
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.8 }}>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                The Connection Key<br />
                [Adresse]<br />
                [Telefon]<br />
                [E-Mail]
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                3. Erhebung und Speicherung personenbezogener Daten
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.8 }}>
                Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch 
                Informationen an den Server unserer Website gesendet. Diese Informationen werden temporär in einem sogenannten 
                Logfile gespeichert.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                4. Ihre Rechte
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.8 }}>
                Sie haben das Recht:<br />
                • Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten<br />
                • Berichtigung unrichtiger Daten zu verlangen<br />
                • Löschung Ihrer bei uns gespeicherten Daten zu verlangen<br />
                • Einschränkung der Datenverarbeitung zu verlangen<br />
                • Widerspruch gegen die Verarbeitung Ihrer Daten einzulegen<br />
                • Datenübertragbarkeit
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                5. Widerspruch oder Widerruf gegen die Verarbeitung Ihrer Daten
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8 }}>
                Wenn Sie der Verarbeitung Ihrer personenbezogenen Daten widersprechen oder eine erteilte Einwilligung widerrufen möchten, 
                können Sie uns jederzeit kontaktieren.
              </Typography>
            </Box>
          </Paper>
      </Container>
    </Box>
  );
}


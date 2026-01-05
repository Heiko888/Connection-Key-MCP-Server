'use client';

import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';

export default function SeitenlistePage() {
  const seiten = [
    // Hauptseiten & Navigation
    { kategorie: 'Hauptseiten & Navigation', seiten: [
      { pfad: '/', name: 'Homepage' },
      { pfad: '/landing', name: 'Landing Page' },
      { pfad: '/dashboard', name: 'Dashboard' },
      { pfad: '/login', name: 'Login' },
      { pfad: '/register', name: 'Registrierung' },
      { pfad: '/logout', name: 'Abmelden' },
    ]},
    
    // Connection Key & Resonanzanalyse
    { kategorie: 'Connection Key & Resonanzanalyse', seiten: [
      { pfad: '/connection-key', name: 'Connection Key Hauptseite' },
      { pfad: '/connection-key/booking', name: 'Connection Key Buchung' },
      { pfad: '/connection-key/results', name: 'Connection Key Ergebnisse' },
      { pfad: '/connection-key/success', name: 'Connection Key Erfolg' },
      { pfad: '/connection-key/penta', name: 'Penta-Analyse Info' },
      { pfad: '/connection-key/beispiele-readings', name: 'Connection Key Beispiele Readings' },
      { pfad: '/connection-code/success', name: 'Connection Code Erfolg' },
      { pfad: '/penta-booking', name: 'Penta-Buchung Info' },
      { pfad: '/penta/booking', name: 'Penta-Buchung' },
      { pfad: '/resonanzanalyse', name: 'Resonanzanalyse Hauptseite' },
      { pfad: '/resonanzanalyse/sofort', name: 'Sofort-Resonanzanalyse' },
      { pfad: '/resonanzanalyse/bereiche', name: 'Resonanzanalyse Bereiche' },
      { pfad: '/resonanzanalyse/next-steps', name: 'Nächste Schritte' },
    ]},
    
    // Human Design Chart & Bodygraph
    { kategorie: 'Human Design Chart & Bodygraph', seiten: [
      { pfad: '/human-design-chart', name: 'Human Design Chart' },
      { pfad: '/human-design-chart/connection-key', name: 'Connection Key im Chart' },
      { pfad: '/human-design-chart/planeten-signatur', name: 'Planeten-Signatur' },
      { pfad: '/human-design-chart/schwelle', name: 'Schwelle' },
      { pfad: '/bodygraph', name: 'Bodygraph' },
    ]},
    
    // Journal & Tracking
    { kategorie: 'Journal & Tracking', seiten: [
      { pfad: '/journal', name: 'Journal' },
      { pfad: '/journal-info', name: 'Journal Info' },
    ]},
    
    // Profil & Einstellungen
    { kategorie: 'Profil & Einstellungen', seiten: [
      { pfad: '/profil', name: 'Profil' },
      { pfad: '/profil/edit', name: 'Profil bearbeiten' },
      { pfad: '/profil-einrichten', name: 'Profil einrichten' },
      { pfad: '/settings', name: 'Einstellungen' },
    ]},
    
    // Community & Social
    { kategorie: 'Community & Social', seiten: [
      { pfad: '/community', name: 'Community' },
      { pfad: '/community/onboarding', name: 'Community Onboarding' },
      { pfad: '/community/profile/[username]', name: 'Community Profil' },
      { pfad: '/community/friends', name: 'Community Freunde' },
      { pfad: '/community-info', name: 'Community Info' },
      { pfad: '/vip-community', name: 'VIP Community' },
    ]},
    
    // Dating & Matching
    { kategorie: 'Dating & Matching', seiten: [
      { pfad: '/dating', name: 'Dating' },
      { pfad: '/dating/match-tips', name: 'Dating Match Tipps' },
      { pfad: '/dating/chat/[id]', name: 'Dating Chat' },
      { pfad: '/dating-impulse', name: 'Dating Impulse' },
      { pfad: '/swipe', name: 'Swipe' },
      { pfad: '/moon-dating', name: 'Moon Dating' },
    ]},
    
    // Coaching
    { kategorie: 'Coaching', seiten: [
      { pfad: '/coaching', name: 'Coaching' },
      { pfad: '/coaching/heiko', name: 'Coaching Heiko' },
      { pfad: '/coaching/janine', name: 'Coaching Janine' },
      { pfad: '/coaching/elisabeth', name: 'Coaching Elisabeth' },
    ]},
    
    // Coach Dashboard (für Coaches)
    { kategorie: 'Coach Dashboard (für Coaches)', seiten: [
      { pfad: '/coach', name: 'Coach Hauptseite' },
      { pfad: '/coach/dashboard', name: 'Coach Dashboard' },
      { pfad: '/coach/readings', name: 'Coach Readings (Legacy)' },
      { pfad: '/coach/readings/create', name: 'Reading erstellen (Legacy)' },
      { pfad: '/coach/readings/[id]', name: 'Reading Details (Legacy)' },
      { pfad: '/coach/readings/[id]/review', name: 'Reading Review' },
      { pfad: '/coach/readings-v2', name: 'Coach Readings V2' },
      { pfad: '/coach/readings-v2/create', name: 'Reading erstellen V2' },
      { pfad: '/coach/readings-v2/[id]', name: 'Reading Details V2' },
      { pfad: '/coach/agents', name: 'Agents Übersicht' },
      { pfad: '/coach/agents/tasks', name: 'Agent Tasks Dashboard' },
      { pfad: '/coach/agents/marketing', name: 'Marketing Agent' },
      { pfad: '/coach/agents/automation', name: 'Automation Agent' },
      { pfad: '/coach/agents/sales', name: 'Sales Agent' },
      { pfad: '/coach/agents/social-youtube', name: 'Social-YouTube Agent' },
      { pfad: '/coach/agents/chart', name: 'Chart Development Agent' },
      { pfad: '/coach/agents/ui-ux', name: 'UI/UX Agent' },
    ]},
    
    // Buchungen & Readings
    { kategorie: 'Buchungen & Readings', seiten: [
      { pfad: '/meine-buchungen', name: 'Meine Buchungen' },
      { pfad: '/custom-readings', name: 'Custom Readings' },
      { pfad: '/buchung/dankeseiten/basic', name: 'Basic Dankeseite' },
      { pfad: '/buchung/dankeseiten/premium', name: 'Premium Dankeseite' },
      { pfad: '/buchung/dankeseiten/vip', name: 'VIP Dankeseite' },
      { pfad: '/buchung/dankeseiten/connection-key-einzelsession', name: 'Connection Key Einzelsession Dankeseite' },
      { pfad: '/buchung/dankeseiten/connection-key-3er-paket', name: 'Connection Key 3er Paket Dankeseite' },
      { pfad: '/buchung/dankeseiten/connection-key-5er-paket', name: 'Connection Key 5er Paket Dankeseite' },
      { pfad: '/buchung/dankeseiten/penta-einzelanalyse', name: 'Penta Einzelanalyse Dankeseite' },
      { pfad: '/buchung/dankeseiten/erweiterte-pentaanalyse', name: 'Erweiterte Pentaanalyse Dankeseite' },
      { pfad: '/buchung/dankeseiten/premium-penta-paket', name: 'Premium Penta-Paket Dankeseite' },
    ]},
    
    // Mondkalender & Mondphasen
    { kategorie: 'Mondkalender & Mondphasen', seiten: [
      { pfad: '/mondkalender', name: 'Mondkalender' },
      { pfad: '/mondkalender-info', name: 'Mondkalender Info' },
      { pfad: '/mondphasen-verstehen', name: 'Mondphasen verstehen' },
    ]},
    
    // Human Design Grundlagen
    { kategorie: 'Human Design Grundlagen', seiten: [
      { pfad: '/grundlagen-hd', name: 'Grundlagen Human Design' },
      { pfad: '/human-design-info', name: 'Human Design Info' },
      { pfad: '/authority', name: 'Autorität' },
      { pfad: '/centers', name: 'Zentren' },
      { pfad: '/channels', name: 'Kanäle' },
      { pfad: '/gates', name: 'Tore' },
      { pfad: '/lines', name: 'Linien' },
      { pfad: '/profiles', name: 'Profile' },
    ]},
    
    // Planeten
    { kategorie: 'Planeten', seiten: [
      { pfad: '/planets', name: 'Planeten Übersicht' },
      { pfad: '/planets/sun', name: 'Sonne' },
      { pfad: '/planets/moon', name: 'Mond' },
      { pfad: '/planets/mercury', name: 'Merkur' },
      { pfad: '/planets/venus', name: 'Venus' },
      { pfad: '/planets/mars', name: 'Mars' },
      { pfad: '/planets/jupiter', name: 'Jupiter' },
      { pfad: '/planets/saturn', name: 'Saturn' },
      { pfad: '/planets/uranus', name: 'Uranus' },
      { pfad: '/planets/neptune', name: 'Neptun' },
      { pfad: '/planets/pluto', name: 'Pluto' },
      { pfad: '/planets/chiron', name: 'Chiron' },
      { pfad: '/planets/incarnation-cross', name: 'Inkarnationskreuz' },
      { pfad: '/lilith', name: 'Lilith' },
      { pfad: '/blackmoonlilith', name: 'Black Moon Lilith' },
    ]},
    
    // Roadmap & Entwicklung
    { kategorie: 'Roadmap & Entwicklung', seiten: [
      { pfad: '/roadmap', name: 'Roadmap' },
    ]},
    
    // Support & Hilfe
    { kategorie: 'Support & Hilfe', seiten: [
      { pfad: '/support', name: 'Support' },
    ]},
    
    // Sales & Marketing
    { kategorie: 'Sales & Marketing', seiten: [
      { pfad: '/sales', name: 'Sales Hauptseite' },
    ]},
    
    // Pricing & Subscription
    { kategorie: 'Pricing & Subscription', seiten: [
      { pfad: '/pricing', name: 'Pricing (Connection Key)' },
      { pfad: '/pricing-hd', name: 'Pricing Human Design' },
      { pfad: '/preise', name: 'Preise' },
      { pfad: '/preise-penta', name: 'Preise Penta' },
      { pfad: '/memberships', name: 'Memberships' },
      { pfad: '/subscription', name: 'Subscription' },
      { pfad: '/subscription/success', name: 'Subscription Erfolg' },
      { pfad: '/upgrade', name: 'Upgrade' },
      { pfad: '/package-overview', name: 'Package Übersicht' },
      { pfad: '/packages/[id]', name: 'Package Details' },
    ]},
    
    // Features & Funktionen
    { kategorie: 'Features & Funktionen', seiten: [
      { pfad: '/features', name: 'Features' },
      { pfad: '/energetische-signatur', name: 'Energetische Signatur' },
      { pfad: '/deine-energetische-signatur', name: 'Deine energetische Signatur' },
      { pfad: '/extended-analysis', name: 'Erweiterte Analyse' },
      { pfad: '/advanced-features', name: 'Erweiterte Features' },
      { pfad: '/realtime-analysis', name: 'Echtzeit-Analyse' },
      { pfad: '/transits', name: 'Transite' },
      { pfad: '/wellness', name: 'Wellness' },
      { pfad: '/relationships', name: 'Beziehungen' },
      { pfad: '/business-career', name: 'Business & Karriere' },
    ]},
    
    // Blog & Blogartikel
    { kategorie: 'Blog & Blogartikel', seiten: [
      { pfad: '/blogartikel', name: 'Blogartikel Übersicht' },
      { pfad: '/blogartikel/[slug]', name: 'Blogartikel Detail (Dynamic)' },
      { pfad: '/blogartikel/human-design-energetischer-blueprint', name: 'Human Design: Dein energetischer Blueprint' },
      { pfad: '/blogartikel/kraft-der-resonanzanalyse', name: '🔑 Energetische Resonanz verstehen' },
      { pfad: '/blogartikel/penta-analyse-gruppenenergie', name: 'Penta-Analyse – Die verborgene Kraft jeder kleinen Gruppe' },
      { pfad: '/blogartikel/dating-mit-human-design', name: 'Dating mit Human Design' },
      { pfad: '/blogartikel/9-zentren-human-design', name: 'Die 9 Zentren im Human Design' },
      { pfad: '/blogartikel/mondkalender-energie', name: 'Mondkalender und deine Energie' },
      { pfad: '/blogartikel/der-moment-in-dem-du-spuerst-das-wird-nix', name: 'Der Moment, in dem du spürst: Das wird nix.' },
      { pfad: '/blogartikel/warum-drama-suechtig-macht', name: 'Warum Drama süchtig macht (biologisch & emotional)' },
      { pfad: '/blogartikel/echte-resonanz-vs-trauma-anziehung', name: 'Echte Resonanz vs. Trauma-Anziehung' },
      { pfad: '/blogartikel/wie-mann-und-frau-naehe-unterschiedlich-aufbauen', name: 'Wie Mann und Frau Nähe unterschiedlich aufbauen' },
      { pfad: '/blogartikel/warum-rueckzug-oft-interesse-ist', name: 'Warum Rückzug oft Interesse ist' },
      { pfad: '/blogartikel/online-dating-zeigt-nicht-dein-muster', name: 'Online-Dating zeigt nicht dein Muster' },
    ]},
    
    // Knowledge & Info
    { kategorie: 'Knowledge & Info', seiten: [
      { pfad: '/knowledge', name: 'Knowledge' },
      { pfad: '/knowledge-ai', name: 'Knowledge AI' },
    ]},
    
    // Events & Community
    { kategorie: 'Events & Community', seiten: [
      { pfad: '/live-events', name: 'Live Events' },
      { pfad: '/exclusive-events', name: 'Exklusive Events' },
    ]},
    
    // Gamification & Social
    { kategorie: 'Gamification & Social', seiten: [
      { pfad: '/gamification', name: 'Gamification' },
      { pfad: '/friends', name: 'Freunde' },
      { pfad: '/share/[id]', name: 'Teilen' },
    ]},
    
    // Admin & Übersicht
    { kategorie: 'Admin & Übersicht', seiten: [
      { pfad: '/admin', name: 'Admin' },
      { pfad: '/seitenliste', name: 'Seitenliste' },
    ]},
    
    // Rechtliches
    { kategorie: 'Rechtliches', seiten: [
      { pfad: '/datenschutz', name: 'Datenschutz' },
      { pfad: '/impressum', name: 'Impressum' },
      { pfad: '/ueber-uns', name: 'Über uns' },
    ]},
    
    
    // Sonstige
    { kategorie: 'Sonstige', seiten: [
      { pfad: '/ai-chat', name: 'AI Chat' },
      { pfad: '/ai-moon-insights', name: 'AI Moon Insights' },
      { pfad: '/priority-support', name: 'Priority Support' },
    ]},
  ];

  const gesamtAnzahl = seiten.reduce((sum, kategorie) => sum + kategorie.seiten.length, 0);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Gold Stars Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: `${10 + i * 2}px`,
              height: `${10 + i * 2}px`,
              background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.05}), transparent 70%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 }
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#FFFFFF',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}
            >
              📋 Komplette Seitenliste
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Gesamt: {gesamtAnzahl} Seiten
            </Typography>

            {seiten.map((kategorie, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}
                >
                  {kategorie.kategorie} ({kategorie.seiten.length} Seiten)
                </Typography>
                
                <List sx={{ 
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  p: 0
                }}>
                  {kategorie.seiten.map((seite, seitenIndex) => (
                    <React.Fragment key={seitenIndex}>
                      <ListItem disablePadding>
                        <ListItemButton
                          component="a"
                          href={seite.pfad}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            py: 1.5,
                            '&:hover': {
                              background: 'rgba(242, 159, 5, 0.1)'
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ 
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: { xs: '0.9rem', md: '1rem' }
                              }}>
                                {seite.name}
                              </Typography>
                            }
                            secondary={
                              <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: { xs: '0.8rem', md: '0.9rem' },
                                fontFamily: 'monospace'
                              }}>
                                {seite.pfad}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {seitenIndex < kategorie.seiten.length - 1 && (
                        <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.2)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))}
          </Paper>
        </Box>
      </PageLayout>
    </Box>
  );
}


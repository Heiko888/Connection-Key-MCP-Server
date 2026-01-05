"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Send,
  Star,
  Users,
  Shield,
  Zap,
  ArrowLeft,
  Menu,
  X,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/PageLayout';
import { supabase } from '@/lib/supabase/client';

// FAQ Daten
const faqData = [
  {
    id: 1,
    question: "Wie funktioniert das Human Design Matching im Connection Key?",
    answer: "Das Matching basiert auf deinem Human Design Chart, deinem Profil, deinen Zentren und deiner energetischen Resonanz.\n\nWir vergleichen deine Aktivierungen mit denen einer anderen Person – inklusive Kompatibilität in Kommunikation, Entscheidungen, Schlafsystem, emotionaler Dynamik und Projektionen.\n\nDas Ergebnis zeigt dir:\n• Wo eure Energie harmoniert\n• Wo Wachstumspotenzial liegt\n• Wie ihr miteinander am stärksten wirkt\n• Welche Themen euch im Alltag begegnen\n\nKurz: Das Matching zeigt dir die energetische Qualität zwischen zwei Menschen – präzise, verständlich und praxisnah.",
    category: "Matching",
    priority: "high"
  },
  {
    id: 2,
    question: "Was ist der Unterschied zwischen Reading, Resonanzanalyse und Penta-Analyse?",
    answer: "Human Design Reading:\nDein individuelles Energiesystem, erklärt: Typ, Strategie, Autorität, Zentren, Tore, Linien, Profil.\n\nResonanzanalyse:\nMisst die energetische Verbindung zwischen zwei Personen – Beziehung, Dating, Familie, Freundschaft, Business.\n\nPenta-Analyse:\nAnalysiert die Dynamik in Gruppen ab 3 Personen: Familien, Teams, Partnerschaften mit Kindern, Freundeskreise.\n\nSie zeigt:\n• Welche Rolle jeder im Feld übernimmt\n• Wo Energie fließt oder blockiert\n• Welche Muster automatisch entstehen\n\nZusammen ergeben alle drei Analysen ein vollständiges Bild deiner energetischen Welt.",
    category: "Readings",
    priority: "high"
  },
  {
    id: 3,
    question: "Kann ich mein Abonnement jederzeit kündigen oder pausieren?",
    answer: "Ja.\n\nDu kannst dein Abo jederzeit mit wenigen Klicks im Account-Bereich kündigen.\n\nNach der Kündigung bleibt alles bis zum Ende des Abrechnungszeitraums aktiv.\n\nEine Pausierung ist ebenfalls möglich – dein Zugang wird dann stillgelegt, aber deine Daten bleiben gespeichert.",
    category: "Abonnement",
    priority: "high"
  },
  {
    id: 4,
    question: "Wie sicher sind meine Daten und wer kann meine Auswertungen sehen?",
    answer: "Der Schutz deiner Daten hat höchste Priorität.\n\n• Alle Daten werden verschlüsselt übertragen (SSL/TLS).\n• Nichts wird an Dritte verkauft oder weitergegeben.\n• Deine Readings, Analysen und Matching-Ergebnisse sind nur für dich sichtbar.\n• Du entscheidest selbst, ob du ein Matching mit einer anderen Person freigibst.\n\nAuf Wunsch kannst du alle Daten jederzeit löschen.",
    category: "Sicherheit",
    priority: "high"
  },
  {
    id: 5,
    question: "Wie kann ich mein Profil optimieren, um bessere Matches zu erhalten?",
    answer: "Für präzise Matches ist es wichtig, dass folgende Daten korrekt sind:\n\n• Exakte Geburtszeit\n• Geburtsort\n• Typ & Profil (werden automatisch generiert)\n• Beziehungsstatus (optional)\n• Interessen / Art der Verbindung, die du suchst\n\nZusätzlich hilft es, ein Profilbild hochzuladen – Menschen resonieren schneller mit sichtbarer Energie.\n\nUnd: Menschen matchen besser, wenn du dein Profil ehrlich ausfüllst, statt „optimal“.",
    category: "Profil",
    priority: "medium"
  },
  {
    id: 6,
    question: "Funktioniert die App auch auf dem Smartphone oder offline?",
    answer: "Ja.\n\nDie App läuft auf allen modernen Smartphones, Tablets und Desktops.\n\nOffline-Modus:\nEinige Bereiche der App können ohne Internet angezeigt werden (z. B. bereits gespeicherte Readings), aber Live-Matching, Resonanzanalyse und Chart-Berechnung erfordern Internet.",
    category: "Technik",
    priority: "low"
  },
  {
    id: 7,
    question: "Wie kann ich eine Penta-Analyse für Familie, Team oder Beziehung anfragen?",
    answer: "Du kannst im Bereich \"Readings & Analysen\" einfach Personen hinzufügen:\n\n• Namen\n• Geburtsdaten\n• Art der Verbindung (Familie, Team, Beziehung etc.)\n\nDie App erzeugt automatisch:\n• Gruppenfeld\n• Rollenverteilung\n• energetische Dynamik\n• Stärken und Konfliktpotenziale\n\nFür große Teams (5–12 Personen) gibt es eine erweiterte Penta-Analyse, die du direkt über den Support buchen kannst.",
    category: "Penta",
    priority: "medium"
  }
];

// Support-Kategorien
const supportCategories = [
  {
    title: "Technischer Support",
    description: "Probleme mit Login, Anzeige des Charts oder Funktionen in der App.",
    icon: <Zap size={20} />,
    color: "#F29F05",
    responseTime: "24 Stunden"
  },
  {
    title: "Account & Abonnement",
    description: "Fragen zu deinem Profil, Abo, Zahlungsdaten oder Upgrade.",
    icon: <Users size={20} />,
    color: "#F29F05",
    responseTime: "12 Stunden"
  },
  {
    title: "Sicherheit & Datenschutz",
    description: "Fragen zu Datensicherheit, Löschung oder Speicherung deiner Informationen.",
    icon: <Shield size={20} />,
    color: "#F29F05",
    responseTime: "6 Stunden"
  }
];

// Kontakt-Informationen
const contactInfo = [
  {
    type: "E-Mail",
    value: "support@the-connection-key.de",
    icon: <Mail size={20} />,
    description: "Für alle allgemeinen Anfragen rund um App, Readings und Abonnement."
  },
  {
    type: "Live-Chat",
    value: "Verfügbar 24/7",
    icon: <MessageCircle size={20} />,
    description: "Sofortige Hilfe direkt im Chat, wenn du schnell Unterstützung brauchst."
  },
  {
    type: "Telefon",
    value: "+49 30 12345678",
    icon: <Phone size={20} />,
    description: "Mo–Fr 9:00–18:00 Uhr\nFür dringende Anliegen oder persönliche Klärung."
  }
];

export default function SupportPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedFaq, setExpandedFaq] = useState<number | false>(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'Technischer Support'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const handleFaqChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value
    });
  };

  const handleSelectChange = (event: any) => {
    setContactForm({
      ...contactForm,
      category: event.target.value as string
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simuliere API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'Technischer Support'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'rgba(242, 159, 5, 0.3)';
      case 'medium': return 'rgba(242, 159, 5, 0.2)';
      case 'low': return 'rgba(242, 159, 5, 0.15)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const supportCategoriesList = [
    'Technischer Support',
    'Account & Abonnement',
    'Readings & Analysen',
    'Penta / Familie / Team',
    'Sicherheit & Datenschutz',
    'Sonstiges'
  ];

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
      overflow: 'hidden',
    }}>
      <PageLayout activePage="support" showLogo={true} maxWidth="lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 }, px: { xs: 2, md: 0 } }}>
            <Typography variant="h1" sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: { xs: 2, md: 3 },
              textShadow: '0 0 30px rgba(242, 159, 5, 0.3)',
              letterSpacing: '-0.02em'
            }}>
              Support
            </Typography>
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.95)',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              px: { xs: 2, md: 0 },
              mb: 2,
              fontWeight: 500
            }}>
              Wir helfen dir gerne weiter. Finde Antworten auf deine Fragen zu Readings, Resonanzanalysen und deinem Account – oder kontaktiere uns direkt.
            </Typography>
            <Typography variant="body2" sx={{
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontStyle: 'italic'
            }}>
              Technische Frage? Unklare Auswertung? Schreib uns – wir sind für dich da.
            </Typography>
          </Box>
        </motion.div>

        {/* Support-Kategorien */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Typography variant="h4" sx={{ 
            color: '#fff', 
            mb: { xs: 3, md: 4 }, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' },
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Kontakt-Optionen
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: { xs: 5, md: 8 } }}>
            {supportCategories.map((category, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                  borderRadius: { xs: 2, md: 3 },
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'rgba(242, 159, 5, 0.4)',
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)'
                  }
                }}>
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                    <Box sx={{ 
                      color: '#F29F05', 
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" sx={{ 
                      color: '#fff', 
                      mb: { xs: 1, md: 1.5 },
                      fontWeight: 600,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 2,
                      lineHeight: 1.6,
                      fontSize: { xs: '0.9rem', md: '0.95rem' }
                    }}>
                      {category.description}
                    </Typography>
                    <Chip 
                      label={`Antwort in der Regel innerhalb von ${category.responseTime}`}
                      sx={{ 
                        background: 'rgba(242, 159, 5, 0.15)',
                        color: '#F29F05',
                        fontWeight: 600,
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h4" sx={{ 
            color: '#fff', 
            mb: { xs: 3, md: 4 }, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' },
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            Häufige Fragen
          </Typography>
          
          <Box sx={{ mb: { xs: 5, md: 8 } }}>
            {faqData.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedFaq === faq.id}
                onChange={handleFaqChange(faq.id)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: { xs: 2, md: 2 },
                  mb: 2,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={20} color="#F29F05" />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ color: '#fff', flex: 1, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
                      {faq.question}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={faq.category}
                        size="small"
                        sx={{ background: 'rgba(242, 159, 5, 0.2)', color: '#F29F05', border: '1px solid rgba(242, 159, 5, 0.3)' }}
                      />
                      <Chip 
                        label={faq.priority}
                        size="small"
                        sx={{ 
                          background: getPriorityColor(faq.priority),
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          fontSize: '0.75rem',
                          opacity: 0.8
                        }}
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </motion.div>

        {/* Kontakt-Formular */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={{ xs: 3, md: 6 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '1.5rem', md: '2rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                Kontakt-Formular
              </Typography>
              
              {submitSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  <CheckCircle size={20} style={{ marginRight: 8 }} />
                  Deine Nachricht wurde erfolgreich gesendet! Wir melden uns innerhalb von 24 Stunden.
                </Alert>
              )}
              
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: { xs: 2, md: 3 }
              }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Name *"
                          value={contactForm.name}
                          onChange={handleInputChange('name')}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="E-Mail *"
                          type="email"
                          value={contactForm.email}
                          onChange={handleInputChange('email')}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Betreff *"
                          value={contactForm.subject}
                          onChange={handleInputChange('subject')}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth required>
                          <InputLabel 
                            sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#F29F05' }
                            }}
                          >
                            Kategorie
                          </InputLabel>
                          <Select
                            value={contactForm.category}
                            onChange={handleSelectChange}
                            label="Kategorie"
                            sx={{
                              color: '#fff',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.3)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,255,255,0.5)',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#F29F05',
                              },
                              '& .MuiSvgIcon-root': {
                                color: 'rgba(255,255,255,0.7)',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: '#1a1a1a',
                                  border: '1px solid rgba(242, 159, 5, 0.3)',
                                  '& .MuiMenuItem-root': {
                                    color: '#fff',
                                    '&:hover': {
                                      bgcolor: 'rgba(242, 159, 5, 0.2)',
                                    },
                                    '&.Mui-selected': {
                                      bgcolor: 'rgba(242, 159, 5, 0.3)',
                                      '&:hover': {
                                        bgcolor: 'rgba(242, 159, 5, 0.4)',
                                      },
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            {supportCategoriesList.map((cat) => (
                              <MenuItem key={cat} value={cat}>
                                {cat}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Nachricht *"
                          value={contactForm.message}
                          onChange={handleInputChange('message')}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          startIcon={<Send size={18} />}
                          fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: '#fff',
                            py: { xs: 1, md: 1.5 },
                            px: { xs: 2, md: 4 },
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            fontWeight: 600,
                            borderRadius: { xs: 2, md: 3 },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)'
                            },
                            '&:disabled': {
                              background: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.5)'
                            }
                          }}
                        >
                          {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                        </Button>
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255,255,255,0.6)',
                          mt: 1,
                          display: 'block',
                          textAlign: 'center',
                          fontSize: '0.75rem'
                        }}>
                          Wir melden uns in der Regel innerhalb von 24 Stunden bei dir.
                        </Typography>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ 
                color: '#fff', 
                mb: { xs: 3, md: 4 },
                fontSize: { xs: '1.5rem', md: '2rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                Direkter Kontakt
              </Typography>
              
              <Box sx={{ mb: { xs: 3, md: 4 } }}>
                {contactInfo.map((contact, index) => (
                  <Card key={index} sx={{
                    background: 'rgba(242, 159, 5, 0.05)',
                    border: '1px solid rgba(242, 159, 5, 0.15)',
                    borderRadius: { xs: 2, md: 2 },
                    mb: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(242, 159, 5, 0.3)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ color: '#F29F05', mt: 0.5 }}>
                          {contact.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            color: '#fff', 
                            mb: 1,
                            fontWeight: 600,
                            fontSize: { xs: '1rem', md: '1.25rem' }
                          }}>
                            {contact.type}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: '#F29F05', 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}>
                            {contact.value}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                            fontSize: { xs: '0.85rem', md: '0.9rem' }
                          }}>
                            {contact.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Support-Status */}
              <Card sx={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: { xs: 2, md: 2 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                }
              }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckCircle size={20} color="#10b981" />
                    <Typography variant="h6" sx={{ 
                      color: '#10b981',
                      fontWeight: 600,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}>
                      Support-Status: Online
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}>
                    Unser Support-Team ist aktuell verfügbar und antwortet schnell auf deine Anfragen.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 8 }, px: { xs: 2, md: 0 } }}>
            <Typography variant="h5" sx={{ 
              color: '#fff', 
              mb: 2,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              px: { xs: 2, md: 0 },
              fontWeight: 600
            }}>
              Noch nicht gefunden, was du suchst?
            </Typography>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              sx={{
                color: '#F29F05',
                borderColor: '#F29F05',
                fontWeight: 600,
                px: { xs: 3, md: 5 },
                py: { xs: 1.25, md: 1.75 },
                fontSize: { xs: '0.9rem', md: '1rem' },
                borderRadius: { xs: 2, md: 2 },
                mb: 1.5,
                '&:hover': {
                  borderColor: '#8C1D04',
                  color: '#8C1D04',
                  background: 'rgba(242, 159, 5, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zum Dashboard
            </Button>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.6)',
              display: 'block',
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              Dort findest du deine Readings, Analysen und persönlichen Einstellungen.
            </Typography>
          </Box>
        </motion.div>
      </PageLayout>
    </Box>
  );
}

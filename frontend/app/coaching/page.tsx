"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Box, Button, Paper, Chip, Grid, Avatar, Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton, Divider, Alert, CircularProgress, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, Calendar, ArrowRight, Clock, MapPin, Phone, Mail, BookOpen, User, Send, X, MessageSquare, LogOut } from 'lucide-react';
import Image from 'next/image';
import AccessControl from '../../components/AccessControl';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

interface CoachExtended {
  id: number;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: string;
  specializations: string[];
  description: string;
  sessions: Array<{ type: string; price: string; duration: string }>;
  availability: string[];
  languages: string[];
  profileUrl: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  message: string;
  sessionType: string;
  date: string;
  time: string;
}

function CoachingContent() {
  const router = useRouter();
  const [selectedCoach, setSelectedCoach] = useState<CoachExtended | null>(null);
  const [bookingDialog, setBookingDialog] = useState<boolean>(false);
  const [chatDialog, setChatDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<{ [coachId: number]: Message[] }>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<{ [coachId: number]: boolean }>({});
  // Subscription-Hook wird später implementiert
  const userSubscription = null;
  const forceSync = () => {};
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    sessionType: '1:1 Coaching',
    date: '',
    time: ''
  });

  // Buchungsformular State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    sessionType: "", 
    date: "", 
    time: "", 
    message: "" 
  });
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authentifizierung prüfen
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, []);

  // Force sync subscription on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userSubscription) {
        console.log('Coaching: No subscription found, forcing sync...');
        forceSync();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [userSubscription, forceSync]);


  const coaches: CoachExtended[] = [
    {
      id: 1,
      name: "Heiko",
      title: "Human Design Experte & Life Coach",
      avatar: "/images/heiko.jpg",
      rating: 4.9,
      reviews: 127,
      experience: "8+ Jahre",
      specializations: ["Human Design", "Life Coaching", "Beziehungen", "Karriere"],
      description: "Heiko ist ein zertifizierter Human Design Experte mit über 8 Jahren Erfahrung. Er hilft Menschen dabei, ihre einzigartige Design zu verstehen und im Alltag zu leben.",
      sessions: [
        { type: "1:1 Coaching", price: "120€", duration: "60 Min" },
        { type: "Gruppen-Session", price: "80€", duration: "90 Min" },
        { type: "Intensiv-Workshop", price: "300€", duration: "3 Stunden" }
      ],
      availability: ["Mo-Fr: 9:00-18:00", "Sa: 10:00-16:00"],
      languages: ["Deutsch", "Englisch"],
      profileUrl: "/coaching/heiko",
      isOnline: true,
      lastSeen: "vor 2 Minuten"
    },
    {
      id: 2,
      name: "Janine",
      title: "Human Design Beraterin & Therapeutin",
      avatar: "/coaches/janine.jpg",
      rating: 4.8,
      reviews: 89,
      experience: "6+ Jahre",
      specializations: ["Human Design", "Psychologie", "Familie", "Kinder"],
      description: "Janine ist eine erfahrene Human Design Beraterin mit psychologischem Hintergrund. Sie spezialisiert sich auf Familien- und Beziehungsdynamiken.",
      sessions: [
        { type: "1:1 Coaching", price: "100€", duration: "60 Min" },
        { type: "Paar-Coaching", price: "150€", duration: "90 Min" },
        { type: "Familien-Session", price: "200€", duration: "120 Min" }
      ],
      availability: ["Di-Do: 10:00-17:00", "Fr: 9:00-15:00"],
      languages: ["Deutsch", "Französisch"],
      profileUrl: "/coaching/janine",
      isOnline: false,
      lastSeen: "vor 1 Stunde"
    },
    {
      id: 3,
      name: "Elisabeth",
      title: "Human Design Master & Business Coach",
      avatar: "/coaches/elisabeth.jpg",
      rating: 4.7,
      reviews: 98,
      experience: "7+ Jahre",
      specializations: ["Human Design", "Business", "Leadership", "Team-Dynamik"],
      description: "Elisabeth hilft Führungskräften und Unternehmern dabei, ihre Human Design im beruflichen Kontext zu nutzen und erfolgreiche Teams aufzubauen.",
      sessions: [
        { type: "1:1 Coaching", price: "160€", duration: "60 Min" },
        { type: "Business Design", price: "200€", duration: "90 Min" },
        { type: "Team-Workshop", price: "500€", duration: "4 Stunden" }
      ],
      availability: ["So: 09:00-12:00"],
      languages: ["Deutsch", "Englisch"],
      profileUrl: "/coaching/elisabeth",
      isOnline: false,
      lastSeen: "vor 30 Minuten"
    }
  ];

  const handleCoachSelect = (coach: CoachExtended) => {
    setSelectedCoach(coach);
    setBookingDialog(true);
  };

  const handleChatOpen = (coach: CoachExtended) => {
    setSelectedCoach(coach);
    setChatDialog(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCoach) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedCoach.id]: [...(prev[selectedCoach.id] || []), message]
    }));

    setNewMessage('');
    setIsTyping(true);

    // Simuliere Coach-Antwort
    setTimeout(() => {
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Vielen Dank für deine Nachricht! Ich werde dir so schnell wie möglich antworten. 😊`,
        sender: 'coach',
        timestamp: new Date()
      };

      setMessages(prev => ({
        ...prev,
        [selectedCoach.id]: [...(prev[selectedCoach.id] || []), coachMessage]
      }));

      setIsTyping(false);
    }, 2000);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/coaching/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: selectedCoach?.id,
          ...bookingData
        })
      });
      
      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, "Fehler bei der Buchung");
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Buchung erfolgreich! Du erhältst eine Bestätigung per E-Mail.");
        setBookingDialog(false);
        setBookingData({
          name: '',
          email: '',
          phone: '',
          message: '',
          sessionType: '1:1 Coaching',
          date: '',
          time: ''
        });
      } else {
        setError(data.message || "Fehler bei der Buchung");
      }
    } catch (err) {
      setError("Fehler bei der Buchung. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Supabase Logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout Fehler:', error);
        setError('Fehler beim Abmelden');
        return;
      }
      
      // LocalStorage leeren
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      // ✅ DEAKTIVIERT: profileSetupCompleted wird nicht mehr verwendet
      
      console.log('Erfolgreich abgemeldet');
      // Verzögerte Weiterleitung um Loop zu vermeiden
      setTimeout(() => router.push('/login'), 100);
    } catch (err) {
      console.error('Logout Fehler:', err);
      setError('Fehler beim Abmelden');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/coaching/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess("Buchung erfolgreich! Du erhältst eine Bestätigung per E-Mail.");
        setForm({ name: "", email: "", phone: "", sessionType: "", date: "", time: "", message: "" });
        setShowBookingForm(false);
      } else {
        setError("Fehler bei der Buchung. Bitte versuche es erneut.");
      }
    } catch (err) {
      setError("Fehler bei der Buchung. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessControl
      path="/coaching"
      userSubscription={userSubscription}
      onUpgrade={() => router.push('/pricing')}
    >
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
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

        {/* Abmelde-Button fixiert oben rechts */}
        <Box sx={{ 
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="text"
            onClick={handleLogout}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              minWidth: 'auto',
              px: 2,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)'
              },
              transition: 'all 0.3s ease'
            }}
            startIcon={<LogOut size={18} />}
          >
            Abmelden
          </Button>
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, px: { xs: 2, md: 4 } }}>
          {/* Header mit Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              {/* Logo */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 4,
                position: 'relative'
              }}>
                <Box sx={{
                  position: 'relative',
                  height: { xs: 120, md: 180 },
                  width: { xs: 300, md: 450 },
                  mx: 'auto'
                }}>
                  <Image
                    src="/images/connection-key-optimized.png"
                    alt="The Connection Key Logo"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </Box>
              </Box>
              
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '0 0 32px rgba(242, 159, 5, 0.30)'
                }}
              >
                👥 Coaching & Community
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  mb: 6,
                  maxWidth: 700,
                  mx: 'auto',
                  lineHeight: 1.8,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}
              >
                Buche deine persönliche Human Design Session, chatte mit unseren Coaches oder trete unserer Community bei
              </Typography>
            </Box>
          </motion.div>
        {/* Coaches Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {coaches.map((coach, index) => (
            <Grid item xs={12} md={4} key={coach.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    background: 'rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(242, 159, 5, 0.5)'
                  }
                }}>
                  <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          mr: 3,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {!imageErrors[coach.id] ? (
                          <Box
                            component="img"
                            src={coach.avatar}
                            alt={coach.name}
                            onError={() => setImageErrors(prev => ({ ...prev, [coach.id]: true }))}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              color: 'white',
                              fontSize: '2rem',
                              fontWeight: 700,
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            {coach.name.charAt(0)}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mr: 2 }}>
                            {coach.name}
                          </Typography>
                          <Chip
                            label={coach.isOnline ? 'Online' : 'Offline'}
                            size="small"
                            sx={{
                              background: coach.isOnline ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          {coach.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={coach.rating} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {coach.rating} ({coach.reviews} Bewertungen)
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {coach.experience} Erfahrung
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6, flex: '0 0 auto' }}>
                      {coach.description}
                    </Typography>

                    <Box sx={{ mb: 3, flex: '0 0 auto' }}>
                      <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1, fontWeight: 600 }}>
                        Spezialisierungen:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {coach.specializations.map((spec, idx) => (
                          <Chip
                            key={idx}
                            label={spec}
                            size="small"
                            sx={{
                              background: 'rgba(242, 159, 5, 0.25)',
                              color: '#F29F05',
                              border: '1px solid rgba(242, 159, 5, 0.4)',
                              fontWeight: 600
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3, flex: '0 0 auto' }}>
                      <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1, fontWeight: 600 }}>
                        Verfügbarkeit:
                      </Typography>
                      {coach.availability.map((time, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                          {time}
                        </Typography>
                      ))}
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          component={Link}
                          href="/connection-key/booking"
                          startIcon={<Calendar size={20} />}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(242, 159, 5, 0.35)'
                            },
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 700
                          }}
                        >
                          Buchen
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<MessageSquare size={20} />}
                          onClick={() => handleChatOpen(coach)}
                          sx={{
                            color: '#F29F05',
                            borderColor: 'rgba(242, 159, 5, 0.5)',
                            '&:hover': {
                              borderColor: '#F29F05',
                              backgroundColor: 'rgba(242, 159, 5, 0.10)',
                              transform: 'translateY(-2px)'
                            },
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 700
                          }}
                        >
                          Chat
                        </Button>
                      </Grid>
                    </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
            p: { xs: 4, md: 6 }
          }}>
            <Typography variant="h3" sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3, 
              fontWeight: 800, 
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              🌟 VIP Community
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              mb: 4, 
              textAlign: 'center',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.8
            }}>
              Tritt unserer exklusiven VIP Community bei und verbinde dich mit Gleichgesinnten auf ihrer Human Design Journey.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Users size={24} />}
                onClick={() => router.push('/vip-community')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.45)'
                  },
                  borderRadius: 3,
                  px: 6,
                  py: 2.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease'
                }}
              >
                Community beitreten
              </Button>
            </Box>
          </Card>
        </motion.div>

        {/* Booking Dialog */}
        <Dialog
          open={bookingDialog}
          onClose={() => setBookingDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
            Session buchen - {selectedCoach?.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Session-Typ"
                  value={bookingData.sessionType}
                  onChange={(e) => setBookingData({ ...bookingData, sessionType: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                >
                  {selectedCoach?.sessions.map((session, index) => (
                    <MenuItem key={index} value={session.type}>
                      {session.type} - {session.price} ({session.duration})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Datum"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Uhrzeit"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Nachricht (optional)"
                  value={bookingData.message}
                  onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setBookingDialog(false)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleBookingSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.35)'
                },
                borderRadius: 3,
                px: 3,
                fontWeight: 700
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Buchen'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog
          open={chatDialog}
          onClose={() => setChatDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              height: '70vh'
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            <Avatar src={selectedCoach?.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
            Chat mit {selectedCoach?.name}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {selectedCoach && messages[selectedCoach.id]?.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      background: message.sender === 'user' 
                        ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedCoach?.name} tippt...
                    </Typography>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Nachricht schreiben..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: '#4ecdc4' }
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                variant="contained"
                disabled={!newMessage.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.35)'
                  },
                  borderRadius: 3,
                  minWidth: 'auto',
                  px: 2,
                  fontWeight: 700
                }}
              >
                <Send size={20} />
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
        </Container>
      </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute (VIP erforderlich)
export default function CoachingPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <CoachingContent />
    </ProtectedRoute>
  );
}

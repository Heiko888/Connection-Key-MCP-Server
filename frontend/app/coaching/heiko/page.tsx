"use client";
import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Avatar, Button, Chip, TextField, MenuItem, Alert, CircularProgress, Container, Grid } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "../../components/PageLayout";
import { motion } from "framer-motion";
import { Star, MapPin, Heart, Sparkles, ArrowLeft, Users, BookOpen, TrendingUp, User, Mail, Phone, Calendar, Clock, MessageSquare, Send, LogOut, Award, Target, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// Animierte Sterne Komponente
const AnimatedStars = () => {
  // Feste Positionen für konsistente SSR
  const starPositions = [
    { left: '10%', top: '20%' },
    { left: '25%', top: '15%' },
    { left: '40%', top: '30%' },
    { left: '55%', top: '10%' },
    { left: '70%', top: '25%' },
    { left: '85%', top: '35%' },
    { left: '15%', top: '45%' },
    { left: '30%', top: '60%' },
    { left: '45%', top: '50%' },
    { left: '60%', top: '70%' },
    { left: '75%', top: '55%' },
    { left: '90%', top: '65%' },
    { left: '20%', top: '80%' },
    { left: '35%', top: '85%' },
    { left: '50%', top: '90%' },
  ];

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {starPositions.map((pos, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            background: '#FFD700',
            borderRadius: '50%',
            boxShadow: '0 0 8px #FFD700, 0 0 16px #FFD700, 0 0 24px #FFD700',
            left: pos.left,
            top: pos.top,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.6, 1.4, 0.6],
          }}
          transition={{
            duration: 2.5 + (i * 0.2),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </Box>
  );
};

// Leuchtender Mond Komponente
const AnimatedMoon = () => (
  <Box sx={{ position: 'absolute', top: 50, right: 50, pointerEvents: 'none', zIndex: 1 }}>
    <motion.div
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #f0f8ff 30%, #e6f3ff 60%, #cce7ff 100%)',
        boxShadow: `
          0 0 20px rgba(255, 255, 255, 0.8),
          0 0 40px rgba(255, 255, 255, 0.6),
          0 0 60px rgba(255, 255, 255, 0.4),
          0 0 80px rgba(255, 255, 255, 0.2),
          inset 0 0 20px rgba(255, 255, 255, 0.3)
        `,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
        rotate: [0, 5, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Mond-Krater */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: `
          radial-gradient(ellipse 20px 15px at 30% 25%, rgba(200, 220, 255, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 15px 10px at 70% 60%, rgba(200, 220, 255, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 12px 8px at 20% 70%, rgba(200, 220, 255, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse 18px 12px at 80% 30%, rgba(200, 220, 255, 0.15) 0%, transparent 50%)
        `
      }} />
      
      {/* Mond-Glanz */}
      <motion.div
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)',
          top: '15%',
          left: '15%'
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
    
    {/* Mond-Aura */}
    <motion.div
      style={{
        position: 'absolute',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        top: '-20px',
        left: '-20px',
        zIndex: -1
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </Box>
);

export default function HeikoProfilePage() {
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [imageError, setImageError] = useState(false);
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

  const sessionTypes = [
    "Business Coaching",
    "Leadership", 
    "Teamführung",
    "Strategie"
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const res = await fetch("/api/coaching/sessionrequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coach: "Heiko Schwaninger" })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess("Session-Anfrage erfolgreich versendet! Heiko meldet sich bald bei dir. ✨");
        setForm({ name: "", email: "", phone: "", sessionType: "", date: "", time: "", message: "" });
        setShowBookingForm(false);
      } else {
        setError(data.error || "Fehler beim Senden der Anfrage. Bitte versuche es erneut.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte überprüfe deine Internetverbindung.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout Fehler:', error);
        setError('Fehler beim Abmelden');
        return;
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      // ✅ DEAKTIVIERT: profileSetupCompleted wird nicht mehr verwendet
      
      console.log('Erfolgreich abgemeldet');
      setTimeout(() => router.push('/login'), 100);
    } catch (err) {
      console.error('Logout Fehler:', err);
      setError('Fehler beim Abmelden');
    }
  };

  return (
    <>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at top, rgba(242, 159, 5, 0.15) 0%, rgba(0, 0, 0, 1) 50%), radial-gradient(ellipse at bottom, rgba(140, 29, 4, 0.1) 0%, rgba(0, 0, 0, 1) 70%)',
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <AnimatedStars />
        <AnimatedMoon />
        
        <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
            {/* Zurück-Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                component={Link}
                href="/coaching"
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                sx={{ 
                  color: '#fff', 
                  borderColor: 'rgba(242, 159, 5, 0.5)', 
                  fontWeight: 600, 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: 'rgba(242, 159, 5, 0.1)',
                  backdropFilter: 'blur(10px)',
                  mb: 4,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.2)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Zurück zur Coaching-Übersicht
              </Button>
            </motion.div>

            {/* Hauptkarte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card sx={{ 
                maxWidth: 900, 
                mx: 'auto', 
                borderRadius: 4, 
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                background: 'rgba(15, 15, 35, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                overflow: 'hidden'
              }}>
                {/* Header mit Avatar */}
                <Box sx={{ 
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(140, 29, 4, 0.1) 100%)',
                  p: { xs: 3, md: 5 },
                  textAlign: 'center',
                  position: 'relative',
                  borderBottom: '1px solid rgba(242, 159, 5, 0.2)'
                }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Box sx={{ 
                      position: 'relative',
                      width: { xs: 120, md: 160 }, 
                      height: { xs: 120, md: 160 }, 
                      mx: 'auto', 
                      mb: 3,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)', 
                      border: '4px solid rgba(242, 159, 5, 0.5)',
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    }}>
                      {!imageError ? (
                        <Box
                          component="img"
                          src="/images/heiko.jpg"
                          alt="Heiko Schwaninger"
                          onError={() => setImageError(true)}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            fontWeight: 700,
                            pointerEvents: 'none',
                          }}
                        >
                          H
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                      <Sparkles size={28} style={{ color: '#F29F05' }} />
                    </Box>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: '#F29F05', 
                      fontWeight: 800, 
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' }
                    }}>
                      Heiko Schwaninger
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      fontWeight: 500,
                      mb: 3,
                      fontSize: { xs: '1rem', md: '1.2rem' }
                    }}>
                      Human Design Coach & Business Coach
                    </Typography>
                    
                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<Star size={16} />} 
                        label="Generator" 
                        sx={{ 
                          background: 'rgba(242, 159, 5, 0.2)', 
                          color: '#F29F05', 
                          fontWeight: 600,
                          border: '1px solid rgba(242, 159, 5, 0.4)'
                        }} 
                      />
                      <Chip 
                        icon={<MapPin size={16} />} 
                        label="Miltenberg" 
                        sx={{ 
                          background: 'rgba(242, 159, 5, 0.2)', 
                          color: '#F29F05', 
                          fontWeight: 600,
                          border: '1px solid rgba(242, 159, 5, 0.4)'
                        }} 
                      />
                      <Chip 
                        icon={<TrendingUp size={16} />} 
                        label="Business Coaching" 
                        sx={{ 
                          background: 'rgba(242, 159, 5, 0.2)', 
                          color: '#F29F05', 
                          fontWeight: 600,
                          border: '1px solid rgba(242, 159, 5, 0.4)'
                        }} 
                      />
                    </Box>
                  </motion.div>
                </Box>

                {/* Content */}
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Typography variant="h5" sx={{ 
                      color: '#F29F05', 
                      fontWeight: 700, 
                      mb: 3,
                      textAlign: 'center',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}>
                      Meine Geschichte
                    </Typography>
                    
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      mb: 3, 
                      fontWeight: 400,
                      lineHeight: 1.8,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}>
                      Als erfahrener Human Design Coach und Business Coach helfe ich Menschen dabei, 
                      ihre energetische Natur zu verstehen und ihr volles Potenzial im Berufsleben 
                      und in der Persönlichkeitsentwicklung zu entfalten.
                    </Typography>

                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      mb: 4, 
                      fontWeight: 400,
                      lineHeight: 1.8,
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}>
                      Ich spezialisiere mich auf Human Design Basics, detaillierte Chart-Analysen 
                      und energetische Potenzialentfaltung für beruflichen und persönlichen Erfolg.
                    </Typography>

                    {/* Spezialisierungen */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#F29F05', 
                        fontWeight: 700, 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Target size={24} />
                        Meine Spezialisierungen
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Human Design Basics', icon: <BookOpen size={20} /> },
                          { label: 'Chart-Analyse', icon: <Award size={20} /> },
                          { label: 'Business Coaching', icon: <TrendingUp size={20} /> },
                          { label: 'Energetische Potenzialentfaltung', icon: <Zap size={20} /> },
                          { label: 'Persönlichkeitsentwicklung', icon: <Users size={20} /> }
                        ].map((spec) => (
                          <Grid item xs={12} sm={6} key={spec.label}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(242, 159, 5, 0.1)',
                              border: '1px solid rgba(242, 159, 5, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(242, 159, 5, 0.2)',
                                transform: 'translateX(4px)',
                                borderColor: '#F29F05'
                              }
                            }}>
                              <Box sx={{ color: '#F29F05' }}>
                                {spec.icon}
                              </Box>
                              <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)', 
                                fontWeight: 500 
                              }}>
                                {spec.label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* CTA Button */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => setShowBookingForm(true)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                          color: '#fff', 
                          fontWeight: 700, 
                          borderRadius: 3,
                          px: 6,
                          py: 2,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          textTransform: 'none',
                          boxShadow: '0 8px 24px rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 32px rgba(242, 159, 5, 0.5)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Session mit Heiko buchen
                      </Button>
                    </Box>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </PageLayout>

        {/* Buchungsformular Modal - außerhalb PageLayout für fixed positioning */}
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: 600, width: '100%' }}
            >
              <Card sx={{ 
                background: 'rgba(15, 15, 35, 0.95)', 
                backdropFilter: 'blur(20px)',
                borderRadius: 4, 
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ 
                      color: '#F29F05', 
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}>
                      <BookOpen size={28} style={{ color: '#F29F05' }} />
                      Session buchen
                    </Typography>
                    <Button
                      onClick={() => setShowBookingForm(false)}
                      sx={{ 
                        color: '#F29F05',
                        minWidth: 'auto',
                        p: 1,
                        '&:hover': { background: 'rgba(242, 159, 5, 0.1)' }
                      }}
                    >
                      ✕
                    </Button>
                  </Box>

                  {/* Erfolgs- und Fehlermeldungen */}
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Formular */}
                  <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <User size={20} style={{ color: '#F29F05' }} />
                      <TextField 
                        label="Name" 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                        fullWidth 
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            },
                            '&.Mui-focused': {
                              borderColor: '#F29F05'
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F29F05',
                            fontWeight: 500
                          }
                        }} 
                      />
                    </Box>
                    
                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Mail size={20} style={{ color: '#F29F05' }} />
                      <TextField 
                        label="E-Mail" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                        fullWidth 
                        type="email"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F29F05',
                            fontWeight: 500
                          }
                        }} 
                      />
                    </Box>
                    
                    {/* Telefon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Phone size={20} style={{ color: '#F29F05' }} />
                      <TextField 
                        label="Telefon" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange} 
                        required 
                        fullWidth 
                        type="tel"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F29F05',
                            fontWeight: 500
                          }
                        }} 
                      />
                    </Box>
                    
                    {/* Session-Typ */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <BookOpen size={20} style={{ color: '#F29F05' }} />
                      <TextField
                        select
                        name="sessionType"
                        value={form.sessionType}
                        onChange={handleChange}
                        required
                        fullWidth
                        label="Session-Typ"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F29F05',
                            fontWeight: 500
                          }
                        }}
                      >
                        {sessionTypes.map(type => (
                          <MenuItem key={type} value={type} sx={{ color: '#4b2e83' }}>{type}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    
                    {/* Datum und Uhrzeit in einer Reihe */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Calendar size={20} style={{ color: '#F29F05' }} />
                        <TextField 
                          label="Datum" 
                          name="date" 
                          value={form.date} 
                          onChange={handleChange} 
                          required 
                          fullWidth 
                          type="date"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.1)',
                              borderColor: 'rgba(242, 159, 5, 0.3)',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.15)',
                                borderColor: 'rgba(242, 159, 5, 0.5)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: 'rgba(255, 255, 255, 0.9)',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#F29F05',
                              fontWeight: 500
                            }
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Clock size={20} style={{ color: '#F29F05' }} />
                        <TextField
                          select
                          name="time"
                          value={form.time}
                          onChange={handleChange}
                          required
                          fullWidth
                          label="Uhrzeit"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.1)',
                              borderColor: 'rgba(242, 159, 5, 0.3)',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.15)',
                                borderColor: 'rgba(242, 159, 5, 0.5)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: 'rgba(255, 255, 255, 0.9)',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#F29F05',
                              fontWeight: 500
                            }
                          }}
                        >
                          {timeSlots.map(time => (
                            <MenuItem key={time} value={time} sx={{ color: '#4b2e83' }}>{time}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Box>
                    
                    {/* Nachricht */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <MessageSquare size={20} style={{ color: '#F29F05', marginTop: '8px' }} />
                      <TextField 
                        label="Nachricht (optional)" 
                        name="message" 
                        value={form.message} 
                        onChange={handleChange} 
                        fullWidth 
                        multiline 
                        minRows={3}
                        placeholder="Erzähle mir von deinem Anliegen oder deinen Fragen..."
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255,255,255,0.1)',
                            borderColor: 'rgba(242, 159, 5, 0.3)',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.15)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          },
                          '& .MuiInputLabel-root': {
                            color: '#F29F05',
                            fontWeight: 500
                          }
                        }} 
                      />
                    </Box>
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth
                      sx={{ 
                        mt: 2, 
                        borderRadius: 2, 
                        background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 16, 
                        py: 1.5,
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                          boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                        },
                        '&:disabled': { 
                          opacity: 0.7,
                          background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)'
                        } 
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} sx={{ color: '#fff' }} />
                          Wird gesendet...
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Send size={18} />
                          Anfrage absenden
                        </Box>
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </Box>
    </>
  );
}

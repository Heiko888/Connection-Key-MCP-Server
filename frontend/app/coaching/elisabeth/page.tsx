"use client";
import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Avatar, Button, Chip, TextField, MenuItem, Alert, CircularProgress } from "@mui/material";
// import AppHeader from "../../../components/AppHeader";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Heart, Sparkles, ArrowLeft, Moon, BookOpen, User, Mail, Phone, Calendar, Clock, MessageSquare, Send, LogOut } from "lucide-react";
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

export default function ElisabethProfilePage() {
  const router = useRouter();
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

  const sessionTypes = [
    "1:1 Coaching",
    "Human Design Reading", 
    "Mondritual",
    "Persönlichkeitsentwicklung"
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
        body: JSON.stringify({ ...form, coach: "Elisabeth Täubel" })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess("Session-Anfrage erfolgreich versendet! Elisabeth meldet sich bald bei dir. ✨");
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
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #533483 50%, #8B5CF6 75%, #A855F7 100%)',
        py: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
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

        <AnimatedStars />
        <AnimatedMoon />
        
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, position: 'relative', zIndex: 1 }}>
          {/* Zurück-Button */}
          <motion.div
            
            
            
          >
            <Button
              component={Link}
              href="/coaching"
              variant="outlined"
              startIcon={<ArrowLeft size={20} />}
              sx={{ 
                color: '#fff', 
                borderColor: 'rgba(255,255,255,0.3)', 
                fontWeight: 600, 
                borderRadius: 3,
                px: 3,
                py: 1.5,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                mb: 4,
                '&:hover': {
                  borderColor: '#667eea',
                  background: 'rgba(102, 126, 234, 0.1)',
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
            
            
            
          >
            <Card sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              borderRadius: 8, 
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden'
            }}>
              {/* Header mit Avatar */}
              <Box sx={{ 
                background: 'radial-gradient(circle, #fff 0%, #f0f8ff 30%, #e6f3ff 60%, #cce7ff 100%)',
                p: 4,
                textAlign: 'center',
                position: 'relative',
                boxShadow: `
                  0 0 20px rgba(255, 255, 255, 0.8),
                  0 0 40px rgba(255, 255, 255, 0.6),
                  0 0 60px rgba(255, 255, 255, 0.4),
                  0 0 80px rgba(255, 255, 255, 0.2),
                  inset 0 0 20px rgba(255, 255, 255, 0.3)
                `
              }}>
                <motion.div
                  
                  
                  
                >
                  <Avatar 
                    src="/images/elisabeth.jpg" 
                    sx={{ 
                      width: 140, 
                      height: 140, 
                      mx: 'auto', 
                      mb: 3, 
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)', 
                      border: '4px solid #fff',
                      position: 'relative'
                    }} 
                  />
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <Sparkles size={24} style={{ color: '#667eea' }} />
                  </Box>
                </motion.div>
                
                <motion.div
                  
                  
                  
                >
                  <Typography variant="h4" sx={{ 
                    color: '#4b2e83', 
                    fontWeight: 800, 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(255,255,255,0.8)'
                  }}>
                    Elisabeth Täubel
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#667eea', 
                    fontWeight: 500,
                    mb: 2
                  }}>
                    Human Design Coach & Mondritual-Begleiterin
                  </Typography>
                  
                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<Star size={16} />} 
                      label="Manifestierender Generator" 
                      sx={{ 
                        background: 'rgba(102, 126, 234, 0.2)', 
                        color: '#667eea', 
                        fontWeight: 600,
                        border: '1px solid rgba(102, 126, 234, 0.3)'
                      }} 
                    />
                    <Chip 
                      icon={<MapPin size={16} />} 
                      label="Wien, Österreich" 
                      sx={{ 
                        background: 'rgba(75, 46, 131, 0.2)', 
                        color: '#4b2e83', 
                        fontWeight: 600,
                        border: '1px solid rgba(75, 46, 131, 0.3)'
                      }} 
                    />
                    <Chip 
                      icon={<Moon size={16} />} 
                      label="Mondrituale" 
                      sx={{ 
                        background: 'rgba(75, 46, 131, 0.2)', 
                        color: '#4b2e83', 
                        fontWeight: 600,
                        border: '1px solid rgba(75, 46, 131, 0.3)'
                      }} 
                    />
                  </Box>
                </motion.div>
              </Box>

              {/* Content */}
              <CardContent sx={{ p: 4 }}>
                <motion.div
                  
                  
                  
                >
                  <Typography variant="h6" sx={{ 
                    color: '#4b2e83', 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Meine Geschichte
                  </Typography>
                  
                  <Box sx={{ 
                    color: '#4b2e83', 
                    mb: 4, 
                    textAlign: 'left', 
                    fontSize: '1.08rem', 
                    lineHeight: 2, 
                    p: 3, 
                    background: 'rgba(255,255,255,0.7)', 
                    borderRadius: 3, 
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
                    border: '1px solid rgba(255, 215, 0, 0.1)'
                  }}>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      <strong>Ich bin Elisabeth.</strong><br />
                      Ich begleite dich mit Human Design Readings in deine ureigene Energie – und halte dir Raum in Mondritualen, damit du wieder fühlen kannst, wer du wirklich bist.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      Mein Weg ist leise. Mein Wirken ist klar.<br />
                      Ich glaube nicht an Optimierung – sondern an Erinnerung.<br />
                      Du musst nicht mehr tun.<br />
                      Du darfst dich erinnern, wie du bist.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      <strong>Es fing leise an.</strong><br />
                      Kein großes spirituelles Erwachen – eher ein Gefühl, dass ihr Alltag nicht mehr zu ihr passte. Immer funktionieren, immer gleich sein. Und dabei immer mehr das Gefühl: Das bin ich nicht.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      <strong>Der Mond kam zuerst.</strong><br />
                      Nicht geplant, sondern beiläufig – als sie merkte, wie sehr sich ihre Energie im Zyklus verändert. Vollmond brachte Unruhe, Neumond Stille. Sie begann zu beobachten, nicht zu bewerten. Mit der Zeit verstand sie: Ihr Körper folgt einem Rhythmus, nicht einem Kalender.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                      <strong>Human Design kam später.</strong><br />
                      Über eine Freundin. Als sie erfuhr, dass sie MG ist, mit sakraler Autorität und einem 6/2-Profil, war vieles plötzlich klar: Warum sie sich oft eingeengt fühlte. Warum sie Dinge beendete, obwohl sie „funktionierten". Warum sie keine Rollen spielen kann – sondern einfach nur echt sein muss.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <strong>Heute arbeitet sie genau so:</strong><br />
                      Still. Klar. Ohne Show. Sie liest keine Charts vor – sie öffnet Räume. Sie verkauft keine Rituale – sie teilt Rhythmen. Mit dem Mond. Mit Bewegung. Und mit einer Präsenz, die nichts braucht – außer Wahrheit.
                    </Typography>
                  </Box>

                  {/* Spezialisierungen */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#4b2e83', 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      Meine Spezialisierungen
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['Human Design Readings', 'Mondrituale', 'Persönlichkeitsentwicklung', 'Energetische Transformation', 'Spiritualität'].map((spec, index) => (
                        <Chip 
                          key={spec}
                          label={spec} 
                          sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff', 
                            fontWeight: 600,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            },
                            transition: 'all 0.3s ease'
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* CTA Button */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => setShowBookingForm(true)}
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff', 
                        fontWeight: 700, 
                        borderRadius: 3,
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Session mit Elisabeth buchen
                    </Button>
                  </Box>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Buchungsformular Modal */}
          {showBookingForm && (
            <motion.div
              
              
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
                
                
                
                style={{ maxWidth: 600, width: '100%' }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.98)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4, 
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h4" sx={{ 
                        color: '#4b2e83', 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <BookOpen size={28} style={{ color: '#667eea' }} />
                        Session buchen
                      </Typography>
                      <Button
                        onClick={() => setShowBookingForm(false)}
                        sx={{ 
                          color: '#667eea',
                          minWidth: 'auto',
                          p: 1,
                          '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
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
                        <User size={20} style={{ color: '#667eea' }} />
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
                              background: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                              },
                              '&.Mui-focused': {
                                borderColor: '#667eea'
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: '#4b2e83',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
                              fontWeight: 500
                            }
                          }} 
                        />
                      </Box>
                      
                      {/* Email */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Mail size={20} style={{ color: '#667eea' }} />
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
                              background: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: '#4b2e83',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
                              fontWeight: 500
                            }
                          }} 
                        />
                      </Box>
                      
                      {/* Telefon */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Phone size={20} style={{ color: '#667eea' }} />
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
                              background: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: '#4b2e83',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
                              fontWeight: 500
                            }
                          }} 
                        />
                      </Box>
                      
                      {/* Session-Typ */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BookOpen size={20} style={{ color: '#667eea' }} />
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
                              background: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: '#4b2e83',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
                              fontWeight: 500
                            }
                          }}
                        >
                          {sessionTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                      
                      {/* Datum und Uhrzeit in einer Reihe */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Calendar size={20} style={{ color: '#667eea' }} />
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
                                background: 'rgba(255,255,255,0.9)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,1)',
                                }
                              },
                              '& .MuiInputBase-input': {
                                color: '#4b2e83',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#667eea',
                                fontWeight: 500
                              }
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Clock size={20} style={{ color: '#667eea' }} />
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
                                background: 'rgba(255,255,255,0.9)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,1)',
                                }
                              },
                              '& .MuiInputBase-input': {
                                color: '#4b2e83',
                              },
                              '& .MuiInputLabel-root': {
                                color: '#667eea',
                                fontWeight: 500
                              }
                            }}
                          >
                            {timeSlots.map(time => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                      
                      {/* Nachricht */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <MessageSquare size={20} style={{ color: '#667eea', marginTop: '8px' }} />
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
                              background: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                background: 'rgba(255,255,255,1)',
                              }
                            },
                            '& .MuiInputBase-input': {
                              color: '#4b2e83',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#667eea',
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
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                          color: '#fff', 
                          fontWeight: 700, 
                          fontSize: 16, 
                          py: 1.5,
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          },
                          '&:disabled': { 
                            opacity: 0.7,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
      </Box>
    </>
  );
}

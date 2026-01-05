"use client";

import React, { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { Box, Typography, Card, CardContent, Button, Chip } from "@mui/material";
import { Sparkles, Users, User, Calendar, Clock, Star } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

// Animierte Sterne Komponente
const AnimatedStars = () => {
  // Pre-definierte Positionen für konsistente Hydration
  const starPositions = [
    { left: '10%', top: '15%' }, { left: '85%', top: '25%' }, { left: '45%', top: '35%' },
    { left: '75%', top: '45%' }, { left: '20%', top: '55%' }, { left: '90%', top: '65%' },
    { left: '30%', top: '75%' }, { left: '60%', top: '85%' }, { left: '15%', top: '95%' },
    { left: '80%', top: '5%' }, { left: '50%', top: '15%' }, { left: '25%', top: '25%' },
    { left: '70%', top: '35%' }, { left: '40%', top: '45%' }, { left: '95%', top: '55%' },
    { left: '35%', top: '65%' }, { left: '65%', top: '75%' }, { left: '10%', top: '85%' },
    { left: '55%', top: '95%' }, { left: '20%', top: '5%' }
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

interface CoachingSession {
  coachBio?: string;
  coachSocial?: string;
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  type: "individual" | "group" | "workshop";
  coachName?: string;
  coachImage?: string;
  coachFocus?: string;
}

const coachingSessions: CoachingSession[] = [
  {
    id: "heiko-schwaninger",
    title: "Business & Leadership Coaching",
    description:
      "Professionelles Coaching für Führungskräfte und Unternehmer. Human Design als Werkzeug für authentische Führung und erfolgreiche Teams.",
    duration: "90 Minuten",
    price: "200€",
    type: "individual",
    coachName: "Heiko",
    coachImage: "/coaches/heiko.jpg",
    coachFocus: "Business Coaching, Leadership, Teamführung, Strategie",
    coachBio: "Heiko unterstützt Führungskräfte dabei, ihre natürlichen Talente zu entfalten.",
    coachSocial: "instagram.com/heiko.coaching",
  },
  {
    id: "janine-christ",
    title: "Beziehungen & Partnerschaft",
    description:
      "Tiefgreifendes Coaching für Beziehungen und Partnerschaften. Verstehe die energetische Dynamik zwischen dir und deinem Partner.",
    duration: "120 Minuten",
    price: "180€",
    type: "individual",
    coachName: "Janine",
    coachImage: "/coaches/janine.jpg",
    coachFocus: "Beziehungen, Partnerschaft, Composite-Charts, Kommunikation",
    coachBio: "Janine bringt Herz und Verstand in die Beziehungsanalyse.",
    coachSocial: "instagram.com/janine.herz",
  },
  {
    id: "elisabeth-taeubel",
    title: "Spiritualität & Bewusstsein",
    description:
      "Spirituelles Coaching für Bewusstseinsentwicklung und inneres Wachstum. Entdecke deine spirituelle Blaupause.",
    duration: "90 Minuten",
    price: "170€",
    type: "individual",
    coachName: "Elisabeth",
    coachImage: "/coaches/elisabeth.jpg",
    coachFocus: "Spiritualität, Bewusstsein, Meditation, Intuition",
    coachBio: "Elisabeth begleitet dich auf deinem spirituellen Weg.",
    coachSocial: "instagram.com/elisabeth.spirit",
  },
  {
    id: "group-workshop",
    title: "Human Design Workshop",
    description:
      "Gruppenworkshop für Einsteiger - Lerne die Grundlagen in einer unterstützenden Gemeinschaft.",
    duration: "3 Stunden",
    price: "80€",
    type: "group",
    coachName: "Team",
    coachImage: "/coaches/team.jpg",
    coachFocus: "Gruppenarbeit, Basics, Austausch",
    coachBio: "Das Team Lichtkraft fördert Austausch und Gruppenlernen.",
    coachSocial: "instagram.com/team.lichtkraft",
  },
  {
    id: "advanced-workshop",
    title: "Fortgeschrittenen Workshop",
    description:
      "Vertiefung für erfahrene Human Design Anwender - Komplexe Konzepte und praktische Anwendung.",
    duration: "4 Stunden",
    price: "120€",
    type: "workshop",
    coachName: "Mara & Jonas",
    coachImage: "/coaches/workshop.jpg",
    coachFocus: "Fortgeschrittene Themen, Praxis, Q&A",
    coachBio: "Mara und Jonas führen dich durch fortgeschrittene Human Design Themen.",
    coachSocial: "instagram.com/hd.workshop",
  },
];

const coachReviews: Record<string, Array<{ name: string; rating: number; text: string }>> = {
  "heiko-schwaninger": [
    { name: "Michael", rating: 5, text: "Hervorragendes Business Coaching!" },
    { name: "Sarah", rating: 5, text: "Hat mir geholfen, authentisch zu führen." },
  ],
  "janine-christ": [
    { name: "Lisa", rating: 5, text: "Hat unsere Beziehung auf ein neues Level gebracht." },
    { name: "Markus", rating: 4, text: "Sehr hilfreich für die Partnerschaft." },
  ],
  "elisabeth-taeubel": [
    { name: "Petra", rating: 5, text: "Wundervolle spirituelle Begleitung." },
  ],
};

const CoachingContent: React.FC = () => {
  const [selectedType, setSelectedType] = useState<"all" | "individual" | "group" | "workshop">("all");

  const filteredSessions =
    selectedType === "all" ? coachingSessions : coachingSessions.filter((s) => s.type === selectedType);

  return (
    <>
      <AnimatedStars />
      
      <motion.div
        
        
        
        style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 20px' }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            color: '#fff', 
            mb: 2, 
            fontWeight: 800, 
            textAlign: 'center', 
            letterSpacing: 1,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          ✨ Human Design Coaching
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            mb: 6, 
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Entdecke dein volles Potenzial durch personalisierte Human Design Coaching-Sessions. 
          Lerne deine energetische Blaupause zu verstehen und authentisch zu leben.
        </Typography>

        {/* FAQ */}
        <Card sx={{
          maxWidth: 900,
          mx: 'auto',
          mb: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '2px solid rgba(255,255,255,0.2)',
          p: 3
        }}>
          <Typography variant="h4" sx={{ color: '#4a5568', fontWeight: 700, mb: 3, textAlign: 'center' }}>
            💡 FAQ – Coachingbereich
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#4a5568', mb: 1 }}>
                Wie buche ich eine Coaching-Session?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Über den Button &ldquo;Session anfragen&rdquo; kannst du direkt Kontakt aufnehmen und einen Termin vereinbaren.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#4a5568', mb: 1 }}>
                Kann ich ein kostenloses Erstgespräch bekommen?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
          Viele Coaches bieten ein unverbindliches Kennenlernen an – einfach anfragen!
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#4a5568', mb: 1 }}>
                Wie läuft eine Session ab?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
          Die Sessions sind individuell und werden auf deine Bedürfnisse abgestimmt. Du erhältst vorab alle Infos per Mail.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#4a5568', mb: 1 }}>
                Kann ich auch Gruppencoachings buchen?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
          Ja, es gibt Gruppen- und Workshop-Angebote. Schau einfach in die Übersicht oder frage direkt an.
              </Typography>
            </Box>
          </Box>
        </Card>

      {/* Filter */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{
            display: 'flex',
            gap: 1,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            p: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
          {(["all", "individual", "group", "workshop"] as const).map((t) => (
            <Button
              key={t}
              variant={selectedType === t ? "contained" : "text"}
              onClick={() => setSelectedType(t)}
              sx={{
                  color: selectedType === t ? '#4a5568' : '#fff',
                  background: selectedType === t ? '#fff' : 'transparent',
                fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    background: selectedType === t ? '#f5f5f5' : 'rgba(255,255,255,0.1)',
                  }
              }}
            >
              {t === "all" ? "Alle" : t === "individual" ? "Einzelsitzungen" : t === "group" ? "Gruppensitzungen" : "Workshops"}
            </Button>
          ))}
          </Box>
        </Box>

      {/* Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(320px, 1fr))' },
          gap: 2.5,
          mb: 6
        }}>
        {filteredSessions.map((session, idx) => (
          <motion.div
            key={session.id}
            
            
              
            whileHover={{
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }}
            >
              <Card sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2.5,
                boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                overflow: 'visible',
                position: 'relative'
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  {/* Coach Image */}
                  {session.coachImage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Box sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #f59e0b',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)'
                      }}>
                        <Image
                          src={session.coachImage}
                          alt={session.coachName || 'Coach'}
                          width={300}
                          height={200}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Coach Name & Title */}
                  <Typography variant="h6" sx={{ 
                    color: '#4a5568', 
                    fontWeight: 800, 
                    textAlign: 'center', 
                    mb: 1 
                  }}>
                    {session.coachName}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: '#f59e0b', 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    mb: 2 
                  }}>
                    {session.title}
                  </Typography>

                  {/* Type Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      icon={session.type === 'individual' ? <User size={16} /> : session.type === 'group' ? <Users size={16} /> : <Calendar size={16} />}
                      label={session.type === 'individual' ? 'Einzelsitzung' : session.type === 'group' ? 'Gruppensitzung' : 'Workshop'}
                      sx={{
                        background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body1" sx={{ 
                    color: '#666', 
                    mb: 3, 
                    textAlign: 'center',
                    lineHeight: 1.6
                  }}>
                    {session.description}
                  </Typography>

                  {/* Focus Areas */}
                  {session.coachFocus && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#4a5568', 
                        mb: 1 
                      }}>
                        Schwerpunkte:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {session.coachFocus}
                      </Typography>
                    </Box>
                  )}

                  {/* Duration & Price */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} style={{ color: '#f59e0b' }} />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {session.duration}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 700, 
                      color: '#f59e0b' 
                    }}>
                      {session.price}
                    </Typography>
                  </Box>

                  {/* Reviews */}
                  {coachReviews[session.id]?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: '#4a5568', 
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Star size={16} style={{ color: '#f59e0b' }} />
                        Bewertungen
                      </Typography>
                      {coachReviews[session.id].map((review, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4a5568' }}>
                              {review.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {Array.from({ length: review.rating }).map((_, idx) => (
                                <Star key={idx} size={12} style={{ color: '#f59e0b' }} />
                              ))}
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                            {review.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Social Media */}
                  {session.coachSocial && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <a 
                        href={`https://${session.coachSocial}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#e91e63', fontSize: '1.5rem' }}
                      >
                        <FaInstagram />
                      </a>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Profile Link for specific coaches */}
                         {["Heiko", "Janine", "Elisabeth"].includes(
              session.coachName || ""
            ) && (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{
                          borderColor: '#f59e0b',
                          color: '#f59e0b',
                          fontWeight: 600,
                          borderRadius: 1.5,
                          fontSize: '0.875rem',
                          py: 0.75,
                          '&:hover': {
                            borderColor: '#d97706',
                            background: 'rgba(245, 158, 11, 0.1)'
                          }
                        }}
                        component={Link}
                href={
                  session.coachName === "Heiko"
                    ? "/coaching/heiko"
                                         : session.coachName === "Janine"
                    ? "/coaching/janine"
                                         : "/coaching/elisabeth"
                }
                      >
                        Profil ansehen
                      </Button>
                    )}
                    
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{
                        background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
                        color: '#fff',
                      fontWeight: 700,
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                        py: 0.75,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #d97706, #f59e0b)',
                        }
                      }}
                      component={Link}
                      href={`/coaching/${session.coachName?.toLowerCase() || 'heiko'}`}
                >
                  Session anfragen
                    </Button>
                  </Box>
                </CardContent>
              </Card>
          </motion.div>
        ))}
        </Box>

      {/* Info-Section */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' },
          gap: 3,
          mb: 4
        }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            p: 3
          }}>
            <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={24} style={{ color: '#f59e0b' }} />
              Was ist Human Design Coaching?
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              Human Design Coaching hilft dir dabei, deine einzigartige energetische Blaupause zu verstehen und authentisch zu leben.
            </Typography>
            <Box component="ul" sx={{ color: '#666', pl: 2, m: 0 }}>
              <li>✨ Entdecke deine natürlichen Talente und Gaben</li>
              <li>🎯 Lerne deine Strategie und Autorität kennen</li>
              <li>🔄 Verstehe deine Konditionierungen und löse sie auf</li>
              <li>💝 Verbessere deine Beziehungen durch energetisches Verständnis</li>
            </Box>
        </Card>

          <Card sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            p: 3
          }}>
            <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star size={24} style={{ color: '#f59e0b' }} />
              Warum Human Design?
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              Human Design kombiniert vier alte Weisheitssysteme zu einem revolutionären System der Selbsterkenntnis.
            </Typography>
            <Box component="ul" sx={{ color: '#666', pl: 2, m: 0 }}>
              <li>🔮 Astrologie – Planetare Einflüsse</li>
              <li>🕯️ Kabbalah – Lebensbaumstruktur</li>
              <li>☯️ I Ging – 64 Hexagramme</li>
              <li>🧘 Chakrenlehre – Energiezentren</li>
            </Box>
        </Card>
        </Box>
      </motion.div>
    </>
  );
};

export default CoachingContent;

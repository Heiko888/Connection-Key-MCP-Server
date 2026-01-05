"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Typography, Card, CardContent, Box, Button, Paper, Chip, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, LinearProgress, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Star, BookOpen, BarChart3, Target, Plus, Calendar, TrendingUp, CheckCircle, Filter, Home, Briefcase, Heart, Users, User } from 'lucide-react';
import AccessControl from '@/components/AccessControl';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageLayout from '../components/PageLayout';


function JournalContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '', category: 'privat' });
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('alle');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [showDailyReminder, setShowDailyReminder] = useState(false);
  
  // Human Design spezifische Felder
  const [strategyFollowed, setStrategyFollowed] = useState<boolean | null>(null);
  const [authorityUsed, setAuthorityUsed] = useState<boolean | null>(null);
  const [signatureFeeling, setSignatureFeeling] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Journaling-Prompts basierend auf Human Design
  const journalPrompts = [
    {
      id: 'strategy',
      title: 'Strategie-Tracking',
      question: 'Habe ich heute meine Human Design Strategie gelebt?',
      description: 'Generator: Habe ich auf Antworten gewartet? | Projektor: Habe ich auf Einladungen gewartet? | Manifestor: Habe ich informiert?'
    },
    {
      id: 'authority',
      title: 'Autorität nutzen',
      question: 'Habe ich meine innere Autorität für Entscheidungen genutzt?',
      description: 'Sakral: Habe ich auf meine Körperantwort gehört? | Emotional: Habe ich gewartet, bis die Emotionen klar waren?'
    },
    {
      id: 'signature',
      title: 'Signatur vs. Nicht-Selbst',
      question: 'Wie habe ich mich heute gefühlt?',
      description: 'Signatur (Zufriedenheit/Frieden/Erfolg) oder Nicht-Selbst (Frustration/Wut/Bitterkeit)?'
    },
    {
      id: 'energy',
      title: 'Energie-Tracking',
      question: 'Wie war meine Energie heute?',
      description: '1-10 Skala: Wie voll war mein energetisches Tank?'
    },
    {
      id: 'reflection',
      title: 'Tägliche Reflexion',
      question: 'Was habe ich heute über mich gelernt?',
      description: 'Welche Erkenntnisse hatte ich über meine Human Design Mechanik?'
    }
  ];
  
  const journalTemplates = [
    {
      id: 'morning',
      title: 'Morgen-Routine',
      content: 'Heute morgen fühle ich mich...\n\nMeine Energie ist...\n\nIch plane heute...\n\nMeine Strategie für heute:'
    },
    {
      id: 'evening',
      title: 'Abend-Reflexion',
      content: 'Heute habe ich meine Strategie gelebt: [Ja/Nein]\n\nMeine Autorität hat mir geholfen bei: [Entscheidung]\n\nIch fühle mich: [Signatur/Nicht-Selbst]\n\nWas ich heute gelernt habe:\n\nWas morgen anders machen möchte:'
    },
    {
      id: 'decision',
      title: 'Entscheidungs-Tracking',
      content: 'Entscheidung: [Was?]\n\nWie habe ich entschieden? [Autorität nutzen?]\n\nErgebnis: [Wie fühlt es sich an?]\n\nWas ich daraus lerne:'
    },
    {
      id: 'relationship',
      title: 'Beziehungs-Reflexion',
      content: 'Mit wem war ich heute in Resonanz?\n\nWie hat sich die Energie angefühlt?\n\nWas habe ich über unsere Connection gelernt?\n\nNächste Schritte:'
    }
  ];
  const [journalEntries, setJournalEntries] = useState<Array<{
    id: number;
    date: string;
    content: string;
    mood: string;
    tags: string[];
    title?: string;
    strategyFollowed?: boolean | null;
    authorityUsed?: boolean | null;
    signatureFeeling?: string;
    energyLevel?: number;
  }>>([
    {
      id: 1,
      date: '2024-12-10',
      content: 'Heute habe ich mein Human Design Chart analysiert und bin erstaunt, wie genau es meine Persönlichkeit beschreibt. Als Manifesting Generator fühle ich mich endlich verstanden.',
      mood: 'Begeistert',
      tags: ['Chart-Analyse', 'Selbsterkenntnis'],
      strategyFollowed: true,
      authorityUsed: true,
      energyLevel: 8
    },
    {
      id: 2,
      date: '2024-12-09',
      content: 'Ich habe heute meine Strategie "Warten auf die Einladung" angewendet und es war erstaunlich, wie viel weniger Stress ich hatte. Die Menschen kamen von selbst auf mich zu.',
      mood: 'Zufrieden',
      tags: ['Strategie', 'Energie-Management'],
      strategyFollowed: true,
      authorityUsed: true,
      signatureFeeling: 'Zufriedenheit',
      energyLevel: 7
    },
    {
      id: 3,
      date: '2024-12-08',
      content: 'Meine emotionale Autorität hat mir heute geholfen, eine wichtige Entscheidung zu treffen. Ich habe gewartet, bis meine Emotionen sich beruhigt haben, und dann war die Antwort klar.',
      mood: 'Klar',
      tags: ['Autorität', 'Entscheidungen'],
      strategyFollowed: true,
      authorityUsed: true,
      signatureFeeling: 'Klarheit',
      energyLevel: 6
    },
    {
      id: 4,
      date: '2024-12-07',
      title: 'Mond-Tracking: Vollmond - 07.12.2024',
      content: 'Mondphase: Vollmond\nStimmung: 8/10\nEnergie: 7/10\n\nNotizen:\nHeute fühle ich mich besonders verbunden mit der kosmischen Energie. Der Vollmond hat mir geholfen, meine Manifesting Generator Energie zu nutzen.\n\nRituale:\nMeditation, Kristall aufladen, Intentionen setzen',
      mood: 'Begeistert',
      tags: ['Mond-Tracking', 'Vollmond'],
      strategyFollowed: true,
      authorityUsed: false,
      energyLevel: 9
    }
  ]);

  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Human Design Grundlagen lernen',
      description: 'Die vier Typen und ihre Strategien verstehen',
      deadline: '2024-12-31',
      progress: 75,
      completed: false,
      category: 'privat'
    },
    {
      id: 2,
      title: 'Tägliches Journaling etablieren',
      description: 'Jeden Tag 10 Minuten über meine Human Design Erfahrungen schreiben',
      deadline: '2024-12-20',
      progress: 60,
      completed: false,
      category: 'privat'
    },
    {
      id: 3,
      title: 'Chart-Analyse Workshop besuchen',
      description: 'Lernen, wie man Human Design Charts liest und interpretiert',
      deadline: '2025-01-15',
      progress: 0,
      completed: false,
      category: 'beruflich'
    },
    {
      id: 4,
      title: 'Mehr Sport treiben',
      description: '3x pro Woche ins Fitnessstudio gehen',
      deadline: '2025-02-01',
      progress: 30,
      completed: false,
      category: 'gesundheit'
    },
    {
      id: 5,
      title: 'Neue Freundschaften knüpfen',
      description: 'Mindestens 2 neue Menschen pro Monat kennenlernen',
      deadline: '2025-03-01',
      progress: 20,
      completed: false,
      category: 'freundschaften'
    },
    {
      id: 6,
      title: 'Beziehung vertiefen',
      description: 'Mehr Zeit mit meinem Partner verbringen und gemeinsame Aktivitäten planen',
      deadline: '2025-01-31',
      progress: 45,
      completed: false,
      category: 'beziehung'
    }
  ]);

  const [trackingData, setTrackingData] = useState({
    totalEntries: journalEntries.length,
    currentStreak: 3,
    longestStreak: 7,
    goalsCompleted: 0,
    totalGoals: goals.length
  });

  const goalCategories = [
    { id: 'alle', name: 'Alle Ziele', icon: Filter, color: '#FFD700' },
    { id: 'privat', name: 'Privat', icon: Home, color: '#10b981' },
    { id: 'beruflich', name: 'Beruflich', icon: Briefcase, color: '#3b82f6' },
    { id: 'gesundheit', name: 'Gesundheit', icon: Heart, color: '#ef4444' },
    { id: 'freundschaften', name: 'Freundschaften', icon: Users, color: '#8b5cf6' },
    { id: 'beziehung', name: 'Beziehung', icon: User, color: '#f59e0b' }
  ];

  const filteredGoals = selectedCategory === 'alle' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const addJournalEntry = () => {
    if (journalEntry.trim()) {
      const newEntry = {
        id: Date.now(),
        date: selectedDate,
        content: journalEntry,
        mood: signatureFeeling || 'Zufrieden',
        tags: [
          ...(strategyFollowed !== null ? [strategyFollowed ? 'Strategie gelebt' : 'Strategie nicht gelebt'] : []),
          ...(authorityUsed !== null ? [authorityUsed ? 'Autorität genutzt' : 'Autorität nicht genutzt'] : []),
          ...(signatureFeeling ? [signatureFeeling] : []),
          ...(energyLevel ? [`Energie: ${energyLevel}/10`] : [])
        ],
        // Human Design spezifische Daten
        strategyFollowed,
        authorityUsed,
        signatureFeeling,
        energyLevel
      };
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      
      // In localStorage speichern
      try {
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      } catch (error) {
        console.error('Fehler beim Speichern der Journal-Einträge:', error);
      }
      
      setJournalEntry('');
      setStrategyFollowed(null);
      setAuthorityUsed(null);
      setSignatureFeeling('');
      setEnergyLevel(5);
      setSelectedTemplate('');
      setShowJournalDialog(false);
      updateTrackingData();
    }
  };
  
  const applyTemplate = (templateId: string) => {
    const template = journalTemplates.find(t => t.id === templateId);
    if (template) {
      setJournalEntry(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal = {
        id: Date.now(),
        title: newGoal.title,
        description: newGoal.description,
        deadline: newGoal.deadline,
        progress: 0,
        completed: false,
        category: newGoal.category
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '', deadline: '', category: 'privat' });
      setShowGoalDialog(false);
      updateTrackingData();
    }
  };

  const updateGoalProgress = (goalId: number, progress: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress: Math.min(100, Math.max(0, progress)) }
        : goal
    ));
  };

  const completeGoal = (goalId: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: true, progress: 100 }
        : goal
    ));
    updateTrackingData();
  };

  const updateTrackingData = useCallback(() => {
    setTrackingData({
      totalEntries: (journalEntries || []).length,
      currentStreak: 3, // Simplified calculation
      longestStreak: 7,
      goalsCompleted: (goals || []).filter(g => g.completed).length,
      totalGoals: (goals || []).length
    });
  }, [journalEntries, goals]);

  // Lade Journal-Einträge aus localStorage beim Start
  useEffect(() => {
    (async () => {
      try {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          const { safeJsonParse } = await import('@/lib/utils/safeJson');
          const parsed = safeJsonParse<any[]>(savedEntries, null);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJournalEntries(parsed);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Journal-Einträge:', error);
      }
    })();
  }, []);

  // Prüfe, ob heute bereits ein Eintrag existiert
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasEntryToday = journalEntries.some(entry => entry.date === today);
    setShowDailyReminder(!hasEntryToday);
  }, [journalEntries]);

  // Authentifizierung und Subscription prüfen
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        // Authentication state - User nicht eingeloggt
        // Hier könnte ein Redirect zu /login implementiert werden
        // Keine Authentifizierung erforderlich - App ist öffentlich
        return;
      }
      // Hier könnten weitere Authentifizierungs-Checks implementiert werden
      
      // Daten laden
      updateTrackingData();
      loadUserSubscription();
    };

    checkAuth();
  }, [router, journalEntries, goals, updateTrackingData]);

  const loadUserSubscription = async () => {
    try {
      const { safeLocalStorageParse } = await import('@/lib/utils/safeJson');
      const user = safeLocalStorageParse<any>('userData', null);
      if (user) {
        // Subscription-Service wird später implementiert
        const subscription = null;
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Abonnements:', error);
    }
  };

  return (
    <AccessControl 
      path={pathname} 
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
      pt: { xs: 4, md: 6 },
      pb: 8,
    }}>
      {/* Floating Stars Animation */}
      {Array.from({ length: 30 }).map((_, i) => (
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
            zIndex: 1,
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
      
      <PageLayout activePage="journal" showLogo={true} maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" sx={{ 
              mb: 2,
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' }
            }}>
              Dein Bewusstseinsfeld
            </Typography>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  mb: 2, 
                  fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                  maxWidth: '700px', 
                  mx: 'auto', 
                  lineHeight: 1.6,
                  fontWeight: 500
                }}
              >
                Deine Human-Design-Reise beginnt hier.
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  mb: 3, 
                  fontSize: { xs: '0.95rem', md: '1.1rem' }, 
                  maxWidth: '700px', 
                  mx: 'auto', 
                  lineHeight: 1.7 
                }}
              >
                Dokumentiere deine Erkenntnisse, erkenne Muster in deiner Energie und beobachte, wie sich dein Leben durch bewusste Ausrichtung verändert.
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(242, 159, 5, 0.9)', 
                  fontStyle: 'italic',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Kleine tägliche Einträge. Große energetische Wirkung.
              </Typography>
            </motion.div>
            
            {/* Infotext für Storytelling */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box sx={{
                mt: 4,
                p: { xs: 3, md: 4 },
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                borderRadius: 3,
                maxWidth: '800px',
                mx: 'auto'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.85)', 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.7,
                    textAlign: 'center'
                  }}
                >
                  <Box component="span" sx={{ color: '#F29F05', fontWeight: 600 }}>
                    Mit jedem Eintrag stärkst du deinen Connection Key
                  </Box>
                  {' '}– deinen energetischen Fingerabdruck. Er zeigt dir, wie du in Resonanz mit dir selbst und anderen trittst. Dieses Journal ist dein Raum für Bewusstsein, Klarheit und Transformation.
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.4)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: '#F29F05', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.4))'
                  }}>
                    <BookOpen size={32} color="currentColor" />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                    {trackingData.totalEntries}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                    Journal Einträge
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Deine Energie sichtbar gemacht.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.4)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: '#F29F05', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.4))'
                  }}>
                    <TrendingUp size={32} color="currentColor" />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                    {trackingData.currentStreak}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                    Tage in Folge
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Resonanz entsteht durch Kontinuität.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.4)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: '#F29F05', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.4))'
                  }}>
                    <Target size={32} color="currentColor" />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                    {trackingData.goalsCompleted}/{trackingData.totalGoals}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                    Ziele erreicht
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Deine Manifestationen nehmen Form an.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'rgba(242, 159, 5, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.4)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: '#F29F05', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.4))'
                  }}>
                    <BarChart3 size={32} color="currentColor" />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                    {Math.round((trackingData.goalsCompleted / trackingData.totalGoals) * 100)}%
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                    Erfolgsrate
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Wachstum beginnt beim Bewusstsein.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ 
            mb: 6,
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 2
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 72,
                  '&.Mui-selected': {
                    color: '#F29F05',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#F29F05',
                      boxShadow: '0 0 10px rgba(242, 159, 5, 0.5)'
                    }
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#F29F05',
                  height: 2,
                  boxShadow: '0 0 10px rgba(242, 159, 5, 0.5)'
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BookOpen size={20} />
                      <Typography sx={{ fontWeight: 600 }}>Journal</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>
                      Erkenntnisse, Emotionen & Energie des Tages
                    </Typography>
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Target size={20} />
                      <Typography sx={{ fontWeight: 600 }}>Ziele</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>
                      Deine bewusst gesetzten Manifestationen
                    </Typography>
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChart3 size={20} />
                      <Typography sx={{ fontWeight: 600 }}>Tracking</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>
                      Verlauf deiner energetischen Entwicklung
                    </Typography>
                  </Box>
                }
              />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tägliche Erinnerung */}
        {showDailyReminder && activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{
              mb: 4,
              p: 3,
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography sx={{ 
                  color: '#F29F05', 
                  fontWeight: 600, 
                  mb: 0.5,
                  fontSize: '1.1rem'
                }}>
                  ✨ Heute noch nicht gejournalt
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  fontSize: '0.95rem',
                  lineHeight: 1.6
                }}>
                  Halte deine Energie des Tages fest und tracke, wie du deine Strategie und Autorität gelebt hast.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowJournalDialog(true);
                    setShowDailyReminder(false);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Jetzt eintragen
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowDailyReminder(false)}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.3)',
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      background: 'rgba(242, 159, 5, 0.05)'
                    }
                  }}
                >
                  Später
                </Button>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Journal Tab */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Meine Journal Einträge
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setShowJournalDialog(true)}
                sx={{ 
                  fontWeight: 600, 
                  px: 4, 
                  py: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Energie des Tages festhalten ✨
              </Button>
            </Box>
            
            <Grid container spacing={4}>
              {journalEntries.map((entry, index) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card sx={{ 
                      height: '100%',
                      background: 'rgba(26, 26, 26, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(242, 159, 5, 0.4)',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: '#F29F05' }}>
                              <Calendar size={22} color="currentColor" />
                            </Box>
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.95)', 
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {new Date(entry.date).toLocaleDateString('de-DE', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                          </Box>
                          <Chip
                            label={entry.mood}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(242, 159, 5, 0.3)',
                              color: '#F29F05',
                              background: 'rgba(242, 159, 5, 0.1)',
                              boxShadow: '0 0 10px rgba(242, 159, 5, 0.2)'
                            }}
                          />
                        </Box>

                        <Typography sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
                          {entry.content}
                        </Typography>

                        {/* Human Design Tracking Info */}
                        {(entry.strategyFollowed !== null || entry.authorityUsed !== null || entry.energyLevel) && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            background: 'rgba(242, 159, 5, 0.05)', 
                            borderRadius: 2,
                            border: '1px solid rgba(242, 159, 5, 0.15)'
                          }}>
                            <Typography sx={{ color: '#F29F05', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                              Human Design Tracking
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {entry.strategyFollowed !== null && (
                                <Chip
                                  label={entry.strategyFollowed ? '✓ Strategie gelebt' : '✗ Strategie nicht gelebt'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    background: entry.strategyFollowed 
                                      ? 'rgba(242, 159, 5, 0.2)' 
                                      : 'rgba(140, 29, 4, 0.2)',
                                    color: entry.strategyFollowed ? '#F29F05' : '#8C1D04',
                                    border: 'none'
                                  }}
                                />
                              )}
                              {entry.authorityUsed !== null && (
                                <Chip
                                  label={entry.authorityUsed ? '✓ Autorität genutzt' : '✗ Autorität nicht genutzt'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    background: entry.authorityUsed 
                                      ? 'rgba(242, 159, 5, 0.2)' 
                                      : 'rgba(140, 29, 4, 0.2)',
                                    color: entry.authorityUsed ? '#F29F05' : '#8C1D04',
                                    border: 'none'
                                  }}
                                />
                              )}
                              {entry.energyLevel && (
                                <Chip
                                  label={`⚡ Energie: ${entry.energyLevel}/10`}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    background: 'rgba(242, 159, 5, 0.15)',
                                    color: '#F29F05',
                                    border: 'none'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                          {entry.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.8rem',
                                borderColor: 'rgba(242, 159, 5, 0.3)',
                                color: '#F29F05',
                                background: 'rgba(242, 159, 5, 0.08)',
                                boxShadow: '0 0 8px rgba(242, 159, 5, 0.15)'
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Goals Tab */}
        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Meine Ziele
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setShowGoalDialog(true)}
                sx={{ 
                  fontWeight: 600, 
                  px: 4, 
                  py: 2, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Neues Ziel setzen ✨
              </Button>
            </Box>

            {/* Kategorien-Filter */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#fff' }}>
                Kategorien
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {goalCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Chip
                      key={category.id}
                      label={category.name}
                      icon={<IconComponent size={16} />}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                      sx={{ 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        ...(selectedCategory === category.id ? {
                          background: 'rgba(242, 159, 5, 0.2)',
                          borderColor: '#F29F05',
                          color: '#F29F05'
                        } : {
                          borderColor: 'rgba(242, 159, 5, 0.3)',
                          color: 'rgba(255,255,255,0.7)'
                        })
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
            
            <Grid container spacing={4}>
              {filteredGoals.map((goal, index) => (
                <Grid item xs={12} md={6} key={goal.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card sx={{
                      background: 'rgba(26, 26, 26, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'rgba(242, 159, 5, 0.4)',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{
                              fontWeight: 700,
                              mb: 1,
                              color: '#fff'
                            }}>
                              {goal.title}
                            </Typography>
                            <Chip
                              label={goalCategories.find(cat => cat.id === goal.category)?.name || goal.category}
                              size="small"
                              icon={(() => {
                                const category = goalCategories.find(cat => cat.id === goal.category);
                                const IconComponent = category?.icon || Filter;
                                return <IconComponent size={12} />;
                              })()}
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.7rem',
                                borderColor: 'rgba(242, 159, 5, 0.3)',
                                color: '#F29F05'
                              }}
                            />
                          </Box>
                          {goal.completed && (
                            <Box sx={{ color: '#F29F05' }}>
                              <CheckCircle size={24} color="currentColor" />
                            </Box>
                          )}
                        </Box>

                        <Typography sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                          {goal.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                              Fortschritt
                            </Typography>
                            <Typography sx={{ fontWeight: 600, color: '#F29F05' }}>
                              {goal.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={goal.progress}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'rgba(242, 159, 5, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#F29F05'
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                            Deadline: {new Date(goal.deadline).toLocaleDateString('de-DE')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                              sx={{ color: '#F29F05' }}
                            >
                              <TrendingUp size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => completeGoal(goal.id)}
                              sx={{ color: '#F29F05' }}
                            >
                              <CheckCircle size={16} />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Tracking Tab */}
        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              fontWeight: 700, 
              mb: 6,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Deine Entwicklung
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#fff' }}>
                      Journal Aktivität
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Aktuelle Serie
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#F29F05' }}>
                          {trackingData.currentStreak} Tage
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Längste Serie
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#F29F05' }}>
                          {trackingData.longestStreak} Tage
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#fff' }}>
                      Ziel-Fortschritt
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Abgeschlossen
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#F29F05' }}>
                          {trackingData.goalsCompleted}/{trackingData.totalGoals}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Erfolgsrate
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: '#F29F05' }}>
                          {Math.round((trackingData.goalsCompleted / trackingData.totalGoals) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Human Design Insights */}
              <Grid item xs={12}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#fff' }}>
                      Human Design Insights
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography sx={{ color: '#F29F05', fontSize: '2rem', fontWeight: 800, mb: 1 }}>
                            {journalEntries.filter(e => e.strategyFollowed === true).length}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                            Tage mit Strategie gelebt
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            {journalEntries.filter(e => e.strategyFollowed !== null).length > 0 
                              ? Math.round((journalEntries.filter(e => e.strategyFollowed === true).length / journalEntries.filter(e => e.strategyFollowed !== null).length) * 100)
                              : 0}% Erfolgsrate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography sx={{ color: '#F29F05', fontSize: '2rem', fontWeight: 800, mb: 1 }}>
                            {journalEntries.filter(e => e.authorityUsed === true).length}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                            Tage mit Autorität genutzt
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            {journalEntries.filter(e => e.authorityUsed !== null).length > 0 
                              ? Math.round((journalEntries.filter(e => e.authorityUsed === true).length / journalEntries.filter(e => e.authorityUsed !== null).length) * 100)
                              : 0}% Erfolgsrate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography sx={{ color: '#F29F05', fontSize: '2rem', fontWeight: 800, mb: 1 }}>
                            {journalEntries.filter(e => e.energyLevel).length > 0 
                              ? Math.round(journalEntries.filter(e => e.energyLevel).reduce((sum, e) => sum + (e.energyLevel || 0), 0) / journalEntries.filter(e => e.energyLevel).length * 10) / 10
                              : 0}/10
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                            Durchschnittliche Energie
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            Basierend auf {journalEntries.filter(e => e.energyLevel).length} Einträgen
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Muster-Erkennung */}
                    {journalEntries.length >= 3 && (
                      <Box sx={{ mt: 4, p: 3, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 2 }}>
                        <Typography sx={{ color: '#F29F05', fontWeight: 600, mb: 2 }}>
                          💡 Erkenntnisse
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
                          {journalEntries.filter(e => e.strategyFollowed === true).length > journalEntries.filter(e => e.strategyFollowed === false).length 
                            ? 'Du lebst deine Strategie häufiger als nicht – das ist ein starkes Zeichen für Alignment!'
                            : 'Du könntest öfter deine Strategie leben. Versuche, bewusster darauf zu achten.'}
                          {' '}
                          {journalEntries.filter(e => e.authorityUsed === true).length > journalEntries.filter(e => e.authorityUsed === false).length
                            ? 'Außerdem nutzt du deine Autorität regelmäßig – das führt zu authentischeren Entscheidungen.'
                            : 'Nutze deine Autorität öfter für wichtige Entscheidungen, um mehr in deiner Signatur zu leben.'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Journal Entry Dialog */}
        <Dialog 
          open={showJournalDialog} 
          onClose={() => setShowJournalDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)'
            }
          }}
        >
          <DialogTitle sx={{ color: '#fff', fontWeight: 700, borderBottom: '1px solid rgba(242, 159, 5, 0.2)' }}>
            Energie des Tages festhalten
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {/* Template-Auswahl */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1.5, fontWeight: 600 }}>
                Vorlage wählen (optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {journalTemplates.map((template) => (
                  <Chip
                    key={template.id}
                    label={template.title}
                    onClick={() => applyTemplate(template.id)}
                    sx={{
                      borderColor: selectedTemplate === template.id ? '#F29F05' : 'rgba(242, 159, 5, 0.3)',
                      color: selectedTemplate === template.id ? '#F29F05' : 'rgba(255,255,255,0.7)',
                      background: selectedTemplate === template.id ? 'rgba(242, 159, 5, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)'
                      }
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Datum"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-root': {
                      color: '#fff'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)'
                    }
                  }}
                />
              </Grid>

              {/* Human Design Tracking */}
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  background: 'rgba(242, 159, 5, 0.05)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                  mb: 2
                }}>
                  <Typography sx={{ color: '#F29F05', fontWeight: 600, mb: 2 }}>
                    Human Design Tracking
                  </Typography>
                  
                  {/* Strategie */}
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontSize: '0.9rem' }}>
                      Habe ich heute meine Strategie gelebt?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={strategyFollowed === true ? 'contained' : 'outlined'}
                        onClick={() => setStrategyFollowed(true)}
                        sx={{
                          flex: 1,
                          borderColor: 'rgba(242, 159, 5, 0.3)',
                          color: strategyFollowed === true ? '#fff' : '#F29F05',
                          background: strategyFollowed === true ? '#F29F05' : 'transparent',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)'
                          }
                        }}
                      >
                        ✓ Ja
                      </Button>
                      <Button
                        size="small"
                        variant={strategyFollowed === false ? 'contained' : 'outlined'}
                        onClick={() => setStrategyFollowed(false)}
                        sx={{
                          flex: 1,
                          borderColor: 'rgba(242, 159, 5, 0.3)',
                          color: strategyFollowed === false ? '#fff' : '#F29F05',
                          background: strategyFollowed === false ? '#F29F05' : 'transparent',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)'
                          }
                        }}
                      >
                        ✗ Nein
                      </Button>
                    </Box>
                  </Box>

                  {/* Autorität */}
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontSize: '0.9rem' }}>
                      Habe ich meine Autorität für Entscheidungen genutzt?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={authorityUsed === true ? 'contained' : 'outlined'}
                        onClick={() => setAuthorityUsed(true)}
                        sx={{
                          flex: 1,
                          borderColor: 'rgba(242, 159, 5, 0.3)',
                          color: authorityUsed === true ? '#fff' : '#F29F05',
                          background: authorityUsed === true ? '#F29F05' : 'transparent',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)'
                          }
                        }}
                      >
                        ✓ Ja
                      </Button>
                      <Button
                        size="small"
                        variant={authorityUsed === false ? 'contained' : 'outlined'}
                        onClick={() => setAuthorityUsed(false)}
                        sx={{
                          flex: 1,
                          borderColor: 'rgba(242, 159, 5, 0.3)',
                          color: authorityUsed === false ? '#fff' : '#F29F05',
                          background: authorityUsed === false ? '#F29F05' : 'transparent',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)'
                          }
                        }}
                      >
                        ✗ Nein
                      </Button>
                    </Box>
                  </Box>

                  {/* Signatur */}
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontSize: '0.9rem' }}>
                      Wie habe ich mich gefühlt? (Signatur/Nicht-Selbst)
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="z.B. Zufrieden, Frieden, Erfolg oder Frustration, Wut..."
                      value={signatureFeeling}
                      onChange={(e) => setSignatureFeeling(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': {
                          color: '#fff'
                        }
                      }}
                    />
                  </Box>

                  {/* Energie-Level */}
                  <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontSize: '0.9rem' }}>
                      Energie-Level heute: {energyLevel}/10
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Niedrig</Typography>
                      <Box sx={{ flex: 1 }}>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={energyLevel}
                          onChange={(e) => setEnergyLevel(Number(e.target.value))}
                          style={{
                            width: '100%',
                            accentColor: '#F29F05'
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Hoch</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Journal Text */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Deine Gedanken und Erfahrungen"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Schreibe über deine Human Design Erfahrungen, Erkenntnisse und Gefühle..."
                  sx={{
                    '& .MuiInputBase-root': {
                      color: '#fff'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(242, 159, 5, 0.2)' }}>
            <Button 
              onClick={() => {
                setShowJournalDialog(false);
                setStrategyFollowed(null);
                setAuthorityUsed(null);
                setSignatureFeeling('');
                setEnergyLevel(5);
                setSelectedTemplate('');
              }}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={addJournalEntry}
              variant="contained"
              sx={{ 
                fontWeight: 600, 
                px: 4,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                }
              }}
            >
              Eintrag speichern
            </Button>
          </DialogActions>
        </Dialog>

        {/* Goal Dialog */}
        <Dialog 
          open={showGoalDialog} 
          onClose={() => setShowGoalDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: '#1f2937', fontWeight: 700 }}>
            Neues Ziel
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ziel-Titel"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Beschreibung"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ color: '#1f2937', fontWeight: 600, mb: 1 }}>
                  Kategorie
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {goalCategories.filter(cat => cat.id !== 'alle').map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Chip
                        key={category.id}
                        label={category.name}
                        icon={<IconComponent size={14} />}
                        onClick={() => setNewGoal({...newGoal, category: category.id})}
                        sx={{
                          background: newGoal.category === category.id 
                            ? category.color 
                            : 'rgba(0,0,0,0.1)',
                          color: newGoal.category === category.id 
                            ? '#000' 
                            : '#1f2937',
                          border: `1px solid ${category.color}`,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: category.color,
                            color: '#000'
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setShowGoalDialog(false)}
              color="inherit"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={addGoal}
              variant="contained"
              sx={{ 
                fontWeight: 600, 
                px: 4,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                }
              }}
            >
              Ziel erstellen
            </Button>
          </DialogActions>
        </Dialog>
      </PageLayout>
    </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function JournalPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <JournalContent />
    </ProtectedRoute>
  );
}

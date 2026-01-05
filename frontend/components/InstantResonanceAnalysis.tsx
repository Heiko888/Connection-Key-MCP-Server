'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Mail,
  X,
  Star,
  Key,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PersonData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

interface AnalysisResult {
  resonanceScore: number; // 0-100
  harmony: {
    areas: string[];
    description: string;
  };
  dissonance: {
    areas: string[];
    description: string;
  };
  recommendations: string[];
  hdCompatibility: {
    type: string;
    profile: string;
    authority: string;
  };
  connectionKey: {
    gates: number[];
    channels: string[];
  };
}

const steps = ['Eingabe', 'Analyse', 'Ergebnis', 'Tiefere Ebenen'];

export default function InstantResonanceAnalysis() {
  const [activeStep, setActiveStep] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'single' | 'connection' | null>(null);
  const [person1, setPerson1] = useState<PersonData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });
  const [person2, setPerson2] = useState<PersonData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showReadingDialog, setShowReadingDialog] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Auth-Check für Step 2
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleModeSelect = (mode: 'single' | 'connection') => {
    setAnalysisMode(mode);
    setActiveStep(1);
  };
  
  const handleProceedToStep2 = () => {
    // Hole analysisId aus localStorage
    const analysisId = typeof window !== 'undefined' 
      ? localStorage.getItem('lastAnalysisId') 
      : null;

    if (isAuthenticated && analysisId) {
      // Weiterleitung zur geschützten Route mit analysisId
      router.push(`/resonanzanalyse/tiefere-ebenen?analysisId=${analysisId}`);
    } else if (isAuthenticated) {
      // Authentifiziert aber keine analysisId - zeige Step 3
      setActiveStep(3);
    } else {
      // Nicht authentifiziert - zeige Übergangsbildschirm
      setActiveStep(3);
    }
  };

  const handlePerson1Change = (field: keyof PersonData, value: string) => {
    setPerson1((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerson2Change = (field: keyof PersonData, value: string) => {
    setPerson2((prev) => ({ ...prev, [field]: value }));
  };

  const validatePersonData = (person: PersonData): boolean => {
    return !!(person.name && person.birthDate && person.birthPlace);
  };

  const startAnalysis = async () => {
    if (analysisMode === 'connection' && (!validatePersonData(person1) || !validatePersonData(person2))) {
      return;
    }
    if (analysisMode === 'single' && !validatePersonData(person1)) {
      return;
    }

    setActiveStep(2);
    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStatus('Energetische Verbindung wird berechnet...');

    try {
      // Schritt 1: Charts berechnen
      setAnalysisProgress(20);
      setAnalysisStatus('Frequenzen werden abgeglichen...');

      let chart1: any = null;
      let chart2: any = null;

      // Berechne Chart für Person 1
      const chart1Response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: person1.birthDate,
          birthTime: person1.birthTime || '12:00',
          birthPlace: typeof person1.birthPlace === 'string' ? {
            latitude: 52.52,
            longitude: 13.405,
            timezone: 'Europe/Berlin',
            name: person1.birthPlace
          } : person1.birthPlace
        })
      });

      if (!chart1Response.ok) {
        throw new Error('Fehler beim Berechnen des Charts für Person 1');
      }

      const chart1Data = await chart1Response.json();
      chart1 = chart1Data.chart;

      // Berechne Chart für Person 2 (nur bei Connection-Modus)
      if (analysisMode === 'connection') {
        setAnalysisProgress(40);
        setAnalysisStatus('Resonanzfelder werden ermittelt...');

        const chart2Response = await fetch('/api/charts/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate: person2.birthDate,
            birthTime: person2.birthTime || '12:00',
            birthPlace: typeof person2.birthPlace === 'string' ? {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person2.birthPlace
            } : person2.birthPlace
          })
        });

        if (!chart2Response.ok) {
          throw new Error('Fehler beim Berechnen des Charts für Person 2');
        }

        const chart2Data = await chart2Response.json();
        chart2 = chart2Data.chart;
      }

      // Schritt 2: Centers berechnen
      setAnalysisProgress(60);
      setAnalysisStatus('Human Design Kompatibilität wird analysiert...');

      const { calculateCenters } = await import('@/lib/human-design/centers');
      const person1Centers = calculateCenters(chart1.gates || chart1.activeGates || []);
      const person2Centers = analysisMode === 'connection' 
        ? calculateCenters(chart2.gates || chart2.activeGates || [])
        : person1Centers; // Bei Single-Modus verwenden wir Person 1 Centers als Referenz

      // Schritt 3: Connection Key Analyse
      setAnalysisProgress(80);
      setAnalysisStatus('Connection Key wird berechnet...');

      const { analyzeConnectionKey } = await import('@/lib/human-design/connection-key');
      
      const connectionKeyAnalysis = analysisMode === 'connection'
        ? analyzeConnectionKey(
            chart1.gates || chart1.activeGates || [],
            chart2.gates || chart2.activeGates || [],
            person1Centers,
            person2Centers,
            chart1.type,
            chart2.type,
            chart1.profile,
            chart2.profile,
            chart1.authority,
            chart2.authority,
            chart1.strategy,
            chart2.strategy
          )
        : null;

      // Schritt 4: Ergebnisse zusammenstellen
      setAnalysisProgress(100);
      setAnalysisStatus('Analyse abgeschlossen!');

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Berechne Resonanzwert basierend auf Connection Key Analyse
      let resonanceScore = 50; // Default
      let harmonyAreas: string[] = [];
      let dissonanceAreas: string[] = [];
      let recommendations: string[] = [];

      if (connectionKeyAnalysis) {
        // Resonanzwert basierend auf Connection Strength (0-100)
        resonanceScore = Math.round(connectionKeyAnalysis.summary.connectionStrength * 100);

        // Harmonie-Bereiche
        harmonyAreas = [
          ...connectionKeyAnalysis.goldenThreads.slice(0, 2).map(gt => gt.channel),
          ...connectionKeyAnalysis.centers
            .filter(c => c.type === 'resonance')
            .slice(0, 2)
            .map(c => c.centerName),
        ].filter(Boolean);

        if (connectionKeyAnalysis.summary.connectionStrength > 0.7) {
          harmonyAreas.push('Hohe energetische Resonanz');
        }

        // Dissonanz-Bereiche
        dissonanceAreas = [
          ...connectionKeyAnalysis.centers
            .filter(c => c.type === 'growth')
            .slice(0, 2)
            .map(c => c.centerName),
        ].filter(Boolean);

        if (connectionKeyAnalysis.typeConnection?.interaction === 'challenge') {
          dissonanceAreas.push('Typ-Dynamik');
        }

        // Empfehlungen generieren
        recommendations = [
          connectionKeyAnalysis.typeConnection?.description || 'Respektiere unterschiedliche Energietypen',
          connectionKeyAnalysis.profileInteraction?.description || 'Nutze die Profil-Dynamik für Wachstum',
          ...connectionKeyAnalysis.goldenThreads.slice(0, 2).map(gt => `Nutze die ${gt.channel} Resonanz`),
        ].filter(Boolean).slice(0, 4);
      } else {
        // Single-Modus: Basis-Empfehlungen
        harmonyAreas = ['Energetische Klarheit', 'Selbstbewusstsein'];
        dissonanceAreas = ['Wachstumspotenzial'];
        recommendations = [
          'Nutze deine definierten Zentren als Stärke',
          'Arbeite mit deinen offenen Zentren für Wachstum',
          'Folge deiner Strategie und Autorität',
        ];
      }

      const result: AnalysisResult = {
        resonanceScore: Math.max(40, Math.min(100, resonanceScore)), // Clamp zwischen 40-100
        harmony: {
          areas: harmonyAreas.length > 0 ? harmonyAreas : ['Energetische Kompatibilität'],
          description: connectionKeyAnalysis?.summary.energeticSummary || 
            'Deine energetische Signatur zeigt klare Muster und Potenziale.',
        },
        dissonance: {
          areas: dissonanceAreas.length > 0 ? dissonanceAreas : ['Wachstumsfelder'],
          description: connectionKeyAnalysis?.centers
            .filter(c => c.type === 'growth')
            .map(c => c.description)
            .join(' ') || 
            'Unterschiedliche Energien bieten Raum für Wachstum und Lernen.',
        },
        recommendations: recommendations.length > 0 ? recommendations : [
          'Nutze die Resonanz für tiefe Verbindung',
          'Respektiere energetische Unterschiede',
          'Schaffe Raum für individuelle Rhythmen',
        ],
        hdCompatibility: {
          type: analysisMode === 'connection' 
            ? `${chart1.type || 'Unknown'} + ${chart2.type || 'Unknown'}`
            : chart1.type || 'Unknown',
          profile: analysisMode === 'connection'
            ? `${chart1.profile || '1/3'} + ${chart2.profile || '1/3'}`
            : chart1.profile || '1/3',
          authority: analysisMode === 'connection'
            ? `${chart1.authority || 'Sakral'} + ${chart2.authority || 'Sakral'}`
            : chart1.authority || 'Sakral',
        },
        connectionKey: {
          gates: connectionKeyAnalysis?.connectionKeys.flatMap(ck => {
            const gates = ck.channel.split('-').map(Number);
            return gates;
          }).slice(0, 6) || chart1.gates?.slice(0, 6) || [],
          channels: connectionKeyAnalysis?.goldenThreads.map(gt => gt.channel).slice(0, 3) || [],
        },
      };

      setResult(result);
      
      // Speichere Analyse in Supabase und erhalte analysisId
      try {
        const saveResponse = await fetch('/api/resonanzanalyse/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person1,
            person2: analysisMode === 'connection' ? person2 : null,
            analysisResult: result,
            analysisMode: analysisMode || 'connection',
          }),
        });

        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          // Speichere analysisId für späteren Zugriff
          if (typeof window !== 'undefined' && saveData.analysisId) {
            localStorage.setItem('lastAnalysisId', saveData.analysisId);
          }
        }
      } catch (error) {
        console.error('Fehler beim Speichern der Analyse:', error);
        // Nicht kritisch - Analyse funktioniert auch ohne Speicherung
      }
    } catch (error: any) {
      console.error('Fehler bei der Analyse:', error);
      setAnalysisStatus(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
      // Fallback zu Mock-Daten bei Fehler
      const mockResult: AnalysisResult = {
        resonanceScore: 65,
        harmony: {
          areas: ['Energetische Kompatibilität'],
          description: 'Die Analyse konnte nicht vollständig durchgeführt werden.',
        },
        dissonance: {
          areas: ['Daten unvollständig'],
          description: 'Bitte überprüfe die eingegebenen Daten.',
        },
        recommendations: [
          'Bitte versuche es erneut',
          'Stelle sicher, dass alle Daten korrekt sind',
        ],
        hdCompatibility: {
          type: 'Unbekannt',
          profile: 'Unbekannt',
          authority: 'Unbekannt',
        },
        connectionKey: {
          gates: [],
          channels: [],
        },
      };
      setResult(mockResult);
      
      // Öffne auch bei Fehler das E-Mail-Modal (optional)
      setTimeout(() => {
        setShowEmailModal(true);
      }, 1500);
    } finally {
      setAnalyzing(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setEmailSubmitting(true);

    try {
      // API-Call zum Speichern der E-Mail
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newsletterOptIn,
          source: 'resonance-analysis',
          analysisResult: result,
          person1: person1.name,
          person2: analysisMode === 'connection' ? person2.name : null,
        }),
      });

      if (response.ok) {
        setEmailSubmitted(true);
        setShowSuccessAnimation(true);
        
        // Schließe Modal nach 2 Sekunden
        setTimeout(() => {
          setShowEmailModal(false);
          setShowSuccessAnimation(false);
        }, 2500);
      } else {
        console.error('Fehler beim Speichern der E-Mail');
      }
    } catch (error) {
      console.error('Fehler beim Speichern der E-Mail:', error);
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleCreateReading = () => {
    setShowReadingDialog(true);
  };

  const saveAsReading = async (title: string) => {
    if (!result) return;

    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'anonymous' : 'anonymous';

      const readingData = {
        userId,
        type: 'connectionKey',
        category: 'connection-key',
        title: title || `Resonanzanalyse: ${person1.name}${analysisMode === 'connection' ? ` & ${person2.name}` : ''}`,
        question: 'Sofort-Resonanzanalyse',
        person1: {
          name: person1.name,
          birthdate: person1.birthDate,
          birthtime: person1.birthTime || '12:00',
          birthplace: person1.birthPlace,
        },
        ...(analysisMode === 'connection' && person2 ? {
          person2: {
            name: person2.name,
            birthdate: person2.birthDate,
            birthtime: person2.birthTime || '12:00',
            birthplace: person2.birthPlace,
          },
        } : {}),
        analysisResult: {
          resonanceScore: result.resonanceScore,
          harmony: result.harmony,
          dissonance: result.dissonance,
          recommendations: result.recommendations,
          hdCompatibility: result.hdCompatibility,
          connectionKey: result.connectionKey,
        },
      };

      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern des Readings');
      }

      // Speichere auch lokal für Offline-Zugriff
      if (typeof window !== 'undefined') {
        const existingReadings = JSON.parse(localStorage.getItem('userReadings') || '[]');
        existingReadings.push(data.reading);
        localStorage.setItem('userReadings', JSON.stringify(existingReadings));
        localStorage.setItem('currentReadingId', data.reading.id);
      }

      setShowReadingDialog(false);
      
      // Optional: Weiterleitung zu Reading-Detail-Seite oder Erfolgsmeldung
      alert('Reading erfolgreich gespeichert!');
      
      // Optional: Reload der Readings-Liste auf der Resonanzanalyse-Seite
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('readingsUpdated'));
      }
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error);
      alert(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', py: 4 }}>
      <AnimatePresence mode="wait">
        {activeStep === 0 && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero-Bereich */}
            <Box 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                position: 'relative',
                py: { xs: 4, md: 6 },
              }}
            >
              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 4 }, maxWidth: '800px', mx: 'auto' }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Erkenne, wie eure Verbindung wirklich wirkt
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: '600px',
                    mx: 'auto',
                    mb: 2,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    textShadow: '0 1px 5px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Die Resonanzanalyse macht sichtbar, wie zwei Menschen energetisch aufeinander reagieren – klar strukturiert und ohne komplizierte Prozesse.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    maxWidth: '600px',
                    mx: 'auto',
                    mb: 4,
                    fontSize: '0.875rem',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Für den Zugang zur vollständigen Analyse wird eine E-Mail-Adresse benötigt.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  onClick={() => handleModeSelect('connection')}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    p: 4,
                    minHeight: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.2)',
                      background: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&:active': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Heart size={48} color="#F29F05" style={{ marginBottom: '1rem' }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                    Resonanzanalyse starten
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, lineHeight: 1.6 }}>
                    Du gibst die Daten von zwei Personen ein und erhältst eine strukturierte Auswertung ihrer Verbindung.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', mb: 1 }}>
                    Für die Bereitstellung der Ergebnisse wird eine E-Mail-Adresse abgefragt.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    Kein Spam. Kein Newsletter-Zwang.
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeStep === 1 && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Stepper activeStep={1} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: 4,
              }}
            >
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 3 }}>
                {analysisMode === 'connection' ? 'Verbindungsdaten eingeben' : 'Personendaten eingeben'}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={analysisMode === 'connection' ? 6 : 12}>
                  <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                    {analysisMode === 'connection' ? 'Person 1' : 'Person'}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Name *"
                    value={person1.name}
                    onChange={(e) => handlePerson1Change('name', e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                    inputProps={{ style: { color: '#FFFFFF' } }}
                  />
                  <TextField
                    fullWidth
                    label="Geburtsdatum *"
                    type="date"
                    value={person1.birthDate}
                    onChange={(e) => handlePerson1Change('birthDate', e.target.value)}
                    InputLabelProps={{ shrink: true, style: { color: 'rgba(255,255,255,0.7)' } }}
                    inputProps={{ style: { color: '#FFFFFF' } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Geburtszeit"
                    type="time"
                    value={person1.birthTime}
                    onChange={(e) => handlePerson1Change('birthTime', e.target.value)}
                    InputLabelProps={{ shrink: true, style: { color: 'rgba(255,255,255,0.7)' } }}
                    inputProps={{ style: { color: '#FFFFFF' } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Geburtsort *"
                    value={person1.birthPlace}
                    onChange={(e) => handlePerson1Change('birthPlace', e.target.value)}
                    InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                    inputProps={{ style: { color: '#FFFFFF' } }}
                  />
                </Grid>

                {analysisMode === 'connection' && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                      Person 2
                    </Typography>
                    <TextField
                      fullWidth
                      label="Name *"
                      value={person2.name}
                      onChange={(e) => handlePerson2Change('name', e.target.value)}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      inputProps={{ style: { color: '#FFFFFF' } }}
                    />
                    <TextField
                      fullWidth
                      label="Geburtsdatum *"
                      type="date"
                      value={person2.birthDate}
                      onChange={(e) => handlePerson2Change('birthDate', e.target.value)}
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255,255,255,0.7)' } }}
                      inputProps={{ style: { color: '#FFFFFF' } }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Geburtszeit"
                      type="time"
                      value={person2.birthTime}
                      onChange={(e) => handlePerson2Change('birthTime', e.target.value)}
                      InputLabelProps={{ shrink: true, style: { color: 'rgba(255,255,255,0.7)' } }}
                      inputProps={{ style: { color: '#FFFFFF' } }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Geburtsort *"
                      value={person2.birthPlace}
                      onChange={(e) => handlePerson2Change('birthPlace', e.target.value)}
                      InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                      inputProps={{ style: { color: '#FFFFFF' } }}
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActiveStep(0);
                    setAnalysisMode(null);
                  }}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                  }}
                >
                  Zurück
                </Button>
                <Button
                  variant="contained"
                  onClick={startAnalysis}
                  disabled={
                    (analysisMode === 'connection' &&
                      (!validatePersonData(person1) || !validatePersonData(person2))) ||
                    (analysisMode === 'single' && !validatePersonData(person1))
                  }
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    },
                  }}
                  startIcon={<Sparkles size={18} />}
                >
                  Analyse starten
                </Button>
              </Box>
            </Card>
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Stepper activeStep={2} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {analyzing ? (
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 4,
                  p: 6,
                  textAlign: 'center',
                }}
              >
                <CircularProgress
                  size={60}
                  sx={{ color: '#F29F05', mb: 3 }}
                />
                <Typography
                  variant="h5"
                  sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}
                >
                  {analysisStatus}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={analysisProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                      borderRadius: 4,
                    },
                    mt: 3,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}
                >
                  {analysisProgress}%
                </Typography>
              </Card>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Ergebnis wird im nächsten Teil implementiert */}
                <ResultDisplay
                  result={result}
                  person1={person1}
                  person2={analysisMode === 'connection' ? person2 : undefined}
                  onProceedToStep2={handleProceedToStep2}
                  email={email}
                  setEmail={setEmail}
                  newsletterOptIn={newsletterOptIn}
                  setNewsletterOptIn={setNewsletterOptIn}
                  emailSubmitting={emailSubmitting}
                  emailSubmitted={emailSubmitted}
                  showSuccessAnimation={showSuccessAnimation}
                  handleEmailSubmit={handleEmailSubmit}
                />
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading-Erstellung Dialog */}
      <Dialog
        open={showReadingDialog}
        onClose={() => setShowReadingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(11, 10, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 700 }}>
          Reading erstellen
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Möchtest du diese Analyse als vollständiges Reading speichern?
          </Typography>
          <TextField
            fullWidth
            label="Reading-Titel"
            placeholder="z.B. Resonanzanalyse: Max & Maria"
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
            inputProps={{ style: { color: '#FFFFFF' } }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowReadingDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => saveAsReading('Resonanzanalyse')}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              },
            }}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* E-Mail-Modal mit Animation */}
      <AnimatePresence>
        {showEmailModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 1300,
              }}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1301,
                width: '90%',
                maxWidth: '500px',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(11, 10, 15, 0.98), rgba(11, 10, 15, 0.95))',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(242, 159, 5, 0.4)',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(242, 159, 5, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Goldene Partikel im Hintergrund */}
                {showSuccessAnimation && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                    }}
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 0,
                          scale: 0,
                          x: '50%',
                          y: '50%',
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          x: `${50 + (Math.random() - 0.5) * 100}%`,
                          y: `${50 + (Math.random() - 0.5) * 100}%`,
                        }}
                        transition={{
                          duration: 1.5,
                          delay: Math.random() * 0.5,
                          ease: 'easeOut',
                        }}
                        style={{
                          position: 'absolute',
                          width: '8px',
                          height: '8px',
                          background: 'radial-gradient(circle, #F29F05, #FFD700)',
                          borderRadius: '50%',
                          boxShadow: '0 0 10px rgba(242, 159, 5, 0.8)',
                        }}
                      />
                    ))}
                  </Box>
                )}

                <CardContent sx={{ p: 4, position: 'relative' }}>
                  {/* Close Button */}
                  <Button
                    onClick={() => setShowEmailModal(false)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      minWidth: 'auto',
                      width: 32,
                      height: 32,
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        color: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                      },
                    }}
                  >
                    <X size={20} />
                  </Button>

                  {!emailSubmitted ? (
                    <>
                      {/* Header */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(255, 215, 0, 0.2))',
                              border: '2px solid rgba(242, 159, 5, 0.4)',
                              mb: 2,
                            }}
                          >
                            <Mail size={32} color="#F29F05" />
                          </Box>
                        </motion.div>
                        <Typography
                          variant="h5"
                          sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            mb: 1,
                            background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          🎉 Deine Resonanzanalyse ist fertig!
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1rem',
                          }}
                        >
                          Erhalte deine vollständige Analyse als PDF per E-Mail
                        </Typography>
                      </Box>

                      {/* E-Mail Input mit goldenem Glow */}
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          type="email"
                          label="Deine E-Mail-Adresse"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@beispiel.de"
                          disabled={emailSubmitting}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#FFFFFF',
                              '& fieldset': {
                                borderColor: 'rgba(242, 159, 5, 0.3)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(242, 159, 5, 0.5)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#F29F05',
                                borderWidth: '2px',
                                boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': {
                                color: '#F29F05',
                              },
                            },
                          }}
                          InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
                          inputProps={{ style: { color: '#FFFFFF' } }}
                        />
                      </Box>

                      {/* Newsletter Checkbox */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 3,
                          p: 2,
                          background: 'rgba(242, 159, 5, 0.05)',
                          borderRadius: 2,
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.1)',
                          },
                        }}
                        onClick={() => setNewsletterOptIn(!newsletterOptIn)}
                      >
                        <input
                          type="checkbox"
                          checked={newsletterOptIn}
                          onChange={(e) => setNewsletterOptIn(e.target.checked)}
                          style={{
                            marginRight: 12,
                            marginTop: 2,
                            cursor: 'pointer',
                            accentColor: '#F29F05',
                          }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#FFFFFF',
                              fontWeight: 500,
                              mb: 0.5,
                            }}
                          >
                            Ja, ich möchte auch wöchentliche Resonanz-Insights erhalten
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.75rem',
                            }}
                          >
                            Kostenlos & jederzeit abmeldbar • Exklusive Tipps für bessere Verbindungen
                          </Typography>
                        </Box>
                      </Box>

                      {/* Buttons */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setShowEmailModal(false)}
                          disabled={emailSubmitting}
                          sx={{
                            borderColor: 'rgba(242, 159, 5, 0.5)',
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': {
                              borderColor: 'rgba(242, 159, 5, 0.7)',
                              background: 'rgba(242, 159, 5, 0.1)',
                            },
                          }}
                        >
                          Später
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleEmailSubmit}
                          disabled={!validateEmail(email) || emailSubmitting}
                          startIcon={emailSubmitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <Mail size={18} />}
                          sx={{
                            background: validateEmail(email)
                              ? 'linear-gradient(135deg, #F29F05, #FFD700)'
                              : 'rgba(242, 159, 5, 0.3)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            boxShadow: validateEmail(email)
                              ? '0 8px 20px rgba(242, 159, 5, 0.4)'
                              : 'none',
                            '&:hover': {
                              background: validateEmail(email)
                                ? 'linear-gradient(135deg, #FFD700, #F29F05)'
                                : 'rgba(242, 159, 5, 0.3)',
                              transform: validateEmail(email) ? 'translateY(-2px)' : 'none',
                              boxShadow: validateEmail(email)
                                ? '0 12px 30px rgba(242, 159, 5, 0.5)'
                                : 'none',
                            },
                            '&:disabled': {
                              background: 'rgba(242, 159, 5, 0.2)',
                              color: 'rgba(255,255,255,0.5)',
                            },
                          }}
                        >
                          {emailSubmitting ? 'Wird gesendet...' : 'PDF erhalten'}
                        </Button>
                      </Box>
                    </>
                  ) : (
                    /* Success State */
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                      >
                        <CheckCircle size={64} color="#10B981" style={{ marginBottom: '1rem' }} />
                      </motion.div>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#10B981',
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        Erfolgreich abonniert! ✨
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                        }}
                      >
                        Deine Analyse wird in Kürze per E-Mail versendet.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Step 2: Geschützter Bereich (Tiefere Ebenen) */}
        {activeStep === 3 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {checkingAuth ? (
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: 4,
                  p: 6,
                  textAlign: 'center',
                }}
              >
                <CircularProgress sx={{ color: '#F29F05', mb: 3 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Prüfe Zugriff...
                </Typography>
              </Card>
            ) : isAuthenticated ? (
              /* Step 2 Content für authentifizierte Nutzer */
              <Box>
                <Stepper activeStep={3} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' } }}>
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      mb: 3,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    Tiefere Ebenen der Resonanzanalyse
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      mb: 3,
                      lineHeight: 1.8,
                    }}
                  >
                    Dieser Bereich ist Teil des inneren Raums von The Connection Key. 
                    Hier findest du erweiterte Analysen und tiefere Einblicke in eure energetische Verbindung.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(2)}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                      }}
                    >
                      Zurück zur Analyse
                    </Button>
                  </Box>
                </Card>
              </Box>
            ) : (
              /* Übergangsbildschirm für nicht-authentifizierte Nutzer */
              <Box>
                <Stepper activeStep={2} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' } }}>
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 4,
                    p: { xs: 3, md: 6 },
                    textAlign: 'center',
                    maxWidth: '700px',
                    mx: 'auto',
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(242, 159, 5, 0.1)',
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      mb: 3,
                    }}
                  >
                    <Key size={32} color="#F29F05" />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      mb: 3,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                    }}
                  >
                    Dieser Bereich ist geschützt
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      mb: 4,
                      lineHeight: 1.8,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      maxWidth: '600px',
                      mx: 'auto',
                    }}
                  >
                    Die tieferen Ebenen der Resonanzanalyse sind Teil des geschützten Raums von The Connection Key.
                    <br />
                    <br />
                    Mit einer Mitgliedschaft kannst du diesen Raum bewusst betreten.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/upgrade')}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        },
                      }}
                    >
                      Zur Mitgliedschaft
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(2)}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        '&:hover': {
                          borderColor: 'rgba(242, 159, 5, 0.7)',
                          background: 'rgba(242, 159, 5, 0.1)',
                        },
                      }}
                    >
                      Zurück zur Analyse
                    </Button>
                  </Box>
                </Card>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

// Ergebnis-Display Komponente
function ResultDisplay({
  result,
  person1,
  person2,
  onProceedToStep2,
}: {
  result: AnalysisResult;
  person1: PersonData;
  person2?: PersonData;
  onProceedToStep2: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F29F05'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <Box>
      {/* Resonanzwert */}
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(242, 159, 5, 0.3)',
          borderRadius: 4,
          p: 4,
          mb: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          Resonanzwert
        </Typography>
        <Box
          sx={{
            width: 200,
            height: 200,
            mx: 'auto',
            position: 'relative',
            mb: 3,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={result.resonanceScore}
            size={200}
            thickness={4}
            sx={{
              color: getScoreColor(result.resonanceScore),
              transform: 'rotate(-90deg)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: getScoreColor(result.resonanceScore),
                fontWeight: 800,
              }}
            >
              {result.resonanceScore}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {person2
            ? `${person1.name} & ${person2.name}`
            : person1.name}
        </Typography>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Harmonie */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(16, 185, 129, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 4,
              p: 3,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp size={24} color="#10B981" />
              <Typography variant="h6" sx={{ color: '#10B981', ml: 1, fontWeight: 700 }}>
                Harmonie
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
              {result.harmony.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.harmony.areas.map((area, index) => (
                <Chip
                  key={index}
                  label={area}
                  size="small"
                  sx={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                />
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Dissonanz */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 4,
              p: 3,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingDown size={24} color="#EF4444" />
              <Typography variant="h6" sx={{ color: '#EF4444', ml: 1, fontWeight: 700 }}>
                Dissonanz
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
              {result.dissonance.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.dissonance.areas.map((area, index) => (
                <Chip
                  key={index}
                  label={area}
                  size="small"
                  sx={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                />
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Empfehlungen */}
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(242, 159, 5, 0.3)',
          borderRadius: 4,
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 700 }}>
          Empfehlungen
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {result.recommendations.map((rec, index) => (
            <Typography
              key={index}
              component="li"
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}
            >
              {rec}
            </Typography>
          ))}
        </Box>
      </Card>

      {/* Human Design Kompatibilität */}
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(242, 159, 5, 0.3)',
          borderRadius: 4,
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 700 }}>
          Human Design Kompatibilität
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Typ
            </Typography>
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              {result.hdCompatibility.type}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Profil
            </Typography>
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              {result.hdCompatibility.profile}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Autorität
            </Typography>
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              {result.hdCompatibility.authority}
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Connection Key
            </Typography>
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              {result.connectionKey.gates.length} Tore
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            borderColor: 'rgba(242, 159, 5, 0.5)',
            color: '#F29F05',
          }}
        >
          Neue Analyse
        </Button>
        <Button
          variant="contained"
          onClick={onProceedToStep2}
          endIcon={<ArrowRight size={18} />}
          sx={{
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            color: '#FFFFFF',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
            },
          }}
        >
          Tiefere Ebenen
        </Button>
      </Box>
    </Box>
  );
}


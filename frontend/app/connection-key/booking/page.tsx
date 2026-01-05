"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  Heart,
  Sparkles,
  Users,
  ArrowRight,
  ArrowLeft,
  HeartHandshake,
  Baby,
  UserCircle,
  Briefcase,
  GraduationCap,
  UsersRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Package {
  id: string;
  name: string;
  sessions: number;
  price: number;
  pricePerSession: number;
  savings: number;
  popular: boolean;
  description: string;
}

// Stripe Product IDs für Connection Key Buchungen
import { STRIPE_BOOKING_PRODUCTS } from '@/lib/stripe';

const STRIPE_PRODUCT_IDS = {
  single: STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_SINGLE, // prod_TLn3wyU9StKNXc
  triple: STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_TRIPLE, // prod_TLRYaPzOBn1t8j
  five: STRIPE_BOOKING_PRODUCTS.CONNECTION_KEY_FIVE, // prod_TLRbWZCHxeJoGG
};

// Stripe Payment Links (falls noch verwendet)
const STRIPE_PAYMENT_LINKS = {
  single: 'https://dashboard.stripe.com/acct_1SCU0yJj1GR6pGhB', // Connection Key Einzelsession
  triple: 'https://buy.stripe.com/4gM9AUg9u6qZ2k91g5f7i01', // Connection Key 3er-Paket
  five: 'https://buy.stripe.com/4gMdRa1eA5mV2k9e2Rf7i02', // Connection Key 5er-Paket
};

const packages: Package[] = [
  {
    id: 'single',
    name: 'Einzelsession',
    sessions: 1,
    price: 149,
    pricePerSession: 149,
    savings: 0,
    popular: false,
    description: 'Perfekt zum Kennenlernen'
  },
  {
    id: 'triple',
    name: '3er-Paket',
    sessions: 3,
    price: 399,
    pricePerSession: 133,
    savings: 48,
    popular: true,
    description: 'Am beliebtesten für mehrere Beziehungen'
  },
  {
    id: 'five',
    name: '5er-Paket',
    sessions: 5,
    price: 599,
    pricePerSession: 120,
    savings: 146,
    popular: false,
    description: 'Bester Preis für intensive Analysen'
  }
];

// Termin-Auswahl erfolgt über Date/Time Input-Felder (kein Kalender/Buchungstool integriert)

export default function ConnectionKeyBookingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState(''); // Für dd/mm/yyyy Anzeige
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Direkt auf false, kein Ladescreen
  const [error, setError] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState('/images/connection-key-optimized.png');

  // Formatierung für Datum dd/mm/yyyy
  const formatDateInput = (value: string): string => {
    // Entferne alle Nicht-Zahlen
    const numbers = value.replace(/\D/g, '');
    
    // Formatierung: dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Konvertierung von dd/mm/yyyy zu yyyy-mm-dd für interne Verwendung
  const convertDateToISO = (dateString: string): string => {
    if (!dateString || dateString.length !== 10) return '';
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Konvertierung von yyyy-mm-dd zu dd/mm/yyyy für Anzeige
  const convertDateToDisplay = (dateString: string): string => {
    if (!dateString || !dateString.includes('-')) return '';
    const [year, month, day] = dateString.split('-');
    if (!day || !month || !year) return '';
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateInput(e.target.value);
    setSelectedDateDisplay(formattedValue);
    
    // Konvertiere zu yyyy-mm-dd für interne Verwendung
    if (formattedValue.length === 10) {
      const isoDate = convertDateToISO(formattedValue);
      setSelectedDate(isoDate);
    } else {
      setSelectedDate('');
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    partner1Name: '',
    partner1BirthDate: '',
    partner1BirthTime: '',
    partner1BirthPlace: '',
    partner2Name: '',
    partner2BirthDate: '',
    partner2BirthTime: '',
    partner2BirthPlace: '',
    notes: '',
    resonanceArea: '' // Neuer Bereich für Resonanz
  });

  const resonanceAreas = [
    { id: 'relationship', label: 'Partnerschaft / Beziehung', icon: HeartHandshake, description: 'Romantische Beziehung, Ehe, Partner' },
    { id: 'family', label: 'Familie', icon: Baby, description: 'Eltern, Geschwister, Kinder' },
    { id: 'friendship', label: 'Freundschaft', icon: UserCircle, description: 'Freunde, beste Freunde' },
    { id: 'business', label: 'Business / Kollegen', icon: Briefcase, description: 'Geschäftspartner, Kollegen, Team' },
    { id: 'mentoring', label: 'Mentoring / Coaching', icon: GraduationCap, description: 'Mentor, Coach, Lehrer' },
    { id: 'team', label: 'Team / Gruppe', icon: UsersRound, description: 'Team-Dynamik, Arbeitsgruppe' }
  ];

  const steps = ['Bereich wählen', 'Paket wählen', 'Termin wählen', 'Deine Daten', 'Bezahlung'];

  // Lade Bereich aus URL-Parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const bereichParam = params.get('bereich');
      if (bereichParam) {
        // Mappe Bereich-ID von Bereiche-Seite zu Buchungsseite
        const bereichMapping: Record<string, string> = {
          'partnerschaft': 'relationship',
          'familie': 'family',
          'freundschaft': 'friendship',
          'business': 'business',
          'mentoring': 'mentoring',
          'team': 'team'
        };
        const mappedBereich = bereichMapping[bereichParam] || bereichParam;
        // Prüfe ob der Bereich existiert
        const validArea = resonanceAreas.find(a => a.id === mappedBereich);
        if (validArea) {
          setFormData(prev => ({ ...prev, resonanceArea: mappedBereich }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lade User-Daten
  useEffect(() => {
    // Lade User-Daten sofort
    try {
      const userData = localStorage.getItem('userData');
      const userEmail = localStorage.getItem('userEmail');
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            name: `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim(),
            email: parsed.email || userEmail || '',
            phone: parsed.phone || ''
          }));
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      } else if (userEmail) {
        setFormData(prev => ({ ...prev, email: userEmail }));
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);

  const handleNext = () => {
    // Validierung
    if (activeStep === 0 && !formData.resonanceArea) {
      setError('Bitte wähle einen Bereich aus, in dem du die Resonanz entdecken möchtest');
      return;
    }
    if (activeStep === 1 && !selectedPackage) {
      setError('Bitte wähle ein Paket aus');
      return;
    }
    if (activeStep === 2 && (!selectedDate || !selectedTime)) {
      setError('Bitte gib ein Datum und eine Uhrzeit ein');
      return;
    }
    // Validiere, dass das Datum nicht in der Vergangenheit liegt
    if (activeStep === 2 && selectedDate) {
      const selected = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Das gewählte Datum liegt in der Vergangenheit');
        return;
      }
    }
    // Validiere, dass das Datum im korrekten Format eingegeben wurde
    if (activeStep === 2 && selectedDateDisplay && selectedDateDisplay.length === 10 && !selectedDate) {
      setError('Bitte gib ein gültiges Datum im Format dd/mm/yyyy ein');
      return;
    }
    if (activeStep === 3) {
      // Validiere Kontaktdaten
      if (!formData.name || !formData.email) {
        setError('Bitte fülle alle Pflichtfelder aus');
        return;
      }
      if (!formData.partner1Name || !formData.partner1BirthDate) {
        setError('Bitte gib die Daten von Partner 1 ein');
        return;
      }
      if (!formData.partner2Name || !formData.partner2BirthDate) {
        setError('Bitte gib die Daten von Partner 2 ein');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleBooking = async () => {
    try {
      setError(null);

      // Speichere Buchungsdaten
      const bookingData = {
        package: selectedPackage,
        date: selectedDate,
        time: selectedTime,
        ...formData,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

      // Verwende direkten Payment Link wenn vorhanden, sonst API-Route
      const paymentLink = selectedPackage?.id === 'single' ? STRIPE_PAYMENT_LINKS.single :
                         selectedPackage?.id === 'triple' ? STRIPE_PAYMENT_LINKS.triple :
                         selectedPackage?.id === 'five' ? STRIPE_PAYMENT_LINKS.five :
                         null;
      
      if (paymentLink) {
        // Direkter Redirect zu Stripe Payment Link
        console.log('Redirecting to Stripe Payment Link:', paymentLink, 'for package:', selectedPackage?.id);
        // Verwende window.location.replace() für bessere Browser-Kompatibilität
        window.location.replace(paymentLink);
        return;
      }

      // Nur für API-Route setLoading setzen
      setLoading(true);

      // Erstelle Stripe Checkout Session für andere Pakete
      const productIdMap: Record<string, string> = {
        'single': STRIPE_PRODUCT_IDS.single,
        'triple': STRIPE_PRODUCT_IDS.triple,
        'five': STRIPE_PRODUCT_IDS.five,
      };

      const successUrlMap: Record<string, string> = {
        'single': `${window.location.origin}/buchung/dankeseiten/connection-key-einzelsession`,
        'triple': `${window.location.origin}/buchung/dankeseiten/connection-key-3er-paket`,
        'five': `${window.location.origin}/buchung/dankeseiten/connection-key-5er-paket`,
      };

      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          productId: productIdMap[selectedPackage?.id || ''],
          amount: selectedPackage?.price,
          productName: `Connection Key - ${selectedPackage?.name}`,
          bookingType: 'connection-key',
          successUrl: successUrlMap[selectedPackage?.id || ''] || `${window.location.origin}/connection-key/success`,
          cancelUrl: `${window.location.origin}/connection-key/booking`,
          metadata: {
            bookingType: 'connection-key',
            resonanceArea: formData.resonanceArea,
            sessions: selectedPackage?.sessions,
            date: selectedDate,
            time: selectedTime,
            customerEmail: formData.email
          }
        })
      });

      const data = await response.json();

      if (data.url) {
        // Redirect zu Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Fehler beim Erstellen der Buchung');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ color: 'white', mb: 2, textAlign: 'center', fontWeight: 600 }}>
              Wähle den Bereich, in dem du die Resonanz entdecken möchtest
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, textAlign: 'center' }}>
              Wähle den Kontext für deine Connection Key Analyse
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push('/resonanzanalyse/bereiche')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontSize: '0.85rem',
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)'
                  }
                }}
              >
                Mehr über die Bereiche erfahren →
              </Button>
            </Box>
            <Grid container spacing={3}>
              {resonanceAreas.map((area) => (
                <Grid item xs={12} sm={6} md={4} key={area.id}>
                  <Card
                    onClick={() => setFormData(prev => ({ ...prev, resonanceArea: area.id }))}
                    sx={{
                      cursor: 'pointer',
                      background: formData.resonanceArea === area.id
                        ? 'linear-gradient(135deg, rgba(242,159,5,0.3), rgba(140,29,4,0.3))'
                        : 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      border: formData.resonanceArea === area.id
                        ? '2px solid #F29F05'
                        : '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 40px rgba(242,159,5,0.3)',
                        borderColor: '#F29F05'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2,
                        color: formData.resonanceArea === area.id ? '#F29F05' : 'rgba(255,255,255,0.7)'
                      }}>
                        {React.createElement(area.icon, { size: 48 })}
                      </Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                        {area.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {area.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Wähle dein Paket
            </Typography>
            <Grid container spacing={3}>
              {packages.map((pkg) => (
                <Grid item xs={12} md={4} key={pkg.id}>
                  <Card
                    onClick={() => setSelectedPackage(pkg)}
                    sx={{
                      cursor: 'pointer',
                      background: selectedPackage?.id === pkg.id
                        ? 'linear-gradient(135deg, rgba(242,159,5,0.3), rgba(140,29,4,0.3))'
                        : 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      border: selectedPackage?.id === pkg.id
                        ? '2px solid #F29F05'
                        : '1px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 40px rgba(242,159,5,0.3)',
                        borderColor: '#F29F05'
                      }
                    }}
                  >
                    {pkg.popular && (
                      <Chip
                        label="Beliebteste Wahl"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          color: 'white',
                          fontWeight: 700
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        {pkg.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        {pkg.description}
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 1 }}>
                        €{pkg.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        €{pkg.pricePerSession} pro Session
                      </Typography>
                      {pkg.savings > 0 && (
                        <Chip
                          label={`Spare €${pkg.savings}`}
                          size="small"
                          sx={{
                            background: 'rgba(16,185,129,0.2)',
                            color: '#10b981',
                            fontWeight: 600
                          }}
                        />
                      )}
                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        ✓ {pkg.sessions} Zoom-Session{pkg.sessions > 1 ? 's' : ''}<br />
                        ✓ 60-90 Minuten pro Session<br />
                        ✓ Detaillierte Analyse<br />
                        ✓ PDF-Zusammenfassung
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Wähle deinen Wunschtermin
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, textAlign: 'center' }}>
              Gib dein bevorzugtes Datum und Uhrzeit für deine erste Session ein
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={18} />
                    Datum
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={selectedDateDisplay}
                    onChange={handleDateChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      maxLength: 10,
                      pattern: '[0-9]{2}/[0-9]{2}/[0-9]{4}',
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255,255,255,0.5)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={18} />
                    Uhrzeit
                  </Typography>
                  <TextField
                    fullWidth
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& input[type="time"]': {
                        color: 'white',
                        '&::-webkit-calendar-picker-indicator': {
                          filter: 'invert(1)',
                          cursor: 'pointer'
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              {selectedDate && selectedTime && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Calendar size={24} color="#F29F05" />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                          Gewählter Termin
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {new Date(selectedDate).toLocaleDateString('de-DE', { 
                            weekday: 'long', 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })} um {selectedTime} Uhr
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Deine Kontaktdaten
            </Typography>
            
            <Grid container spacing={3}>
              {/* Kontaktdaten */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                  📞 Deine Daten
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dein Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-Mail *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              {/* Partner 1 */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, mt: 2 }}>
                  💕 Partner 1 Daten
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name Partner 1 *"
                  value={formData.partner1Name}
                  onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtsdatum *"
                  type="date"
                  value={formData.partner1BirthDate}
                  onChange={(e) => setFormData({ ...formData, partner1BirthDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtszeit (optional)"
                  type="time"
                  value={formData.partner1BirthTime}
                  onChange={(e) => setFormData({ ...formData, partner1BirthTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtsort (optional)"
                  value={formData.partner1BirthPlace}
                  onChange={(e) => setFormData({ ...formData, partner1BirthPlace: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              {/* Partner 2 */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, mt: 2 }}>
                  💕 Partner 2 Daten
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name Partner 2 *"
                  value={formData.partner2Name}
                  onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtsdatum *"
                  type="date"
                  value={formData.partner2BirthDate}
                  onChange={(e) => setFormData({ ...formData, partner2BirthDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtszeit (optional)"
                  type="time"
                  value={formData.partner2BirthTime}
                  onChange={(e) => setFormData({ ...formData, partner2BirthTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Geburtsort (optional)"
                  value={formData.partner2BirthPlace}
                  onChange={(e) => setFormData({ ...formData, partner2BirthPlace: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>

              {/* Notizen */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Besondere Wünsche oder Fragen (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: '#F29F05' },
                      '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Buchungszusammenfassung
            </Typography>
            
            {formData.resonanceArea && (
              <Card sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(242, 159, 5, 0.3)', mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sparkles size={20} />
                    Resonanz-Bereich
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {resonanceAreas.find(a => a.id === formData.resonanceArea) && React.createElement(
                      resonanceAreas.find(a => a.id === formData.resonanceArea)!.icon,
                      { size: 24, color: '#F29F05' }
                    )}
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {resonanceAreas.find(a => a.id === formData.resonanceArea)?.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {resonanceAreas.find(a => a.id === formData.resonanceArea)?.description}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Card sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(242, 159, 5, 0.3)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                  📦 Gewähltes Paket
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                  {selectedPackage?.name} - {selectedPackage?.sessions} Session(s)
                </Typography>
                <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 800 }}>
                  €{selectedPackage?.price}
                </Typography>
                {selectedPackage && selectedPackage.savings > 0 && (
                  <Chip
                    label={`Du sparst €${selectedPackage.savings}`}
                    size="small"
                    sx={{ mt: 1, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}
                  />
                )}
              </CardContent>
            </Card>

            <Card sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(242, 159, 5, 0.3)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                  📅 Dein Termin
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                  {selectedDate && new Date(selectedDate).toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  Uhrzeit: {selectedTime} Uhr
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(242, 159, 5, 0.3)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                  👤 Kontaktdaten
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  Name: {formData.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  E-Mail: {formData.email}
                </Typography>
                {formData.phone && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Telefon: {formData.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3 }}>
              Nach der Bezahlung erhältst du eine Bestätigungs-E-Mail mit dem Zoom-Link für deine Session.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  // Zeige Ladebildschirm während initialem Laden
  if (isPageLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(242, 159, 5, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #1a1820 0%, #1a1820 60%)
          `,
          backgroundAttachment: 'fixed',
          gap: 4,
          padding: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Gradient Circles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${600 + i * 200}px`,
              height: `${600 + i * 200}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(242, 159, 5, ${0.12 - i * 0.03}), transparent)`,
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, Math.sin(i) * 50, 0],
              y: [0, Math.cos(i) * 50, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Logo */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 250, sm: 350, md: 450 },
            height: { xs: 120, sm: 160, md: 200 },
            mb: 2,
            zIndex: 2
          }}
        >
          <Image
            src="/images/connection-key-optimized.png"
            alt="The Connection Key"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

        {/* Loading Spinner */}
        <CircularProgress
          size={70}
          thickness={4}
          sx={{
            color: '#F29F05',
            zIndex: 2,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />

        {/* Loading Text */}
        <Typography
          variant="h6"
          sx={{
            color: '#F29F05',
            fontWeight: 600,
            textAlign: 'center',
            zIndex: 2,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.5,
              },
            },
          }}
        >
          Synchronisiere Energie …
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(242, 159, 5, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      py: { xs: 4, md: 8 }
    }}>
      {/* Animated Gradient Circles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${600 + i * 200}px`,
            height: `${600 + i * 200}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.12 - i * 0.03}), transparent)`,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, Math.sin(i) * 50, 0],
            y: [0, Math.cos(i) * 50, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Sparkles */}
      {[
        { left: 15, top: 20, duration: 2.5, delay: 0.3 },
        { left: 75, top: 35, duration: 3.2, delay: 1.1 },
        { left: 45, top: 60, duration: 2.8, delay: 0.7 },
        { left: 85, top: 15, duration: 3.5, delay: 1.5 },
        { left: 25, top: 80, duration: 2.3, delay: 0.5 },
        { left: 65, top: 45, duration: 3.8, delay: 1.8 },
        { left: 10, top: 55, duration: 2.6, delay: 0.9 },
        { left: 90, top: 70, duration: 3.0, delay: 1.2 },
        { left: 35, top: 25, duration: 2.9, delay: 0.4 },
        { left: 55, top: 85, duration: 3.3, delay: 1.6 },
        { left: 70, top: 10, duration: 2.7, delay: 0.8 },
        { left: 30, top: 90, duration: 3.6, delay: 1.4 },
        { left: 50, top: 40, duration: 2.4, delay: 0.6 },
        { left: 20, top: 65, duration: 3.1, delay: 1.3 },
        { left: 80, top: 50, duration: 2.5, delay: 0.9 },
      ].map((sparkle, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: '4px',
            height: '4px',
            background: '#F29F05',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(242, 159, 5, 0.8)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{
            position: 'relative',
            height: { xs: 120, md: 180 },
            width: { xs: '100%', md: 600 },
            maxWidth: 600,
            mx: 'auto',
            mb: 4,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box sx={{
              position: 'relative',
              height: '100%',
              width: '100%',
              maxWidth: 600
            }}>
              <Image
                src={logoSrc}
                alt="The Connection Key"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 600px"
                priority
                onError={() => {
                  // Fallback-Kette: optimiertes PNG -> Original PNG -> Legacy
                  if (logoSrc.includes('optimized')) {
                    setLogoSrc('/images/connection-key-logo.png');
                  } else {
                    setLogoSrc('/images/Design%20ohne%20Titel(15).png');
                  }
                }}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', mx: 'auto' }}>
            Entdecke die energetische Resonanz zwischen zwei Menschen
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiStepLabel-label.Mui-active': { color: '#F29F05' },
                '& .MuiStepLabel-label.Mui-completed': { color: '#F29F05' },
                '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.3)' },
                '& .MuiStepIcon-root.Mui-active': { color: '#F29F05' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#F29F05' }
              }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Paper sx={{ 
          p: 4, 
          background: 'rgba(255,255,255,0.03)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          mb: 4
        }}>
          {renderStepContent()}
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowLeft size={20} />}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
            variant="outlined"
          >
            Zurück
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleBooking}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : <CreditCard size={20} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Verarbeite...' : `Jetzt für €${selectedPackage?.price} buchen`}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowRight size={20} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Weiter
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}


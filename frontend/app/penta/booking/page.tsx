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
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  Sparkles,
  Users,
  ArrowRight,
  ArrowLeft,
  UsersRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '../../components/PageLayout';

interface Package {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  description: string;
  features: string[];
}

// Stripe Product IDs für Penta Buchungen
import { STRIPE_BOOKING_PRODUCTS } from '@/lib/stripe';

const STRIPE_PRODUCT_IDS = {
  single: STRIPE_BOOKING_PRODUCTS.PENTA_SINGLE, // prod_TU4AJXQPxlrxC1
  extended: STRIPE_BOOKING_PRODUCTS.PENTA_EXTENDED, // prod_TU4BTgjTIQwPvg
  premium: STRIPE_BOOKING_PRODUCTS.PENTA_PREMIUM, // prod_TU4C5SzbjDojsm
};

// Stripe Payment Links (falls noch verwendet)
const STRIPE_PAYMENT_LINKS = {
  single: 'https://dashboard.stripe.com/acct_1SCU0yJj1GR6pGhB', // Penta Einzelanalyse
  // Weitere Links müssen noch erstellt werden
};

const packages: Package[] = [
  {
    id: 'single',
    name: 'Penta Einzelanalyse',
    price: 299,
    popular: false,
    description: 'Eine vollständige energetische Resonanzanalyse für deine Gruppe (3–5 Personen).',
    features: [
      'Klare Rollenverteilung',
      'Erste Konflikt- & Harmoniepunkte'
    ]
  },
  {
    id: 'extended',
    name: 'Erweiterte Penta-Analyse',
    price: 449,
    popular: true,
    description: 'Detailliertes Gruppenreading mit klarer Auswertung und konkreten Handlungsempfehlungen.',
    features: [
      'Tiefenanalyse',
      'Gruppendynamik',
      'Energetische Aufgabenverteilung'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Penta-Paket',
    price: 699,
    popular: false,
    description: 'Die komplette Analyse inklusive schriftlichem Report + Follow-up Session.',
    features: [
      'Vollständiger Gruppenreport',
      'Umsetzungsplan',
      '1:1 Follow-up für eure Energiearbeit'
    ]
  }
];

export default function PentaBookingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [groupSize, setGroupSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatierung für Datum dd/mm/yyyy
  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const convertDateToISO = (dateString: string): string => {
    if (!dateString || dateString.length !== 10) return '';
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    people: Array.from({ length: 3 }, () => ({
      name: '',
      birthDate: '',
      birthTime: '',
      birthPlace: ''
    }))
  });

  // Lade User-Daten
  useEffect(() => {
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

  // Update people array when group size changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      people: Array.from({ length: groupSize }, (_, idx) => 
        prev.people[idx] || { name: '', birthDate: '', birthTime: '', birthPlace: '' }
      )
    }));
  }, [groupSize]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateInput(e.target.value);
    setSelectedDateDisplay(formattedValue);
    
    if (formattedValue.length === 10) {
      const isoDate = convertDateToISO(formattedValue);
      setSelectedDate(isoDate);
    } else {
      setSelectedDate('');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPackage) {
      setError('Bitte wähle ein Paket aus');
      return;
    }
    if (activeStep === 1 && (!selectedDate || !selectedTime)) {
      setError('Bitte gib ein Datum und eine Uhrzeit ein');
      return;
    }
    if (activeStep === 1 && selectedDate) {
      const selected = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Das gewählte Datum liegt in der Vergangenheit');
        return;
      }
    }
    if (activeStep === 2) {
      if (!formData.name || !formData.email) {
        setError('Bitte fülle alle Pflichtfelder aus');
        return;
      }
      // Validiere mindestens 3 Personen
      const validPeople = formData.people.filter(p => p.name && p.birthDate);
      if (validPeople.length < 3) {
        setError('Bitte gib mindestens 3 Personen ein');
        return;
      }
      if (validPeople.length > 5) {
        setError('Eine Penta-Analyse ist für maximal 5 Personen');
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
      setLoading(true);

      const bookingData = {
        type: 'penta',
        package: selectedPackage,
        date: selectedDate,
        time: selectedTime,
        groupSize: groupSize,
        ...formData,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('pendingPentaBooking', JSON.stringify(bookingData));

      // Verwende Payment Link wenn vorhanden
      const paymentLink = selectedPackage?.id === 'single' ? STRIPE_PAYMENT_LINKS.single : null;
      
      if (paymentLink) {
        window.location.replace(paymentLink);
        return;
      }

      // API-Route für andere Pakete
      const productIdMap: Record<string, string> = {
        'single': STRIPE_PRODUCT_IDS.single,
        'extended': STRIPE_PRODUCT_IDS.extended,
        'premium': STRIPE_PRODUCT_IDS.premium,
      };

      const successUrlMap: Record<string, string> = {
        'single': `${window.location.origin}/buchung/dankeseiten/penta-einzelanalyse`,
        'extended': `${window.location.origin}/buchung/dankeseiten/erweiterte-pentaanalyse`,
        'premium': `${window.location.origin}/buchung/dankeseiten/premium-penta-paket`,
      };

      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          productId: productIdMap[selectedPackage?.id || ''],
          amount: selectedPackage?.price,
          productName: `Penta-Analyse - ${selectedPackage?.name}`,
          bookingType: 'penta',
          successUrl: successUrlMap[selectedPackage?.id || ''] || `${window.location.origin}/penta/success`,
          cancelUrl: `${window.location.origin}/penta/booking`,
          metadata: {
            bookingType: 'penta',
            groupSize: groupSize,
            sessions: 1,
            date: selectedDate,
            time: selectedTime,
            customerEmail: formData.email
          }
        })
      });

      const data = await response.json();

      if (data.url) {
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

  const steps = ['Paket wählen', 'Termin wählen', 'Gruppendaten', 'Bezahlung'];

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

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowLeft size={20} />}
                onClick={() => router.push('/penta-booking')}
                sx={{
                  color: '#F29F05',
                  mb: 2,
                  '&:hover': {
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                }}
              >
                Zurück
              </Button>

              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                }}
              >
                Penta-Analyse buchen
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.7,
                }}
              >
                Buche deine energetische Gruppenresonanz-Analyse für 3–5 Personen und erkenne auf einen Blick, wie eure gemeinsame Energie wirklich funktioniert.
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' } }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Paper
              sx={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                mb: 4,
              }}
            >
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
                    Wähle dein Penta-Paket
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
                                top: 15,
                                right: 15,
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                color: 'white',
                                fontWeight: 700
                              }}
                            />
                          )}
                          <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1.5 }}>
                              {pkg.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6 }}>
                              {pkg.description}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              {pkg.features.map((feature, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <CheckCircle size={18} color="#F29F05" />
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                    {feature}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                            <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, mb: 1 }}>
                              €{pkg.price}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Zwischenüberschrift "Was du durch eine Penta-Analyse gewinnst" */}
                  <Box sx={{ mt: 6, mb: 2 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 700,
                        mb: 3,
                        fontSize: { xs: '1.3rem', md: '1.5rem' },
                        textAlign: 'center'
                      }}
                    >
                      Was du durch eine Penta-Analyse gewinnst:
                    </Typography>
                    <Box sx={{
                      background: 'rgba(242, 159, 5, 0.1)',
                      borderRadius: 3,
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      p: { xs: 3, md: 4 }
                    }}>
                      <Box component="ul" sx={{ 
                        listStyle: 'none', 
                        pl: 0, 
                        m: 0,
                        '& li': {
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5
                        }
                      }}>
                        {[
                          'sofort sichtbar, wie eure Gruppenenergie funktioniert',
                          'wer energetisch führt (und wer nicht)',
                          'wo versteckte Spannungen entstehen',
                          'welche Dynamiken Harmonie verhindern',
                          'wie ihr eure Energie optimal ausrichten könnt'
                        ].map((item, idx) => (
                          <Box component="li" key={idx}>
                            <Box sx={{ 
                              color: '#F29F05',
                              fontSize: '1.2rem',
                              lineHeight: 1,
                              mt: 0.5
                            }}>
                              •
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: { xs: '0.95rem', md: '1rem' },
                                lineHeight: 1.7
                              }}
                            >
                              {item}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ 
                        mt: 3,
                        pt: 3,
                        borderTop: '1px solid rgba(242, 159, 5, 0.2)'
                      }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { xs: '0.95rem', md: '1rem' },
                            lineHeight: 1.7,
                            fontStyle: 'italic'
                          }}
                        >
                          👉 <strong style={{ color: '#F29F05' }}>Das sorgt dafür, dass Familien, Teams und Partnerschaften mit Kindern endlich klarer, ruhiger und harmonischer funktionieren.</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
                    Wähle deinen Termin
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Datum (dd/mm/yyyy)"
                        value={selectedDateDisplay}
                        onChange={handleDateChange}
                        placeholder="dd/mm/yyyy"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                            '&:hover fieldset': { borderColor: '#F29F05' },
                            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                        }}
                        InputProps={{
                          startAdornment: <Calendar size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Uhrzeit"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                            '&:hover fieldset': { borderColor: '#F29F05' },
                            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                        }}
                        InputProps={{
                          startAdornment: <Clock size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                    Gruppendaten
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                    Gib die Daten aller Personen für die Penta-Analyse ein (3-5 Personen)
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Gruppengröße</InputLabel>
                    <Select
                      value={groupSize}
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F29F05' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F29F05' }
                      }}
                    >
                      <MenuItem value={3}>3 Personen</MenuItem>
                      <MenuItem value={4}>4 Personen</MenuItem>
                      <MenuItem value={5}>5 Personen (klassisches Penta)</MenuItem>
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 3, borderColor: 'rgba(242, 159, 5, 0.3)' }} />

                  {formData.people.slice(0, groupSize).map((person, index) => (
                    <Box key={index} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 600 }}>
                        Person {index + 1}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={person.name}
                            onChange={(e) => {
                              const newPeople = [...formData.people];
                              newPeople[index].name = e.target.value;
                              setFormData(prev => ({ ...prev, people: newPeople }));
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                                '&:hover fieldset': { borderColor: '#F29F05' },
                                '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Geburtsdatum (dd/mm/yyyy)"
                            value={person.birthDate}
                            onChange={(e) => {
                              const formatted = formatDateInput(e.target.value);
                              const newPeople = [...formData.people];
                              newPeople[index].birthDate = formatted;
                              setFormData(prev => ({ ...prev, people: newPeople }));
                            }}
                            placeholder="dd/mm/yyyy"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                                '&:hover fieldset': { borderColor: '#F29F05' },
                                '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Geburtszeit"
                            type="time"
                            value={person.birthTime}
                            onChange={(e) => {
                              const newPeople = [...formData.people];
                              newPeople[index].birthTime = e.target.value;
                              setFormData(prev => ({ ...prev, people: newPeople }));
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                                '&:hover fieldset': { borderColor: '#F29F05' },
                                '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Geburtsort"
                            value={person.birthPlace}
                            onChange={(e) => {
                              const newPeople = [...formData.people];
                              newPeople[index].birthPlace = e.target.value;
                              setFormData(prev => ({ ...prev, people: newPeople }));
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                                '&:hover fieldset': { borderColor: '#F29F05' },
                                '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  <Divider sx={{ my: 3, borderColor: 'rgba(242, 159, 5, 0.3)' }} />

                  <TextField
                    fullWidth
                    label="Dein Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="E-Mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Telefon (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                    }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notizen (optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                        '&:hover fieldset': { borderColor: '#F29F05' },
                        '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                    }}
                  />
                </Box>
              )}

              {activeStep === 3 && (
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center', fontWeight: 600 }}>
                    Zusammenfassung
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      <strong style={{ color: '#F29F05' }}>Paket:</strong> {selectedPackage?.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      <strong style={{ color: '#F29F05' }}>Preis:</strong> €{selectedPackage?.price}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      <strong style={{ color: '#F29F05' }}>Datum:</strong> {selectedDateDisplay}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      <strong style={{ color: '#F29F05' }}>Uhrzeit:</strong> {selectedTime}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      <strong style={{ color: '#F29F05' }}>Gruppengröße:</strong> {groupSize} Personen
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleBooking}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CreditCard size={24} />}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 700,
                      py: 2,
                      fontSize: '1.2rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      },
                      '&:disabled': {
                        background: 'rgba(242, 159, 5, 0.3)',
                      }
                    }}
                  >
                    {loading ? 'Wird verarbeitet...' : 'Jetzt bezahlen'}
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowLeft size={20} />}
                  sx={{
                    color: '#F29F05',
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  Zurück
                </Button>
                {activeStep < 3 && (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      }
                    }}
                  >
                    {activeStep === 0 ? 'Weiter zur Terminwahl' : 'Weiter'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>
      </PageLayout>
    </Box>
  );
}


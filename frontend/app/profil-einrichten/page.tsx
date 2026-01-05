"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { User, Calendar, MapPin, Heart, Star, CheckCircle, Camera, Upload, Phone, Globe, Lock, Eye } from 'lucide-react';
import MultiImageUpload from '@/components/MultiImageUpload';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const steps = [
  'Persönliche Daten',
  'Dating-Fotos & Kontakt',
  'Geburtsdaten',
  'Interessen & Präferenzen',
  'Privatsphäre',
  'Fertig!'
];

function ProfilEinrichtenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromUrl = Number(searchParams.get('step') || 1);
  const [activeStep, setActiveStep] = useState(stepFromUrl - 1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    profileImage: '',
    datingPhotos: [] as any[],
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    interests: [] as string[],
    bio: '',
    relationshipStatus: '',
    lookingFor: '',
    ageRange: [18, 65],
    maxDistance: 50,
    privacySettings: {
      showProfile: true,
      showBirthDate: false,
      showLocation: true,
      allowMessages: true,
      showOnlineStatus: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper: Ermitteln, ob Registrierungsdaten bereits vorhanden sind
  const hasPersonalData = !!(formData.firstName && formData.lastName && formData.email);
  const hasBirthData = !!(formData.birthDate && formData.birthPlace);

  // Gemeinsames Styling für alle Formularfelder - Orange/Gold Theme
  const textFieldStyle = {
    '& .MuiInputLabel-root': {
      color: '#F29F05',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#F29F05',
    },
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': {
        borderColor: 'rgba(242, 159, 5, 0.5)',
      },
      '&:hover fieldset': {
        borderColor: '#F29F05',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#F29F05',
        borderWidth: '2px'
      }
    }
  };

  const interestOptions = [
    'Human Design',
    'Astrologie',
    'Spiritualität',
    'Meditation',
    'Yoga',
    'Beziehungen',
    'Persönlichkeitsentwicklung',
    'Coaching',
    'Therapie',
    'Kreativität',
    'Musik',
    'Kunst',
    'Natur',
    'Reisen'
  ];

  // Sync activeStep mit URL
  useEffect(() => {
    const stepFromUrl = Number(searchParams.get('step') || 1);
    setActiveStep(stepFromUrl - 1);
  }, [searchParams]);

  useEffect(() => {
    // Lade vorhandene User-Daten
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || prev.firstName || '',
          lastName: user.lastName || prev.lastName || '',
          email: user.email || prev.email || '',
          phone: user.phone || prev.phone || '',
          website: user.website || prev.website || '',
          location: user.location || prev.location || '',
          birthDate: user.birthDate || prev.birthDate || '',
          birthTime: user.birthTime || prev.birthTime || '',
          birthPlace: user.birthPlace || prev.birthPlace || '',
          interests: Array.isArray(user.interests) ? user.interests : (prev.interests || []),
          bio: user.bio || prev.bio || '',
          relationshipStatus: user.relationshipStatus || prev.relationshipStatus || '',
          lookingFor: user.lookingFor || prev.lookingFor || '',
          ageRange: Array.isArray(user.ageRange) ? user.ageRange : (prev.ageRange || [18, 65]),
          maxDistance: user.maxDistance || prev.maxDistance || 50,
          privacySettings: user.privacySettings || prev.privacySettings || {
            showProfile: true,
            showBirthDate: false,
            showLocation: true,
            allowMessages: true,
            showOnlineStatus: true
          },
          profileImage: user.profileImage || (() => {
            // Versuche auch aus separatem Key zu laden
            const storedImage = localStorage.getItem('profileImage');
            return storedImage || prev.profileImage || '';
          })(),
          datingPhotos: (() => {
            // Versuche aus userData zu laden
            if (Array.isArray(user.datingPhotos) && user.datingPhotos.length > 0) {
              return user.datingPhotos;
            }
            // Versuche aus separatem Key zu laden
            try {
              const storedPhotos = localStorage.getItem('datingPhotos');
              if (storedPhotos) {
                return JSON.parse(storedPhotos);
              }
            } catch (e) {
              console.warn('Fehler beim Laden der Dating-Fotos:', e);
            }
            return prev.datingPhotos || [];
          })()
        }));
      } catch (error) {
        console.error('Fehler beim Laden der User-Daten:', error);
      }
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleInterestToggle = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  }, []);

  const shouldSkip = useCallback((stepIndex: number) => {
    // Step 0: Persönliche Daten → überspringen, wenn aus Registrierung vorhanden
    if (stepIndex === 0) {
      return !!(formData.firstName && formData.lastName && formData.email);
    }
    // Step 2: Geburtsdaten → überspringen, wenn bereits vorhanden
    // Wichtig: Nur überspringen, wenn ALLE Felder vollständig ausgefüllt sind
    if (stepIndex === 2) {
      return !!(formData.birthDate && formData.birthTime && formData.birthPlace && formData.birthPlace.trim().length > 0);
    }
    return false;
  }, [formData.firstName, formData.lastName, formData.email, formData.birthDate, formData.birthTime, formData.birthPlace]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      let next = activeStep + 1;
      while (next < steps.length - 1 && shouldSkip(next)) {
        next += 1;
      }
      setActiveStep(next);
      router.push(`/profil-einrichten?step=${next + 1}`);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      let prev = activeStep - 1;
      while (prev > 0 && shouldSkip(prev)) {
        prev -= 1;
      }
      setActiveStep(prev);
      router.push(`/profil-einrichten?step=${prev + 1}`);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Lade vorhandene User-Daten
      const existingUserData = localStorage.getItem('userData');
      let userData: any = {};

      if (existingUserData) {
        try {
          userData = JSON.parse(existingUserData);
        } catch (parseError) {
          console.error('Fehler beim Parsen der vorhandenen User-Daten:', parseError);
          userData = {};
        }
      }

      // Profil-Felder aktualisieren
      userData.firstName = formData.firstName || '';
      userData.lastName = formData.lastName || '';
      userData.phone = formData.phone || '';
      userData.website = formData.website || '';
      userData.location = formData.location || '';
      userData.birthDate = formData.birthDate || '';
      userData.birthTime = formData.birthTime || '';
      userData.birthPlace = formData.birthPlace || '';
      userData.interests = Array.isArray(formData.interests) ? formData.interests : [];
      userData.bio = formData.bio || '';
      userData.relationshipStatus = formData.relationshipStatus || '';
      userData.lookingFor = formData.lookingFor || '';
      userData.ageRange = Array.isArray(formData.ageRange) ? formData.ageRange : [18, 65];
      userData.maxDistance = formData.maxDistance || 50;
      userData.privacySettings = formData.privacySettings || {
        showProfile: true,
        showBirthDate: false,
        showLocation: true,
        allowMessages: true,
        showOnlineStatus: true,
      };
      userData.name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      if (formData.profileImage) {
        userData.profileImage = formData.profileImage;
      }

      if (Array.isArray(formData.datingPhotos) && formData.datingPhotos.length > 0) {
        userData.datingPhotos = formData.datingPhotos.map((photo: any) => {
          if (typeof photo === 'string') return photo;
          return photo?.url || photo;
        });
      } else {
        userData.datingPhotos = [];
      }

      // Bilder separat speichern (best effort)
      try {
        if (formData.profileImage) {
          localStorage.setItem('profileImage', formData.profileImage);
        }
        if (Array.isArray(formData.datingPhotos) && formData.datingPhotos.length > 0) {
          localStorage.setItem('datingPhotos', JSON.stringify(formData.datingPhotos));
        }
      } catch (imageError) {
        console.warn('Bilder konnten nicht separat gespeichert werden:', imageError);
      }

      // userData im localStorage speichern (ohne Abo-Logik!)
      try {
        const userDataString = JSON.stringify(userData);

        if (userDataString.length > 5000000) {
          throw new Error('Die Profildaten sind zu groß zum Speichern. Bitte reduziere die Anzahl der Fotos.');
        }

        localStorage.setItem('userData', userDataString);
        console.log('✅ User-Daten gespeichert');
      } catch (storageError: any) {
        console.error('Fehler beim Speichern in localStorage:', storageError);

        if (
          storageError.name === 'QuotaExceededError' ||
          (typeof storageError.message === 'string' && storageError.message.toLowerCase().includes('quota'))
        ) {
          delete userData.profileImage;
          delete userData.datingPhotos;
          userData.datingPhotos = [];

          localStorage.setItem('userData', JSON.stringify(userData));
          console.log('✅ User-Daten ohne Fotos gespeichert (Quota überschritten)');
        } else {
          throw storageError;
        }
      }

      // Supabase-Profil speichern (best effort)
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profileResponse = await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: userData.email || localStorage.getItem('userEmail'),
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              website: userData.website,
              location: userData.location,
              birthDate: userData.birthDate,
              birthTime: userData.birthTime,
              birthPlace: userData.birthPlace,
              bio: userData.bio,
              interests: userData.interests || [],
              relationshipStatus: userData.relationshipStatus || null,
              lookingFor: userData.lookingFor || null,
              ageRange: userData.ageRange || [18, 65],
              maxDistance: userData.maxDistance || 50,
              privacySettings: userData.privacySettings || null,
              hdType: userData.hdType,
              hdProfile: userData.hdProfile,
              hdAuthority: userData.hdAuthority,
              hdStrategy: userData.hdStrategy,
              hdIncarnationCross: userData.hdIncarnationCross,
            }),
          });

          if (!profileResponse.ok) {
            console.warn('⚠️ Profil konnte nicht in Supabase gespeichert werden, aber localStorage ist OK');
          }
        }
      } catch (supabaseError) {
        console.warn('⚠️ Fehler beim Speichern in Supabase (nicht kritisch):', supabaseError);
      }

      console.log('✅ Profil erfolgreich eingerichtet');

      // letzten Step aktiv setzen
      setActiveStep(steps.length - 1);
      router.push(`/profil-einrichten?step=${steps.length}`);

      // KEINE Paket-Logik, KEINE unterschiedlichen Dashboards mehr
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Fehler beim Speichern des Profils:', error);
      const errorMessage =
        error?.message || 'Fehler beim Speichern des Profils. Bitte versuche es erneut.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('profileImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Wenn Daten bereits vorhanden sind, zeige eine kurze Zusammenfassung statt erneut abzufragen
        if (hasPersonalData) {
          return (
            <Card sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(242, 159, 5, 0.15)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                  Registrierungsdaten übernommen
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {formData.firstName} {formData.lastName} &middot; {formData.email}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Diese Angaben wurden bereits während der Registrierung erfasst.
                </Typography>
              </CardContent>
            </Card>
          );
        }
        return (
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Diese Angaben sind die Basis für dein Profil. Dein Name wird anderen angezeigt, deine E-Mail natürlich nicht.
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vorname *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  sx={{ ...textFieldStyle, mb: { xs: 2, md: 3 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nachname *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  sx={{ ...textFieldStyle, mb: { xs: 2, md: 3 } }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-Mail *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled
                  sx={{ ...textFieldStyle, mb: 3 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio (optional)"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  sx={textFieldStyle}
                  placeholder="Erzähl in 1–2 Sätzen, wer du bist und was dir wichtig ist."
                />
              </Grid>
            </Grid>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2, display: 'block' }}>
              Du kannst die meisten Angaben später in deinem Profil wieder ändern.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ 
                color: 'white', 
                mb: 2,
                fontWeight: 'bold',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Dating-Fotos
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, textAlign: 'center' }}>
                Zeig dich so, wie du wirklich bist. Das erste Foto wird als Profilbild verwendet. Du kannst deine Fotos später jederzeit ändern.
              </Typography>
              
              <MultiImageUpload
                userId={typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user-demo' : 'user-demo'}
                existingImages={formData.datingPhotos}
                onImagesUpdate={(images) => {
                  setFormData(prev => ({ ...prev, datingPhotos: images }));
                }}
                maxImages={6}
                maxFileSize={5}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon (optional)"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                sx={{ ...textFieldStyle, mb: 3 }}
                InputProps={{
                  startAdornment: <Phone size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: -2, mb: 2 }}>
                Wird nur für verifizierte Kontakte angezeigt – niemals öffentlich.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website (optional)"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                sx={{ ...textFieldStyle, mb: 3 }}
                InputProps={{
                  startAdornment: <Globe size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: -2, mb: 2 }}>
                Für dein Business, Portfolio oder Social Media.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Standort"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="z. B. Berlin, Deutschland"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <MapPin size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1 }}>
                Dein Standort hilft uns, passende Matches in deiner Nähe zu finden.
              </Typography>
            </Grid>
          </Grid>
        );

      case 2:
        // Wenn Geburtsdaten vorhanden sind, zeige eine Zusammenfassung und frage nicht erneut ab
        if (hasBirthData) {
          return (
            <Card sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(242, 159, 5, 0.15)' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#F29F05', mb: 1, fontWeight: 700 }}>
                  Geburtsdaten übernommen
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  {formData.birthDate || 'unbekannt'} {formData.birthTime ? `· ${formData.birthTime}` : ''} {formData.birthPlace ? `· ${formData.birthPlace}` : ''}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Wir haben deine Geburtsdaten aus der Registrierung übernommen. Sie werden nur für deine energetische Auswertung verwendet.
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Wenn sich hier ein Fehler eingeschlichen hat, kannst du dich jederzeit an den Support wenden.
                </Typography>
              </CardContent>
            </Card>
          );
        }
        return (
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Wir nutzen deine Geburtsdaten ausschließlich, um deinen individuellen Connection Key und dein Human-Design-Chart zu berechnen.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Dein genauer Geburtstag wird anderen nicht angezeigt – nur, wenn du es in den Privatsphäre-Einstellungen erlaubst.
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Geburtsdatum *"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...textFieldStyle, mb: { xs: 2, md: 3 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Geburtszeit *"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => handleInputChange('birthTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...textFieldStyle, mb: { xs: 2, md: 3 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Geburtsort *"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  onKeyDown={(e) => {
                    // Verhindere automatisches Weiterleiten bei Enter
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="z. B. Berlin, Deutschland"
                  sx={{ ...textFieldStyle, mb: { xs: 2, md: 3 } }}
                  required
                  InputProps={{
                    startAdornment: <MapPin size={20} style={{ marginRight: 8, color: '#F29F05' }} />
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: { xs: 1.5, md: 2 }, display: 'block', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Diese Angaben können später nur über den Support geändert werden, damit deine Auswertungen authentisch bleiben.
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, color: 'white', fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              Wähle deine Interessen (optional)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.75, md: 1 }, mb: { xs: 3, md: 4 } }}>
              {interestOptions.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  clickable
                  color={formData.interests.includes(interest) ? 'primary' : 'default'}
                  onClick={() => handleInterestToggle(interest)}
                  sx={{
                    mb: { xs: 0.75, md: 1 },
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    height: { xs: 28, md: 32 },
                    backgroundColor: formData.interests.includes(interest) 
                      ? 'rgba(242, 159, 5, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: formData.interests.includes(interest) 
                      ? '#F29F05' 
                      : 'white',
                    border: formData.interests.includes(interest) 
                      ? '1px solid #F29F05' 
                      : '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: formData.interests.includes(interest) 
                        ? 'rgba(242, 159, 5, 0.3)' 
                        : 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                />
              ))}
            </Box>
            
            <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: 'rgba(255,255,255,0.1)' }} />
            
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ 
                    color: '#F29F05',
                    mb: 1,
                    '&.Mui-focused': { color: '#8C1D04' }
                  }}>Beziehungsstatus</FormLabel>
                  <RadioGroup
                    value={formData.relationshipStatus}
                    onChange={(e) => handleInputChange('relationshipStatus', e.target.value)}
                  >
                    <FormControlLabel 
                      value="single" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Single" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="in-relationship" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="In einer Beziehung" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="married" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Verheiratet" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="complicated" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Es ist kompliziert" 
                      sx={{ color: 'white' }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ 
                    color: '#F29F05',
                    mb: 1,
                    '&.Mui-focused': { color: '#8C1D04' }
                  }}>Suche nach</FormLabel>
                  <RadioGroup
                    value={formData.lookingFor}
                    onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  >
                    <FormControlLabel 
                      value="friendship" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Freundschaft" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="relationship" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Beziehung" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="networking" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Networking" 
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel 
                      value="mentoring" 
                      control={<Radio sx={{ 
                        color: '#F29F05',
                        '&.Mui-checked': { color: '#8C1D04' }
                      }} />} 
                      label="Mentoring" 
                      sx={{ color: 'white' }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'white', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Altersbereich für Matches
                </Typography>
                <Slider
                  value={formData.ageRange}
                  onChange={(_, newValue) => handleInputChange('ageRange', newValue)}
                  valueLabelDisplay="auto"
                  min={18}
                  max={80}
                  step={1}
                  sx={{
                    color: '#8C1D04',
                    mb: { xs: 1, md: 0 },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#F29F05',
                      width: { xs: 20, md: 24 },
                      height: { xs: 20, md: 24 },
                      '&:hover': {
                        backgroundColor: '#8C1D04'
                      }
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                      height: { xs: 4, md: 6 }
                    },
                    '& .MuiSlider-rail': {
                      height: { xs: 4, md: 6 }
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: { xs: 0.5, md: 1 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  {formData.ageRange[0]} - {formData.ageRange[1]} Jahre
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: 'white', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  Maximale Entfernung für Matches
                </Typography>
                <Slider
                  value={formData.maxDistance}
                  onChange={(_, newValue) => handleInputChange('maxDistance', newValue)}
                  valueLabelDisplay="auto"
                  min={1}
                  max={200}
                  step={5}
                  sx={{
                    color: '#8C1D04',
                    mb: { xs: 1, md: 0 },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#F29F05',
                      width: { xs: 20, md: 24 },
                      height: { xs: 20, md: 24 },
                      '&:hover': {
                        backgroundColor: '#8C1D04'
                      }
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                      height: { xs: 4, md: 6 }
                    },
                    '& .MuiSlider-rail': {
                      height: { xs: 4, md: 6 }
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: { xs: 0.5, md: 1 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                  {formData.maxDistance} km
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: { xs: 2, md: 3 }, color: 'white', fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              Privatsphäre-Einstellungen
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacySettings.showProfile}
                      onChange={(e) => handleInputChange('privacySettings', {
                        ...formData.privacySettings,
                        showProfile: e.target.checked
                      })}
                      sx={{ 
                        '& .MuiSwitch-switchBase': {
                          color: '#F29F05',
                          '&.Mui-checked': {
                            color: '#8C1D04',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#8C1D04'
                            }
                          }
                        }
                      }}
                    />
                  }
                  label="Profil öffentlich sichtbar"
                  sx={{ 
                    color: 'white',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacySettings.showBirthDate}
                      onChange={(e) => handleInputChange('privacySettings', {
                        ...formData.privacySettings,
                        showBirthDate: e.target.checked
                      })}
                      sx={{ 
                        '& .MuiSwitch-switchBase': {
                          color: '#F29F05',
                          '&.Mui-checked': {
                            color: '#8C1D04',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#8C1D04'
                            }
                          }
                        }
                      }}
                    />
                  }
                  label="Geburtsdatum anzeigen"
                  sx={{ 
                    color: 'white',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacySettings.showLocation}
                      onChange={(e) => handleInputChange('privacySettings', {
                        ...formData.privacySettings,
                        showLocation: e.target.checked
                      })}
                      sx={{ 
                        '& .MuiSwitch-switchBase': {
                          color: '#F29F05',
                          '&.Mui-checked': {
                            color: '#8C1D04',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#8C1D04'
                            }
                          }
                        }
                      }}
                    />
                  }
                  label="Standort anzeigen"
                  sx={{ 
                    color: 'white',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacySettings.allowMessages}
                      onChange={(e) => handleInputChange('privacySettings', {
                        ...formData.privacySettings,
                        allowMessages: e.target.checked
                      })}
                      sx={{ 
                        '& .MuiSwitch-switchBase': {
                          color: '#F29F05',
                          '&.Mui-checked': {
                            color: '#8C1D04',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#8C1D04'
                            }
                          }
                        }
                      }}
                    />
                  }
                  label="Nachrichten von anderen Benutzern erlauben"
                  sx={{ 
                    color: 'white',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.privacySettings.showOnlineStatus}
                      onChange={(e) => handleInputChange('privacySettings', {
                        ...formData.privacySettings,
                        showOnlineStatus: e.target.checked
                      })}
                      sx={{ 
                        '& .MuiSwitch-switchBase': {
                          color: '#F29F05',
                          '&.Mui-checked': {
                            color: '#8C1D04',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#8C1D04'
                            }
                          }
                        }
                      }}
                    />
                  }
                  label="Online-Status anzeigen"
                  sx={{ 
                    color: 'white',
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ textAlign: 'center', px: { xs: 1, md: 0 } }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
            <Typography variant="h5" sx={{ 
              color: '#10b981', 
              mb: { xs: 1.5, md: 2 },
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', md: '1.75rem' }
            }}>
              Perfekt!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '0.9375rem', md: '1rem' } }}>
              Dein Profil ist jetzt vollständig eingerichtet.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
              Du kannst jetzt alle Features der App nutzen – von Resonanzchecks bis zu deinen energetischen Verbindungen.
            </Typography>
            <Alert severity="success" sx={{ 
              mb: { xs: 2, md: 3 },
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: { xs: '0.875rem', md: '0.9375rem' }
            }}>
              Profil erfolgreich erstellt! Du wirst gleich zu deinem Dashboard weitergeleitet.
            </Alert>
            <Button
              onClick={() => {
                router.push('/dashboard');
              }}
              variant="contained"
              fullWidth={false}
              sx={{
                background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                color: 'white',
                fontWeight: 600,
                mt: { xs: 1.5, md: 2 },
                px: { xs: 3, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                minWidth: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                  boxShadow: { xs: 'none', md: '0 8px 25px rgba(242, 159, 5, 0.4)' },
                },
              }}
            >
              Jetzt zum Dashboard
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

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
      <PageLayout activePage="profil" showLogo={true} maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Profil einrichten
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              maxWidth: { xs: '100%', md: 600 },
              mx: 'auto',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
              px: { xs: 2, md: 0 },
              lineHeight: { xs: 1.5, md: 1.6 }
            }}
          >
            Lass uns dein Profil vervollständigen, damit du alle Features nutzen und präzise Resonanzanalysen erhalten kannst
          </Typography>
        </Box>

        {/* Stepper - Sticky */}
        <Box sx={{
          position: 'sticky',
          top: { xs: 60, md: 80 },
          zIndex: 100,
          mb: { xs: 2, md: 4 },
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 }
        }}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: { xs: 2, md: 3 },
          }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel={false}
                orientation="horizontal"
                sx={{
                  '& .MuiStep-root': {
                    padding: { xs: '8px', md: '12px' }
                  },
                  overflowX: { xs: 'auto', md: 'visible' },
                  '&::-webkit-scrollbar': {
                    height: '4px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.05)'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(242, 159, 5, 0.3)',
                    borderRadius: '2px'
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: 'white',
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                          whiteSpace: { xs: 'nowrap', md: 'normal' }
                        },
                        '& .MuiStepIcon-root': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          '&.Mui-active': {
                            color: '#F29F05'
                          },
                          '&.Mui-completed': {
                            color: '#10b981'
                          },
                          '& .MuiStepIcon-text': {
                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                          }
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: { xs: 'none', sm: 'block' },
                        '@media (max-width: 600px)': {
                          display: 'none'
                        }
                      }}>
                        {label}
                      </Box>
                      <Box sx={{ 
                        display: { xs: 'block', sm: 'none' },
                        '@media (min-width: 600px)': {
                          display: 'none'
                        },
                        fontSize: '0.7rem'
                      }}>
                        {label.split(' ')[0]}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Box>

        {/* Step Content */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(242, 159, 5, 0.15)',
          borderRadius: { xs: 2, md: 3 },
          mb: { xs: 2, md: 4 },
          mx: { xs: -2, md: 0 },
          px: { xs: 0, md: 0 }
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {renderStepContent(activeStep)}
            </CardContent>
          </Card>

        {/* Navigation Buttons - Sticky */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, md: 2 },
          justifyContent: 'space-between',
          position: 'sticky',
          bottom: { xs: 10, md: 20 },
          zIndex: 50,
          background: 'rgba(11, 10, 15, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: { xs: 2, md: 2 },
          p: { xs: 1.5, md: 2 },
          border: '1px solid rgba(242, 159, 5, 0.2)',
          mt: { xs: 2, md: 4 },
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 }
        }}>
          <Button
            type="button"
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
            fullWidth={false}
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              fontWeight: 600,
              minWidth: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 },
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            Zurück
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              variant="contained"
              fullWidth={false}
              sx={{
                background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                color: 'white',
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                  boxShadow: { xs: 'none', md: '0 8px 25px rgba(242, 159, 5, 0.4)' }
                }
              }}
            >
              {loading ? 'Speichere...' : 'Profil abschließen'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              variant="contained"
              fullWidth={false}
              sx={{
                background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                color: 'white',
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                  boxShadow: { xs: 'none', md: '0 8px 25px rgba(242, 159, 5, 0.4)' }
                }
              }}
            >
              Weiter
            </Button>
          )}
        </Box>
      </PageLayout>
    </Box>
  );
}

// Export mit ProtectedRoute
export default function ProfilEinrichtenPageWrapper() {
  return (
    <ProtectedRoute requiredRole="basic">
      <ProfilEinrichtenPage />
    </ProtectedRoute>
  );
}

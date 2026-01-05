"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Slider,
  Divider,
  Switch,
} from '@mui/material';
import {
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Globe,
  FileText,
  Image as ImageIcon,
  Heart,
  Lock,
  Eye,
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import UserDataService from '@/lib/services/userDataService';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import MultiImageUpload from '@/components/MultiImageUpload';

export default function EditProfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [datingPhotos, setDatingPhotos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    postalCode: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    bio: '',
    website: '',
    interests: [] as string[],
    relationshipStatus: '',
    lookingFor: '',
    ageRange: [18, 65] as [number, number],
    maxDistance: 50,
    privacySettings: {
      showProfile: true,
      showBirthDate: false,
      showLocation: true,
      allowMessages: true,
      showOnlineStatus: true,
    },
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    try {
      setLoading(true);
      const userData = UserDataService.getUserData();
      
      if (userData) {
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || user?.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          postalCode: userData.postalCode || '',
          birthDate: userData.birthDate || '',
          birthTime: userData.birthTime || '',
          birthPlace: userData.birthPlace || '',
          bio: userData.bio || userData.description || '',
          website: userData.website || '',
          interests: userData.interests || [],
          relationshipStatus: userData.relationshipStatus || '',
          lookingFor: userData.lookingFor || '',
          ageRange: Array.isArray(userData.ageRange) ? userData.ageRange as [number, number] : [18, 65],
          maxDistance: userData.maxDistance || 50,
          privacySettings: userData.privacySettings || {
            showProfile: true,
            showBirthDate: false,
            showLocation: true,
            allowMessages: true,
            showOnlineStatus: true,
          },
        });

        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
          setImagePreview(userData.profileImage);
        }

        if (Array.isArray(userData.datingPhotos) && userData.datingPhotos.length > 0) {
          setDatingPhotos(userData.datingPhotos);
        } else {
          // Versuche aus separatem Key zu laden
          try {
            const storedPhotos = localStorage.getItem('datingPhotos');
            if (storedPhotos) {
              setDatingPhotos(JSON.parse(storedPhotos));
            }
          } catch (e) {
            console.warn('Fehler beim Laden der Dating-Fotos:', e);
          }
        }
      } else {
        // Fallback auf Email-basierte Daten
        const email = UserDataService.getEmail() || user?.email;
        if (email) {
          setFormData(prev => ({
            ...prev,
            email: email,
          }));
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Profil-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      // Aktualisiere mit UserDataService
      UserDataService.updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        postalCode: formData.postalCode,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        bio: formData.bio,
      website: formData.website,
      interests: formData.interests,
      profileImage: profileImage || imagePreview || undefined,
      datingPhotos: datingPhotos.map((photo: any) => {
        if (typeof photo === 'string') return photo;
        return photo?.url || photo;
      }),
      relationshipStatus: formData.relationshipStatus,
      lookingFor: formData.lookingFor,
      ageRange: formData.ageRange,
      maxDistance: formData.maxDistance,
      privacySettings: formData.privacySettings,
    });

      setMessage('✅ Profil erfolgreich aktualisiert!');
      
      // Nach 1.5 Sekunden zur Profil-Seite zurückleiten
      setTimeout(() => {
        router.push('/profil');
      }, 1500);
    } catch (error) {
      console.error('Fehler beim Speichern des Profils:', error);
      setMessage('❌ Fehler beim Speichern des Profils');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <CircularProgress
          size={70}
          thickness={4}
          sx={{
            color: '#F29F05',
          }}
        />
      </Box>
    );
  }

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
      <PageLayout activePage="profil" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              href="/profil"
              startIcon={<ArrowLeft size={20} />}
              sx={{
                color: '#FFD700',
                borderColor: 'rgba(255, 215, 0, 0.3)',
                '&:hover': {
                  borderColor: '#FFD700',
                  background: 'rgba(255, 215, 0, 0.1)',
                },
              }}
            >
              Zurück zum Profil
            </Button>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Profil bearbeiten
            </Typography>
          </Box>

          {/* Message Alert */}
          {message && (
            <Alert
              severity={message.includes('✅') ? 'success' : 'error'}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          )}

          {/* Profilbild */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700 }}>
                Profilbild
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: { xs: 120, md: 150 },
                    height: { xs: 120, md: 150 },
                    borderRadius: '50%',
                    background: imagePreview || profileImage
                      ? `url(${imagePreview || profileImage}) center/cover`
                      : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 'bold',
                    color: 'white',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  {!imagePreview && !profileImage && (
                    <Box>
                      {formData.firstName?.[0]?.toUpperCase() || formData.lastName?.[0]?.toUpperCase() || 'U'}
                    </Box>
                  )}
                </Box>
                <label htmlFor="profile-image-upload">
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<ImageIcon size={18} />}
                    sx={{
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                      color: '#FFD700',
                      '&:hover': {
                        borderColor: '#FFD700',
                        background: 'rgba(255, 215, 0, 0.1)',
                      },
                    }}
                  >
                    Bild auswählen
                  </Button>
                </label>
              </Box>
            </CardContent>
          </Card>

          {/* Persönliche Informationen */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700 }}>
                Persönliche Informationen
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Vorname
                  </Typography>
                  <TextField
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Nachname
                  </Typography>
                  <TextField
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    E-Mail
                  </Typography>
                  <TextField
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Telefon
                  </Typography>
                  <TextField
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Standort
                  </Typography>
                  <TextField
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Postleitzahl
                  </Typography>
                  <TextField
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Geburtsdaten */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700 }}>
                Geburtsdaten
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Geburtsdatum
                  </Typography>
                  <TextField
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Geburtszeit
                  </Typography>
                  <TextField
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Geburtsort
                  </Typography>
                  <TextField
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Über mich */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700 }}>
                Über mich
              </Typography>

              <TextField
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Erzähle etwas über dich..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 215, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD700',
                    },
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Website & Interessen */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700 }}>
                Weitere Informationen
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Website
                  </Typography>
                  <TextField
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="https://..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FFD700',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, display: 'block' }}>
                    Interessen
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {formData.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        onDelete={() => handleRemoveInterest(interest)}
                        sx={{
                          backgroundColor: 'rgba(242, 159, 5, 0.2)',
                          color: '#FFD700',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          '& .MuiChip-deleteIcon': {
                            color: '#FFD700',
                          },
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      placeholder="Interesse hinzufügen..."
                      variant="outlined"
                      size="small"
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 215, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 215, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                          },
                        },
                      }}
                    />
                    <Button
                      onClick={handleAddInterest}
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(255, 215, 0, 0.5)',
                        color: '#FFD700',
                        '&:hover': {
                          borderColor: '#FFD700',
                          background: 'rgba(255, 215, 0, 0.1)',
                        },
                      }}
                    >
                      Hinzufügen
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dating-Fotos */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon size={20} color="#F29F05" />
                Dating-Fotos
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Zeig dich so, wie du wirklich bist. Das erste Foto wird als Profilbild verwendet. Du kannst bis zu 6 Fotos hochladen.
              </Typography>
              <MultiImageUpload
                userId={typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user-demo' : 'user-demo'}
                existingImages={datingPhotos}
                onImagesUpdate={(images) => {
                  setDatingPhotos(images);
                }}
                maxImages={6}
                maxFileSize={5}
              />
            </CardContent>
          </Card>

          {/* Dating-Präferenzen */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Heart size={20} color="#F29F05" />
                Dating & Friends-Präferenzen
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ color: '#C2B4D0', mb: 1 }}>
                      Beziehungsstatus
                    </FormLabel>
                    <RadioGroup
                      value={formData.relationshipStatus}
                      onChange={(e) => handleInputChange('relationshipStatus', e.target.value)}
                    >
                      <FormControlLabel
                        value="single"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Single"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="in-relationship"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="In einer Beziehung"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="married"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Verheiratet"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="complicated"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Es ist kompliziert"
                        sx={{ color: 'white' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ color: '#C2B4D0', mb: 1 }}>
                      Suche nach
                    </FormLabel>
                    <RadioGroup
                      value={formData.lookingFor}
                      onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                    >
                      <FormControlLabel
                        value="friendship"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Freundschaft"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="relationship"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Beziehung"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="networking"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Networking"
                        sx={{ color: 'white' }}
                      />
                      <FormControlLabel
                        value="mentoring"
                        control={<Radio sx={{ color: '#F29F05', '&.Mui-checked': { color: '#FFD700' } }} />}
                        label="Mentoring"
                        sx={{ color: 'white' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 215, 0, 0.2)' }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#C2B4D0', mb: 2 }}>
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
                      color: '#F29F05',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#FFD700',
                        '&:hover': {
                          backgroundColor: '#F29F05',
                        },
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #F29F05, #FFD700)',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                    {formData.ageRange[0]} - {formData.ageRange[1]} Jahre
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#C2B4D0', mb: 2 }}>
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
                      color: '#F29F05',
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#FFD700',
                        '&:hover': {
                          backgroundColor: '#F29F05',
                        },
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #F29F05, #FFD700)',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                    {formData.maxDistance} km
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Privatsphäre-Einstellungen */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock size={20} color="#F29F05" />
                Privatsphäre-Einstellungen
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.showProfile}
                        onChange={(e) => handleInputChange('privacySettings', {
                          ...formData.privacySettings,
                          showProfile: e.target.checked,
                        })}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#F29F05',
                            '&.Mui-checked': {
                              color: '#FFD700',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#FFD700',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Profil öffentlich sichtbar"
                    sx={{ color: 'white' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.showBirthDate}
                        onChange={(e) => handleInputChange('privacySettings', {
                          ...formData.privacySettings,
                          showBirthDate: e.target.checked,
                        })}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#F29F05',
                            '&.Mui-checked': {
                              color: '#FFD700',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#FFD700',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Geburtsdatum anzeigen"
                    sx={{ color: 'white' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.showLocation}
                        onChange={(e) => handleInputChange('privacySettings', {
                          ...formData.privacySettings,
                          showLocation: e.target.checked,
                        })}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#F29F05',
                            '&.Mui-checked': {
                              color: '#FFD700',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#FFD700',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Standort anzeigen"
                    sx={{ color: 'white' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.allowMessages}
                        onChange={(e) => handleInputChange('privacySettings', {
                          ...formData.privacySettings,
                          allowMessages: e.target.checked,
                        })}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#F29F05',
                            '&.Mui-checked': {
                              color: '#FFD700',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#FFD700',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Nachrichten von anderen Benutzern erlauben"
                    sx={{ color: 'white' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.showOnlineStatus}
                        onChange={(e) => handleInputChange('privacySettings', {
                          ...formData.privacySettings,
                          showOnlineStatus: e.target.checked,
                        })}
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            color: '#F29F05',
                            '&.Mui-checked': {
                              color: '#FFD700',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#FFD700',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Online-Status anzeigen"
                    sx={{ color: 'white' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 4 }}>
            <Button
              component={Link}
              href="/profil"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
              sx={{
                background: 'linear-gradient(135deg, #FFD700, #F29F05)',
                color: '#0b0a0f',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
                },
                '&:disabled': {
                  background: 'rgba(255, 215, 0, 0.3)',
                },
              }}
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </Box>
        </Box>
      </PageLayout>
    </Box>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; // Temporarily disabled
import coachingService, { Coach, Booking, TimeSlot } from '../lib/coaching/coachingService';

interface CoachingBookingProps {
  coach: Coach;
  userId: string;
  onBookingComplete?: (booking: Booking) => void;
  onClose?: () => void;
}

export default function CoachingBooking({ 
  coach, 
  userId, 
  onBookingComplete, 
  onClose 
}: CoachingBookingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const steps = [
    'Coach auswählen',
    'Termin wählen',
    'Daten eingeben',
    'Bestätigung'
  ];

  // Verfügbare Slots laden wenn Datum ausgewählt wird
  useEffect(() => {
    if (selectedDate && coach.id) {
      loadAvailableSlots();
    }
  }, [selectedDate, coach.id]);

  const loadAvailableSlots = async () => {
    try {
      setIsLoading(true);
      const slots = await coachingService.getAvailableSlots(coach.id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Slots:', error);
      setError('Fehler beim Laden der verfügbaren Zeiten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedSessionType) {
      setError('Bitte wählen Sie einen Session-Typ aus');
      return;
    }
    if (activeStep === 1 && (!selectedDate || !selectedTime)) {
      setError('Bitte wählen Sie Datum und Zeit aus');
      return;
    }
    if (activeStep === 2 && (!bookingData.name || !bookingData.email)) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleBookingSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const sessionDuration = coach.sessions.find(s => s.type === selectedSessionType)?.duration;
      const duration = sessionDuration ? parseInt(sessionDuration.replace(' Min', '')) : 60;

      const booking = await coachingService.createBooking({
        coachId: coach.id,
        userId,
        sessionType: selectedSessionType,
        date: selectedDate,
        time: selectedTime,
        duration,
        notes: bookingData.notes
      });

      setCreatedBooking(booking);
      setSuccess(true);
      onBookingComplete?.(booking);
    } catch (error) {
      console.error('Fehler beim Erstellen der Buchung:', error);
      setError('Fehler beim Erstellen der Buchung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionPrice = (sessionType: string): string => {
    const session = coach.sessions.find(s => s.type === sessionType);
    return session?.price || '0€';
  };

  const getSessionDuration = (sessionType: string): string => {
    const session = coach.sessions.find(s => s.type === sessionType);
    return session?.duration || '60 Min';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNextAvailableDates = (): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Coach-Details
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar src={coach.avatar} sx={{ width: 60, height: 60 }}>
                    {coach.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{coach.name}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {coach.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={coach.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2">
                        {coach.rating} ({coach.reviews} Bewertungen)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {coach.description}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {coach.specializations.map((spec, index) => (
                    <Chip key={index} label={spec} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Session-Typ wählen
            </Typography>
            <Grid container spacing={2}>
              {coach.sessions.map((session, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedSessionType === session.type ? 2 : 1,
                      borderColor: selectedSessionType === session.type ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => setSelectedSessionType(session.type)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {session.type}
                      </Typography>
                      <Typography variant="h5" color="primary" gutterBottom>
                        {session.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.duration}
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
            <Typography variant="h6" gutterBottom>
              Termin auswählen
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Datum wählen
                </Typography>
                <Grid container spacing={1}>
                  {getNextAvailableDates().slice(0, 7).map((date) => (
                    <Grid item xs={6} sm={4} key={date}>
                      <Button
                        variant={selectedDate === date ? 'contained' : 'outlined'}
                        fullWidth
                        onClick={() => setSelectedDate(date)}
                        sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                      >
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(date).toLocaleDateString('de-DE', { weekday: 'short' })}
                          </Typography>
                          <Typography variant="body2">
                            {new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Zeit wählen
                </Typography>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={1}>
                    {availableSlots.map((slot, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Button
                          variant={selectedTime === slot.time ? 'contained' : 'outlined'}
                          fullWidth
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>

            {selectedDate && selectedTime && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Gewählter Termin: {formatDate(selectedDate)} um {selectedTime} Uhr
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ihre Daten
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={bookingData.name}
                  onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-Mail *"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nachricht an den Coach (optional)"
                  multiline
                  rows={3}
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Teilen Sie dem Coach mit, was Sie besprechen möchten..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Buchung bestätigen
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Buchungsdetails
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <User />
                    </ListItemIcon>
                    <ListItemText
                      primary="Coach"
                      secondary={`${coach.name} - ${coach.title}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Calendar />
                    </ListItemIcon>
                    <ListItemText
                      primary="Datum"
                      secondary={formatDate(selectedDate)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Clock />
                    </ListItemIcon>
                    <ListItemText
                      primary="Zeit"
                      secondary={`${selectedTime} Uhr (${getSessionDuration(selectedSessionType)})`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MessageCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Session-Typ"
                      secondary={selectedSessionType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CreditCard />
                    </ListItemIcon>
                    <ListItemText
                      primary="Preis"
                      secondary={getSessionPrice(selectedSessionType)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              Nach der Buchung erhalten Sie eine Bestätigungs-E-Mail mit allen Details.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (success && createdBooking) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <CheckCircle size={64} style={{ color: '#4caf50', marginBottom: 16 }} />
            <Typography variant="h5" gutterBottom>
              Buchung erfolgreich!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Ihre Coaching-Session wurde gebucht. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              Buchungs-ID: {createdBooking.id}
            </Alert>
            <Button
              variant="contained"
              onClick={onClose}
              fullWidth
            >
              Schließen
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Coaching buchen
          </Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <ArrowLeft />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowLeft />}
        >
          Zurück
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isLoading ? 'Wird gebucht...' : 'Buchung bestätigen'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowRight />}
          >
            Weiter
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stepper, Step, StepLabel, Box, Typography } from "@mui/material";

const steps = [
  "Name & E-Mail",
  "Geburtsdaten",
  "Bio & Interessen",
  "Fertig"
];

interface ProfileOnboardingProps {
  open: boolean;
  onClose: () => void;
  onComplete: (form: {
    name: string;
    email: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    bio: string;
    interests: string;
  }) => void;
}

export default function ProfileOnboarding({ open, onClose, onComplete }: ProfileOnboardingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    bio: "",
    interests: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onComplete(form);
      onClose();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(90deg,#7c4dff 60%,#b39ddb 100%)', color: '#fff', fontWeight: 900 }}>
        Profil einrichten
      </DialogTitle>
      <DialogContent sx={{ background: 'rgba(44,24,77,0.85)', color: '#fff' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ color: '#b39ddb' }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && (
          <Box>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
            <TextField label="E-Mail" name="email" value={form.email} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <TextField label="Geburtsdatum" name="birthDate" value={form.birthDate} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
            <TextField label="Geburtszeit" name="birthTime" value={form.birthTime} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
            <TextField label="Geburtsort" name="birthLocation" value={form.birthLocation} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <TextField label="Bio" name="bio" value={form.bio} onChange={handleChange} fullWidth multiline minRows={2} sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
            <TextField label="Interessen" name="interests" value={form.interests} onChange={handleChange} fullWidth sx={{ mb: 2, background: 'rgba(179,157,219,0.08)', input: { color: '#fff' }, label: { color: '#b39ddb' } }} />
          </Box>
        )}
        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ color: '#b39ddb', mb: 2 }}>Fertig!</Typography>
            <Typography>Dein Profil ist jetzt eingerichtet.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ background: 'rgba(44,24,77,0.85)' }}>
        <Button onClick={handleBack} disabled={activeStep === 0} sx={{ color: '#b39ddb' }}>Zurück</Button>
        <Button onClick={handleNext} sx={{ background: 'linear-gradient(90deg,#7c4dff 60%,#b39ddb 100%)', color: '#fff', fontWeight: 700, borderRadius: 2 }}>
          {activeStep === steps.length - 1 ? 'Fertig' : 'Weiter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

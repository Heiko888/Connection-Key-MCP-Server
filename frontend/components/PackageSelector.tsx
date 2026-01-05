"use client";

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Check, Star, Diamond, Crown, ArrowRight } from 'lucide-react';
import { SubscriptionPackage } from '../lib/subscription/types';
import { subscriptionPackages } from '../lib/subscription/packages';

interface PackageSelectorProps {
  currentPackage?: string;
  onPackageSelect: (packageId: string, billingCycle: 'monthly' | 'yearly') => void;
  onClose?: () => void;
  showDialog?: boolean;
}

export default function PackageSelector({
  currentPackage = 'basic',
  onPackageSelect,
  onClose,
  showDialog = false
}: PackageSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>(currentPackage);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPackage = async (packageId: string) => {
    setIsProcessing(true);
    try {
      await onPackageSelect(packageId, billingCycle);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'basic': return <Star size={24} />;
      case 'premium': return <Diamond size={24} />;
      case 'vip': return <Crown size={24} />;
      default: return <Star size={24} />;
    }
  };

  const getPackageColor = (packageId: string) => {
    const pkg = subscriptionPackages.find(p => p.id === packageId);
    return pkg?.color || '#6b7280';
  };

  const getPrice = (pkg: SubscriptionPackage) => {
    const price = billingCycle === 'yearly' ? pkg.priceYearly : pkg.priceMonthly;
    const cycle = billingCycle === 'yearly' ? '/Jahr' : '/Monat';
    return `${price.toFixed(2)}€${cycle}`;
  };

  const getSavings = (pkg: SubscriptionPackage) => {
    if (pkg.id === 'basic' || billingCycle === 'monthly') return null;
    const monthlyTotal = pkg.priceMonthly * 12;
    const savings = monthlyTotal - pkg.priceYearly;
    return `Sie sparen ${savings.toFixed(2)}€ pro Jahr`;
  };

  const PackageCard = ({ pkg }: { pkg: SubscriptionPackage }) => {
    const isSelected = selectedPackage === pkg.id;
    const isCurrent = currentPackage === pkg.id;
    const savings = getSavings(pkg);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          sx={{
            height: '100%',
            background: isSelected 
              ? `linear-gradient(135deg, ${pkg.color}20 0%, ${pkg.color}10 100%)`
              : 'rgba(255, 255, 255, 0.05)',
            border: isSelected ? `2px solid ${pkg.color}` : '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => setSelectedPackage(pkg.id)}
        >
          {isCurrent && (
            <Chip
              label="Aktuell"
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1
              }}
            />
          )}
          
          {savings && (
            <Chip
              label="Sparen"
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1
              }}
            />
          )}

          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                color: pkg.color, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `${pkg.color}20`
              }}>
                {getPackageIcon(pkg.id)}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {pkg.description}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" sx={{ 
                color: pkg.color, 
                fontWeight: 'bold',
                mb: 1
              }}>
                {getPrice(pkg)}
              </Typography>
              {savings && (
                <Typography variant="body2" sx={{ color: '#10b981' }}>
                  {savings}
                </Typography>
              )}
            </Box>

            <Box sx={{ flexGrow: 1, mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Enthaltene Features:
              </Typography>
              {pkg.features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Check size={16} color="#10b981" style={{ marginRight: 8 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>

            {pkg.limitations.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
                  Einschränkungen:
                </Typography>
                {pkg.limitations.map((limitation, index) => (
                  <Typography key={index} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    • {limitation}
                  </Typography>
                ))}
              </Box>
            )}

            <Button
              variant={isSelected ? "contained" : "outlined"}
              fullWidth
              size="large"
              disabled={isCurrent || isProcessing}
              onClick={() => handleSelectPackage(pkg.id)}
              sx={{
                background: isSelected ? pkg.color : 'transparent',
                borderColor: pkg.color,
                color: 'white',
                '&:hover': {
                  background: pkg.color,
                  borderColor: pkg.color
                }
              }}
            >
              {isCurrent ? 'Aktuelles Paket' : 'Auswählen'}
              {!isCurrent && <ArrowRight size={20} style={{ marginLeft: 8 }} />}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const content = (
    <Box>
      <Typography variant="h4" sx={{ 
        color: 'white', 
        textAlign: 'center', 
        mb: 2,
        fontWeight: 'bold'
      }}>
        Wählen Sie Ihr Paket
      </Typography>
      
      <Typography variant="body1" sx={{ 
        color: 'rgba(255,255,255,0.7)', 
        textAlign: 'center', 
        mb: 4 
      }}>
        Entdecken Sie die perfekte Lösung für Ihre Human Design Reise
      </Typography>

      {/* Billing Cycle Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
          >
            <FormControlLabel
              value="monthly"
              control={<Radio sx={{ color: 'white' }} />}
              label={<Typography sx={{ color: 'white' }}>Monatlich</Typography>}
            />
            <FormControlLabel
              value="yearly"
              control={<Radio sx={{ color: 'white' }} />}
              label={
                <Box>
                  <Typography sx={{ color: 'white' }}>Jährlich</Typography>
                  <Chip label="20% sparen" size="small" color="success" />
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Package Cards */}
      <Grid container spacing={3}>
        {subscriptionPackages.map((pkg) => (
          <Grid item xs={12} md={4} key={pkg.id}>
            <PackageCard pkg={pkg} />
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mt: 3, background: 'rgba(59, 130, 246, 0.1)' }}>
        <Typography variant="body2">
          <strong>Geld-zurück-Garantie:</strong> Sie können Ihr Abonnement jederzeit innerhalb der ersten 30 Tage kündigen und erhalten eine vollständige Rückerstattung.
        </Typography>
      </Alert>
    </Box>
  );

  if (showDialog) {
    return (
      <Dialog
        open={showDialog}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Paket auswählen
          </Typography>
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: 'white' }}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return content;
}

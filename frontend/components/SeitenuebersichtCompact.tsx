"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Star,
  Diamond,
  Crown,
  Globe,
  Eye,
  ExternalLink,
  List
} from 'lucide-react';
import Link from 'next/link';

// Kompakte Seiten-Auswahl
const compactPages = [
  { id: 'chart', title: 'Chart', path: '/chart', package: 'basic', icon: '🧬' },
  { id: 'mondkalender', title: 'Mondkalender', path: '/mondkalender', package: 'basic', icon: '🌙' },
  { id: 'planets', title: 'Planeten', path: '/planets', package: 'basic', icon: '🪐' },
  { id: 'dating', title: 'Dating', path: '/dating', package: 'premium', icon: '💕' },
  { id: 'community', title: 'Community', path: '/community', package: 'basic', icon: '👥' },
  { id: 'coaching', title: 'Coaching', path: '/coaching', package: 'vip', icon: '🎯' },
  { id: 'reading', title: 'Readings', path: '/reading', package: 'premium', icon: '📖' },
  { id: 'analytics', title: 'Analytics', path: '/analytics', package: 'premium', icon: '📈' }
];

// Paket-Informationen
const packageInfo = {
  free: { name: 'Kostenlos', color: '#4CAF50', icon: <Globe size={12} /> },
  basic: { name: 'Basic', color: '#2196F3', icon: <Star size={12} /> },
  premium: { name: 'Premium', color: '#9C27B0', icon: <Diamond size={12} /> },
  vip: { name: 'VIP', color: '#FF9800', icon: <Crown size={12} /> }
};

interface SeitenuebersichtCompactProps {
  maxItems?: number;
  showTitle?: boolean;
}

export default function SeitenuebersichtCompact({ 
  maxItems = 6, 
  showTitle = true 
}: SeitenuebersichtCompactProps) {
  const getPackageColor = (packageId: string) => {
    return packageInfo[packageId as keyof typeof packageInfo]?.color || '#4CAF50';
  };

  return (
    <Card sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      height: '100%'
    }}>
      <CardContent sx={{ p: 3 }}>
        {showTitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <List size={20} color="#4ecdc4" style={{ marginRight: 8 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Seitenübersicht
            </Typography>
          </Box>
        )}

        <Grid container spacing={1}>
          {compactPages.slice(0, maxItems).map((page, index) => (
            <Grid item xs={6} sm={4} key={page.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  p: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    borderColor: getPackageColor(page.package)
                  }
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {page.icon}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {page.title}
                    </Typography>
                    <Chip
                      label={packageInfo[page.package as keyof typeof packageInfo]?.name}
                      size="small"
                      sx={{
                        background: getPackageColor(page.package),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        height: '18px',
                        mb: 1
                      }}
                    />
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Seite ansehen">
                        <IconButton
                          size="small"
                          component={Link}
                          href={page.path}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <Eye size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="In neuem Tab öffnen">
                        <IconButton
                          size="small"
                          onClick={() => window.open(page.path, '_blank')}
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <ExternalLink size={14} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            size="small"
            component={Link}
            href="/seitenliste"
            sx={{ 
              color: '#4ecdc4',
              fontSize: '0.8rem'
            }}
          >
            Alle Seiten anzeigen →
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

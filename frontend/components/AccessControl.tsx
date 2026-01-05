"use client";

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';

interface AccessControlProps {
  path: string;
  userSubscription?: any | null;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export default function AccessControl({
  path,
  userSubscription,
  children,
  onUpgrade
}: AccessControlProps) {
  // Vereinfachte Access Control - alle Seiten sind zugänglich
  const access = { canAccess: true, requiredPackage: 'free' };

  if (access.canAccess) {
    return <>{children}</>;
  }

  // Fallback für den Fall, dass Access Control doch mal benötigt wird
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
        <Card sx={{
          maxWidth: 600,
        width: '100%',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            🔒 Zugriff verweigert
            </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Du hast keinen Zugriff auf diese Seite.
              </Typography>
          </CardContent>
        </Card>
    </Box>
  );
}
